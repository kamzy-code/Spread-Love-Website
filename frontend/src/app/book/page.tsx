import BookHero from "@/components/book/bookHero";
import BookingForm from "@/components/book/bookForm";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ occassion?: string; call_type?: string }>;
}) {
  const {occassion, call_type} = await searchParams; 
  console.log(occassion, call_type)
  return (
    <div>
      <BookHero></BookHero>

      <section className="gradient-background-soft">
        <BookingForm occassion={occassion} call_type={call_type}></BookingForm>
      </section>
    </div>
  );
}
