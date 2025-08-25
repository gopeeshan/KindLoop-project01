import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  UserCog,
  Package,
  AlertTriangle,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  userID: number;
  fullName: string;
  email: string;
  occupation: string;
  district: string;
  credit_points: number;
  active_state: string;
  donation_count: number;
}

interface Admin {
  AdminID: number;
  fullName: string;
  contactNumber: string;
  email: string;
  nic: string;
  address: string;
  joined_date: string;
  Admin_status: string;
}

interface Donation {
  DonationID: number;
  title: string;
  userID: number;
  userName: string;
  description: string;
  date_time: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  isVerified: number;
  isDonationCompleted: number;
  receiverID: number;
  approvedBy: number;
  setVisible: number;
  usageDuration: string;
}

interface Verification {
  DonationID: number;
  title: string;
  userID: number;
  userName: string;
  description: string;
  date_time: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  isVerified: number;
  isDonationCompleted: number;
  ReceiverID: number;
  approvedBy: number;
  setVisible: number;
  usageDuration: string;
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [PendingVerifications, setPendingVerifications] = useState<
    Verification[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchAdminData = () => {
    axios
      .get("http://localhost/KindLoop-project01/Backend/Admin.php")
      .then((response) => {
        const data = response.data;
        if (data.status === "success") {
          setUsers(data.users);
          setDonations(data.donations);
          setAdmins(data.admins);
          setPendingVerifications(data.pendingVerifications);
          console.log("Fetched data successfully");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const visibleTabs = [
    {
      value: "verification",
      label: "Pending Verification",
      icon: <AlertTriangle />,
    },
    { value: "users", label: "Users", icon: <User /> },
    { value: "donations", label: "Donations", icon: <Package /> },
    ...(role === "superadmin"
      ? [{ value: "admins", label: "Admin", icon: <UserCog /> }]
      : []),
  ];

  const statsCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: <User className="h-8 w-8 text-primary" />,
    },
    {
      title: "Total Donations",
      value: donations.length,
      icon: <Package className="h-8 w-8 text-primary" />,
    },
    {
      title: "Pending Verification",
      value: PendingVerifications.length,
      icon: <Clock className="h-8 w-8 text-orange-600" />,
    },
    ...(role === "superadmin"
      ? [
          {
            title: "Total Sub Admins",
            value: admins.length,
            icon: <UserCog className="h-8 w-8 text-primary" />,
          },
        ]
      : []),
  ];

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const role = localStorage.getItem("role");

    if (adminLoggedIn === "true" && role) {
      setIsAuthenticated(true);
      setRole(role);
    } else {
      navigate("/Admin_login");
      return;
    }
    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("AdminID");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/Admin_login");
  };

  const handleVerifyDonation = async (
    DonationID: number,
    isVerified: number,
    setVisible: number
  ) => {
    const AdminID = localStorage.getItem("AdminID");

    const action = isVerified === 1 ? "approved" : "rejected";

    axios
      .post("http://localhost/KindLoop-project01/Backend/Admin.php", {
        action: "verify_donation",
        DonationID,
        isVerified,
        AdminID,
        setVisible,
      })
      .then(() => {
        toast({
          title: `Donation ${action}`,
          description: `The donation has been ${action} successfully.`,
        });
        fetchAdminData();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to verify donation.",
        });
      });
  };

