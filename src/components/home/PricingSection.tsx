
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const PricingSection = () => {
  const navigate = useNavigate();

  const features = [
    "Unlimited tasks and projects",
    "Custom filters and favorites",
    "Priority task management",
    "Analytics and reports",
    "Smart scheduling",
    "Team collaboration"
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Free Trial Today</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience all TaskPro features with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden border-2 border-primary">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">TaskPro Free Trial</h3>
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-primary">14</span>
                <span className="text-xl ml-2 text-gray-600 dark:text-gray-400">days free</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Full access to all features
              </p>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-900">
              <ul className="space-y-4">
                {features.map((feature, index) => (
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
  );
};
