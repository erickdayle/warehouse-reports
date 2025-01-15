// services/aceApi.js
import axios from "axios";

class AceApiService {
  constructor(baseUrl, token) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Method to fetch all pages of data
  async searchAll(aql) {
    try {
      let allData = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await this.axiosInstance.post(
          "/records/search",
          { aql },
          { params: { page: currentPage } }
        );

        const { data, meta } = response.data;
        allData = [...allData, ...data];
        hasMorePages = currentPage < meta.pageCount;
        currentPage++;
      }

      return allData.map((record) => record.attributes);
    } catch (error) {
      console.error("Search failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // Warehouse deviations specific search
  async getWarehouseDeviations(projectId, initiatorIds) {
    const aql = `
      SELECT id as pkey, title, status_id, initiator_id 
      FROM __main__ 
      WHERE project_id eq ${projectId} 
      AND initiator_id in (${initiatorIds.join(", ")})
    `;

    return this.searchAll(aql);
  }
}

// Create and export singleton instance
export const aceApi = new AceApiService(
  process.env.NEXT_PUBLIC_ACE_API_URL || "",
  process.env.NEXT_PUBLIC_ACE_TOKEN || ""
);
