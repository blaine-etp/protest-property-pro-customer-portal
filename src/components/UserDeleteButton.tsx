import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Trash2, Loader2, Search } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';

export function UserDeleteButton() {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const { users, loading, deleting, deleteUsers } = useUserManagement();

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.user_id));

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(user => user.user_id));
    }
  };

  const handleDelete = async () => {
    if (selectedUserIds.length === 0 || confirmText !== 'DELETE') return;
    
    await deleteUsers(selectedUserIds);
    setIsDialogOpen(false);
    setSelectedUserIds([]);
    setConfirmText('');
    setSearchTerm('');
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
          Delete Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User Accounts
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete selected users and ALL associated data including properties, documents, payments, and referrals. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm">
              Select All ({filteredUsers.length} users)
            </label>
          </div>

          {/* User List */}
          <div className="border rounded-md max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No users found</div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                    <Checkbox
                      id={user.user_id}
                      checked={selectedUserIds.includes(user.user_id)}
                      onCheckedChange={() => handleUserToggle(user.user_id)}
                    />
                    <label htmlFor={user.user_id} className="flex-1 text-sm cursor-pointer">
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive mb-2">
                Selected Users ({selectedUsers.length}):
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedUsers.map((user) => (
                  <div key={user.user_id} className="text-xs">
                    {user.first_name} {user.last_name} ({user.email}) - 
                    Joined: {new Date(user.created_at).toLocaleDateString()} - 
                    Credits: ${user.referral_credit_balance}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-destructive">
                Type "DELETE" to confirm permanent deletion:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="border-destructive focus:ring-destructive"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsDialogOpen(false);
              setSelectedUserIds([]);
              setConfirmText('');
              setSearchTerm('');
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={selectedUserIds.length === 0 || confirmText !== 'DELETE' || deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedUserIds.length} User{selectedUserIds.length > 1 ? 's' : ''} Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}