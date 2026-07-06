import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import axiosInstance from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    const patterns = [
      /ATS\s*Score[:\s]+(\d+)\s*\/\s*100/i,
      /ATS\s*Score[:\s]+(\d+)/i,
      /score\s+(?:is\s+|of\s+)?(\d+)\s*\/\s*100/i,
      /(\d+)\s*\/\s*100/,
      /score\s+(?:is\s+|of\s+)?(\d+)/i,
      /around\s+(\d+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1], 10);
        if (!isNaN(score) && score >= 0 && score <= 100) return score;
      }
    }
    return null;
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

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  const atsScore = result ? extractAtsScore(result) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-white">🤖 AI Resume Analyzer</h1>
            <p className="text-gray-400 text-sm mt-1">Powered by LLaMA 3.3 70B via Groq</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">
              Hi, <span className="text-white font-semibold">{fullName}</span>
            </span>
            <button
              onClick={() => navigate("/history")}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              📋 History
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-white">📄 Upload Resume (PDF)</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="mb-3 text-gray-300 text-sm block w-full
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-medium file:bg-blue-600 file:text-white
              file:hover:bg-blue-700 file:cursor-pointer file:transition"
          />
          <textarea
            placeholder="Or paste your resume text here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="w-full h-40 p-3 bg-gray-700 rounded-lg text-white outline-none
              resize-none text-sm border border-gray-600 focus:border-blue-500 transition"
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-white">
            🎯 Job Description{" "}
            <span className="text-gray-400 font-normal text-sm">(Optional)</span>
          </h2>
          <textarea
            placeholder="Paste job description here for better analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-32 p-3 bg-gray-700 rounded-lg text-white outline-none
              resize-none text-sm border border-gray-600 focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={analyzeResume}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
            text-white font-bold py-4 rounded-xl text-lg transition mb-6 shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing your resume...
            </span>
          ) : "🔍 Analyze Resume"}
        </button>

        {result && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            {atsScore !== null && (
              <div className="flex flex-col items-center justify-center mb-8">
                <div className={`border-4 ${getScoreBg(atsScore)} rounded-full
                  w-32 h-32 flex flex-col items-center justify-center shadow-lg`}>
                  <span className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                    {atsScore}
                  </span>
                  <span className="text-gray-400 text-xs">/ 100</span>
                  <span className="text-gray-400 text-xs">ATS Score</span>
                </div>
                <span className={`mt-3 text-sm font-semibold ${getScoreColor(atsScore)}`}>
                  {getScoreLabel(atsScore)}
                </span>
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">
              📊 Analysis Result
            </h2>
            <div className="text-gray-300 text-sm prose prose-invert max-w-none
              prose-headings:text-white prose-strong:text-white
              prose-li:text-gray-300 prose-p:text-gray-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}