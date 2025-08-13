import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Clock, CheckCircle, XCircle, MessageSquare, AlertTriangle, Forward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AdminComplaints = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [solution, setSolution] = useState("");
  const [actionType, setActionType] = useState("");

  // Check admin authentication on component mount
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (adminLoggedIn === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Mock complaints data - in a real app, this would come from your backend
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      userId: 101,
      userName: "Sarah M.",
      userEmail: "sarah@example.com",
      donationTitle: "Winter Coats for Families",
      donorName: "Mike R.",
      reason: "quality_issue",
      urgency: "high",
      description: "The donated winter coats have several tears and are not suitable for children as described. Some coats are missing buttons and zippers are broken.",
      submittedDate: "2024-03-21T14:30:00Z",
      status: "pending"
    },
    {
      id: 2,
      userId: 102,
      userName: "John D.",
      userEmail: "john@example.com",
      donationTitle: "Children's Books Collection",
      donorName: "Anna K.",
      reason: "not_received",
      urgency: "medium",
      description: "I was supposed to receive the children's books 5 days ago but the donor hasn't contacted me yet. The pickup location was confirmed but no one showed up.",
      submittedDate: "2024-03-20T10:15:00Z",
      status: "pending"
    },
    {
      id: 3,
      userId: 103,
      userName: "Emma L.",
      userEmail: "emma@example.com",
      donationTitle: "Kitchen Appliances Set",
      donorName: "Tom S.",
      reason: "inappropriate_content",
      urgency: "low",
      description: "The donor made inappropriate comments during the pickup process and made me feel uncomfortable. This behavior is unacceptable.",
      submittedDate: "2024-03-19T16:45:00Z",
      status: "resolved"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Pending</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      case "escalated":
        return <Badge variant="destructive">Escalated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "quality_issue":
        return "Quality Issue";
      case "not_received":
        return "Not Received";
      case "inappropriate_content":
        return "Inappropriate Behavior";
      case "other":
        return "Other";
      default:
        return reason;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResolveComplaint = () => {
    if (!solution.trim()) {
      toast({
        title: "Error",
        description: "Please provide a solution before resolving the complaint.",
        variant: "destructive"
      });
      return;
    }

    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { ...complaint, status: "resolved" }
          : complaint
      )
    );

    toast({
      title: "Complaint Resolved",
      description: "The complaint has been marked as resolved and the user has been notified.",
    });

    setSelectedComplaint(null);
    setSolution("");
  };

  const handleEscalateComplaint = () => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { ...complaint, status: "escalated" }
          : complaint
      )
    );

    toast({
      title: "Complaint Escalated",
      description: "The complaint has been escalated to higher authorities.",
    });

    setSelectedComplaint(null);
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button 
            onClick={() => navigate('/admin')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complaint Management</h1>
            <p className="text-muted-foreground">Review and resolve user complaints</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Complaints</p>
                  <p className="text-2xl font-bold">{complaints.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {complaints.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              All Complaints ({complaints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complainant</TableHead>
                  <TableHead>Donation</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{complaint.userName}</p>
                        <p className="text-sm text-muted-foreground">{complaint.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{complaint.donationTitle}</p>
                        <p className="text-sm text-muted-foreground">by {complaint.donorName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getReasonLabel(complaint.reason)}</TableCell>
                    <TableCell>{getUrgencyBadge(complaint.urgency)}</TableCell>
                    <TableCell className="text-sm">{formatDate(complaint.submittedDate)}</TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Complaint Details</DialogTitle>
                          </DialogHeader>
                          {selectedComplaint && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Complainant</h4>
                                  <p>{selectedComplaint.userName}</p>
                                  <p className="text-sm text-muted-foreground">{selectedComplaint.userEmail}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Donation</h4>
                                  <p>{selectedComplaint.donationTitle}</p>
                                  <p className="text-sm text-muted-foreground">by {selectedComplaint.donorName}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Reason</h4>
                                  <p>{getReasonLabel(selectedComplaint.reason)}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Urgency</h4>
                                  {getUrgencyBadge(selectedComplaint.urgency)}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
                                <p className="text-sm bg-muted p-3 rounded-md">{selectedComplaint.description}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Submitted</h4>
                                <p className="text-sm">{formatDate(selectedComplaint.submittedDate)}</p>
                              </div>

                              {selectedComplaint.status === 'pending' && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Solution/Response</label>
                                    <Textarea
                                      placeholder="Provide your solution or response to this complaint..."
                                      value={solution}
                                      onChange={(e) => setSolution(e.target.value)}
                                      rows={4}
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={handleResolveComplaint}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Resolve Complaint
                                    </Button>
                                    <Button 
                                      onClick={handleEscalateComplaint}
                                      variant="destructive"
                                      className="flex items-center gap-2"
                                    >
                                      <Forward className="h-4 w-4" />
                                      Escalate
                                    </Button>
                                  </div>
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