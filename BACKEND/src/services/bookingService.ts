import { SortOrder, Types } from "mongoose";
import { Booking, IBooking, ICaller, IRecipient } from "../models/bookingModel";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";
import { isLegacyBooking } from "../utils/bookingShape";
import { callStatus, adminRole } from "../types/genralTypes";
import { deriveBookingStatus } from "../utils/bookingStatus";
import customerService from "./customerService";
import couponService from "./couponService";
import paymentService from "./paymentService";
import auditLogService from "./auditLogService";
import serviceService from "./serviceService";
import recordingService from "./recordingService";
import { HttpError } from "../utils/httpError";
import { bookingLogger } from "../utils/logger";

class BookingService {
  // Looks for a booking from the same caller within the last 60 minutes that
  // has a recipient matching (name + phone + callType) one of the newly
  // submitted recipients. Used to catch an abandoned/failed-payment
  // resubmission instead of creating a duplicate record.
  async findReusableMatch(caller: ICaller, recipients: IRecipient[]) {
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);

    const candidates = await Booking.find({
      createdAt: { $gte: sixtyMinutesAgo },
      // A superseded booking (status "abandoned") must never be recycled —
      // it already belongs to a newer checkout attempt.
      bookingStatus: { $ne: "abandoned" },
      $or: [
        { "caller.phone": caller.phone, "caller.email": caller.email },
        { callerPhone: caller.phone, callerEmail: caller.email },
      ],
    }).sort({ createdAt: -1 });

    for (const candidate of candidates) {
      const candidateRecipients = isLegacyBooking(candidate)
        ? [
            {
              recipientName: candidate.recipientName,
              recipientPhone: candidate.recipientPhone,
              callType: candidate.callType,
            },
          ]
        : candidate.recipients || [];

      const hasMatch = candidateRecipients.some((cr) =>
        recipients.some(
          (r) =>
            cr.recipientName === r.recipientName &&
            cr.recipientPhone === r.recipientPhone &&
            cr.callType === r.callType
        )
      );

      if (hasMatch) {
        bookingLogger.info("Reusable unpaid/recent booking match found", {
          matchedBookingId: candidate.bookingId,
          callerEmail: caller.email,
          action: "FIND_REUSABLE_MATCH_FOUND",
        });
        return candidate;
      }
    }

