'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RefreshCw, Save, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { GlobalState } from '@/lib/types';

export default function PrizePoolPage() {
  const [globalState, setGlobalState] = useState<GlobalState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [jackpotsRemaining, setJackpotsRemaining] = useState('');
  const [pennyWinsRemaining, setPennyWinsRemaining] = useState('');

  useEffect(() => {
    fetchGlobalState();
  }, []);

  const fetchGlobalState = async () => {
    try {
      const response = await fetch('/api/prize-pool');
      const data = await response.json();

      if (response.ok) {
        setGlobalState(data);
        setJackpotsRemaining(data.jackpots_remaining.toString());
        setPennyWinsRemaining(data.penny_wins_remaining.toString());
      }
    } catch (error) {
      console.error('Error fetching global state:', error);
      toast.error('Failed to fetch prize pool state');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/prize-pool', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jackpots_remaining: parseInt(jackpotsRemaining),
          penny_wins_remaining: parseInt(pennyWinsRemaining),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGlobalState(data);
        toast.success('Prize pool updated successfully');
      } else {
        toast.error('Failed to update prize pool');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to update prize pool');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/prize-pool/reset', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setGlobalState(data.state);
        setJackpotsRemaining(data.state.jackpots_remaining.toString());
        setPennyWinsRemaining(data.state.penny_wins_remaining.toString());
        toast.success('Game cycle reset successfully');
      } else {
        toast.error('Failed to reset game cycle');
      }
    } catch (error) {
      console.error('Error resetting:', error);
      toast.error('Failed to reset game cycle');
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prize Pool Management</h1>
          <p className="text-muted-foreground">
            Manage the game cycle and prize pool settings
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prize Pool Management</h1>
        <p className="text-muted-foreground">
          Manage the game cycle and prize pool settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Cycle Status</CardTitle>
            <CardDescription>
              Overview of the current game cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Jackpots Remaining</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-amber-500">
                    {globalState?.jackpots_remaining}
                  </span>
                  <span className="text-muted-foreground mb-1">/ 2</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-amber-500 transition-all"
                    style={{ width: `${((globalState?.jackpots_remaining ?? 0) / 2) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Penny Wins Remaining</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-green-500">
                    {globalState?.penny_wins_remaining}
                  </span>
                  <span className="text-muted-foreground mb-1">/ 3</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${((globalState?.penny_wins_remaining ?? 0) / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cycle Started</span>
                <span className="text-sm font-medium">
                  {globalState?.cycle_start_at
                    ? format(new Date(globalState.cycle_start_at), 'PPP p')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cycle Duration</span>
                <span className="text-sm font-medium">
                  {globalState?.cycle_start_at
                    ? formatDistanceToNow(new Date(globalState.cycle_start_at))
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Spins This Cycle</span>
                <span className="text-sm font-medium">
                  {globalState?.total_spins_this_cycle?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Reset</span>
                <span className="text-sm font-medium">
                  {globalState?.last_reset_at
                    ? formatDistanceToNow(new Date(globalState.last_reset_at), { addSuffix: true })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">
                  {globalState?.updated_at
                    ? formatDistanceToNow(new Date(globalState.updated_at), { addSuffix: true })
                    : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Controls</CardTitle>
            <CardDescription>
              Manually adjust prize pool values or reset the cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jackpots">Jackpots Remaining</Label>
                <Input
                  id="jackpots"
                  type="number"
                  min="0"
                  max="10"
                  value={jackpotsRemaining}
                  onChange={(e) => setJackpotsRemaining(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penny">Penny Wins Remaining</Label>
                <Input
                  id="penny"
                  type="number"
                  min="0"
                  max="10"
                  value={pennyWinsRemaining}
                  onChange={(e) => setPennyWinsRemaining(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setResetDialogOpen(true)}
                disabled={isResetting}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Game Cycle
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will reset jackpots to 2 and penny wins to 3, and start a new cycle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset Game Cycle?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Reset jackpots remaining to 2</li>
                <li>Reset penny wins remaining to 3</li>
                <li>Reset total spins this cycle to 0</li>
                <li>Start a new cycle timestamp</li>
              </ul>
              <p className="mt-3 font-medium">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? 'Resetting...' : 'Yes, Reset Cycle'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
