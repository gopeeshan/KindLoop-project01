
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Gift, Heart, Star,LogOut } from "lucide-react";
import { Link, useNavigate} from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  // Mock user data - in a real app this would come from your auth system
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    occupation: "Software Engineer",
    address: "San Francisco, CA",
    avatar: "/placeholder.svg",
    totalCredits: 1250
  });

  const donationHistory = [
    {
      id: 1,
      title: "Winter Coats for Families",
      category: "Clothing",
      date: "2024-01-15",
      status: "Completed",
      credits: 50
    },
    {
      id: 2,
      title: "Children's Books Collection",
      category: "Books",
      date: "2024-01-10",
      status: "Pending",
      credits: 30
    }
  ];

  const receivedHistory = [
    {
      id: 1,
      title: "Kitchen Appliances",
      donor: "Jane Smith",
      date: "2024-01-12",
      status: "Received"
    },
    {
      id: 2,
      title: "Study Materials",
      donor: "Mike Johnson",
      date: "2024-01-08",
      status: "Received"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
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
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{user.name}</h1>
                  <p className="text-muted-foreground mb-4">{user.occupation} • {user.address}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Star className="h-4 w-4 mr-2" />
                      {user.totalCredits} Credits
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="donations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="donations">Donation History</TabsTrigger>
              <TabsTrigger value="received">Received History</TabsTrigger>
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
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{donation.title}</h3>
                          <p className="text-sm text-muted-foreground">{donation.category} • {donation.date}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={donation.status === "Completed" ? "default" : "secondary"}>
                            {donation.status}
                          </Badge>
                          <span className="text-sm font-medium">+{donation.credits} credits</span>
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
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">From {item.donor} • {item.date}</p>
                        </div>
                        <Badge variant="default">{item.status}</Badge>
                      </div>
                    ))}
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
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user.name}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input 
                        type="email" 
                        defaultValue={user.email}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input 
                        type="tel" 
                        defaultValue={user.phone}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Occupation</label>
                      <input 
                        type="text" 
                        defaultValue={user.occupation}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <input 
                        type="text" 
                        defaultValue={user.address}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button>Save Changes</Button>
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
