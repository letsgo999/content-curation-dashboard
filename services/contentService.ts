import type { ContentItem } from '../types';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const fetchContentItems = async (): Promise<ContentItem[]> => {
  const response = await fetch('/.netlify/functions/getContent');
  return handleResponse(response);
};

export const createContentItem = async (item: Omit<ContentItem, 'id'>): Promise<ContentItem> => {
  const response = await fetch('/.netlify/functions/addContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(response);
};

export const removeContentItem = async (id: string): Promise<{ id: string }> => {
  const response = await fetch('/.netlify/functions/deleteContent', {
    method: 'POST', // Using POST for simplicity to send a body
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return handleResponse(response);
};
