import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Reply, MoreHorizontal, Trash2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  profile_id: string | null;
  parent_id: string | null;
  likes: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
    display_name: string | null;
  } | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  onCommentCountChange: (count: number) => void;
  onRequireLogin: () => void;
}

export function CommentSection({ postId, onCommentCountChange, onRequireLogin }: CommentSectionProps) {
  const { user, profile, isUserLoggedIn } = useApp();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
    if (user?.id) {
      loadLikedComments();
    }
  }, [postId, user?.id]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:profile_id (
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const topLevel = data?.filter(c => !c.parent_id) || [];
      const replies = data?.filter(c => c.parent_id) || [];
      
      const organized = topLevel.map(comment => ({
        ...comment,
        replies: replies.filter(r => r.parent_id === comment.id)
      }));

      setComments(organized);
      onCommentCountChange(data?.length || 0);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedComments = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.id);
    
    setLikedComments(new Set(data?.map(l => l.comment_id) || []));
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!isUserLoggedIn) {
      onRequireLogin();
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user!.id,
          profile_id: profile?.id,
          content: content.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;

      // Update post comments count
      const { data: post } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .single();
      
      if (post) {
        await supabase
          .from('posts')
          .update({ comments: (post.comments || 0) + 1 })
          .eq('id', postId);
      }

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      await loadComments();
      toast({ title: "Comment added!" });
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isUserLoggedIn) {
      onRequireLogin();
      return;
    }

    const isLiked = likedComments.has(commentId);

    try {
      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user!.id);

        setLikedComments(prev => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });

        // Update comment likes count
        const comment = comments.find(c => c.id === commentId) || 
                        comments.flatMap(c => c.replies || []).find(c => c.id === commentId);
        if (comment) {
          await supabase
            .from('comments')
            .update({ likes: Math.max(0, (comment.likes || 0) - 1) })
            .eq('id', commentId);
        }
      } else {
        await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user!.id });

        setLikedComments(prev => new Set(prev).add(commentId));

        const comment = comments.find(c => c.id === commentId) || 
                        comments.flatMap(c => c.replies || []).find(c => c.id === commentId);
        if (comment) {
          await supabase
            .from('comments')
            .update({ likes: (comment.likes || 0) + 1 })
            .eq('id', commentId);
        }
      }

      await loadComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isUserLoggedIn) return;

    try {
      await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user!.id);

      await loadComments();
      toast({ title: "Comment deleted" });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm flex-shrink-0">
        {comment.profiles?.avatar_url ? (
          <img src={comment.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          comment.profiles?.username?.charAt(0).toUpperCase() || '?'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.profiles?.display_name || comment.profiles?.username || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">· {formatTime(comment.created_at)}</span>
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </div>
        
        <div className="flex items-center gap-4 mt-1.5 px-2">
          <button
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              likedComments.has(comment.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          
          {!isReply && (
            <button
              onClick={() => {
                if (!isUserLoggedIn) {
                  onRequireLogin();
                  return;
                }
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          )}
          
          {user?.id === comment.user_id && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Reply Input */}
        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex gap-2"
            >
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmitComment(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="border-t border-border pt-4 mt-2">
      {/* New Comment Input */}
      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm flex-shrink-0">
          {isUserLoggedIn && profile ? (
            profile.username?.charAt(0).toUpperCase() || '👤'
          ) : '👤'}
        </div>
        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder={isUserLoggedIn ? "Write a comment..." : "Sign in to comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => {
              if (!isUserLoggedIn) onRequireLogin();
            }}
            className="min-h-[60px] text-sm resize-none flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleSubmitComment()}
            disabled={submitting || !newComment.trim() || !isUserLoggedIn}
            className="self-end"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-16 bg-muted rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
