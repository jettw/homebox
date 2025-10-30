"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError, type User } from "./client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const token = apiClient.getToken();
    console.log("👤 fetchUser called, token exists:", !!token);
    
    if (!token) {
      console.log("❌ No token, skipping user fetch");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Fetching user info...");
      const userData = await apiClient.getSelf();
      console.log("✅ User fetched:", userData);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
      if (err instanceof ApiError && err.status === 401) {
        console.log("🗑️ Invalid token, clearing");
        apiClient.clearToken();
      }
      setUser(null);
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔐 Attempting login...");
      await apiClient.login(username, password);
      console.log("✅ Login successful, fetching user...");
      await fetchUser();
      console.log("✅ User fetched");
      return true;
    } catch (err) {
      console.error("❌ Login failed:", err);
      const errorMessage =
        err instanceof ApiError
          ? err.data?.message || err.message
          : "Login failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    name: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      // Register the user
      await apiClient.register(username, email, password, name);
      // Registration successful, now login with the credentials
      await apiClient.login(email, password);
      // Fetch user info after login
      await fetchUser();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.data?.message || err.message
          : "Registration failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}

