import React from 'react';
import { ContentItem, Platform } from './types';

export const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

export const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22,12c0-5.523-4.477-10-10-10S2,6.477,2,12c0,4.99,3.657,9.128,8.438,9.878V14.89h-2.54V12h2.54V9.797 c0-2.506,1.492-3.89,3.777-3.89c1.094,0,2.238,0.195,2.238,0.195v2.46h-1.26c-1.24,0-1.628,0.772-1.628,1.562V12h2.773l-0.443,2.89h-2.33V21.878C18.343,21.128,22,16.99,22,12z" />
  </svg>
);

export const BlogIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zM12 9a1 1 0 0 1-2 0V7h2v2zm-2-4h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2zm8 11H6v-2h12v2zm0-4H6v-2h12v2zm-4-4H6V8h8v2z"/>
    </svg>
);


export const PLATFORM_DETAILS = {
  [Platform.YouTube]: {
    name: '유튜브',
    Icon: YouTubeIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  [Platform.Facebook]: {
    name: '페이스북',
    Icon: FacebookIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  [Platform.Blog]: {
    name: '블로그',
    Icon: BlogIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
};

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [];
