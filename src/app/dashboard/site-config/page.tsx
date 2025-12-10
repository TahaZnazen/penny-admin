'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Globe,
  Twitter,
  MessageCircle,
  BarChart3,
  ShoppingCart,
  Sparkles,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { SiteConfig } from '@/lib/types';

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pennyWinMode, setPennyWinMode] = useState<'amount' | 'custom'>('amount');
  const [jackpotMode, setJackpotMode] = useState<'amount' | 'custom'>('amount');

  useEffect(() => {
    fetchConfig();
  }, []);

  // Set initial modes based on existing data
  useEffect(() => {
    if (config) {
      if (config.penny_win_custom_text) {
        setPennyWinMode('custom');
      }
      if (config.jackpot_custom_text) {
        setJackpotMode('custom');
      }
    }
  }, [config?.id]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/site-config');
      const data = await response.json();

      if (response.ok) {
        setConfig(data);
      } else {
        toast.error('Failed to load site configuration');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load site configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SiteConfig, value: string | number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        toast.success('Site configuration saved successfully!');
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Site Configuration</h1>
          <p className="text-muted-foreground">Manage website settings and links</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Site Configuration</h1>
          <p className="text-muted-foreground">Manage website settings and links</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load configuration. Make sure the site_config table exists in your database.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Configuration</h1>
          <p className="text-muted-foreground">
            Manage website settings and links
            {config.updated_at && (
              <span className="ml-2 text-xs">
                (Last updated {formatDistanceToNow(new Date(config.updated_at), { addSuffix: true })})
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Social Links
            </CardTitle>
            <CardDescription>Links to your social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram_url" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Telegram URL
              </Label>
              <Input
                id="telegram_url"
                type="url"
                placeholder="https://t.me/YourChannel"
                value={config.telegram_url || ''}
                onChange={(e) => handleChange('telegram_url', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter / X URL
              </Label>
              <Input
                id="twitter_url"
                type="url"
                placeholder="https://x.com/YourHandle"
                value={config.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dexscreener_url" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dexscreener URL
              </Label>
              <Input
                id="dexscreener_url"
                type="url"
                placeholder="https://dexscreener.com/solana/..."
                value={config.dexscreener_url || ''}
                onChange={(e) => handleChange('dexscreener_url', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Other Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Other Links
            </CardTitle>
            <CardDescription>Website and app URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy_url" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Buy URL
              </Label>
              <Input
                id="buy_url"
                type="url"
                placeholder="https://raydium.io/swap/..."
                value={config.buy_url || ''}
                onChange={(e) => handleChange('buy_url', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="penny_magic_url" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Penny Magic URL
              </Label>
              <Input
                id="penny_magic_url"
                type="url"
                placeholder="https://penny-magic.app"
                value={config.penny_magic_url || ''}
                onChange={(e) => handleChange('penny_magic_url', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whitepaper_url" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Whitepaper URL
              </Label>
              <Input
                id="whitepaper_url"
                type="url"
                placeholder="https://docs.yoursite.com"
                value={config.whitepaper_url || ''}
                onChange={(e) => handleChange('whitepaper_url', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website URL
              </Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://yoursite.com"
                value={config.website_url || ''}
                onChange={(e) => handleChange('website_url', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contract Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Address
            </CardTitle>
            <CardDescription>Token contract address on Solana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract_address">Contract Address</Label>
              <div className="flex gap-2">
                <Input
                  id="contract_address"
                  placeholder="Enter contract address or 'Coming soon'"
                  value={config.contract_address || ''}
                  onChange={(e) => handleChange('contract_address', e.target.value)}
                  className="font-mono text-sm"
                />
                {config.contract_address && config.contract_address !== 'Coming soon' && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(config.contract_address || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <a
                      href={`https://solscan.io/token/${config.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prize Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Prize Configuration
            </CardTitle>
            <CardDescription>
              Configure prize amounts for wins. Custom text overrides amount+unit if set.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Penny Win Prize */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <Label className="text-base font-semibold">Penny Win Prize (5 Pennies)</Label>
                </div>
                <div className="flex rounded-lg border p-1">
                  <Button
                    type="button"
                    variant={pennyWinMode === 'amount' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setPennyWinMode('amount');
                      handleChange('penny_win_custom_text', '');
                    }}
                  >
                    Amount
                  </Button>
                  <Button
                    type="button"
                    variant={pennyWinMode === 'custom' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setPennyWinMode('custom');
                    }}
                  >
                    Custom Text
                  </Button>
                </div>
              </div>

              {pennyWinMode === 'amount' ? (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Amount & Unit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0.00"
                      value={config.penny_win_amount || ''}
                      onChange={(e) => handleChange('penny_win_amount', parseFloat(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <Select
                      value={config.penny_win_unit || 'SOL'}
                      onValueChange={(value) => handleChange('penny_win_unit', value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOL">SOL</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="PENNY">PENNY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Custom Text</Label>
                  <Input
                    placeholder="e.g., 5% creator fees"
                    value={config.penny_win_custom_text || ''}
                    onChange={(e) => handleChange('penny_win_custom_text', e.target.value)}
                  />
                </div>
              )}

              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Preview: </span>
                <span className="font-medium">
                  &quot;You win {config.penny_win_custom_text || `${config.penny_win_amount || 0} ${config.penny_win_unit || 'SOL'}`}!&quot;
                </span>
              </div>
            </div>

            <Separator />

            {/* Jackpot Prize */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <Label className="text-base font-semibold">Jackpot Prize (5 Pigs)</Label>
                </div>
                <div className="flex rounded-lg border p-1">
                  <Button
                    type="button"
                    variant={jackpotMode === 'amount' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setJackpotMode('amount');
                      handleChange('jackpot_custom_text', '');
                    }}
                  >
                    Amount
                  </Button>
                  <Button
                    type="button"
                    variant={jackpotMode === 'custom' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setJackpotMode('custom');
                    }}
                  >
                    Custom Text
                  </Button>
                </div>
              </div>

              {jackpotMode === 'amount' ? (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Amount & Unit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0.00"
                      value={config.jackpot_amount || ''}
                      onChange={(e) => handleChange('jackpot_amount', parseFloat(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <Select
                      value={config.jackpot_unit || 'SOL'}
                      onValueChange={(value) => handleChange('jackpot_unit', value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOL">SOL</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="PENNY">PENNY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Custom Text</Label>
                  <Input
                    placeholder="e.g., 10% creator fees"
                    value={config.jackpot_custom_text || ''}
                    onChange={(e) => handleChange('jackpot_custom_text', e.target.value)}
                  />
                </div>
              )}

              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Preview: </span>
                <span className="font-medium">
                  &quot;You win {config.jackpot_custom_text || `${config.jackpot_amount || 0} ${config.jackpot_unit || 'SOL'}`}!&quot;
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
