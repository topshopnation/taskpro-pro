import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, Clock, Filter, FolderKanban, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Handle redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log("Index: User already authenticated, redirecting to today");
      navigate("/today", { replace: true });
    }
  }, [user, loading, navigate]);

  // Only render the landing page if not authenticated or still loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Don't render anything if user is logged in (will redirect)
  if (user) {
    return null;
  }

  // Rest of the features array
  const features = [
    {
      icon: <FolderKanban className="h-10 w-10 text-primary" />,
      title: "Project Management",
      description: "Organize tasks into projects and track progress with visual dashboards."
    },
    {
      icon: <Filter className="h-10 w-10 text-indigo-500" />,
      title: "Smart Filtering",
      description: "Create custom filters to focus on what matters most to you."
    },
    {
      icon: <Clock className="h-10 w-10 text-amber-500" />,
      title: "Time Tracking",
      description: "Set due dates and reminders to stay on schedule."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
      title: "Progress Tracking",
      description: "See your productivity patterns with detailed analytics."
    },
    {
      icon: <Star className="h-10 w-10 text-yellow-500" />,
      title: "Favorites",
      description: "Mark tasks and projects as favorites for quick access."
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-500" />,
      title: "Instant Updates",
      description: "Real-time synchronization keeps everything up to date."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "TaskPro has transformed our team's productivity. The smart filtering features help me focus on what's important."
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      content: "The project organization in TaskPro is exceptional. I can easily track my tasks and collaborate with my team."
    },
    {
      name: "Emily Roberts",
      role: "Marketing Director",
      content: "I love how TaskPro lets me visualize my week ahead. The interface is intuitive and the color-coding helps me prioritize."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-no-repeat bg-cover opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                    TaskPro
                  </h1>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                Manage Tasks Like a Pro
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
                Boost your productivity with TaskPro's powerful task management system. Organize, prioritize, and track your projects with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {user ? (
                  <Button
                    size="lg"
                    className="text-lg h-12 px-8 animate-fade-in"
                    onClick={() => navigate("/today")}
                  >
                    Go to App
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="text-lg h-12 px-8 animate-fade-in"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started Free
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg h-12 px-8"
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    featuresSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  See Features
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Check className="h-4 w-4 text-primary" />
                <span>Free 14-day trial</span>
                <span className="mx-2">•</span>
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur opacity-75"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-2 overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                    alt="TaskPro Dashboard"
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-12 bg-gradient-to-r from-primary/5 to-indigo-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">10M+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">99.9%</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">100M+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Tasks Completed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">4.9/5</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Ultimate Productivity</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              TaskPro combines powerful functionality with an intuitive interface to help you manage tasks efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 hover-scale"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Many</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hear what our users have to say about their experience with TaskPro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Simple version */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing for Everyone</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Unlock premium features with our affordable plans.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden border-2 border-primary">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold">$3</span>
                  <span className="text-xl ml-1 text-gray-600 dark:text-gray-400">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Billed monthly or $30 annually</p>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-900">
                <ul className="space-y-4">
                  {[
                    "Unlimited tasks and projects",
                    "Custom filters and favorites",
                    "Priority task management",
                    "Analytics and reports"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8 h-12" size="lg" onClick={() => navigate("/auth")}>
                  Start Free Trial
                </Button>
                <p className="text-sm text-center mt-4 text-gray-500">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Boost Your Productivity?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-white/90">
            Trust TaskPro for your task management needs.
          </p>
          {user ? (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg h-12 px-8 hover:bg-white hover:text-primary"
              onClick={() => navigate("/dashboard")}
            >
              Go to App
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg h-12 px-8 hover:bg-white hover:text-primary"
              onClick={() => navigate("/auth")}
            >
              Get Started Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">TaskPro</h2>
              <p>Elevate your productivity</p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center md:justify-end">
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            <p>© {new Date().getFullYear()} TaskPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
