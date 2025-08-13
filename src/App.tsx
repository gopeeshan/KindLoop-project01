
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/index";
import Login from "@/pages/Login";
import Signup from "./pages/Signup";
import PostCreation from "@/pages/PostCreation";
import Profile from "./pages/Profile";
import Donations from "@/pages/donations";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/Admin_login";
import DonationDetails from "./pages/DonationDetails";
import Profiledd from "./pages/ProfileDD";
import ComplaintHandle from "./pages/ComplaintHandle"


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
              <Route path="/donation/:id" element={<DonationDetails />} />
              <Route path="/profiledonation/:id" element={<Profiledd />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/Admin_login" element={<AdminLogin />} />
              <Route path="/admin/complaints" element={<ComplaintHandle />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
  );
};

export default App;
