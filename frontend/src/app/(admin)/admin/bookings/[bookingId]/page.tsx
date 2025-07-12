import BookingDetails from "@/components/(admin)/bookings/details/bookingDetails";

export default async function Bookings({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <div>
      <BookingDetails id={bookingId}></BookingDetails>
    </div>
  );
}
