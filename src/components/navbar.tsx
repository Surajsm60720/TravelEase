import { Link, useLocation } from "react-router-dom";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";
import { UserCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthPage = location.pathname.startsWith("/auth/");
  if (isAuthPage) return null;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Search" },
    ...(user
      ? [
          { to: "/trips", label: "Trips" },
          { to: "/directions", label: "Directions" },
        ]
      : []),
  ];

  return (
    <nav className="bg-background border-b p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="flex justify-between items-center md:hidden">
          <Link to="/">
            <Logo />
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-muted rounded-md"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
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

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="pt-4 pb-2 space-y-1"
              >
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        location.pathname === link.to
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-t border-border my-4"
              />

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="px-3 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  {user ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-destructive hover:text-destructive/90"
                    >
                      Sign out
                    </Button>
                  ) : (
                    <Link
                      to="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="default" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
                {user && (
                  <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md bg-muted">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
