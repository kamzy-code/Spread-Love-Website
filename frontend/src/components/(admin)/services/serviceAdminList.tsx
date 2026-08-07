import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Layers } from "lucide-react";
import MiniLoader from "../ui/miniLoader";
import { getServiceIcon } from "@/lib/serviceIcons";
import { useFetchAdminServices } from "@/hooks/useServices";
import { useServiceFilterStore } from "@/store/serviceFilterStore";
import Pagination from "../ui/pagination";

export default function ServiceAdminList() {
  const router = useRouter();

  const appliedFormData = useServiceFilterStore((s) => s.appliedFormData);
  const searchTerm = useServiceFilterStore((s) => s.debouncedValue);
  const setPage = useServiceFilterStore((s) => s.setPage);
  const filter = { ...appliedFormData, search: searchTerm };

  const { data, error, isLoading, isFetching, refetch } = useFetchAdminServices(filter, searchTerm);
  const { data: services, meta } = data ?? { data: [], meta: undefined };

  useEffect(() => {
    document.body.style.overflow = isLoading || isFetching ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading, isFetching]);

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

  return (
    <div>
      {(isLoading || isFetching) && (
        <div className="py-12 flex justify-center">
          <MiniLoader></MiniLoader>
        </div>
      )}

      {!isLoading && !isFetching && services.length === 0 && (
        <div className="flex flex-col justify-center items-center text-gray-500 py-12">
          <Layers className="h-6 w-6" />
          <p className="text-sm">No Services Found</p>
        </div>
      )}

      {!isLoading && !isFetching && services.length > 0 && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service._id}
                className="card p-6 space-y-3 cursor-pointer hover:shadow-md transition"
                onClick={() => router.push(`/admin/services/${service._id}`)}
              >
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
              </div>
            ))}
          </div>

          {meta && <Pagination meta={meta} setPage={setPage}></Pagination>}
        </div>
      )}
    </div>
  );
}
