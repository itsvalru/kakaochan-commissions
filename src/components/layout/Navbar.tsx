import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[var(--bg-secondary)] border-b border-[var(--red-tertiary)] shadow-lg fixed top-0 left-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo or Site Name */}
        <Link
          href="/"
          className="text-[var(--red-light)] font-bold text-xl tracking-wide"
        >
          KakaoChan Commissions
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex gap-8">
          <Link
            href="/dashboard"
            className="text-[var(--red-light)] hover:text-[var(--red-primary)] transition"
          >
            Dashboard
          </Link>

          <Link
            href="/settings"
            className="text-[var(--red-light)] hover:text-[var(--red-primary)] transition"
          >
            Settings
          </Link>
        </div>

        {/* Right: New Commission Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/commissions/new"
            className="form-button px-5 py-2 text-base"
          >
            New Commission
          </Link>
        </div>
      </div>
    </nav>
  );
}
