import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  MessageCircle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface Donation {
  DonationID: number;
  userID: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  isVerified: number;
  fullName: string;
  location: string;
  date_time: string;
  category: string;
  condition: string;
  images: string | null;
}

const DonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const userID = parseInt(localStorage.getItem("userID") || "0");

  useEffect(() => {
    const fetchDonation = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost/KindLoop-project01/Backend/get-donation-by-id.php?DonationID=${id}`
        );
        const json = await res.json();

        if (json.status === "success") {
          setDonation(json.data);
        } else {
          setError(json.message || "Failed to fetch donation.");
        }
      } catch (err) {
        setError("Server error. Please try again later.");
      }
      setLoading(false);
    };

    fetchDonation();
  }, [id]);

  const handleChat = (DonationID: number) => {
    console.log(`Chat with donor of donation ${DonationID} with the userID ${donation.userID}`);
  };

  const handleRequestItem = async (DonationID: number) => {
    if (userID !== donation.userID) {
      console.log(
        `Requesting item ${DonationID} from user ${localStorage.getItem(
          "userID"
        )} and Donor is ${donation.userID}`
      );
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/HandleDonation.php",
        {
          Action: "request-item",
          DonationID: DonationID,
          UserID: userID,
        }
      );
      if (response.data.success) {
        sendNotification(donation.DonationID, donation.userID, userID);
        toast({
          title: "Request Sent ",
          description:
            response.data.message ||
            "Your request has been submitted successfully.",
        });
      } else {
        toast({
          title: "Request Failed ",
          description: response.data.message || "Unable to send request.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Request Failed ",
        description: "You cannot request your own donation.",
        variant: "destructive",
      });
    }
  };

  const sendNotification = (
    donationID: number,
    DonorID: number,
    RequesterID: number
  ) => {
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
        {
          donationID,
          msg_receiver_ID: DonorID,
          msg_sender_ID: RequesterID,
          action: "notify_request",
        }
      )
      .then((res) => console.log("Notification sent", res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading donation details...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : donation ? (
          <Card className="max-w-3xl mx-auto shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-bold">
                  {donation.title}
                </CardTitle>
                {donation.isVerified == 1 ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 text-white flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 border-orange-200 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-2">
                {donation.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                <span>{donation.fullName}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{donation.location || "Location not provided"}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                <span>{donation.date_time}</span>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-1">Category:</h3>
                <p className="text-muted-foreground">
                  {donation.category || "N/A"}
                </p>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-1">Condition:</h3>
                <p className="text-muted-foreground">
                  {donation.condition || "N/A"}
                </p>
              </div>

              {donation.images && (
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-1">Images:</h3>
                  <div className="flex flex-wrap gap-4">
                    {JSON.parse(donation.images).map(
                      (img: string, idx: number) => (
                        <img
                          key={idx}
                          src={`http://localhost/KindLoop-project01/Backend/${img}`}
                          alt={`Donation ${idx}`}
                          className="w-full h-32 object-cover rounded-md cursor-pointer transition-transform hover:scale-105"
                          onClick={() =>
                            setSelectedImage(
                              `http://localhost/KindLoop-project01/Backend/${img}`
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!userID}
                  onClick={() => {
                    handleRequestItem(donation.DonationID);
                  }}
                >
                  Request Item
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChat(donation.DonationID)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
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
            <Button onClick={() => setSelectedImage(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default DonationDetails;
