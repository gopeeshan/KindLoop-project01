
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/index";
;



const App = () => {
  return (
      <BrowserRouter>
        <TooltipProvider>
          <div className="min-h-screen">
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
  );
};

export default App;
