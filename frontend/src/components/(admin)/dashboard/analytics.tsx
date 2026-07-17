import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Users,
  TrendingUp,
  XCircle,
  RefreshCcw,
  Ban,
  Clock,
  PackageCheck,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/authContext";
import MiniLoader from "../ui/miniLoader";
import { useFilter } from "./dashboardFilterContext";
import StatCard, { StatCardData } from "./StatCard";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getAnalytics = async (
  signal: AbortSignal,
  filterType: string,
  fetchParam: string,
  date?: string,
  startDate?: string,
  endDate?: string,
  repId?: string
) => {
  const response = await fetch(
    `${apiUrl}/booking/admin/analytics${
      repId ? `/${repId}` : ""
    }?filterType=${filterType}&fetchParam=${fetchParam}${date ? `&date=${date}` : ""}${
      startDate ? `&startDate=${startDate}` : ""
    }${endDate ? `&endDate=${endDate}` : ""}`,
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

// Booking-level completion, distinct from STATUS_LIST above (which counts
// individual calls). A booking with 3 recipients contributes exactly one
// entry here, not up to three — "how many orders are still incomplete"
// rather than "how many calls are left to place".
export const BOOKING_STATUS_LIST = [
  {
    key: "pending",
    label: "Pending",
    icon: <RefreshCcw className="h-4 w-4 md:h-6 md:w-6" />,
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: <Clock className="h-4 w-4 md:h-6 md:w-6" />,
  },
  {
    key: "completed",
    label: "Completed",
    icon: <PackageCheck className="h-4 w-4 md:h-6 md:w-6" />,
  },
];

export default function Analytics() {
  const { user } = useAdminAuth();

  const {
    appliedFilterType,
    appliedDate,
    appliedEndDate,
    appliedStartDate,
    appliedFetchParam,
    repId,
  } = useFilter();

  console.log("appliedFetchParam", appliedFetchParam);

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "analytics",
      appliedFilterType,
      appliedDate,
      appliedStartDate,
      appliedEndDate,
      appliedFetchParam,
      repId || null,
    ],
    queryFn: ({ signal }) =>
      getAnalytics(
        signal,
        appliedFilterType,
        appliedFetchParam,
        appliedDate,
        appliedStartDate,
        appliedEndDate,
        repId
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

  const bookingStatusCounts: Record<string, number> = {};

  BOOKING_STATUS_LIST.forEach((status) => {
    bookingStatusCounts[status.key] = 0;
  });

  if (data?.bookingBreakdown) {
    data.bookingBreakdown.forEach((item: { _id: string; count: number }) => {
      bookingStatusCounts[item._id] = item.count;
    });
  }

  const bookingCompletionCards = BOOKING_STATUS_LIST.map((status) => ({
    title: `${status.label} Bookings`,
    value: bookingStatusCounts[status.key],
    icon: status.icon,
    href: `/admin/bookings?bookingStatus=${status.key}`,
  }));

  const cards: Omit<StatCardData, "hidden">[] = [
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
    // Labeled "Calls", not "Bookings" — a multi-recipient v2 booking
    // contributes one tally entry per recipient's call outcome, so this is a
    // per-call breakdown, not a distinct-booking count.
    ...STATUS_LIST.map((status) => ({
      title: `${status.label} Calls`,
      value: statusCounts[status.key],
      icon: status.icon,
      href: `/admin/bookings?status=${status.key}`,
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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            {...card}
            hidden={
              ((user?.role === "callrep" || !!repId) &&
                card.title === "Active Reps") ||
              (user?.role !== "superadmin" && card.title === "Total Revenue")
            }
          />
        ))}
      </div>

      {/* Booking Completion — separate from the per-call breakdown above:
          this counts distinct orders (bookingStatus), not individual calls,
          since a multi-recipient booking otherwise never shows up as a
          single line item anywhere. */}
      <div>
        <h3 className="text-sm md:text-md font-semibold text-gray-500 mb-3">
          Booking Completion
        </h3>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
          {bookingCompletionCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
