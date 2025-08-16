
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ItemCardNew } from '@/components/ItemCardNew';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { itemService } from '@/services/itemService';
import { Item } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, ChevronDown, Loader2, Plus, TrendingUp, Package, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    paginateItems();
  }, [filteredItems, currentPage]);

  const fetchItems = async () => {
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedItems(filteredItems.slice(0, endIndex));
  };

  const loadMoreItems = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 500);
  };

  const handleViewChange = (view: 'all' | 'lost' | 'found') => {
    setCurrentView(view);
  };

    setSearchTerm('');
    setStatusFilter('all');
  const categories = [...new Set(items.map(item => item.category))];
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const hasMoreItems = displayedItems.length < filteredItems.length;
  
  // Calculate stats
  const lostItems = items.filter(item => item.status === 'LOST').length;
  const foundItems = items.filter(item => item.status === 'FOUND').length;
  const totalUsers = new Set(items.map(item => item.userId)).size;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-2">
                    Lost & Found
                    <span className="bg-gradient-primary bg-clip-text text-transparent ml-2">
                      Dashboard
                    </span>
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Browse all reported items • {filteredItems.length} items found
                  </p>
                </div>
                
                <Link to="/add-item">
                  <Button size="lg" className="rounded-2xl px-8 py-3 shadow-gentle">
                    <Plus className="w-5 h-5 mr-2" />
                    Report Item
                  </Button>
                </Link>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">{lostItems}</p>
                      <p className="text-sm text-muted-foreground">Lost Items</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{foundItems}</p>
                      <p className="text-sm text-muted-foreground">Found Items</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{totalUsers}</p>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Action Tabs */}
            <div className="mb-8">
              <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl w-fit">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="rounded-xl px-6"
                >
                  All Items
                </Button>
                <Button
                  variant={statusFilter === 'LOST' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('LOST')}
                  className="rounded-xl px-6"
                >
                  Lost
                </Button>
                <Button
                  variant={statusFilter === 'FOUND' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('FOUND')}
                  className="rounded-xl px-6"
                >
                  Found
                </Button>
              </div>
            </div>
                Lost & Found Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Browse all reported lost and found items • {filteredItems.length} items found
              </p>
            </div>

            {/* Enhanced Filter Section */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-border/30 bg-card/50 backdrop-blur-sm focus:bg-card/80 transition-all duration-300"
                  />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-2xl border-border/30 h-14 px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  <ChevronDown 
                    className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                      showFilters ? 'rotate-180' : ''
                    }`} 
                  />
                </Button>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl fade-in-up">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Filter Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-end">
                        <Button 
                          variant="ghost" 
                          onClick={clearFilters}
                          className="rounded-xl text-muted-foreground hover:text-foreground"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Filters Display */}
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="rounded-full">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="rounded-full">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary" className="rounded-full">
                      Category: {categoryFilter}
                    </Badge>
                  )}
                </div>
              )}
            </div>


            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-border/30 rounded-3xl">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">No items found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your search terms or filters, or be the first to report an item!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={clearFilters} variant="outline" className="rounded-2xl">
                      Clear All Filters
                    </Button>
                    <Link to="/add-item">
                      <Button className="rounded-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Report First Item
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Results Summary */}
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Showing {displayedItems.length} of {filteredItems.length} items
                  </p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      {Math.round((foundItems / items.length) * 100)}% success rate
                    </span>
                  </div>
                </div>
                
                {/* Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedItems.map((item) => (
                    <ItemCardNew key={item.id} item={item} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreItems && (
                  <div className="text-center pt-8">
                    <Button
                      onClick={loadMoreItems}
                      disabled={loadingMore}
                      size="lg"
                      className="rounded-2xl px-8 py-3"
                      variant="outline"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load More (${filteredItems.length - displayedItems.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
