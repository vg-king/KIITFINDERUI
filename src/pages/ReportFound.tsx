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
import { MapPin, Calendar, Tag, CheckCircle, Heart } from "lucide-react";
import { itemService } from "@/services/itemService";
import { CreateItemRequest } from "@/types/item";
import { useToast } from "@/hooks/use-toast";
import reportFoundImage from "@/assets/report-found-illustration.jpg";

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

export const ReportFound = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<CreateItemRequest>({
    title: "",
    description: "",
    category: "",
    status: "FOUND",
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
        title: "Thank you! 🎉",
        description: "Your found item has been reported successfully. You're helping make someone's day better!",
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
                  Report a <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Found Item</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for helping someone! Your kindness makes our community stronger. �
                </p>
              </div>

              <Card className="card-soft border-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 border-green-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Found Item Details
                  </CardTitle>
                  <CardDescription>
                    Help us connect this item with its owner
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">What did you find? *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., iPhone with blue case, Red backpack"
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
                        This name will be displayed to help the owner contact you
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
                      <Label htmlFor="location">Where did you find it? *</Label>
                      <Select onValueChange={(value) => handleInputChange("location", value)}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Location where you found it" />
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

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the item - color, size, brand, condition, any unique features..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-[120px] rounded-2xl resize-none"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photo">Add Photo (Recommended)</Label>
                      <ImageUpload
                        onImageUploaded={handleImageUploaded}
                        onImageSelect={handleImageSelect}
                        preview={imagePreview}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        A photo helps owners identify their item quickly - it doubles the reunion rate!
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Report Found Item"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      You're helping someone's day get better! Your contact info will only be shared with the verified owner. 🌟
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
                src={reportFoundImage}
                alt="Report found item illustration"
                className="w-full max-w-md mx-auto h-auto rounded-3xl shadow-soft float"
              />
            </div>
            
            <div className="card-soft p-6 space-y-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-100/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                You're amazing! 
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 95% of reported found items get reunited with owners</li>
                <li>• Your kindness makes someone's day brighter</li>
                <li>• The KIIT community appreciates helpers like you</li>
                <li>• Add a photo - it doubles the reunion rate!</li>
                <li>• We'll notify you when the owner is found</li>
              </ul>
            </div>

            <div className="card-soft p-6 space-y-3 bg-gradient-to-br from-emerald-100/50 to-green-100/50 border-emerald-200/50">
              <h4 className="font-medium text-green-800">🏆 Community Hero</h4>
              <p className="text-sm text-green-700">
                Join our group of students who've helped 95+ successful reunions this semester!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};