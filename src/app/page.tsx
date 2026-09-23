import Link from "next/link";
import { Button } from "@/components/ui/Button";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="font-bold text-xl text-gray-900">MenuSaaS</span>
        </div>
        <div className="flex items-center gap-4">
       
          
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Hero Section */}
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
          Online-Menu <br />
          <span className="text-blue-600">Modern Restaurant</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Create beautiful digital mobile menus, manage your catalog in real-time,
          generate scannable QR codes per table — all from one dashboard.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">Start Free</Button>
          </Link>
          <Link href="/menu/demo-cafe">
            <Button size="lg" variant="secondary">
              Demo
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid sm:grid-cols-3 gap-8 text-left">
          {[
            {
              icon: "📱",
              title: "Mobile-First Menus",
              desc: "Lightweight, fast-loading menu pages optimized for smartphones.",
            },
            {
              icon: "⚡",
              title: "Real-Time Updates",
              desc: "Mark items sold out, change prices, hide categories — instantly reflected.",
            },
            {
              icon: "📷",
              title: "QR Code Generation",
              desc: "Auto-generate branded QR codes for each table linking to your menu.",
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <section className="mt-24 text-left">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple Pricing</h2>
            <p className="mt-3 text-gray-600">Products and Services, Profit Focus, Scale.</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* Free Tier */}
            <div className="flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Free Tier</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Free</h3>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">KES 0</p>
                <p className="mt-4 text-sm text-gray-600">Try MenuSaaS free for 30 days. A real SuperHero!</p>
              </div>
              <div className="mt-8">
                <Link href="/register">
                  <Button className="w-full">Start Free</Button>
                </Link>
              </div>
            </div>

            {/* Business Standard */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Business Standard</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Standard</h3>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                  KES 1,500<span className="text-sm font-medium text-gray-500">/mo</span>
                </p>
                <p className="mt-4 text-sm text-gray-600">Essential tools for growing restaurants. Limited 5 Categories 15 items</p>
              </div>
              <div className="mt-8">
                <Link href="/register">
                  <Button variant="secondary" className="w-full">Choose Standard</Button>
                </Link>
              </div>
            </div>

            {/* Business Elite */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Business Elite</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Elite</h3>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                  KES 3,500<span className="text-sm font-medium text-gray-500">/mo</span>
                </p>
                <p className="mt-4 text-sm text-gray-600">Advanced tools for ambitious teams. Unlimited. QrCde has Logo.</p>
              </div>
              <div className="mt-8">
                <Link href="/register">
                  <Button variant="secondary" className="w-full">Choose Elite</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
<footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-3">
  <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center gap-3">
    <p className="text-xs text-gray-400">
      onlinemenusaas@gmail.com MenuSaaS
    </p>
    {/* Your Facebook Link */}
  <a
  href="https://facebook.com"
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
  );
}
