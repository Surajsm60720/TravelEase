import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We've sent you a verification link. Please check your email and click
          the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button variant="secondary" onClick={() => navigate("/auth/signin")}>
          Return to sign in
        </Button>
      </CardContent>
    </Card>
  );
}
