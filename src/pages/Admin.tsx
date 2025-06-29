
import React, { useState ,useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, User, Package, AlertTriangle,LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in a real app, this would come from your backend
  const [users] = useState([
    { id: 1, name: "Sarah M.", email: "sarah@example.com", joinDate: "2024-01-15", status: "active", donations: 5 },
    { id: 2, name: "Mike R.", email: "mike@example.com", joinDate: "2024-02-20", status: "active", donations: 3 },
    { id: 3, name: "Anna K.", email: "anna@example.com", joinDate: "2024-03-10", status: "suspended", donations: 8 },
    { id: 4, name: "John D.", email: "john@example.com", joinDate: "2024-03-25", status: "active", donations: 2 },
  ]);

  const [donations] = useState([
    { id: 1, title: "Winter Coats for Families", donor: "Sarah M.", category: "Clothing", status: "verified", date: "2024-03-20" },
    { id: 2, title: "Children's Books Collection", donor: "Mike R.", category: "Books", status: "verified", date: "2024-03-19" },
    { id: 3, title: "Kitchen Appliances Set", donor: "Anna K.", category: "Home", status: "verified", date: "2024-03-18" },
    { id: 4, title: "Sports Equipment", donor: "John D.", category: "Sports", status: "pending", date: "2024-03-21" },
  ]);

  const [pendingVerifications] = useState([
    { 
      id: 1, 
      title: "Laptop for Students", 
      donor: "Emma L.", 
      category: "Electronics", 
      description: "Working laptop suitable for student use, includes charger",
      submittedDate: "2024-03-21T10:30:00Z",
      location: "Downtown Community Center"
    },
    { 
      id: 2, 
      title: "Baby Clothes Bundle", 
      donor: "Tom S.", 
      category: "Clothing", 
      description: "Various baby clothes sizes 0-12 months, all clean and in good condition",
      submittedDate: "2024-03-21T14:15:00Z",
      location: "Westside Community"
    },
    { 
      id: 3, 
      title: "Board Games Collection", 
      donor: "Lisa P.", 
      category: "Toys", 
      description: "Family board games, all pieces included, great for community centers",
      submittedDate: "2024-03-22T09:00:00Z",
      location: "Central Library"
    },
  ]);

  const handleVerifyDonation = (donationId: number, approved: boolean) => {
    const action = approved ? "approved" : "rejected";
    toast({
      title: `Donation ${action}`,
      description: `The donation has been ${action} successfully.`,
    });
    console.log(`Donation ${donationId} ${action}`);
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

  const sortedPendingVerifications = [...pendingVerifications].sort((a, b) => 
    new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, donations, and verification requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
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
                  <p className="text-2xl font-bold">{donations.length}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{pendingVerifications.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Today</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
                  {sortedPendingVerifications.map((donation) => (
                    <div key={donation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{donation.title}</h3>
                          <p className="text-sm text-muted-foreground">{donation.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Donor: {donation.donor}</span>
                            <span>Category: {donation.category}</span>
                            <span>Location: {donation.location}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {formatDate(donation.submittedDate)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerifyDonation(donation.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleVerifyDonation(donation.id, false)}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Donations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.donations}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'view')}
                            >
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant={user.status === 'suspended' ? 'default' : 'destructive'}
                              onClick={() => handleUserAction(user.id, user.status === 'suspended' ? 'activate' : 'suspend')}
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
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">{donation.title}</TableCell>
                        <TableCell>{donation.donor}</TableCell>
                        <TableCell>{donation.category}</TableCell>
                        <TableCell>{donation.date}</TableCell>
                        <TableCell>{getStatusBadge(donation.status)}</TableCell>
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
