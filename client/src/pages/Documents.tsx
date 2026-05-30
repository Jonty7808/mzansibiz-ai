import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { NeonButton } from '@/components/NeonButton';
import { NeonCard } from '@/components/NeonCard';
import { NeonInput } from '@/components/NeonInput';
import { HudPanel } from '@/components/HudPanel';
import { FileText, Download, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

type DocumentType = 'invoice' | 'employment_contract' | 'business_plan' | 'health_safety';

const DOCUMENT_TYPES: Record<DocumentType, string> = {
  invoice: 'Invoice',
  employment_contract: 'Employment Contract',
  business_plan: 'Business Plan',
  health_safety: 'Health & Safety File',
};

interface Document {
  id: string;
  title: string;
  documentType: DocumentType;
  storageUrl: string;
  createdAt: Date;
}

export default function Documents() {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('invoice');
  const [documentTitle, setDocumentTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateMutation = trpc.documents.generateDocument.useMutation();
  const listQuery = trpc.documents.listDocuments.useQuery();
  const deleteMutation = trpc.documents.deleteDocument.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <p className="text-text-secondary">Please sign in to generate documents.</p>
      </div>
    );
  }

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateMutation.mutateAsync({
        documentType: selectedType,
        title: documentTitle,
      });

      const newDocument: Document = {
        id: result.id,
        title: result.title,
        documentType: result.documentType,
        storageUrl: result.storageUrl,
        createdAt: new Date(result.createdAt),
      };

      setDocuments(prev => [newDocument, ...prev]);
      setDocumentTitle('');
      setShowForm(false);
      toast.success('Document generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Delete this document?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ documentId: parseInt(id) });
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-glow-dual mb-2">Document Generator</h1>
            <p className="text-text-secondary">Create professional business documents tailored to SA regulations</p>
          </div>
          <NeonButton
            variant="pink"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Document
          </NeonButton>
        </div>

        {/* Generation Form */}
        {showForm && (
          <HudPanel title="Generate New Document" className="mb-8">
            <form onSubmit={handleGenerateDocument} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neon-cyan mb-2">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  className="input-neon w-full px-4 py-2 rounded-sm"
                >
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <NeonInput
                label="Document Title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., Invoice #001"
                helperText="Give your document a descriptive name"
              />

              <div className="flex gap-4">
                <NeonButton
                  type="submit"
                  variant="pink"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Generate Document
                </NeonButton>
                <NeonButton
                  type="button"
                  variant="cyan"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </NeonButton>
              </div>
            </form>
          </HudPanel>
        )}

        {/* Documents List */}
        <div>
          <h2 className="text-2xl font-bold text-glow-cyan mb-6">Your Documents</h2>

          {documents.length === 0 ? (
            <NeonCard variant="cyan" className="p-12 text-center">
              <FileText className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary mb-4">No documents yet</p>
              <p className="text-sm text-text-tertiary">
                Create your first professional document using our AI-powered generator
              </p>
            </NeonCard>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <NeonCard key={doc.id} variant="cyan" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-neon-cyan" />
                        <h3 className="font-bold text-neon-cyan">{doc.title}</h3>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">
                        {DOCUMENT_TYPES[doc.documentType]}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Created: {doc.createdAt.toLocaleDateString()} at {doc.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.storageUrl} download>
                        <NeonButton
                          variant="cyan"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </NeonButton>
                      </a>
                      <NeonButton
                        variant="cyan"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </NeonButton>
                    </div>
                  </div>
                </NeonCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
