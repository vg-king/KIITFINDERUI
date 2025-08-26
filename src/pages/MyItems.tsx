
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ItemCardNew } from '@/components/ItemCardNew';
import { Button } from '@/components/ui/button';
import { itemService } from '@/services/itemService';
import { Item } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';

export const MyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const tabs = [
    { id: 'all', label: 'All Items' },
    { id: 'LOST', label: 'Lost Items' },
    { id: 'FOUND', label: 'Found Items' }
  ];

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'LOST') return item.status === 'LOST';
    if (activeTab === 'FOUND') return item.status === 'FOUND_PENDING' || item.status === 'FOUND_CONFIRMED';
    return true;
  });

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const data = await itemService.getMyItems();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await itemService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="flex">
        {/* Desktop Sidebar - Fixed/Sticky positioned below navbar */}
        <div className="hidden lg:block fixed left-0 top-14 sm:top-16 z-40 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar />
        </div>
        
        {/* Main content with left margin for sidebar */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                My Items
              </h1>
              
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {tab.label} ({items.filter(item => {
                      if (tab.id === 'all') return true;
                      if (tab.id === 'LOST') return item.status === 'LOST';
                      if (tab.id === 'FOUND') return item.status === 'FOUND_PENDING' || item.status === 'FOUND_CONFIRMED';
                      return false;
                    }).length})
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <ItemCardNew key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-2">
                    No {activeTab === 'all' ? '' : activeTab} items found
                  </div>
                  <p className="text-slate-500">
                    {activeTab === 'all' 
                      ? "You haven't reported any items yet." 
                      : `You haven't reported any ${activeTab} items yet.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
