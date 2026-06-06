import { useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()

function App() {
  const [resume, setResume] = useState("")
  const [result, setResult] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const handlePdfUpload = async (e) => {
  const file = e.target.files[0]
  if(!file) return
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ""
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(" ") + "\n"
    }
    console.log(text)
    setResume(text)
}
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
            content: `You are an ATS expert. Analyze this resume against the job description and give:
1. ATS Score out of 100
2. Top 3 strengths
3. Top 3 improvements needed

Resume: ${resume}
Job Description: ${jobDescription}`
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white p-8">
      <div className="max-w-3xl mx-auto text-center bg-gray-800 rounded-3xl p-8 mt-10 shadow-2xl">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">
          AI Resume Analyzer
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Upload your resume · Paste job description · Get ATS match score instantly
        </p>
        <label className="flex items-center justify-center w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer mb-4 transition-all duration-300">
  📄 Upload PDF Resume
  <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
</label>
        <textarea
          className="w-full h-40 p-4 bg-gray-800 text-white rounded-xl border border-gray-600"
          placeholder="Paste your resume here..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
        />
        <textarea
        className="w-full h-40 p-4 bg-gray-800 text-white rounded-xl border-gray-600 mt-4"
        placeholder="Paste job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        />
        <button
          onClick={analyzeResume}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-xl transition-all duration-300"
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