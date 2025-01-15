import React from "react";
import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

const WarehouseInventoryStatus = () => {
  const { data, error, isLoading } = useSWR(
    "/api/warehouse-inventory",
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 60 * 60 * 1000,
    }
  );

  // Process data for the chart
  const chartData = React.useMemo(() => {
    if (!data) return [];

    const formattedData = [
      {
        name: "15°C to 25°C",
        value: parseInt(data.ambient.count),
        fullName: data.ambient.name,
        color: "#2ECC71", // Vibrant Green
      },
      ...data.coldStorage.map((item) => ({
        name: item.name.match(/\((.*?)\)/)[1],
        value: parseInt(item.count),
        fullName: item.name,
        color: item.name.includes("-20°C") ? "#E74C3C" : "#F1C40F", // Red for -20C, Yellow for 2C-8C
      })),
      ...data.freezer.map((item) => ({
        name: item.name.match(/\((.*?)\)/)[1],
        value: parseInt(item.count),
        fullName: item.name,
        color: item.name.includes("Shell") ? "#3498DB" : "#9B59B6", // Blue for Shell, Purple for Sidecar
      })),
    ];

    return formattedData;
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading inventory data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading inventory data</div>
      </div>
    );
  }

  const getLastUpdated = () => {
    if (!data?.timestamp) return "";
    const date = new Date(data.timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-600">Count: {data.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 mb-4">
        <div className="text-sm text-gray-600">
          Available Inventory Records by Storage Type
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {getLastUpdated()}
        </div>
      </div>
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom: 90,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#0f172a", fontSize: 20, fontWeight: 500 }}
              tickLine={{ stroke: "#0f172a" }}
              interval={0}
              height={100}
            />
            <YAxis
              tick={{ fill: "#0f172a", fontSize: 14 }}
              tickLine={{ stroke: "#0f172a" }}
              label={{
                value: "Number of Items",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#0f172a", fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Count"
              radius={[4, 4, 0, 0]}
              label={(props) => {
                const { x, y, width, height, value } = props;
                const radius = 10;
                return (
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={20}
                    fontWeight="bold"
                  >
                    {value.toLocaleString()}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WarehouseInventoryStatus;
