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
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const PostCreation = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [usageDuration, setUsageDuration] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userID, setUserID] = useState<number | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const MAX_IMAGES = 5;

  useEffect(() => {
    fetch("http://localhost/KindLoop-project01/Backend/profile.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserID(data && data.userID ? data.userID : null);
      })
      .catch(() => setUserID(null));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (selectedImages.length + newFiles.length > MAX_IMAGES) {
      toast({
        title: "Upload limit reached",
        description: `You can only upload up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setSelectedImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userID) {
      toast({ title: "User Not Found", description: "Please log in again." });
      return;
    }

    if (!title || !description || !category || !location || !condition || !usageDuration) {
      toast({ title: "Missing Fields", description: "Please fill all required fields." });
      return;
    }

    const formData = new FormData();
    formData.append("userID", String(userID));
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("location", location);
    formData.append("condition", condition);
    formData.append("usageDuration", usageDuration);
    formData.append("quantity", quantity);

    selectedImages.forEach((file) => formData.append("images[]", file));

    try {
      const response = await axios.post(
        "http://localhost/KindLoop-project01/Backend/create-post.php",
        formData
      );
      const data = await response.data;
      if (data.status === "success") {
        toast({
          title: "Success",
          description: data.message || "Post created successfully.",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create post.",
        });
      }
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  };

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
              <CardTitle className="text-3xl">Create a Donation Post</CardTitle>
              <p className="text-muted-foreground">
                Share items you'd like to donate with your community
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clothing & Accessories">Clothing & Accessories</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Books & Education">Books & Education</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                        <SelectItem value="Kitchen & Dining">Kitchen & Dining</SelectItem>
                        <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                        <SelectItem value="Toys & Games">Toys & Games</SelectItem>
                        <SelectItem value="Baby & Kids">Baby & Kids</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Very Good">Very Good</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Acceptable">Acceptable</SelectItem>
                        <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                        <SelectItem value="Not Sure">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageDuration">Usage Duration *</Label>
                    <Select onValueChange={(value) => setUsageDuration(value)}>
                      <SelectTrigger id="usageDuration" className="pl-3">
                        <SelectValue placeholder="Select usage duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Within 1">Within 1 year</SelectItem>
                        <SelectItem value="2 to 4">2 – 4 years</SelectItem>
                        <SelectItem value="5 to 7">5 – 7 years</SelectItem>
                        <SelectItem value="8 to 10">8 – 10 years</SelectItem>
                        <SelectItem value="More Than 10">More than 10 years</SelectItem>
                        <SelectItem value="Not Sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
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
                  <Label htmlFor="images">Images (Optional)</Label>
                  <Input
                    id="images[]"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {/* Image Previews */}
                  {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setPreviewImage(URL.createObjectURL(image))}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Post Donation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for large image preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview-large"
            className="max-h-[80%] max-w-[80%] rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PostCreation;
