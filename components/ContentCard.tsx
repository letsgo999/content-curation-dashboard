import React, { useState, useRef, useEffect } from 'react';
import type { ContentItem } from '../types';
import { PLATFORM_DETAILS } from '../constants';

type ContentCardProps = {
  item: ContentItem;
  onDelete: (id: string) => void;
  onShare: (url: string, title: string) => void;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
            ))}
            <span className="text-gray-600 text-xs ml-1">{rating}/5</span>
        </div>
    );
};


const MoreMenu: React.FC<{ onShare: () => void; onDelete: () => void; }> = ({ onShare, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-800">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10">
          <div className="py-1">
            <button onClick={() => { onShare(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
              공유
            </button>
            <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const ContentCard: React.FC<ContentCardProps> = ({ item, onDelete, onShare }) => {
  const { id, platform, url, title, description, publishDate, views, likes, rating, author } = item;
  const platformInfo = PLATFORM_DETAILS[platform];

  const handleShare = () => onShare(url, title);
  const handleDelete = () => onDelete(id);

  return (
    <div className={`bg-white rounded-lg shadow-md border-t-4 ${platformInfo.borderColor.replace('border-', 'border-t-')} transition-shadow hover:shadow-xl flex flex-col`}>
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${platformInfo.bgColor} ${platformInfo.color}`}>
            <platformInfo.Icon className="w-4 h-4" />
            {platformInfo.name}
          </span>
          <MoreMenu onShare={handleShare} onDelete={handleDelete} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-800 leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>
      <div className="px-5 pt-2 pb-5">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-3">
                 {typeof views !== 'undefined' && (
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span>{views.toLocaleString()}</span>
                    </div>
                 )}
                 {typeof likes !== 'undefined' && (
                    <div className="flex items-center gap-1 text-red-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        <span>{likes.toLocaleString()}</span>
                    </div>
                )}
            </div>
            <span>{publishDate}</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
            {rating && <StarRating rating={rating} />}
            {author && <span className="text-xs font-semibold text-gray-500">{author}</span>}
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-b-lg flex gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors text-sm">
          콘텐츠 보기
        </a>
        <button onClick={handleShare} className="flex-1 text-center bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm">
          공유하기
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
