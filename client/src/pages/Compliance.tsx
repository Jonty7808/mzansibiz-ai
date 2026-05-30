import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { NeonButton } from '@/components/NeonButton';
import { NeonCard } from '@/components/NeonCard';
import { HudPanel } from '@/components/HudPanel';
import { AlertCircle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ComplianceDeadline {
  id: number;
  title: string;
  dueDate: Date;
  category: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function Compliance() {
  const { user, isAuthenticated } = useAuth();
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const deadlinesQuery = trpc.compliance.getDeadlines.useQuery();
  const reportQuery = trpc.compliance.getComplianceReport.useQuery();
  const markCompleteMutation = trpc.compliance.markDeadlineComplete.useMutation();

  useEffect(() => {
    // In a real app, this would populate from the query
    // For now, we'll show sample compliance deadlines
    const sampleDeadlines: ComplianceDeadline[] = [
      {
        id: 1,
        title: 'SARS Monthly Tax Return',
        dueDate: new Date('2026-06-30'),
        category: 'SARS',
        completed: false,
        priority: 'high',
      },
      {
        id: 2,
        title: 'UIF Contribution Payment',
        dueDate: new Date('2026-06-15'),
        category: 'UIF',
        completed: false,
        priority: 'high',
      },
      {
        id: 3,
        title: 'CCMA Registration Renewal',
        dueDate: new Date('2026-07-31'),
        category: 'CCMA',
        completed: false,
        priority: 'medium',
      },
      {
        id: 4,
        title: 'Annual Financial Statements',
        dueDate: new Date('2026-08-31'),
        category: 'Financial',
        completed: false,
        priority: 'medium',
      },
    ];

    setDeadlines(sampleDeadlines);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <p className="text-text-secondary">Please sign in to view compliance deadlines.</p>
      </div>
    );
  }

  const handleMarkComplete = async (id: number) => {
    try {
      await markCompleteMutation.mutateAsync({ deadlineId: id });
      setDeadlines(prev =>
        prev.map(d => d.id === id ? { ...d, completed: !d.completed } : d)
      );
      toast.success('Deadline updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update deadline');
    }
  };

  const filteredDeadlines = deadlines.filter(d => {
    if (filter === 'pending') return !d.completed;
    if (filter === 'completed') return d.completed;
    return true;
  });

  const pendingCount = deadlines.filter(d => !d.completed).length;
  const completedCount = deadlines.filter(d => d.completed).length;
  const complianceScore = deadlines.length > 0
    ? Math.round((completedCount / deadlines.length) * 100)
    : 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-neon-red';
      case 'medium':
        return 'text-neon-orange';
      case 'low':
        return 'text-neon-green';
      default:
        return 'text-neon-cyan';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-glow-dual mb-2">Compliance Tracker</h1>
          <p className="text-text-secondary">Stay on top of all your regulatory deadlines</p>
        </div>

        {/* Compliance Score */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <HudPanel title="Compliance Score" subtitle="Overall compliance status">
            <div className="text-center">
              <div className="text-5xl font-bold text-neon-pink mb-2">{complianceScore}%</div>
              <div className="w-full bg-bg-darker rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-neon-cyan to-neon-pink h-full rounded-full transition-all"
                  style={{ width: `${complianceScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-text-secondary">
                {completedCount} of {deadlines.length} deadlines completed
              </p>
            </div>
          </HudPanel>

          <HudPanel title="Pending Deadlines" subtitle="Upcoming tasks">
            <div className="text-center">
              <div className="text-5xl font-bold text-neon-cyan mb-2">{pendingCount}</div>
              <p className="text-sm text-text-secondary">
                {pendingCount > 0 ? 'Action required' : 'All caught up!'}
              </p>
            </div>
          </HudPanel>

          <HudPanel title="Completed" subtitle="Finished tasks">
            <div className="text-center">
              <div className="text-5xl font-bold text-neon-green mb-2">{completedCount}</div>
              <p className="text-sm text-text-secondary">
                {Math.round((completedCount / Math.max(deadlines.length, 1)) * 100)}% complete
              </p>
            </div>
          </HudPanel>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-4">
          {(['all', 'pending', 'completed'] as const).map(tab => (
            <NeonButton
              key={tab}
              variant={filter === tab ? 'pink' : 'cyan'}
              size="sm"
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </NeonButton>
          ))}
        </div>

        {/* Deadlines List */}
        <div className="space-y-4">
          {filteredDeadlines.length === 0 ? (
            <NeonCard variant="cyan" className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">
                {filter === 'completed'
                  ? 'No completed deadlines yet'
                  : 'No pending deadlines'}
              </p>
            </NeonCard>
          ) : (
            filteredDeadlines.map(deadline => (
              <NeonCard key={deadline.id} variant="cyan" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isOverdue(deadline.dueDate) && !deadline.completed && (
                        <AlertCircle className="w-5 h-5 text-neon-red" />
                      )}
                      {deadline.completed && (
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      )}
                      <h3 className={`font-bold ${deadline.completed ? 'line-through text-text-tertiary' : 'text-neon-cyan'}`}>
                        {deadline.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(deadline.priority)} border border-current`}>
                        {deadline.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {deadline.dueDate.toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-bg-darker rounded text-xs">
                        {deadline.category}
                      </span>
                      {isOverdue(deadline.dueDate) && !deadline.completed && (
                        <span className="text-neon-red font-semibold">OVERDUE</span>
                      )}
                    </div>
                  </div>

                  <NeonButton
                    variant={deadline.completed ? 'pink' : 'cyan'}
                    size="sm"
                    onClick={() => handleMarkComplete(deadline.id)}
                    className="flex items-center gap-2"
                  >
                    {deadline.completed ? 'Undo' : 'Mark Complete'}
                  </NeonButton>
                </div>
              </NeonCard>
            ))
          )}
        </div>

        {/* Compliance Report */}
        <HudPanel title="Compliance Recommendations" className="mt-12">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neon-cyan">Regular SARS Submissions</p>
                <p className="text-sm text-text-secondary">Ensure monthly tax returns are submitted by the 30th of each month</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neon-cyan">UIF Contributions</p>
                <p className="text-sm text-text-secondary">Pay UIF contributions by the 15th of each month to avoid penalties</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neon-cyan">Annual Filings</p>
                <p className="text-sm text-text-secondary">Complete annual financial statements and CCMA registrations on time</p>
              </div>
            </div>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}
