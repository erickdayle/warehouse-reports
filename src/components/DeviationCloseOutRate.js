"use client";

import React from "react";
import useSWR from "swr";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

const DeviationCloseOutRate = () => {
  const { data, error, isLoading } = useSWR(
    "/api/deviation-closeout-rates",
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000, // Refresh every hour
      revalidateOnFocus: false, // Don't revalidate on window focus since this is for TV display
      dedupingInterval: 60 * 60 * 1000, // Dedupe requests within an hour
    }
  );

  const getDateRange = (data) => {
    if (!data?.dateRange) return "";

    const start = new Date(data.dateRange.start);
    const end = new Date(data.dateRange.end);

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading deviation data</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 mb-4">
        <div className="text-sm text-gray-600">
          Average days to close vs. Number of open deviations
        </div>
        <div className="text-xs text-gray-500">{getDateRange(data)}</div>
        {/* <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Closed this month</span>
            <span className="font-semibold ml-1">
              {data?.metrics?.[data.metrics.length - 1]?.closedCount || 0}{" "}
              deviations
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Currently Open</span>
            <span className="font-semibold ml-1">
              {data?.metrics?.[data.metrics.length - 1]?.openDeviations || 0}{" "}
              deviations
            </span>
          </div>
        </div> */}
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data?.metrics || []}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <ReferenceArea
              y1={30}
              y2={90}
              yAxisId="left"
              fill="#fee2e2"
              fillOpacity={0.3}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#0f172a", fontSize: 14 }}
              tickLine={{ stroke: "#0f172a" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#0f172a", fontSize: 14 }}
              tickLine={{ stroke: "#0f172a" }}
              domain={[0, 90]}
              label={{
                value: "Average Days to Close",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#0f172a", fontSize: 14 },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#0f172a", fontSize: 14 }}
              tickLine={{ stroke: "#0f172a" }}
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
              label={{
                value: "Open Deviations",
                angle: 90,
                position: "insideRight",
                style: { fill: "#0f172a", fontSize: 14 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "4px",
                fontSize: "14px",
                padding: "8px",
              }}
              formatter={(value, name, props) => {
                switch (name) {
                  case "Average Days to Close":
                    return [`${value} days`];
                  case "Target (30 days)":
                    return [`${value} days`];
                  case "Closed Deviations":
                    return [`${value} deviations`];
                  case "Open Deviations":
                    return [`${value} deviations`];
                  default:
                    return [value];
                }
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border border-gray-200 shadow-sm">
                      <p className="font-medium border-b border-gray-200 pb-1 mb-1">
                        {data.month}
                      </p>
                      <div className="space-y-1">
                        <p className="text-gray-600">
                          Open: {data.openDeviations} deviations
                        </p>
                        <p className="text-blue-600">
                          Closed: {data.closedCount} deviations
                        </p>
                        <p className="text-gray-700">
                          Average Days: {data.avgDays} days
                        </p>
                        <p className="text-red-600">
                          Target Days: {data.target} days
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "14px",
              }}
            />
            <Bar
              yAxisId="right"
              dataKey="closedCount"
              name="Closed Deviations"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar
              yAxisId="right"
              dataKey="openDeviations"
              name="Open Deviations"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgDays"
              name="Average Days to Close"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: "#2563eb", r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="target"
              name="Target (30 days)"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeviationCloseOutRate;
