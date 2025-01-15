"use client";

import DeviationCloseOutRate from "@/components/DeviationCloseOutRate";
import WarehouseDeviations from "@/components/WarehouseDeviations";
import WarehouseInventoryStatus from "@/components/WarehouseInventoryStatus";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="p-6">
        {/* Page Title */}
        <h1 className="text-5xl font-bold text-center text-[#0f172a] mb-10">
          Warehouse Reports
        </h1>

        {/* All Reports Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Row 1 - Column 1: Warehouse Deviations */}
          <div className="dashboard-card min-h-[600px]">
            <div className="p-6">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-6">
                Warehouse Deviations
              </h2>
              <div className="h-[500px]">
                <WarehouseDeviations />
              </div>
            </div>
          </div>

          {/* Row 1 - Column 2: Close-Out Rate */}
          <div className="dashboard-card min-h-[600px]">
            <div className="p-6">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-6">
                Warehouse Deviations Close-Out Rate
              </h2>
              <DeviationCloseOutRate />
            </div>
          </div>

          {/* Row 2 - Full Width: Combined Inventory */}
          <div className="dashboard-card min-h-[600px] xl:col-span-2">
            <div className="p-6">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-6">
                Closed - Available Inventory Records
              </h2>
              <WarehouseInventoryStatus />
            </div>
          </div>

          {/* Row 3 - Column 1: BT Inventory */}
          <div className="dashboard-card min-h-[600px]">
            <div className="p-6">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-6">
                BT Inventory
              </h2>
              <div className="h-[500px] bg-[#f1f5f9] rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xl">Chart Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Row 3 - Column 2: Training Compliance */}
          <div className="dashboard-card min-h-[600px]">
            <div className="p-6">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-6">
                Training Compliance for Warehouse
              </h2>
              <div className="h-[500px] bg-[#f1f5f9] rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xl">Chart Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
