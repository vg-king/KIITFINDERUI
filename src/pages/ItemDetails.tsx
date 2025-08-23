
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { itemService } from '@/services/itemService';
import { Item } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, User, Phone, ArrowLeft, Star, CheckCircle, AlertCircle, Award, Package } from 'lucide-react';

export const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    if (item?.status === 'FOUND') {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg shadow-emerald-500/25 text-lg px-4 py-2 font-semibold">
          <CheckCircle className="w-5 h-5 mr-2" />
          Found
        </Badge>
      );
    } else if (item?.status === 'LOST') {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/25 text-lg px-4 py-2 font-semibold">
          <AlertCircle className="w-5 h-5 mr-2" />
          Lost
        </Badge>
      );
    }
    return null;
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
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Item Details</h3>
            <p className="text-gray-400">Please wait while we fetch the information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Item Not Found</h2>
            <p className="text-gray-400 mb-6">The requested item could not be found or may have been removed.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-primary hover:bg-primary/90">
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
      <Sidebar />
      
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-6 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Section */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden bg-black/30 border-gray-700/50 backdrop-blur-sm">
                {item.imageUrl ? (
                  <div className="relative h-96 lg:h-[500px]">
                    <img
                      src={item.imageUrl}
                      alt={item.name || item.title || 'Item image'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge()}
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        {item.name || item.title}
                      </h1>
                      <p className="text-xl text-gray-200 drop-shadow">{item.description}</p>
                    </div>
                  </div>
                ) : (
                  <CardContent className="p-12 text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="mb-4">{getStatusBadge()}</div>
                    <h1 className="text-4xl font-bold text-white mb-4">{item.name || item.title}</h1>
                    <p className="text-xl text-gray-300">{item.description}</p>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Details Sidebar */}
            <div className="space-y-6">
              {/* Category & Status */}
              <Card className="bg-black/30 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Category</p>
                      <p className="text-lg font-semibold text-white">{item.category}</p>
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
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4">Details</h3>
                  
                  {/* Location */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-lg font-semibold text-white truncate">{item.location}</p>
                    </div>
                  </div>

                  {/* Date Reported - only show if valid */}
                  {formatDate(item.dateReported) && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Date Reported</p>
                        <p className="text-lg font-semibold text-white">{formatDate(item.dateReported)}</p>
                      </div>
                    </div>
                  )}

                  {/* Reporter - only show if available */}
                  {(item.postedByName || item.userName) && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Reported By</p>
                        <p className="text-lg font-semibold text-white truncate">{item.postedByName || item.userName}</p>
                      </div>
                    </div>
                  )}

                  {/* Reward - only show if available */}
                  {item.reward && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Reward</p>
                        <p className="text-lg font-semibold text-white">₹{item.reward}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <Phone className="w-6 h-6 text-primary" />
                    Contact Information
                  </h3>
                  
                  <div className="bg-black/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Contact</p>
                        <p className="text-lg font-semibold text-white">{item.contactInfo}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Please reach out to the contact person if you have information about this item or if you are the owner.
                  </p>
                  
                  <Button 
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.open(`tel:${item.contactInfo}`, '_blank')}
                  >
                    <Phone className="w-5 h-5 mr-2" />
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
