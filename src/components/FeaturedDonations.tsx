import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MessageCircle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const FeaturedDonations = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost/KindLoop-project01/Backend/get-donations.php");
      const json = await res.json();

      if (json.status === "success") {
        setDonations(json.data);
      } else {
        setError(json.message || "Failed to load featured donations.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }

    setLoading(false);
  };

  const handleChat = (DonationID: number) => {
    console.log(`Initiating chat with donor of donation ${DonationID}`);
  };

  const handleRequestItem = (DonationID: number) => {
    console.log(`Sending request for donation ${DonationID}`);
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      donation.category?.toLowerCase() === selectedCategory.toLowerCase();

    const isVerified = donation.isVerified ?? true;

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && isVerified) ||
      (verificationFilter === "unverified" && !isVerified);

    return matchesSearch && matchesCategory && matchesVerification;
  });

  const categories = [
    "all",
    "Clothing & Accessories",
    "Electronics",
    "Books & Education",
    "Furniture",
    "Sports & Outdoors",
    "Kitchen & Dining",
    "Home & Garden",
    "Toys & Games",
    "Baby & Kids",
    "Others"
  ];

  function handleViewAllDonations(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    // Redirect to the main donations page
    window.location.href = "/donations";
  }

  return (
    <section id="featured-donations" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Donations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover highlighted contributions from our kindhearted donors. These items were chosen for their value and generosity.
          </p>
        </div>

        <div className="mb-6 text-sm text-muted-foreground">
          Showing {filteredDonations.length} of {donations.length} featured donations
        </div>

        {loading ? (
          <p className="text-center">Loading featured donations...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No featured donations match your current filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setVerificationFilter("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <Card key={donation.DonationID} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center relative">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">
                          {donation.category?.[0] || "?"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {donation.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {donation.isVerified ? (
                        <Badge variant="default" className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {donation.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {donation.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        <span>{donation.fullName}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{donation.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{donation.date_time}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleRequestItem(donation.DonationID)}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" onClick={handleViewAllDonations}>
            View All Donations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDonations;
