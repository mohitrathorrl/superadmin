"use client";

export default function Spinner({ size = 20 }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      style={{ width: size, height: size }}
    />
  );
}
