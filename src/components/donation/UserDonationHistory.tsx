import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Package, User, Mail } from "lucide-react";
import axios from "axios";

interface Donation {
  donationID: number;
  title: string;
  category: string;
  date_time: string;
  status: number;
  credits: number;
}

interface ReceivedItem {
  donationID: number;
  title: string;
  donor: string;
  category: string;
  received_date: string;
  status: number;
}

interface UserDonationHistoryProps {
  userId: number;
  userName: string;
  userEmail: string;
}

const UserDonationHistory = ({
  userId,
  userName,
  userEmail,
}: UserDonationHistoryProps) => {
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [userReceived, setUserReceived] = useState<ReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/HandleDonation.php?userId=${userId}`
        );

        setUserDonations(Array.isArray(res.data.donations) ? res.data.donations : []);
        setUserReceived(Array.isArray(res.data.received) ? res.data.received : []);
        setUserCredits(res.data.credits ?? 0);
      } catch (error) {
        console.error("Error fetching donation history:", error);
        setUserDonations([]);
        setUserReceived([]);
        setUserCredits(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

// const totalCredits = userDonations.reduce((sum, donation) => sum + Number(donation.credits || 0), 0);

  if (loading) {
    return (
      <p className="text-center py-6 text-muted-foreground">
        Loading history...
      </p>
    );
  }

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
              {userCredits} Credits
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

        {/* Donations */}
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
                    <div
                      key={donation.donationID}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{donation.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {donation.category} • {donation.date_time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            donation.status === 1 ? "default" : "secondary"
                          }
                        >
                          {donation.status === 1 ? "Completed" : "Pending"}
                        </Badge>
                        <span className="text-sm font-medium">
                          +{donation.credits}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Received Items */}
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
                    <div
                      key={item.donationID}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          From {item.donor} • {item.category} • {item.received_date}
                        </p>
                      </div>
                      <Badge variant={item.status === 1 ? "default" : "secondary"}>
                        {item.status === 1 ? "Completed" : "Pending"}
                      </Badge>
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
