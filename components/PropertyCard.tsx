'use client';

import React from "react"

import Link from 'next/link';
import { Heart, MapPin, Maximize2, Bed, Bath, ArrowRight, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  city: string;
  sqftArea: number;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  image?: string;
  listingType: string;
}

export default function PropertyCard({
  id,
  title,
  price,
  city,
  sqftArea,
  bedrooms,
  bathrooms,
  images,
  image,
  listingType,
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  
  const propertyImages = images && images.length > 0 ? images : [image || 'https://images.unsplash.com/photo-1559599810-46d1512c080f?w=500&h=400&fit=crop'];
  const currentImage = propertyImages[imageIndex];

  const formatPrice = (price: number) => {
    if (listingType === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  return (
    <Link href={`/property/${id}`}>
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden bg-secondary">
          <img
            src={currentImage || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          
          {/* Image Counter */}
          {propertyImages.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {imageIndex + 1} / {propertyImages.length}
            </div>
          )}
          
          {/* Next Image Button */}
          {propertyImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-3 bottom-3 bg-white/90 hover:bg-white text-foreground p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold tracking-wide">
            {listingType === 'both' ? 'BUY/RENT' : listingType === 'buy' ? 'BUY' : 'RENT'}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition flex items-center justify-center"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorited ? 'fill-destructive text-destructive' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">{city}</p>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-4 line-clamp-2 text-balance">
            {title}
          </h3>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">{bedrooms}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">{bathrooms}</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">{(sqftArea/1000).toFixed(1)}k sqft</span>
            </div>
          </div>

          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(price)}
              </p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1">
              View <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
