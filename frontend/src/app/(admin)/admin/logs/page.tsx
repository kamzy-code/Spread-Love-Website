import Logs from "@/components/(admin)/logs/logs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs",
};

export default function LogsPage() {
  return <Logs></Logs>;
}
