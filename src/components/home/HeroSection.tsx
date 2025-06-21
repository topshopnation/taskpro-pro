
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
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
                  Start Free Trial
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
              <span className="mx-2">•</span>
              <Check className="h-4 w-4 text-primary" />
              <span>Full feature access</span>
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
  );
};
