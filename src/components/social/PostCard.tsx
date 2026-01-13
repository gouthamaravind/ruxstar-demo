import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Repeat2, Share, Bookmark, 
  MoreHorizontal, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post, formatINR } from '@/lib/types';
import { CommentSection } from './CommentSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
  index: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isReposted: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onRepost: () => void;
  onRequireLogin: () => void;
  isUserLoggedIn: boolean;
  userId?: string;
  formatTime: (ts: string) => string;
}

export function PostCard({ 
  post, 
  index, 
  isLiked,
  isBookmarked,
  isReposted,
  onLike, 
  onBookmark,
  onRepost,
  onRequireLogin,
  isUserLoggedIn,
  userId,
  formatTime 
}: PostCardProps) {
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [localReposts, setLocalReposts] = useState(post.reposts || 0);

  const handleAction = (action: () => void) => {
    if (!isUserLoggedIn) {
      onRequireLogin();
      return;
    }
    action();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/social?post=${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.username}`,
          text: post.content.substring(0, 100),
          url: url
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Post link copied to clipboard" });
    }
  };

  const handleRepost = () => {
    if (!isUserLoggedIn) {
      onRequireLogin();
      return;
    }
    onRepost();
    setLocalReposts(prev => isReposted ? Math.max(0, prev - 1) : prev + 1);
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.03 }} 
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:border-border/80 transition-colors"
    >
      {/* Repost indicator */}
      {isReposted && (
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Repeat2 className="h-3.5 w-3.5" />
            <span>You reposted</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <Link 
            to={post.profile_id ? `/profile/${post.profile_id}` : '#'}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl flex-shrink-0 hover:ring-2 hover:ring-primary/30 transition-all"
          >
            {post.user_avatar?.startsWith('http') ? (
              <img src={post.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              post.user_avatar || '👤'
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                to={post.profile_id ? `/profile/${post.profile_id}` : '#'}
                className="font-semibold hover:underline cursor-pointer"
              >
                @{post.username}
              </Link>
              <span className="text-muted-foreground text-sm">· {formatTime(post.created_at)}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-3">
          <div className={`rounded-xl overflow-hidden border border-border ${
            post.media.length > 1 ? 'grid grid-cols-2 gap-1' : ''
          }`}>
            {post.media.slice(0, 4).map((mediaUrl, i) => (
              <div key={i} className="relative aspect-video">
                {mediaUrl.includes('.mp4') || mediaUrl.includes('video') ? (
                  <video 
                    src={mediaUrl} 
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    alt="Post media" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {i === 3 && post.media && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{post.media.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POD Product Card */}
      {post.pod_product_id && post.products && (
        <div className="mx-4 mb-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center text-3xl shadow-sm">
              {post.pod_design_preview || post.products.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{post.products.name}</p>
              <p className="text-sm text-muted-foreground">
                {post.pod_print_type} • From {formatINR(post.products.base_price)}
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 gap-1">
              <Link to={`/pod/order?product=${post.pod_product_id}`}>
                Order
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{post.likes}</span>
          </motion.button>
          
          <button 
            onClick={() => {
              if (!isUserLoggedIn && !showComments) {
                onRequireLogin();
                return;
              }
              setShowComments(!showComments);
            }}
            className={`flex items-center gap-2 transition-colors ${
              showComments ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <MessageCircle className={`h-5 w-5 ${showComments ? 'fill-primary/20' : ''}`} />
            <span className="text-sm font-medium">{commentCount}</span>
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleRepost}
            className={`flex items-center gap-2 transition-colors ${
              isReposted ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'
            }`}
          >
            <Repeat2 className={`h-5 w-5 ${isReposted ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-sm font-medium">{localReposts}</span>
          </motion.button>
          
          <div className="flex items-center gap-1">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAction(onBookmark)}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
            >
              <Share className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <CommentSection 
              postId={post.id}
              onCommentCountChange={setCommentCount}
              onRequireLogin={onRequireLogin}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
