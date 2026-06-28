import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import axiosInstance from "../api/axios";
import ReactMarkdown from "react-markdown";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function Dashboard() {
  const [resume, setResume] = useState("");
  const [result, setResult] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName");

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    setResume(text);
  };

  const analyzeResume = async () => {
    if (!resume) return alert("Please upload or paste your resume first.");
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/resume/analyze", {
        resumeText: resume,
        jobDescription: jobDescription,
      });
      setResult(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setResult("Error analyzing resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    navigate("/login");
  };

  const extractAtsScore = (text) => {
    const match = text.match(/around\s+(\d+)|(\d+)\s*\/\s*100/);
    return match ? parseInt(match[1] || match[2]) : null;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "border-green-400";
    if (score >= 60) return "border-yellow-400";
    return "border-red-400";
  };

  const atsScore = result ? extractAtsScore(result) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🤖 AI Resume Analyzer</h1>
            <p className="text-gray-400 text-sm mt-1">Powered by LLaMA 3.3 70B via Groq</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Hi, <span className="text-white font-semibold">{fullName}</span></span>
            <button onClick={() => navigate("/history")} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition">
              📋 History
            </button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
          <h2 className="text-lg font-semibold mb-3">📄 Upload Resume (PDF)</h2>
          <input type="file" accept=".pdf" onChange={handlePdfUpload} className="mb-3 text-gray-300 text-sm" />
          <textarea
            placeholder="Or paste your resume text here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="w-full h-40 p-3 bg-gray-700 rounded-lg text-white outline-none resize-none text-sm border border-gray-600 focus:border-blue-500 transition"
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
          <h2 className="text-lg font-semibold mb-3">💼 Job Description <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
          <textarea
            placeholder="Paste job description here for better analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-32 p-3 bg-gray-700 rounded-lg text-white outline-none resize-none text-sm border border-gray-600 focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={analyzeResume}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl text-lg transition mb-6"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing your resume...
            </span>
          ) : "🔍 Analyze Resume"}
        </button>

        {result && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {atsScore && (
              <div className="flex items-center justify-center mb-6">
                <div className={`border-4 ${getScoreBg(atsScore)} rounded-full w-28 h-28 flex flex-col items-center justify-center`}>
                  <span className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>{atsScore}</span>
                  <span className="text-gray-400 text-xs">/ 100</span>
                  <span className="text-gray-400 text-xs">ATS Score</span>
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4">📊 Analysis Result</h2>
            <div className="text-gray-300 text-sm prose prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}