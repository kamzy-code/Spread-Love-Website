"use client";
import { useRouter } from "next/navigation";
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="btn-primary rounded-lg flex justify-center items-center"
      onClick={() => router.back()}
    >
      Go Back
    </button>
  );
}
