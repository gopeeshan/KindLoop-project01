import { useState, useEffect } from "react";
import { Menu, X, Recycle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Session-based authentication check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("");

  // Extract first name from full name
  const firstName = userName?.trim()?.split(" ")?.[0] || "";

  // Check session on mount and fetch user name
  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost/KindLoop-project01/Backend/profile.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const loggedIn = !!data && !!data.userID;
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          // Prefer fullName; fallback to name or empty string
          setUserName(data?.fullName || data?.name || "");
        } else {
          setUserName("");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoggedIn(false);
        setUserName("");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Recycle className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">KindLoop</span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                A Reuse and Donation Space Platform
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/#home"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/#how-it-works"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              to="/#browse"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Browse Items
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/profile" aria-label="Profile">
                    <User className="mr-2 h-4 w-4" />
                    {firstName || "Profile"}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/#home"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Home
              </Link>
              <Link
                to="/#how-it-works"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                How It Works
              </Link>
              <Link
                to="/#browse"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Browse Items
              </Link>

              {isLoggedIn ? (
                <div className="px-3 py-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/profile" aria-label="Profile">
                      <User className="mr-2 h-4 w-4" />
                      {firstName || "Profile"}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;