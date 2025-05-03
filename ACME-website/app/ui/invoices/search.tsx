"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import axiosInstance from "@/app/lib/axios";

interface Invoice {
  id: string;
  name: string;
  email: string;
  status: string;
  amount: number;
  date: string;
  image_url: string;
}

interface SearchProps {
  placeholder: string;
  query: string;
  setQuery: (query: string) => void;
}

export default function Search({ placeholder, query, setQuery }: SearchProps) {
  const [results, setResults] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await axiosInstance.get('/invoices/search', {
          params: { query, page: 1 },
        });
        setResults(res.data.invoices || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      }
      setLoading(false);
    };

    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative flex flex-col gap-4 w-full">
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          id="search"
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder={placeholder}
          onChange={handleChange}
          value={query}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      {/* Search Results */}
      {loading && <div className="text-sm text-gray-500">Searching...</div>}
      {!loading && results.length > 0 && (
        <div className="rounded-md bg-white shadow p-4 mt-2">
          {results.map((invoice) => (
            <div key={invoice.id} className="border-b last:border-none py-2">
              <p className="text-sm font-medium">{invoice.name}</p>
              <p className="text-xs text-gray-500">{invoice.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
