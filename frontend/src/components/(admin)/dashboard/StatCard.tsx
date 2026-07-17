import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode } from "react";

export interface StatCardData {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral";
  hidden?: boolean;
  href?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  trend,
  hidden,
  href,
}: StatCardData) {
  const body = (
    <div
      className={`card p-4 md:p-6 flex flex-col items-start justify-center w-full h-full gap-2 ${
        href ? "transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""
      }`}
    >
      <div className="text-sm md:text-md font-semibold text-gray-500">{title}</div>
      <div className="w-full flex flex-row items-center justify-between">
        <div className="text-lg md:text-2xl font-bold">{value}</div>
        <div className="text-brand-end">{icon}</div>
      </div>

      {change ? (
        <div
          className={`mt-1 text-sm flex items-center ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {trend === "up" && <TrendingUp className="h-4 w-4 mr-1" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 mr-1" />}
          {change}
        </div>
      ) : (
        <div className="mt-1 h-4"></div>
      )}
    </div>
  );

  return (
    <div className={hidden ? "hidden" : ""}>
      {href ? (
        <Link href={href} className="block h-full">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}
