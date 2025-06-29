
import { Button } from "@/components/ui/button";
import { Search, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  // Simple authentication check - in a real app this would be connected to your auth system
  const isLoggedIn = false; // This would come from your authentication context/state
  
  const handleStartDonating = () => {
    if (isLoggedIn) {
      navigate("/post-creation");
    } else {
      navigate("/login");
    }
  };

  const handleBrowseDonations = () => {
    navigate("/donations");
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-fuchsia-500 to-cyan-500 overflow-hidden">
         
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
                    
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Give a Second Life to Your{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent block animate-pulse">Goods</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Connect with your community to donate items you no longer need and help those who can benefit from them.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-xl transform hover:scale-105 transition-all duration-300" 
              onClick={handleStartDonating}
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Donating
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-xl transform hover:scale-105 transition-all duration-300" 
              onClick={handleBrowseDonations}
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Donations
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
