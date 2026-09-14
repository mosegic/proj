import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="font-bold text-xl text-gray-900">MenuSaaS</span>
       
        
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
          Online-Menu
          <br />
          <span className="text-blue-600">Modern Restaurant</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Create beautiful digital mobile menus, manage your catalog in real-time,
          generate scannable QR codes per table — all from one dashboard.
          Products and Services, Profit Focus, Scale.
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

        <section className="mt-24 text-left">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple pricing for every restaurant</h2>
            <p className="mt-3 text-gray-600">Start free, then upgrade when your business grows.</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Free Tier</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Free</h3>
                <p className="mt-2 text-sm text-gray-600">Try MenuSaaS free for 30 days.</p>
                <p className="mt-6 text-3xl font-extrabold text-gray-900">₦0</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="flex-1">
                  <Button className="w-full">Start Free</Button>
                </Link>
                <Link href="/menu/demo-cafe" className="flex-1">
                  <Button size="lg" variant="secondary" className="w-full">
                    Demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Business Standard</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">₦15,000<span className="text-sm font-medium text-gray-500">/month</span></h3>
                <p className="mt-2 text-sm text-gray-600">Essential tools for growing restaurants.</p>
              </div>
              <Link href="/register" className="mt-8">
                <Button className="w-full">Choose Standard</Button>
              </Link>
            </div>

            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Business Elite</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">₦45,000<span className="text-sm font-medium text-gray-500">/month</span></h3>
                <p className="mt-2 text-sm text-gray-600">Advanced tools for ambitious teams.</p>
              </div>
              <Link href="/register" className="mt-8">
                <Button className="w-full">Choose Elite</Button>
              </Link>
            </div>
          </div>
        </section>

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
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

