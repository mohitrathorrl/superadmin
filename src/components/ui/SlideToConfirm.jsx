"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronRight } from "lucide-react"

export default function SlideToConfirm({
  onConfirm,
  text = "Slide to confirm",
  successText = "Confirmed!",
  variant = "danger", // "danger" or "primary"
  customColors = null, // 👈 Custom colors support
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef(null)
  const sliderRef = useRef(null)

  const buttonSize = 48
  const threshold = 0.9

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const maxDistance = containerRect.width - buttonSize
      let newPosition = e.clientX - containerRect.left - buttonSize / 2

      newPosition = Math.max(0, Math.min(newPosition, maxDistance))
      setPosition(newPosition)

      if (newPosition / maxDistance >= threshold && !isComplete) {
        setIsComplete(true)
        setIsDragging(false)
        setTimeout(() => {
          onConfirm()
        }, 300)
      }
    }

    const handleTouchMove = (e) => {
      if (!isDragging || !containerRef.current) return

      const touch = e.touches[0]
      const containerRect = containerRef.current.getBoundingClientRect()
      const maxDistance = containerRect.width - buttonSize
      let newPosition = touch.clientX - containerRect.left - buttonSize / 2

      newPosition = Math.max(0, Math.min(newPosition, maxDistance))
      setPosition(newPosition)

      if (newPosition / maxDistance >= threshold && !isComplete) {
        setIsComplete(true)
        setIsDragging(false)
        setTimeout(() => {
          onConfirm()
        }, 300)
      }
    }

    const handleEnd = () => {
      if (isDragging && !isComplete) {
        setIsDragging(false)
        setPosition(0)
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleEnd)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging, isComplete, onConfirm])

  const handleStart = () => {
    if (!isComplete) {
      setIsDragging(true)
    }
  }

  const maxDistance = containerRef.current
    ? containerRef.current.offsetWidth - buttonSize
    : 0
  const progress = maxDistance > 0 ? (position / maxDistance) * 100 : 0

  // 👇 Default color schemes
  const defaultColors = {
    danger: {
      bgColor: "#fee2e2",
      progressBg: "rgba(239, 68, 68, 0.2)",
      buttonBg: "#dc2626",
      buttonHover: "#b91c1c",
      textColor: "#dc2626",
    },
    primary: {
      bgColor: "#dbeafe",
      progressBg: "rgba(59, 130, 246, 0.2)",
      buttonBg: "#2563eb",
      buttonHover: "#1d4ed8",
      textColor: "#2563eb",
    },
  }

  // 👇 Use custom colors if provided, otherwise use variant colors
  const colors = customColors || defaultColors[variant]

  return (
    <div
      ref={containerRef}
      className="relative h-12 rounded-xl overflow-hidden select-none"
      style={{ backgroundColor: colors.bgColor }}
    >
      {/* Progress Bar */}
      <div
        className="absolute inset-0 transition-all"
        style={{
          width: `${progress}%`,
          backgroundColor: colors.progressBg,
        }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-sm font-medium transition-opacity ${
            isComplete ? "opacity-0" : "opacity-100"
          }`}
          style={{ color: colors.textColor }}
        >
          {isComplete ? successText : text}
        </span>
      </div>

      {/* Slider Button */}
      <div
        ref={sliderRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={`absolute top-1 left-1 w-10 h-10 rounded-lg shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform ${
          isDragging ? "scale-105" : ""
        } ${isComplete ? "opacity-0" : "opacity-100"}`}
        style={{
          transform: `translateX(${position}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          backgroundColor: colors.buttonBg,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = colors.buttonHover
        }}
        onMouseLeave={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = colors.buttonBg
        }}
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </div>
    </div>
  )
}
