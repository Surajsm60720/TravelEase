import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Icons } from "../icons";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (showResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) throw error;
        navigate("/auth/verify-email");
        return;
      }

      if (type === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        console.log("Signup successful:", data);
        navigate("/auth/verify-email");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        console.log("Signin successful:", data);
        navigate("/trips");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google auth error:", error);
      setError(error.message || "An error occurred with Google sign in");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {type === "signin" ? "Sign in" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {type === "signin"
            ? "Enter your email and password to sign in"
            : "Enter your details to create your account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>

          {!showResetPassword && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    type === "signin" ? "current-password" : "new-password"
                  }
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center hover:text-accent-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}

          {type === "signin" && !showResetPassword && (
            <Button
              type="button"
              variant="link"
              className="px-0 font-normal"
              onClick={() => setShowResetPassword(true)}
            >
              Forgot password?
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {showResetPassword
              ? "Send reset instructions"
              : type === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>
          {type === "signin" ? (
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate("/auth/signup")}
              >
                Create one
              </Button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate("/auth/signin")}
              >
                Sign in
              </Button>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
