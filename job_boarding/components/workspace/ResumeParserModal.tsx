// "use client";
// import React, { useState } from 'react';
// import { toast } from 'react-hot-toast';
// import { FileText, Loader2, CheckCircle } from 'lucide-react';

// export default function ResumeParserModal() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     const file = e.target.files[0];
    
//     const formData = new FormData();
//     formData.append("file", file);

//     setLoading(true);
//     setResult(null);
//     try {
//       const res = await fetch("http://localhost:8000/api/v1/parse-resume", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Error matching schema parameters.");
//       setResult(data);
//       toast.success("Resume data clusters aligned and parsed!");
//     } catch (err: any) {
//       toast.error(err.message || "Failed reading application file.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white max-w-xl mx-auto my-4 backdrop-blur-md">
//       <h3 className="text-md font-bold mb-2 flex items-center gap-2"><FileText className="text-purple-400" /> AI Resume Core Parser</h3>
//       <p className="text-xs text-slate-400 mb-4">Upload a text-based PDF file. The layout mapping structures look directly for systemic matches.</p>
      
//       <label className="block border border-dashed border-white/20 hover:border-indigo-500 transition-colors rounded-xl p-4 text-center cursor-pointer bg-slate-950/20">
//         <span className="text-xs text-slate-300 font-medium">{loading ? "Processing Memory Nodes..." : "Select Resume PDF Matrix"}</span>
//         <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={loading} />
//       </label>

//       {loading && <div className="flex justify-center mt-4"><Loader2 className="animate-spin text-indigo-400"/></div>}

//       {result && (
//         <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
//           <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1"><CheckCircle className="h-4 w-4"/> Parse Execution Complete</div>
//           <p><span className="text-slate-500">Extracted Email:</span> {result.email || "None identified"}</p>
//           <p><span className="text-slate-500">Contact Payload:</span> {result.phone || "None identified"}</p>
//           <div>
//             <span className="text-slate-500">Identified Vector Skills:</span>
//             <div className="flex flex-wrap gap-1 mt-1">
//               {result.skills.map((skill: string) => (
//                 <span key={skill} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">{skill}</span>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }