import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Settings } from "lucide-react";

export default function AuthenticatedNav() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 blur-bg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/auraa-logo.png" alt="AURAA" className="h-8 w-8" />
            <span className="text-xl font-bold gradient-text">AURAA</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-slate hover:text-navy transition-colors font-medium">
              Dashboard
            </a>
            <a href="/dashboard" className="text-slate hover:text-navy transition-colors font-medium">
              Wardrobe
            </a>
            <a href="/dashboard" className="text-slate hover:text-navy transition-colors font-medium">
              Outfits
            </a>
            <a href="/dashboard" className="text-slate hover:text-navy transition-colors font-medium">
              Recommendations
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || ''} />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate/20 text-slate hover:bg-gradient-purple-pink hover:text-white hover:border-transparent"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}