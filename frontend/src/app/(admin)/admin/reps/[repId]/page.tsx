import AdminShell from "@/components/(admin)/ui/AdminShell";
import RepDetails from "@/components/(admin)/reps/[repId]/repDetails";

export default async function RepDetailsPage({
  params,
}: {
  params: Promise<{ repId: string }>;
}) {
  const { repId } = await params;
  return (
    <AdminShell>
      <div>
        <RepDetails repId={repId}></RepDetails>
      </div>
    </AdminShell>
  );
}
