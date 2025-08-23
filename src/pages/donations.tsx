import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Donations = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      const res = await fetch(
        "http://localhost/KindLoop-project01/Backend/get-donations.php"
      );
      const json = await res.json();

      if (json.status === "success") {
        setDonations(json.data);
      } else {
        setError(json.message || "Failed to load donations.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }

    setLoading(false);
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
    "Others",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">All Donations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse through all available donations from our generous community.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* <Select
            value={verificationFilter}
            onValueChange={(value) => setVerificationFilter(value)}
          >
            <SelectTrigger className="w-full lg:w-48">
              <CheckCircle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select> */}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredDonations.length} of {donations.length} donations
          </p>
        </div>

        {loading ? (
          <p className="text-center">Loading donations...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No donations found matching your criteria.
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
              <Link
                to={`/donation/${donation.DonationID}`}
                key={donation.DonationID}
              >
                <Card className="group hover:shadow-lg cursor-pointer relative">
                  <div className="w-full h-64 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {donation.images && donation.images.length > 0 ? (
                      <img
                        src={`http://localhost/KindLoop-project01/Backend/${donation.images[0]}`}
                        alt="Donation preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {donation.isVerified == 1 ? (
                      <Badge
                        variant="default"
                        className="bg-green-500 text-white"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700 border-orange-200"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
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
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer transition-all">
                      <Eye className="h-4 w-4" />
                      <span>Click to view details</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Donations;
