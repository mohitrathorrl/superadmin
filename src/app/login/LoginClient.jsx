"use client" // ✅ MOVED TO TOP

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic" // ✅ ADD THIS

import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"

import { apiClient } from "@/lib/api-client"
import { AUTH_API } from "@/lib/api-endpoint"
import { useAuthStore } from "@/lib/store/authStore"

import loginJson from "../../../public/login.json" 

// ✅ DYNAMIC IMPORT FOR LOTTIE PLAYER
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
        expiresIn: res.expiresIn || 60,
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
        </div>
      </div>
    </div>
  )
}
