
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { HybridHtmlEditor } from '@/components/ui/hybrid-html-editor';
import { SiteContent } from '@/services/contentService';
import { useUpdateContent } from '@/hooks/useContentManagement';
import { Save, RotateCcw } from 'lucide-react';

interface ContentEditorProps {
  content: SiteContent;
  label: string;
  onReset?: () => void;
}

export const ContentEditor = ({ content, label, onReset }: ContentEditorProps) => {
  const [value, setValue] = useState(content.content_value || '');
  const updateContent = useUpdateContent();

  const handleSave = () => {
    updateContent.mutate({
      id: content.id,
      content: { content_value: value }
    });
  };

  const handleReset = () => {
    setValue(content.content_value || '');
    onReset?.();
  };

  if (content.content_type === 'rich_text') {
    return (
      <div className="space-y-2">
        <Label htmlFor={content.content_key}>{label}</Label>
        <HybridHtmlEditor
          content={value}
          onChange={setValue}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={updateContent.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={content.content_key}>{label}</Label>
      <Input
        id={content.content_key}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateContent.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};
