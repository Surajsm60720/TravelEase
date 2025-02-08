import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-background border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            to="/"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium",
              location.pathname === "/"
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white",
            )}
          >
            Discover Places
          </Link>
          <Link
            to="/directions"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium",
              location.pathname === "/directions"
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white",
            )}
          >
            Get Directions
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
