import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const params = new URLSearchParams(window.location.search);
      const isVerification = params.get("type") === "email_verification";

      if (isVerification) {
        navigate("/auth/verification-success");
      } else if (session) {
        navigate("/trips");
      } else {
        navigate("/auth/signin");
      }
    });
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
    </div>
  );
}
