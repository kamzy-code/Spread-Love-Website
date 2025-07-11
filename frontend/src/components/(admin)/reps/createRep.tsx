import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, TriangleAlert, X } from "lucide-react";
import { useCreateRep } from "@/hooks/useReps";
import CreateRepModal from "./createSuccessModal";
import { useRepFilter } from "./repsContext";
import { useFetchReps } from "@/hooks/useReps";

export default function CreateRep({
  setShowCreateForm,
}: {
  setShowCreateForm: (val: boolean) => void;
}) {
  const { setPage, ...filter } = useRepFilter();
  const { search: searchTerm } = filter;
  const { refetch } = useFetchReps(filter, searchTerm as string);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "callrep",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorFields, setErrorFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    role: false,
    password: false,
    confirmPassword: false,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrorFields = {
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      email: !formData.email || !formData.email.includes("@"),
      phone: !formData.phone,
      role: !formData.role,
      password: !formData.password,
      confirmPassword:
        !formData.confirmPassword ||
        formData.confirmPassword !== formData.password,
    };

    setErrorFields(newErrorFields);

    const hasError = Object.values(newErrorFields).some((val) => val === true);

    if (hasError) {
      return;
    }

    createMutation.mutate();
  };

  const createMutation = useCreateRep(formData);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (createMutation.isSuccess) {
      refetch();
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
      setShowSuccessModal(true);
    }
  }, [createMutation.isSuccess]);

  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuccessModal]);

  if (!mounted) return null;

  if (showSuccessModal) {
    return (
      <CreateRepModal
        setShowModal={(val: boolean) => {
          setShowSuccessModal(val);
          setShowCreateForm(val);
        }}
      ></CreateRepModal>
    );
  }
  return (
    <div className="">
      <div
        className="fixed z-50 bg-black/50 top-0 left-0 right-0 bottom-0"
        onClick={() => setShowCreateForm(false)}
      ></div>

      <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center h-[80%] w-[80%] md:w-[60%] lg:w-[40%]">
        <div className="text-center h-full w-full overflow-y-scroll card relative">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className=" p-8 w-full flex flex-col items-center justify-center "
          >
            <X
              className="w-5 h-5 md:h-8 md:w-8 text-gray-700 absolute right-10 top-10 hover:scale-120 transition"
              onClick={() => setShowCreateForm(false)}
            ></X>
            {/* Logo */}
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Image width={48} height={48} src="/logo.png" alt="Logo" />
              <span className="font-handwritten font-bold text-xl gradient-text">
                Spread Love Network
              </span>
            </div>

            <div className="text-center py-2 mt-4">
              <h2 className="text-xl md:text-2xl font-bold">Create Rep</h2>
              <p className="text-sm md:text-[1rem] text-gray-700">
                Create a new Representative
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`space-y-3 text-brand-start w-full py-4 text-start`}
            >
              {/* firstname */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">First Name:</label>
                <div className="relative">
                  <input
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleOnChange}
                    required
                    placeholder="Enter firstname"
                  />
                </div>
                {errorFields.firstName && (
                  <span className="text-red-500 text-xs">
                    First name required
                  </span>
                )}
              </div>

              {/* lastname */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Last Name:</label>
                <div className="relative">
                  <input
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.lastName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleOnChange}
                    required
                    placeholder="Enter lastname"
                  />
                </div>
                {errorFields.lastName && (
                  <span className="text-red-500 text-xs">
                    Last name required
                  </span>
                )}
              </div>

              {/* email */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Email:</label>
                <div className="relative">
                  <input
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleOnChange}
                    required
                    placeholder="admin@spreadlove.com"
                  />
                </div>
                {errorFields.email && (
                  <span className="text-red-500 text-xs">
                    Enter a valid email address
                  </span>
                )}
              </div>

              {/* phone */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Phone:</label>
                <div className="relative">
                  <input
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleOnChange}
                    required
                    placeholder="+234 123 456 7890"
                  />
                </div>
                {errorFields.phone && (
                  <span className="text-red-500 text-xs">
                    Enter a valid phone number
                  </span>
                )}
              </div>

              {/* role */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Role:</label>
                <div className="relative">
                  <select
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.role ? "border-red-500" : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                    name="role"
                    value={formData.role}
                    onChange={handleOnChange}
                    required
                  >
                    <option value={"callrep"}> Call Rep </option>
                    <option value={"salesrep"}> Sales Rep </option>
                    <option value={"superadmin"}> Super Admin </option>
                  </select>
                </div>
                {errorFields.role && (
                  <span className="text-red-500 text-xs">Role required</span>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Password:</label>
                <div className="relative">
                  <input
                    className={`pl-4 pr-12 py-3 border ${
                      errorFields.password
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleOnChange}
                    required
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errorFields.password && (
                  <span className="text-red-500 text-xs">
                    Enter a valid password
                  </span>
                )}
              </div>

              {/* confirm password */}
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
                    value={formData.confirmPassword}
                    onChange={handleOnChange}
                    required
                    placeholder="Confim your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errorFields.confirmPassword && (
                  <span className="text-red-500 text-xs">
                    Password doesn't match
                  </span>
                )}
              </div>

              {createMutation.error && (
                <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center font-medium">
                  <TriangleAlert className="h-5 w-5 mr-2 text-red-500" />
                  {createMutation.error.message}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.phone ||
                  !formData.role ||
                  !formData.password ||
                  !formData.confirmPassword ||
                  createMutation.isPending
                }
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  "Create"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
