import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Main 404 SVG */}
            <svg
              className="w-full max-w-md h-auto animate-float"
              viewBox="0 0 400 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Background circles */}
              <circle cx="100" cy="100" r="60" fill="url(#gradient1)" opacity="0.1" className="animate-pulse" />
              <circle cx="300" cy="100" r="60" fill="url(#gradient2)" opacity="0.1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />

              {/* 404 Text */}
              <text
                x="200"
                y="130"
                fontSize="120"
                fontWeight="800"
                textAnchor="middle"
                fill="url(#gradient1)"
                className="font-bold"
              >
                404
              </text>

              {/* Decorative elements */}
              <circle cx="80" cy="60" r="8" fill="#3b82f6" className="animate-bounce" />
              <circle cx="320" cy="140" r="6" fill="#8b5cf6" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
              <circle cx="200" cy="40" r="5" fill="#ec4899" className="animate-bounce" style={{ animationDelay: '0.6s' }} />
            </svg>

            {/* Floating favicon icon */}
            <div className="absolute -top-6 -right-6 animate-bounce-slow">
              <img 
                src="/android-chrome-192x192.png" 
                alt="SpreadLov" 
                className="w-12 h-12 rounded-lg shadow-lg"
                width="192"
                height="192"
              />
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-fade-in">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-2 max-w-lg mx-auto animate-fade-in-delay">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-10 animate-fade-in-delay-2">
          It might have been moved or deleted.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
          <Button
            onClick={() => setLocation("/")}
            size="lg"
            className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Home className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Go Home
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            size="lg"
            className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </Button>
        </div>

        {/* Decorative bottom text */}
        <div className="mt-16 animate-fade-in-delay-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Lost? Let's get you back on track 💙
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.6s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 0.6s ease-out 0.8s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
