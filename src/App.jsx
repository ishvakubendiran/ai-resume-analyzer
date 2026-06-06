import { useState } from "react"

function App() {
  const [resume, setResume] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const analyzeResume = async () => {
    setLoading(true)
    const apiKey = import.meta.env.VITE_GROQ_API_KEY

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Analyze this resume and give:
1. ATS Score out of 100
2. Top 3 strengths
3. Top 3 improvements needed

Resume: ${resume}`
          }
        ]
      })
    })

    const data = await response.json()
    if (data.choices) {
      setResult(data.choices[0].message.content)
    } else {
      setResult("Error: " + JSON.stringify(data.error))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">
          AI Resume Analyzer
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Paste your resume and get your ATS score instantly
        </p>
        <textarea
          className="w-full h-64 p-4 bg-gray-800 text-white rounded-xl border border-gray-600"
          placeholder="Paste your resume here..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
        />
        <button
          onClick={analyzeResume}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
        {result && (
          <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-600">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Analysis Result</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App