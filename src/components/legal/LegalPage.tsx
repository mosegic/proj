import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}

export function LegalPage({ title, effectiveDate, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-xl text-gray-900">MenuSaaS</span>
          </Link>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Effective date: {effectiveDate}</p>
        <div className="mt-8 space-y-8 text-sm leading-6 text-gray-700">{children}</div>
      </main>
    </div>
  );
}

interface LegalSectionProps {
  heading: string;
  children: ReactNode;
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
