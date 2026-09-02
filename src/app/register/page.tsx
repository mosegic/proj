import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-xl">MenuSaaS</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Register Your Kind of Business [Restaurant, Supermarket, Pharmacy, Salon&Spa, Hardware, Apartments]</h1>
          <p className="text-sm text-gray-600 mt-1">
            Set up your digital menu in minutes
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
