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
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Notification {
  id: number;
  message: string;
  type: "donation_request" | "general";
  timestamp: string;
}
interface Donation {
  id: number;
  title: string;
  category: string;
  date_time: string;
  isVerified: number;
  isDonationCompleted: number;
  credits: number;
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
  donor: string;
  donorContact: string;
  requestDate: string;
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

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    occupation: "",
    address: "",
    credit_points: 0,
    userID: null,
    avatar: null,
  });

  const [formData, setFormData] = useState(user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [receivedHistory, setReceivedHistory] = useState<ReceivedItem[]>([]);
  const [toBeReceivedItems, setToBeReceivedItems] = useState<
    ToBeReceivedItem[]
  >([]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    axios
      .get(
        `http://localhost/KindLoop-project01/Backend/profile.php?email=${encodeURIComponent(
          email
        )}`
      )
      .then((res) => {
        const data = res.data;
        setUser(data);
        setFormData(data);
        setDonationHistory(data.donationHistory || []);
        setReceivedHistory(data.receivedHistory || []);
        setToBeReceivedItems(data.toBeReceived || []);
      })
      .catch((err) => console.log("Failed to fetch user data", err));
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const onDismiss = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleViewDetails = (donationId: number) => {
    console.log("Viewing details for donation ID:", donationId);
    navigate(`/profiledonation/${donationId}`);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        "http://localhost/KindLoop-project01/Backend/profile.php",
        {
          // method: "PUT",
          // headers: {
          //   "Content-Type": "application/json",
          // },
          // body: JSON.stringify(formData),
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
      //navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("userEmail");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleConfirmReceived = (DonationID: number) => {
    setToBeReceivedItems((items) =>
      items.filter((item) => item.DonationID !== DonationID)
    );
    axios
      .post("http://localhost/KindLoop-project01/Backend/profile.php", {
        action: "confirm_received",
        DonationID: DonationID,
      })
      .then(() => {
        toast({
          title: "Item Confirmed",
          description: "Thank you for confirming receipt of your item!",
        });
      });
  };

  const handleMakeComplaint = (DonationID: number, itemTitle: string) => {
    toast({
      title: "Complaint Submitted",
      description: `Your complaint about "${itemTitle}" has been submitted to our support team.`,
      variant: "destructive",
    });
  };

  const handlePasswordChangeInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Real-time strength validation for new password only
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
    const email = localStorage.getItem("userEmail");

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
    } catch (error) {
      setPasswordError(error.message || "An unexpected error occurred.");
    }
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
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="text-2xl">
                    {user.fullName.charAt(0)}
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
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Star className="h-4 w-4 mr-2" />
                      {user.credit_points} Credits
                    </Badge>

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
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <Alert
                          key={notification.id}
                          className="border-primary/20 bg-primary/5"
                        >
                          <AlertDescription className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm">{notification.message}</p>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDismiss(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
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
                    {donationHistory.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleViewDetails(donation.id)}
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
                          <div className="w-28 text-center bg-teal-100 text-teal-800 text-sm font-semibold px-3 py-1 rounded-xl shadow-sm select-none">
                            {donation.credits} credits
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(donation.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                        {/* <Badge variant="default">{item.isDonationCompleted === 1 ? "Completed" : "Pending"}</Badge> */}
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
                          key={item.id}
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
                                Requested: {item.requestDate}
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
                                    Are you sure you have received "{item.title}
                                    " from {item.donor}? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleConfirmReceived(item.DonationID)
                                    }
                                  >
                                    Confirm Receipt
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Make Complaint
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Submit Complaint
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you experiencing issues with "
                                    {item.title}"? This will notify our support
                                    team and the donor.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleMakeComplaint(item.id, item.title)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Submit Complaint
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
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
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
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
