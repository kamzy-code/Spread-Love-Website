import AdminShell from "@/components/(admin)/ui/AdminShell";
import BookingDetails from "@/components/(admin)/bookings/details/bookingDetails";


export default async function Bookings({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  console.log("booking Id", bookingId);
  return (
    <AdminShell>
      <div>
        <BookingDetails id={bookingId}></BookingDetails>
      </div>
    </AdminShell>
  );
}
