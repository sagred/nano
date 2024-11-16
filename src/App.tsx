// src/App.tsx
import  { useState } from 'react';
import { ResultCard } from '@/components/ResultCard';
import { SearchBar } from '@/components/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { useRecentPages } from '@/hooks/useRecentPages';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { results, loading: searchLoading, error } = useSearch(searchQuery);
  const { pages: recentPages, loading: recentLoading } = useRecentPages();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Knowledge Search
        </h1>
        
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />

        <div className="mt-8 space-y-4">
          {error && (
            <div className="text-red-500">
              Error: {error.message}
            </div>
          )}

          {searchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"/>
            </div>
          ) : searchQuery ? (
            results.length > 0 ? (
              results.map(result => (
                <ResultCard key={result.id} result={result} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No results found
              </div>
            )
          ) : !recentLoading && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Recent Pages
              </h2>
              {recentPages.map(page => (
                <ResultCard key={page.id} result={page} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;