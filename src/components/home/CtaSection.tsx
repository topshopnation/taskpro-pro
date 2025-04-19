
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const CtaSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
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
  );
};
