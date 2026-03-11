const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {}
  }
}

import React, { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(false)
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [appPublicSettings, setAppPublicSettings] = useState(null)

  useEffect(() => {
    checkAppState()
  }, [])

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true)
      setAuthError(null)
      await checkUserAuth()
      setIsLoadingPublicSettings(false)
    } catch (error) {
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred"
      })
      setIsLoadingPublicSettings(false)
      setIsLoadingAuth(false)
    }
  }

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true)
      const currentUser = await db.auth.me()
      setUser(currentUser)
      setIsAuthenticated(true)
      setIsLoadingAuth(false)
    } catch {
      setIsLoadingAuth(false)
      setIsAuthenticated(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  const navigateToLogin = () => {}

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
