import type { ContentItem } from '../types';

const API_ENDPOINT = '/.netlify/functions/airtableProxy';

// Helper to handle fetch responses and errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ 
      error: 'Airtable proxy error', 
      details: 'Could not parse error response body.' 
    }));
    console.error('API Error:', errorBody);
    throw new Error(errorBody.details || errorBody.error || 'An unknown API error occurred.');
  }
  return response.json();
};


export const fetchContentItems = async (): Promise<ContentItem[]> => {
  const response = await fetch(API_ENDPOINT);
  return handleResponse(response);
};

export const addContentItem = async (item: Omit<ContentItem, 'id'>): Promise<ContentItem> => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  return handleResponse(response);
};

export const deleteContentItem = async (id: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};
