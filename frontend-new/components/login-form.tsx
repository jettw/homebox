"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface LoginFormProps extends React.ComponentProps<"div"> {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
  onRegister: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  loading: boolean;
  error?: string | null;
  allowRegistration?: boolean;
  isDemoMode?: boolean;
}

export function LoginForm({
  className,
  onLogin,
  onRegister,
  loading,
  error,
  allowRegistration = true,
  isDemoMode = false,
  ...props
}: LoginFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState(isDemoMode ? "demo@example.com" : "");
  const [password, setPassword] = useState(isDemoMode ? "demo" : "");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🎯 Form submitted", { isRegister, email });
    setSuccess(null);
    if (isRegister) {
      console.log("📝 Calling register...");
      const result = await onRegister(name, email, password);
      if (result) {
        setSuccess("Account created successfully! Logging you in...");
      }
    } else {
      console.log("📝 Calling login...");
      await onLogin(email, password, remember);
      console.log("📝 Login handler returned");
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setSuccess(null);
    setEmail(isDemoMode && !isRegister ? "" : email);
    setPassword(isDemoMode && !isRegister ? "" : password);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isRegister ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isRegister
                ? "Register for a new Homebox account"
                : "Login to your Homebox account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {isDemoMode && !isRegister && (
                <div className="rounded-md bg-muted p-3 text-center text-sm">
                  <p className="font-semibold">Demo Instance</p>
                  <p className="text-xs">
                    Email: demo@example.com | Password: demo
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
                  {success}
                </div>
              )}

              {isRegister && (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              {!isRegister && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) =>
                      setRemember(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : isRegister
                      ? "Register"
                      : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
          {allowRegistration && (
            <CardFooter className="flex-col">
              <FieldDescription className="text-center">
                {isRegister ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {isRegister ? "Login" : "Sign up"}
                </button>
              </FieldDescription>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
