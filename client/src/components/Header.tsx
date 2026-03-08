import { useLocation } from "wouter";
import { FileText } from "lucide-react";

export default function Header() {
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
        
        </nav>


      </div>
    </header>
  );
}
