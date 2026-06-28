import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import ReactMarkdown from "react-markdown";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get("/api/resume/history");
        setHistory(response.data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📋 Scan History</h1>
            <p className="text-gray-400 text-sm mt-1">{history.length} scan{history.length !== 1 ? "s" : ""} found</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            ← Back to Analyzer
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400">No scan history yet.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition"
            >
              Analyze your first resume
            </button>
          </div>
        ) : (
          history.map((scan) => {
            const score = extractAtsScore(scan.analysisResult);
            const isExpanded = expanded === scan.id;
            return (
              <div key={scan.id} className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">

                {/* Top row */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-blue-400 text-sm font-semibold">
                      📅 {new Date(scan.scannedAt).toLocaleString()}
                    </span>
                    <span className="ml-3 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                      Scan #{scan.id}
                    </span>
                  </div>
                  {score && (
                    <div className={`border-2 ${getScoreBg(score)} rounded-full w-14 h-14 flex flex-col items-center justify-center`}>
                      <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
                      <span className="text-gray-400 text-xs">/100</span>
                    </div>
                  )}
                </div>

                {/* Resume Preview */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Resume Preview</p>
                  <p className="text-gray-300 text-sm line-clamp-2">{scan.resumeText}</p>
                </div>

                {/* Expand/Collapse */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : scan.id)}
                  className="text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  {isExpanded ? "▲ Hide Analysis" : "▼ View Full Analysis"}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Analysis Result</p>
                    <div className="text-gray-300 text-sm prose prose-invert max-w-none">
                      <ReactMarkdown>{scan.analysisResult}</ReactMarkdown>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}