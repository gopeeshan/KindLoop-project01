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
  const { toast } = useToast();

  // Form Data
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

  // Validation & Status
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [nicError, setNicError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [fullNameError, setFullNameError] = useState(false);
  const [occupationError, setOccupationError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Password strength regex
  const isPasswordStrong = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  // Handle input change (includes otp input)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "otp") {
      setOtp(value);
      setOtpError("");
      return;
    }

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

  // Validate other fields (like fullName, occupation, address)
  const validateOtherFields = () => {
    let valid = true;

    if (!/^[A-Za-z\s]{3,}$/.test(formData.fullName.trim())) {
      setFullNameError(true);
      valid = false;
    } else setFullNameError(false);

    if (!/^[A-Za-z\s.]{2,}$/.test(formData.occupation.trim())) {
      setOccupationError(true);
      valid = false;
    } else setOccupationError(false);

    if (
      !/^[A-Za-z0-9\s,./-]{5,100}$/.test(formData.address.trim()) ||
      /[<>]/.test(formData.address)
    ) {
      setAddressError(true);
      valid = false;
    } else setAddressError(false);

    return valid;
  };

  // Send OTP Handler
  const handleSendOTP = async () => {
    if (!formData.email || emailError) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address before sending OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost/KindLoop-project01/emailValidationOTP.php",
        { email: formData.email },
        { withCredentials: true }
      );

      if (response.data.success === true) {
        toast({
          title: "OTP Sent",
          description: "Please check your email for the OTP.",
          variant: "default",
        });
        setOtpSent(true);
      } else {
        toast({
          title: "Failed to send OTP",
          description: response.data.message || "Try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "Error",
          description: error.response.data.message || "Failed to send OTP.",
          variant: "destructive",
        });
      } else {
        console.error("Error sending OTP:", error);
        toast({
          title: "Server Error",
          description: "Could not send OTP. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP Handler
  const handleVerifyOTP = async () => {
    if (otp.trim().length === 0) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await axios.post(
        "http://localhost/KindLoop-project01/verifyOTP.php",
        { email: formData.email, otp },
        { withCredentials: true }
      );

      if (response.data.success === true) {
        toast({
          title: "OTP Verified",
          description: "Your email has been verified.",
          variant: "default",
        });
        setIsOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Signup submission (only allowed after OTP verified)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpVerified) {
      toast({
        title: "Verify Email",
        description:
          "Please verify your email by entering OTP before signing up.",
        variant: "destructive",
      });
      return;
    }

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
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/Signup.php",
        { ...formData }
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
        setOtp("");
        setOtpSent(false);
        setIsOtpVerified(false);
        localStorage.setItem("isLoggedIn", "true");
        setTimeout(() => navigate("/login"), 1000);
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
              {/* Full Name */}
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

              {/* Email & OTP Section */}
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
                  disabled={isLoading || isOtpVerified}
                />
                {emailError && (
                  <p className="text-sm text-red-500">
                    Please enter a valid email address.
                  </p>
                )}

                {/* Show Send OTP button if OTP not sent yet */}
                {!otpSent && (
                  <Button
                    type="button"
                    className="mt-2 w-full"
                    onClick={handleSendOTP}
                    disabled={isLoading || emailError || !formData.email}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                )}

                {/* Show OTP input and Verify OTP button only after OTP sent and not yet verified */}
                {otpSent && !isOtpVerified && (
                  <>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter the OTP sent to your email"
                      value={otp}
                      onChange={handleInputChange}
                      disabled={isVerifyingOtp}
                      className="mt-2"
                    />
                    {otpError && (
                      <p className="text-sm text-red-500">{otpError}</p>
                    )}
                    <Button
                      type="button"
                      className="mt-2 w-full"
                      onClick={handleVerifyOTP}
                      disabled={isVerifyingOtp || otp.length === 0}
                    >
                      {isVerifyingOtp ? "Verifying OTP..." : "Verify OTP"}
                    </Button>
                  </>
                )}

                {/* Show verified message */}
                {isOtpVerified && (
                  <p className="text-sm text-green-600 mt-2">
                    Email verified successfully.
                  </p>
                )}
              </div>

              {/* NIC */}
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

              {/* Contact Number */}
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

              {/* Occupation */}
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  type="text"
                  placeholder="Enter your occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {occupationError && (
                  <p className="text-sm text-red-500">
                    Occupation must be letters only, at least 2 characters.
                  </p>
                )}
              </div>

              {/* Address */}
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

              {/* District */}
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

              {/* Password */}
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

              {/* Confirm Password */}
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
                  !isOtpVerified || // Disable signup unless OTP verified
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
