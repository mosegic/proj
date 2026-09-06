import Link from 'next/link';
import Image from 'next/image'; // [ADD] Import the Next.js Image component
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Header / Logo */}
       <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-xl">MenuSaaS</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Register Business [Restaurant, Pharmacy, Salon&Spa, Wholesale, Apartments]
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Set up your digital menu in minutes
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <RegisterForm />
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
