import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  XCircle,
  RefreshCcw,
  Ban,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/authContext";
import MiniLoader from "../ui/miniLoader";
import { useFilter } from "./dashboardFilterContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getAnalytics = async (
  signal: AbortSignal,
  filterType: string,
  date?: string,
  startDate?: string,
  endDate?: string
) => {
  const response = await fetch(
    `${apiUrl}/booking/admin/analytics?filterType=${filterType}${
      date ? `&date=${date}` : ""
    }${startDate ? `&startDate=${startDate}` : ""}${
      endDate ? `&endDate=${endDate}` : ""
    }`,
    {
      signal,
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || response.statusText || "Unknown error");
  }
  return data;
};

export const STATUS_LIST = [
  {
    key: "pending",
    label: "Pending",
    icon: <RefreshCcw className="h-4 w-4 md:h-6 md:w-6" />,
  },
  {
    key: "successful",
    label: "Successful",
    icon: <CheckCircle className="h-4 w-4 md:h-6 md:w-6" />,
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: <Ban className="h-4 w-4 md:h-6 md:w-6" />,
  },
  {
    key: "rescheduled",
    label: "Rescheduled",
    icon: <Calendar className="h-4 w-4 md:h-6 md:w-6" />,
  },
  {
    key: "unsuccessful",
    label: "Unsuccessful",
    icon: <XCircle className="h-4 w-4 md:h-6 md:w-6" />,
  },
];

export default function Analytics() {
  const { user } = useAdminAuth();

  const { appliedFilterType, appliedDate, appliedEndDate, appliedStartDate } =
    useFilter();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "analytics",
      appliedFilterType,
      appliedDate,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: ({ signal }) =>
      getAnalytics(
        signal,
        appliedFilterType,
        appliedDate,
        appliedStartDate,
        appliedEndDate
      ),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const statusCounts: Record<string, number> = {};

  STATUS_LIST.forEach((status) => {
    statusCounts[status.key] = 0;
  });

  if (data?.breakdown) {
    data.breakdown.forEach((item: { _id: string; count: number }) => {
      statusCounts[item._id] = item.count;
    });
  }

  const cards = [
    {
      title: "Total Bookings",
      value: data?.totalBookings ?? "-",
      change:
        data?.percentageIncrease !== undefined
          ? `${
              data.percentageIncrease > 0 ? "+" : ""
            }${data.percentageIncrease.toFixed(2)}%`
          : "-",
      trend:
        data?.percentageIncrease > 0
          ? "up"
          : data?.percentageIncrease < 0
          ? "down"
          : "neutral",
      icon: <Calendar className="h-4 w-4 md:h-6 md:w-6" />,
    },
    ...STATUS_LIST.map((status) => ({
      title: `${status.label} Bookings`,
      value: statusCounts[status.key],
      icon: status.icon,
    })),
    {
      title: "Total Revenue",
      value:
        data?.totalRevenue !== undefined
          ? `₦${Number(data.totalRevenue).toLocaleString()}`
          : "-",
      change:
        data?.revenuePercentageIncrease !== undefined
          ? `${
              data.revenuePercentageIncrease > 0 ? "+" : ""
            }${data.revenuePercentageIncrease.toFixed(2)}%`
          : "-",
      trend:
        data?.revenuePercentageIncrease > 0
          ? "up"
          : data?.revenuePercentageIncrease < 0
          ? "down"
          : "neutral",
      icon: <TrendingUp className="h-4 w-4 md:h-6 md:w-6" />,
    },
    {
      title: "Active Reps",
      value: data?.activeRepsCount ?? "-",
      icon: <Users className="h-4 w-4 md:h-6 md:w-6" />,
    },
  ];

  if (error)
    return (
      <div className="h-70 w-full flex flex-col items-center justify-center gap-4 card">
        <div className="flex flex-col justify-center items-center">
          <XCircle className="h-8 md:w-8 text-red-500"></XCircle>
          <p className="text-gray-500">Error Fetching Analtyics</p>
        </div>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  return (
    <div className="space-y-8">
      {(isLoading || isFetching) && <MiniLoader></MiniLoader>}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div
            className={`${
              user?.role === "callrep" && card.title === "Active Reps"
                ? "hidden"
                : ""
            } ${
              user?.role !== "superadmin" && card.title === "Total Revenue"
                ? "hidden"
                : ""
            }`}
            key={card.title}
          >
            <div className="card p-4 md:p-6 flex flex-col items-start justify-center w-full h-full gap-2">
              <div className="text-sm md:text-md font-semibold text-gray-500">
                {card.title}
              </div>
              <div className="w-full flex flex-row items-center justify-between">
                <div className="text-lg md:text-2xl font-bold">
                  {card.value}
                </div>

                <div className="text-brand-end">{card.icon}</div>
              </div>

              {card.change ? (
                <div
                  className={`mt-1 text-sm flex items-center ${
                    card.trend === "up"
                      ? "text-green-600"
                      : card.trend === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {card.trend === "up" && (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  )}
                  {card.trend === "down" && (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {card.change}
                </div>
              ) : (
                <div className={`mt-1  h-4`}></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
