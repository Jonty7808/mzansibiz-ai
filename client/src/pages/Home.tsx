import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ArrowRight, Brain, FileText, AlertCircle, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-neon-cyan/30 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-glow-pink">◆</div>
            <span className="text-xl font-bold text-glow-pink">MzansiBiz AI</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button className="btn-neon-cyan">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button className="btn-neon-pink">Sign In</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-neon-pink rounded-full mix-blend-screen blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-cyan rounded-full mix-blend-screen blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-glow-dual">
              Your AI-Powered Business Compliance Partner
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              Navigate South African tax laws, labour regulations, and compliance requirements with confidence. Powered by advanced AI, available in your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getLoginUrl()}>
                <Button className="btn-neon-pink px-8 py-6 text-lg flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <Button className="btn-neon-cyan px-8 py-6 text-lg">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-neon-cyan/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16 text-glow-cyan">
            Powerful Features for South African Businesses
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: AI Chatbot */}
            <Card className="card-neon p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-neon-pink" />
                <h3 className="text-xl font-bold text-glow-pink">Multilingual AI Consultant</h3>
              </div>
              <p className="text-text-secondary mb-4 flex-grow">
                Ask questions in English, isiZulu, isiXhosa, or Afrikaans. Get expert guidance on SARS tax requirements and CCMA labour laws.
              </p>
              <div className="text-sm text-neon-cyan">Available 24/7</div>
            </Card>

            {/* Feature 2: Document Generation */}
            <Card className="card-neon p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-neon-cyan" />
                <h3 className="text-xl font-bold text-glow-cyan">Document Generation</h3>
              </div>
              <p className="text-text-secondary mb-4 flex-grow">
                Generate professional invoices, employment contracts, business plans, and health & safety files tailored to SA regulations.
              </p>
              <div className="text-sm text-neon-pink">Save hours of work</div>
            </Card>

            {/* Feature 3: Compliance Tracking */}
            <Card className="card-neon p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-neon-green" />
                <h3 className="text-xl font-bold text-glow-cyan">Compliance Tracker</h3>
              </div>
              <p className="text-text-secondary mb-4 flex-grow">
                Never miss a deadline. Automatic reminders for SARS tax submissions, UIF payments, and regulatory compliance dates.
              </p>
              <div className="text-sm text-neon-green">Stay compliant</div>
            </Card>

            {/* Feature 4: Email Notifications */}
            <Card className="card-neon p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-neon-orange" />
                <h3 className="text-xl font-bold text-glow-cyan">Smart Notifications</h3>
              </div>
              <p className="text-text-secondary mb-4 flex-grow">
                Receive timely email reminders for upcoming deadlines, subscription renewals, and important regulatory dates.
              </p>
              <div className="text-sm text-neon-orange">Never forget again</div>
            </Card>

            {/* Feature 5: Subscription Management */}
            <Card className="card-neon p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-neon-pink" />
                <h3 className="text-xl font-bold text-glow-pink">Flexible Plans</h3>
              </div>
              <p className="text-text-secondary mb-4 flex-grow">
                Start free with limited queries. Upgrade to Pro for unlimited AI consultations and document generation.
              </p>
              <div className="text-sm text-neon-cyan">R199/month</div>
            </Card>

            {/* Feature 6: Dashboard */}
            <Card className="card-neon p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-neon-green" />
                <h3 className="text-xl font-bold text-glow-cyan">User Dashboard</h3>
              </div>
              <p className="text-text-secondary mb-4 flex-grow">
                Track your usage, manage saved documents, view compliance status, and control your subscription all in one place.
              </p>
              <div className="text-sm text-neon-green">Full transparency</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 border-t border-neon-cyan/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16 text-glow-cyan">
            Simple, Transparent Pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="card-neon p-8">
              <h3 className="text-2xl font-bold text-glow-cyan mb-2">Free</h3>
              <p className="text-text-secondary mb-6">Perfect for getting started</p>
              <div className="text-4xl font-bold text-neon-pink mb-6">R0<span className="text-lg text-text-secondary">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>10 AI queries per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Basic document templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Compliance deadline viewing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-text-tertiary">✗</span>
                  <span className="text-text-tertiary">Email reminders</span>
                </li>
              </ul>
              <Button className="btn-neon-cyan w-full">Get Started</Button>
            </Card>

            {/* Pro Tier */}
            <Card className="card-neon p-8 border-neon-pink relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-neon-pink text-bg-deep-black px-4 py-1 rounded-full text-sm font-bold">RECOMMENDED</span>
              </div>
              <h3 className="text-2xl font-bold text-glow-pink mb-2">Pro</h3>
              <p className="text-text-secondary mb-6">For serious business owners</p>
              <div className="text-4xl font-bold text-neon-pink mb-6">R199<span className="text-lg text-text-secondary">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Unlimited AI queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Full document generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Automated email reminders</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Monthly compliance report</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-green">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="btn-neon-pink w-full">Upgrade to Pro</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-neon-cyan/30 bg-bg-dark-gray/50">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6 text-glow-dual">
            Ready to Take Control of Your Business?
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of South African business owners who are using MzansiBiz AI to stay compliant, save time, and grow their businesses.
          </p>
          <a href={getLoginUrl()}>
            <Button className="btn-neon-pink px-8 py-6 text-lg flex items-center gap-2 mx-auto">
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>

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
                <li><a href="#" className="hover:text-neon-cyan">Features</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Pricing</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neon-cyan mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-neon-cyan">About</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Blog</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neon-cyan mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-neon-cyan">Privacy</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Terms</a></li>
                <li><a href="#" className="hover:text-neon-cyan">Compliance</a></li>
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
