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
  
  console.log(`Attempting to add to Airtable. Base ID: ${AIRTABLE_BASE_ID}, Table Name: ${AIRTABLE_TABLE_NAME}`);

  try {
    const newItemData = JSON.parse(event.body || "{}");
    
    // Airtable API는 단일 레코드 생성 시 'records' 배열 래퍼 없이 'fields' 객체만 요구할 수 있습니다.
    // 기존 'records' 배열 래핑 방식에서 이 방식으로 변경하여 API 호환성 문제를 해결합니다.
    const payload = {
      fields: newItemData
    };

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Airtable API는 여러 레코드를 생성할 때와 단일 레코드를 생성할 때 다른 페이로드 구조를 요구할 수 있습니다.
      // 여기서는 단일 레코드 생성을 시도하고 있으므로, `records` 배열로 감싸지 않은 페이로드를 전송합니다.
      body: JSON.stringify({ records: [ payload ]}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: `Airtable returned status ${response.status}` }));
      console.error("Airtable API Error:", JSON.stringify(errorBody, null, 2));
      const errorMessage = errorBody.error?.message || errorBody.message || "Unknown Airtable API error";
      // 403 Forbidden 오류는 보통 권한 문제이지만, 때로는 잘못된 요청 본문(body) 때문에 발생하기도 합니다.
      if (response.status === 403) {
          return {
              statusCode: 500,
              body: JSON.stringify({ error: `Airtable request forbidden. Check API Key, Base ID, and token permissions. Details: ${errorMessage}`})
          }
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to create record in Airtable: ${errorMessage}` }),
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
