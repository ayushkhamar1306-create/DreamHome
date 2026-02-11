'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function PropertyForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('token');

    // Convert facilities to JSON array
    const facilities = (formData.get('facilities') as string) || '';
    formData.set(
      'facilities',
      JSON.stringify(facilities.split(',').map(f => f.trim()).filter(f => f))
    );

    // Convert payment details to JSON object
    const txnId = (formData.get('txnId') as string) || '';
    formData.set('paymentDetails', JSON.stringify({ txnId }));

    try {
      const response = await api.post('/properties/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success modal immediately
      setLoading(false);
      setShowSuccess(true);
      // Reset form only after showing modal
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (err: any) {
      console.error('Error submitting property:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    router.push('/my-properties');
  };

  return (
    <>
      <form ref={formRef} onSubmit={submitHandler} className="space-y-6">
        {/* Property Name */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="propertyName"
            placeholder="e.g., Sunshine Apartments"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyType"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Select Type</option>
              <option value="apartment">Apartment</option>
              <option value="tenament">Tenament</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Square Feet <span className="text-red-500">*</span>
            </label>
            <input
              name="sqft"
              type="number"
              placeholder="e.g., 1200"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              placeholder="e.g., Mumbai"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              BHK <span className="text-red-500">*</span>
            </label>
            <input
              name="bhk"
              placeholder="e.g., 2BHK"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Full Address */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            placeholder="Complete address with locality and landmark"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500">₹</span>
            <input
              name="price"
              type="number"
              placeholder="Enter price"
              required
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Facilities */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Facilities
          </label>
          <input
            name="facilities"
            placeholder="e.g., Parking, Lift, Security, Gym"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">Separate facilities with commas</p>
        </div>

        {/* Property For */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Property For <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyFor"
                value="sell"
                required
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Sell</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyFor"
                value="rent"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Rent</span>
            </label>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-gray-50 p-5 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Owner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                name="ownerName"
                placeholder="Full name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Email <span className="text-red-500">*</span>
              </label>
              <input
                name="ownerEmail"
                type="email"
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Owner Phone <span className="text-red-500">*</span>
            </label>
            <input
              name="ownerPhone"
              placeholder="10-digit mobile number"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Listing Charges */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Listing Charges <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
              <input type="radio" name="charges" value="15000" required className="sr-only" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Apartment</div>
                <div className="text-indigo-600 font-bold text-lg">₹15,000</div>
              </div>
            </label>

            <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
              <input type="radio" name="charges" value="30000" className="sr-only" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Tenament</div>
                <div className="text-indigo-600 font-bold text-lg">₹30,000</div>
              </div>
            </label>

            <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
              <input type="radio" name="charges" value="50000" className="sr-only" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Villa</div>
                <div className="text-indigo-600 font-bold text-lg">₹50,000</div>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 p-5 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select Method</option>
                <option value="card">Credit / Debit Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction ID
              </label>
              <input
                name="txnId"
                placeholder="Enter transaction ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-4">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Images (5–7 images) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="propertyImages"
              multiple
              accept="image/*"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Upload 5-7 high-quality images of your property</p>
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Proof Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="propertyProof"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Upload ownership proof (PDF, JPG, PNG)</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Property...
            </span>
          ) : (
            'Submit Property for Approval'
          )}
        </button>
      </form>

      {/* Success Modal Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
            <div className="text-center">
              {/* Success Icon with Animation */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🎉 Property Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Your property has been submitted for approval. You can track its status in the "My Properties" section.
              </p>

              {/* OK Button */}
              <button
                onClick={handleSuccessOk}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                OK - Go to My Properties
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}