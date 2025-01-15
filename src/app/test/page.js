// app/test/page.js
"use client";

import { useEffect } from "react";
import axios from "axios";

export default function TestQuery() {
  useEffect(() => {
    const testQuery = async () => {
      try {
        // Using the proxy path instead of direct URL
        const response = await axios.post(
          "/api/ace/records/search",
          {
            aql: "SELECT id as pkey, title, status_id, initiator_id FROM __main__ WHERE project_id eq 31 AND initiator_id in (88, 288)",
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACE_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Full response:", response);
        console.log("Data array:", response.data.data);
        console.log(
          "First record attributes:",
          response.data.data[0]?.attributes
        );
      } catch (error) {
        console.error("Error details:", error.response?.data || error.message);
      }
    };

    testQuery();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Testing ACE Query</h1>
      <p>Check the browser console for results</p>
    </div>
  );
}
