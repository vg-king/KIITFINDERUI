
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ItemCardNew } from '@/components/ItemCardNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { itemService } from '@/services/itemService';
import { userService } from '@/services/userService';
import { Item } from '@/types/item';
import { User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, Trash2, Settings, Eye, AlertCircle, Menu, X } from 'lucide-react';

export const AdminPanel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUserItems, setLoadingUserItems] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'user' | 'item', id: number} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemService.getAllItemsAdmin();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch items",
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserItems = async (userId: number) => {
    setLoadingUserItems(true);
    try {
      const data = await userService.getUserItems(userId);
      setUserItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user items",
        variant: "destructive",
      });
      setUserItems([]);
    } finally {
      setLoadingUserItems(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await itemService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
      // Also update userItems if it contains this item
      setUserItems(userItems.filter(item => item.id !== id));
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

  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      // Close user items dialog if this user was selected
      if (selectedUser?.id === id) {
        setSelectedUser(null);
        setUserItems([]);
      }
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleViewUserItems = async (user: User) => {
    setSelectedUser(user);
    await fetchUserItems(user.id);
  };

  const confirmDelete = (type: 'user' | 'item', id: number) => {
    setDeleteConfirm({ type, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'user') {
      await handleDeleteUser(deleteConfirm.id);
    } else {
      await handleDeleteItem(deleteConfirm.id);
    }
    
    setDeleteConfirm(null);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Panel
          </h1>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Header */}
            <div className="mb-8 hidden lg:block">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Settings className="w-10 h-10" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage users and items across the platform
              </p>
            </div>

            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-3xl p-1 bg-gradient-card mb-6 lg:mb-8">
                <TabsTrigger value="items" className="rounded-2xl text-sm">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Items ({items.length})</span>
                  <span className="sm:hidden">Items</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-2xl text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Users ({users.length})</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
              </TabsList>

            <TabsContent value="items">
              {loadingItems ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading items...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {items.map((item) => (
                    <ItemCardNew 
                      key={item.id} 
                      item={item} 
                      onDelete={() => confirmDelete('item', item.id)}
                      showDeleteButton={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users">
              {loadingUsers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {users.map((user) => (
                    <Card key={user.id} className="card-soft">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="truncate">{user.name}</span>
                            <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-xs">
                              {user.role}
                            </Badge>
                          </span>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewUserItems(user)}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Eye className="w-4 h-4 mr-1 sm:mr-0" />
                                  <span className="sm:hidden">View Items</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
                                <DialogHeader>
                                  <DialogTitle>Items by {user.name}</DialogTitle>
                                  <DialogDescription>
                                    View all items posted by this user
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-6">
                                  {loadingUserItems ? (
                                    <div className="text-center py-8">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                      <p className="text-muted-foreground">Loading user items...</p>
                                    </div>
                                  ) : userItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {userItems.map((item) => (
                                        <ItemCardNew 
                                          key={item.id} 
                                          item={item} 
                                          onDelete={() => confirmDelete('item', item.id)}
                                          showDeleteButton={true}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                      <p className="text-muted-foreground">No items found for this user</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDelete('user', user.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
                              <span className="sm:hidden">Delete</span>
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground truncate">
                            <strong>Email:</strong> {user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>ID:</strong> {user.id}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent className="mx-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
                  {deleteConfirm?.type === 'user' && (
                    <span className="block mt-2 text-destructive font-medium">
                      Warning: Deleting a user will also remove all their items.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="sm:order-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={executeDelete} className="sm:order-2">
                  Delete {deleteConfirm?.type}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};
