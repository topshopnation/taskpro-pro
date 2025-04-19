
import { FolderKanban, Filter, Clock, CheckCircle, Star, Zap } from "lucide-react";

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

export const FeaturesSection = () => {
  return (
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
  );
};
