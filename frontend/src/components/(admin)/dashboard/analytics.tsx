import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
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
import { formatToYMD } from "@/lib/formatDate";

type FilterType = "daily" | "weekly" | "monthly" | "custom";

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

const STATUS_LIST = [
  {
    key: "pending",
    label: "Pending",
    icon: <RefreshCcw className="h-6 w-6" />,
  },
  {
    key: "successful",
    label: "Successful",
    icon: <CheckCircle className="h-6 w-6" />,
  },
  { key: "rejected", label: "Rejected", icon: <Ban className="h-6 w-6" /> },
  {
    key: "rescheduled",
    label: "Rescheduled",
    icon: <Calendar className="h-6 w-6" />,
  },
  {
    key: "unsuccessful",
    label: "Unsuccessful",
    icon: <XCircle className="h-6 w-6" />,
  },
];

const filterOptions = [
  {
    key: "daily",
    label: "Daily",
  },
  {
    key: "weekly",
    label: "Weekly",
  },
  {
    key: "monthly",
    label: "Monthly",
  },
  {
    key: "custom",
    label: "Custom",
  },
];

export default function Analytics() {
  const { user } = useAdminAuth();

  const getDefaultDate = () => format(new Date(), "yyyy-MM-dd");
  const getDefaultWeek = () => format(new Date(), "yyyy-'W'II");
  const getDefaultMonth = () => format(new Date(), "yyyy-MM");

  const [filterType, setFilterType] = useState<FilterType>("daily");
  const [date, setDate] = useState(() => {
    if (filterType === "weekly") return getDefaultWeek();
    if (filterType === "monthly") return getDefaultMonth();
    return getDefaultDate();
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Applied states for query
  const [appliedFilterType, setAppliedFilterType] =
    useState<FilterType>(filterType);
  const [appliedDate, setAppliedDate] = useState(date);
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const { data, error, isLoading } = useQuery({
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
    staleTime: 0.5 * 60 * 1000,
  });

  const handleFilterChnage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterType;
    setFilterType(value);

    if (value === "weekly") setDate(getDefaultWeek());
    else if (value === "monthly") setDate(getDefaultMonth());
    else setDate(getDefaultDate());

    setStartDate("");
    setEndDate("");

    if (value === "custom") {
      setDate("");
      setStartDate(getDefaultDate());
      setEndDate(getDefaultDate());
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilterType(filterType);
    setAppliedDate(date);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  // Prepare status counts, ensuring all statuses are present
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
      icon: <Calendar className="h-6 w-6" />,
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
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: "Active Reps",
      value: data?.activeRepsCount ?? "-",
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-8">
      <form className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
          <label className="text-gray-700 font-medium">Filter: </label>
          <select
            name="filterType"
            className="px-4 py-2 border border-gray-300 rounded-lg flex focus:ring-2 focus:ring-brand-end focus:border-transparent"
            onChange={handleFilterChnage}
            value={filterType}
            required
          >
            {filterOptions.map((option) => {
              return (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              );
            })}
          </select>
        </div>

        {filterType === "daily" && (
          <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
            <label className="text-gray-700 font-medium">Date: </label>
            <input
              type="date"
              name="date"
              className="px-4 py-2 border border-gray-300 rounded-lg flex focus:ring-2 focus:ring-brand-end focus:border-transparent"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              value={date}
            />
          </div>
        )}

        {filterType === "custom" && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-row items-center space-x-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">Start Date: </label>
              <input
                type="date"
                name="startDate"
                className="px-4 py-2 border border-gray-300 rounded-lg flex focus:ring-2 focus:ring-brand-end focus:border-transparent"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
                value={startDate}
              />
            </div>

            <div className="flex flex-row items-center space-x-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">End Date: </label>
              <input
                type="date"
                name="endDate"
                className="px-4 py-2 border border-gray-300 rounded-lg flex focus:ring-2 focus:ring-brand-end focus:border-transparent"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEndDate(e.target.value)
                }
                value={endDate}
              />
            </div>
          </div>
        )}

        {filterType === "weekly" && (
          <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
            <label className="text-gray-700 font-medium">Week: </label>
            <input
              type="week"
              name="week"
              className="px-4 py-2 border border-gray-300 rounded-lg flex focus:ring-2 focus:ring-brand-end focus:border-transparent"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              value={date}
            />
          </div>
        )}

        {filterType === "monthly" && (
          <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
            <label className="text-gray-700 font-medium">Month: </label>
            <input
              type="month"
              name="month"
              className="px-4 py-2 border border-gray-300 rounded-lg flex focus:ring-2 focus:ring-brand-end focus:border-transparent"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              value={date}
            />
          </div>
        )}

        <div className="w-full lg:w-auto">
          <button
            className="btn-primary h-10 rounded-lg flex justify-center items-center"
            onClick={handleApplyFilter}
            disabled={isLoading}
          >
            Apply
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex w-full justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-end mr-2"></div>
          Loading
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="card p-6 flex flex-col items-start justify-center w-full h-full gap-2">
              <div className="text-md font-semibold text-gray-500">
                {card.title}
              </div>
              <div className="w-full flex flex-row items-center justify-between">
                <div className="text-2xl font-bold">{card.value}</div>

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
