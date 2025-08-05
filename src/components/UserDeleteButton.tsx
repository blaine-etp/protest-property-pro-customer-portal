import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';

export function UserDeleteButton() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { users, loading, deleting, deleteUser } = useUserManagement();

  const selectedUser = users.find(user => user.user_id === selectedUserId);

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    await deleteUser(selectedUser.user_id, `${selectedUser.first_name} ${selectedUser.last_name}`);
    setIsDialogOpen(false);
    setSelectedUserId('');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete the user and ALL associated data including properties, documents, payments, and referrals. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select User to Delete</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading users..." : "Choose a user"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive">Selected User Details:</p>
              <p className="text-sm">Name: {selectedUser.first_name} {selectedUser.last_name}</p>
              <p className="text-sm">Email: {selectedUser.email}</p>
              <p className="text-sm">Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</p>
              <p className="text-sm">Credit Balance: ${selectedUser.referral_credit_balance}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={deleting !== null}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!selectedUser || deleting !== null}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting === selectedUserId ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}