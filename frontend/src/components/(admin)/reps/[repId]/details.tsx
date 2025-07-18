import { useAdminAuth } from "@/hooks/authContext";
import { useFetchRep, useFetchReps, useUpdateRep } from "@/hooks/useReps";
import { Rep } from "@/lib/types";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { deepEqual } from "@/lib/hasBookingChanged";
import ActionStatusModal from "../../ui/updateModal";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Filter } from "lucide-react";
import DashboardContextProvider from "../../dashboard/dashboardFilterContext";
import Analytics from "../../dashboard/analytics";

export function Details({ repData }: { repData: Rep }) {
  const { user } = useAdminAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [initialData, setInitialData] = useState(repData);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState<
    Rep & {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    }
  >({ ...repData, oldPassword: "", newPassword: "", confirmPassword: "" });

  const [editForm, setEditForm] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorFields, setErrorFields] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [showFilter, setShowFilter] = useState(true);

  const updateMutation = useUpdateRep(formData);

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm) {
      setEditForm(true);
      return;
    }

    const personalInfoChanged = !deepEqual(initialData, {
      ...formData,
      oldPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    });

    const updatingPassword =
      formData.oldPassword || formData.newPassword || formData.confirmPassword;

    let passwordValidationFailed = false;

    // Validate password section only if one of them is touched
    if (updatingPassword) {
      const newErrorFields = {
        oldPassword: !formData.oldPassword,
        newPassword: !formData.newPassword,
        confirmPassword:
          !formData.confirmPassword ||
          formData.confirmPassword !== formData.newPassword,
      };
      setErrorFields(newErrorFields);

      passwordValidationFailed = Object.values(newErrorFields).some(
        (val) => val === true
      );
    }

    // If nothing changed and no password update, close edit
    if (!personalInfoChanged && !updatingPassword) {
      setEditForm(false);
      return;
    }

    // If errors in password, don't proceed
    if (passwordValidationFailed) return;

    // Proceed with update
    updateMutation.mutate();
  };

  useEffect(() => {
    setShowUpdateModal(true);
  }, [updateMutation.isSuccess, updateMutation.isError]);

  return (
    <motion.div
      className="py-6 md:py-12 space-y-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <button
        className="btn-secondary rounded-md py-1 md:py-2 border font-normal active:bg-brand-start active:text-white transition duration-150"
        onClick={() => router.back()}
      >
        {`Back`}
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rep Details</h1>
      </div>

      <div className="">
        <form onSubmit={handleSubmit} className={`space-y-6 text-gray-700`}>
          <div className="space-y-8">
            {/* Personal info */}
            <div>
              <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                {" "}
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {/* firstname */}
                <div
                  className={`flex ${editForm ? "flex-col" : "flex-row"} gap-4`}
                >
                  <label className="text-gray-700 font-medium">
                    First Name:
                  </label>
                  {editForm ? (
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="firstName"
                      value={formData?.firstName}
                      onChange={handleOnChange}
                      required
                      placeholder="Your first name"
                      disabled={!editForm}
                    />
                  ) : (
                    <p className="flex-1">{formData?.firstName}</p>
                  )}
                </div>

                {/* lastname */}
                <div
                  className={`flex ${editForm ? "flex-col" : "flex-row"} gap-4`}
                >
                  <label className="text-gray-700 font-medium">
                    Last Name:
                  </label>
                  {editForm ? (
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="lastName"
                      value={formData?.lastName}
                      onChange={handleOnChange}
                      required
                      placeholder="Your last name"
                      disabled={!editForm}
                    />
                  ) : (
                    <p className=" flex-1">{formData?.lastName}</p>
                  )}
                </div>

                {/* email */}
                <div
                  className={`flex ${editForm ? "flex-col" : "flex-row"} gap-4`}
                >
                  <label className="text-gray-700 font-medium">Email:</label>
                  {editForm ? (
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="email"
                      name="email"
                      value={formData?.email}
                      onChange={handleOnChange}
                      required
                      placeholder="admin@spreadlove.com"
                      disabled={!editForm}
                    />
                  ) : (
                    <p className=" flex-1">{formData?.email}</p>
                  )}
                </div>

                {/* phone */}
                <div
                  className={`flex ${editForm ? "flex-col" : "flex-row"} gap-4`}
                >
                  <label className="text-gray-700 font-medium">Phone:</label>
                  {editForm ? (
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="phone"
                      value={formData?.phone}
                      onChange={handleOnChange}
                      required
                      placeholder="+234 123 456 7890"
                      disabled={!editForm}
                    />
                  ) : (
                    <p className=" flex-1">{formData?.phone}</p>
                  )}
                </div>

                {/* role */}
                {user?.role === "superadmin" && (
                  <div
                    className={`flex ${
                      editForm ? "flex-col" : "flex-row"
                    } gap-4`}
                  >
                    <label className="text-gray-700 font-medium">Role:</label>
                    {editForm ? (
                      <select
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                        name="role"
                        value={formData?.role}
                        onChange={handleOnChange}
                        required
                        disabled={!editForm}
                      >
                        <option value="callrep">callrep</option>
                        <option value="salesrep">salesrep</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    ) : (
                      <p className=" flex-1">{formData?.role}</p>
                    )}
                  </div>
                )}

                {/* status */}
                <div
                  className={`flex ${editForm ? "flex-col" : "flex-row"} gap-4`}
                >
                  <label className="text-gray-700 font-medium">Status:</label>
                  {editForm ? (
                    <select
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      name="status"
                      value={formData?.status}
                      onChange={handleOnChange}
                      required
                      disabled={!editForm}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="blocked">blocked</option>
                    </select>
                  ) : (
                    <p
                      className={`flex-1 ${
                        formData?.status === "active"
                          ? "text-green-500"
                          : formData?.status === "inactive"
                          ? ""
                          : "text-red-500"
                      }`}
                    >
                      {formData?.status}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Update Password */}
            {editForm && user?.role === "superadmin" && (
              <div>
                <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                  {" "}
                  Change Password
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {/*old password */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Old Password:
                    </label>
                    <div className="relative">
                      <input
                        className={`pl-4 pr-12 py-3 border ${
                          errorFields.oldPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0`}
                        type={showOldPassword ? "text" : "password"}
                        name="oldPassword"
                        value={formData?.oldPassword}
                        onChange={handleOnChange}
                        placeholder="Enter your password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      >
                        {showOldPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errorFields.oldPassword && (
                      <span className="text-red-500 text-xs">
                        Enter a valid password
                      </span>
                    )}
                  </div>

                  {/*new password */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      New Password:
                    </label>
                    <div className="relative">
                      <input
                        className={`pl-4 pr-12 py-3 border ${
                          errorFields.newPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0`}
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData?.newPassword}
                        onChange={handleOnChange}
                        placeholder="Enter new password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errorFields.newPassword && (
                      <span className="text-red-500 text-xs">
                        Enter a valid password
                      </span>
                    )}
                  </div>

                  {/*confirm password */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Confirm Password:
                    </label>
                    <div className="relative">
                      <input
                        className={`pl-4 pr-12 py-3 border ${
                          errorFields.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0`}
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData?.confirmPassword}
                        onChange={handleOnChange}
                        placeholder="Confirm your password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errorFields.confirmPassword && (
                      <span className="text-red-500 text-xs">
                        Password mismatch
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* submit button */}
            {
              <div className={`w-full flex gap-4 mt-4`}>
                {editForm && (
                  <button
                    className="btn-secondary h-10 rounded-lg flex items-center w-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditForm(false);
                      setFormData({
                        ...initialData,
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    disabled={updateMutation.isPending}
                  >
                    {
                      <div className="flex items-center justify-center">
                        <p>Cancel</p>
                      </div>
                    }
                  </button>
                )}
                <button
                  type="submit"
                  className={`btn-primary h-10 rounded-lg flex items-center justify-center disabled:opacity-50 ${
                    editForm ? "w-auto" : "w-auto"
                  }`}
                  disabled={
                    updateMutation.isPending ||
                    (editForm &&
                      deepEqual(
                        {
                          ...initialData,
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        },
                        formData
                      ))
                  }
                >
                  {updateMutation.isPending ? (
                    <div>
                      <svg
                        className="animate-spin h-5 w-5 text-white mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="sr-only">Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <p>{editForm ? "Save" : "Update"}</p>
                    </div>
                  )}
                </button>
              </div>
            }
          </div>
        </form>
      </div>

      {repData.role === "callrep" && !editForm && (
        <div className="space-y-8 mt-12">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <button
              className="flex items-center px-4 py-2 border border-brand-end rounded-lg hover:bg-brand-end hover:scale-105 hover:text-white transition text-brand-end"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="h-5 w-5 mr-2 " />
              Filter
            </button>
          </div>
          <DashboardContextProvider showFilter={showFilter} repId={repData._id}>
            <Analytics></Analytics>
          </DashboardContextProvider>
        </div>
      )}

      {showUpdateModal && updateMutation.isSuccess && (
        <ActionStatusModal
          setShowModal={() => {
            queryClient.invalidateQueries({
              queryKey: ["rep", repData._id],
            });

            queryClient.invalidateQueries({
              queryKey: ["reps"],
            });

            setEditForm(false);
            setShowUpdateModal(false);
          }}
          success="Rep info updated successfully"
        ></ActionStatusModal>
      )}

      {showUpdateModal && updateMutation.isError && (
        <ActionStatusModal
          setShowModal={() => setShowUpdateModal(false)}
          error={updateMutation.error.message}
        ></ActionStatusModal>
      )}
    </motion.div>
  );
}
