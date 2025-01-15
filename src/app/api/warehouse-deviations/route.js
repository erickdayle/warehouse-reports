import { NextResponse } from "next/server";
import axios from "axios";

// Simple in-memory cache
let cache = {
  data: null,
  lastFetched: null,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (
      cache.data &&
      cache.lastFetched &&
      now - cache.lastFetched < CACHE_DURATION
    ) {
      return NextResponse.json(cache.data);
    }

    // If no cache or expired, fetch new data
    let allDeviations = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const deviationsResponse = await axios.post(
        "https://biotechnique.pscace.com/gateway/v2/records/search",
        {
          aql: `SELECT pkey, title, status_id FROM __main__ WHERE project_id eq 31 AND initiator_id in (61, 232)`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ACE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          params: { page: currentPage },
        }
      );

      const { data, meta } = deviationsResponse.data;
      allDeviations = [...allDeviations, ...data];

      hasMorePages = currentPage < meta.pageCount;
      currentPage++;
    }

    // Get all unique workflow step IDs
    const workflowStepIds = new Set(
      allDeviations.map((record) => record.attributes.status_id)
    );

    // Fetch workflow step texts
    const workflowStepTexts = {};
    for (const stepId of workflowStepIds) {
      const stepResponse = await axios.get(
        `https://biotechnique.pscace.com/gateway/v2/workflow-steps/${stepId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ACE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      workflowStepTexts[stepId] = stepResponse.data.data.attributes.text;
    }

    // Combine the data
    const enrichedData = allDeviations.map((record) => ({
      pkey: record.attributes.pkey,
      title: record.attributes.title,
      status_id: record.attributes.status_id,
      status_name: workflowStepTexts[record.attributes.status_id],
    }));

    // Update cache
    cache = {
      data: enrichedData,
      lastFetched: now,
    };

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    // If error occurs and we have cached data, return it even if expired
    if (cache.data) {
      console.log("Returning cached data due to error");
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      { message: error.response?.data?.message || "Internal server error" },
      { status: error.response?.status || 500 }
    );
  }
}
