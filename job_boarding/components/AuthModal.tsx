"use client"; 
import { toast } from 'react-hot-toast'; 
import React, { useState, useRef, useEffect } from 'react'; 
import { Lock, Mail, Users, Briefcase, Loader2, Eye, EyeOff } from 'lucide-react'; 

export default function AuthPage({ 
    onLoginSuccess, 
    API_URL 
 }: { 
    onLoginSuccess: (role: string, token: string) => void; 
    API_URL: string; 
}) { 
    const [isRegister, setIsRegister] = useState(false); 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [role, setRole] = useState("seeker"); 
    const [isLoading, setIsLoading] = useState(false); 
    const [showPassword, setShowPassword] = useState(false); 

    // Interactive Character States 
    const [isPasswordFocused, setIsPasswordFocused] = useState(false); 
    const [isEmailFocused, setIsEmailFocused] = useState(false); 
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); 
    const [leanAngle, setLeanAngle] = useState(0); 

    const containerRef = useRef<HTMLDivElement>(null); 
    const emailInputRef = useRef<HTMLInputElement>(null); 
    const textWidthTrackerRef = useRef<HTMLSpanElement>(null); 

    // --- EFFECT: Handles external mouse tracking --- 
    useEffect(() => { 
        if (isPasswordFocused || isEmailFocused) return; 

        const handleMouseMove = (e: MouseEvent) => { 
            if (!containerRef.current) return; 
            const rect = containerRef.current.getBoundingClientRect(); 

            const avatarCenterX = rect.left + rect.width / 2; 
            const avatarCenterY = rect.top + 40; 

            const dx = e.clientX - avatarCenterX; 
            const dy = e.clientY - avatarCenterY; 
            const angle = Math.atan2(dy, dx); 
            const distance = Math.min(5, Math.hypot(dx, dy) / 45); 

            setMousePos({ 
                x: Math.cos(angle) * distance, 
                y: Math.sin(angle) * distance 
            }); 

            setLeanAngle(Math.max(-8, Math.min(8, dx / 80))); 
        }; 

        window.addEventListener('mousemove', handleMouseMove); 
        return () => window.removeEventListener('mousemove', handleMouseMove); 
    }, [isPasswordFocused, isEmailFocused]); 

    // Sync avatar looking angle with email text length
    useEffect(() => {
        if (isEmailFocused && textWidthTrackerRef.current && emailInputRef.current) { 
            const textWidth = textWidthTrackerRef.current.offsetWidth || 0; 
            const inputWidth = emailInputRef.current.offsetWidth || 1; 
            const progress = Math.min(1, textWidth / inputWidth); 

            setLeanAngle(-12 + progress * 24); 
            setMousePos({ x: -3 + progress * 6, y: 1 }); 
        } 
    }, [email, isEmailFocused]);

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setIsLoading(true); 
        const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"; 

        try { 
            const res = await fetch(`${API_URL}${endpoint}`, { 
                method: 'POST', 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ email, password, role }), 
            }); 

            const data = await res.json(); 
            if (!res.ok) throw new Error(data.detail || "Authentication Error"); 

            if (!isRegister) { 
                onLoginSuccess(data.role, data.access_token); 
                toast.success("Welcome back! Loading your dashboard..."); 
            } else { 
                setIsRegister(false); 
                toast.success("Registration complete! Please sign in."); 
            } 
        } catch (err: unknown) { 
            if (err instanceof Error) { 
                toast.error(err.message); 
            } else { 
                toast.error("An unexpected authentication error occurred."); 
            } 
        } finally { 
            setIsLoading(false); 
        } 
    }; 

    const handleForgotPassword = () => { 
        if (!email) { 
            toast.error("Please enter your email address first!"); 
            return; 
        } 
        toast.success(`Password reset link dispatched to ${email}`); 
    }; 

    return ( 
        <div ref={containerRef} className="w-full flex flex-col items-center relative py-12"> 
            <span ref={textWidthTrackerRef} className="absolute invisible whitespace-pre text-sm font-medium">{email}</span>

            {/* INTERACTIVE ANIMATED AVATAR */} 
            <div className="w-full flex justify-center -mb-1 relative z-20 pointer-events-none"> 
                <svg 
                    width="100" 
                    height="85" 
                    viewBox="0 0 120 100" 
                    className="overflow-visible drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out" 
                    style={{ 
                        transform: `rotate(${leanAngle}deg) translateX(${leanAngle * 0.5}px)`, 
                        transformOrigin: '50px 90px' 
                    }} 
                > 
                    {/* Character Body & Head Base */}
                    <path d="M20,100 C20,40 100,40 100,100 Z" fill="#6366f1" /> 
                    <path d="M30,90 C30,45 90,45 90,90 Z" fill="#e0e7ff" /> 

                    {/* Eyes Layer */}
                    <g transform={(isPasswordFocused || isEmailFocused) ? "translate(0, 0)" : `translate(${mousePos.x}, ${mousePos.y})`} className="transition-all duration-200"> 
                        
                        {/* LEFT EYE WHITE: Handles peek state smoothly */}
                        <circle 
                            cx="48" 
                            cy="65" 
                            r={isPasswordFocused ? (showPassword ? "9" : "0") : "9"} 
                            fill="white" 
                            className="transition-all duration-200" 
                        /> 
                        
                        {/* RIGHT EYE WHITE */}
                        <circle 
                            cx="72" 
                            cy="65" 
                            r={isPasswordFocused ? (showPassword ? "9" : "0") : "9"} 
                            fill="white" 
                            className="transition-all duration-200" 
                        /> 

                        {/* LEFT PUPIL */}
                        <circle 
                            cx="48" 
                            cy="65" 
                            r={isPasswordFocused ? (showPassword ? "4.5" : "0") : "4.5"} 
                            fill="#1e1b4b" 
                            className="transition-all duration-200" 
                        /> 
                        
                        {/* RIGHT PUPIL */}
                        <circle 
                            cx="72" 
                            cy="65" 
                            r={isPasswordFocused ? (showPassword ? "4.5" : "0") : "4.5"} 
                            fill="#1e1b4b" 
                            className="transition-all duration-200" 
                        /> 

                        {/* ROUND GLASSES FRAMES */}
                        <circle cx="48" cy="65" r="14" fill="none" stroke="#312e81" strokeWidth="2.5" opacity="0.8" />
                        <circle cx="72" cy="65" r="14" fill="none" stroke="#312e81" strokeWidth="2.5" opacity="0.8" />
                        <path d="M62,65 Q60,63 58,65" stroke="#312e81" strokeWidth="2.5" fill="none" />
                    </g> 

                    {/* Mouth Element */}
                    {isEmailFocused ? ( 
                        <circle cx="60" cy="78" r="5" fill="#1e1b4b" className="transition-all duration-200" /> 
                    ) : ( 
                        <path 
                            d={isPasswordFocused ? "M52,78 Q60,78 68,78" : "M52,76 Q60,84 68,76"} 
                            stroke="#1e1b4b" 
                            strokeWidth="3" 
                            fill="none" 
                            strokeLinecap="round" 
                            className="transition-all duration-300" 
                        /> 
                    )} 

                    {/* HANDS / SHY PEEK-A-BOO ANIMATION */}
                    <g className="transition-all duration-300 ease-out"> 
                        {/* Left Hand: drops down smoothly to Y=85 (revealing eye) if showPassword is true */}
                        <circle 
                            cx={isPasswordFocused ? (showPassword ? "22" : "48") : "22"} 
                            cy={isPasswordFocused ? (showPassword ? "85" : "64") : "85"} 
                            r="10" 
                            fill="#4f46e5" 
                            className="transition-all duration-300 ease-in-out"
                        /> 

                        {/* Right Hand: drops down smoothly to Y=85 (revealing eye) if showPassword is true */}
                        <circle 
                            cx={isPasswordFocused ? (showPassword ? "98" : "72") : "98"} 
                            cy={isPasswordFocused ? (showPassword ? "85" : "64") : "85"} 
                            r="10" 
                            fill="#4f46e5" 
                            className="transition-all duration-300 ease-in-out"
                        /> 
                    </g> 
                </svg> 
            </div> 

            {/* Form Canvas Area */} 
            <div className="w-full flex flex-col justify-between"> 
                <div className="mb-8 text-center"> 
                    <h2 className="text-xl font-bold text-white tracking-tight mb-0.5"> 
                        {isRegister ? "Create Account" : "Welcome Back"} 
                    </h2> 
                    <p className="text-xs text-slate-400"> 
                        {isRegister ? "Get set up in less than 2 minutes." : "Your personal pipeline is waiting."} 
                    </p> 
                </div> 

                <form onSubmit={handleSubmit} className="space-y-6"> 
                    {/* Email Input */}
                    <div> 
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"> 
                            Email Address 
                        </label> 
                        <div className="flex items-center gap-2.5 border border-white/10 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 p-2.5 rounded-xl bg-slate-950/40 transition-all duration-200"> 
                            <Mail className={`h-4 w-4 flex-shrink-0 transition-colors ${isEmailFocused ? 'text-indigo-400' : 'text-slate-500'}`} /> 
                            <input 
                                ref={emailInputRef} 
                                type="email" 
                                required 
                                placeholder="name@company.com" 
                                disabled={isLoading} 
                                onFocus={() => setIsEmailFocused(true)} 
                                onBlur={() => { 
                                    setIsEmailFocused(false); 
                                    setLeanAngle(0); 
                                }} 
                                className="bg-transparent w-full outline-none text-sm text-white placeholder-slate-600 font-medium" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                            /> 
                        </div> 
                    </div> 

                    {/* Password Input */}
                    <div> 
                        <div className="flex justify-between items-center mb-1"> 
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider"> 
                                Password 
                            </label> 
                            {!isRegister && ( 
                                <button 
                                    type="button" 
                                    onClick={handleForgotPassword} 
                                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-0.5" 
                                > 
                                    Forgot? 
                                </button> 
                            )} 
                        </div> 

                        <div className="flex items-center gap-2.5 border border-white/10 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 p-2.5 rounded-xl bg-slate-950/40 transition-all duration-200"> 
                            <Lock className={`h-4 w-4 flex-shrink-0 transition-colors ${isPasswordFocused ? 'text-indigo-400' : 'text-slate-500'}`} /> 
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                placeholder="••••••••" 
                                disabled={isLoading} 
                                onFocus={() => setIsPasswordFocused(true)} 
                                onBlur={() => setIsPasswordFocused(false)} 
                                className="bg-transparent w-full outline-none text-sm text-white placeholder-slate-600 font-medium tracking-wide" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                            /> 
                            <button 
                                type="button" 
                                tabIndex={-1}
                                onMouseDown={(e) => {
                                    // Prevents losing input focus, forcing continuous state updates
                                    e.preventDefault();
                                }}
                                onClick={() => setShowPassword(!showPassword)} 
                                className="text-slate-500 hover:text-slate-300 transition focus:outline-none pr-1 cursor-pointer flex-shrink-0"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4 text-indigo-400" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div> 
                    </div> 

                    {isRegister && ( 
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200"> 
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"> 
                                Select Profile Type 
                            </label> 
                            <div className="grid grid-cols-2 gap-2.5"> 
                                <button 
                                    type="button" 
                                    disabled={isLoading} 
                                    onClick={() => setRole("seeker")} 
                                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${role === "seeker" 
                                        ? "border-indigo-500 bg-indigo-500/10 text-white" 
                                        : "border-white/10 bg-transparent text-slate-400 hover:bg-white/5" 
                                        }`} 
                                > 
                                    <Users className="h-4 w-4 text-indigo-400 flex-shrink-0" /> 
                                    <div> 
                                        <div className="text-xs font-bold">Job Seeker</div> 
                                    </div> 
                                </button> 

                                <button 
                                    type="button" 
                                    disabled={isLoading} 
                                    onClick={() => setRole("recruiter")} 
                                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${role === "recruiter" 
                                        ? "border-indigo-500 bg-indigo-500/10 text-white" 
                                        : "border-white/10 bg-transparent text-slate-400 hover:bg-white/5" 
                                        }`} 
                                > 
                                    <Briefcase className="h-4 w-4 text-indigo-400 flex-shrink-0" /> 
                                    <div> 
                                        <div className="text-xs font-bold">Recruiter</div> 
                                    </div> 
                                </button> 
                            </div> 
                        </div> 
                    )} 

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2.5 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-70" 
                    > 
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} 
                        {isRegister ? "Create Free Profile" : "Sign In to Account"} 
                    </button> 
                </form> 

                <div className="relative my-4"> 
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div> 
                    <div className="relative flex justify-center text-xs"><span className="bg-[#0b0f19] px-2 text-slate-500 font-medium uppercase tracking-wider">or</span></div> 
                </div> 

                <p className="text-center text-xs text-slate-400"> 
                    {isRegister ? "Already registered?" : "New to our board?"} {" "} 
                    <button 
                        disabled={isLoading} 
                        className="text-indigo-400 hover:text-indigo-300 font-bold transition hover:underline focus:outline-none" 
                        onClick={() => { 
                            setIsRegister(!isRegister); 
                            setEmail(""); 
                            setPassword(""); 
                            setShowPassword(false);
                        }} 
                    > 
                        {isRegister ? "Sign In instead" : "Create an Account"} 
                    </button> 
                </p> 
            </div> 
        </div> 
    ); 
}