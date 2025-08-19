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

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: '1',
    platform: Platform.Blog,
    url: 'https://sonet.kr/6368/',
    title: 'AI를 ‘파트너’로 만드는 법 – 의존에서 성장으로 | 생산적생산자',
    description: 'AI에게 정답을 기대하는 자세에서 벗어나 ‘질문하는 방식’을 바꾸고, 초/중/고급 레벨별 역할 분담과 [독서→연결→생산] 워크플로로 AI를 진짜 파트너로 만드는 법을 알아봅니다.',
    publishDate: '2025-08-18',
    views: 1540,
    likes: 23,
    rating: 4,
    author: 'AI 코칭',
  },
  {
    id: '2',
    platform: Platform.YouTube,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: '최고의 디마불사 No.204회 _2025.8.08 #메이크_카카오톡채널 챗봇이 챗GPT와 한몸으로!',
    description: '귀찮은 송년회 챙기는 분 온라인은 말이 많습니다만... 어제가 또 연말. 내일이 정말 연말입니다. 오늘 저녁 8시에 2시간에 걸친 챗GPT의 모든것 총정리 2024 연말결산 온라인...',
    publishDate: '2025-08-16',
    views: 12030,
    likes: 1200,
    rating: 5,
    author: '디마불사',
  },
  {
    id: '3',
    platform: Platform.YouTube,
    url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    title: '최규문의 디마불사 No.203회 _2025.7.25 #카톡채널_카카오톡채널 챗봇이 챗GPT와 한몸으로!',
    description: '오늘은 지난 한달 남짓 보름을 하면서 도전했던 카카오톡 채널 챗봇에 챗GPT를 이용하여 AI 챗봇을 연결하여 24시간 자동으로 응답하게 하는 셋팅 방법을 공유합니다.',
    publishDate: '2025-08-15',
    views: 8750,
    likes: 980,
    rating: 5,
    author: '디마불사',
  },
  {
    id: '4',
    platform: Platform.Facebook,
    url: 'https://www.facebook.com/letsgo99/',
    title: '디지털 마케팅 트렌드 2025: AI와 자동화',
    description: '2025년 디지털 마케팅의 핵심은 AI와 자동화입니다. 개인화된 고객 경험을 제공하고, 데이터 기반의 의사결정을 내리는 것이 중요해졌습니다. 여러분의 비즈니스는 준비되셨나요?',
    publishDate: '2025-08-14',
    views: 88,
    likes: 15,
    rating: 4,
    author: '최규문',
  },
  {
    id: '5',
    platform: Platform.Blog,
    url: 'https://sonet.kr/6360/',
    title: '[AI는생활이다 No.18] 무엇을 읽을까 무엇을 물을까 주저하지 말라, 즐거운 답찾기...',
    description: '#AI는생활이다 No.18_250806. 무엇을 읽을까 무엇을 물을까 주저하지 말라, 즐거운 답찾기... 요즘 전문가가 되기 일쑤인 전지적 일개미 시점의 간판이며 메뉴판이며...',
    publishDate: '2025-08-12',
    views: 980,
    likes: 12,
    rating: 3,
    author: 'AI 코칭',
  },
   {
    id: '6',
    platform: Platform.Facebook,
    url: 'https://www.facebook.com/letsgo99/',
    title: '성공적인 페이스북 광고 캠페인을 위한 5가지 팁',
    description: '타겟 고객을 정확히 설정하고, 매력적인 광고 크리에이티브를 만드세요. A/B 테스트를 통해 성과를 최적화하고, 픽셀을 활용하여 전환을 추적하는 것이 중요합니다.',
    publishDate: '2025-08-10',
    views: 150,
    likes: 28,
    rating: 4,
    author: '최규문',
  },
];
