import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF4EC] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#36454F] mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-8">Page not found</p>
        <Link 
          to="/" 
          className="bg-[#6B7F39] text-white px-6 py-3 rounded-lg hover:bg-[#5a6930] transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
