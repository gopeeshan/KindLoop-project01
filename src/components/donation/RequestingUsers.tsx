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

interface RequestingUser {
  userID: number;
  fullName: string;
  email: string;
  request_date: string;
  status: string;
}

interface RequestingUsersProps {
  donationId: number;
}

const RequestingUsers: React.FC<RequestingUsersProps> = ({ donationId }) => {
  const [requestingUsers, setRequestingUsers] = useState<RequestingUser[]>([]);
  const [currentUser, setCurrentUser] = useState<RequestingUser | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [donationId]);

  const fetchRequests = () => {
    axios
      .get(
        `http://localhost/KindLoop-project01/Backend/HandleDonation.php?donationID=${donationId}`
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

  const handleStatusChange = (userID: number, newStatus: string) => {
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/UpdateRequestStatus.php",
        {
          Action: newStatus === "approved" ? "accept" : "reject",
          donationID: donationId,
          userID: userID,
          status: newStatus,
        }
      )
      .then((res) => {
        if (res.data.success) {
          setRequestingUsers((prev) =>
            prev.map((u) =>
              u.userID === userID ? { ...u, status: newStatus } : u
            )
          );
        } else {
          alert("Failed to update status");
        }
      })
      .catch((err) => {
        console.error("Error updating status", err);
      });
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
                      onClick={() =>
                        handleStatusChange(user.userID, "approved")
                      }
                      disabled={user.status === "approved"}
                    >
                      Accept
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(user.userID, "rejected")
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
