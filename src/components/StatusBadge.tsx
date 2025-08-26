import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'LOST' | 'FOUND_PENDING' | 'FOUND_CONFIRMED';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge = ({ status, size = 'md', className }: StatusBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'LOST':
        return {
          label: 'LOST',
          icon: AlertCircle,
          className: "bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50",
          pulseColor: "bg-orange-400"
        };
      case 'FOUND_PENDING':
        return {
          label: 'FOUND PENDING',
          icon: Clock,
          className: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 animate-pulse",
          pulseColor: "bg-yellow-400"
        };
      case 'FOUND_CONFIRMED':
        return {
          label: 'FOUND CONFIRMED',
          icon: CheckCheck,
          className: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50",
          pulseColor: "bg-emerald-400"
        };
      default:
        return {
          label: 'UNKNOWN',
          icon: AlertCircle,
          className: "bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0",
          pulseColor: "bg-gray-400"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="relative">
      <Badge 
        className={cn(
          "font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105",
          sizeClasses[size],
          config.className,
          className
        )}
      >
        <Icon className={cn(iconSizes[size], "mr-1.5")} />
        {config.label}
      </Badge>
      
      {/* Animated pulse dot for pending status */}
      {status === 'FOUND_PENDING' && (
        <div className="absolute -top-1 -right-1">
          <div className={cn("w-2 h-2 rounded-full animate-ping", config.pulseColor)}></div>
          <div className={cn("absolute top-0 w-2 h-2 rounded-full", config.pulseColor)}></div>
        </div>
      )}
    </div>
  );
};
