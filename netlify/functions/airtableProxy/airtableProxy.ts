import type { Handler, HandlerEvent } from "@netlify/functions";
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID } = process.env;
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  throw new Error("Airtable environment variables are not set.");
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

const formatRecord = (record: any): any => ({
  id: record.id,
  ...record.fields,
});

const handler: Handler = async (event: HandlerEvent) => {
  const path = event.path.replace(/\/.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const records = await table.select({ sort: [{ field: "publishDate", direction: "desc" }] }).all();
        const formattedRecords = records
          .map(formatRecord)
          .filter(record => record.url && record.title); // Filter out incomplete records
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedRecords),
        };
      }
      case 'POST': {
        const data = JSON.parse(event.body || '{}');
        const createdRecords = await table.create([{ fields: data }]);
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatRecord(createdRecords[0])),
        };
      }
      case 'DELETE': {
        const idToDelete = segments[0]; // Correctly get ID from the first path segment
        if (!idToDelete) {
          return { statusCode: 400, body: 'Record ID is required for deletion.' };
        }
        const deletedRecords = await table.destroy([idToDelete]);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deletedRecords[0].id }),
        };
      }
      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error("Airtable proxy function error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request.', details: errorMessage }),
    };
  }
};

export { handler };
