import { VerifyEmail } from "@/components/auth/verify-email";

export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <VerifyEmail />
      </div>
    </div>
  );
}
