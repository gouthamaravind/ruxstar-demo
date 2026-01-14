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
      transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }} 
      className="group relative bg-card rounded-3xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Repost indicator */}
      {isReposted && (
        <div className="relative px-5 pt-4 pb-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
            <Repeat2 className="h-3.5 w-3.5" />
            <span>You reposted</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative p-5 pb-0">
        <div className="flex items-start gap-4">
          <Link 
            to={post.profile_id ? `/profile/${post.profile_id}` : '#'}
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-lg font-semibold text-primary-foreground flex-shrink-0 ring-4 ring-primary/10 hover:ring-primary/25 transition-all shadow-lg"
          >
            {post.user_avatar?.startsWith('http') ? (
              <img src={post.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              post.user_avatar || '👤'
            )}
          </Link>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={post.profile_id ? `/profile/${post.profile_id}` : '#'}
                className="font-bold text-foreground hover:text-primary transition-colors"
              >
                @{post.username}
              </Link>
              <span className="text-muted-foreground/60 text-sm font-medium">· {formatTime(post.created_at)}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-5 py-4">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed text-[15px]">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="relative px-5 pb-4">
          <div className={`rounded-2xl overflow-hidden ring-1 ring-border/50 ${
            post.media.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''
          }`}>
            {post.media.slice(0, 4).map((mediaUrl, i) => (
              <div key={i} className="relative aspect-video bg-muted overflow-hidden">
                {mediaUrl.includes('.mp4') || mediaUrl.includes('video') ? (
                  <video 
                    src={mediaUrl} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    alt="Post media" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
                {i === 3 && post.media && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">+{post.media.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POD Product Card */}
      {post.pod_product_id && post.products && (
        <div className="relative mx-5 mb-4 bg-gradient-to-br from-primary/5 via-muted/50 to-accent/5 rounded-2xl p-4 border border-primary/10 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center text-3xl shadow-lg ring-1 ring-border/50">
              {post.pod_design_preview || post.products.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate text-foreground">{post.products.name}</p>
              <p className="text-sm text-muted-foreground font-medium">
                {post.pod_print_type} • From {formatINR(post.products.base_price)}
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 gap-1.5 rounded-full px-5 shadow-lg shadow-primary/20">
              <Link to={`/pod/order?product=${post.pod_product_id}`}>
                Order
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="relative px-5 py-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <motion.button 
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={onLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
              isLiked 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold">{post.likes}</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              if (!isUserLoggedIn && !showComments) {
                onRequireLogin();
                return;
              }
              setShowComments(!showComments);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
              showComments 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
          >
            <MessageCircle className={`h-5 w-5 ${showComments ? 'fill-primary/20' : ''}`} />
            <span className="text-sm font-semibold">{commentCount}</span>
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleRepost}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
              isReposted 
                ? 'text-green-500 bg-green-500/10' 
                : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'
            }`}
          >
            <Repeat2 className={`h-5 w-5 ${isReposted ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-sm font-semibold">{localReposts}</span>
          </motion.button>
          
          <div className="flex items-center gap-0.5">
            <motion.button 
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => handleAction(onBookmark)}
              className={`p-2.5 rounded-full transition-all ${
                isBookmarked 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleShare}
              className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
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
            className="relative px-5 pb-5 bg-muted/30"
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
