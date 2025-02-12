import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";
import { UserCircle } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isAuthPage = location.pathname.startsWith("/auth/");
  if (isAuthPage) return null;

  return (
    <nav className="bg-background border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            to="/"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium",
              location.pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium",
              location.pathname === "/search"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Search
          </Link>
          {user && (
            <>
              <Link
                to="/trips"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  location.pathname === "/trips"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                Trips
              </Link>
              <Link
                to="/directions"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  location.pathname === "/directions"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                Directions
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="h-6 w-6" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Link to="/auth/signin">
              <Button variant="default">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
