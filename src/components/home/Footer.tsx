
export const Footer = () => {
  return (
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
  );
};
