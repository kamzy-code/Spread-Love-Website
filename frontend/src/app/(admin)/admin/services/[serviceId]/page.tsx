import ServiceDetails from "@/components/(admin)/services/serviceDetails";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return (
    <div>
      <ServiceDetails id={serviceId}></ServiceDetails>
    </div>
  );
}
