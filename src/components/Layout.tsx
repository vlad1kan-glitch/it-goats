import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { LogOut, User, Trophy, LayoutDashboard } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--color-m3-bg)]">
      <header className="h-16 flex items-center justify-between px-6 bg-[var(--color-m3-surface)] text-[var(--color-m3-on-surface)] m3-elevation-1 z-10 sticky top-0">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 text-[var(--color-m3-primary)] font-bold text-lg tracking-tight">
            <Trophy className="w-6 h-6" />
            <span>HackSync</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-[var(--color-m3-primary)] transition-colors px-3 py-2 rounded-full hover:bg-[var(--color-m3-surface-variant)]">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-[var(--color-m3-outline-variant)]"></div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-surface)]">
                <User className="w-4 h-4 text-[var(--color-m3-secondary)]" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--color-m3-surface)] text-[var(--color-m3-secondary)] opacity-80">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-[var(--color-m3-error-container)] hover:text-[var(--color-m3-error)] transition-colors text-[var(--color-m3-outline)]" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-[var(--color-m3-primary)] transition-colors px-4 py-2">
                Log in
              </Link>
              <Link to="/register" className="text-sm font-medium bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity m3-elevation-1 shadow-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
