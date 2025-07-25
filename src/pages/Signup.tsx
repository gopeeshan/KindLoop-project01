import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    nic: "",
    contactNumber: "",
    occupation: "",
    address: "",
    district: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/Signup.php",
        {
          // method: "POST",
          // headers: { "Content-Type": "application/json" },
          // body: JSON.stringify(formData),
          fullName: formData.fullName,
          email: formData.email,
          nic: formData.nic,
          contactNumber: formData.contactNumber,
          occupation: formData.occupation,
          address: formData.address,
          district: formData.district,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      const data = response.data;

      toast({
        title: data.status === "success" ? "Account Created" : "Signup Failed",
        description: data.message,
        variant: data.status === "success" ? "default" : "destructive",
      });

      if (data.status === "success") {
        
        setFormData({
          fullName: "",
          email: "",
          nic: "",
          contactNumber: "",
          occupation: "",
          address: "",
          district: "",
          password: "",
          confirmPassword: "",
        });
        localStorage.setItem("isLoggedIn", "true");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Signup error:", error.message);
      } else {
        console.error("Signup error:", error);
      }
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const districtList = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Recycle className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                KindLoop
              </span>
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <p className="text-muted-foreground">
              Join our community of kind givers
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "fullName", label: "Full Name", type: "text" },
                { name: "email", label: "Email Address", type: "email" },
                { name: "nic", label: "NIC", type: "text" },
                { name: "contactNumber", label: "Contact Number", type: "tel" },
                { name: "occupation", label: "Occupation", type: "text" },
                { name: "address", label: "Address", type: "text" },
              ].map((field) => (
                <div className="space-y-2" key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    // value={formData.password}
                    value={(formData as any)[field.name]}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <select
                  id="district"
                  name="district"
                  className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select your district</option>
                  {districtList.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {[
                { name: "password", label: "Password", type: "password" },
                {
                  name: "confirmPassword",
                  label: "Confirm Password",
                  type: "password",
                },
              ].map((field) => (
                <div className="space-y-2" key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    //  value={formData.confirmPassword}
                    value={(formData as any)[field.name]}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              ))}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
