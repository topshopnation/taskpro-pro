
import { Star } from "lucide-react";

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

export const TestimonialsSection = () => {
  return (
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
  );
};
