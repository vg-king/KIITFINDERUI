import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { foundService } from "@/services/foundService";
import { authService } from "@/services/authService";

interface FoundButtonProps {
  itemId: number;
  itemName: string;
  onFound?: () => void;
  className?: string;
}

export const FoundButton = ({ itemId, itemName, onFound, className }: FoundButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide details about where you found the item.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    const currentUser = authService.getCurrentUserFromStorage();
    const token = authService.getToken();
    
    if (!currentUser || !token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report found items.",
        variant: "destructive",
      });
      return;
    }

    // Validate itemId
    if (!itemId || itemId <= 0) {
      toast({
        title: "Invalid Item",
        description: "Unable to identify the item. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting found report for item:', itemId);
      
      await foundService.markItemFound({
        itemId,
        message: message.trim()
      });

      toast({
        title: "Thank You! 🎉",
        description: "Your report has been sent to the owner. They'll be notified to confirm the find.",
        variant: "default",
      });

      setIsOpen(false);
      setMessage("");
      onFound?.();
    } catch (error: any) {
      console.error('Found report error:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to report found item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className={`bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold ${className}`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          I Found This
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Report Found Item
          </DialogTitle>
          <DialogDescription>
            Great! You found "<strong>{itemName}</strong>". Please provide details about where you found it so the owner can verify and collect it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Where did you find it? *</Label>
            <Textarea
              id="message"
              placeholder="e.g., Found near the library entrance, on the second floor near the computer lab, etc."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about the location and any relevant details. This helps the owner verify it's their item.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Report Found
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
