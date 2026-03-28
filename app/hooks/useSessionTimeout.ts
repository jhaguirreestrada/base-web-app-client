'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const TIMEOUT_MINUTES = 3
const GRACE_SECONDS = 60

export function useSessionTimeout(onLogout: () => void) {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(GRACE_SECONDS)

  const onLogoutRef = useRef(onLogout)
  onLogoutRef.current = onLogout

  const showWarningRef = useRef(false)
  
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
  }, [])

  const startCountdown = useCallback(() => {
    clearCountdown()
    setRemainingTime(GRACE_SECONDS)

    countdownIntervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearCountdown()
          onLogoutRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    warningTimeoutRef.current = setTimeout(() => {
      clearCountdown()
      onLogoutRef.current()
    }, GRACE_SECONDS * 1000)
  }, [clearCountdown])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }

    setShowWarning(false)
    setRemainingTime(GRACE_SECONDS)

    const timeoutMs = TIMEOUT_MINUTES * 60 * 1000

    inactivityTimeoutRef.current = setTimeout(() => {
      showWarningRef.current = true
      setShowWarning(true)
      startCountdown()
    }, timeoutMs)
  }, [startCountdown])

  const extendSession = useCallback(() => {
    showWarningRef.current = false
    clearCountdown()
    setShowWarning(false)
    setRemainingTime(GRACE_SECONDS)
    resetInactivityTimer()
  }, [resetInactivityTimer, clearCountdown])

  const logout = useCallback(() => {
    showWarningRef.current = false
    clearCountdown()
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
    onLogoutRef.current()
  }, [clearCountdown])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

    const handleActivity = () => {
      if (!showWarningRef.current) {
        resetInactivityTimer()
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    resetInactivityTimer()

    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
      clearCountdown()
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [resetInactivityTimer, clearCountdown])

  return { showWarning, remainingTime, extendSession, logout }
}