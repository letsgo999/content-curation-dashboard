
import React from 'react';
import { Platform, SortOrder } from '../types';
import { PLATFORM_DETAILS } from '../constants';

type HeaderProps = {
  activeFilter: Platform | 'all';
  onFilterChange: (filter: Platform | 'all') => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  onAddContent: () => void;
};

const Header: React.FC<HeaderProps> = ({ activeFilter, onFilterChange, sortOrder, onSortChange, onAddContent }) => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${'일월화수목금토'[today.getDay()]})`;

  const filters: (Platform | 'all')[] = ['all', Platform.YouTube, Platform.Facebook, Platform.KakaoTalk, Platform.Blog];
  const filterNames = {
    all: '전체',
    [Platform.YouTube]: PLATFORM_DETAILS[Platform.YouTube].name,
    [Platform.Facebook]: PLATFORM_DETAILS[Platform.Facebook].name,
    [Platform.KakaoTalk]: PLATFORM_DETAILS[Platform.KakaoTalk].name,
    [Platform.Blog]: PLATFORM_DETAILS[Platform.Blog].name,
  };

  return (
    <header className="bg-white p-4 sm:p-6 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">디마불사 콘텐츠 큐레이션</h1>
            <p className="text-sm text-gray-500">디지털 마케팅 & AI 활용 주간 인기 콘텐츠</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">최근 업데이트</p>
            <p className="font-semibold text-gray-800">{formattedDate}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {filters.map((filter) => {
            const platformDetails = filter !== 'all' ? PLATFORM_DETAILS[filter] : null;
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {platformDetails && <platformDetails.Icon className="w-4 h-4" />}
                {filterNames[filter]}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">최신 콘텐츠 큐레이션</h2>
                <p className="text-xs text-gray-500">업데이트 시각 기준 정렬</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value as SortOrder)}
                    className="w-full sm:w-auto bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <option value="newest">최신순</option>
                    <option value="oldest">오래된순</option>
                </select>
                <button
                    onClick={onAddContent}
                    className="w-full sm:w-auto flex-shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    콘텐츠 추가
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
