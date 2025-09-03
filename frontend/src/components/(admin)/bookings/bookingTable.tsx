import { useBookingFilter } from "./bookingFilterContext";
import {
  useBookings,
  useUpdateStatus,
  useDeleteBooking,
  useSendBookingConfirmation,
} from "@/hooks/useBookings";
import MiniLoader from "../ui/miniLoader";
import { XCircle, Calendar } from "lucide-react";
import Pagination from "../ui/pagination";
import { BookingFilterContex, BookingFilters, Booking } from "@/lib/types";
import { useEffect, useState } from "react";
import { getColumnsByRole } from "./data-table/columns";
import { DataTable } from "../ui/data-table";
import { useAdminAuth } from "@/hooks/authContext";
import GridItem from "./data-table/grid-table";
import { useQueryClient } from "@tanstack/react-query";
import ActionStatusModal from "../ui/updateModal";
import DeleteConfirmationModal from "./deleteModal";
import AssignModal from "./assignModal";
import {
  useInitializeTransaction,
  useVerifyTransaction,
} from "@/hooks/usePayment";
import CompletePaymentModal from "./completePayment";

export default function BookingTable() {
  const queryClient = useQueryClient();
  const { user } = useAdminAuth();
  const fullFilter: BookingFilterContex = useBookingFilter();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updateStatusAction, setUpdateStatusAction] = useState(false);
  const [resendMailStatusAction, setResendMailStatusAction] = useState(false);
  const [verifyTransactionAction, setVerifyTransactionAction] = useState(false);
  const [showActionStatusModal, setShowActionStatusModal] = useState(false);
  const [completePaymentAction, setCompletePaymentAction] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompletePaymentModal, setShowCompletePaymentModal] =
    useState(false);
  const [deletedBooking, setDeletedBooking] = useState<Booking | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { setPage, ...filter } = fullFilter;
  const { search: searchTerm } = filter;

  const { data, error, isLoading, isFetching, refetch } = useBookings(
    filter as BookingFilters,
    searchTerm as string
  );

  const { data: bookings, meta } = data ?? { data: [], meta: undefined };

  const updateStatusMutation = useUpdateStatus({
    id: selectedBooking?._id as string,
    status: selectedBooking?.status as string,
  });
  const deleteBookingMutation = useDeleteBooking(deletedBooking?._id as string);
  const resendMailMutation = useSendBookingConfirmation(
    selectedBooking?.bookingId as string
  );
  const verifyTransactionMutation = useVerifyTransaction(
    selectedBooking?.bookingId as string
  );
  const completePaymentMutation = useInitializeTransaction({
    email: selectedBooking?.callerEmail as string,
    price: selectedBooking?.price as string,
  });

  const tableColumns = getColumnsByRole(
    user?.role as "superadmin" | "salesrep" | "callrep",
    (booking: Booking, action: string) => {
      setSelectedBooking(booking);
      const runAction = () => {
        action === "update"
          ? setUpdateStatusAction(true)
          : action === "assign"
          ? setShowAssignModal(true)
          : action === "resend"
          ? setResendMailStatusAction(true)
          : action === "verify"
          ? setVerifyTransactionAction(true)
          : action === "complete"
          ? setCompletePaymentAction(true)
          : null;
      };
      runAction();
    },
    (booking: Booking) => setDeletedBooking(booking),
    (val: boolean) => setShowDeleteModal(val)
  );

  useEffect(() => {
    if (selectedBooking && updateStatusAction) {
      updateStatusMutation.mutateAsync();
      setShowActionStatusModal(true);
      queryClient.invalidateQueries({
        queryKey: ["booking", selectedBooking?._id],
      });
    }
  }, [selectedBooking, updateStatusAction]);

  useEffect(() => {
    if (selectedBooking && resendMailStatusAction) {
      resendMailMutation.mutateAsync();
      setShowActionStatusModal(true);
      queryClient.invalidateQueries({
        queryKey: ["booking", selectedBooking?._id],
      });
    }
  }, [selectedBooking, resendMailStatusAction]);

  useEffect(() => {
    if (selectedBooking && verifyTransactionAction) {
      verifyTransactionMutation.mutateAsync();
      setShowActionStatusModal(true);
      queryClient.invalidateQueries({
        queryKey: ["booking", selectedBooking?._id],
      });
    }
  }, [selectedBooking, verifyTransactionAction]);

  useEffect(() => {
    if (selectedBooking && completePaymentAction) {
      completePaymentMutation.mutateAsync(selectedBooking.bookingId);
    }
  }, [selectedBooking, completePaymentAction]);

  useEffect(() => {
    if (updateStatusMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      refetch();

      queryClient.refetchQueries({
        queryKey: ["booking", selectedBooking?._id],
      });
    }
  }, [updateStatusMutation.isSuccess]);

  useEffect(() => {
    if (deleteBookingMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      refetch();
    }

    return () => {
      setDeletedBooking(null);
    };
  }, [deleteBookingMutation.isSuccess]);

  useEffect(() => {
    if (resendMailMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      refetch();

      queryClient.refetchQueries({
        queryKey: ["booking", selectedBooking?._id],
      });
    }
  }, [resendMailMutation.isSuccess]);

  useEffect(() => {
    if (verifyTransactionMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      refetch();

      queryClient.refetchQueries({
        queryKey: ["booking", selectedBooking?._id],
      });
    }
  }, [verifyTransactionMutation.isSuccess]);

  useEffect(() => {
    if (completePaymentMutation.isSuccess) {
      setShowCompletePaymentModal(true);
    }
  }, [completePaymentMutation.isSuccess]);

  useEffect(() => {
    if (
      isLoading ||
      isFetching ||
      updateStatusMutation.isPending ||
      deleteBookingMutation.isPending ||
      resendMailMutation.isPending ||
      showActionStatusModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Optional cleanup if component unmounts while loading
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isLoading,
    isFetching,
    updateStatusMutation.isPending,
    showActionStatusModal,
  ]);

  useEffect(() => {
    if (deletedBooking && confirmDelete) {
      deleteBookingMutation.mutateAsync();
      queryClient.invalidateQueries({
        queryKey: ["booking", deletedBooking?._id],
      });
    }
  }, [deletedBooking, confirmDelete]);

  useEffect(() => {
    if (
      deleteBookingMutation.error ||
      resendMailMutation.error ||
      verifyTransactionMutation.error ||
      completePaymentMutation.error
    ) {
      setShowActionStatusModal(true);
    }
  }, [
    deleteBookingMutation.error,
    resendMailMutation.error,
    verifyTransactionMutation.error,
    completePaymentMutation.error,
  ]);

  if (error)
    return (
      <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
        <div className="flex flex-col justify-center items-center text-center z-10">
          <XCircle className="h-8 md:w-8 text-red-500" />
          <p className="text-gray-500">Error Fetching Bookings</p>
        </div>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );

  return (
    <div>
      <div>
        {(isLoading ||
          isFetching ||
          updateStatusMutation.isPending ||
          deleteBookingMutation.isPending ||
          resendMailMutation.isPending ||
          verifyTransactionMutation.isPending ||
          completePaymentMutation.isPending) && (
          <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/5">
            {" "}
            <div className="p-4 card">
              <MiniLoader></MiniLoader>
            </div>
          </div>
        )}

        {!isLoading && !isFetching && bookings?.length === 0 && (
          <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500">
            <Calendar className="h-4 w-4 md:h-6 md:w-6" />
            <p className="text-sm md:text-[1rem]">No Bookings Available</p>
          </div>
        )}

        {showActionStatusModal &&
          updateStatusMutation.error &&
          !updateStatusMutation.isPending && updateStatusAction && (
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setUpdateStatusAction(false);
              }}
              error={updateStatusMutation.error.message}
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          deleteBookingMutation.error &&
          !deleteBookingMutation.isPending && (
            <ActionStatusModal
              setShowModal={() => setShowActionStatusModal(false)}
              error={deleteBookingMutation.error.message}
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          resendMailMutation.error &&
          !resendMailMutation.isPending && resendMailStatusAction && (
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setResendMailStatusAction(false);
              }}
              error={resendMailMutation.error.message}
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          verifyTransactionMutation.error &&
          !verifyTransactionMutation.isPending && verifyTransactionAction && (
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setVerifyTransactionAction(false);
              }}
              error={verifyTransactionMutation.error.message}
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          completePaymentMutation.error &&
          !completePaymentMutation.isPending && completePaymentAction &&(
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setCompletePaymentAction(false);
              }}
              error={"Error generating payment link"}
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          !updateStatusMutation.error &&
          updateStatusMutation.isSuccess && updateStatusAction && (
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setUpdateStatusAction(false);
              }}
              success="Booking status updated successfully!"
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          !resendMailMutation.error &&
          resendMailMutation.isSuccess && resendMailStatusAction && (
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setResendMailStatusAction(false);
              }}
              success="Mail Sent successfully!"
            ></ActionStatusModal>
          )}

        {showActionStatusModal &&
          !verifyTransactionMutation.error &&
          verifyTransactionMutation.isSuccess && verifyTransactionAction &&(
            <ActionStatusModal
              setShowModal={() => {
                setShowActionStatusModal(false);
                setVerifyTransactionAction(false);
              }}
              success={`Booking Successful - N${
                verifyTransactionMutation.data.data.amount / 100
              }`}
            ></ActionStatusModal>
          )}

        {showCompletePaymentModal &&
          !completePaymentMutation.error &&
          completePaymentMutation.isSuccess && completePaymentAction && (
            <CompletePaymentModal
              paymentLink={completePaymentMutation.data.authorization_url}
              setShowPaymentModal={(val: boolean) => {
                setShowCompletePaymentModal(val);
                setCompletePaymentAction(val);
              }}
            ></CompletePaymentModal>
          )}

        {deletedBooking && showDeleteModal && (
          <DeleteConfirmationModal
            bookingID={deletedBooking.bookingId}
            resetDeletedBooking={() => setDeletedBooking(null)}
            setConfirmDelete={(val: boolean) => setConfirmDelete(val)}
            setShowDeleteModal={(val: boolean) => setShowDeleteModal(val)}
          ></DeleteConfirmationModal>
        )}

        {bookings && bookings.length > 0 && (
          <div>
            {/* data-table */}
            <div className="hidden lg:block">
              <DataTable columns={tableColumns} data={bookings} />
            </div>

            {/* Grid View */}
            <div className="container mx-auto lg:hidden grid grid-cols-1 gap-4 py-4 ">
              {bookings.map((booking: Booking) => {
                return (
                  <GridItem
                    key={booking._id}
                    booking={booking}
                    role={user?.role as string}
                    setSelectedBooking={(booking: Booking, action: string) => {
                      setSelectedBooking(booking);
                      const runAction = () => {
                        action === "update"
                          ? setUpdateStatusAction(true)
                          : action === "assign"
                          ? setShowAssignModal(true)
                          : action === "resend"
                          ? setResendMailStatusAction(true)
                          : action === "verify"
                          ? setVerifyTransactionAction(true)
                          : action === "complete"
                          ? setCompletePaymentAction(true)
                          : null;
                      };
                      runAction();
                    }}
                    setDeletedBooking={(booking: Booking) =>
                      setDeletedBooking(booking)
                    }
                    setShowDeleteModal={(val: boolean) =>
                      setShowDeleteModal(val)
                    }
                  ></GridItem>
                );
              })}
            </div>

            {/* pagination */}
            <div>
              {meta && meta.totalPages > 0 && (
                <Pagination meta={meta} setPage={setPage} />
              )}
            </div>
          </div>
        )}

        {showAssignModal && selectedBooking && (
          <AssignModal
            setShowAssignForm={(val: boolean) => setShowAssignModal(val)}
            booking={selectedBooking}
          />
        )}
      </div>
    </div>
  );
}
