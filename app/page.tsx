'use client';

import { useState } from 'react';
import UrlShortener from '@/components/url-shortener';
import UrlList from '@/components/url-list';
export default function Home() {
  const [refreshList, setRefreshList] = useState(0);

  const handleUrlShortened = () => {
    setRefreshList(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Professional URL Shortener
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform long URLs into short, shareable links with detailed analytics
          </p>
        </div>
        
        <UrlShortener onUrlShortened={handleUrlShortened} />
        <UrlList refresh={refreshList} />
      </div>
    </main>
  );
}