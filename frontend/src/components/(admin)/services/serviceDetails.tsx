"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Ban, CheckCircle, XCircle, TriangleAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  useFetchService,
  useDeactivateService,
  useReactivateService,
} from "@/hooks/useServices";
import { getServiceIcon } from "@/lib/serviceIcons";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import AdminShell from "../ui/AdminShell";
import AuditLogSidebar from "../ui/AuditLogSidebar";
import MiniLoader from "../ui/miniLoader";
import ImageWithPlaceholder from "../ui/ImageWithPlaceholder";
import ServicePriceEditModal from "./ServicePriceEditModal";
import ServiceDetailsEditModal from "./ServiceDetailsEditModal";
import ToggleServiceStatusModal from "./ToggleServiceStatusModal";

export default function ServiceDetails({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [editingPricing, setEditingPricing] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [toggling, setToggling] = useState(false);

  const { data: service, isLoading, isFetching, error, refetch } = useFetchService(id);
  const deactivateMutation = useDeactivateService();
  const reactivateMutation = useReactivateService();
  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (loading || authStatus === "checking") return <PageLoading></PageLoading>;
  if (authStatus === "error" && authError) return <PageError></PageError>;
  if (authStatus !== "authenticated") return null;

  if (!["superadmin", "salesrep"].includes(user?.role as string)) {
    return (
      <AdminShell>
        <div className="flex flex-col justify-center items-center h-full w-full gap-4">
          <TriangleAlert className="h-8 w-8 text-gray-500" />
          <p className="text-gray-700">Unauthorized</p>
          <button
            className="btn-primary rounded-lg"
            onClick={() => router.replace("/admin/dashboard")}
          >
            Go Back
          </button>
        </div>
      </AdminShell>
    );
  }

  if (error)
    return (
      <AdminShell>
        <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
          <div className="flex flex-col justify-center items-center text-center z-10">
            <XCircle className="h-8 md:w-8 text-red-500" />
            <p className="text-gray-500">{error.message}</p>
          </div>
          <button
            className="btn-primary h-10 rounded-lg flex justify-center items-center"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      </AdminShell>
    );

  const handleConfirmToggle = async () => {
    if (!service) return;
    if (service.active) {
      await deactivateMutation.mutateAsync(service._id);
    } else {
      await reactivateMutation.mutateAsync(service._id);
    }
    queryClient.invalidateQueries({ queryKey: ["service", id] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["auditLogs", "service", id] });
    setToggling(false);
  };

  return (
    <AdminShell>
      <section className="w-full flex justify-center py-3 md:py-8">
        {(isLoading || isFetching) && (
          <div>
            <div className="fixed z-50 bg-black/5 top-0 left-0 right-0 bottom-0"></div>
            <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <div className="p-4 card">
                <MiniLoader></MiniLoader>
              </div>
            </div>
          </div>
        )}

        {!!service && !isLoading && (
          <div className="w-full space-y-4">
            <button
              className="btn-secondary rounded-md py-1 md:py-2 border font-normal active:bg-brand-start active:text-white transition duration-150"
              onClick={() => router.back()}
            >
              Back
            </button>

            <section className="flex flex-col lg:flex-row w-full gap-6">
              <div className="py-6 md:py-8 flex-1 min-w-0 space-y-6 text-brand-start">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-brand-end">
                      {getServiceIcon(service.iconKey, "h-8 w-8")}
                    </div>
                    <div>
                      <h2 className="gradient-text font-bold text-xl md:text-2xl">
                        {service.title}
                      </h2>
                      <p className="text-gray-700 text-md">{service.category}</p>
                    </div>
                  </div>
                  <p
                    className={`px-4 py-2 rounded-full w-fit ${
                      service.active ? "text-green-500 bg-green-50" : "text-gray-500 bg-gray-100"
                    }`}
                  >
                    {service.active ? "Active" : "Inactive"}
                  </p>
                </div>

                {service.thumbnail && (
                  <ImageWithPlaceholder
                    src={service.thumbnail}
                    alt={service.title}
                    className="w-full h-64 rounded-xl border border-gray-200"
                  />
                )}

                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 font-medium">Description:</label>
                  <p className="py-1 w-full">{service.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Regular Call</h3>
                    <div className="text-sm space-y-1">
                      <p>Local: ₦{service.regular.localPrice.toLocaleString()}</p>
                      <p>International: ₦{service.regular.internationalPrice.toLocaleString()}</p>
                      {service.regular.features.length > 0 && (
                        <ul className="list-disc list-inside text-gray-600">
                          {service.regular.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Special Call</h3>
                    <div className="text-sm space-y-1">
                      <p>Local: ₦{service.special.localPrice.toLocaleString()}</p>
                      <p>International: ₦{service.special.internationalPrice.toLocaleString()}</p>
                      {service.special.features.length > 0 && (
                        <ul className="list-disc list-inside text-gray-600">
                          {service.special.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      className="flex items-center gap-1.5 text-sm text-brand-start hover:underline"
                      onClick={() => setEditingDetails(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Details
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-sm text-brand-start hover:underline"
                      onClick={() => setEditingPricing(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Pricing
                    </button>
                    <button
                      className={`flex items-center gap-1.5 text-sm hover:underline ${
                        service.active ? "text-red-500" : "text-green-600"
                      }`}
                      onClick={() => setToggling(true)}
                    >
                      {service.active ? (
                        <>
                          <Ban className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Reactivate
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <AuditLogSidebar entity="service" entityId={service._id} isSuperAdmin={isSuperAdmin} />
            </section>
          </div>
        )}
      </section>

      {editingPricing && service && (
        <ServicePriceEditModal service={service} onClose={() => setEditingPricing(false)} />
      )}

      {editingDetails && service && (
        <ServiceDetailsEditModal service={service} onClose={() => setEditingDetails(false)} />
      )}

      {toggling && service && (
        <ToggleServiceStatusModal
          serviceTitle={service.title}
          action={service.active ? "deactivate" : "reactivate"}
          onCancel={() => setToggling(false)}
          onConfirm={handleConfirmToggle}
          isPending={deactivateMutation.isPending || reactivateMutation.isPending}
        />
      )}
    </AdminShell>
  );
}
