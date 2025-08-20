import type { Handler } from "@netlify/functions";
import type { ContentItem } from "../../../types";

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID } = process.env;

const handler: Handler = async () => {
  const missingVars = [];
  if (!AIRTABLE_API_KEY) missingVars.push('AIRTABLE_API_KEY');
  if (!AIRTABLE_BASE_ID) missingVars.push('AIRTABLE_BASE_ID');
  if (!AIRTABLE_TABLE_ID) missingVars.push('AIRTABLE_TABLE_ID');

  if (missingVars.length > 0) {
    const errorMsg = `The following required environment variables are not set: ${missingVars.join(', ')}. Please configure them in your Netlify settings.`;
    console.error(errorMsg);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }

  if (!AIRTABLE_BASE_ID.startsWith('app')) {
    const errorMsg = `Airtable Base ID seems incorrect. It must start with 'app'. Current value: '${AIRTABLE_BASE_ID}'. Please check your environment variables.`;
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
  
  if (!AIRTABLE_TABLE_ID.startsWith('tbl')) {
    const errorMsg = `Airtable Table ID seems incorrect. It must start with 'tbl'. Current value: '${AIRTABLE_TABLE_ID}'. Please check your environment variables.`;
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?sort%5B0%5D%5Bfield%5D=publishDate&sort%5B0%5D%5Bdirection%5D=desc`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: `Airtable returned status ${response.status}` }));
      console.error("Airtable API Error:", JSON.stringify(errorBody, null, 2));
      const airtableErrorMessage = errorBody.error?.message || errorBody.message || "Unknown Airtable API error";
      const detailedError = `Failed to fetch from Airtable using Base ID: '${AIRTABLE_BASE_ID}' and Table ID: '${AIRTABLE_TABLE_ID}'.\n\nAirtable says: "${airtableErrorMessage}"`;

      return {
        statusCode: 500,
        body: JSON.stringify({ error: detailedError }),
      };
    }

    const data = await response.json();
    const items: ContentItem[] = data.records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown server error occurred.";
    console.error(`Error in getContent function for Base ID: ${AIRTABLE_BASE_ID}`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

export { handler };
