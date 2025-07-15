import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const [donationHistory, setDonationHistory] = useState([]);
  const [receivedHistory, setReceivedHistory] = useState([]);
  const [toBeReceivedItems, setToBeReceivedItems] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    fetch(
      `http://localhost/KindLoop-project01/Backend/profile.php?email=${encodeURIComponent(
        email
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setFormData(data);
        setDonationHistory(data.donationHistory || []);
        setReceivedHistory(data.receivedHistory || []);
        setToBeReceivedItems(data.toBeReceived || []);
      })
      .catch((err) => console.error("Failed to fetch user data", err));
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost/KindLoop-project01/Backend/profile.php?userID=${user.userID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      navigate("/");
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

  const handleConfirmReceived = (itemId: number) => {
    setToBeReceivedItems((items) => items.filter((item) => item.id !== itemId));

    toast({
      title: "Item Confirmed",
      description: "Thank you for confirming receipt of your item!",
    });
  };

  const handleMakeComplaint = (itemId: number, itemTitle: string) => {
    toast({
      title: "Complaint Submitted",
      description: `Your complaint about "${itemTitle}" has been submitted to our support team.`,
      variant: "destructive",
    });
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
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Change Password{" "}
                    </Button>
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
          <Tabs defaultValue="to-be-received" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="donations">Donation History</TabsTrigger>
              <TabsTrigger value="received">Received History</TabsTrigger>
              <TabsTrigger value="to-be-received">To Be Received</TabsTrigger>
              <TabsTrigger value="details">Edit Details</TabsTrigger>
            </TabsList>

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
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{donation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {donation.category} • {donation.date_time}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              donation.status === "Completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {donation.status}
                          </Badge>
                          <span className="text-sm font-medium">
                            +{donation.credits} credits
                          </span>
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
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            From {item.donor} • {item.date}
                          </p>
                        </div>
                        {/* <Badge variant="default">{item.status}</Badge> */}
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
                                      handleConfirmReceived(item.id)
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
