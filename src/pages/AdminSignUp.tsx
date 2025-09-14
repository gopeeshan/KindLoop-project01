import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const AdminSignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    nic: "",
    contactNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [nicError, setNicError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [fullNameError, setFullNameError] = useState(false);
    const [addressError, setAddressError] = useState(false);

     const isPasswordStrong = (password: string): boolean => {
       const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
       return regex.test(password);
     };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validation checks
    if (name === "password") {
      setPasswordStrengthError(!isPasswordStrong(value));
    }
    if (name === "nic") {
      const isValidNIC =
        /^[0-9]{9}[vVxX]$/.test(value) || /^[0-9]{12}$/.test(value);
      setNicError(!isValidNIC);
    }
    if (name === "contactNumber") {
      const isValidPhone = /^07[0-9]{8}$/.test(value);
      setPhoneError(!isValidPhone);
    }
    if (name === "email") {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(!isValidEmail);
    }
  };

  // Validate other fields (like fullName, address)
  const validateOtherFields = () => {
    let valid = true;

    if (!/^[A-Za-z\s]{3,}$/.test(formData.fullName.trim())) {
      setFullNameError(true);
      valid = false;
    } else setFullNameError(false);

    if (
      !/^[A-Za-z0-9\s,./-]{5,100}$/.test(formData.address.trim()) ||
      /[<>]/.test(formData.address)
    ) {
      setAddressError(true);
      valid = false;
    } else setAddressError(false);

    return valid;
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

const isValid = validateOtherFields();

if (
  !formData.email ||
  !formData.nic ||
  !formData.contactNumber ||
  !formData.password ||
  emailError ||
  nicError ||
  phoneError ||
  passwordStrengthError ||
  !isValid
) {
  return;
}


    setIsLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;

      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/AdminSignup.php",
        { ...submitData }
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
          address: "",
          password: "",
          confirmPassword: "",
        });
        localStorage.setItem("isLoggedIn", "true");
        navigate("/admin");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div
          className="flex items-center gap-2 mb-8 cursor-pointer text-primary hover:underline"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Admin Page</span>
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
            {/* <p className="text-muted-foreground">
              Join our community of kind givers
            </p> */}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {fullNameError && (
                  <p className="text-sm text-red-500">
                    Full name must be at least 3 letters (A–Z only).
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {emailError && (
                  <p className="text-sm text-red-500">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <Input
                  id="nic"
                  name="nic"
                  type="text"
                  placeholder="Enter your NIC"
                  value={formData.nic}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {nicError && formData.nic.length > 0 && (
                  <p className="text-sm text-red-500">
                    NIC must be 9 digits followed by 'V' or 'X', or 12 digits
                    only.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  placeholder="Enter your contact number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {phoneError && formData.contactNumber.length > 0 && (
                  <p className="text-sm text-red-500">
                    Contact number must be 10 digits starting with 07.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {addressError && (
                  <p className="text-sm text-red-500">
                    Address must be 5–100 characters, no &lt; or &gt; allowed.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {passwordStrengthError && formData.password.length > 0 && (
                  <p className="text-sm text-red-500">
                    Password must be at least 8 characters long and include
                    uppercase, lowercase, number, and special character.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  passwordStrengthError ||
                  nicError ||
                  phoneError ||
                  emailError ||
                  !formData.nic ||
                  !formData.contactNumber ||
                  !formData.email
                }
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSignUp;