  const handleUserAction = (userID: number, active_state: string) => {
    axios
      .post("http://localhost/KindLoop-project01/Backend/Admin.php", {
        action: "user_action",
        userID,
        active_state,
      })
      .then(() => {
        toast({
          title: `User ${active_state}`,
          description: `User action completed successfully.`,
        });

        fetchAdminData();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to perform user action.",
        });
      });
  };

  const handleAdminAction = async (AdminID: number, newStatus: string) => {
    axios
      .post("http://localhost/KindLoop-project01/Backend/Admin.php", {
        action: "admin_action",
        AdminID,
        AdminActive_state: newStatus, // match backend field
      })
      .then(() => {
        toast({
          title: `Admin ${newStatus}`,
          description: `Admin action completed successfully.`,
        });
        fetchAdminData();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to perform admin action.",
        });
      });
  };

  const handleViewUser = (userID: number) => {
    const user = users.find((u) => u.userID === userID);
    if (user) {
      setSelectedUser(user);
      setSelectedDonation(null);
      setSelectedAdmin(null);
      setIsDialogOpen(true);
    }
  };

  const handleViewAdmin = (AdminID: number) => {
    const admin = admins.find((a) => a.AdminID === AdminID);
    if (admin) {
      setSelectedAdmin(admin);
      setSelectedUser(null);
      setSelectedDonation(null);
      setIsDialogOpen(true);
    }
  };

  const handleViewDonation = (DonationID: number) => {
    const donation = donations.find((d) => d.DonationID === DonationID);
    if (donation) {
      setSelectedDonation(donation);
      setSelectedAdmin(null);
      setSelectedUser(null);
      setIsDialogOpen(true);
    }
  };
  const getStatusBadge = (active_state: string) => {
    switch (active_state) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        );
      case "suspend":
        return <Badge variant="destructive">Suspended</Badge>;
      case "verified":
        return (
          <Badge variant="default" className="bg-green-500">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{active_state}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage users, donations, and verification requests
            </p>
          </div>

          <div className="mb-6 flex gap-4">
            {role === "superadmin" && (
              <Button
                onClick={() => navigate("/admin/Admin_SignUp")}
                className="flex items-center gap-2"
                variant="outline"
              >
                Add Admin
              </Button>
            )}

            <Button
              onClick={() => navigate("/admin/complaints")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4" />
              Manage Complaints
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

        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm text-muted-foreground">
                    Total Donations
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Pending Verification
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {PendingVerifications.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          {role === "superadmin" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Sub Admins
                    </p>
                    <p className="text-2xl font-bold">{admins.length}</p>
                  </div>
                  <UserCog className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}
        </div> */}

        <div
          className={`grid grid-cols-1 md:grid-cols-${statsCards.length} gap-6 mb-8`}
        >
          {statsCards.map((card, index) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  {card.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center justify-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Donations Waiting for Verification (
                  {PendingVerifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PendingVerifications.map((v) => (
                    <div
                      key={v.DonationID}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{v.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {v.condition}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Donor: {v.userName}</span>
                            <span>Category: {v.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {formatDate(v.date_time)}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleViewDonation(v.DonationID)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleVerifyDonation(v.DonationID, 1, 1)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleVerifyDonation(v.DonationID, 0, 0)
                            }
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
                    {users
                      .filter(
                        (user) =>
                          user.fullName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          user.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          user.district
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <TableRow key={user.userID} className="hover:bg-muted">
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.occupation}</TableCell>
                          <TableCell>{user.district}</TableCell>
                          <TableCell>{user.credit_points}</TableCell>
                          <TableCell>
                            {getStatusBadge(user.active_state)}
                          </TableCell>
                          <TableCell>{user.donation_count}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewUser(user.userID)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  user.active_state === "suspend"
                                    ? "default"
                                    : "destructive"
                                }
                                onClick={() =>
                                  handleUserAction(
                                    user.userID,
                                    user.active_state === "suspend"
                                      ? "active"
                                      : "suspend"
                                  )
                                }
                              >
                                {user.active_state === "suspend"
                                  ? "active"
                                  : "suspend"}
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

          <TabsContent value="admins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin, index) => (
                      <TableRow
                        key={admin.AdminID ?? index}
                        className="hover:bg-muted"
                      >
                        <TableCell className="font-medium">
                          {admin.fullName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.contactNumber}</TableCell>
                        <TableCell>{admin.address}</TableCell>
                        <TableCell>
                          {getStatusBadge(admin.Admin_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewAdmin(admin.AdminID)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                admin.Admin_status === "suspend"
                                  ? "default"
                                  : "destructive"
                              }
                              onClick={() => {
                                const newStatus =
                                  admin.Admin_status === "suspend"
                                    ? "active"
                                    : "suspend";
                                handleAdminAction(admin.AdminID, newStatus);
                              }}
                            >
                              {admin.Admin_status === "suspend"
                                ? "active"
                                : "suspend"}
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

          <TabsContent value="donations" className="space-y-7">
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
                        <TableCell className="font-medium">
                          {donation.title}
                        </TableCell>
                        <TableCell>{donation.userName}</TableCell>
                        <TableCell>{donation.category}</TableCell>
                        <TableCell>{donation.date_time}</TableCell>
                        <TableCell>
                          {donation.isDonationCompleted == 1
                            ? "Completed"
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          {donation.isVerified == 1 ? "Verified" : "Unverified"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewDonation(donation.DonationID)
                              }
                            >
                              View
                            </Button>
                            {/* <Button size="sm" variant="destructive" onClick={() => handleDonation(donation.DonationID)}>
                              Remove
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedUser
                    ? "User Details"
                    : selectedAdmin
                    ? "Admin Details"
                    : selectedDonation
                    ? "Donation Details"
                    : "Details"}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser
                    ? "Read-only user information"
                    : selectedAdmin
                    ? "Read-only admin information"
                    : selectedDonation
                    ? "Donation item details"
                    : ""}
                </DialogDescription>
              </DialogHeader>

              {selectedUser && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Full Name:</strong> {selectedUser.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {selectedUser.occupation}
                  </p>
                  <p>
                    <strong>District:</strong> {selectedUser.district}
                  </p>
                  <p>
                    <strong>Credit Points:</strong> {selectedUser.credit_points}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedUser.active_state}
                  </p>
                  <p>
                    <strong>Donations:</strong> {selectedUser.donation_count}
                  </p>
                  {/* <p><strong>Donation History:</strong> 
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.donationHistory.map((donation) => (
                          <tr key={donation.id}>
                            <td>{donation.title}</td>
                            <td>{donation.amount}</td>
                            <td>{donation.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  // </p> */}
                </div>
              )}

              {selectedDonation && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Title:</strong> {selectedDonation.title}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedDonation.category}
                  </p>
                  <p>
                    <strong>Condition:</strong>{" "}
                    {selectedDonation.condition ?? "N/A"}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedDonation.description ?? "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedDonation.location ?? "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(selectedDonation.date_time)}
                  </p>
                  <p>
                    <strong>Verification:</strong>{" "}
                    {selectedDonation.isVerified == 1
                      ? "Verified"
                      : "Unverified"}
                  </p>
                  <p>
                    <strong>Visible:</strong>{" "}
                    {selectedDonation.setVisible == 1 ? "Public" : "Private"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedDonation.isDonationCompleted == 1
                      ? "Completed"
                      : "Pending"}
                  </p>
                  <p>
                    <strong>Usage Duration:</strong>{" "}
                    {selectedDonation.usageDuration ?? "N/A"}
                  </p>
                  {selectedDonation.images &&
                    selectedDonation.images.length > 0 && (
                      <div>
                        <strong>Images:</strong>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {selectedDonation.images.map((img, index) => (
                            <img
                              key={`${img}-${index}`}
                              src={`http://localhost/KindLoop-project01/Backend/${img.trim()}`}
                              alt={`donation-${img}`}
                              className="w-40 h-40 object-cover rounded-lg shadow-sm"
                              onClick={() =>
                                setSelectedImage(
                                  `http://localhost/KindLoop-project01/Backend/${img}`
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {selectedAdmin && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Full Name: </strong> {selectedAdmin.fullName}
                  </p>
                  <p>
                    <strong>Email: </strong> {selectedAdmin.email}
                  </p>
                  <p>
                    <strong>NIC: </strong> {selectedAdmin.nic}
                  </p>
                  <p>
                    <strong>Contact No: </strong> {selectedAdmin.contactNumber}
                  </p>
                  <p>
                    <strong>Address: </strong> {selectedAdmin.address}
                  </p>
                  <p>
                    <strong>Joined Date: </strong> {selectedAdmin.joined_date}
                  </p>
                  <p>
                    <strong>Status: </strong> {selectedAdmin?.Admin_status}
                  </p>
                </div>
              )}

              <Dialog
                open={!!selectedImage}
                onOpenChange={() => setSelectedImage(null)}
              >
                <DialogContent className="max-w-3xl p-4">
                  <img
                    src={selectedImage ?? ""}
                    alt="Full Size"
                    className="max-w-[50vw] max-h-[50vh] w-auto h-auto mx-auto rounded-lg object-contain"
                  />
                  <DialogFooter>
                    <Button onClick={() => setSelectedImage(null)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
