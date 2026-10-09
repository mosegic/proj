import Link from "next/link"; 
import { RegisterForm } from "@/components/auth/RegisterForm"; 

export default function RegisterPage() { 
  return ( 
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"> 
      <div className="w-full max-w-md"> 
        
        {/* Header Section */}
        <div className="text-center mb-8"> 
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group"> 
         <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center p-3">
  <img 
    src="https://res.cloudinary.com/mm0aipwg/image/upload/v1788695473/1788694955851.jpg" 
    alt="MSS Logo" 
    className="w-full h-full object-contain" 
  />
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

<footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-3">
  <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center gap-3">
    <p className="text-xs text-gray-400">
  <a href="https://www.menusaas.online" target="_blank" rel="noopener noreferrer" className="hover:underline">
    Powered by MenuSaaS
  </a>
</p>
    {/* Your Facebook Link */}
<a
  href="https://www.facebook.com/profile.php?id=61594332673347"
  target="_blank"
  rel="noopener noreferrer"
  className="text-gray-500 hover:text-blue-600 transition-colors"
  aria-label="Facebook Page"
>
  {/* Raw SVG fixes the missing 'Facebook' error */}
  <svg 
    className="w-5 h-5 fill-current" 
    viewBox="0 0 24 24" 
    aria-hidden="true"
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
</a>


  </div>
</footer>

        
      </div> 
    </div> 
  ); 
}
