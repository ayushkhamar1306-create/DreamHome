'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Loader2, 
  Home, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';

export default function ManageInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inquiries/seller');
      
      if (response.data.success) {
        setInquiries(response.data.inquiries);
      }
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      setError(err.response?.data?.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInquiry = async (inquiryId: string) => {
    try {
      setActionLoading(inquiryId);
      const response = await api.put(`/inquiries/${inquiryId}/accept`);
      
      if (response.data.success) {
        setInquiries(inquiries.map((inq: any) => 
          inq._id === inquiryId ? response.data.inquiry : inq
        ));
        alert('Inquiry accepted successfully!');
      }
    } catch (err: any) {
      console.error('Error accepting inquiry:', err);
      alert(err.response?.data?.message || 'Failed to accept inquiry');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInquiry = async () => {
    if (!selectedInquiryId) return;
    
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      setActionLoading(selectedInquiryId);
      const response = await api.put(`/inquiries/${selectedInquiryId}/decline`, {
        reason: declineReason,
      });
      
      if (response.data.success) {
        setInquiries(inquiries.map((inq: any) => 
          inq._id === selectedInquiryId ? response.data.inquiry : inq
        ));
        setShowDeclineModal(false);
        setDeclineReason('');
        setSelectedInquiryId(null);
        alert('Inquiry declined');
      }
    } catch (err: any) {
      console.error('Error declining inquiry:', err);
      alert(err.response?.data?.message || 'Failed to decline inquiry');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeclineModal = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setShowDeclineModal(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'bg-emerald-500 text-white',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Accepted',
        };
      case 'declined':
        return {
          color: 'bg-rose-500 text-white',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Declined',
        };
      case 'pending':
        return {
          color: 'bg-amber-500 text-white',
          icon: <Clock className="w-4 h-4" />,
          label: 'Pending',
        };
      default:
        return {
          color: 'bg-neutral-500 text-white',
          icon: <AlertCircle className="w-4 h-4" />,
          label: status,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: any) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#b04439]" />
            <p className="text-sm text-neutral-600">Loading inquiries...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Manage Inquiries</h1>
          <p className="text-neutral-600">Review and respond to property inquiries from buyers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#b04439] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1 font-medium">Total Inquiries</p>
                <p className="text-3xl font-bold text-black">{inquiries.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Home className="w-6 h-6 text-[#b04439]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#b04439] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1 font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {inquiries.filter((inq: any) => inq.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#b04439] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1 font-medium">Accepted</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {inquiries.filter((inq: any) => inq.status === 'accepted').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#b04439] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1 font-medium">Declined</p>
                <p className="text-3xl font-bold text-rose-600">
                  {inquiries.filter((inq: any) => inq.status === 'declined').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-6">
            <p className="text-rose-600">{error}</p>
          </div>
        )}

        {/* Inquiries List */}
        {inquiries.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl">
            <Home className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No Inquiries Yet</h3>
            <p className="text-neutral-600">
              You haven't received any property inquiries yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {inquiries.map((inquiry: any) => {
              const statusConfig = getStatusConfig(inquiry.status);
              const property = inquiry.property;

              return (
                <div
                  key={inquiry._id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="grid md:grid-cols-12 gap-6 p-6">
                    {/* Property Image */}
                    <div className="md:col-span-3">
                      <div className="relative h-48 rounded-xl overflow-hidden border border-neutral-200">
                        {property?.propertyImages?.[0] ? (
                          <img
                            src={property.propertyImages[0]}
                            alt={property.propertyType}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                            <Home className="w-12 h-12 text-neutral-300" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color} shadow-lg`}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-neutral-500 mb-1 font-medium">Property</p>
                        <p className="text-sm font-bold text-black capitalize">
                          {property?.bhk || 'N/A'} {property?.propertyType || 'Property'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <MapPin className="w-3 h-3 text-[#b04439]" />
                          <span>{property?.city || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Details */}
                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-black mb-1">Buyer Information</h3>
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                          <Calendar className="w-4 h-4 text-[#b04439]" />
                          <span>Requested on {formatDate(inquiry.createdAt)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-[#b04439]" />
                            <p className="text-xs text-neutral-500 font-medium">Full Name</p>
                          </div>
                          <p className="text-sm font-bold text-black">{inquiry.fullName}</p>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-3.5 h-3.5 text-[#b04439]" />
                            <p className="text-xs text-neutral-500 font-medium">Email</p>
                          </div>
                          <p className="text-xs font-bold text-black truncate">{inquiry.email}</p>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-3.5 h-3.5 text-[#b04439]" />
                            <p className="text-xs text-neutral-500 font-medium">Phone</p>
                          </div>
                          <p className="text-sm font-bold text-black">{inquiry.phone}</p>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-3.5 h-3.5 text-[#b04439]" />
                            <p className="text-xs text-neutral-500 font-medium">Profession</p>
                          </div>
                          <p className="text-sm font-bold text-black">{inquiry.profession}</p>
                        </div>
                      </div>

                      {/* Identity Proof */}
                      <div>
                        <a
                          href={inquiry.identityProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[#b04439] hover:text-[#8f3730] font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          View Identity Proof
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-4">
                      {inquiry.status === 'pending' ? (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-amber-600" />
                              <h4 className="font-bold text-black">
                                Action Required
                              </h4>
                            </div>
                            <p className="text-sm text-neutral-700">
                              Please review this inquiry and take action.
                            </p>
                          </div>

                          <Button
                            onClick={() => handleAcceptInquiry(inquiry._id)}
                            disabled={actionLoading === inquiry._id}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-lg shadow-lg"
                          >
                            {actionLoading === inquiry._id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Inquiry
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => openDeclineModal(inquiry._id)}
                            disabled={actionLoading === inquiry._id}
                            className="w-full bg-white hover:bg-neutral-50 text-rose-600 border-2 border-rose-500 font-semibold py-6 rounded-lg"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline Inquiry
                          </Button>
                        </div>
                      ) : inquiry.status === 'accepted' ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-bold text-black">
                              Inquiry Accepted
                            </h4>
                          </div>
                          <p className="text-sm text-neutral-700">
                            Your contact details have been shared with the buyer.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5 text-rose-600" />
                            <h4 className="font-bold text-black">
                              Inquiry Declined
                            </h4>
                          </div>
                          {inquiry.declineReason && (
                            <p className="text-sm text-neutral-700 mt-2">
                              Reason: {inquiry.declineReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-black mb-4">Decline Inquiry</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Please provide a reason for declining this inquiry. This will be shared with the buyer.
            </p>
            
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 bg-white text-black focus:border-[#b04439] outline-none transition-all resize-none"
              rows={4}
              placeholder="Enter decline reason..."
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setSelectedInquiryId(null);
                }}
                className="flex-1 bg-white hover:bg-neutral-50 text-black border-2 border-neutral-300 font-semibold py-6 rounded-lg"
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeclineInquiry}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-6 rounded-lg shadow-lg"
                disabled={actionLoading !== null || !declineReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Confirm Decline'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}