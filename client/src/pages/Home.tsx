import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  FileText,
  Image,
  Music,
  Video,
  Archive,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: FileText,
      title: "Documents",
      description: "Convert between DOCX and PDF formats seamlessly",
    },
    {
      icon: Image,
      title: "Images",
      description: "Transform JPEG, PNG, and SVG with ease",
    },
    {
      icon: Music,
      title: "Audio",
      description: "Convert MP3 and WAV audio files",
    },
    {
      icon: Video,
      title: "Video",
      description: "Process MP4 and MOV video formats",
    },
    {
      icon: Archive,
      title: "Compression",
      description: "Compress and decompress ZIP files",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process conversions in seconds with optimized algorithms",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your files are encrypted and never stored permanently",
    },
    {
      icon: Clock,
      title: "Batch Processing",
      description: "Convert multiple files at once to save time",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Convert Any File,{" "}
                <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  Instantly
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Transform your documents, images, audio, video, and archives with
                our elegant, intuitive converter. No sign-up required to get started.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/converter")}
                className="gap-2 text-base"
              >
                Start Converting
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-accent">5+</p>
                <p className="text-sm text-muted-foreground">File Types</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-accent">Instant</p>
                <p className="text-sm text-muted-foreground">Conversion</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-accent">100%</p>
                <p className="text-sm text-muted-foreground">Private</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl blur-3xl" />
              <div className="relative bg-card rounded-3xl border border-border/50 p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  {[FileText, Image, Music, Video].map((Icon, i) => (
                    <div
                      key={i}
                      className="bg-muted rounded-2xl p-6 flex items-center justify-center hover:bg-accent/10 transition-colors"
                    >
                      <Icon className="w-8 h-8 text-accent" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Supported Formats
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert between multiple file formats with professional quality
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="card-elevated p-6 space-y-4 text-center hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Why Choose FileConvert?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect balance of speed, security, and simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="space-y-4 p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-3xl border border-accent/20 p-12 md:p-16 text-center space-y-6">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to Convert?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start converting your files now. No account required for basic conversions.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/converter")}
            className="gap-2 text-base"
          >
            Go to Converter
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-20">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2026 FileConvert. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
