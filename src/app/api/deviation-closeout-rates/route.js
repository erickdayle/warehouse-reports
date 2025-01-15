// app/api/deviation-closeout-rates/route.js
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

    // Fetch data from ACE API
    let allDeviations = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await axios.post(
          "https://biotechnique.pscace.com/gateway/v2/records/search",
          {
            aql: `SELECT pkey, title, status_id, date_created, cf_deviation_clos_date 
                  FROM __main__ 
                  WHERE project_id eq 31 
                  AND initiator_id in (61, 232)`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.ACE_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            params: { page: currentPage },
          }
        );

        if (!response.data || !response.data.data) {
          console.error("Invalid API response structure:", response.data);
          throw new Error("Invalid API response structure");
        }

        const { data, meta } = response.data;
        allDeviations = [...allDeviations, ...data];

        hasMorePages = currentPage < meta.pageCount;
        currentPage++;
      } catch (apiError) {
        console.error("ACE API Error:", apiError);
        throw new Error("Failed to fetch data from ACE API");
      }
    }

    console.log("Total deviations fetched:", allDeviations.length);

    // Process the data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = {};

    // Initialize monthly buckets
    months.forEach((month) => {
      monthlyData[month] = {
        closedDeviations: [],
        openDeviations: new Set(),
      };
    });

    // Process deviations
    allDeviations.forEach((deviation) => {
      try {
        if (!deviation.attributes) {
          console.error("Deviation missing attributes:", deviation);
          return;
        }

        const attrs = deviation.attributes;
        const createDate = new Date(attrs.date_created);
        const closeDate = attrs.cf_deviation_clos_date
          ? new Date(attrs.cf_deviation_clos_date)
          : null;
        const createMonth = createDate.getMonth();

        if (closeDate) {
          // Deviation is closed
          const closeMonth = closeDate.getMonth();
          const daysToClose = Math.ceil(
            (closeDate - createDate) / (1000 * 60 * 60 * 24)
          );
          monthlyData[months[closeMonth]].closedDeviations.push(daysToClose);

          // Add to open deviations for months between creation and closure
          for (let i = createMonth; i < closeMonth; i++) {
            monthlyData[months[i]].openDeviations.add(attrs.pkey);
          }
        } else {
          // Deviation is open
          // For open deviations, carry forward from creation month to current month
          for (let i = createMonth; i < 12; i++) {
            monthlyData[months[i]].openDeviations.add(attrs.pkey);
          }
        }
      } catch (processError) {
        console.error("Error processing deviation:", processError);
      }
    });

    // Calculate final metrics
    const metrics = months.map((month) => {
      const { closedDeviations, openDeviations } = monthlyData[month];
      const avgDays =
        closedDeviations.length > 0
          ? Math.round(
              closedDeviations.reduce((a, b) => a + b, 0) /
                closedDeviations.length
            )
          : 0;

      return {
        month,
        avgDays,
        openDeviations: openDeviations.size,
        closedCount: closedDeviations.length,
        target: 30,
      };
    });

    const processedData = {
      metrics,
      dateRange: {
        start: new Date(2023, 0, 1).toISOString(), // January 2023
        end: new Date().toISOString(), // Current date
      },
    };

    // Update cache
    cache = {
      data: processedData,
      lastFetched: now,
    };

    console.log("Processed metrics:", processedData);
    return NextResponse.json(processedData);
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
