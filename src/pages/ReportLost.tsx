import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageUpload } from "@/components/ImageUpload";
import { MapPin, Calendar, Tag, AlertCircle, Camera, Award } from "lucide-react";
import { itemService } from "@/services/itemService";
import { CreateItemRequest } from "@/types/item";
import { useToast } from "@/hooks/use-toast";
import reportLostImage from "@/assets/report-lost-illustration.jpg";

const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Keys",
  "Documents",
  "Sports Equipment",
  "Jewelry",
  "Other"
];

const locations = [
  "Central Library",
  "Academic Block 1",
  "Academic Block 2", 
  "Academic Block 3",
  "Hostel A",
  "Hostel B",
  "Hostel C",
  "Cafeteria",
  "Sports Complex",
  "Auditorium",
  "Campus Ground",
  "Other"
];

export const ReportLost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<CreateItemRequest>({
    title: "",
    description: "",
    category: "",
    status: "LOST",
    location: "",
    contactInfo: "",
    userName: "", // Add userName field
    imageUrl: "", // Initialize with empty string
    reward: "" // Add reward field
  });

  const handleInputChange = (field: keyof CreateItemRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (uploadResult: any) => {
    if (uploadResult) {
      setUploadedImage(uploadResult);
      setImagePreview(uploadResult.imageUrl); // Fixed: was uploadResult.url
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: uploadResult.imageUrl // Fixed: was uploadResult.url
      }));
    } else {
      setUploadedImage(null);
      setImagePreview('');
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: '' 
      }));
    }
  };

  const handleImageSelect = (file: File | null) => {
    if (file) {
      // Create local preview while uploading
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!uploadedImage) {
      // Only clear preview if no uploaded image
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create payload that matches backend expectations
      const submitData = {
        name: formData.title, // Backend expects 'name' field
        description: formData.description,
        category: formData.category,
        location: formData.location,
        status: formData.status,
        imageUrl: formData.imageUrl,
        reward: formData.reward,
        contactInfo: formData.contactInfo
      };
      
      // Submit the form data with the image URL
      await itemService.createItem(submitData);
      
      toast({
        title: "Success! 🎉",
        description: "Your lost item has been reported successfully. Our community will help you find it!",
        variant: "default",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to report item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Form Side */}
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Report a <span className="bg-gradient-primary bg-clip-text text-transparent">Lost Item</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Don't worry! Our community will help you find your lost item. Fill out the details below. 🔍
                </p>
              </div>

              <Card className="card-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Item Details
                  </CardTitle>
                  <CardDescription>
                    Provide as much detail as possible to help others identify your item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Item Name *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., MacBook Pro 13-inch, Blue Water Bottle"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="h-12 rounded-2xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userName">Your Name *</Label>
                      <Input
                        id="userName"
                        placeholder="e.g., Vishnu, Arjun, Priya"
                        value={formData.userName}
                        onChange={(e) => handleInputChange("userName", e.target.value)}
                        className="h-12 rounded-2xl"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        This name will be displayed to others who find your item
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Select category" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Last Seen Location *</Label>
                      <Select onValueChange={(value) => handleInputChange("location", value)}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Where did you last see it?" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your item in detail - color, size, brand, any unique features, etc."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-[120px] rounded-2xl resize-none"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Information *</Label>
                      <Input
                        id="contactInfo"
                        placeholder="Phone number or email for contact"
                        value={formData.contactInfo}
                        onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                        className="h-12 rounded-2xl"
                        required
                      />
                    </div>

                    {/* Reward Field */}
                    <div className="space-y-2">
                      <Label htmlFor="reward">Reward Amount (Optional)</Label>
                      <div className="relative">
                        <Input
                          id="reward"
                          type="number"
                          placeholder="e.g., 500"
                          value={formData.reward || ""}
                          onChange={(e) => handleInputChange("reward", e.target.value)}
                          className="h-12 rounded-2xl pl-12"
                          min="0"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">₹</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Optional reward amount for whoever finds and returns your item
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photo">Add Photo (Optional)</Label>
                      <ImageUpload
                        onImageUploaded={handleImageUploaded}
                        onImageSelect={handleImageSelect}
                        preview={imagePreview}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Adding a photo helps others identify your item more easily
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Report Lost Item"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Your contact information will be shared only with users who respond to help. 🔒
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Illustration Side */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="relative">
              <img
                src={reportLostImage}
                alt="Report lost item illustration"
                className="w-full max-w-md mx-auto h-auto rounded-3xl shadow-soft float"
              />
            </div>
            
            <div className="card-soft p-6 space-y-4">
              <h3 className="font-semibold text-foreground">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be as specific as possible in your description</li>
                <li>• Include unique features or identifying marks</li>
                <li>• Add a clear photo if you have one</li>
                <li>• Check back regularly for responses</li>
                <li>• Consider offering a reward to increase chances of recovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};