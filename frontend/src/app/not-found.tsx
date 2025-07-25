import BackButton from "@/components/ui/backButton";
export default function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-4 text-center bg-white">
      <h1 className="gradient-text font-bold text-7xl md:text-9xl">404</h1>
      <p className="font-medium text-2xl md:text-3xl text-gray-700">
        Page not found
      </p>

      <BackButton />
    </div>
  );
}
