import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <AuthForm type="signin" />
      </div>
    </div>
  );
}
