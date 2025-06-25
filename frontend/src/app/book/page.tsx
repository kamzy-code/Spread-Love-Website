import BookHero from "@/components/book/bookHero";
import BookingForm from "@/components/book/bookForm";

export default function BookingPage() {
  return (
    <div>
      <BookHero></BookHero>

      <section className="gradient-background-soft">
        <BookingForm></BookingForm>
      </section>
    </div>
  );
}
