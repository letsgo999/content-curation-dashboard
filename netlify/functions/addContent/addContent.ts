import type { Handler } from "@netlify/functions";
import type { ContentItem } from "../../../types";

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Airtable environment variables are not set." }),
    };
  }

  try {
    const newItemData = JSON.parse(event.body || "{}");
    // Airtable API for creating records expects data to be wrapped in a "records" array.
    const payload = {
      records: [{
        fields: newItemData,
      }],
    };

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Airtable API Error:", errorBody);
      const errorMessage = errorBody.error?.message || response.statusText;
      throw new Error(`Failed to create record in Airtable: ${errorMessage}`);
    }

    // The API returns a "records" array, even for a single creation.
    const newRecordsData = await response.json();
    const newRecord = newRecordsData.records[0];
    const createdItem: ContentItem = {
      id: newRecord.id,
      ...newRecord.fields,
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createdItem),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error creating content" }),
    };
  }
};

export { handler };
