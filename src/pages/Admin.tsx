
import React, { useState ,useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, User, Package, AlertTriangle,LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom'; 

interface User {
  UserID: number;
  fullName: string;
  email: string;
  occupation: string;
  district: string;
  credit_points: number;
  status: string;
  donations: number;
}

interface Donation {
  DonationID: number;
  title: string;
  userID: number;
  category: string;
  date_time: string;
  isDonationCompleted: boolean;
}

interface Verification {
  DonationID: number;
  title: string;
  userID: number;
  category: string;
  condition: string;
  images: string[];
  submittedDate: string;
}


  
const Admin:React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [PendingVerifications, setPendingVerifications] = useState<Verification[]>([]);

async function fetchData() {
    try{
      const res=await fetch("http://localhost/KindLoop-project01/Backend/Admin.php");
      const data = await res.json();
      if (data.status === "success") {
          setUsers(data.users);
          setDonations(data.donations);
          setPendingVerifications(data.pendingVerification);
        }
    }
    catch (err) {
      console.log("Error:", err);
    }
}

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (adminLoggedIn === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/Admin_login');
    }

  //   fetch("http://localhost/KindLoop-project01/Backend/Admin.php")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.status === "success") {
  //         setUsers(data.users);
  //         setDonations(data.donations);
  //         setPendingVerifications(data.pendingVerification);
  //       }
  //     })
  //     .catch((err) => console.log("Error:", err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/Admin_login');
  };

  const handleVerifyDonation = (donationId: number, approved: boolean) => {
    const action = approved ? "approved" : "rejected";
    toast({
      title: `Donation ${action}`,
      description: `The donation has been ${action} successfully.`,
    });
  };

  const handleUserAction = (userId: number, action: string) => {
    toast({
      title: `User ${action}`,
      description: `User action completed successfully.`,
    });
    console.log(`User ${userId} ${action}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "verified":
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedPendingVerifications = [...PendingVerifications].sort((a, b) =>
    new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime()
  );

   // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, donations, and verification requests</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{setUsers.length}</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">{setDonations.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold text-orange-600">{setPendingVerifications.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending Verification
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Donations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Donations Waiting for Verification ({sortedPendingVerifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedPendingVerifications.map((setPendingVerifications) => (
                    <div key={setPendingVerifications.DonationID} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{setPendingVerifications.title}</h3>
                          <p className="text-sm text-muted-foreground">{setPendingVerifications.condition}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>DonorID: {setPendingVerifications.userID}</span>
                            <span>Category: {setPendingVerifications.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {formatDate(setPendingVerifications.submittedDate)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerifyDonation(setPendingVerifications.DonationID, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleVerifyDonation(setPendingVerifications.DonationID, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Credit Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Donations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.UserID} className="hover:bg-muted">
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.occupation}</TableCell>
                        <TableCell>{user.district}</TableCell>
                        <TableCell>{user.credit_points}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.donations}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUserAction(user.UserID, 'view')}
                            >
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant={user.status === 'suspended' ? 'default' : 'destructive'}
                              onClick={() => handleUserAction(user.UserID, user.status === 'suspended' ? 'activate' : 'suspend')}
                            >
                              {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.DonationID}>
                        <TableCell className="font-medium">{donation.title}</TableCell>
                        <TableCell>{donation.userID}</TableCell>
                        <TableCell>{donation.category}</TableCell>
                        <TableCell>{donation.date_time}</TableCell>
                        <TableCell>{donation.isDonationCompleted ? 'Completed' : 'Pending'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="destructive">
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
