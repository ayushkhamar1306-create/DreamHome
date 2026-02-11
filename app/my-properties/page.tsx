'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyCard from '../components/PropertyCard';
import api from '../lib/api';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Home
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(null);
  const router = useRouter();

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await api.get('/properties/owner', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProperties(response.data.properties || []);
      } else {
        setError('Failed to fetch properties');
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      if (err.response?.status === 401) {
        router.push('/auth/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load properties');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleMarkAsSold = async (propertyId: string) => {
    try {
      setUpdatingPropertyId(propertyId);
      const token = localStorage.getItem('token');

      const response = await api.patch(
        `/properties/${propertyId}/mark-sold`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProperties(prev =>
          prev.map(prop =>
            prop._id === propertyId
              ? { ...prop, sold: true, soldDate: new Date() }
              : prop
          )
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark property as sold');
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  const handleMarkAsAvailable = async (propertyId: string) => {
    try {
      setUpdatingPropertyId(propertyId);
      const token = localStorage.getItem('token');

      const response = await api.patch(
        `/properties/${propertyId}/mark-available`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProperties(prev =>
          prev.map(prop =>
            prop._id === propertyId
              ? { ...prop, sold: false, soldDate: null }
              : prop
          )
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark property as available');
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#b04439]" />
          <p className="text-gray-600 text-lg">Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 p-5 rounded-xl bg-[#b04439]/10 text-[#b04439] border border-[#b04439]/30">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black tracking-tight">
            My Properties
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Manage and track your property listings professionally
          </p>
          <div className="w-24 h-1 bg-[#b04439] mt-5 rounded-full"></div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-gray-200 bg-white shadow-sm">
            <Home className="w-16 h-16 mx-auto text-[#b04439] mb-6" />
            <h2 className="text-2xl font-semibold text-black mb-3">
              No Properties Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start listing your properties to manage them here.
            </p>

            <Button
              onClick={() => router.push('/submit-property')}
              className="bg-[#b04439] hover:bg-[#992f25] text-white px-8 py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Submit Your First Property
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {properties.map((property: any) => (
              <div
                key={property._id}
                className="bg-white rounded-2xl transition-all duration-300 p-6"
              >
                <PropertyCard property={property} />

                {property.status === 'approved' && (
                  <div className="mt-8 flex flex-wrap gap-4 justify-between items-center">

                    {/* STATUS */}
                    {property.sold ? (
                      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#b04439]/10 border border-[#b04439]/30">
                        <CheckCircle2 className="w-4 h-4 text-[#b04439]" />
                        <span className="text-sm font-semibold text-black">
                          Sold on {new Date(property.soldDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 border border-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#b04439]" />
                        <span className="text-sm font-semibold text-black">
                          Available for {property.propertyFor}
                        </span>
                      </div>
                    )}

                    {/* ACTION BUTTON */}
                    {property.sold ? (
                      <Button
                        onClick={() => handleMarkAsAvailable(property._id)}
                        disabled={updatingPropertyId === property._id}
                        variant="outline"
                        className="border-2 border-[#b04439] text-[#b04439] hover:bg-[#b04439] hover:text-white px-6 py-5 rounded-xl transition-all"
                      >
                        {updatingPropertyId === property._id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Mark as Available
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleMarkAsSold(property._id)}
                        disabled={updatingPropertyId === property._id}
                        className="bg-[#53b039] hover:bg-[#369925] text-white px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        {updatingPropertyId === property._id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Mark as Sold
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
