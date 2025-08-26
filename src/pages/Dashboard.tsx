
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ModernHeader } from '@/components/ModernHeader';
import { ItemCardNew } from '@/components/ItemCardNew';
import { PendingConfirmations } from '@/components/PendingConfirmations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { itemService } from '@/services/itemService';
import { Item } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, ChevronDown, Loader2, AlertCircle, CheckCircle, Package, Menu, Clock } from 'lucide-react';

export const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'all' | 'lost' | 'found' | 'pending'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter, categoryFilter, currentView]);

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

    // Apply view filter first
    if (currentView !== 'all') {
      if (currentView === 'lost') {
        filtered = filtered.filter(item => item.status === 'LOST');
      } else if (currentView === 'found') {
        filtered = filtered.filter(item => 
          item.status === 'FOUND_PENDING' || item.status === 'FOUND_CONFIRMED'
        );
      } else if (currentView === 'pending') {
        filtered = filtered.filter(item => item.status === 'FOUND_PENDING');
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name || item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleViewChange = (view: 'all' | 'lost' | 'found' | 'pending') => {
    setCurrentView(view);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setCurrentView('all');
  };

  const categories = [...new Set(items.map(item => item.category))];
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const hasMoreItems = displayedItems.length < filteredItems.length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700/40 border-t-slate-400 mx-auto mb-6"></div>
            <p className="text-slate-300 text-lg">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Modern Header */}
      <ModernHeader 
        onViewChange={handleViewChange}
        currentView={currentView}
      />
      
      <div className="flex">
        {/* Desktop Sidebar - Fixed/Sticky positioned below navbar */}
        <div className="hidden lg:block fixed left-0 top-14 sm:top-16 z-40 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        {/* Main content with left margin for sidebar */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 lg:ml-64">
          {/* Mobile Header with Hamburger */}
          <div className="lg:hidden flex items-center justify-between mb-4 p-2 border-b border-slate-700/50">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            
            <h1 className="text-lg font-bold text-slate-100">
              Lost & Found
            </h1>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-slate-200 to-blue-200 bg-clip-text text-transparent">
                Lost & Found
              </h1>
              <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
                Browse all items • {filteredItems.length} found
              </p>
            </div>

            {/* Category Tabs */}
            <Tabs value={currentView} onValueChange={(value) => handleViewChange(value as 'all' | 'lost' | 'found' | 'pending')} className="mb-4 sm:mb-6 lg:mb-8">
              <TabsList className="grid w-full grid-cols-4 rounded-xl sm:rounded-2xl p-1 bg-slate-900/60 backdrop-blur-sm border border-slate-700/40 text-xs sm:text-sm">
                <TabsTrigger value="all" className="rounded-lg sm:rounded-xl data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-slate-100 text-slate-400 hover:text-slate-200 transition-all duration-300 px-2 sm:px-4">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">All Items</span>
                  <span className="sm:hidden">All</span>
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 bg-slate-700/60 text-slate-300">
                    {items.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="lost" className="rounded-lg sm:rounded-xl data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-slate-100 text-slate-400 hover:text-slate-200 transition-all duration-300 px-2 sm:px-4">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Lost
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 bg-slate-700/60 text-slate-300">
                    {items.filter(item => item.status === 'LOST').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="found" className="rounded-lg sm:rounded-xl data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-slate-100 text-slate-400 hover:text-slate-200 transition-all duration-300 px-2 sm:px-4">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Found
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 bg-slate-700/60 text-slate-300">
                    {items.filter(item => item.status === 'FOUND_PENDING' || item.status === 'FOUND_CONFIRMED').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg sm:rounded-xl data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-slate-100 text-slate-400 hover:text-slate-200 transition-all duration-300 px-2 sm:px-4">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pend</span>
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 bg-slate-700/60 text-slate-300">
                    {items.filter(item => item.status === 'FOUND_PENDING').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Filter Section */}
              <div className="mb-4 sm:mb-6 lg:mb-8 mt-4 sm:mt-6">
                <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 sm:pl-12 h-10 sm:h-12 rounded-lg sm:rounded-[16px] border-slate-700/40 bg-slate-900/50 backdrop-blur-sm text-sm text-slate-100 placeholder:text-slate-400 focus:border-slate-600"
                    />
                  </div>

                  {/* Filter Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="rounded-lg sm:rounded-[16px] border-slate-700/40 bg-slate-900/50 hover:bg-slate-800/60 h-10 sm:h-12 px-4 sm:px-6 text-sm text-slate-300 hover:text-slate-100"
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Filters</span>
                    <span className="sm:hidden">Filter</span>
                    <ChevronDown 
                      className={`w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform duration-300 ${
                        showFilters ? 'rotate-180' : ''
                      }`} 
                    />
                  </Button>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                  <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl sm:rounded-[20px] p-4 sm:p-6 border border-slate-700/40 fade-in-up">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] rounded-lg sm:rounded-[12px] h-10 text-sm bg-slate-800/50 border-slate-700/40 text-slate-300">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700/40">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="LOST">Lost</SelectItem>
                          <SelectItem value="FOUND_PENDING">Found Pending</SelectItem>
                          <SelectItem value="FOUND_CONFIRMED">Found Confirmed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] rounded-lg sm:rounded-[12px] h-10 text-sm bg-slate-800/50 border-slate-700/40 text-slate-300">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700/40">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button 
                        variant="ghost" 
                        onClick={clearFilters}
                        className="rounded-lg sm:rounded-[12px] text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 text-sm h-10"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                {/* Active Filters Display */}
                {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || currentView !== 'all') && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
                    {currentView !== 'all' && (
                      <Badge variant="secondary" className="rounded-full text-xs px-2 py-1 bg-slate-700/60 text-slate-300 border-slate-600/40">
                        {currentView === 'lost' ? 'Lost' : currentView === 'found' ? 'Found' : 'Pending'}
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="secondary" className="rounded-full text-xs px-2 py-1 bg-slate-700/60 text-slate-300 border-slate-600/40">
                        "{searchTerm}"
                      </Badge>
                    )}
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="rounded-full text-xs px-2 py-1 bg-slate-700/60 text-slate-300 border-slate-600/40">
                        {statusFilter}
                      </Badge>
                    )}
                    {categoryFilter !== 'all' && (
                      <Badge variant="secondary" className="rounded-full text-xs px-2 py-1 bg-slate-700/60 text-slate-300 border-slate-600/40">
                        {categoryFilter}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Items Grid */}
              <TabsContent value="all" className="mt-0">
                {renderItemsGrid()}
              </TabsContent>
              
              <TabsContent value="lost" className="mt-0">
                {renderItemsGrid()}
              </TabsContent>
              
              <TabsContent value="found" className="mt-0">
                {renderItemsGrid()}
              </TabsContent>
              
              <TabsContent value="pending" className="mt-0">
                <div className="mb-6">
                  <PendingConfirmations />
                </div>
                {renderItemsGrid()}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );

  function renderItemsGrid() {
    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-200 mb-3">No items found</h3>
          <p className="text-slate-400 mb-6">
            {currentView === 'all' 
              ? 'Try adjusting your search terms or filters' 
              : `No ${currentView} items match your criteria`
            }
          </p>
          <Button onClick={clearFilters} variant="outline" className="rounded-xl bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100">
            Clear All Filters
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {displayedItems.map((item, index) => (
            <div 
              key={item.id} 
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ItemCardNew 
                item={item} 
                onItemUpdate={fetchItems}
              />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreItems && (
          <div className="text-center">
            <Button
              onClick={loadMoreItems}
              disabled={loadingMore}
              size="lg"
              className="rounded-xl px-6 sm:px-8 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg text-sm bg-slate-800/60 border-slate-700/40 text-slate-300 hover:bg-slate-700/70 hover:text-slate-100"
              variant="outline"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Load More ({filteredItems.length - displayedItems.length} remaining)
                  </span>
                  <span className="sm:hidden">
                    Load More ({filteredItems.length - displayedItems.length})
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </>
    );
  }
};
