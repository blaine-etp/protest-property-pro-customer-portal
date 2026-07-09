import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Gavel, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// property_exhibits isn't in the generated Database types yet; keep the cast contained here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface PropertyExhibit {
  id: string;
  doc_kind: string;
  exhibit_label: string | null;
  title: string;
  description: string | null;
  file_path: string;
  tax_year: number | null;
  sort_order: number;
  created_at: string;
}

const DOC_KIND_LABELS: Record<string, string> = {
  exhibit: 'Exhibit',
  declaration: 'Unsworn Declaration',
  combined_packet: 'Combined Packet',
  evidence_grid_pdf: 'Evidence Grid',
};

interface HearingDocumentsSectionProps {
  propertyId: string;
}

// Hearing documents published from the ETP evidence workbench (unsworn
// declaration, stamped exhibits, combined packet). RLS restricts the query to
// published exhibits on the signed-in owner's properties; the card stays
// hidden while there is nothing to show.
export function HearingDocumentsSection({ propertyId }: HearingDocumentsSectionProps) {
  const { toast } = useToast();
  const [exhibits, setExhibits] = useState<PropertyExhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchExhibits = async () => {
      try {
        const { data, error } = await db
          .from('property_exhibits')
          .select('id, doc_kind, exhibit_label, title, description, file_path, tax_year, sort_order, created_at')
          .eq('property_id', propertyId)
          .eq('is_published', true)
          .order('tax_year', { ascending: false })
          .order('sort_order', { ascending: true });
        if (error) throw error;
        if (!cancelled) setExhibits(data ?? []);
      } catch (err) {
        // Treat as "no documents" (e.g. migration not applied yet) rather than breaking the page.
        console.error('Failed to load hearing documents:', err);
        if (!cancelled) setExhibits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    fetchExhibits();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const downloadExhibit = async (exhibit: PropertyExhibit) => {
    setDownloading(exhibit.id);
    try {
      const { data, error } = await supabase.storage
        .from('property-evidence')
        .createSignedUrl(exhibit.file_path, 3600);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Hearing document download failed:', err);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  // The section only appears once ETP has published hearing documents.
  if (loading || exhibits.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gavel className="h-5 w-5" />
          <span>Hearing Documents</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Evidence prepared by Easy Tax Protest for your protest hearing.
        </p>
        <div className="space-y-3">
          {exhibits.map((exhibit) => (
            <div key={exhibit.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{exhibit.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {exhibit.tax_year ? `Tax Year ${exhibit.tax_year} • ` : ''}
                    {exhibit.description ||
                      new Date(exhibit.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Badge variant={exhibit.doc_kind === 'combined_packet' ? 'default' : 'secondary'}>
                  {exhibit.exhibit_label
                    ? `Exhibit ${exhibit.exhibit_label}`
                    : DOC_KIND_LABELS[exhibit.doc_kind] ?? exhibit.doc_kind}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadExhibit(exhibit)}
                  disabled={downloading === exhibit.id}
                >
                  {downloading === exhibit.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default HearingDocumentsSection;
