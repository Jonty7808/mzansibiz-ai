import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import { NeonButton } from './NeonButton';
import { LogOut } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-neon-cyan/30 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <div className="text-2xl font-bold text-glow-pink">◆</div>
              <span className="text-xl font-bold text-glow-pink">MzansiBiz AI</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <span className="text-text-secondary hover:text-neon-cyan transition cursor-pointer text-sm">
                    Dashboard
                  </span>
                </Link>
                <Link href="/chat">
                  <span className="text-text-secondary hover:text-neon-cyan transition cursor-pointer text-sm">
                    Chat
                  </span>
                </Link>
                <Link href="/documents">
                  <span className="text-text-secondary hover:text-neon-cyan transition cursor-pointer text-sm">
                    Documents
                  </span>
                </Link>
                <Link href="/compliance">
                  <span className="text-text-secondary hover:text-neon-cyan transition cursor-pointer text-sm">
                    Compliance
                  </span>
                </Link>
                <Link href="/settings">
                  <span className="text-text-secondary hover:text-neon-cyan transition cursor-pointer text-sm">
                    Settings
                  </span>
                </Link>
                <NeonButton
                  variant="cyan"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </NeonButton>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <NeonButton variant="pink" size="sm">
                    Sign In
                  </NeonButton>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/30 py-8 bg-bg-deeper">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-lg font-bold text-glow-pink mb-4">MzansiBiz AI</div>
              <p className="text-text-secondary text-sm">Your local AI business partner.</p>
            </div>
            <div>
              <h4 className="font-bold text-neon-cyan mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-neon-cyan transition">Features</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition">Pricing</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neon-cyan mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-neon-cyan transition">About</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition">Blog</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neon-cyan mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-neon-cyan transition">Privacy</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition">Terms</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neon-cyan/30 pt-8 text-center text-text-secondary text-sm">
            <p>&copy; 2026 MzansiBiz AI. All rights reserved. Built for South Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