    return null;
  }

  async createBooking(
    bookingId: string,
    caller: ICaller,
    recipients: IRecipient[],
    contactConsent: string,
    couponCode?: string
  ) {
    // Never trust a client-submitted price — recompute each recipient's
    // price server-side from the active Service catalog before it's summed
    // into the total. A recipient whose occasion/callType no longer matches
    // an active service (renamed, deactivated, or a stale client payload)
    // fails the whole booking rather than silently charging 0 or whatever
    // the client sent.
    for (const recipient of recipients) {
      const price = await serviceService.getPriceForOccasion(
        recipient.occassion,
        recipient.callType,
        recipient.country
      );
      if (price === null) {
        bookingLogger.warn("Booking creation blocked: no active service pricing", {
          occassion: recipient.occassion,
          callType: recipient.callType,
          country: recipient.country,
          action: "CREATE_BOOKING_INVALID_SERVICE",
        });
        throw new HttpError(
          400,
          `No active pricing found for "${recipient.occassion}" (${recipient.callType})`
        );
      }
      recipient.price = price;
    }

    const rawTotal = recipients.reduce((sum, r) => sum + r.price, 0);

    let totalPrice = rawTotal;
    let discountAmount = 0;
    let appliedCouponCode: string | undefined;

    if (couponCode) {
      const validation = await couponService.validateCoupon(couponCode);
      if (!validation.valid || !validation.coupon) {
        bookingLogger.warn("Booking creation blocked: invalid coupon", {
          couponCode,
          reason: validation.reason,
          action: "CREATE_BOOKING_INVALID_COUPON",
        });
        throw new HttpError(400, validation.reason || "Invalid coupon code");
      }
      discountAmount = couponService.computeDiscount(
        validation.coupon,
        rawTotal
      );
      totalPrice = rawTotal - discountAmount;
      appliedCouponCode = validation.coupon.code;
    }

    const match = await this.findReusableMatch(caller, recipients);

    let supersededBooking: IBooking | null = null;

    if (match && match.paymentStatus !== "paid") {
      if (match.paymentReference) {
        let paystackStatus: string | undefined;
        try {
          const verification = await paymentService.verifyTransaction(
            match.paymentReference
          );
          paystackStatus = verification?.data?.status;
        } catch (error: any) {
          bookingLogger.warn(
            "Verify before re-use failed — superseding to stay safe",
            {
              bookingId: match.bookingId,
              reference: match.paymentReference,
              error: error.message,
              action: "CREATE_BOOKING_REUSE_VERIFY_ERROR",
            }
          );
          paystackStatus = undefined;
        }

        if (paystackStatus === "success") {
          // The "first attempt" actually completed — credit this booking and
          // hand it back instead of opening a second payment.
          const paidBooking = await paymentService.markBookingPaid(
            match,
            match.paymentReference
          );
          bookingLogger.info(
            "Checkout candidate already paid — credited, no new payment",
            {
              bookingId: paidBooking.bookingId,
              reference: match.paymentReference,
              action: "CREATE_BOOKING_REUSE_ALREADY_PAID",
            }
          );
          return paidBooking;
        }

        if (paystackStatus !== "failed") {
          supersededBooking = match;
        }
      }

      if (!supersededBooking) {
        // provably dead (or never initialized): re-use the existing
        // bookingId/_id, replace its contents, and force the next payment
        // initialize to mint a fresh Paystack reference (references are
        // single-use).
        match.caller = caller;
        match.recipients = recipients;
        match.totalPrice = totalPrice;
        match.couponCode = appliedCouponCode;
        match.discountAmount = discountAmount || undefined;
        match.bookingStatus = "pending";
        match.contactConsent = contactConsent;
        match.reuseCount = (match.reuseCount || 0) + 1;
        match.paymentURL = "";
        match.paymentStatus = "pending";
        // A reuse fully replaces the booking's content with a new checkout
        // attempt — Mongoose's `timestamps` option marks createdAt immutable
        // by default, so a plain assignment is silently dropped; `set()` with
        // overwriteImmutable is required to actually move it off the original
        // (possibly stale, e.g. from a prior day) attempt.
        match.set("createdAt", new Date(), undefined, { overwriteImmutable: true });
        const saved = await match.save();
        if (appliedCouponCode) await couponService.incrementUsage(appliedCouponCode);

        bookingLogger.info("Booking re-used for unpaid near-duplicate", {
          bookingId: saved.bookingId,
          reuseCount: saved.reuseCount,
          action: "CREATE_BOOKING_REUSED",
        });

        return saved;
      }
    }

    // paid near-duplicate (don't touch the paid booking), supersede (the old
    // booking is claimed below), or no candidate — create a new booking and
    // flag it for rep/admin visibility when it duplicates a paid one.
    const duplicateOfPaid = match ? match.paymentStatus === "paid" : false;

    // Claim the supersede marker BEFORE creating the replacement. Two writes
    // can't be atomic here; claim-then-create narrows a crash to "old booking
    // abandoned pointing at a not-yet-created id" — recoverable, the customer
    // re-submits and gets a fresh booking via the reuse path. The inverse
    // order would leave BOTH bookings live on a crash.
    const supersedeClaim = supersededBooking
      ? await Booking.findOneAndUpdate(
          { _id: supersededBooking._id, bookingStatus: { $ne: "abandoned" } },
          {
            $set: {
              bookingStatus: "abandoned",
              supersededBy: bookingId,
              supersededAt: new Date(),
            },
          },
          { new: true }
        )
      : null;

    if (supersededBooking && supersedeClaim) {
      bookingLogger.info("Booking superseded by a fresh checkout", {
        bookingId: supersedeClaim.bookingId,
        supersededBy: bookingId,
        action: "CREATE_BOOKING_SUPERSEDED",
      });
    } else if (supersededBooking) {
      bookingLogger.warn(
        "Checkout candidate already superseded by a concurrent checkout — keeping existing linkback",
        {
          bookingId: supersededBooking.bookingId,
          supersededBy: supersededBooking.supersededBy,
          newBookingId: bookingId,
          action: "CREATE_BOOKING_SUPERSEDE_RACE",
        }
      );
    }

    let newBooking: IBooking;
    try {
      newBooking = await Booking.create({
        bookingId,
        caller,
        recipients,
        totalPrice,
        couponCode: appliedCouponCode,
        discountAmount: discountAmount || undefined,
        bookingStatus: "pending",
        reuseCount: 0,
        duplicateOfPaid,
        contactConsent,
        confirmationMailsent: false,
        allRecipientsSuccessfulMailSent: false,
        paymentStatus: "pending",
      });
    } catch (createError: any) {
      // Roll back our own claim so the old booking isn't left pointing at a
      // booking that never came into existence — and only if we actually won
      // (supersededBy still points at our id). Never undo a concurrent
      // writer's claim, and never regress a booking that got paid meanwhile.
      if (supersedeClaim) {
        await Booking.findOneAndUpdate(
          {
            _id: supersedeClaim._id,
            supersededBy: bookingId,
            paymentStatus: { $ne: "paid" },
          },
          {
            $set: { bookingStatus: "pending" },
            $unset: { supersededBy: "", supersededAt: "" },
          }
        );
      }
      throw createError;
    }

    // assign booking to a rep if Booking was created successfully
    if (newBooking) {
      if (appliedCouponCode) await couponService.incrementUsage(appliedCouponCode);

      bookingLogger.info("Booking created", {
        bookingId: newBooking.bookingId,
        recipientCount: recipients.length,
        totalPrice,
        duplicateOfPaid: newBooking.duplicateOfPaid,
        action: "CREATE_BOOKING_SUCCESS",
      });

      // get the rep with the lest amount of bookings
      const assignedRep = await getLeastLoadedRep();

      // return the booking without an assigned rep if there's no rep found.
      if (!assignedRep) {
        bookingLogger.warn("Booking created with no rep available to assign", {
          bookingId: newBooking.bookingId,
          action: "CREATE_BOOKING_NO_REP_AVAILABLE",
        });
        return newBooking;
      }

      // assign the rep to the booking and change the booking status to assigned
      newBooking.assignedRep = new Types.ObjectId(assignedRep.toString());
      return await newBooking.save();
    }
    // return null if booking couldn't be created
    bookingLogger.error("Booking creation returned no document", {
      bookingId,
      action: "CREATE_BOOKING_FAILED",
    });
    return null;
  }

  // Single orchestration entry point for the customer booking flow: generate
  // an ID, create (or re-use) the booking, then initialize the Paystack
  // transaction — replaces what used to be 3 separate client round-trips.
  // If payment initialization throws after the booking is already saved, the
  // booking is not lost: it exists unpaid, and a retried checkout within 60
  // minutes will hit the re-use path above and mint a fresh payment attempt
  // on the same booking rather than creating a duplicate.
  async checkoutBooking(
    caller: ICaller,
    recipients: IRecipient[],
    contactConsent: string,
    couponCode?: string
  ) {
    const bookingId = await this.generateBookingId();

    const booking = await this.createBooking(
      bookingId,
      caller,
      recipients,
      contactConsent,
      couponCode
    );

    if (!booking) {
      throw new HttpError(500, "Failed to create booking");
    }

    // createBooking can resolve to a booking that is already paid (a previous
    // attempt verified as success). No new Paystack transaction — surface it
    // so the frontend shows the confirmed state instead of a pay page.
    if (booking.paymentStatus === "paid") {
      bookingLogger.info("Checkout resolved to an already-paid booking", {
        bookingId: booking.bookingId,
        action: "CHECKOUT_BOOKING_ALREADY_PAID",
      });
      return {
        bookingId: booking.bookingId,
        paymentURL: "",
        alreadyPaid: true,
      };
    }

    const paymentData = await paymentService.initializePaymentForBooking(
      booking,
      booking.caller?.email || caller.email
    );

    bookingLogger.info("Checkout completed: booking created and payment initialized", {
      bookingId: booking.bookingId,
      action: "CHECKOUT_BOOKING_SUCCESS",
    });

    return {
      bookingId: booking.bookingId,
      paymentURL: paymentData.authorization_url,
      alreadyPaid: false,
    };
  }

  // Customer self-service update. v2 bookings merge caller fields directly
  // and match recipients by _id, only assigning the customer-editable subset
  // (never callStatus/price/callRecordingURL — those are rep/system-owned).
  // Legacy (pre-migration) documents fall back to the old flat dynamic-field
  // update as a defensive safety net; in practice migrate-bookings-v2.ts
  // has already backfilled recipients[] onto every existing booking.
  async updateBookingByCustomer(
    booking: IBooking,
    updates: {
      caller?: Partial<ICaller>;
      recipients?: (Partial<IRecipient> & { _id: string })[];
    }
  ) {
    const disallowedStatus = ["successful"];
    const isBookingLocked = isLegacyBooking(booking)
      ? disallowedStatus.includes(booking.status as string)
      : booking.bookingStatus === "completed" || booking.bookingStatus === "abandoned";

    if (isBookingLocked) {
      bookingLogger.warn("Update booking by customer blocked: booking locked", {
        bookingId: booking.bookingId,
        action: "UPDATE_BOOKING_BY_CUSTOMER_LOCKED",
      });
      throw new HttpError(400, "Can't update this booking");
    }

    if (updates.caller) {
      booking.caller = { ...(booking.caller ?? {}), ...updates.caller } as ICaller;
    }

    if (updates.recipients) {
      for (const update of updates.recipients) {
        const target = booking.recipients?.find(
          (r) => r._id?.toString() === update._id
        );
        if (!target) {
          bookingLogger.warn(
            "Update booking by customer: recipient not found",
            {
              bookingId: booking.bookingId,
              recipientId: update._id,
              action: "UPDATE_BOOKING_BY_CUSTOMER_RECIPIENT_NOT_FOUND",
            }
          );
          continue;
        }
        const { _id, ...allowedFields } = update;
        Object.assign(target, allowedFields);
      }
    }

    const saved = await booking.save();

    bookingLogger.info("Booking updated by customer", {
      bookingId: booking.bookingId,
      action: "UPDATE_BOOKING_BY_CUSTOMER_SUCCESS",
    });

    return saved;
  }

  // Admin correction path — broader field set than updateBookingByCustomer
  // (occassion/callType/price/country included), no booking-lock check.
  // Staff fixing a genuine data-entry mistake is a different trust boundary
  // than a customer editing their own booking post-payment.
  async updateBookingByAdmin(
    booking: IBooking,
    updates: {
      caller?: Partial<ICaller>;
      recipients?: (Partial<IRecipient> & { _id: string })[];
    },
    changedBy: string
  ) {
    const previousEmail = (booking.caller?.email ?? booking.callerEmail ?? "").toLowerCase();
    const previousCallerName = booking.caller?.name ?? booking.callerName;
    const previousCallerPhone = booking.caller?.phone ?? booking.callerPhone;

    const previousRecipients = isLegacyBooking(booking)
      ? [
          {
            id: booking.bookingId,
            occassion: booking.occassion,
            callType: booking.callType,
            price: booking.price,
            country: booking.country,
            relationship: booking.relationship,
          },
        ]
      : (booking.recipients ?? []).map((r) => ({
          id: r._id!.toString(),
          occassion: r.occassion,
          callType: r.callType,
          price: r.price,
          country: r.country,
          relationship: r.relationship,
        }));

    if (updates.caller) {
      booking.caller = { ...(booking.caller ?? {}), ...updates.caller } as ICaller;
    }

    if (isLegacyBooking(booking)) {
      const flatUpdate = updates.recipients?.[0];
      if (updates.caller) {
        booking.callerName = updates.caller.name ?? booking.callerName;
        booking.callerPhone = updates.caller.phone ?? booking.callerPhone;
        booking.callerEmail = updates.caller.email ?? booking.callerEmail;
      }
      if (flatUpdate) {
        // relationship flows through here via `fields.relationship` — same
        // generic assignment already handling occassion/callType/etc, no
        // special-casing needed now that it's recipient-side.
        const { _id, ...fields } = flatUpdate;
        Object.assign(booking, fields);
        if (fields.price !== undefined) {
          booking.price = String(fields.price);
          booking.totalPrice = fields.price;
        }
      }
      } else if (updates.recipients) {
      for (const update of updates.recipients) {
        const target = booking.recipients?.find(
          (r) => r._id?.toString() === update._id
        );
        if (!target) {
          bookingLogger.warn("Update booking by admin: recipient not found", {
            bookingId: booking.bookingId,
            recipientId: update._id,
            action: "UPDATE_BOOKING_BY_ADMIN_RECIPIENT_NOT_FOUND",
          });
          continue;
        }
        const { _id, ...allowedFields } = update;
        Object.assign(target, allowedFields);
      }

      // keep totalPrice consistent whenever a recipient's price/count changes
      const rawTotal = (booking.recipients ?? []).reduce(
        (sum, r) => sum + (r.price ?? 0),
        0
      );
      booking.totalPrice = rawTotal - (booking.discountAmount ?? 0);
    }

    const saved = await booking.save();

    const newEmail = (saved.caller?.email ?? saved.callerEmail ?? "").toLowerCase();
    if (updates.caller?.email !== undefined && newEmail !== previousEmail) {
      await auditLogService.record({
        entity: "booking",
        entityId: booking.bookingId,
        field: "callerEmail",
        oldValue: previousEmail,
        newValue: newEmail,
        changedBy,
      });
    }

    await auditLogService.recordDiffs("booking", booking.bookingId, changedBy, [
      { field: "callerName", oldValue: previousCallerName, newValue: saved.caller?.name ?? saved.callerName },
      { field: "callerPhone", oldValue: previousCallerPhone, newValue: saved.caller?.phone ?? saved.callerPhone },
    ]);

    const newRecipients = isLegacyBooking(saved)
      ? [
          {
            id: saved.bookingId,
            occassion: saved.occassion,
            callType: saved.callType,
            price: saved.price,
            country: saved.country,
            relationship: saved.relationship,
          },
        ]
      : (saved.recipients ?? []).map((r) => ({
          id: r._id!.toString(),
          occassion: r.occassion,
          callType: r.callType,
          price: r.price,
          country: r.country,
          relationship: r.relationship,
        }));

    for (const newR of newRecipients) {
      const oldR = previousRecipients.find((r) => r.id === newR.id);
      if (!oldR) continue;

      const prefix = isLegacyBooking(saved) ? "" : `recipient.${newR.id}.`;
      await auditLogService.recordDiffs("booking", booking.bookingId, changedBy, [
        { field: `${prefix}occassion`, oldValue: oldR.occassion, newValue: newR.occassion },
        { field: `${prefix}callType`, oldValue: oldR.callType, newValue: newR.callType },
        { field: `${prefix}price`, oldValue: oldR.price, newValue: newR.price },
        { field: `${prefix}country`, oldValue: oldR.country, newValue: newR.country },
        { field: `${prefix}relationship`, oldValue: oldR.relationship, newValue: newR.relationship },
      ]);
    }

    bookingLogger.info("Booking updated by admin", {
      bookingId: booking.bookingId,
      action: "UPDATE_BOOKING_BY_ADMIN_SUCCESS",
    });

    return saved;
  }

  // fetch bookng by generated ID
  async getBookingByBookingId(bookingId: string) {
    // fetch the booking from DB and return
    return await Booking.findOne({ bookingId }).select("-__v -updatedAt");
  }

  // Paystack references diverge from bookingId once a booking is re-used
  // (Task 10). Try the reference field first, then fall back to treating
  // the reference as a bookingId — covers legacy/first-payment bookings
  // where they're still equal.
  async getBookingByPaymentReference(reference: string) {
    const byReference = await Booking.findOne({
      paymentReference: reference,
    }).select("-__v -updatedAt");

    if (byReference) return byReference;

    return this.getBookingByBookingId(reference);
  }

  // fetch booking by MongoDB ID
  async getBookingById(bookingId: string, userId: string, role: string) {
    // check users role
    if (role === "callrep") {
      // if the admin is a call rep, return the booking if the iD is found and the booking was assigned to the call rep
      return await Booking.findOne({
        _id: new Types.ObjectId(bookingId),
        assignedRep: userId,
      }).populate({
        path: "assignedRep",
        select: "-__v -createdAt -updatedAt", // Optional: exclude sensitive fields
      });
    }

    // return the booking if the Id matches regardless of the role
    return await Booking.findById(bookingId).populate({
      path: "assignedRep",
      select: "-__v -createdAt -updatedAt", // Optional: exclude sensitive fields
    });
  }

  // Read-only variant of getBookingById for admin display — returns a plain
  // object (not a Mongoose document) with the caller's customer tier
  // attached. Never use this for a booking that will be mutated/saved
  // afterwards (see getBookingById, which stays a live document for that).
  async getBookingByIdForDisplay(bookingId: string, userId: string, role: string) {
    const booking = await this.getBookingById(bookingId, userId, role);
    if (!booking) return null;

    const email = booking.caller?.email ?? booking.callerEmail;
    const tier = await customerService.getTierByEmail(email);

    return { ...booking.toObject(), customerTier: tier };
  }

  // Update a call's status. For legacy (flat-shape) bookings this writes the
  // top-level `status` field directly. For v2 bookings it updates the
  // matching recipient's `callStatus` and recomputes `bookingStatus` in the
  // same write — this is the single write path, never set bookingStatus
  // directly elsewhere.
  async updateCallStatus(
    bookingId: string,
    userId: string,
    role: string,
    newStatus: callStatus,
    recipientId?: string
  ) {
    const booking = await this.getBookingById(bookingId, userId, role);
    if (!booking) return null;

    // A superseded booking is a dead end — its customer re-checked-out and was
    // handed a fresh booking. Refuse call-status writes so a rep doesn't work
    // a ghost; if a late payment later revives it via markBookingPaid the
    // status leaves "abandoned" and this gate re-opens on its own.
    if (booking.bookingStatus === "abandoned") {
      bookingLogger.warn("Update call status refused: booking superseded", {
        bookingId,
        supersededBy: booking.supersededBy,
        action: "UPDATE_CALL_STATUS_REFUSED_ABANDONED",
      });
      return null;
    }

    if (isLegacyBooking(booking) || !recipientId) {
      const oldStatus = booking.status;
      booking.status = newStatus;
      const saved = await booking.save();

      await auditLogService.recordDiffs("booking", booking.bookingId, userId, [
        { field: "status", oldValue: oldStatus, newValue: newStatus },
      ]);

      return saved;
    }

    const recipient = booking.recipients?.find(
      (r) => r._id?.toString() === recipientId
    );
    if (!recipient) {
      bookingLogger.warn("Update call status failed: recipient not found", {
        bookingId,
        recipientId,
        action: "UPDATE_CALL_STATUS_RECIPIENT_NOT_FOUND",
      });
      return null;
    }

    const oldCallStatus = recipient.callStatus;
    recipient.callStatus = newStatus;
    // "abandoned" never reaches here: the gate at the top of this method
    // refuses superseded bookings entirely. Only a late payment
    // (markBookingPaid) revives one, re-deriving this same status.
    booking.bookingStatus = deriveBookingStatus(booking.recipients!);

    const saved = await booking.save();

    await auditLogService.recordDiffs("booking", booking.bookingId, userId, [
      { field: `recipient.${recipientId}.callStatus`, oldValue: oldCallStatus, newValue: newStatus },
    ]);

    bookingLogger.info("Call status updated", {
      bookingId,
      recipientId,
      newStatus,
      bookingStatus: booking.bookingStatus,
      action: "UPDATE_CALL_STATUS_SUCCESS",
    });


    return saved;
  }

  // Delete booking by MongoDB ID
  async deleteBookingById(bookingId: string, userId: string, role: string) {
    const booking = await this.getBookingById(bookingId, userId, role);
    if (!booking) return { deletedCount: 0 };

    const result = await Booking.deleteOne({ _id: new Types.ObjectId(bookingId) });

    if (result.deletedCount > 0) {
      await auditLogService.record({
        entity: "booking",
        entityId: booking.bookingId,
        field: "status",
        oldValue: "active",
        newValue: "deleted",
        changedBy: userId,
      });
    }

    return result;
  }

  async getAllBooking(
    userId: string,
    role: string,
    query: any,
    sortOrder: SortOrder = -1,
    sortParam: string = "callDate",
    skip: number = 0,
    limit: number = 10
  ) {
    // Build baseQuery
    const baseQuery =
      role === "callrep"
        ? { ...query, assignedRep: new Types.ObjectId(userId) }
        : query;

    const bookings = await Booking.find(baseQuery)
      // The _id tiebreaker (same direction as the primary sort) makes the
      // order total — without it, skip/limit pagination over a non-unique
      // sort key like callDate skips and duplicates rows across pages.
      .sort({ [sortParam]: sortOrder, _id: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "assignedRep",
        select: "-password -__v -createdAt -updatedAt", // Optional: exclude sensitive fields
      });

    // Single batch lookup for the whole page rather than one query per row.
    const emails = Array.from(
      new Set(
        bookings
          .map((b) => (b.caller?.email ?? b.callerEmail)?.toLowerCase())
          .filter((email): email is string => !!email)
      )
    );
    const tierByEmail = await customerService.getTiersByEmails(emails);

    const recordingSummaryByBooking = await recordingService.getRecordingSummaryByBookings(
      bookings.map((b) => b._id as Types.ObjectId),
      userId,
      role as adminRole,
    );

    return bookings.map((booking) => {
      const email = (booking.caller?.email ?? booking.callerEmail)?.toLowerCase();
      const customerTier = email ? tierByEmail.get(email) ?? "new" : "new";
      const recordingSummary = recordingSummaryByBooking.get((booking._id as Types.ObjectId).toString());
      return { ...booking.toObject(), customerTier, recordingSummary };
    });
  }

  async generateBookingId(): Promise<string> {
    let bookingId: string;
    let exists;

    do {
      const timestamp = Date.now().toString().slice(-5); // last 5 digits of timestamp
      const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
      bookingId = `SLN-${timestamp}${random}`; // e.g., SLN-351201234

      exists = await Booking.exists({ bookingId }); // Check if bookingId already exists in the database
    } while (exists); // Check if bookingId already exists in the database
    return bookingId;
  }

  async getAnalytics(matchStage: any) {
    // call the Mongo DB aggregate function to get the aggregate values
    return await Booking.aggregate([
      // pass the matchStage object to filter the documents based on the keys in the matchstage objet
      { $match: matchStage },

      // legacy (flat) bookings count by their single `status`; v2 bookings
      // count per-call via each recipient's `callStatus` — one booking with
      // 3 recipients contributes up to 3 status entries here.
      {
        $project: {
          effectiveStatuses: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$recipients", []] } }, 0] },
              "$recipients.callStatus",
              ["$status"],
            ],
          },
        },
      },
      { $unwind: "$effectiveStatuses" },
      {
        $group: {
          _id: "$effectiveStatuses",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // Booking-level completion breakdown (pending/in_progress/completed) — one
  // entry per booking, not per call. Distinct from getAnalytics above: that
  // answers "how many calls are left to place" (rep workload); this answers
  // "how many customer orders are still incomplete" (what was actually paid
  // for). They intentionally diverge once a booking holds multiple
  // recipients with different call outcomes.
  async getBookingStatusBreakdown(matchStage: any) {
    return await Booking.aggregate([
      { $match: matchStage },
      {
        $project: {
          effectiveBookingStatus: {
            $ifNull: [
              "$bookingStatus",
              {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: ["$status", ["successful", "unsuccessful", "rejected"]],
                      },
                      then: "completed",
                    },
                    {
                      case: { $in: ["$status", [null, "pending"]] },
                      then: "pending",
                    },
                  ],
                  default: "in_progress",
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$effectiveBookingStatus",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // Scheduled job (jobs/abandonedBookingCleanupJob.ts) — retires superseded
  // bookings whose payment can no longer arrive, without re-creating the
  // orphaned-payment class of bugs: a booking is only deleted once its Paystack
  // reference is provably dead (verify => failed/abandoned) or was never
  // minted. A late success is HEALED (markBookingPaid) instead of deleted, and
  // anything still pending/unverifiable is left for the next run so the intact
  // reference keeps matching late webhooks. Iterates via cursor like
  // recordingService.cleanupExpiredRecordings.
  async cleanupAbandonedBookings(options?: {
    ageDays?: number;
    dryRun?: boolean;
  }): Promise<{
    healed: number;
    deleted: number;
    skipped: number;
    failed: number;
  }> {
    const ageDays = options?.ageDays ?? 7;
    const dryRun = options?.dryRun ?? false;

    const cutoff = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000);

    const cursor = Booking.find({
      bookingStatus: "abandoned",
      supersededAt: { $lte: cutoff },
    }).cursor();

    let healed = 0;
    let deleted = 0;
    let skipped = 0;
    let failed = 0;

    for await (const booking of cursor) {
      const reference = booking.paymentReference;

      // Best-effort per booking: any DB mutation that throws is counted as
      // failed and the run moves on — a single stuck document must not take
      // the whole scheduled job down (a network blip mid-delete already
      // increments failed; a re-run retries it).
      try {
        if (!reference) {
          // No reference was ever minted, so nothing can ever be charged
          // against this booking — safe to delete outright.
          if (dryRun) {
            bookingLogger.info("Abandoned cleanup (dry-run): would delete (no reference)", {
              bookingId: booking.bookingId,
              supersededAt: booking.supersededAt,
              action: "CLEANUP_ABANDONED_DRY_DELETE",
            });
            skipped += 1;
            continue;
          }
          await Booking.deleteOne({ _id: booking._id });
          deleted += 1;
          continue;
        }

        let status: string | undefined;
        try {
          status = (await paymentService.verifyTransaction(reference))?.data?.status;
        } catch (error: any) {
          bookingLogger.warn(
            "Abandoned cleanup: verify failed, leaving booking for next run",
            {
              bookingId: booking.bookingId,
              reference,
              error: error.message,
              action: "CLEANUP_ABANDONED_VERIFY_ERROR",
            }
          );
          skipped += 1;
          continue;
        }

        if (status === "success") {
          if (dryRun) {
            bookingLogger.info("Abandoned cleanup (dry-run): would heal as paid", {
              bookingId: booking.bookingId,
              reference,
              action: "CLEANUP_ABANDONED_DRY_HEAL",
            });
            skipped += 1;
            continue;
          }
          // A webhook-missed late payment finally confirmed — credit instead
          // of deleting (markBookingPaid revives the booking out of
          // "abandoned").
          bookingLogger.info("Abandoned cleanup healed a late payment", {
            bookingId: booking.bookingId,
            reference,
            action: "CLEANUP_ABANDONED_HEALED",
          });
          await paymentService.markBookingPaid(booking, reference);
          healed += 1;
          continue;
        }

        if (status === "failed" || status === "abandoned") {
          if (dryRun) {
            bookingLogger.info("Abandoned cleanup (dry-run): would delete (dead reference)", {
              bookingId: booking.bookingId,
              reference,
              status,
              action: "CLEANUP_ABANDONED_DRY_DELETE",
            });
            skipped += 1;
            continue;
          }
          await Booking.deleteOne({ _id: booking._id });
          deleted += 1;
          continue;
        }

        // pending/processing/unreachable — the reference may still be payable,
        // keep it matchable and retry on the next run.
        bookingLogger.info("Abandoned cleanup: payment still possible, keeping booking", {
          bookingId: booking.bookingId,
          reference,
          status,
          action: "CLEANUP_ABANDONED_SKIPPED_PENDING",
        });
        skipped += 1;
      } catch (error: any) {
        failed += 1;
        bookingLogger.error("Abandoned cleanup: mutation failed for booking", {
          bookingId: booking.bookingId,
          reference: booking.paymentReference,
          error: error.message,
          action: "CLEANUP_ABANDONED_MUTATION_FAILED",
        });
      }
    }

    bookingLogger.info("Abandoned-booking cleanup run complete", {
      healed,
      deleted,
      skipped,
      failed,
      dryRun,
      action: "CLEANUP_ABANDONED_SUCCESS",
    });

    return { healed, deleted, skipped, failed };
  }

  async getTotalBookingsCount(matchStage: any) {
    return await Booking.countDocuments(matchStage);
  }

  // Customer directory "booked within X" filter needs every booking in the
  // range, not just each customer's single lastBookingAt field — this finds
  // the distinct caller emails across all matching bookings (legacy + v2
  // shape), for the customer controller to filter Customer docs by.
  async getDistinctCallerEmailsInDateRange(
    dateRange: { start: Date; end: Date },
    fetchParam: string
  ): Promise<string[]> {
    const dateQuery =
      fetchParam === "bookingDate"
        ? { createdAt: { $gte: dateRange.start, $lte: dateRange.end } }
        : {
            $or: [
              { callDate: { $gte: dateRange.start, $lte: dateRange.end } },
              // $elemMatch keeps $gte/$lte scoped to the same recipient —
              // see the identical fix (and its comment) in
              // bookingController.getAllBooking.
              {
                recipients: {
                  $elemMatch: {
                    callDate: { $gte: dateRange.start, $lte: dateRange.end },
                  },
                },
              },
            ],
          };

    const [v2Emails, legacyEmails] = await Promise.all([
      Booking.distinct("caller.email", dateQuery),
      Booking.distinct("callerEmail", dateQuery),
    ]);

    const emails = new Set<string>();
    [...v2Emails, ...legacyEmails].forEach((email) => {
      if (email) emails.add(String(email).toLowerCase());
    });
    return Array.from(emails);
  }

  async getTotalRevenue(matchStage: any) {
    const result = await Booking.aggregate([
      { $match: matchStage },
      {
        // v2 bookings carry a numeric totalPrice; legacy bookings only have
        // the string `price` field.
        $project: {
          effectivePrice: {
            $cond: [
              { $ifNull: ["$totalPrice", false] },
              "$totalPrice",
              { $toDouble: { $ifNull: ["$price", "0"] } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$effectivePrice" },
        },
      },
    ]);

    return result[0]?.totalRevenue || 0;
  }
}

const bookingService = new BookingService();
export default bookingService;
