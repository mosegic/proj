"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Zap, 
  QrCode, 
  Check, 
  Menu, 
  X 
} from "lucide-react";

const PRICING_PLANS = [
  {
    id: "free",
    name: "Free Tier",
    prices: { monthly: 0, yearly: 0 },
    period: "",
    desc: "Try MenuSaaS free for 30 days.",
    buttonText: "Start Free",
    href: "/register",
    popular: false,
    features: [
      "1 Digital Menu",
      "Up to 20 Menu Items",
      "Standard QR Code Layout",
      "Basic Analytics (Views)",
    ],
  },
  {
    id: "standard",
    name: "Business Standard",
    prices: { monthly: 15000, yearly: 12000 }, // ₦12,000/mo when billed yearly
    period: "/month",
    desc: "Essential tools for growing restaurants.",
    buttonText: "Choose Standard",
    href: "/register",
    popular: true,
    features: [
      "3 Digital Menus",
      "Unlimited Menu Items",
      "Custom branded QR codes",
      "Real-time item availability toggle",
      "Advanced Analytics & Trends",
      "Email support within 24h",
    ],
  },
  {
    id: "elite",
    name: "Business Elite",
    prices: { monthly: 45000, yearly: 36000 }, // ₦36,000/mo when billed yearly
    period: "/month",
    desc: "Advanced tools for ambitious teams.",
    buttonText: "Choose Elite",
    href: "/register",
    popular: false,
    features: [
      "Unlimited Digital Menus",
      "Unlimited Menu Items",
      "Multi-location management",
      "Table-specific order routing",
      "Priority 24/7 Phone Support",
      "Custom Domain Integration",
    ],
  },
];

const CORE_FEATURES = [
  {
    icon: Smartphone,
    title: "Mobile-First Menus",
    desc: "Lightweight, fast-loading menu pages optimized for smartphones.",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    desc: "Mark items sold out, change prices, hide categories — instantly reflected.",
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    desc: "Auto-generate branded QR codes for each table linking to your menu.",
  },
];

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Format price helper function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "border-b border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-xl text-gray-900">MenuSaaS</span>
          </Link>

          <div className="hidden sm:flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Start Free</Link>
            </Button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex sm:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[65px] z-40 bg-white/95 backdrop-blur-lg sm:hidden animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col p-6 gap-6 h-full justify-start pt-12">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-gray-900 border-b pb-4 border-gray-100">
                Sign In
              </Link>
              <Link href="/menu/demo-cafe" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-gray-900 border-b pb-4 border-gray-100">
                View Live Demo
              </Link>
              <div className="mt-4">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        {/* Hero Section */}
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
          <Button size="lg" asChild>
            <Link href="/register">Start Free</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/menu/demo-cafe">Demo</Link>
          </Button>
        </div>

        {/* Dynamic Pricing Section */}
        <section className="mt-24 text-left">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple Pricing</h2>
            <p className="mt-3 text-gray-600">Start free, then upgrade when your business grows.</p>
            
            {/* Interactive Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
                Billed Monthly
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-blue-600"
                role="switch"
                aria-checked={billingCycle === "yearly"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
                  Billed Yearly
                </span>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                  Save up to 20%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PRICING_PLANS.map((plan) => {
              const isFree = plan.prices.monthly === 0;
              const currentPrice = billingCycle === "yearly" ? plan.prices.yearly : plan.prices.monthly;

              return (
                <div 
                  key={plan.id}
                  className={`relative p-8 bg-white rounded-2xl border flex flex-col justify-between h-full shadow-sm ${
                    plan.popular ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-2 text-sm text-gray-500 min-h-[40px]">{plan.desc}</p>
                    
                    {/* Price Rendering */}
                    <div className="mt-6 flex items-baseline text-gray-900">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {formatPrice(currentPrice)}
                      </span>
                      <span className="ml-1 text-xl font-semibold text-gray-500">
                        {isFree ? "" : billingCycle === "yearly" ? "/month, billed yearly" : plan.period}

   {/* Visual context of yearly savings */}{!isFree && billingCycle === "yearly" && (Save {formatPrice((plan.prices.monthly - plan.prices.yearly) * 12)} per year)}{/* Features List */}{plan.features.map((feature, idx) => ({feature}))}<ButtonclassName="w-full mt-8"variant={plan.popular ? "default" : "outline"}asChild>{plan.buttonText});})}{/* Dynamic Features Grid */}{CORE_FEATURES.map((feature) => {const IconComponent = feature.icon;return ({feature.title}{feature.desc});})});}                       
