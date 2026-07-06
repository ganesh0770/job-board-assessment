// import { useTheme } from "@/context/ThemeContext";
// import { useState, useRef, useEffect } from "react";
// import { Monitor, Moon, Sun } from "lucide-react"; // Or your icon pack
// import { toast } from "sonner"; // Or your toast library

// export function ThemeSwitcher() {
//   const { theme, setTheme } = useTheme(); // 👈 Access global state here
//   const [isOpen, setIsOpen] = useState(false);

//   const ActiveIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;

//   return (
//     <div className="relative">
//       <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl">
//         <ActiveIcon className="h-4 w-4" />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 bg-white dark:bg-slate-950 border p-1 rounded-xl shadow-lg z-50 flex flex-col gap-1">
//           {(['system', 'dark', 'light'] as const).map((t) => {
//             const Icon = t === 'system' ? Monitor : t === 'dark' ? Moon : Sun;
//             return (
//               <button
//                 key={t}
//                 onClick={() => {
//                   setTheme(t); // 👈 Sets it globally for all pages instantly!
//                   toast(`Theme targeted to: ${t}`, { icon: '🌓' });
//                   setIsOpen(false);
//                 }}
//                 className={`flex items-center gap-2 p-2 rounded-lg text-sm ${theme === t ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50' : 'text-slate-500'}`}
//               >
//                 <Icon className="h-3.5 w-3.5" />
//                 <span className="capitalize">{t}</span>
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }