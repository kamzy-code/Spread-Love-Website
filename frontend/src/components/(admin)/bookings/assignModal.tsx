import { Booking, Rep } from "@/lib/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, TriangleAlert } from "lucide-react";
import { useFetchReps } from "@/hooks/useReps";
import { useAssignBooking } from "@/hooks/useBookings";
import UpdateConfirmationModal from "../ui/updateModal";
import { useQueryClient } from "@tanstack/react-query";

export default function AssignModal({
  setShowAssignForm,
  booking,
}: {
  setShowAssignForm: (val: boolean) => void;
  booking: Booking;
}) {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const [repId, setRepId] = useState("auto");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorFields, setErrorFields] = useState({
    rep: false,
  });

  const { data } = useFetchReps(
    { limit: 100, page: 1, role: "callrep", status: "active" },
    "callreps"
  );
  const reps: Rep[] = data?.data || [];

  const assignMutation = useAssignBooking(booking._id, repId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrorFields = {
      rep: !repId || (!repId.startsWith("auto") && !repId),
    };

    setErrorFields(newErrorFields);

    const hasError = Object.values(newErrorFields).some((val) => val === true);

    if (hasError) {
      return;
    }

    assignMutation.mutate();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (assignMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["booking", booking._id],
      });

      queryClient.refetchQueries({
        queryKey:["bookings"]
      })

      queryClient.refetchQueries({
        queryKey:["booking", booking._id]
      })

      setRepId("auto");
      setErrorFields({
        rep: false,
      });
      setShowSuccessModal(true);
    }
  }, [assignMutation.isSuccess]);

  if (!mounted) return null;

  if (showSuccessModal) {
    return (
      <UpdateConfirmationModal
        setShowModal={() => {
          setShowSuccessModal(false);
          setShowAssignForm(false);
        }}
        success="Booking assigned successfully!"
      ></UpdateConfirmationModal>
    );
  }

  return (
    <div className="">
      <div
        className="fixed z-50 inset-0 flex items-center justify-center bg-black/50"
        onClick={() => setShowAssignForm(false)}
      >
        <div
          className="relative w-[90%] md:w-[70%] lg:w-[40%] max-h-[90%] overflow-y-auto bg-white rounded-xl shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className=" p-8 w-full flex flex-col items-center justify-center "
          >
            <X
              className="w-5 h-5 md:h-8 md:w-8 text-gray-700 absolute right-10 top-10 hover:scale-120 transition"
              onClick={() => setShowAssignForm(false)}
            ></X>

            <div className="text-center py-2 mt-4">
              <h2 className="text-xl md:text-2xl font-bold">Assign to Rep</h2>
              <p className="text-sm md:text-[1rem] text-gray-700">
                {` Assign booking - ${booking.bookingId.toString()} to a new rep.`}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`space-y-3 text-brand-start w-full py-4 text-start`}
            >
              {/* firstname */}
              <div className="flex flex-col justify-center text-center space-y-2">
                <label className="text-gray-700 font-medium">Select Rep:</label>
                <div className="relative">
                  <select
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.rep ? "border-red-500" : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                    name="rep"
                    value={repId}
                    onChange={(e) => setRepId(e.target.value)}
                    required
                  >
                    <option value="auto">Auto Assign</option>
                    {reps.map((rep) => (
                      <option key={rep._id} value={rep._id}>
                        {`${rep.firstName} ${rep.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                {errorFields.rep && (
                  <span className="text-red-500 text-xs">
                    First name required
                  </span>
                )}
              </div>

              {assignMutation.error && (
                <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center font-medium">
                  <TriangleAlert className="h-5 w-5 mr-2 text-red-500" />
                  {assignMutation.error.message}
                </p>
              )}

              <button
                type="submit"
                disabled={!repId}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </div>
                ) : (
                  "Assign Booking"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
