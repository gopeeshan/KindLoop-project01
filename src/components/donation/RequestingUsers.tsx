import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Eye, Calendar, AlertCircle, User } from "lucide-react";
import axios from "axios";
import UserDonationHistory from "./UserDonationHistory";
import { Action } from "@radix-ui/react-toast";
import { useToast } from "../ui/use-toast";
import ProfileDD from "@/pages/ProfileDD";

interface RequestingUser {
  userID: number;
  fullName: string;
  email: string;
  request_date: string;
  status: string;
  allocatedQuantity?: number;
  complaintCount: number;
  receive_status?: string;
  quantity?: number;
}

interface Complaint {
  ComplaintID: number;
  Description: string;
  Title: string;
  created_at: string;
  solution: string;
}

interface RequestingUsersProps {
  donationID: number;
}

const RequestingUsers: React.FC<RequestingUsersProps> = ({ donationID }) => {
  const [requestingUsers, setRequestingUsers] = useState<RequestingUser[]>([]);
  const [donationQuantity, setDonationQuantity] = useState<number>(0); // total donation qty
  const [availableQuantity, setAvailableQuantity] = useState<number>(0); // track remaining
  const [currentUser, setCurrentUser] = useState<RequestingUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [donorID, setDonorID] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchDonationQuantity();
    fetchSessionUserID();
  }, [donationID]);

  const fetchSessionUserID = () => {
    axios
      .get("http://localhost/KindLoop-project01/Backend/profile.php", {
        withCredentials: true,
        params: {
          action: "get_donor_id",
        },
      })
      .then((res) => {
        console.log("Session response:", res.data);
        if (res.data.success) {
          setDonorID(res.data.DonorID);
        } else {
          console.warn("No donor session found");
        }
      })
      .catch((err) => {
        console.error("Error fetching session userID", err);
      });
  };

  const fetchRequests = () => {
    axios
      .get(
        `http://localhost/KindLoop-project01/Backend/HandleDonation.php?donationID=${donationID}`,
        {
          params: {
            Action: "get_requests",
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          setRequestingUsers(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching requests", err);
      });
  };

  const fetchDonationQuantity = () => {
    axios
      .get(
        `http://localhost/KindLoop-project01/Backend/HandleDonation.php?donationID=${donationID}`,
        {
          params: {
            Action: "get_donation_quantity",
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          setDonationQuantity(res.data.data.quantity);
          setAvailableQuantity(res.data.data.availableQuantity);
        }
      })
      .catch((err) => console.error("Error fetching donation quantity", err));
  };

  const handleViewComplaints = (complainantID: number, donationID: number) => {
    axios
      .get(
        `http://localhost/KindLoop-project01/Backend/GetComplaints.php?complainantID=${complainantID}&DonationID=${donationID}`
      )
      .then((res) => {
        if (res.data.success) {
          setComplaints(res.data.complaints);
          setIsComplaintDialogOpen(true);
        } else {
          toast({
            title: "No Complaints",
            description: "No complaints for this donation.",
            variant: "default",
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching complaints", err);
        toast({
          title: "Error",
          description: "Failed to fetch complaints.",
          variant: "destructive",
        });
      });
  };

  const handleStatusChange = (
    userID: number,
    donationID: number,
    newStatus: string,
    quantity: number
  ) => {
    if (!donorID) {
      toast({
        title: "Error",
        description: "Session expired. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/HandleDonation.php",
        {
          Action: "accept_or_reject",
          DonationID: donationID,
          UserID: userID,
          status: newStatus,
          DonorID: donorID,
          quantity: quantity,
        },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          setRequestingUsers((prev) =>
            prev.map((u) =>
              u.userID === userID ? { ...u, status: newStatus } : u
            )
          );

          toast({
            title: "Success",
            description: `User has been ${newStatus} successfully.`,
            variant: "default",
          });
          sendNotification(donationID, donorID, userID, newStatus);
        } else {
          toast({
            title: "Error",
            description: "Failed to update status.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        console.error("Error updating status", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      });
  };

  const sendNotification = (
    donationID: number,
    DonorID: number,
    RequesterID: number,
    newStatus: string
  ) => {
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
        {
          donationID,
          msg_receiver_ID: RequesterID,
          msg_sender_ID: DonorID,
          status: newStatus,
          action: "notify_request_acceptance",
        }
      )
      .then((res) => console.log("Notification sent", res.data))
      .catch((err) => console.error(err));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleQuantityChange = (userID: number, value: number) => {
    setRequestingUsers((prev) =>
      prev.map((u) =>
        u.userID === userID
          ? { ...u, allocatedQuantity: Math.min(value, availableQuantity) }
          : u
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Requesting Users</span>
          <Badge variant="secondary">{requestingUsers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requestingUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users have requested this donation yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requestingUsers.map((user) => (
              <div key={user.userID} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{user.fullName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min={1}
                      max={donationQuantity}
                      value={user.allocatedQuantity || ""}
                      onChange={(e) =>
                        handleQuantityChange(
                          user.userID,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                      placeholder="Qty"
                    />

                    <Badge variant={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          user.userID,
                          donationID,
                          "selected",
                          user.allocatedQuantity
                        )
                      }
                      disabled={
                        user.status === "selected" ||
                        availableQuantity <= 0 ||
                        !user.allocatedQuantity ||
                        user.receive_status === "completed"
                      }
                      // onClick={() => {
                      //   console.log(donationID + " " + user.userID);
                      //   handleStatusChange(user.userID, donationID, "selected");
                      // }}
                      // disabled={user.status === "approved"}
                    >
                      Accept
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          user.userID,
                          donationID,
                          "rejected",
                          user.allocatedQuantity
                        )
                      }
                      disabled={
                        user.status === "rejected" ||
                        user.receive_status === "completed"
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Requested on {user.request_date}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 w-max mt-2"
                      onClick={() =>
                        handleViewComplaints(user.userID, donationID)
                      }
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Complaints</span>
                      {user.complaintCount > 0 && (
                        <Badge variant="secondary">{user.complaintCount}</Badge>
                      )}
                    </Button>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          User Donation & Received History -{" "}
                          {currentUser?.fullName}
                        </DialogTitle>
                        <DialogDescription>
                          Here you can view the full details of the donation.
                        </DialogDescription>
                      </DialogHeader>
                      {currentUser && (
                        <UserDonationHistory
                          userId={currentUser.userID}
                          userName={currentUser.fullName}
                          userEmail={currentUser.email}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={isComplaintDialogOpen}
        onOpenChange={setIsComplaintDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Complaints</DialogTitle>
          </DialogHeader>

          {complaints.length > 0 ? (
            <ul className="space-y-3">
              {complaints.map((c) => (
                <li
                  key={c.ComplaintID}
                  className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h4 className="font-semibold text-primary">{c.Title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {c.Description}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Reported on {new Date(c.created_at).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solution: {c.solution}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No complaints available.</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RequestingUsers;
