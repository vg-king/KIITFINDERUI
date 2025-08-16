
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MapPin, User, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
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
        <Badge className="bg-success/20 text-success border border-success/30 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3" />
          Found
        </Badge>
      );
    } else if (item.status === 'LOST') {
      return (
        <Badge className="bg-destructive/20 text-destructive border border-destructive/30 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
          <XCircle className="w-3 h-3" />
          Lost
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/20 text-warning border border-warning/30 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "h-full flex flex-col overflow-hidden transition-all duration-300",
      "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
      "border border-border/30 rounded-3xl shadow-gentle",
      "hover:shadow-soft hover:-translate-y-1 hover:border-border/50",
      "fade-in-up"
    )}>
      {/* Image Section */}
      <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-primary/60" />
          </div>
        </div>
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 z-20">
          {getStatusBadge()}
        </div>
      </div>
      
      <CardContent className="p-6 flex-1">
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs rounded-full">
              {item.category}
            </Badge>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0 text-primary/70" />
            <span className="truncate">
              {new Date(item.dateReported).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 text-primary/70" />
            <span className="truncate">{item.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 flex-shrink-0 text-primary/70" />
            <span className="truncate">{item.userName || 'Unknown User'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link to={`/item/${item.id}`} className="flex-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full rounded-2xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
        </Link>
        
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
