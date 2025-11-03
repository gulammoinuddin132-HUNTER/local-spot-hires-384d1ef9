import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Search, Users, Star, CheckCircle, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-card/80 backdrop-blur-md shadow-soft z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">QuickHire</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">
              Contact
            </a>
            <Link to="/auth">
              <Button variant="gradient" size="lg">
                Login
              </Button>
            </Link>
          </nav>
          <Link to="/auth" className="md:hidden">
            <Button variant="gradient">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 gradient-hero text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            Find Local Work,<br />Hire Skilled Help
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Connect small businesses with talented professionals and job seekers for short-term opportunities
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6 bg-white/20 hover:bg-white/30 backdrop-blur-md">
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Find Work</h3>
              <p className="text-muted-foreground">
                Browse hundreds of short-term job opportunities in your area
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Post Jobs</h3>
              <p className="text-muted-foreground">
                Quickly post job listings and connect with qualified candidates
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Browse Professionals</h3>
              <p className="text-muted-foreground">
                Find skilled professionals with verified ratings and experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-primary">For Job Seekers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Create Your Profile</h4>
                    <p className="text-muted-foreground">Sign up and set up your profile in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Browse Jobs</h4>
                    <p className="text-muted-foreground">Search for jobs by category, location, and pay rate</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Apply & Connect</h4>
                    <p className="text-muted-foreground">Submit applications and connect with employers</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-primary">For Employers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Post Your Job</h4>
                    <p className="text-muted-foreground">Create detailed job listings with requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Review Applications</h4>
                    <p className="text-muted-foreground">Receive applications from qualified candidates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Hire & Rate</h4>
                    <p className="text-muted-foreground">Select candidates and leave ratings after completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Categories */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Professional Categories</h2>
          <p className="text-center text-muted-foreground mb-12">Browse skilled professionals by category</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Carpenters', icon: '🔨' },
              { name: 'Electricians', icon: '⚡' },
              { name: 'Plumbers', icon: '🔧' },
              { name: 'Cleaners', icon: '🧹' },
              { name: 'Gardeners', icon: '🌱' },
              { name: 'Babysitters', icon: '👶' },
              { name: 'Tutors', icon: '📚' },
              { name: 'Handymen', icon: '🛠️' }
            ].map((category) => (
              <div key={category.name} className="text-center p-6 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all cursor-pointer">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h4 className="font-semibold">{category.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Have questions? We're here to help!
          </p>
          <a href="mailto:quickhire@gmail.com" className="text-primary hover:underline text-lg font-semibold">
            quickhire@gmail.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 QuickHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
