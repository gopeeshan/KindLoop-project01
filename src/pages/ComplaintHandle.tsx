import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Forward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DonationDetails from "./DonationDetails";

interface DonationDetails {
  donationID: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  usageDuration: string;
  quantity: number;
  images: string[];
}
interface Complaint {
  ComplaintID: number;
  donationID: number;
  userId: number;
  userName: string;
  userEmail: string;
  donorId: number;
  donorName: string;
  donationTitle: string;
  reason: string;
  description: string;
  submittedDate: string;
  status: "pending" | "resolved";
  solution?: string;
  evidence_images?: string[];
  proof_images?: string[];
  resolvedByAdminEmail?: string;
}
interface DonorDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  total_donations: number;
  credit_points: number;
}
interface ComplainantDetails {
  name: string;
  email: string;
  occupation: string;
  contactNumber: string;
  credit_points: number;
}

const AdminComplaints = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [solution, setSolution] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [donorDetails, setDonorDetails] = useState<DonorDetails | null>(null);
  const [complainantDetails, setComplainantDetails] =
    useState<ComplainantDetails | null>(null);
  const [donationDetails, setDonationDetails] =
    useState<DonationDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "resolved">(
    "all"
  );
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const adminID = 2; // add the adminID from user table...

  useEffect(() => {
    fetch("http://localhost/KindLoop-project01/Backend/Admin.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.adminID) {
          setIsAuthenticated(true);
          fetchComplaints();
        } else {
          setIsAuthenticated(false);
          navigate("/login");
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        navigate("/login");
      });
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost/KindLoop-project01/Backend/ComplaintController.php",
        { withCredentials: true }
      );
      setComplaints(Array.isArray(data) ? data : []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch complaints.",
        variant: "destructive",
      });
    }
  };

  const fetchDonorDetails = async (donorId: number) => {
    const { data } = await axios.get(
      `http://localhost/KindLoop-project01/Backend/ComplaintController.php?id=${donorId}&type=donor`
    );
    if (data.success) {
      setDonorDetails(data.donor);
    }
  };

  const fetchComplainantDetails = async (userId: number) => {
    const { data } = await axios.get(
      `http://localhost/KindLoop-project01/Backend/ComplaintController.php?id=${userId}&type=user`
    );
    if (data.success) {
      setComplainantDetails(data.user);
    }
  };

  const fetchDonationDetails = async (donationID: number) => {
    const { data } = await axios.get(
      `http://localhost/KindLoop-project01/Backend/ComplaintController.php?id=${donationID}&type=donation`
    );
    if (data.success) {
      const donationData = data.donation.data;
      donationData.images = donationData.images
        ? JSON.parse(donationData.images)
        : [];
      setDonationDetails(donationData);
      // setDonationDetails(data.donation.data);
    }
  };

  const getReasonLabel = (reason: string) =>
    reason === "other" ? "Other" : reason;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResolveComplaint = async () => {
    if (!solution.trim()) {
      toast({
        title: "Error",
        description: "Please provide a solution.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("solution", solution);
    formData.append("id", selectedComplaint.ComplaintID.toString());
    formData.append("action", "resolve");
    proofFiles.forEach((file) => formData.append("proof_images[]", file));

    try {
      const { data } = await axios.post(
        `http://localhost/KindLoop-project01/Backend/ComplaintController.php?action=resolve&id=${selectedComplaint.ComplaintID}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        toast({ title: "Complaint Resolved", description: data.message });

        setComplaints((prev) =>
          prev.map((c) =>
            c.ComplaintID === selectedComplaint.ComplaintID
              ? {
                  ...c,
                  status: "resolved",
                  solution,
                  proof_images: data.proof_images || [],
                }
              : c
          )
        );
        // sendNotification(
        //   selectedComplaint.donationID,
        //   adminID,
        //   selectedComplaint.userId,
        //   selectedComplaint.id
        // );
        sendNotification(
          selectedComplaint.donationID,
          selectedComplaint.userId,
          adminID,
          selectedComplaint.ComplaintID
        );

        setSelectedComplaint(null);
        setSolution("");
        setProofFiles([]);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to resolve complaint.",
        variant: "destructive",
      });
    }
  };

  const sendNotification = (
    donationID: number,
    DonorID: number,
    RequesterID: number,
    complaintID: number
  ) => {
    axios
      .post(
        "http://localhost/KindLoop-project01/Backend/NotificationHandler.php",
        {
          donationID,
          msg_receiver_ID: DonorID,
          msg_sender_ID: RequesterID,
          complaintID,
          action: "complaint_resolved",
        },{ withCredentials: true }
      )
      .then((res) => console.log("Notification sent", res.data))
      .catch((err) => console.error(err));
  };

  if (!isAuthenticated) return null;

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === "all") return true;
    return c.status === activeTab;
  });

  const getStatusBadge = (status: string) => (
    <Badge
      className={
        status === "pending"
          ? "bg-orange-100 text-orange-700"
          : status === "resolved"
          ? "bg-green-500"
          : ""
      }
    >
      {status}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Complaint Management
          </h1>
          <p className="text-muted-foreground">
            Review and resolve user complaints
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Total Complaints",
              value: complaints.length,
              icon: <MessageSquare className="h-8 w-8 text-primary" />,
            },
            {
              title: "Pending Review",
              value: complaints.filter((c) => c.status === "pending").length,
              icon: <Clock className="h-8 w-8 text-orange-600" />,
            },
            {
              title: "Resolved Complaints",
              value: complaints.filter((c) => c.status === "resolved").length,
              icon: <CheckCircle className="h-8 w-8 text-green-600" />,
            },
          ].map((card, idx) => (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p
                    className={`text-2xl font-bold ${
                      card.title.includes("Pending")
                        ? "text-orange-600"
                        : card.title.includes("Resolved")
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
                {card.icon}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-12 mb-4">
          {["all", "pending", "resolved"].map((tab) => (
            <button
              key={tab}
              className={`px-12 py-3 font-medium relative border-b-2 ${
                activeTab === tab
                  ? "border-gray-800 text-gray-800"
                  : "border-gray-300"
              }
                  hover:border-gray-400 transition-all duration-200
                  focus:outline-none

              `}
              onClick={() => {
                setActiveTab(tab as "all" | "pending" | "resolved");
              }}
            >
              {tab === "all"
                ? "All Complaints"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === "all"
                ? `All Complaints (${complaints.length})`
                : activeTab === "pending"
                ? `Pending Complaints (${filteredComplaints.length})`
                : `Resolved Complaints (${filteredComplaints.length})`}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complainant</TableHead>
                  <TableHead>Donation</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.ComplaintID}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{complaint.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {complaint.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{complaint.donationTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          by {complaint.donorName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getReasonLabel(complaint.reason)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(complaint.submittedDate)}
                    </TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                    <TableCell>
                      <Dialog
                        open={selectedComplaint?.ComplaintID === complaint.ComplaintID}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) setSelectedComplaint(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            Review
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-2xl w-full h-auto max-h-[90vh] overflow-y-auto my-4">
                          <DialogHeader>
                            <DialogTitle>Complaint Details</DialogTitle>
                          </DialogHeader>
                          {selectedComplaint && (
                            <div className="p-4 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                {/* Complainant Details */}
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">
                                    Complainant
                                  </h4>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() =>
                                          fetchComplainantDetails(
                                            selectedComplaint.userId
                                          )
                                        }
                                      >
                                        {selectedComplaint.userName}
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Complainant Details
                                        </DialogTitle>
                                      </DialogHeader>
                                      {complainantDetails ? (
                                        <div className="space-y-2">
                                          <p>
                                            <strong>Name:</strong>{" "}
                                            {complainantDetails.name}
                                          </p>
                                          <p>
                                            <strong>Email:</strong>{" "}
                                            {complainantDetails.email}
                                          </p>
                                          <p>
                                            <strong>Occupation:</strong>{" "}
                                            {complainantDetails.occupation}
                                          </p>
                                          <p>
                                            <strong>Contact No:</strong>{" "}
                                            {complainantDetails.contactNumber}
                                          </p>
                                          <p>
                                            <strong>Credit Points:</strong>{" "}
                                            {complainantDetails.credit_points}
                                          </p>
                                        </div>
                                      ) : (
                                        <p>Loading complainant info...</p>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">
                                    Donation
                                  </h4>

                                  <div className="flex items-center gap-20">
                                    <Dialog
                                      open={isDonationDialogOpen}
                                      onOpenChange={setIsDonationDialogOpen}
                                    >
                                      <DialogTrigger asChild>
                                        <button
                                          className="text-blue-600 hover:underline"
                                          onClick={() => {
                                            fetchDonationDetails(
                                              selectedComplaint.donationID
                                            );
                                            setIsDonationDialogOpen(true);
                                          }}
                                        >
                                          {selectedComplaint.donationTitle}
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Donation Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        {donationDetails ? (
                                          // (console.log(donationDetails),
                                          // (
                                          <div className="space-y-2">
                                            <p>
                                              <strong>Title:</strong>
                                              {donationDetails.title}
                                            </p>
                                            <p>
                                              <strong>Description:</strong>{" "}
                                              {donationDetails.description}
                                            </p>
                                            <p>
                                              <strong>Category:</strong>{" "}
                                              {donationDetails.category}
                                            </p>
                                            <p>
                                              <strong>Condition:</strong>{" "}
                                              {donationDetails.condition}
                                            </p>
                                            <p>
                                              <strong>Usage Duration:</strong>{" "}
                                              {donationDetails.usageDuration}
                                            </p>
                                            <p>
                                              <strong>Quantity:</strong>{" "}
                                              {donationDetails.quantity}
                                            </p>

                                            {donationDetails.images &&
                                              donationDetails.images.length >
                                                0 && (
                                                <div>
                                                  <strong>Images:</strong>
                                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {donationDetails.images.map(
                                                      (img, idx) => (
                                                        <img
                                                          key={idx}
                                                          src={`http://localhost/KindLoop-project01/Backend/${img.trim()}`}
                                                          alt={`donation-${idx}`}
                                                          className="w-40 h-40 object-cover rounded-lg shadow-sm"
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
                                          </div>
                                        ) : (
                                          // ))
                                          <p>Loading donation info...</p>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                    <Dialog
                                      open={!!selectedImage}
                                      onOpenChange={() =>
                                        setSelectedImage(null)
                                      }
                                    >
                                      <DialogContent className="max-w-3xl p-4">
                                        <img
                                          src={selectedImage ?? ""}
                                          alt="Full Size"
                                          className="max-w-[50vw] max-h-[50vh] w-auto h-auto mx-auto rounded-lg object-contain"
                                        />
                                        <DialogFooter>
                                          <Button
                                            onClick={() =>
                                              setSelectedImage(null)
                                            }
                                          >
                                            Close
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>

                                  <div>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button
                                          className="text-blue-600 hover:underline"
                                          onClick={() =>
                                            fetchDonorDetails(
                                              selectedComplaint.donorId
                                            )
                                          }
                                        >
                                          By: {selectedComplaint.donorName}
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Donor Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        {donorDetails ? (
                                          <div className="space-y-2">
                                            <p>
                                              <strong>Name:</strong>{" "}
                                              {donorDetails.name}
                                            </p>
                                            <p>
                                              <strong>Email:</strong>{" "}
                                              {donorDetails.email}
                                            </p>
                                            <p>
                                              <strong>Phone:</strong>{" "}
                                              {donorDetails.phone}
                                            </p>
                                            <p>
                                              <strong>Occupation:</strong>{" "}
                                              {donorDetails.occupation}
                                            </p>
                                            <p>
                                              <strong>Past Donations:</strong>{" "}
                                              {donorDetails.total_donations}{" "}
                                              items
                                            </p>
                                            <p>
                                              <strong>Credit points:</strong>{" "}
                                              {donorDetails.credit_points}
                                            </p>
                                          </div>
                                        ) : (
                                          <p>Loading donor info...</p>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">
                                    Reason
                                  </h4>
                                  <p>
                                    {getReasonLabel(selectedComplaint.reason)}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                  Description
                                </h4>
                                <p className="text-sm bg-muted p-3 rounded-md">
                                  {selectedComplaint.description}
                                </p>
                              </div>

                              {selectedComplaint.evidence_images &&
                                selectedComplaint.evidence_images.length >
                                  0 && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                      Evidence Images
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {/* {selectedComplaint.evidence_images.map(
                                        (img, index) => (
                                          <img
                                            key={index}
                                            src={img}
                                            alt={`evidence-${index}`}
                                            className="w-32 h-32 object-cover rounded-md border border-muted p-1"
                                          />
                                        )
                                      )} */}
                                      {selectedComplaint.evidence_images.map(
                                        (img, idx) => (
                                          <img
                                            key={idx}
                                            src={img}
                                            alt={`evidence-${idx}`}
                                            className="w-40 h-40 object-cover rounded-lg shadow-sm"
                                            onClick={() =>
                                              setSelectedImage(img)
                                            }
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                  Submitted
                                </h4>
                                <p className="text-sm">
                                  {formatDate(selectedComplaint.submittedDate)}
                                </p>
                              </div>

                              {selectedComplaint.status === "pending" && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Solution/Response
                                    </label>
                                    <Textarea
                                      placeholder="Provide your solution or response to this complaint..."
                                      value={solution}
                                      onChange={(e) =>
                                        setSolution(e.target.value)
                                      }
                                      rows={4}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Upload Proof (optional)
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) => {
                                        if (e.target.files) {
                                          setProofFiles(
                                            Array.from(e.target.files)
                                          );
                                        }
                                      }}
                                      className="block text-sm text-muted-foreground"
                                    />
                                  </div>

                                  <div className="flex gap-8">
                                    <Button
                                      onClick={handleResolveComplaint}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Resolve Complaint
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Admin Response Section */}
                              {selectedComplaint.solution && (
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                    Admin Response
                                  </h4>
                                  <p className="text-sm bg-green-50 p-3 rounded-md">
                                    {selectedComplaint.solution}
                                  </p>

                                  {selectedComplaint.solution && (
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                        Resolved by:
                                      </h4>
                                      <p className="text-sm bg-purple-100 p-3 rounded-md">
                                        {selectedComplaint.resolvedByAdminEmail}
                                      </p>

                                      {selectedComplaint.proof_images &&
                                        selectedComplaint.proof_images.length >
                                          0 && (
                                          <div className="mt-2">
                                            <h5 className="text-sm font-medium">
                                              Proof Images
                                            </h5>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                              {selectedComplaint.proof_images.map(
                                                (img: string, idx: number) => (
                                                  <img
                                                    key={idx}
                                                    src={img}
                                                    alt={`proof-${idx}`}
                                                    className="w-32 h-32 object-cover rounded-md border border-muted p-1"
                                                  />
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminComplaints;
