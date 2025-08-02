import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, User, Calendar, MapPin } from "lucide-react";
import RequestingUsers from "@/components/donation/RequestingUsers";

const Profiledd = () => {
  const { id } = useParams();

  // Mock donation data - in real app this would come from API
  const donation = {
    id: parseInt(id || "1"),
    title: "Winter Coats for Families",
    category: "Clothing",
    description:
      "Brand new winter coats in various sizes for families in need. All coats are waterproof and suitable for harsh winter conditions.",
    date: "2024-01-15",
    status: "Active",
    credits: 50,
    location: "San Francisco, CA",
    donor: "John Doe",
    images: ["/placeholder.svg"],
    condition: "New",
    quantity: 5,
  };

  const [requestingUsers] = useState([]);

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
                      <p className="font-semibold">{donation.quantity}</p>
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
                        donation.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {donation.status}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {donation.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {donation.location}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <img
                    src={donation.images[0]}
                    alt={donation.title}
                    className="w-full max-w-sm h-64 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requesting Users */}
          <RequestingUsers users={requestingUsers} donationId={donation.id} />
        </div>
      </div>
    </div>
  );
};

export default Profiledd;
