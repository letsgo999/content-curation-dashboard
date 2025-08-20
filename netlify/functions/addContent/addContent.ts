import type { Handler } from "@netlify/functions";
import type { ContentItem } from "../../../types";

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    const errorMsg = "Airtable environment variables are not set.";
    console.error(errorMsg);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }

  if (!AIRTABLE_BASE_ID.startsWith('app')) {
    const errorMsg = `Airtable Base ID seems incorrect. It should start with 'app'. Current value: '${AIRTABLE_BASE_ID}'. Please check your environment variables.`;
    console.error(errorMsg);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }

  try {
    const newItemData = JSON.parse(event.body || "{}");
    
    const payload = {
      records: [
        {
          fields: newItemData,
        },
      ],
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
      const errorBody = await response.json().catch(() => ({ message: `Airtable returned status ${response.status}` }));
      console.error("Airtable API Error:", JSON.stringify(errorBody, null, 2));
      const airtableErrorMessage = errorBody.error?.message || errorBody.message || "Unknown Airtable API error";
      const detailedError = `Failed to create record in Airtable using Base ID: '${AIRTABLE_BASE_ID}' and Table Name: '${AIRTABLE_TABLE_NAME}'.\n\nAirtable says: "${airtableErrorMessage}"`;

      return {
        statusCode: 500,
        body: JSON.stringify({ error: detailedError }),
      };
    }
    
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
    const errorMessage = error instanceof Error ? error.message : "Unknown server error occurred.";
    console.error(`Error in addContent function for Base ID: ${AIRTABLE_BASE_ID}`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

export { handler };
