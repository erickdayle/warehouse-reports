import React from "react";
import useSWR from "swr";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

const WarehouseDeviations = () => {
  const {
    data: deviationData,
    error,
    isLoading,
  } = useSWR("/api/warehouse-deviations", fetcher, {
    revalidateOnFocus: false, // Don't refetch when window regains focus
    revalidateOnReconnect: false, // Don't refetch on reconnection
    refreshInterval: 60 * 60 * 1000, // Refresh every hour
    dedupingInterval: 60 * 60 * 1000, // Dedupe requests within an hour
  });

  const COLORS = [
    "#2ECC71", // Green for completed states
    "#E74C3C", // Red for initial states
    "#F1C40F", // Yellow for pending states
    "#3498DB", // Blue for in-progress states
    "#9B59B6", // Purple for extended states
    "#1ABC9C", // Turquoise for review states
    "#34495E", // Dark blue for new states
  ];

  // Process data for chart
  const processedData = React.useMemo(() => {
    if (!deviationData) return [];

    // Count status occurrences using status_name
    const statusCounts = deviationData.reduce((acc, record) => {
      const status = record.status_name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate total for percentages
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Create chart data
    return Object.entries(statusCounts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [deviationData]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-500">Loading deviation data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-red-600">Error loading data</span>
      </div>
    );
  }

  if (!processedData.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-500">No deviation data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="text-sm text-gray-600 mb-4">
        Warehouse Deviations by Status
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              outerRadius={150}
              dataKey="value"
              label={({ name, value }) => `${value}%`}
              labelLine={true}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => (
                <span className="text-sm font-medium">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WarehouseDeviations;
