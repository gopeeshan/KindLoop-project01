import { useState } from "react";
import { Menu, X, Recycle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simple authentication check - in a real app this would be connected to your auth system
  const isLoggedIn = true; // Change this to false to see login/signup buttons

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Recycle className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">
                KindLoop
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                A Reuse and Donation Space Platform
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              href="#browse"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Browse Items
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How It Works
            </a>

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
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

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#home"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Home
              </a>
              <a
                href="#browse"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Browse Items
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                How It Works
              </a>

              {isLoggedIn ? (
                <div className="px-3 py-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
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
