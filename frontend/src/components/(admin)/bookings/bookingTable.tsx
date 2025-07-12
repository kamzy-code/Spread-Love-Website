import { useBookingFilter } from "./bookingFilterContext";
import {
  useBookings,
  useUpdateStatus,
  useDeleteBooking,
} from "@/hooks/useBookings";
import MiniLoader from "../ui/miniLoader";
import { XCircle, Calendar, MoreHorizontal, MoreVertical } from "lucide-react";
import Pagination from "../ui/pagination";
import { BookingFilterContex, BookingFilters, Booking } from "@/lib/types";
import { useEffect, useState } from "react";
import { getColumnsByRole } from "./data-table/columns";
import { DataTable } from "./data-table/data-table";
import { useAdminAuth } from "@/hooks/authContext";
import GridItem from "./data-table/grid-table";
import { useQueryClient } from "@tanstack/react-query";
import UpdateConfirmationModal from "../ui/updateModal";
import DeleteConfirmationModal from "./deleteModal";

export default function BookingTable() {
  const queryClient = useQueryClient();
  const { user } = useAdminAuth();
  const fullFilter: BookingFilterContex = useBookingFilter();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showUpdateModal, setShowUpdateMoadal] = useState(false);

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

  const tableColumns = getColumnsByRole(
    user?.role as "superadmin" | "salesrep" | "callrep",
    (booking: Booking) => setSelectedBooking(booking),
    (booking: Booking) => setDeletedBooking(booking),
    (val: boolean) => setShowDeleteModal(val)
  );

  useEffect(() => {
    if (selectedBooking) {
      updateStatusMutation.mutateAsync();
      setShowUpdateMoadal(true);
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (updateStatusMutation.isSuccess || deleteBookingMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["bookings", filter, searchTerm?.toLowerCase()],
      });
      refetch();
    }
  }, [updateStatusMutation.isSuccess, deleteBookingMutation.isSuccess]);

  useEffect(() => {
    if (
      isLoading ||
      isFetching ||
      updateStatusMutation.isPending ||
      showUpdateModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Optional cleanup if component unmounts while loading
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading, isFetching, updateStatusMutation.isPending, showUpdateModal]);

  useEffect(() => {
    if (deletedBooking && confirmDelete) {
      deleteBookingMutation.mutateAsync();
    }
  }, [deletedBooking, confirmDelete]);

  useEffect(() => {
    if (deleteBookingMutation.error) {
      setShowUpdateMoadal(true);
    }
  }, [deleteBookingMutation.error]);

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
          deleteBookingMutation.isPending) && (
          <div>
            <div className="fixed z-50 bg-black/5 top-0 left-0 right-0 bottom-0"></div>
            <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <div className="">
                <div className="p-4 card">
                  <MiniLoader></MiniLoader>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isFetching && bookings?.length === 0 && (
          <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500">
            <Calendar className="h-4 w-4 md:h-6 md:w-6" />
            <p className="text-sm md:text-[1rem]">No Bookings Available</p>
          </div>
        )}

        {showUpdateModal &&
          updateStatusMutation.error &&
          !updateStatusMutation.isPending && (
            <UpdateConfirmationModal
              setShowModal={() => setShowUpdateMoadal(false)}
              error={updateStatusMutation.error.message}
            ></UpdateConfirmationModal>
          )}

        {showUpdateModal &&
          deleteBookingMutation.error &&
          !deleteBookingMutation.isPending && (
            <UpdateConfirmationModal
              setShowModal={() => setShowUpdateMoadal(false)}
              error={deleteBookingMutation.error.message}
            ></UpdateConfirmationModal>
          )}

        {showUpdateModal &&
          !updateStatusMutation.error &&
          updateStatusMutation.isSuccess && (
            <UpdateConfirmationModal
              setShowModal={() => setShowUpdateMoadal(false)}
            ></UpdateConfirmationModal>
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
                    setSelectedBooking={(booking: Booking) =>
                      setSelectedBooking(booking)
                    }
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
              {meta && meta.totalPages > 0 && <Pagination meta={meta} setPage={setPage} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
