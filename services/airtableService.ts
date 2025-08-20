import type { ContentItem } from '../types';

const API_ENDPOINT = '/.netlify/functions/airtableProxy';

export const fetchContentItems = async (): Promise<ContentItem[]> => {
  const response = await fetch(API_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch content from Airtable.');
  }
  return response.json();
};

export const addContentItem = async (item: Omit<ContentItem, 'id'>): Promise<ContentItem> => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to add content to Airtable.');
  }
  return response.json();
};

export const deleteContentItem = async (id: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete content from Airtable.');
  }
  return response.json();
};
