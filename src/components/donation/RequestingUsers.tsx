import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Eye, Calendar, User } from "lucide-react";
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
}

interface RequestingUsersProps {
  donationID: number;
}

const RequestingUsers: React.FC<RequestingUsersProps> = ({ donationID }) => {
  const [requestingUsers, setRequestingUsers] = useState<RequestingUser[]>([]);
  const [donationQuantity, setDonationQuantity] = useState<number>(0); // total donation qty
  const [availableQuantity, setAvailableQuantity] = useState<number>(0); // track remaining
  const [currentUser, setCurrentUser] = useState<RequestingUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchDonationQuantity();
  }, [donationID]);

  const fetchRequests = () => {
    axios
      .get(
        `http://localhost/KindLoop-project01/Backend/HandleDonation.php?donationID=${donationID}`
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
      .get(`http://localhost/KindLoop-project01/Backend/HandleDonation.php=${donationID}`)
      .then((res) => {
        if (res.data.success) {
          setDonationQuantity(res.data.data.quantity);
          setAvailableQuantity(res.data.data.availableQuantity);
        }
      })
      .catch((err) => console.error("Error fetching donation quantity", err));
  };

  const handleStatusChange = (userID: number, donationID: number, newStatus: string) => {
    axios.post("http://localhost/KindLoop-project01/Backend/HandleDonation.php", {
        Action: "accept_or_reject",
        DonationID: donationID,
        UserID: userID,
        status: newStatus,
        DonorID: localStorage.getItem("userID"),
      })
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
          sendNotification(donationID, parseInt(localStorage.getItem("userID")), userID);
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

    const sendNotification =(
    donationID: number,
    DonorID: number,
    RequesterID: number
  ) => {
    axios.post("http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
        {
          donationID,
          msg_receiver_ID: RequesterID,
          msg_sender_ID: DonorID,
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
                    <Badge variant={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        console.log(donationID + " " + user.userID);
                        handleStatusChange(user.userID, donationID,"selected");
                      }}
                      disabled={user.status === "approved"}
                    >
                      Accept
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(user.userID, donationID, "rejected")
                      }
                      disabled={user.status === "rejected"}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Requested on {user.request_date}
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
    </Card>
  );
};

export default RequestingUsers;
