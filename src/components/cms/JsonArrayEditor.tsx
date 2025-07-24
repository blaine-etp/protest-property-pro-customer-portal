
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteContent } from '@/services/contentService';
import { useUpdateContent } from '@/hooks/useContentManagement';
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react';
import { HybridHtmlEditor } from '@/components/ui/hybrid-html-editor';

interface JsonArrayEditorProps {
  content: SiteContent;
  label: string;
  itemSchema: Array<{
    key: string;
    label: string;
    type: 'text' | 'rich_text' | 'number';
  }>;
  onReset?: () => void;
}

export const JsonArrayEditor = ({ content, label, itemSchema, onReset }: JsonArrayEditorProps) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(content.content_value || '[]');
    } catch {
      return [];
    }
  });
  const updateContent = useUpdateContent();

  const handleSave = () => {
    updateContent.mutate({
      id: content.id,
      content: { content_value: JSON.stringify(items) }
    });
  };

  const handleReset = () => {
    try {
      setItems(JSON.parse(content.content_value || '[]'));
      onReset?.();
    } catch {
      setItems([]);
    }
  };

  const addItem = () => {
    const newItem = itemSchema.reduce((acc, field) => {
      acc[field.key] = field.type === 'number' ? 0 : '';
      return acc;
    }, {} as Record<string, any>);
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const updateItem = (index: number, key: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index][key] = value;
    setItems(updatedItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button onClick={addItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      {items.map((item: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Item {index + 1}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {itemSchema.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === 'rich_text' ? (
                  <HybridHtmlEditor
                    content={item[field.key] || ''}
                    onChange={(value) => updateItem(index, field.key, value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={item[field.key] || ''}
                    onChange={(e) => updateItem(index, field.key, 
                      field.type === 'number' ? Number(e.target.value) : e.target.value
                    )}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateContent.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};
