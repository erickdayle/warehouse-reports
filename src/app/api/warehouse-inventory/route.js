// app/api/warehouse-inventory/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// Cache configuration
let cache = {
  data: null,
  lastFetched: null,
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Check cache
    const now = Date.now();
    if (
      cache.data &&
      cache.lastFetched &&
      now - cache.lastFetched < CACHE_DURATION
    ) {
      return NextResponse.json(cache.data);
    }

    // Initialize axios instance
    const aceApi = axios.create({
      baseURL: "https://biotechnique.pscace.com/gateway/v2",
      headers: {
        Authorization: `Bearer ${process.env.ACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Fetch ambient storage count
    const ambientResponse = await aceApi.post("/records/search", {
      aql: "SELECT COUNT(id) AS total FROM __main__ JOIN status JOIN type WHERE type.id in (177) AND status.linked_state in (259)",
    });
    const ambientCount = ambientResponse.data.data[0].attributes.total;

    // Fetch cold storage data and count by condition
    let allColdStorageData = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const coldStorageResponse = await aceApi.post(
        "/records/search",
        {
          aql: "SELECT cf_storage_condition_cold_storage FROM __main__ JOIN status JOIN type WHERE type.id in (251) AND status.linked_state in (259)",
        },
        {
          params: { page: currentPage },
        }
      );

      allColdStorageData = [
        ...allColdStorageData,
        ...coldStorageResponse.data.data,
      ];
      hasMorePages = currentPage < coldStorageResponse.data.meta.pageCount;
      currentPage++;
    }

    // Process cold storage counts
    const coldStorageCounts = allColdStorageData.reduce((counts, item) => {
      const condition = item.attributes.cf_storage_condition_cold_storage;
      counts[condition] = (counts[condition] || 0) + 1;
      return counts;
    }, {});

    // Fetch freezer shell count
    const shellResponse = await aceApi.post("/records/search", {
      aql: "SELECT COUNT(id) AS total FROM __main__ JOIN status JOIN type WHERE type.id in (215) AND status.linked_state in (259)",
    });
    const shellCount = shellResponse.data.data[0].attributes.total;

    // Fetch freezer sidecar count
    const sidecarResponse = await aceApi.post("/records/search", {
      aql: "SELECT COUNT(id) AS total FROM __main__ JOIN status JOIN type WHERE type.id in (216) AND status.linked_state in (259)",
    });
    const sidecarCount = sidecarResponse.data.data[0].attributes.total;

    // Compile final data
    const inventoryData = {
      ambient: {
        name: "Ambient (15°C to 25°C)",
        count: ambientCount,
      },
      coldStorage: [
        {
          name: "Cold Storage (-20°C)",
          count: coldStorageCounts["-20C"] || 0,
        },
        {
          name: "Cold Storage (2°C - 8°C)",
          count: coldStorageCounts["2C - 8C"] || 0,
        },
      ],
      freezer: [
        {
          name: "Freezer (Shell)",
          count: shellCount,
        },
        {
          name: "Freezer (Sidecar)",
          count: sidecarCount,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    // Update cache
    cache = {
      data: inventoryData,
      lastFetched: now,
    };

    return NextResponse.json(inventoryData);
  } catch (error) {
    console.error("API Route Error:", error);
    if (cache.data) {
      console.log("Returning cached data due to error");
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
