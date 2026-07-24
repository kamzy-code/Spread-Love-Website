import { useState } from "react";
import { XCircle, Pencil, Ban, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import MiniLoader from "../ui/miniLoader";
import { Service } from "@/lib/types";
import { getServiceIcon } from "@/lib/serviceIcons";
import {
  useFetchAdminServices,
  useDeactivateService,
  useReactivateService,
} from "@/hooks/useServices";
import ServicePriceEditModal from "./ServicePriceEditModal";
import ServicePriceAuditLog from "./ServicePriceAuditLog";
import ToggleServiceStatusModal from "./ToggleServiceStatusModal";

export default function ServiceAdminList({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const queryClient = useQueryClient();
  const { data: services, error, isLoading, refetch } = useFetchAdminServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [togglingService, setTogglingService] = useState<Service | null>(null);
  const deactivateMutation = useDeactivateService();
  const reactivateMutation = useReactivateService();

  const handleConfirmToggle = async () => {
    if (!togglingService) return;
    if (togglingService.active) {
      await deactivateMutation.mutateAsync(togglingService._id);
    } else {
      await reactivateMutation.mutateAsync(togglingService._id);
    }
    queryClient.invalidateQueries({ queryKey: ["services"] });
    setTogglingService(null);
  };

  if (error)
    return (
      <div className="flex flex-col justify-center items-center text-gray-500 gap-4 py-12">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="text-gray-500">Error Fetching Services</p>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center px-6"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );

  if (isLoading)
    return (
      <div className="py-12 flex justify-center">
        <MiniLoader></MiniLoader>
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {services?.map((service) => (
          <div key={service._id} className="card p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="text-brand-end">{getServiceIcon(service.iconKey, "h-6 w-6")}</div>
                <h2 className="font-medium text-brand-start">{service.title}</h2>
              </div>
              <p className={service.active ? "text-green-500" : "text-gray-500"}>
                {service.active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="text-gray-700 text-sm space-y-2">
              <div className="flex justify-between items-center">
                <p>Regular:</p>
                <p className="text-brand-start">
                  ₦{service.regular.localPrice.toLocaleString()} / ₦
                  {service.regular.internationalPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p>Special:</p>
                <p className="text-brand-start">
                  ₦{service.special.localPrice.toLocaleString()} / ₦
                  {service.special.internationalPrice.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-gray-400">(Local / International)</p>
            </div>

            {isSuperAdmin && (
              <div className="flex gap-4 pt-2">
                <button
                  className="flex items-center gap-1.5 text-xs text-brand-start hover:underline"
                  onClick={() => setEditingService(service)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Pricing
                </button>
                <button
                  className={`flex items-center gap-1.5 text-xs hover:underline ${
                    service.active ? "text-red-500" : "text-green-600"
                  }`}
                  onClick={() => setTogglingService(service)}
                >
                  {service.active ? (
                    <>
                      <Ban className="h-3.5 w-3.5" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Reactivate
                    </>
                  )}
                </button>
              </div>
            )}

            <ServicePriceAuditLog serviceId={service._id} isSuperAdmin={isSuperAdmin} />
          </div>
        ))}
      </div>

      {editingService && (
        <ServicePriceEditModal
          service={editingService}
          onClose={() => setEditingService(null)}
        />
      )}

      {togglingService && (
        <ToggleServiceStatusModal
          serviceTitle={togglingService.title}
          action={togglingService.active ? "deactivate" : "reactivate"}
          onCancel={() => setTogglingService(null)}
          onConfirm={handleConfirmToggle}
          isPending={deactivateMutation.isPending || reactivateMutation.isPending}
        />
      )}
    </div>
  );
}
