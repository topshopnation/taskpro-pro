
export const StatsSection = () => {
  return (
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
  );
};
