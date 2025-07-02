
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "./pages/Signup";
import PostCreation from "@/pages/PostCreation";
import Profile from "./pages/Profile";
import Donations from "@/pages/Donations";
import Admin from "./pages/Admin";
import Admin_Login from "./pages/Admin_login";


const App = () => {
  return (
      <BrowserRouter>
        <TooltipProvider>
          <div className="min-h-screen">
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/post-creation" element={<PostCreation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/Admin_login" element={<Admin_Login />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
  );
};

export default App;
