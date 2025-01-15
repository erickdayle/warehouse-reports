import React from "react";
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
} from "recharts";

const DeviationCloseOutTime = () => {
  // Adjusted data with more realistic number of open deviations
  const data = [
    { month: "Jan", avgDays: 45, target: 30, openDeviations: 8 },
    { month: "Feb", avgDays: 42, target: 30, openDeviations: 10 },
    { month: "Mar", avgDays: 38, target: 30, openDeviations: 12 },
    { month: "Apr", avgDays: 35, target: 30, openDeviations: 9 },
    { month: "May", avgDays: 32, target: 30, openDeviations: 7 },
    { month: "Jun", avgDays: 36, target: 30, openDeviations: 11 },
    { month: "Jul", avgDays: 33, target: 30, openDeviations: 8 },
    { month: "Aug", avgDays: 34, target: 30, openDeviations: 6 },
    { month: "Sep", avgDays: 31, target: 30, openDeviations: 5 },
    { month: "Oct", avgDays: 29, target: 30, openDeviations: 4 },
    { month: "Nov", avgDays: 28, target: 30, openDeviations: 3 },
    { month: "Dec", avgDays: 27, target: 30, openDeviations: 3 },
  ];

  return (
    <div className="w-full h-full">
      <div className="text-sm text-gray-600 mb-4">
        Average days to close vs. Number of open deviations
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#0f172a", fontSize: 14 }}
              tickLine={{ stroke: "#0f172a" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#0f172a", fontSize: 14 }}
              tickLine={{ stroke: "#0f172a" }}
              domain={[0, 50]}
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
              domain={[0, 15]} // Adjusted scale for fewer deviations
              label={{
                value: "Open Deviations",
                angle: 90,
                position: "insideRight",
                style: { fill: "#0f172a", fontSize: 14 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              formatter={(value, name) => {
                if (name === "Average Days to Close" || name === "Target")
                  return [`${value} days`];
                return [`${value} days`];
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "14px",
              }}
            />
            <Bar
              yAxisId="right"
              dataKey="openDeviations"
              name="Open Deviations"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
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

export default DeviationCloseOutTime;
