import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MapPin, User, Trash2, Eye, CheckCircle, AlertCircle, Clock, Star, Award, Package } from "lucide-react";
import { Item } from '@/types/item';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

interface ItemCardNewProps {
  item: Item;
  onDelete?: (id: number) => void;
  showDeleteButton?: boolean;
}

export const ItemCardNew = ({ item, onDelete, showDeleteButton = false }: ItemCardNewProps) => {
  const currentUser = authService.getCurrentUserFromStorage();
  const canDelete = showDeleteButton && (currentUser?.role === 'ADMIN' || item.userId === currentUser?.id);

  const getStatusBadge = () => {
    if (item.status === 'FOUND') {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 font-medium px-2 py-1 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Found
        </Badge>
      );
    } else if (item.status === 'LOST') {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 font-medium px-2 py-1 text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Lost
        </Badge>
      );
    }
    // Return null if no valid status - don't show anything
    return null;
  };

  const getCardGradient = () => {
    if (item.status === 'FOUND') {
      return "from-emerald-950/80 via-green-900/60 to-teal-950/80 border-emerald-500/30";
    } else if (item.status === 'LOST') {
      return "from-orange-950/80 via-red-900/60 to-pink-950/80 border-orange-500/30";
    }
    // Default neutral gradient for items without status
    return "from-slate-950/80 via-gray-900/60 to-zinc-950/80 border-slate-500/30";
  };

  const getHoverGradient = () => {
    if (item.status === 'FOUND') {
      return "hover:from-emerald-900/90 hover:via-green-800/70 hover:to-teal-900/90";
    } else if (item.status === 'LOST') {
      return "hover:from-orange-900/90 hover:via-red-800/70 hover:to-pink-900/90";
    }
    return "hover:from-slate-900/90 hover:via-gray-800/70 hover:to-zinc-900/90";
  };

  return (
    <Card className={cn(
      "h-full flex flex-col overflow-hidden group transition-all duration-700 ease-out",
      "hover:shadow-2xl hover:shadow-primary/10 sm:hover:-translate-y-2 sm:hover:scale-[1.02]",
      "bg-gradient-to-br backdrop-blur-sm border-2 rounded-2xl sm:rounded-3xl",
      getCardGradient(),
      getHoverGradient(),
      "animate-in fade-in-0 slide-in-from-bottom-6 duration-1000",
      "relative overflow-hidden"
    )}>
      {/* User Header */}
      <div className="p-3 sm:p-6 pb-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* User Avatar */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg border-2 border-white/20 ring-1 ring-primary/30 shrink-0 aspect-square">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white truncate">
              {item.postedByName || item.userName || 'Anonymous User'}
            </p>
            <p className="text-xs text-gray-300 truncate">
              reported • {item.location}
            </p>
          </div>
          {/* Status Badge - Only show if status exists */}
          {getStatusBadge() && (
            <div className="shrink-0">
              {getStatusBadge()}
            </div>
          )}
        </div>
      </div>

      {/* Image Section */}
      {item.imageUrl ? (
        <div className="relative mx-3 sm:mx-6 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl overflow-hidden h-36 sm:h-48">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
          <img
            src={item.imageUrl}
            alt={item.name || item.title || 'Item image'}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
          {/* Floating elements on image - only on larger screens */}
          <div className="hidden sm:block absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-3 sm:mx-6 mb-3 sm:mb-4 h-36 sm:h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-700/30">
          <div className="text-center">
            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No Image</p>
          </div>
        </div>
      )}
      
      {/* Content */}
      <CardContent className="px-3 sm:px-6 pb-2 sm:pb-4 flex-1">
        {/* Title and Description */}
        <div className="mb-3 sm:mb-6">
          <h3 className="font-bold text-base sm:text-lg text-white line-clamp-2 mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
            {item.name || item.title}
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Quick Info Grid - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Category */}
          {item.category && (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-black/20 border border-gray-700/30">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md aspect-square">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Category</p>
                <p className="text-xs font-medium text-white truncate">{item.category}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-black/20 border border-gray-700/30">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md aspect-square">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-xs font-medium text-white truncate">{item.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reward - Prominent Display */}
        {item.reward && (
          <div className="mb-3 sm:mb-4">
            <div className="relative overflow-hidden p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-500/30 group-hover:from-yellow-500/30 group-hover:via-orange-500/30 group-hover:to-red-500/30 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0 ring-2 ring-yellow-400/30 aspect-square">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-yellow-200 uppercase tracking-wider">Reward</p>
                  <p className="text-base sm:text-lg font-bold text-white">₹{item.reward}</p>
                </div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
              {/* Decorative shine effect - only on larger screens */}
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Footer */}
      <CardFooter className="p-3 sm:p-6 pt-0 flex gap-2 sm:gap-3">
        <Link to={`/item/${item.id}`} className="flex-1">
          <Button 
            variant="outline" 
            className="w-full rounded-xl sm:rounded-2xl border-2 border-primary/30 hover:border-primary bg-black/30 hover:bg-primary hover:text-white transition-all duration-300 group/btn backdrop-blur-sm shadow-lg hover:shadow-xl font-semibold text-white text-xs sm:text-sm h-8 sm:h-auto py-2 sm:py-3"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </Button>
        </Link>
        
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="text-destructive hover:text-white hover:bg-destructive rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg backdrop-blur-sm border-2 border-destructive/20 hover:border-destructive bg-black/30 px-2 sm:px-4 h-8 sm:h-auto py-2 sm:py-3"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )}
      </CardFooter>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </Card>
  );
};
