import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturedDonations = () => {
  const navigate = useNavigate();

  const donations = [
    {
      id: 1,
      title: "Winter Coats for Families",
      donor: "Sarah M.",
      Address: "Downtown Community Center",
      timeAgo: "2 hours ago",
      image: "/placeholder.svg",
      description:
        "Warm winter coats in various sizes, perfect for the upcoming cold season.",
      category: "Clothing",
      isVerified: true,
    },
    {
      id: 2,
      title: "Children's Books Collection",
      donor: "Mike R.",
      Address: "Public Library Branch",
      timeAgo: "5 hours ago",
      image: "/placeholder.svg",
      description:
        "Educational and fun books for children ages 5-12, all in great condition.",
      category: "Books",
      isVerified: false,
    },
    {
      id: 3,
      title: "Kitchen Appliances Set",
      donor: "Anna K.",
      Address: "Westside Community",
      timeAgo: "1 day ago",
      image: "/placeholder.svg",
      description:
        "Blender, toaster, and coffee maker - perfect for new families starting out.",
      category: "Home",
      isVerified: true,
    },
  ];

  const handleViewAllDonations = () => {
    navigate("/donations");
  };

  return (
    <section id="donations" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Featured Donations</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recent donations from our generous community members looking to help others.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {donations.map((donation) => (
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
                      <span>{donation.Address}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{donation.timeAgo}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">Request Item</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
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
