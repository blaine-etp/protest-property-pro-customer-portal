import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Comment {
  id: string;
  content: string;
  comment_type: string;
  old_status?: string;
  new_status?: string;
  created_at: string;
  user_id: string;
}

interface ProtestCommentsProps {
  protestId: string;
}

export function ProtestComments({ protestId }: ProtestCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [protestId]);

  const fetchComments = async () => {
    try {
      // For now, using mock data until types are updated
      setComments([]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // For now, just clear the input - functionality will be added when types are updated
      setNewComment("");
      console.log('Comment would be added:', newComment.trim());
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'status_change': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment or note..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={addComment} 
            disabled={!newComment.trim() || submitting}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground">No comments yet. Add the first one!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Admin User</span>
                      <Badge className={getCommentTypeColor(comment.comment_type)}>
                        {comment.comment_type === 'status_change' ? 'Status Change' : 
                         comment.comment_type === 'system' ? 'System' : 'Note'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  {comment.old_status && comment.new_status && (
                    <div className="text-sm text-muted-foreground">
                      Status changed from <span className="font-medium">{comment.old_status}</span> to{' '}
                      <span className="font-medium">{comment.new_status}</span>
                    </div>
                  )}
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}