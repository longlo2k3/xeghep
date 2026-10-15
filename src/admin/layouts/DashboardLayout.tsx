import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/admin/components/common/Sidebar';
import { Header } from '@/admin/components/common/Header';

export function DashboardLayout() {
  // Mobile slide-over drawer (closed by default)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Web desktop sidebar: OPEN by default (toggle is an optional extension)
  const [isDesktopOpen, setIsDesktopOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_sidebar_desktop_open');
      if (saved !== null) return saved === 'true';
    }
    return true; // Default OPEN on web!
  });

  const toggleDesktop = useCallback(() => {
    setIsDesktopOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cms_sidebar_desktop_open', String(next));
      }
      return next;
    });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      toggleDesktop();
    }
  }, [toggleDesktop]);

  // Optional keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar extension
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleSidebar]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar (Desktop docked & collapsible / Mobile drawer slide-over) */}
      <Sidebar
        isOpen={isMobileOpen}
        isDesktopOpen={isDesktopOpen}
        onClose={() => setIsMobileOpen(false)}
        onToggleDesktop={toggleDesktop}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onToggleSidebar={handleToggleSidebar}
          isDesktopOpen={isDesktopOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
