'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface PropertyFiltersProps {
  onFilter: (filters: {
    city?: string;
    listingType?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

export default function PropertyFilters({ onFilter }: PropertyFiltersProps) {
  const [city, setCity] = useState('');
  const [listingType, setListingType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      city: city || undefined,
      listingType: listingType || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setCity('');
    setListingType('');
    setMinPrice('');
    setMaxPrice('');
    onFilter({});
  };

  const hasFilters = city || listingType || minPrice || maxPrice;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-xl p-8 mb-12 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* City Input */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              Location
            </label>
            <input
              type="text"
              placeholder="City or neighborhood..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              Property Type
            </label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="buy">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              Min Price
            </label>
            <input
              type="number"
              placeholder="$0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              Max Price
            </label>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        {hasFilters && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
