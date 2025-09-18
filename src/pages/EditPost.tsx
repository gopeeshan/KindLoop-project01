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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Polite, professional messaging for restricted edits
  const EDIT_RESTRICTION_TITLE = "Editing restricted";
  const EDIT_RESTRICTION_DESC =
    "This field cannot be changed after a post is created.";

  // Wrapper: disabled UI with tooltip on hover and toast on click/keyboard
  const GuardedDisabled = ({
    children,
    ariaLabel,
    message = EDIT_RESTRICTION_DESC,
  }: {
    children: React.ReactNode;
    ariaLabel?: string;
    message?: string;
  }) => {
    const handleNotify = (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      toast({
        title: EDIT_RESTRICTION_TITLE,
        description: message,
      });
    };

    return (
      <TooltipProvider>
        <Tooltip delayDuration={150}>
          <div className="relative">
            {/* True disabled UI */}
            <div className="pointer-events-none">{children}</div>

            {/* Interactive overlay: shows toast on click; serves as tooltip trigger on hover */}
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={ariaLabel || "Editing restricted"}
                className="absolute inset-0 z-10 cursor-not-allowed bg-transparent rounded-[inherit]"
                onClick={handleNotify}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleNotify(e);
                }}
              />
            </TooltipTrigger>

            <TooltipContent side="top" align="start" className="max-w-xs">
              {message}
            </TooltipContent>
          </div>
        </Tooltip>
      </TooltipProvider>
    );
  };

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
            title: "Unable to load post",
            description:
              "We couldn’t load the post details at this moment. Please try again shortly.",
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          title: "Unable to load post",
          description:
            "We couldn’t load the post details at this moment. Please try again shortly.",
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
        title: "Invalid link",
        description: "The donation ID is missing from the URL.",
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
        description: `You can upload up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      });

      e.target.value = "";
      return;
    }

    setImages(files);
  };

  const [userID, setUserID] = useState<number | null>(null);

  // Fetch userID from session on mount
  useEffect(() => {
    fetch("http://localhost/KindLoop-project01/Backend/profile.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserID(data?.userID ?? null);
      })
      .catch(() => setUserID(null));
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userID) {
      toast({
        title: "You’re not signed in",
        description: "Please sign in again to continue.",
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
        title: "Required fields missing",
        description: "Please complete all required fields before submitting.",
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
          title: "Post updated",
          description: "Your donation post has been updated successfully.",
        });
        navigate("/");
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          "An unexpected error occurred while updating your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
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
                    <Label className="opacity-60 cursor-not-allowed">
                      Category *
                    </Label>
                    <GuardedDisabled ariaLabel="Category cannot be edited">
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger
                          disabled
                          className="cursor-not-allowed opacity-60"
                        >
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
                          <SelectItem value="Health & Personal Care">
                            Health & Personal Care
                          </SelectItem>
                          <SelectItem value="Pet Supplies">Pet Supplies</SelectItem>
                          <SelectItem value="Office & School Supplies">
                            Office & School Supplies
                          </SelectItem>
                          <SelectItem value="Hobbies & Crafts">
                            Hobbies & Crafts
                          </SelectItem>
                          <SelectItem value="Automotive & Tools">
                            Automotive & Tools
                          </SelectItem>
                          <SelectItem value="Musical Instruments">
                            Musical Instruments
                          </SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </GuardedDisabled>
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-60 cursor-not-allowed">
                      Condition *
                    </Label>
                    <GuardedDisabled ariaLabel="Condition cannot be edited">
                      <Select value={condition} onValueChange={setCondition} required>
                        <SelectTrigger
                          disabled
                          className="cursor-not-allowed opacity-60"
                        >
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
                    </GuardedDisabled>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="usageDuration"
                      className="opacity-60 cursor-not-allowed"
                    >
                      Usage Duration *
                    </Label>
                    <GuardedDisabled ariaLabel="Usage Duration cannot be edited">
                      <Input
                        id="usageDuration"
                        placeholder="e.g., 6 months"
                        value={usageDuration}
                        onChange={(e) => setUsageDuration(e.target.value)}
                        required
                        disabled
                        readOnly
                        className="cursor-not-allowed opacity-60"
                      />
                    </GuardedDisabled>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="quantity"
                      className="opacity-60 cursor-not-allowed"
                    >
                      Quantity *
                    </Label>
                    <GuardedDisabled ariaLabel="Quantity cannot be edited">
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        disabled
                        readOnly
                        className="cursor-not-allowed opacity-60"
                      />
                    </GuardedDisabled>
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
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Loading..." : "Update Post"}
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