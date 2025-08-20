
import type { Handler, HandlerEvent } from "@netlify/functions";
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID } = process.env;
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  throw new Error("Airtable environment variables are not set.");
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

const formatRecordForApp = (record: any): any => {
    return {
      id: record.id,
      ...record.fields,
    };
};

// Data Sanitization Layer: Remove undefined fields and truncate long strings
const sanitizeFields = (fields: any): { [key: string]: any } => {
    const sanitized: { [key: string]: any } = {};
    const MAX_STRING_LENGTH = 15000; 

    for (const key in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
            const value = fields[key];
            if (value !== undefined) { // Keep null, 0, false, but remove undefined
                if (typeof value === 'string') {
                    sanitized[key] = value.substring(0, MAX_STRING_LENGTH);
                } else {
                    sanitized[key] = value;
                }
            }
        }
    }
    return sanitized;
};


const handler: Handler = async (event: HandlerEvent) => {
  const path = event.path.replace(/\/.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const records = await table.select({ sort: [{ field: "publishDate", direction: "desc" }] }).all();
        const formattedRecords = records
          .map(formatRecordForApp)
          .filter(record => record.url && record.title);
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedRecords),
        };
      }
      case 'POST': {
        const data = JSON.parse(event.body || '{}');
        const fieldsForDb = sanitizeFields(data);

        const createdRecords = await table.create([{ fields: fieldsForDb }]);
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatRecordForApp(createdRecords[0])),
        };
      }
      case 'DELETE': {
        const idToDelete = segments[0];
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
  } catch (error: any) {
    console.error("Airtable proxy function error:", error);
    
    // Airtable errors are often objects with a 'message' property, not standard Error instances.
    // This ensures we extract the specific error message for better debugging.
    const errorMessage = error?.message || 'An unknown error occurred.';

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Airtable API operation failed.', details: errorMessage }),
    };
  }
};

export { handler };
