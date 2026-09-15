import Link from "next/link"; 
import { RegisterForm } from "@/components/auth/RegisterForm"; 

export default function RegisterPage() { 
  return ( 
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"> 
      <div className="w-full max-w-md"> 
        
        {/* Header Section */}
        <div className="text-center mb-8"> 
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group"> 
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"> 
              M 
            </div> 
            <span className="font-bold text-xl">MenuSaaS</span> 
          </Link> 
          
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Register Your Business
          </h1> 
          <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto"> 
            Set up your infrastructure, databases, and digital menu in minutes for Restaurants, Pharmacies, Salons, Wholesales, or Apartments.
          </p> 
        </div> 

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"> 
          <RegisterForm /> 
        </div> 

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600 mt-4"> 
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium"> 
            Sign in 
          </Link> 
        </p> 

      </div> 
    </div> 
  ); 
}
