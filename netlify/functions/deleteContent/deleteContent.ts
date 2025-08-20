import type { Handler } from "@netlify/functions";

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
        const { id } = JSON.parse(event.body || '{}');
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: "Record ID is required" }) };
        }

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Airtable returned status ${response.status}` }));
            console.error("Airtable API Error:", JSON.stringify(errorBody, null, 2));
            const airtableErrorMessage = errorBody.error?.message || errorBody.message || "Unknown Airtable API error";
            const detailedError = `Failed to delete record in Airtable using Base ID: '${AIRTABLE_BASE_ID}' and Table Name: '${AIRTABLE_TABLE_NAME}'.\n\nAirtable says: "${airtableErrorMessage}"`;
            
            return {
                statusCode: 500,
                body: JSON.stringify({ error: detailedError }),
            };
        }
        
        const deletedRecord = await response.json();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: deletedRecord.id }),
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown server error occurred.";
        console.error(`Error in deleteContent function for Base ID: ${AIRTABLE_BASE_ID}`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};

export { handler };
