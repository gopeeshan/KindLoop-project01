import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Eye, Calendar, User } from "lucide-react";
import UserDonationHistory from "./UserDonationHistory";

interface RequestingUser {
  id: number;
  name: string;
  email: string;
  requestDate: string;
  status: string;
  reason: string;
  priority: string;
}

interface RequestingUsersProps {
  users: RequestingUser[];
  donationId: number;
}

const RequestingUsers = ({ users, donationId }: RequestingUsersProps) => {
  const [selectedUser, setSelectedUser] = useState<RequestingUser | null>(null);
const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Requesting Users</span>
          <Badge variant="secondary">{users.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
         {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users have requested this donation yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(user.priority)}>
                      {user.priority}
                    </Badge>
                    <Badge variant={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-1">Request Reason:</p>
                  <p className="text-sm">{user.reason}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Requested on {user.requestDate}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>User Donation & Received History - {user.name}</DialogTitle>
                      </DialogHeader>
                      {selectedUser && (
                        <UserDonationHistory 
                          userId={selectedUser.id} 
                          userName={selectedUser.name}
                          userEmail={selectedUser.email}
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
      