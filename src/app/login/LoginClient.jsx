"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, ArrowRight, Lock } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"

import { apiClient } from "@/lib/api-client"
import { AUTH_API } from "@/lib/api-endpoint"
import { useAuthStore } from "@/lib/store/authStore"

import loginJson from "../../../public/login.json" 

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
)

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((s) => s.login)

  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)

  const otpRefs = useRef([])
  
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Your session has expired. Please login again.", {
        duration: 5000,
      })
    }
  }, [searchParams])

  /* ========================= SEND OTP ========================= */
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!email) {
      toast.error("Email is required")
      return
    }

    try {
      setLoading(true)

      await apiClient(AUTH_API.SEND_OTP, {
        method: "POST",
        body: { email },
      })

      toast.success("OTP sent to your email")
      setStep("otp")

      setTimeout(() => otpRefs.current[0]?.focus(), 200)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ========================= OTP CHANGE ========================= */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const next = [...otp]
    next[index] = value
    setOtp(next)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === "Enter") handleVerifyOtp()
  }

  const handleOtpPaste = (e, index) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "")
    
    if (pasted.length === 6) {
      setOtp(pasted.split(""))
      setTimeout(() => otpRefs.current[5]?.focus(), 100)
    }
  }

  /* ========================= VERIFY OTP ========================= */
  const handleVerifyOtp = async () => {
    if (loading) return

    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast.error("Enter complete OTP")
      return
    }

    try {
      setLoading(true)

      const res = await apiClient(AUTH_API.VERIFY_OTP, {
        method: "POST",
        body: { email, otp: otpValue },
      })

      login({
        user: res.user,
        token: res.token,
      })

      toast.success("Login successful")
      router.replace("/dashboard")

    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ========================= UI ========================= */
  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Animation (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
        <div className="text-center px-8">
          <Player
            autoplay
            loop
            src={loginJson}
            className="max-w-md mx-auto"
            style={{ height: "400px", width: "400px" }}
          />
    
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
         

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 sm:p-8 space-y-6">
             <div className="flex justify-center mb-8">
            <img 
              src="https://fincloud-tech.s3.ap-south-1.amazonaws.com/finclouds_logo.png" 
              alt="FinCloud Logo" 
              className="h-2 sm:h-10"
              style={{width:"300px"}} 
            />
          </div>
            {/* Header */}
            <div className="text-center">
              
              
              <h1 className=" sm:text-3xl font-bold text-zinc-900">
                {step === "email" ? "Sign in" : "Verify OTP"}
              </h1>
             
            </div>

            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-zinc-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                      className="w-full pl-11 pr-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-base"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-black   hover:bg-zinc-800 !text-white text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-base" 
                  disabled={loading || !email}
                >
                  {loading ? (
                    <Spinner size={20} />
                  ) : (
                    <>
                      Continue <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <div className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="text-sm font-medium mb-3 block text-zinc-700 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        value={digit}
                        maxLength={1}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        onPaste={(e) => handleOtpPaste(e, i)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <Button 
                  onClick={handleVerifyOtp} 
                  className="w-full bg-zinc-950 hover:bg-zinc-800 !text-white text-white py-3 rounded-xl font-medium transition-all text-base" 
                  disabled={loading || otp.some(d => !d)}
                >
                  {loading ? <Spinner size={20} /> : "Verify & Login"}
                </Button>

                {/* Resend & Change Email */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                    className="text-sm  text-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setOtp(["", "", "", "", "", ""])
                      setStep("email")
                      setResendCooldown(0)
                    }}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
                  >
                    Change email
                  </button>
                </div>
              </div>
            )}
          </div>

         
         
=======
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-zinc-50">
        <Player
          autoplay
          loop
          src={loginJson}
          className="max-w-md"
          style={{ height: "350px", width: "350px" }}
        />
      </div>

      <div className="flex w-full lg:w-1/2 min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md surface p-8 space-y-6">
          <div className="flex justify-center">
            <img 
              src="https://fincloud-tech.s3.ap-south-1.amazonaws.com/finclouds_logo.png" 
              alt="FinCloud Logo" 
              className="h-6" 
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {step === "email" ? "Sign in to your account" : "Verify OTP"}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {step === "email"
                ? "Enter your email to continue"
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-black"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <Button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
                {loading ? <Spinner size={18} /> : <>Continue <ArrowRight size={16} /></>}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    onPaste={(e) => handleOtpPaste(e, i)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center border rounded-lg focus:ring-2 focus:ring-black"
                  />
                ))}
              </div>

              <Button onClick={handleVerifyOtp} className="btn-primary w-full" disabled={loading}>
                {loading ? <Spinner size={18} /> : "Verify & Login"}
              </Button>

              <button
                onClick={() => {
                  setOtp(["", "", "", "", "", ""])
                  setStep("email")
                }}
                className="text-sm text-zinc-500 hover:underline w-full"
              >
                Change email
              </button>
            </div>
          )}
>>>>>>> 3b2339a499f740d9eebb1e81a220e4d61e27a356
        </div>
      </div>
    </div>
  )
}
