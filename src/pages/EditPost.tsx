import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const EditPost = () => {
  const { donationID } = useParams(); // Get post ID from URL
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [usageDuration, setUsageDuration] = useState<string>("");
  const [images, setImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  const MAX_IMAGES = 5;

  useEffect(() => {
    // Fetch post data to populate fields (align with existing backend)
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          "http://localhost/KindLoop-project01/Backend/get-donation-by-id.php",
          { params: { DonationID: donationID } }
        );
        const data = response.data;
        if (data.status === "success" && data.data) {
          const post = data.data;
          setTitle(post.title || "");
          setDescription(post.description || "");
          setCategory(post.category || "");
          setLocation(post.location || "");
          setCondition(post.condition || "");
          setUsageDuration(post.usageDuration || "");
          setQuantity(post.quantity != null ? String(post.quantity) : "");

          // Normalize images into an array
          let imgs: string[] = [];
          if (Array.isArray(post.images)) {
            imgs = post.images;
          } else if (typeof post.images === "string" && post.images.length > 0) {
            try {
              const parsed = JSON.parse(post.images);
              if (Array.isArray(parsed)) imgs = parsed;
            } catch {
              // ignore invalid JSON
            }
          }
          setExistingImages(imgs);
        } else {
          toast({
            title: "Error",
            description: "Could not fetch post details.",
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch post details.",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (donationID) {
      fetchPost();
    } else {
      setLoading(false);
      toast({
        title: "Invalid URL",
        description: "Missing donation ID.",
      });
      navigate("/");
    }
    // eslint-disable-next-line
  }, [donationID]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length > MAX_IMAGES) {
      toast({
        title: "Upload limit reached",
        description: `You can only upload up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      });

      e.target.value = "";
      return;
    }

    setImages(files);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const storedID = localStorage.getItem("userID");
    const userID = storedID ? parseInt(storedID, 10) : null;

    if (!userID) {
      toast({
        title: "User Not Found",
        description: "Please log in again.",
      });
      return;
    }

    if (
      !title ||
      !description ||
      !category ||
      !location ||
      !condition ||
      !usageDuration ||
      !quantity
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("donationID", String(donationID));
    formData.append("userID", String(userID));
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("location", location);
    formData.append("condition", condition);
    formData.append("usageDuration", usageDuration);
    formData.append("quantity", quantity);

    // Always send the images we want to keep
    formData.append("existingImages", JSON.stringify(existingImages));

    // If user selected new files, append them. Backend will merge.
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images[]", images[i]);
      }
    }

    try {
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/edit-post.php",
        formData
      );
      const data = response.data;
      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Post updated successfully.",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update post.",
        });
      }
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Edit Donation Post</CardTitle>
              <p className="text-muted-foreground">
                Update your donation post details below
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Winter Jackets"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Details about the item"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clothing & Accessories">
                          Clothing & Accessories
                        </SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Books & Education">
                          Books & Education
                        </SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Sports & Outdoors">
                          Sports & Outdoors
                        </SelectItem>
                        <SelectItem value="Kitchen & Dining">
                          Kitchen & Dining
                        </SelectItem>
                        <SelectItem value="Home & Garden">
                          Home & Garden
                        </SelectItem>
                        <SelectItem value="Toys & Games">
                          Toys & Games
                        </SelectItem>
                        <SelectItem value="Baby & Kids">Baby & Kids</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select
                      value={condition}
                      onValueChange={setCondition}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Very Good">Very Good</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Acceptable">Acceptable</SelectItem>
                        <SelectItem value="Needs Repair">
                          Needs Repair
                        </SelectItem>
                        <SelectItem value="Not Sure">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageDuration">Usage Duration *</Label>
                    <Input
                      id="usageDuration"
                      placeholder="e.g., 6 months"
                      value={usageDuration}
                      onChange={(e) => setUsageDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Pickup Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="e.g., Downtown Community Center"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {/* If you want to support deletions, you can render existingImages here with a remove toggle and
                      send a `removeImages` JSON array in the submit handler. */}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Update Post
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditPost;