import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} MOSEGIC COMPANY LIMITED. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-gray-900">
            Terms of Use
          </Link>
          <Link href="/privacy" className="hover:text-gray-900">
            Privacy Policy
          </Link>
          <a href="mailto:mosegiccompany@gmail.com" className="hover:text-gray-900">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
