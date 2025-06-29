import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, User, CheckCircle, AlertCircle, Search, Filter,MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Donations = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  // Set initial category filter from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

   const handleChat = (donationId: number) => {
    console.log(`Opening chat for donation ${donationId}`);
    // Chat functionality would be implemented here
  };

  const handleRequestItem = (donationId: number) => {
    console.log(`Requesting item ${donationId}`);
    // Request functionality would be implemented here
  };
  
  // Mock data - in a real app this would come from an API
  const allDonations = [
    {
      id: 1,
      title: "Winter Coats for Families",
      donor: "Sarah M.",
      location: "Downtown Community Center",
      timeAgo: "2 hours ago",
      description: "Warm winter coats in various sizes, perfect for the upcoming cold season.",
      category: "Clothing",
      isVerified: true
    },
    {
      id: 2,
      title: "Children's Books Collection",
      donor: "Mike R.",
      location: "Public Library Branch",
      timeAgo: "5 hours ago",
      description: "Educational and fun books for children ages 5-12, all in great condition.",
      category: "Books",
      isVerified: false
    },
    {
      id: 3,
      title: "Kitchen Appliances Set",
      donor: "Anna K.",
      location: "Westside Community",
      timeAgo: "1 day ago",
      description: "Blender, toaster, and coffee maker - perfect for new families starting out.",
      category: "Electronics",
      isVerified: true
    },
    {
      id: 4,
      title: "Baby Stroller",
      donor: "John D.",
      location: "North Park",
      timeAgo: "2 days ago",
      description: "Barely used baby stroller in excellent condition, suitable for newborns to toddlers.",
      category: "Baby & Kids",
      isVerified: true
    },
    {
      id: 5,
      title: "Gaming Console",
      donor: "Alex T.",
      location: "East Side Mall",
      timeAgo: "3 days ago",
      description: "PlayStation 4 with controllers and games, great for entertainment.",
      category: "Electronics",
      isVerified: false
    },
    {
      id: 6,
      title: "Dining Table Set",
      donor: "Maria S.",
      location: "Central District",
      timeAgo: "4 days ago",
      description: "Wooden dining table with 4 chairs, perfect for small families.",
      category: "Furniture",
      isVerified: true

    },
    {
      id: 7,
      title: "Cricket Bat",
      donor: "Gopeeshan.S",
      location: "Jaffna",
      timeAgo: "1 days ago",
      description: "Wooden cricket bat, perfect for aspiring young cricketers.",
      category: "Sports",
      isVerified: true
      
    }
  ];

  const filteredDonations = allDonations.filter(donation => {
    const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || donation.category === selectedCategory;

    const matchesVerification = verificationFilter === "all" || 
                               (verificationFilter === "verified" && donation.isVerified) ||
                               (verificationFilter === "unverified" && !donation.isVerified);
    
    return matchesSearch && matchesCategory && matchesVerification;
  });

  const categories = ["all", "Clothing", "Books", "Electronics", "Baby & Kids", "Furniture"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">All Donations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse through all available donations from our generous community members.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <CheckCircle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredDonations.length} of {allDonations.length} donations
          </p>
        </div>

        {/* Donations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <Card key={donation.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center relative">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">{donation.category[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">{donation.category}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {donation.isVerified ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
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
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{donation.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{donation.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>Donated by {donation.donor}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{donation.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{donation.timeAgo}</span>
                    </div>
                  </div>
                  
                   <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleRequestItem(donation.id)}
                    >
                      Request Item
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleChat(donation.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No donations found matching your criteria.</p>
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Donations;
