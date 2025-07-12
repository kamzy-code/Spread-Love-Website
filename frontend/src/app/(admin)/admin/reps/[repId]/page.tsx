import RepDetails from "@/components/(admin)/reps/[repId]/repDetails";

export default async function RepDetailsPage({
  params,
}: {
  params: Promise<{ repId: string }>;
}) {
  const { repId } = await params;
  return (
    <div>
      <RepDetails repId={repId}></RepDetails>
    </div>
  );
}
