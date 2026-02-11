import PropertyForm from '../components/PropertyForm';
import Header from '@/components/Header'
export default function SubmitPropertyPage() {
  return (
    <div>
            <Header />

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">

      
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Submit Your Property
          </h1>
          <p className="text-lg text-gray-600">
            Fill in the details below to list your property for approval
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10">
          <PropertyForm />
        </div>

      
      </div>
    </div>
        </div>

  );
}