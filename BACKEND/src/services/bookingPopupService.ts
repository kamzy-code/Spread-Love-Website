import { createHash } from "crypto";
import { BookingPopup, BOOKING_POPUP_KEY } from "../models/bookingPopupModel";
import auditLogService from "./auditLogService";

// Identifies the current copy so the public page can tell "same pop-up the
// visitor already dismissed" from "edited since". A content hash rather than
// a stored counter: no read-modify-write race on concurrent saves, and
// reverting to previous copy naturally restores the previous identity.
const contentVersion = (title: string, body: string) =>
  createHash("sha1").update(`${title}\n${body}`).digest("hex").slice(0, 12);

class BookingPopupService {
  // Public — never exposes a disabled pop-up's copy (it might be a draft).
  async getPublic() {
    const popup = await BookingPopup.findOne({ key: BOOKING_POPUP_KEY }).lean();
    if (!popup || !popup.enabled) return { enabled: false as const };

    return {
      enabled: true as const,
      title: popup.title,
      body: popup.body,
      version: contentVersion(popup.title, popup.body),
    };
  }

  async getForAdmin() {
    const popup = await BookingPopup.findOne({ key: BOOKING_POPUP_KEY }).lean();
    return {
      enabled: popup?.enabled ?? false,
      title: popup?.title ?? "",
      body: popup?.body ?? "",
      updatedAt: popup?.updatedAt ?? null,
    };
  }

  async update(updates: { enabled: boolean; title: string; body: string }, changedBy: string) {
    const before = await BookingPopup.findOne({ key: BOOKING_POPUP_KEY }).lean();

    const saved = await BookingPopup.findOneAndUpdate(
      { key: BOOKING_POPUP_KEY },
      { $set: { ...updates, updatedBy: changedBy }, $setOnInsert: { key: BOOKING_POPUP_KEY } },
      { upsert: true, new: true, runValidators: true },
    );

    await auditLogService.recordDiffs("popup", BOOKING_POPUP_KEY, changedBy, [
      { field: "enabled", oldValue: before?.enabled ?? false, newValue: saved.enabled },
      { field: "title", oldValue: before?.title ?? "", newValue: saved.title },
      { field: "body", oldValue: before?.body ?? "", newValue: saved.body },
    ]);

    return {
      enabled: saved.enabled,
      title: saved.title,
      body: saved.body,
      updatedAt: saved.updatedAt,
    };
  }
}

const bookingPopupService = new BookingPopupService();
export default bookingPopupService;
