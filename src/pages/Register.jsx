import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/auth/register", {
        fullName,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("fullName", response.data.fullName);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🤖</div>
          <h1 className="text-3xl font-bold text-white">AI Resume Analyzer</h1>
          <p className="text-gray-400 mt-2 text-sm">Powered by LLaMA 3.3 70B via Groq</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Create Account</h2>

          {error && (
            <div className="bg-red-900 border border-red-600 text-red-300 text-sm px-4 py-3 rounded-lg mb-4 text-center">
              ⚠️ {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white outline-none border border-gray-600 focus:border-blue-500 transition text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white outline-none border border-gray-600 focus:border-blue-500 transition text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white outline-none border border-gray-600 focus:border-blue-500 transition text-sm"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <p className="text-gray-400 text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}