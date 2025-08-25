import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, User, Calendar, MapPin } from "lucide-react";
import RequestingUsers from "@/components/donation/RequestingUsers";
import axios from "axios";
import AdminComplaints from "./ComplaintHandle";

interface Donation {
  DonationID: number;
  title: string;
  userID: number;
  userName: string;
  description: string;
  date_time: string;
  category: string;
  condition: string;
  quantity: number;
  location: string;
  images: string[];
  isVerified: number;
  isDonationCompleted: number;
  receiverID: number;
  approvedBy: string;
  setVisible: number;
  usageDuration: string;
  credits: number;
}

const Profiledd = () => {
  const { id } = useParams();
  // console.log("Route param id:", id);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingUsers, setRequestingUsers] = useState<any[]>([]); 

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axios.get(
          `http://localhost/KindLoop-project01/Backend/profile.php`,
          {
            params: { donationId: id },
          }
        );

        if (response.data && !response.data.error) {
          setDonation(response.data);
        } else {
          console.error("Donation not found");
        }
      } catch (error) {
        console.error("Error fetching donation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDonation();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading donation details...</div>;
  }

  if (!donation) {
    return (
      <div className="text-center py-10 text-destructive">
        Donation not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/profile"
            className="flex items-center space-x-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Donation Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-6 w-6 text-primary" />
                <span>Donation Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {donation.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {donation.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Category
                      </span>
                      <p className="font-semibold">{donation.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Condition
                      </span>
                      <p className="font-semibold">{donation.condition}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Quantity
                      </span>
                      <p className="font-semibold">
                        {donation.quantity || 1}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Credits
                      </span>
                      <p className="font-semibold">+{donation.credits}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        donation.isDonationCompleted ? "default" : "secondary"
                      }
                    >
                      {donation.isDonationCompleted ? "Completed" : "Active"}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {donation.date_time?.split(" ")[0]}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {donation.location || "Not specified"}
                    </div>
                  </div>
                </div>

                {donation.images && (
                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-1">Images:</h3>
                    <div className="flex flex-wrap gap-4">
                      {donation.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={`http://localhost/KindLoop-project01/Backend/${img}`}
                          alt={`Donation ${idx}`}
                          className="w-32 h-32 object-contain border rounded-md shadow-sm bg-white p-1 transition-transform hover:scale-105"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requesting Users */}
          {donation.isDonationCompleted === 0 && (
            <RequestingUsers
              users={requestingUsers}
              donationID={parseInt(id || "0")}
            />
          )}
          {/* <AdminComplaints donationID={parseInt(id || "0")} /> */}
        </div>
      </div>
    </div>
  );
};

export default Profiledd;
