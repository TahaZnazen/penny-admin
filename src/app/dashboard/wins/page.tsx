'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Download, Check, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { WinHistory } from '@/lib/types';

interface WinsResponse {
  wins: WinHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function WinsPage() {
  const [wins, setWins] = useState<WinHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [winType, setWinType] = useState('all');
  const [claimed, setClaimed] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedWin, setSelectedWin] = useState<WinHistory | null>(null);
  const [txHash, setTxHash] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const fetchWins = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(winType && winType !== 'all' && { winType }),
        ...(claimed && claimed !== 'all' && { claimed }),
      });

      const response = await fetch(`/api/wins?${params}`);
      const data: WinsResponse = await response.json();

      if (response.ok) {
        setWins(data.wins);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching wins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, winType, claimed]);

  useEffect(() => {
    fetchWins();
  }, [fetchWins]);

  const handleExport = async () => {
    const params = new URLSearchParams({
      ...(search && { search }),
      ...(winType && winType !== 'all' && { winType }),
      ...(claimed && claimed !== 'all' && { claimed }),
    });

    window.open(`/api/wins/export?${params}`, '_blank');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWins();
  };

  const openClaimDialog = (win: WinHistory) => {
    setSelectedWin(win);
    setTxHash('');
    setRewardAmount('');
    setClaimDialogOpen(true);
  };

  const handleClaim = async () => {
    if (!selectedWin) return;

    setIsClaimLoading(true);
    try {
      const response = await fetch(`/api/wins/${selectedWin.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash || null,
          amount: rewardAmount ? parseFloat(rewardAmount) : null,
        }),
      });

      if (response.ok) {
        toast.success('Win marked as claimed');
        setClaimDialogOpen(false);
        fetchWins();
      } else {
        toast.error('Failed to claim win');
      }
    } catch (error) {
      console.error('Error claiming win:', error);
      toast.error('Failed to claim win');
    } finally {
      setIsClaimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Win History</h1>
          <p className="text-muted-foreground">
            View and manage all wins and rewards
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by username, wallet, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Select value={winType} onValueChange={(value) => { setWinType(value); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Win Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="penny">Penny</SelectItem>
            <SelectItem value="jackpot">Jackpot</SelectItem>
          </SelectContent>
        </Select>
        <Select value={claimed} onValueChange={(value) => { setClaimed(value); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Claim Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Claimed</SelectItem>
            <SelectItem value="false">Unclaimed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {total.toLocaleString()} wins found
      </div>

      {/* Wins Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Won At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : wins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No wins found
                  </TableCell>
                </TableRow>
              ) : (
                wins.map((win) => (
                  <TableRow key={win.id}>
                    <TableCell>
                      <Badge
                        className={
                          win.win_type === 'jackpot'
                            ? 'bg-amber-500 text-white'
                            : 'bg-green-500 text-white'
                        }
                      >
                        {win.win_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {win.telegram_username || win.users?.telegram_username || 'Unknown'}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        ID: {win.telegram_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      {win.wallet_address || win.users?.wallet_address ? (
                        <code className="text-xs">
                          {(win.wallet_address || win.users?.wallet_address || '').slice(0, 4)}...
                          {(win.wallet_address || win.users?.wallet_address || '').slice(-4)}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(win.won_at), 'PP')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(win.won_at), 'p')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={win.claimed ? 'default' : 'secondary'}>
                        {win.claimed ? 'Claimed' : 'Unclaimed'}
                      </Badge>
                      {win.claimed_at && (
                        <span className="block text-xs text-muted-foreground">
                          {format(new Date(win.claimed_at), 'PP')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {win.reward_amount ? (
                        <span className="font-medium">{win.reward_amount}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                      {win.reward_tx_hash && (
                        <a
                          href={`https://solscan.io/tx/${win.reward_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-500 hover:underline truncate max-w-[100px]"
                        >
                          {win.reward_tx_hash.slice(0, 8)}...
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!win.claimed && (
                        <Button
                          size="sm"
                          onClick={() => openClaimDialog(win)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Claim
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Win as Claimed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="txHash">Transaction Hash (optional)</Label>
              <Input
                id="txHash"
                placeholder="Enter Solana transaction hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Reward Amount (optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="Enter reward amount"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClaim} disabled={isClaimLoading}>
              {isClaimLoading ? 'Claiming...' : 'Mark as Claimed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
