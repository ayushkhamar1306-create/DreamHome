'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Phone, Mail, MapPin, Maximize2, Bed, Bath, Check, ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';

// Mock property data - replace with API call
const propertyData = {
  id: '1',
  title: 'Modern Downtown Loft',
  price: 450000,
  city: 'New York',
  address: '123 Broadway, Manhattan, NY 10001',
  sqftArea: 1850,
  bedrooms: 2,
  bathrooms: 2,
  listingType: 'buy',
  description:
    'Stunning modern loft located in the heart of downtown Manhattan. Features exposed brick, high ceilings, and floor-to-ceiling windows with city views. Fully renovated with premium finishes and smart home technology.',
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200&h=600&fit=crop',
  ],
  amenities: ['Air Conditioning', 'Hardwood Floors', 'Gym', 'Doorman', 'Rooftop Terrace', 'Smart Home'],
  agentName: 'Sarah Johnson',
  agentPhone: '+1 (555) 123-4567',
  agentEmail: 'sarah.johnson@dreamhome.com',
};

export default function PropertyDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Inquiry sent successfully! The agent will contact you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setShowContactForm(false);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % propertyData.images.length);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image Gallery with Beautiful Design */}
            <div className="relative h-96 md:h-[550px] rounded-2xl overflow-hidden bg-secondary group shadow-xl">
              <img
                src={propertyData.images[selectedImage] || 'https://images.unsplash.com/photo-1559599810-46d1512c080f?w=1200&h=600&fit=crop'}
                alt={propertyData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Navigation Buttons */}
              {propertyData.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/95 hover:bg-white text-foreground rounded-full shadow-lg hover:shadow-xl transition opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/95 hover:bg-white text-foreground rounded-full shadow-lg hover:shadow-xl transition opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}

              {/* Image Counter - Enhanced */}
              <div className="absolute bottom-6 left-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border border-white/20">
                {selectedImage + 1} / {propertyData.images.length}
              </div>

              {/* Action Buttons - Enhanced */}
              <div className="absolute top-6 right-6 flex gap-3">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="p-4 bg-white/95 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition backdrop-blur-sm border border-white/20"
                >
                  <Heart
                    className={`w-6 h-6 transition-all ${
                      isFavorited ? 'fill-destructive text-destructive scale-110' : 'text-gray-400'
                    }`}
                  />
                </button>
                <button className="p-4 bg-white/95 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition backdrop-blur-sm border border-white/20">
                  <Share2 className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images - Beautiful Gallery */}
            <div className="flex gap-3 overflow-x-auto pb-2 p-2 bg-secondary/40 rounded-xl">
              {propertyData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden border-2 transition transform hover:scale-105 ${
                    selectedImage === index
                      ? 'border-primary ring-3 ring-primary/40 shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/60 hover:shadow-md'
                  }`}
                >
                  <img
                    src={image || 'https://images.unsplash.com/photo-1559599810-46d1512c080f?w=200&h=200&fit=crop'}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-primary/20" />
                  )}
                </button>
              ))}
            </div>

            {/* Property Details */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-balance">
                    {propertyData.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{propertyData.address}</span>
                  </div>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bed className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Bedrooms</p>
                    <p className="text-2xl font-bold text-foreground">{propertyData.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bath className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Bathrooms</p>
                    <p className="text-2xl font-bold text-foreground">{propertyData.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Maximize2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Sq.Ft</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(propertyData.sqftArea / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Property</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{propertyData.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyData.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20 hover:border-primary/50 transition transform hover:scale-102"
                    >
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-card rounded-xl border border-border p-8 mb-6 sticky top-20 shadow-sm">
              <div className="mb-8">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">List Price</p>
                <h3 className="text-4xl font-bold text-primary">
                  ${propertyData.price.toLocaleString()}
                </h3>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 mb-8 border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Property Type</p>
                <p className="text-lg font-semibold text-foreground capitalize">
                  {propertyData.listingType === 'both' ? 'Buy or Rent' : propertyData.listingType === 'buy' ? 'For Sale' : 'For Rent'}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base">
                  Schedule Tour
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-semibold h-12 text-base bg-transparent"
                  onClick={() => setShowContactForm(!showContactForm)}
                >
                  Make an Inquiry
                </Button>
              </div>

              {/* Agent Info */}
              <div className="border-t border-border pt-8">
                <h4 className="font-semibold text-foreground mb-4 text-lg">Listing Agent</h4>
                <div className="bg-secondary rounded-lg p-5">
                  <p className="font-bold text-foreground mb-4 text-lg">{propertyData.agentName}</p>
                  <div className="space-y-3">
                    <a
                      href={`tel:${propertyData.agentPhone}`}
                      className="flex items-center gap-3 text-primary hover:text-primary/80 transition font-medium"
                    >
                      <Phone className="w-5 h-5 flex-shrink-0" />
                      {propertyData.agentPhone}
                    </a>
                    <a
                      href={`mailto:${propertyData.agentEmail}`}
                      className="flex items-center gap-3 text-primary hover:text-primary/80 transition font-medium break-all"
                    >
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      {propertyData.agentEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h4 className="font-semibold text-foreground mb-4">Send Inquiry</h4>
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell the agent about your interest..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Send Inquiry
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
