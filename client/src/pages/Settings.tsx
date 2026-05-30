import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { HudPanel } from '@/components/HudPanel';
import { Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    businessType: user?.businessType || 'sole_proprietor',
    businessAddress: user?.businessAddress || '',
    businessPhone: user?.businessPhone || '',
    taxNumber: user?.taxNumber || '',
    uifNumber: user?.uifNumber || '',
    businessRegistration: user?.businessRegistration || '',
    preferredLanguage: user?.preferredLanguage || 'en',
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateProfileMutation = trpc.auth.updateProfile.useMutation();
  const cancelSubscriptionMutation = trpc.subscription.cancelSubscription.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <p className="text-text-secondary">Please sign in to access settings.</p>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfileMutation.mutateAsync({
        businessName: formData.businessName,
        businessType: formData.businessType as any,
        businessAddress: formData.businessAddress,
        businessPhone: formData.businessPhone,
        taxNumber: formData.taxNumber,
        uifNumber: formData.uifNumber,
        businessRegistration: formData.businessRegistration,
        preferredLanguage: formData.preferredLanguage as any,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your Pro subscription? You will lose access to unlimited queries and document generation.')) {
      return;
    }

    try {
      await cancelSubscriptionMutation.mutateAsync();
      toast.success('Subscription cancelled. You are now on the Free plan.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-glow-dual mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your account and business profile</p>
        </div>

        {/* Business Profile */}
        <HudPanel title="Business Profile" subtitle="Your business information" className="mb-8">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <NeonInput
                label="Business Name"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Your business name"
              />

              <div>
                <label className="block text-sm font-medium text-neon-cyan mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="input-neon w-full px-4 py-2 rounded-sm"
                >
                  <option value="sole_proprietor">Sole Proprietor</option>
                  <option value="partnership">Partnership</option>
                  <option value="cc">Close Corporation</option>
                  <option value="pty_ltd">Pty Ltd</option>
                  <option value="npo">NPO</option>
                </select>
              </div>
            </div>

            <NeonInput
              label="Business Address"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              placeholder="123 Main Street, Cape Town"
            />

            <NeonInput
              label="Business Phone"
              value={formData.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
              placeholder="021 555 0123"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <NeonInput
                label="SARS Tax Number"
                value={formData.taxNumber}
                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                placeholder="0123456789"
                helperText="Your 10-digit SARS tax number"
              />

              <NeonInput
                label="UIF Number"
                value={formData.uifNumber}
                onChange={(e) => handleInputChange('uifNumber', e.target.value)}
                placeholder="1234567890"
                helperText="Your UIF registration number"
              />
            </div>

            <NeonInput
              label="Business Registration Number"
              value={formData.businessRegistration}
              onChange={(e) => handleInputChange('businessRegistration', e.target.value)}
              placeholder="BRN123456"
              helperText="Your CIPC business registration number"
            />

            <div>
              <label className="block text-sm font-medium text-neon-cyan mb-2">
                Preferred Language
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                className="input-neon w-full px-4 py-2 rounded-sm"
              >
                <option value="en">English</option>
                <option value="zu">isiZulu</option>
                <option value="xh">isiXhosa</option>
                <option value="af">Afrikaans</option>
              </select>
            </div>

            <NeonButton
              type="submit"
              variant="pink"
              loading={isSaving}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </NeonButton>
          </form>
        </HudPanel>

        {/* Subscription Management */}
        <HudPanel title="Subscription Management" subtitle="Manage your plan" className="mb-8">
          <div className="space-y-6">
            <div className="flex items-start justify-between p-4 bg-bg-darker rounded-sm border border-neon-cyan/30">
              <div>
                <p className="font-semibold text-neon-cyan mb-1">Current Plan</p>
                <p className="text-sm text-text-secondary">
                  {user?.role === 'admin' ? 'Pro - Unlimited queries and document generation' : 'Free - 10 queries per month'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-neon-pink">
                  {user?.role === 'admin' ? 'R199/month' : 'R0/month'}
                </p>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="p-4 bg-neon-orange/10 border border-neon-orange rounded-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-neon-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neon-orange mb-2">Active Pro Subscription</p>
                    <p className="text-sm text-text-secondary mb-4">
                      You have an active Pro subscription with unlimited access to all features.
                    </p>
                    <NeonButton
                      variant="cyan"
                      size="sm"
                      onClick={handleCancelSubscription}
                      loading={cancelSubscriptionMutation.isPending}
                    >
                      Cancel Subscription
                    </NeonButton>
                  </div>
                </div>
              </div>
            )}

            {user?.role !== 'admin' && (
              <div className="p-4 bg-neon-cyan/10 border border-neon-cyan rounded-sm">
                <p className="text-sm text-text-secondary mb-4">
                  Upgrade to Pro to unlock unlimited AI queries, document generation, and priority support.
                </p>
                <NeonButton variant="pink" size="sm">
                  Upgrade to Pro - R199/month
                </NeonButton>
              </div>
            )}
          </div>
        </HudPanel>

        {/* Account Information */}
        <HudPanel title="Account Information" subtitle="Your account details">
          <div className="space-y-4">
            <div>
              <p className="text-text-tertiary text-sm mb-1">Email Address</p>
              <p className="text-neon-cyan font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-text-tertiary text-sm mb-1">Account Created</p>
              <p className="text-neon-cyan font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-text-tertiary text-sm mb-1">Last Sign In</p>
              <p className="text-neon-cyan font-semibold">
                {user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}
