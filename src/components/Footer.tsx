import { Recycle, Mail, Phone, MapPin, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import axios from "axios";

const Footer = () => {
  const { toast } = useToast();
  const [complaintDescription, setComplaintDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedImages(e.target.files);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaintDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide a complaint description.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("reason", "General Complaint");
      formData.append("description", complaintDescription);

      if (selectedImages) {
        for (let i = 0; i < selectedImages.length; i++) {
          formData.append("evidence_images[]", selectedImages[i]);
        }
      }

      const res = await axios.post(
        "http://localhost/KindLoop-project01/Backend/Complaint.php",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;

      if (data.status === "success") {
        toast({
          title: "Complaint Submitted",
          description: data.message,
        });
        setComplaintDescription("");
        setSelectedImages(null);
        const fileInput = document.getElementById(
          "complaint-images"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while submitting complaint.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-secondary/20 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Recycle className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">
                  KindLoop
                </div>
                <div className="text-sm text-muted-foreground">
                  A Reuse and Donation Space Platform
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#browse"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Items
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </a>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary transition-colors text-left">
                      File Complaint
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Submit a Complaint</span>
                      </DialogTitle>
                    </DialogHeader>

                    <form
                      onSubmit={handleSubmitComplaint}
                      className="space-y-4"
                    >
                      <div>
                        <Label
                          htmlFor="complaint-description"
                          className="text-sm font-medium text-foreground"
                        >
                          Complaint Description *
                        </Label>
                        <Textarea
                          id="complaint-description"
                          placeholder="Please describe your complaint in detail..."
                          value={complaintDescription}
                          onChange={(e) =>
                            setComplaintDescription(e.target.value)
                          }
                          className="mt-1 min-h-[100px]"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="complaint-images"
                          className="text-sm font-medium text-foreground"
                        >
                          Proof Images (Optional)
                        </Label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Input
                            id="complaint-images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="flex-1"
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {selectedImages && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedImages.length} image(s) selected
                          </p>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Complaint"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  hello@kindloop.com
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+94 711481348</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  UWUSL, Badulla, Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 KindLoop. All rights reserved. Building sustainable
            communities together.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
