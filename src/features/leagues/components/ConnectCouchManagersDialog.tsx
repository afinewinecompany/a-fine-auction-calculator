/**
 * ConnectCouchManagersDialog Component
 *
 * Dialog for connecting a league to a Couch Managers draft room.
 * Allows users to enter a room ID which is validated via Edge Function
 * before being saved to the league record.
 *
 * Story: 9.2 - Implement Connection to Couch Managers Draft Room
 */

import { useState } from 'react';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeagueStore } from '../stores/leagueStore';

/**
 * Props for ConnectCouchManagersDialog component
 */
export interface ConnectCouchManagersDialogProps {
  /** ID of the league to connect */
  leagueId: string;
  /** Current room ID if already connected */
  currentRoomId?: string | null;
}

/**
 * ConnectCouchManagersDialog Component
 *
 * Renders a dialog for connecting a league to Couch Managers:
 * - Room ID input field
 * - Connect and Cancel buttons
 * - Loading state during connection test
 * - Success/error toast notifications
 *
 * @example
 * ```tsx
 * <ConnectCouchManagersDialog
 *   leagueId="abc123"
 *   currentRoomId={league.couchManagersRoomId}
 * />
 * ```
 */
export function ConnectCouchManagersDialog({
  leagueId,
  currentRoomId,
}: ConnectCouchManagersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState(currentRoomId ?? '');
  const { connectToCouchManagers, isConnecting } = useLeagueStore();

  /**
   * Handle connect button click
   * Validates room ID and attempts connection
   */
  const handleConnect = async () => {
    const trimmedRoomId = roomId.trim();

    if (!trimmedRoomId) {
      toast.error('Please enter a room ID');
      return;
    }

    const success = await connectToCouchManagers(leagueId, trimmedRoomId);

    if (success) {
      toast.success(`Connected to room ${trimmedRoomId}`);
      setIsOpen(false);
    } else {
      toast.error('Invalid room ID or connection failed');
    }
  };

  /**
   * Handle dialog open state change
   * Resets room ID input when dialog opens
   */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Reset to current room ID when opening
      setRoomId(currentRoomId ?? '');
    }
    setIsOpen(open);
  };

  /**
   * Handle key down event for Enter key
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isConnecting && roomId.trim()) {
      handleConnect();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={currentRoomId ? 'outline' : 'default'}>
          <LinkIcon className="h-4 w-4 mr-2" />
          {currentRoomId ? 'Change Room ID' : 'Connect to Couch Managers'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Connect to Couch Managers</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter your Couch Managers draft room ID to enable automatic sync.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomId" className="text-white">
              Room ID
            </Label>
            <Input
              id="roomId"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., abc123xyz"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              disabled={isConnecting}
              autoComplete="off"
            />
          </div>
          {currentRoomId && (
            <p className="text-sm text-slate-400">
              Currently connected to: <span className="text-emerald-400">{currentRoomId}</span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isConnecting}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !roomId.trim()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectCouchManagersDialog;
