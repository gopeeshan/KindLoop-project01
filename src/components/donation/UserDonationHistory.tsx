import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Package, User, Mail } from "lucide-react";

interface UserDonationHistoryProps {
  userId: number;
  userName: string;
  userEmail: string;
}

const UserDonationHistory = ({ userId, userName, userEmail }: UserDonationHistoryProps) => {
  // Mock user data - in real app this would come from API based on userId
  const userDonations = [
    // Sample donation data
    { id: 1, title: "Winter Coats", category: "Clothing", date: "2024-01-10", status: "Completed", credits: 50 },
    { id: 2, title: "Books for Kids", category: "Education", date: "2024-01-12", status: "Pending", credits: 30 },
  ];
  const userReceived = [
    // Sample received items data
    { id: 1, title: "Toys for Kids", donor: "Jane Smith", category: "Toys", date: "2024-01-15", status: "Completed" },
  ];
  const totalCredits = userDonations.reduce((sum, donation) => sum + donation.credits, 0);

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{userName}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-1" />
                {userEmail}
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {totalCredits} Credits
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donations">Donation History</TabsTrigger>
          <TabsTrigger value="received">Received History</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Donations Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userDonations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donations made yet</p>
                  </div>
              ) : (
                <div className="space-y-3">
                  {userDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{donation.title}</h4>
                        <p className="text-sm text-muted-foreground">{donation.category} • {donation.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={donation.status === "Completed" ? "default" : "secondary"}>
                          {donation.status}
                        </Badge>
                        <span className="text-sm font-medium">+{donation.credits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Items Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userReceived.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items received yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userReceived.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          From {item.donor} • {item.category} • {item.date}
                        </p>
                      </div>
                      <Badge variant="default">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDonationHistory;