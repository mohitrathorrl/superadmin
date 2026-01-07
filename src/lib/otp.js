export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function otpExpiry(minutes = 5) {
  const d = new Date()
  d.setMinutes(d.getMinutes() + minutes)
  return d
}
