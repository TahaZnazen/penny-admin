'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { GameSession } from '@/lib/types';

interface SessionsResponse {
  sessions: GameSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'spinning', label: 'Spinning' },
  { value: 'won_penny', label: 'Won Penny' },
  { value: 'won_jackpot', label: 'Won Jackpot' },
  { value: 'lost', label: 'Lost' },
  { value: 'expired', label: 'Expired' },
  { value: 'claimed', label: 'Claimed' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'won_jackpot':
      return 'bg-amber-500 text-white';
    case 'won_penny':
      return 'bg-green-500 text-white';
    case 'lost':
      return 'bg-red-500/20 text-red-600';
    case 'expired':
      return 'bg-muted text-muted-foreground';
    case 'pending':
      return 'bg-blue-500/20 text-blue-600';
    case 'spinning':
      return 'bg-purple-500/20 text-purple-600';
    case 'claimed':
      return 'bg-green-500/20 text-green-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
      });

      const response = await fetch(`/api/sessions?${params}`);
      const data: SessionsResponse = await response.json();

      if (response.ok) {
        setSessions(data.sessions);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSessions();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Game Sessions</h1>
        <p className="text-muted-foreground">
          View and manage all game sessions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by game code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {total.toLocaleString()} sessions found
      </div>

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game Code</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Used At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No sessions found
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                        {session.game_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {session.users?.telegram_username || 'Unknown'}
                      </span>
                      {session.users?.x_username && (
                        <span className="block text-xs text-muted-foreground">
                          @{session.users.x_username}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(session.created_at), 'PP')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(session.created_at), 'p')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.expires_at ? (
                        <span className={
                          new Date(session.expires_at) < new Date()
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        }>
                          {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {session.used_at ? (
                        <div className="text-sm">
                          {format(new Date(session.used_at), 'PP p')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
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
    </div>
  );
}
