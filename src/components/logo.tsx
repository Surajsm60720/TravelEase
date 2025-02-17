import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur opacity-70" />
        <div className="relative bg-background rounded-full p-2">
          <Plane className="h-5 w-5 text-primary rotate-45" />
        </div>
      </div>
      {showText && (
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600">
          TravelEase
        </span>
      )}
    </div>
  );
}
