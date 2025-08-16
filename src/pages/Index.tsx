import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ItemCardNew } from "@/components/ItemCardNew";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Plus, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Item } from "@/types/item";
import heroImage from "@/assets/hero-illustration.jpg";

// Mock data for demonstration
const mockItems: Item[] = [
  {
    id: 1,
    title: "MacBook Pro 13-inch",
    description: "Silver MacBook Pro with stickers. Lost near Library.",
    category: "Electronics",
    status: "LOST",
    dateReported: "2024-01-20",
    location: "Central Library",
    contactInfo: "+91 98765 43210",
    userId: 1,
    userName: "Rahul S.",
  },
  {
    id: 2,
    title: "Blue Water Bottle",
    description: "Insulated blue water bottle with KIIT logo.",
    category: "Accessories",
    status: "FOUND",
    dateReported: "2024-01-19",
    location: "Academic Block 3",
    contactInfo: "priya.m@kiit.ac.in",
    userId: 2,
    userName: "Priya M.",
  },
  {
    id: 3,
    title: "Physics Textbook",
    description: "Resnick Halliday Physics textbook, lots of notes inside.",
    category: "Books",
    status: "LOST",
    dateReported: "2024-01-18",
    location: "Hostel B",
    contactInfo: "+91 87654 32109",
    userId: 3,
    userName: "Arjun K.",
  },
  {
    id: 4,
    title: "Black Earphones",
    description: "Sony WH-1000XM4 noise cancelling headphones in black.",
    category: "Electronics",
    status: "FOUND",
    dateReported: "2024-01-17",
    location: "Cafeteria",
    contactInfo: "sneha.l@kiit.ac.in",
    userId: 4,
    userName: "Sneha L.",
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Lost something?<br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  We'll help you find it!
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                KIIT Finder connects students to reunite with their lost belongings. 
                Our friendly community is here to help! ✨
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/report-lost">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" />
                    Report Lost Item
                  </Button>
                </Link>
                <Link to="/report-found">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    <Heart className="w-5 h-5 mr-2" />
                    Report Found Item
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-96 flex items-center justify-center"> 
              <img src={heroImage} alt="Hero Illustration" className="max-w-full h-auto rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Search Lost & Found Items
            </h2>
            <p className="text-muted-foreground">
              Browse through recent reports or search for your specific item
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center shadow-gentle">
                <Search className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-3xl text-foreground mb-2">150+</h3>
              <p className="text-muted-foreground font-medium">Items Reported</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-gentle">
                <Heart className="w-8 h-8 text-success-foreground" />
              </div>
              <h3 className="font-bold text-3xl text-foreground mb-2">95+</h3>
              <p className="text-muted-foreground font-medium">Happy Reunions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center shadow-gentle">
                <TrendingUp className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-bold text-3xl text-foreground mb-2">500+</h3>
              <p className="text-muted-foreground font-medium">Active Users</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Recent Reports</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">All</Badge>
            <Badge variant="outline" className="cursor-pointer">Lost</Badge>
            <Badge variant="outline" className="cursor-pointer">Found</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockItems.map((item) => (
            <ItemCardNew key={item.id} item={item} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Items
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
