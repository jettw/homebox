"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";

interface StatusResponse {
  health: boolean;
  versions: string[];
  title: string;
  message: string;
  demo: boolean;
  allowRegistration: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loading, error, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    console.log("🔐 Login page auth check:", { isAuthenticated, loading });
    if (isAuthenticated && !loading) {
      console.log("✅ Already authenticated, redirecting to dashboard");
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await apiClient.get<StatusResponse>("/status");
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch status:", err);
        // Set default status if API is unavailable
        setStatus({
          health: false,
          versions: [],
          title: "Homebox",
          message: "",
          demo: false,
          allowRegistration: true,
        });
      }
    };

    fetchStatus();
  }, []);

  const handleLogin = async (
    email: string,
    password: string,
    remember: boolean
  ) => {
    console.log("📝 Login form submitted");
    const success = await login(email, password);
    console.log("📝 Login result:", success);
    if (success) {
      console.log("🚀 Redirecting to dashboard...");
      // Use window.location for more reliable navigation
      window.location.href = "/dashboard";
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    const success = await register(name, email, password, name);
    if (success) {
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
    return success;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          HomeBox
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track, Organize, and Manage your Things
        </p>
      </div>

      {status && !status.health && (
        <div className="mb-4 w-full max-w-md rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm">
          <p className="font-semibold text-yellow-800 dark:text-yellow-200">
            ⚠️ Backend Connection Issue
          </p>
          <p className="mt-1 text-yellow-700 dark:text-yellow-300">
            Unable to connect to the API. Make sure the backend is running at{" "}
            <code className="rounded bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:7745/api/v1"}
            </code>
          </p>
        </div>
      )}

      <div className="w-full max-w-md">
        <LoginForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
          error={error}
          allowRegistration={status?.allowRegistration ?? true}
          isDemoMode={status?.demo ?? false}
        />
      </div>

      {status && status.health && (
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Version {status.versions?.[0] || "unknown"}</p>
        </footer>
      )}
    </div>
  );
}

