import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Gift,
  Heart,
  Star,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Bell,
  X,
  TrendingUp,
  Eye,
  EyeOff,
  Coins,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MessagesBar from "@/components/MessagesBar";
import { CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToastAction } from "@/components/ui/toast";

interface Notification {
  notificationID: number;
  userID: number;
  from_UserID: number;
  type: string;
  created_at: string;
  donation_title: string;
  requester_name: string;
  complaint_solution?: string;
}

interface Donation {
  DonationID: number;
  title: string;
  category: string;
  date_time: string;
  isVerified: number;
  isDonationCompleted: number;
  credits: number;
  setVisible: number; // 1 = Public, 0 = Private
}

interface User {
  fullName: string;
  email: string;
  contactNumber?: string;
  occupation?: string;
  address?: string;
  credit_points: number;
  userID: number | null;
  avatar?: string | null;
  year_points: number;
  current_year_requests: number;
  current_year_request_limit: number;
}

interface ReceivedItem {
  DonationID: number;
  title: string;
  donor: string;
  received_date: string;
}

interface ToBeReceivedItem {
  DonationID: number;
  id: number;
  title: string;
  category: string;
  donorID: number;
  donor: string;
  donorContact: string;
  received_date: string;
  quantity: number;
  credits: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrengthError, setPasswordStrengthError] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    contactNumber: "",
    occupation: "",
    address: "",
  });

  const [user, setUser] = useState<User>({
    fullName: "",
    email: "",
    contactNumber: "",
    occupation: "",
    address: "",
    credit_points: 0,
    userID: null,
    avatar: null,
    year_points: 0,
    current_year_requests: 0,
    current_year_request_limit: 12,
  });

  const [formData, setFormData] = useState(user);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [receivedHistory, setReceivedHistory] = useState<ReceivedItem[]>([]);
  const [toBeReceivedItems, setToBeReceivedItems] = useState<
    ToBeReceivedItem[]
  >([]);
  const [complaintData, setComplaintData] = useState<{
    reason: string;
    description: string;
    evidence_images?: File[];
  }>({
    reason: "",
    description: "",
    evidence_images: undefined,
  });

  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ToBeReceivedItem | null>(
    null
  );
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [isCreditsDialogOpen, setCreditsDialogOpen] = useState(false);

  // For soft-delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Donation | null>(null);

  const fetchUserCredits = async (userID: number) => {
    try {
      const res = await axios.get(
        `http://localhost/KindLoop-project01/Backend/get_credits.php?userID=${userID}`
      );

      if (res.data.status === "success") {
        const data = res.data.data;
        setUser((prev) => ({
          ...prev,
          credit_points: data.credit_points,
          year_points: data.year_points,
          current_year_requests: data.current_year_requests,
          current_year_request_limit: data.current_year_limit,
        }));
      } else {
        console.error(res.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch credits", error);
    }
  };

  // Corrected progress calculation
  const yearProgress =
    user.current_year_request_limit > 0
      ? (user.current_year_requests / user.current_year_request_limit) * 100
      : 0;

  const canMakeRequest =
    user.current_year_requests < user.current_year_request_limit;

  // Trigger dialog open and fetch latest credits
  const handleOpenCreditsDialog = () => {
    if (!user.userID) return;
    fetchUserCredits(user.userID);
    setCreditsDialogOpen(true);
  };

  useEffect(() => {
    axios
      .get("http://localhost/KindLoop-project01/Backend/profile.php", {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data;
        if (data.error === "Session expired. Please log in again.") {
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        setUser(data);
        setFormData(data);
        setDonationHistory(data.donationHistory || []);
        setReceivedHistory(data.receivedHistory || []);
        setToBeReceivedItems(data.toBeReceived || []);

        if (data.userID) fetchUserCredits(data.userID);
      })
      .catch((err) => console.log("Failed to fetch user data", err));
  }, []);

  useEffect(() => {
    const userID = user.userID;
    if (!userID) return;
    const fetchNotifications = () => {
      axios
        .get(
          `http://localhost/KindLoop-project01/Backend/NotificationHandler.php?msg_receiver_ID=${userID}`
        )
        .then((res) => {
          if (res.data.success) {
            setNotifications(res.data.data || []);
          }
        })
        .catch((err) => console.log("Error fetching notifications", err));
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000); // Fetch every minute

    return () => clearInterval(interval);
  }, [user.userID]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const onDismiss = (notificationID: number) => {
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
        {
          action: "mark_as_read",
          notificationID,
        }
      )
      .then(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationID !== notificationID)
        );
      })
      .catch((err) => console.log("Error marking as read", err));
  };

  const handleViewDetails = (DonationID: number) => {
    navigate(`/profiledonation/${DonationID}`);
  };

  // Soft delete: hide from list AND update DB by setting setVisible = 0
  const handleSoftDeleteDonation = async (donationID: number) => {
    try {
      // Call backend to update visibility
      await fetch("http://localhost/KindLoop-project01/Backend/profile.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_visibility",
          DonationID: donationID,
          userID: user.userID,
          setVisible: 0,
        }),
        credentials: "include",
      });

      // Remove from frontend list
      setDonationHistory((prev) =>
        prev.filter((d) => d.DonationID !== donationID)
      );

      toast({
        title: "Post Deleted",
        description:
          "Your post has been deleted successfully (soft delete, still stored in system).",
      });

      setDeleteTarget(null);
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }
    console.log("Form is valid:", formData);

    try {
      const response = await axios.put(
        "http://localhost/KindLoop-project01/Backend/profile.php",
        {
          action: "update_profile",
          userID: user.userID,
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          occupation: formData.occupation,
          address: formData.address,
        }
      );

      const result = response.data;

      if (!result || result.error) {
        throw new Error(result.error || "Failed to update profile.");
      }
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error updating profile", error);
      toast({
        title: "Profile Update Failed",
        description: "Please provide all required information to save changes.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/logout.php",
        {},
        { withCredentials: true }
      )
      .then(() => {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        navigate("/");
      })
      .catch(() => {
        toast({
          title: "Logout Failed",
          description: "Could not log out. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleConfirmReceived = (DonationID: number, credits: number) => {
    setToBeReceivedItems((items) =>
      items.filter((item) => item.DonationID !== DonationID)
    );
    axios
      .post("http://localhost/KindLoop-project01/Backend/profile.php", {
        action: "confirm_received",
        DonationID: DonationID,
        credits: credits,
        receiverID: user.userID,
      })
      .then(() => {
        toast({
          title: "Item Confirmed",
          description: "Thank you for confirming receipt of your item!",
        });
      });
    const item = toBeReceivedItems.find(
      (item) => item.DonationID === DonationID
    );
    if (item) {
      sendNotification(DonationID, item.donorID, user.userID, "Item Received");
    }
  };

  const sendNotification = (
    donationID: number,
    DonorID: number,
    RequesterID: number,
    Reason: string
  ) => {
    if (Reason === "Item Received") {
      axios
        .post(
          "http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
          {
            donationID,
            msg_receiver_ID: DonorID,
            msg_sender_ID: RequesterID,
            action: "Donation_received_Confirmation",
          }
        )
        .then((res) => console.log("Notification sent", res.data))
        .catch((err) => console.error(err));
    } else if (Reason === "Complaint Submitted") {
      axios
        .post(
          "http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
          {
            donationID,
            msg_receiver_ID: DonorID,
            msg_sender_ID: RequesterID,
            action: "Complaint_registered",
          }
        )
        .then((res) => console.log("Notification sent", res.data))
        .catch((err) => console.error(err));
    } else {
      console.log("Notification reason not recognized, no notification sent.");
    }
  };

  const openComplaintDialog = (item: ToBeReceivedItem) => {
    setSelectedItem(item);
    setIsComplaintDialogOpen(true);
  };

  const handleSubmitComplaint = async () => {
    if (!selectedItem || !complaintData.reason || !complaintData.description)
      return;

    try {
      const formDataObj = new FormData();
      formDataObj.append("action", "submit_complaint");
      formDataObj.append("DonationID", selectedItem.DonationID.toString());
      formDataObj.append("reason", complaintData.reason);
      formDataObj.append("description", complaintData.description);
      formDataObj.append("userID", user.userID.toString());

      if (complaintData.evidence_images?.length) {
        complaintData.evidence_images.forEach((file) => {
          formDataObj.append("evidence_images[]", file);
        });
      }
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/complaint.php",
        formDataObj,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "Complaint Submitted",
          description: "Your complaint has been successfully submitted.",
        });
        sendNotification(
          selectedItem.DonationID,
          selectedItem.donorID,
          user.userID,
          "Complaint Submitted"
        );
        setIsComplaintDialogOpen(false);
        setComplaintData({ reason: "", description: "" });
        setSelectedItem(null);
      } else {
        toast({
          title: "Submission Failed",
          description: response.data.message || "Unable to submit complaint.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Complaint submission error:", error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the complaint.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChangeInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      if (!isPasswordStrong(value)) {
        setPasswordStrengthError(
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        );
      } else {
        setPasswordStrengthError("");
      }
    }
  };

  const isPasswordStrong = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handlePasswordChange = async () => {
    const email = user.email;
    setPasswordError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/profile.php",
        {
          action: "changePassword",
          email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }
      );

      const result = response.data;

      if (result.status === "success") {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordDialogOpen(false);
      } else {
        setPasswordError(result.message || "Failed to change password.");
      }
    } catch (error: any) {
      setPasswordError(error.message || "An unexpected error occurred.");
    }
  };

  const validateForm = () => {
    let newErrors: any = {};
    let isValid = true;

    if (
      formData.fullName &&
      !/^[A-Za-z\s]{3,}$/.test(formData.fullName.trim())
    ) {
      newErrors.fullName = "Name must be at least 3 characters";
      isValid = false;
    }

    if (
      formData.contactNumber &&
      !/^07[0-9]{8}$/.test(formData.contactNumber)
    ) {
      newErrors.contactNumber =
        "Contact number must be 10 digits starting with 07.";
      isValid = false;
    }

    if (
      formData.occupation &&
      !/^[A-Za-z\s]{3,}$/.test(formData.occupation.trim())
    ) {
      newErrors.occupation =
        "Occupation can only contain letters, at least 3 characters.";
      isValid = false;
    }

    if (formData.address && formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters long";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user.avatar ?? undefined}
                    alt={user.fullName}
                  />
                  <AvatarFallback className="text-2xl">
                    {user.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {user.fullName}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    {user.occupation} • {user.address}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                    <Dialog
                      open={isCreditsDialogOpen}
                      onOpenChange={setCreditsDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <button
                          onClick={handleOpenCreditsDialog}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700
    text-white font-semibold px-5 py-2 rounded-2xl shadow-md 
    hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          <Star className="h-5 w-5 text-yellow-200 drop-shadow-sm" />
                          <span>{user.credit_points} Credits</span>
                        </button>
                      </DialogTrigger>

                      <DialogContent className="max-w-md rounded-2xl font-sans">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            Credit Points Overview
                          </DialogTitle>
                          <DialogDescription className="text-sm text-gray-600">
                            Track your total credits, yearly credits, and
                            request usage
                          </DialogDescription>
                        </DialogHeader>

                        {/* Summary Section */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card className="shadow-md rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-sm font-medium text-gray-700">
                                Total Credits
                              </CardTitle>
                              <TrendingUp className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-purple-600">
                                {user.credit_points}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="shadow-md rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-sm font-medium text-gray-700">
                                Annual Credits
                              </CardTitle>
                              <Coins className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-purple-600">
                                {user.year_points}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Usage Progress */}
                        <div className="grid gap-6 mt-4">
                          <Card className="shadow-md rounded-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-20 text-gray-800 text-base  text-xl font-medium">
                                Current year usage
                                <Badge
                                  variant={
                                    user.current_year_request_limit === 0
                                      ? "secondary"
                                      : canMakeRequest
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {user.current_year_request_limit === 0
                                    ? "Inactive"
                                    : canMakeRequest
                                    ? "Active"
                                    : "Limit Reached"}
                                </Badge>
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {user.current_year_request_limit === 0 ? (
                                <div className="text-center text-gray-500 italic">
                                  Your request limit is currently <b>0</b>. Earn
                                  points this year to unlock request
                                  opportunities next year.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm text-gray-700">
                                    <span>
                                      Used: {user.current_year_requests}
                                    </span>
                                    <span>
                                      Limit: {user.current_year_request_limit}
                                    </span>
                                  </div>
                                  <Progress
                                    value={yearProgress}
                                    className="h-2 bg-gray-200 [&>div]:bg-purple-600"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end mt-6">
                          <Button
                            variant="secondary"
                            onClick={() => setCreditsDialogOpen(false)}
                          >
                            Close
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <MessagesBar currentUserID={user.userID} openAsPage />
                    <Dialog
                      open={isPasswordDialogOpen}
                      onOpenChange={setPasswordDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <p className="text-sm text-muted-foreground">
                            To change your password, please enter your current
                            password and the new password.
                          </p>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                          <div>
                            <label
                              htmlFor="currentPassword"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              placeholder="Enter Current password"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChangeInput}
                              className="w-full p-2 border rounded-md mt-1"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="newPassword"
                              className="block text-sm font-medium text-gray-700"
                            >
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              placeholder="Enter New password"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChangeInput}
                              className="w-full p-2 border rounded-md mt-1"
                            />
                            {passwordStrengthError && (
                              <p className="text-sm text-red-500 mt-1">
                                {passwordStrengthError}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="confirmPassword"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              placeholder="Confirm New password"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChangeInput}
                              className="w-full p-2 border rounded-md mt-1"
                            />
                          </div>
                          {passwordError && (
                            <p className="text-sm text-red-600">
                              {passwordError}
                            </p>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setPasswordDialogOpen(false);
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                              setPasswordError("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handlePasswordChange}>
                            Update Password
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="donations">Donation History</TabsTrigger>
              <TabsTrigger value="received">Received History</TabsTrigger>
              <TabsTrigger value="to-be-received">To Be Received</TabsTrigger>
              <TabsTrigger value="details">Edit Details</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <Badge variant="secondary">{notifications.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-gray-500">No new notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <Card key={notification.notificationID} className="mb-2">
                        <CardContent className="flex justify-between items-center p-4">
                          <div>
                            <p className="font-medium">
                              {notification.donation_title}
                            </p>
                            {notification.type === "request_received" && (
                              <p className="text-sm text-gray-600">
                                Requested by {notification.requester_name}
                              </p>
                            )}

                            {notification.type === "request_accepted" && (
                              <p className="text-sm text-gray-600">
                                Your Request Accepted by{" "}
                                {notification.requester_name}
                              </p>
                            )}
                            {notification.type === "request_declined" && (
                              <p className="text-sm text-gray-600">
                                Your Request Declined by{" "}
                                {notification.requester_name}
                              </p>
                            )}
                            {notification.type === "donation_received" && (
                              <p className="text-sm text-gray-600">
                                Your Donation has been Received
                              </p>
                            )}
                            {notification.type === "complaint_registered" && (
                              <p className="text-sm text-gray-600">
                                Complaint Registered for{" "}
                                {notification.donation_title} <br />
                                By {notification.requester_name}
                              </p>
                            )}
                            {notification.type === "complaint_resolved" && (
                              <p className="text-sm text-gray-600">
                                Your Complaint for {notification.donation_title}{" "}
                                has been Resolved <br /> Solution :: "
                                {notification.complaint_solution}"
                                {notification.donation_title} By{" "}
                                {notification.requester_name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onDismiss(notification.notificationID)
                            }
                          >
                            Dismiss
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Donation History */}
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    My Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donationHistory.map((donation) => {
                      const isPublic = Number(donation.setVisible) === 1;
                      return (
                        <div
                          key={donation.DonationID}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() =>
                              handleViewDetails(donation.DonationID)
                            }
                          >
                            <h3 className="font-semibold hover:text-primary">
                              {donation.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {donation.category} • {donation.date_time}
                            </p>
                          </div>

                          <div className="flex items-center space-x-4 ">
                            <Badge
                              variant={
                                donation.isVerified === 1
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {donation.isVerified == 1
                                ? "Verified"
                                : "Unverified"}
                            </Badge>
                            <Badge
                              variant={
                                donation.isDonationCompleted === 1
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {donation.isDonationCompleted === 1
                                ? "Completed"
                                : "Pending"}
                            </Badge>

                            <div className="h-9 w-28 text-center bg-purple-100  text-sm font-semibold px-3 py-2 rounded-xl select-none">
                              {donation.credits} Credits
                            </div>

                            {/* View Details button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (donation.DonationID) {
                                        handleViewDetails(donation.DonationID);
                                      } else {
                                        console.error(
                                          "Donation ID is missing!"
                                        );
                                      }
                                    }}
                                    className="flex items-center"
                                  >
                                    <Eye className="h-4 w-4 mr-0" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Click to see full details of this donation
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Edit button */}
                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center"
                                    onClick={() =>
                                      navigate(
                                        `/edit-post/${donation.DonationID}`
                                      )
                                    }
                                    aria-label="Edit post"
                                  >
                                    <Pencil className="h-4 w-4 mr-0" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="end"
                                  className="max-w-xs"
                                >
                                  <p>
                                    Please note that the <b>Category</b>,{" "}
                                    <b>Condition</b>, <b>Usage Duration</b>, and{" "}
                                    <b>Quantity</b> cannot be modified once the
                                    post has been created.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                    onClick={() => setDeleteTarget(donation)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Click to delete this donation
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Soft-delete confirmation dialog */}
                  <AlertDialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => {
                      if (!open) setDeleteTarget(null);
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Do you want to delete this post?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will Delete{" "}
                          <strong>“{deleteTarget?.title}”</strong> from your My
                          Donations list and from public view.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteTarget &&
                            handleSoftDeleteDonation(deleteTarget.DonationID)
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Received History */}
            <TabsContent value="received">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Items Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {receivedHistory.map((item) => (
                      <div
                        key={item.DonationID}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            From {item.donor} • {item.received_date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* To Be Received */}
            <TabsContent value="to-be-received">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Items To Be Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {toBeReceivedItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No items waiting to be received
                        </p>
                      </div>
                    ) : (
                      toBeReceivedItems.map((item) => (
                        <div
                          key={item.DonationID}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.category} • From {item.donor}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} • Credits:{" "}
                                {item.credits}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Approved on: {item.received_date}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Contact: {item.donorContact}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="flex-1">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Received
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirm Receipt
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <p className="text-sm font-medium text-red-600">
                                      <AlertTriangle className="inline mr-1" />{" "}
                                      Once you confirm receiving this donation,
                                      you will not be able to make any
                                      complaints afterward. Please check the
                                      item carefully before proceeding.
                                    </p>
                                    <p className="mt-3">
                                      Are you sure you want to confirm that you
                                      have received{" "}
                                      <strong>"{item.title}"</strong> from{" "}
                                      <strong>{item.donor}</strong>? This action
                                      cannot be undone.
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleConfirmReceived(
                                        item.DonationID,
                                        item.credits
                                      )
                                    }
                                  >
                                    Confirm Receipt
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Complaint */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openComplaintDialog(item)}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Make Complaint
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <Dialog
                  open={isComplaintDialogOpen}
                  onOpenChange={setIsComplaintDialogOpen}
                >
                  <DialogContent className="sm:max-w-[550px] rounded-2xl p-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                        Submit Complaint
                      </DialogTitle>

                      <p className="text-base font-semibold text-red-600 flex items-center gap-2 leading-relaxed">
                        <span>
                          <strong>Important </strong>
                          <br />
                          Please Do not confirm the receipt until you have
                          received the item <br />
                          OR Made a Solution.
                          <br />
                          Please use this form only for genuine issues. <br />
                          Submitting false or misleading complaints may result
                          in suspension of your account.
                        </span>
                      </p>

                      <DialogDescription className="text-gray-600 text-base">
                        Please provide details about the issue with{" "}
                        <span className="font-semibold text-gray-900">
                          "{selectedItem?.title}"
                        </span>{" "}
                        from{" "}
                        <span className="font-semibold text-gray-900">
                          {selectedItem?.donor}
                        </span>
                        .
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="reason"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Reason for Complaint
                        </Label>
                        <Select
                          value={complaintData.reason}
                          onValueChange={(value) =>
                            setComplaintData((prev) => ({
                              ...prev,
                              reason: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full border-gray-300 focus:ring-primary">
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Item not received">
                              Item not received
                            </SelectItem>
                            <SelectItem value="Item damaged/defective">
                              Item damaged/defective
                            </SelectItem>
                            <SelectItem value="Different from description">
                              Different from description
                            </SelectItem>
                            <SelectItem value="Wrong item received">
                              Wrong item received
                            </SelectItem>
                            <SelectItem value="Donor not responding">
                              Donor not responding
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Please describe the issue in detail..."
                          value={complaintData.description}
                          onChange={(e) =>
                            setComplaintData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="min-h-[120px] resize-none border-gray-300 focus:ring-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="evidence_images"
                          className="text-sm font-medium text-gray-700"
                        >
                          Upload Image Evidence (Optional)
                        </Label>
                        <input
                          type="file"
                          id="evidence_images"
                          name="evidence_images[]"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files
                              ? Array.from(e.target.files)
                              : [];
                            if (files.length > 5) {
                              toast({
                                title: "Upload limit reached",
                                description:
                                  "You can only upload up to 5 images.",
                                variant: "destructive",
                              });
                            }
                            setComplaintData((prev) => ({
                              ...prev,
                              evidence_images: files.slice(0, 5),
                            }));
                          }}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-medium
               file:bg-primary file:text-white
               hover:file:bg-primary/90
               cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          id="confirmCheck"
                          type="checkbox"
                          checked={confirmCheck}
                          onChange={(e) => setConfirmCheck(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                          required
                        />
                        <label
                          htmlFor="confirmCheck"
                          className="text-sm text-gray-700 leading-snug"
                        >
                          I confirm that the information provided is accurate.
                        </label>
                      </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsComplaintDialogOpen(false)}
                        className="px-5 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitComplaint}
                        disabled={
                          !complaintData.reason ||
                          !complaintData.description ||
                          !confirmCheck
                        }
                        className="px-5 py-2 bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                      >
                        Submit Complaint
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            </TabsContent>

            {/* Edit Details */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.contactNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.contactNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.occupation && (
                        <p className="text-red-500 text-sm">
                          {errors.occupation}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm">{errors.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;