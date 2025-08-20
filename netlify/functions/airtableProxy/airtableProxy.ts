
import type { Handler, HandlerEvent } from "@netlify/functions";
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID } = process.env;
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  throw new Error("Airtable environment variables are not set.");
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

// --- Platform Name Translation Layer ---
// Maps internal app platform names (English) to Airtable-friendly names (Korean)
const PLATFORM_APP_TO_DB: Record<string, string> = {
  'YouTube': '유튜브',
  'Facebook': '페이스북',
  'Blog': '블로그',
  'KakaoTalk': '카카오톡',
};

// Maps Airtable names (Korean) back to internal app names (English)
const PLATFORM_DB_TO_APP: Record<string, string> = Object.fromEntries(
  Object.entries(PLATFORM_APP_TO_DB).map(([key, value]) => [value, key])
);

const formatRecordForApp = (record: any): any => {
    const fields = record.fields;
    // Translate platform name from DB (Korean) to App (English)
    if (fields.platform && PLATFORM_DB_TO_APP[fields.platform]) {
        fields.platform = PLATFORM_DB_TO_APP[fields.platform];
    }
    return {
      id: record.id,
      ...fields,
    };
};

const formatDataForDb = (data: any): any => {
    const fields = { ...data };
    // Translate platform name from App (English) to DB (Korean)
    if (fields.platform && PLATFORM_APP_TO_DB[fields.platform]) {
        fields.platform = PLATFORM_APP_TO_DB[fields.platform];
    }
    return fields;
}


const handler: Handler = async (event: HandlerEvent) => {
  const path = event.path.replace(/\/.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const records = await table.select({ sort: [{ field: "publishDate", direction: "desc" }] }).all();
        const formattedRecords = records
          .map(formatRecordForApp) // Use the new formatting function
          .filter(record => record.url && record.title); // Filter out incomplete records
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedRecords),
        };
      }
      case 'POST': {
        const data = JSON.parse(event.body || '{}');
        const fieldsForDb = formatDataForDb(data);
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
