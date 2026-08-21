"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { signUp } from "@/lib/auth-client";

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthConfig = [
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-orange-500" },
  { label: "Strong", color: "bg-green-500" },
  { label: "Very Strong", color: "bg-emerald-400" },
];

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("Please agree to the terms"); return; }
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    setError("");

    const result = await signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`.trim(),
    });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Account created!</h1>
          <p className="text-white/50">Redirecting you to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#111833] relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/15 blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 left-1/4 h-[200px] w-[200px] rounded-full bg-indigo-500/10 blur-[80px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 max-w-md text-center space-y-8 px-8"
        >
          <div className="flex gap-8 justify-center">
            {[
              { value: "10K+", label: "Patients" },
              { value: "500+", label: "Clinics" },
              { value: "100K+", label: "Appointments" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Join the future of dental care</h2>
            <p className="mt-3 text-white/40">Trusted by 500+ clinics worldwide.</p>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[#0a0f1e]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-5"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white font-bold text-lg mb-6">S</div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-1.5 text-sm text-white/50">Start your 14-day free trial</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Clinic Name</label>
              <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" placeholder="Bright Smile Dental" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" placeholder="you@clinic.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Phone <span className="text-white/30">(Optional)</span></label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" placeholder="+1 (555) 000-0000" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthConfig[strength - 1].color : "bg-white/10"}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength >= 3 ? "text-emerald-400" : strength >= 2 ? "text-amber-400" : "text-red-400"}`}>
                    {strengthConfig[strength - 1]?.label ?? "Very Weak"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none" placeholder="Confirm your password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordsMatch && <p className="text-xs text-emerald-400 flex items-center gap-1"><Check className="h-3 w-3" /> Passwords match</p>}
              {passwordsMismatch && <p className="text-xs text-red-400 flex items-center gap-1"><X className="h-3 w-3" /> Passwords don&apos;t match</p>}
            </div>

            <label className="flex items-start gap-2 text-sm text-white/50 pt-1 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded accent-primary" />
              <span>I agree to the <a href="#" className="text-white hover:text-white/80 underline">Terms of Service</a> and <a href="#" className="text-white hover:text-white/80 underline">Privacy Policy</a></span>
            </label>

            <button type="submit" disabled={loading || !agreed} className="flex w-full h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#0a0f1e] px-3 text-white/30">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors text-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 transition-colors text-sm">
              <svg className="h-4 w-4" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              Microsoft
            </button>
          </div>

          <p className="text-center text-sm text-white/50 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-white/80 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
