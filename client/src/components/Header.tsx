import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileText, Download, History, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Header() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">FileConvert</h1>
            <p className="text-xs text-muted-foreground">Universal Converter</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded-lg transition-all ${
              isActive("/")
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/converter")}
            className={`px-4 py-2 rounded-lg transition-all ${
              isActive("/converter")
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            Converter
          </button>
          {user && (
            <button
              onClick={() => navigate("/history")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                isActive("/history")
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-accent">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm text-foreground">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
