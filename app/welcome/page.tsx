"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function WelcomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      action: isLogin ? "login" : "register",
      username: formData.get("username"),
      password: formData.get("password"),
      ...(isLogin ? {} : { email: formData.get("email") }),
    };

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      // Store token in cookie
      Cookies.set("token", result.token, { expires: 7 }); // Expires in 7 days
      localStorage.setItem("user", JSON.stringify(result.user));

      // Force a router refresh to update authentication state
      router.refresh();

      // Redirect to dashboard
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto max-w-7xl px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Welcome text */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text">
                Welcome Back
              </h1>
              <p className="text-xl text-purple-700 font-medium">
                {isLogin
                  ? "Sign in to continue your journey"
                  : "Join the grid management revolution"}
              </p>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Take control of a modern power grid, balance supply and demand,
              maintain grid frequency, and lead the transition to renewable
              energy.
            </p>
          </div>

          {/* Right side - Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-900/10 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-purple-900"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-xl border border-purple-100 px-4 py-3 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 bg-white/50 text-gray-900"
                    placeholder="Enter your username"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-purple-900"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1 block w-full rounded-xl border border-purple-100 px-4 py-3 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 bg-white/50 text-gray-900"
                      placeholder="Enter your email"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-purple-900"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-xl border border-purple-100 px-4 py-3 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 bg-white/50 text-gray-900"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm rounded-lg p-4 border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <span className="flex items-center justify-center gap-2 text-white">
                    {loading
                      ? "Processing..."
                      : isLogin
                      ? "Sign In"
                      : "Create Account"}
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-900 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  {isLogin
                    ? "Need an account? Register"
                    : "Already have an account? Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
