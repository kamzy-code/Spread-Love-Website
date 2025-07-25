import BookHero from "@/components/book/bookHero";
import BookingForm from "@/components/book/bookForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ occassion?: string; call_type?: string, reference?: string }>;
}) {
  const {occassion, call_type, reference} = await searchParams; 
  return (
    <div>
      <BookHero></BookHero>

      <section className="gradient-background-soft">
        <BookingForm occassion={occassion} call_type={call_type} reference={reference}></BookingForm>
      </section>
    </div>
  );
}
