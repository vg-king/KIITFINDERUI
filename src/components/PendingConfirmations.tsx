import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, User, MapPin, MessageSquare, Award, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { foundService, PendingConfirmation } from '@/services/foundService';
import { itemService } from '@/services/itemService';
import { StatusBadge } from './StatusBadge';

// Extend pending confirmation with optional fetched item data (since backend no longer nests item)
type PendingConfirmationWithItem = PendingConfirmation & {
  itemData?: {
    name: string;
    category?: string;
    location?: string;
    imageUrl?: string;
    reward?: number;
  }
  createdAtFormatted?: string;
};

export const PendingConfirmations = () => {
  const [pendingItems, setPendingItems] = useState<PendingConfirmationWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<Set<number>>(new Set());

  const fetchPendingConfirmations = async () => {
    try {
      setLoading(true);
      const data = await foundService.getPendingConfirmations();

      // Fetch related item details in parallel (some may fail if item deleted after confirmation flow)
      const enriched: PendingConfirmationWithItem[] = await Promise.all(
        data.map(async (conf) => {
          let itemData: PendingConfirmationWithItem['itemData'] | undefined;
            try {
              const item = await itemService.getItemById(conf.itemId);
              itemData = {
                name: item.name || item.title || conf.itemTitle,
                category: item.category,
                location: item.location,
                imageUrl: (item as any).imageUrl || item.imageUrl, // support different keys
                reward: item.reward,
              };
            } catch (e) {
              // Item might have been removed (e.g., already fully confirmed and deleted)
              itemData = {
                name: conf.itemTitle,
              };
            }
            return {
              ...conf,
              itemData,
              createdAtFormatted: conf.createdAt ? new Date(conf.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : undefined,
            };
        })
      );

      setPendingItems(enriched);
    } catch (error: any) {
      console.error('Error fetching pending confirmations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch pending confirmations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (foundId: number, itemName: string) => {
    setConfirmingIds(prev => new Set(prev).add(foundId));
    
    try {
      await foundService.confirmFound(foundId);
      
      toast({
        title: "Confirmed! 🎉",
        description: `You've confirmed that "${itemName}" was found. Thank you!`,
        variant: "default",
      });

      // Remove the confirmed item from the list
      setPendingItems(prev => prev.filter(item => item.id !== foundId));
    } catch (error: any) {
      console.error('Error confirming found item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm found item",
        variant: "destructive",
      });
    } finally {
      setConfirmingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(foundId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchPendingConfirmations();
  }, []);

  if (loading) {
    return (
      <Card className="w-full bg-slate-900/60 border-slate-700/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Confirmations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-slate-400" />
            <span className="text-slate-400">Loading pending confirmations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingItems.length === 0) {
    return (
      <Card className="w-full bg-slate-900/60 border-slate-700/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Confirmations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPendingConfirmations}
            disabled={loading}
            className="bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No Pending Confirmations</h3>
            <p className="text-slate-400">
              When someone reports finding your lost items, they'll appear here for confirmation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-slate-900/60 border-slate-700/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Confirmations
          <Badge variant="secondary" className="ml-2 bg-slate-700/60 text-slate-300">
            {pendingItems.length}
          </Badge>
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPendingConfirmations}
          disabled={loading}
          className="bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingItems.map((confirmation) => {
          const item = confirmation.itemData; // optional enriched item
          return (
            <Card key={confirmation.id} className="border-l-4 border-l-yellow-500 bg-slate-800/50 border-slate-700/40">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    {item?.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-200">{item?.name || confirmation.itemTitle}</h3>
                        {(item?.category || item?.location) && (
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item?.category || 'Unknown'}{item?.location ? ` • ${item.location}` : ''}
                          </p>
                        )}
                      </div>
                      <StatusBadge status="FOUND_PENDING" size="sm" />
                    </div>

                    {/* Finder Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-slate-300">{confirmation.finderName}</span>
                        <span>reported finding this item</span>
                        {confirmation.createdAtFormatted && (
                          <span className="text-slate-500">{confirmation.createdAtFormatted}</span>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                        <div className="bg-slate-700/50 rounded-lg p-3 flex-1">
                          <p className="text-sm text-slate-300">{confirmation.finderMessage}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reward Info */}
                    {item?.reward && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-slate-300">Reward: ₹{item.reward}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConfirm(confirmation.id, item?.name || confirmation.itemTitle)}
                        disabled={confirmingIds.has(confirmation.id)}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      >
                        {confirmingIds.has(confirmation.id) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Found
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};
