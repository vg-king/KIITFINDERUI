
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { FoundButton } from '@/components/FoundButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { itemService } from '@/services/itemService';
import { authService } from '@/services/authService';
import { Item } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, User, Phone, ArrowLeft, Star, CheckCircle, AlertCircle, Award, Package } from 'lucide-react';

export const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = authService.getCurrentUserFromStorage();

  // Check if current user can see "I Found This" button
  const title = (item?.name || item?.title || '').toLowerCase();
  let effectiveStatus = item?.status;
  
  // If the title suggests it's found but status says lost, correct it
  if (title.includes('found') && item?.status === 'LOST') {
    effectiveStatus = 'FOUND_CONFIRMED';
  }
  
  const canReportFound = effectiveStatus === 'LOST' && 
                        currentUser && 
                        item?.postedById !== currentUser.id;

  useEffect(() => {
    if (id) {
      fetchItem(parseInt(id));
    }
  }, [id]);

  const fetchItem = async (itemId: number) => {
    try {
      const data = await itemService.getItemById(itemId);
      setItem(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch item details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    // Handle inconsistent data - if title contains "found" but status is wrong
    const title = (item?.name || item?.title || '').toLowerCase();
    let displayStatus = item?.status;
    
    // If the title suggests it's found but status says lost, prioritize found
    if (title.includes('found') && item?.status === 'LOST') {
      displayStatus = 'FOUND_CONFIRMED';
    }
    
    if (!displayStatus) return null;
    return <StatusBadge status={displayStatus} size="lg" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null; // Invalid date
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Loading Item Details</h3>
            <p className="text-sm sm:text-base text-gray-400">Please wait while we fetch the information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-400" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">Item Not Found</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-4">The requested item could not be found or may have been removed.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-primary hover:bg-primary/90 text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
      {/* Hide sidebar on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="self-start text-gray-300 hover:text-white hover:bg-white/10 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {/* Action Buttons */}
            {canReportFound && (
              <FoundButton
                itemId={item.id}
                itemName={item.name || item.title || 'Unknown Item'}
                onFound={() => {
                  // Refresh item details after reporting found
                  if (id) {
                    fetchItem(parseInt(id));
                  }
                }}
                className="self-start sm:self-center"
              />
            )}
          </div>

          {/* Main Content - Stack on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Image Section */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="overflow-hidden bg-black/30 border-gray-700/50 backdrop-blur-sm">
                {item.imageUrl ? (
                  <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[500px]">
                    <img
                      src={item.imageUrl}
                      alt={item.name || item.title || 'Item image'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      {getStatusBadge()}
                    </div>
                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg line-clamp-2">
                        {item.name || item.title}
                      </h1>
                      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200 drop-shadow line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ) : (
                  <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Package className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400" />
                    </div>
                    <div className="mb-3 sm:mb-4">{getStatusBadge()}</div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">{item.name || item.title}</h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-300">{item.description}</p>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Details Sidebar - Show first on mobile */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Category & Status */}
              <Card className="bg-black/30 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Category</p>
                      <p className="text-base sm:text-lg font-semibold text-white truncate">{item.category}</p>
                    </div>
                  </div>
                  {!item.imageUrl && getStatusBadge() && (
                    <div className="pt-4 border-t border-gray-700/50">
                      {getStatusBadge()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Details */}
              <Card className="bg-black/30 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Details</h3>
                  
                  {/* Location */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-white truncate">{item.location}</p>
                    </div>
                  </div>

                  {/* Date Reported - prefer formatted date from backend */}
                  {(item.createdAtFormatted || formatDate(item.dateReported)) && (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Posted</p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-white">
                          {item.createdAtFormatted || formatDate(item.dateReported)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reporter - only show if available */}
                  {(item.postedByName || item.userName) && (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Reported By</p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-white truncate">{item.postedByName || item.userName}</p>
                      </div>
                    </div>
                  )}

                  {/* Reward - only show if available */}
                  {item.reward && (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Reward</p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-white">₹{item.reward}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    Contact Information
                  </h3>
                  
                  <div className="bg-black/20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Contact</p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-white break-all">{item.contactInfo}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 sm:mb-4">
                    Please reach out to the contact person if you have information about this item or if you are the owner.
                  </p>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                    onClick={() => window.open(`tel:${item.contactInfo}`, '_blank')}
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Contact Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
