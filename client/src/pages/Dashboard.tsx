import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { NeonButton } from '@/components/NeonButton';
import { NeonCard } from '@/components/NeonCard';
import { HudPanel } from '@/components/HudPanel';
import { Zap, FileText, AlertCircle, TrendingUp, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: subscriptionTier, isLoading: tierLoading } = trpc.subscription.getCurrentTier.useQuery();
  const { data: usageStats, isLoading: statsLoading } = trpc.subscription.getUsageStats.useQuery();
  const upgradeMutation = trpc.subscription.upgradeToPro.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <p className="text-text-secondary">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  const handleUpgrade = async () => {
    try {
      const result = await upgradeMutation.mutateAsync();
      // TODO: Redirect to PayFast checkout
      toast.info('Upgrade feature coming soon');
    } catch (error) {
      toast.error('Failed to initiate upgrade');
    }
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-glow-dual mb-2">Welcome back, {user?.name || 'Business Owner'}</h1>
        <p className="text-text-secondary">Manage your business compliance and AI consultations</p>
      </div>

      {/* Subscription Status */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Current Tier */}
        <HudPanel title="Current Plan" subtitle="Your subscription status">
          {tierLoading ? (
            <div className="animate-pulse h-20 bg-bg-darker rounded"></div>
          ) : (
            <div>
              <div className="text-3xl font-bold text-neon-pink mb-2">
                {subscriptionTier?.tier === 'pro' ? 'PRO' : 'FREE'}
              </div>
              <p className="text-text-secondary mb-4">
                {subscriptionTier?.tier === 'pro'
                  ? 'Unlimited AI queries and document generation'
                  : 'Limited to 10 queries per month'}
              </p>
              {subscriptionTier?.tier === 'free' && (
                <NeonButton
                  variant="pink"
                  size="sm"
                  onClick={handleUpgrade}
                  loading={upgradeMutation.isPending}
                >
                  Upgrade to Pro - R199/month
                </NeonButton>
              )}
              {subscriptionTier?.tier === 'pro' && (
                <div className="text-neon-green text-sm">✓ Active Pro Subscription</div>
              )}
            </div>
          )}
        </HudPanel>

        {/* Usage Stats */}
        <HudPanel title="Monthly Usage" subtitle="AI query quota">
          {statsLoading ? (
            <div className="animate-pulse h-20 bg-bg-darker rounded"></div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">{usageStats?.used}/{usageStats?.quota} queries</span>
                  <span className="text-neon-cyan font-bold">{usageStats?.percentageUsed}%</span>
                </div>
                <div className="w-full bg-bg-darker rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-neon-cyan to-neon-pink h-full transition-all duration-300"
                    style={{ width: `${usageStats?.percentageUsed}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-text-secondary">
                {usageStats?.remaining} queries remaining this month
              </p>
            </div>
          )}
        </HudPanel>

        {/* Next Billing */}
        <HudPanel title="Billing" subtitle="Subscription details">
          {tierLoading ? (
            <div className="animate-pulse h-20 bg-bg-darker rounded"></div>
          ) : (
            <div>
              <div className="text-sm text-text-secondary mb-4">
                {subscriptionTier?.nextBillingDate
                  ? `Next billing: ${new Date(subscriptionTier.nextBillingDate).toLocaleDateString()}`
                  : 'No active billing'}
              </div>
              <Link href="/settings">
                <NeonButton variant="cyan" size="sm">
                  Manage Subscription
                </NeonButton>
              </Link>
            </div>
          )}
        </HudPanel>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-glow-cyan mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/chat">
            <NeonCard variant="cyan" className="p-6 cursor-pointer hover:scale-105 transition">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-6 h-6 text-neon-cyan" />
                <h3 className="font-bold text-neon-cyan">AI Chat</h3>
              </div>
              <p className="text-sm text-text-secondary">Ask tax and labour questions</p>
            </NeonCard>
          </Link>

          <Link href="/documents">
            <NeonCard variant="cyan" className="p-6 cursor-pointer hover:scale-105 transition">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-neon-cyan" />
                <h3 className="font-bold text-neon-cyan">Documents</h3>
              </div>
              <p className="text-sm text-text-secondary">Generate professional docs</p>
            </NeonCard>
          </Link>

          <Link href="/compliance">
            <NeonCard variant="cyan" className="p-6 cursor-pointer hover:scale-105 transition">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-neon-cyan" />
                <h3 className="font-bold text-neon-cyan">Compliance</h3>
              </div>
              <p className="text-sm text-text-secondary">Track deadlines</p>
            </NeonCard>
          </Link>

          <Link href="/settings">
            <NeonCard variant="cyan" className="p-6 cursor-pointer hover:scale-105 transition">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="w-6 h-6 text-neon-cyan" />
                <h3 className="font-bold text-neon-cyan">Settings</h3>
              </div>
              <p className="text-sm text-text-secondary">Manage your profile</p>
            </NeonCard>
          </Link>
        </div>
      </div>

      {/* Business Profile Summary */}
      <HudPanel title="Business Profile" subtitle="Your registered business information">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-text-tertiary text-sm mb-1">Business Name</p>
            <p className="text-neon-cyan font-semibold">{user?.businessName || 'Not set'}</p>
          </div>
          <div>
            <p className="text-text-tertiary text-sm mb-1">Business Type</p>
            <p className="text-neon-cyan font-semibold">{user?.businessType || 'Not set'}</p>
          </div>
          <div>
            <p className="text-text-tertiary text-sm mb-1">Tax Number (SARS)</p>
            <p className="text-neon-cyan font-semibold">{user?.taxNumber || 'Not set'}</p>
          </div>
          <div>
            <p className="text-text-tertiary text-sm mb-1">UIF Number</p>
            <p className="text-neon-cyan font-semibold">{user?.uifNumber || 'Not set'}</p>
          </div>
        </div>
        <Link href="/settings">
          <NeonButton variant="cyan" size="sm" className="mt-6">
            Update Profile
          </NeonButton>
        </Link>
      </HudPanel>
    </div>
  );
}
