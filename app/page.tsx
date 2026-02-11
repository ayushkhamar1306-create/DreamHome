'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PropertyFilters from '@/components/PropertyFilters';
import Footer from '@/components/Footer';
import InquiryModal from './components/InquiryModel';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Users, TrendingUp, MapPin, Loader2,
  Calendar, Home, Bed, DollarSign, FileCheck, Download,
  AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight,
  Maximize2, Shield, Phone, Mail, User, Award, Star,
  BadgeCheck, HeartHandshake, Search, Sparkles, Building2,
  KeyRound, TrendingDown, Building, SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';
import api from './lib/api';

// Inline PropertyCard Component
function PropertyCard({ property, isBuyer, onInquiry }: { property: any; isBuyer: boolean; onInquiry: (propertyId: string, propertyTitle: string) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Safety checks
  if (!property) return null;

  const images = property.propertyImages || [];

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price: any) => {
    if (!price || price === undefined || price === null || isNaN(Number(price))) {
      return '₹0';
    }

    try {
      const numPrice = Number(price);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(numPrice);
    } catch (error) {
      console.error('Price formatting error:', error);
      return '₹0';
    }
  };

  const getFacilities = () => {
    if (!property.facilities) return [];

    try {
      if (typeof property.facilities === 'string') {
        const parsed = JSON.parse(property.facilities);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
          return JSON.parse(parsed[0]);
        }
        return Array.isArray(parsed) ? parsed : [];
      }

      if (Array.isArray(property.facilities)) {
        if (property.facilities.length > 0 && typeof property.facilities[0] === 'string' && property.facilities[0].startsWith('[')) {
          return JSON.parse(property.facilities[0]);
        }
        return property.facilities;
      }

      return [];
    } catch (error) {
      console.error('Error parsing facilities:', error);
      return [];
    }
  };

  const facilities = getFacilities();
  const propertyTitle = `${property.bhk || 'N/A'} ${property.propertyType || 'Property'}`;

  return (
    <div 
      className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-2xl hover:border-[#b04439]/30 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Carousel Section */}
      <div className="relative h-[260px] bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            {/* Main Image */}
            <div className="relative h-full w-full">
              <img
                src={images[currentImageIndex]}
                alt={`${property.propertyType || 'Property'} - ${property.bhk || 'N/A'}`}
                className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-gray-900" />
                </button>
              </>
            )}

            {/* Image Counter Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                        ? 'w-6 h-1.5 bg-white shadow-md'
                        : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Status Badge */}
            {property.status && (
              <div className="absolute top-3 right-3">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusColor(
                    property.status
                  )}`}
                >
                  {getStatusIcon(property.status)}
                  <span className="capitalize">{property.status}</span>
                </div>
              </div>
            )}

            {/* Property Type Badge */}
            <div className="absolute top-3 left-3">
              <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-900 shadow-sm border border-gray-200/50 capitalize flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {property.propertyType || 'Property'}
              </div>
            </div>

            {/* Image Count Badge */}
            {images.length > 0 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">

        {/* Title and Price Row */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 capitalize leading-tight mb-1 group-hover:text-[#b04439] transition-colors">
                {property.bhk || 'N/A'} {property.propertyType || 'Property'}
              </h3>
              <h4 className="text-base font-semibold text-gray-700 mb-2">
                {property.propertyName}
              </h4>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#b04439]" />
                </div>
                <span className="text-sm font-medium">{property.city || 'Unknown'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#b04439]">
                {formatPrice(property.price)}
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                For {property.propertyFor || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <Bed className="w-4 h-4 text-[#b04439]" />
            <div className="text-xs font-bold text-gray-900">{property.bhk || 'N/A'}</div>
            <div className="text-[10px] text-gray-500">Beds</div>
          </div>

          <div className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <Maximize2 className="w-4 h-4 text-[#b04439]" />
            <div className="text-xs font-bold text-gray-900">{property.sqft || 'N/A'}</div>
            <div className="text-[10px] text-gray-500">Sqft</div>
          </div>

          <div className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <Calendar className="w-4 h-4 text-[#b04439]" />
            <div className="text-xs font-bold text-gray-900 text-center leading-tight">{formatDate(property.createdAt).split(',')[0]}</div>
            <div className="text-[10px] text-gray-500">Listed</div>
          </div>
        </div>

        {/* Facilities - Compact Display */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facilities.slice(0, 4).map((facility: string, index: number) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-700 capitalize"
              >
                {facility}
              </span>
            ))}
            {facilities.length > 4 && (
              <span className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-700">
                +{facilities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {property.status === 'rejected' && property.rejectionReason && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-rose-900 mb-1">
                  Rejection Reason
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {property.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Owner Contact - Only for Approved and NOT for buyers */}
        {property.status === 'approved' && !isBuyer && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <div className="text-xs font-semibold text-emerald-900">
                Verified Owner
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-gray-900">{property.ownerName || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Inquiry Button - Only for buyers and approved properties */}
        {property.status === 'approved' && isBuyer && (
          <Button
            onClick={() => onInquiry(property._id, propertyTitle)}
            className="w-full bg-[#b04439] hover:bg-[#8d362e] text-white font-semibold py-5 text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <span>Send Inquiry</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Main HomePage Component
export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Inquiry Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState('');

  // Check if current user is a buyer
  const isBuyer = currentUser?.role === 'buyer';

  // Debug logs
  useEffect(() => {
  }, [currentUser, isBuyer]);

  // Fetch current user information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setCurrentUser(response.data.user);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch approved properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties/approved');

        if (response.data.success) {
          setProperties(response.data.properties);
          setFilteredProperties(response.data.properties);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleFilter = (filters: {
    city?: string;
    propertyFor?: string;
    minPrice?: number;
    maxPrice?: number;
    bhk?: string;
    propertyType?: string;
  }) => {
    let filtered = [...properties];

    // City filter
    if (filters.city && filters.city.trim() !== '') {
      filtered = filtered.filter((prop) =>
        prop.city?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Property For filter (rent/sale)
    if (filters.propertyFor && filters.propertyFor !== '') {
      filtered = filtered.filter((prop) => 
        prop.propertyFor?.toLowerCase() === filters.propertyFor!.toLowerCase()
      );
    }

    // BHK filter
    if (filters.bhk && filters.bhk !== '') {
      filtered = filtered.filter((prop) => prop.bhk === filters.bhk);
    }

    // Property Type filter
    if (filters.propertyType && filters.propertyType !== '') {
      filtered = filtered.filter((prop) => 
        prop.propertyType?.toLowerCase() === filters.propertyType!.toLowerCase()
      );
    }

    // Min Price filter
    if (filters.minPrice && filters.minPrice > 0) {
      filtered = filtered.filter((prop) => {
        const price = Number(prop.price);
        return !isNaN(price) && price >= filters.minPrice!;
      });
    }

    // Max Price filter
    if (filters.maxPrice && filters.maxPrice > 0) {
      filtered = filtered.filter((prop) => {
        const price = Number(prop.price);
        return !isNaN(price) && price <= filters.maxPrice!;
      });
    }

    setFilteredProperties(filtered);
  };

  const handleClearFilters = () => {
    setFilteredProperties(properties);
  };

  const handleInquiryClick = (propertyId: string, propertyTitle: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to send an inquiry');
      return;
    }

    if (!isBuyer) {
      alert('Only buyers can send property inquiries');
      return;
    }
    
    setSelectedPropertyId(propertyId);
    setSelectedPropertyTitle(propertyTitle);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#b04439]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#b04439]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b04439]/10 border border-[#b04439]/20">
                <BadgeCheck className="w-4 h-4 text-[#b04439]" />
                <span className="text-sm font-semibold text-gray-900">Trusted by 10,000+ Happy Customers</span>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  Discover Your
                  <span className="block text-[#b04439] mt-2">
                    Dream Home
                  </span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                  Explore premium properties handpicked just for you. Find the perfect place where memories are made and dreams come true.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#properties" className="group">
                  <Button size="lg" className="bg-[#b04439] hover:bg-[#8d362e] text-white shadow-lg hover:shadow-xl transition-all duration-300 gap-2 w-full sm:w-auto">
                    <Search className="w-5 h-5" />
                    Explore Properties
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#b04439] mb-1">
                    {properties.length}+
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Properties</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#b04439] mb-1">
                    50+
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Cities</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-[#b04439] mb-1">
                    ₹500M+
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Portfolio</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[#b04439]/10 rounded-2xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=800&fit=crop"
                  alt="Modern luxury home"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#b04439] flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Premium Quality</div>
                        <div className="text-xs text-gray-600">Verified & Certified</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* Filters & Properties Section */}
      <section className="py-20 bg-white" id="properties">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b04439]/10 border border-[#b04439]/20 mb-4">
              <Building className="w-4 h-4 text-[#b04439]" />
              <span className="text-sm font-semibold text-gray-900">Featured Listings</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Premium Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse through our handpicked collection of verified and approved properties
            </p>
          </div>

          <PropertyFilters onFilter={handleFilter} />

          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#b04439]/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-[#b04439]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Showing results</p>
                <p className="text-lg font-bold text-gray-900">{filteredProperties.length} Properties Found</p>
              </div>
            </div>
            
            {filteredProperties.length !== properties.length && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                className="border-2 border-gray-300 hover:bg-gray-50 text-gray-900"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#b04439] border-t-transparent animate-spin absolute top-0"></div>
                </div>
                <p className="text-lg font-semibold text-gray-900">Finding perfect homes for you...</p>
                <p className="text-sm text-gray-600">Please wait a moment</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{error}</p>
              <p className="text-gray-600 mb-6">Please try again later or contact support</p>
              <Button className="bg-[#b04439] hover:bg-[#8d362e] text-white">
                Retry Loading
              </Button>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isBuyer={isBuyer}
                  onInquiry={handleInquiryClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</p>
              <p className="text-gray-600 mb-8">Try adjusting your filters to see more results</p>
              <Button
                onClick={handleClearFilters}
                className="bg-[#b04439] hover:bg-[#8d362e] text-white"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
           {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b04439]/10 border border-[#b04439]/20 mb-4">
              <Sparkles className="w-4 h-4 text-[#b04439]" />
              <span className="text-sm font-semibold text-gray-900">Why Choose Us</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Trusted Real Estate Partner
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide exceptional service and verified properties to help you find your perfect home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BadgeCheck,
                title: 'Verified Listings',
                description: 'Every property is thoroughly verified and authenticated by our expert team for your peace of mind.',
              },
              {
                icon: HeartHandshake,
                title: 'Expert Support',
                description: 'Our dedicated team of real estate professionals is available 24/7 to guide you every step of the way.',
              },
              {
                icon: TrendingUp,
                title: 'Best Value',
                description: 'Get competitive pricing with transparent deals and no hidden charges for maximum value.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-[#b04439]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-lg bg-[#b04439]/10 flex items-center justify-center mb-6 group-hover:bg-[#b04439] transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-[#b04439] group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#b04439] transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="py-20 relative overflow-hidden bg-[#b04439]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of happy homeowners who found their perfect property with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#b04439] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 gap-2 group">
                <KeyRound className="w-5 h-5" />
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-#b04439 hover:bg-white/10 backdrop-blur-sm">
                <Phone className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        propertyId={selectedPropertyId}
        propertyTitle={selectedPropertyTitle}
      />
    </div>
  );
}