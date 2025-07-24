import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Copy, 
  RefreshCw, 
  Eye, 
  Code,
  Plus,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleHtmlEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  showTemplates?: boolean;
  showCopyFromCounty?: boolean;
}

interface County {
  id: string;
  name: string;
  state: string;
  page_content: string;
}

const templates = {
  'info-box': `<div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #0369a1; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💡 Information Title</h3>
  <p style="margin: 0; color: #374151;">Your information content here...</p>
</div>`,
  'success-box': `<div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">✅ Success Title</h3>
  <p style="margin: 0; color: #374151;">Your success content here...</p>
</div>`,
  'warning-box': `<div style="background-color: #fefce8; border: 1px solid #eab308; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #a16207; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">⚠️ Warning Title</h3>
  <p style="margin: 0; color: #374151;">Your warning content here...</p>
</div>`,
  'process-box': `<div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">🎯 Process Steps</h3>
  <ol style="margin: 0; padding-left: 20px; color: #374151;">
    <li><strong>Step 1:</strong> Description</li>
    <li><strong>Step 2:</strong> Description</li>
    <li><strong>Step 3:</strong> Description</li>
  </ol>
</div>`,
  'benefits-box': `<div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #0369a1; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💡 Key Benefits</h3>
  <ul style="margin: 0; padding-left: 20px; color: #374151;">
    <li>Benefit 1</li>
    <li>Benefit 2</li>
    <li>Benefit 3</li>
  </ul>
</div>`
};

export function SimpleHtmlEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  className = "",
  showTemplates = true,
  showCopyFromCounty = false
}: SimpleHtmlEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [counties, setCounties] = useState<County[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const { toast } = useToast();

  const fetchCounties = async () => {
    if (counties.length > 0) return; // Already loaded
    
    setLoadingCounties(true);
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('id, name, state, page_content')
        .eq('status', 'published')
        .order('name');
      
      if (error) throw error;
      setCounties(data || []);
    } catch (error) {
      console.error('Error fetching counties:', error);
      toast({
        title: "Error",
        description: "Failed to load counties for copying content.",
        variant: "destructive",
      });
    } finally {
      setLoadingCounties(false);
    }
  };

  const insertTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    if (template) {
      const newContent = content + '\n\n' + template;
      onChange(newContent);
      toast({
        title: "Template inserted",
        description: "Template has been added to your content.",
      });
    }
  };

  const copyFromCounty = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    if (county && county.page_content) {
      onChange(county.page_content);
      toast({
        title: "Content copied",
        description: `Content copied from ${county.name} County.`,
      });
    }
  };

  const resetContent = () => {
    onChange('');
    toast({
      title: "Content reset",
      description: "Content has been cleared.",
    });
  };

  return (
    <div className={`border rounded-md ${className}`}>
      <div className="border-b p-2 flex flex-wrap gap-2 items-center">
        {/* Mode Toggle */}
        <div className="flex gap-1 mr-4 border-r pr-4">
          <Button
            type="button"
            variant={mode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
          >
            <Code className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={mode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>

        {/* Template Insertion */}
        {showTemplates && mode === 'edit' && (
          <div className="flex gap-1 mr-4 border-r pr-4">
            <Select onValueChange={insertTemplate}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Insert template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info-box">💡 Info Box</SelectItem>
                <SelectItem value="success-box">✅ Success Box</SelectItem>
                <SelectItem value="warning-box">⚠️ Warning Box</SelectItem>
                <SelectItem value="process-box">🎯 Process Steps</SelectItem>
                <SelectItem value="benefits-box">💡 Benefits List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Copy from County */}
        {showCopyFromCounty && mode === 'edit' && (
          <div className="flex gap-1 mr-4 border-r pr-4">
            <Select onValueChange={copyFromCounty} onOpenChange={fetchCounties}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Copy from county" />
              </SelectTrigger>
              <SelectContent>
                {loadingCounties ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                ) : (
                  counties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      <Copy className="h-3 w-3 mr-1 inline" />
                      {county.name}, {county.state}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reset Button */}
        {mode === 'edit' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetContent}
            className="text-destructive hover:text-destructive"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Editor Content */}
      {mode === 'edit' ? (
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
        />
      ) : (
        <div className="min-h-[200px] p-4 prose prose-sm max-w-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="text-muted-foreground italic">No content to preview</div>
          )}
        </div>
      )}
    </div>
  );
}