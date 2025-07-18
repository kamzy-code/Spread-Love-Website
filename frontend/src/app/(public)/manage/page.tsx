import ManageHero from "@/components/manage/manageHero";
import SearchForm from "@/components/manage/searchForm";

export default async function ManageBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  return (
    <div>
      <ManageHero ></ManageHero>

      <SearchForm id={id}></SearchForm>
    </div>
  );
}
