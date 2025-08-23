import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  LogOut, 
  Plus,
} from 'lucide-react';
import FancyToggle from './FancyToggle';

interface ModernHeaderProps {
  onViewChange?: (view: 'all' | 'lost' | 'found') => void;
  currentView?: 'all' | 'lost' | 'found';
}

export const ModernHeader = ({ onViewChange, currentView = 'all' }: ModernHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getCurrentUserFromStorage();
  const userRole = authService.getUserRole();

  const handleLogout = async () => {
    try {
      authService.logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/auth');
    }
  };

  const getViewButtonClass = (view: string) => {
    return currentView === view 
      ? "bg-primary text-primary-foreground rounded-full px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300"
      : "bg-muted/50 text-muted-foreground hover:bg-muted rounded-full px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 hover:text-foreground";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
        
        {/* Primary Action Button */}
        <div className="flex-1 flex justify-start sm:justify-center">
          <Link to="/report-lost">
            <Button className="btn-primary-modern px-3 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Report Lost Item</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </Link>
        </div>

        {/* View Toggle Buttons - Hidden on very small screens */}
        <div className="hidden xs:flex items-center space-x-1 sm:space-x-2 bg-muted/30 p-1 rounded-full">
          <button
            onClick={() => onViewChange?.('all')}
            className={getViewButtonClass('all')}
          >
            <span className="hidden sm:inline">All Items</span>
            <span className="sm:hidden">All</span>
          </button>
          <button
            onClick={() => onViewChange?.('lost')}
            className={getViewButtonClass('lost')}
          >
            Lost
          </button>
          <button
            onClick={() => onViewChange?.('found')}
            className={getViewButtonClass('found')}
          >
            Found
          </button>
        </div>

        {/* User Profile & Actions */}
        <div className="flex-1 flex justify-end items-center space-x-2 sm:space-x-4">
          
          {/* Dark Mode Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <FancyToggle />
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full p-0 hover:bg-transparent">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 rounded-[16px] p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <Badge 
                    variant={userRole === 'ADMIN' ? 'destructive' : 'secondary'}
                    className="w-fit mt-1"
                  >
                    {userRole}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {/* Dark Mode Toggle for mobile */}
              <div className="sm:hidden">
                <DropdownMenuItem>
                  <FancyToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};