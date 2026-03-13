'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClawIcon } from '@/components/icons/ClawIcon';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-orange-400 transition-colors group">
          <ClawIcon size={28} color="currentColor" className="text-orange-400 group-hover:scale-110 transition-transform" />
          <span>ClawMarket</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/marketplace" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            Marketplace
          </Link>
          <Link href="/guide" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            Guide
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/sell" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Sell
                  </Link>
                  <Link href="/dashboard" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-700">
                    <span className="text-sm text-gray-300">@{user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg transition-colors">
                    Sign up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
