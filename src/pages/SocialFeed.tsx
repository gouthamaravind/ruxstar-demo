import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, BarChart3, Video, X, Loader2, Play,
  Plus, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { fetchPosts } from '@/lib/api';
import { 
  likePost, unlikePost, getUserLikedPosts, 
  uploadSocialMedia, createSocialPost,
  getUserBookmarks, bookmarkPost, unbookmarkPost,
  getUserReposts, repost, unrepost
} from '@/lib/socialApi';
import { Post } from '@/lib/types';
import { LoginRequiredDialog } from '@/components/LoginRequiredDialog';
import { PostCard } from '@/components/social/PostCard';
import logoImage from '@/assets/logo.png';

type PostType = 'text' | 'image' | 'poll' | 'video';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export default function SocialFeed() {
  const { toast } = useToast();
  const { user, profile, isUserLoggedIn } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<PostType>('text');
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userLikedPosts, setUserLikedPosts] = useState<Set<string>>(new Set());
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set());
  const [userReposts, setUserReposts] = useState<Set<string>>(new Set());
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  
  // Poll state
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '', votes: 0 },
    { id: '2', text: '', votes: 0 },
  ]);
  
  // Media state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const postsData = await fetchPosts();
      setPosts(postsData);
      
      // Load user's liked posts, bookmarks, reposts
      if (user?.id) {
        const [likedPostIds, bookmarkIds, repostIds] = await Promise.all([
          getUserLikedPosts(user.id),
          getUserBookmarks(user.id),
          getUserReposts(user.id)
        ]);
        setUserLikedPosts(new Set(likedPostIds));
        setUserBookmarks(new Set(bookmarkIds));
        setUserReposts(new Set(repostIds));
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const requireLogin = (action: string): boolean => {
    if (!isUserLoggedIn) {
      setLoginAction(action);
      setShowLoginDialog(true);
      return true;
    }
    return false;
  };

  const handleCreatePost = async () => {
    if (requireLogin('create a post')) return;
    
    if (!newPostContent.trim() && postType === 'text' && !mediaFile) return;
    if (postType === 'poll' && pollOptions.filter(o => o.text.trim()).length < 2) {
      toast({ title: "Add at least 2 poll options", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    try {
      let mediaUrl: string | undefined;
      
      // Upload media if exists
      if (mediaFile && user?.id) {
        setUploading(true);
        mediaUrl = await uploadSocialMedia(mediaFile, user.id);
        setUploading(false);
      }
      
      let content = newPostContent;
      
      // Add poll data to content if it's a poll
      if (postType === 'poll') {
        const pollData = pollOptions.filter(o => o.text.trim()).map(o => o.text);
        content = `📊 ${newPostContent}\n\n${pollData.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`;
      }
      
      const newPost = await createSocialPost({ 
        content,
        media: mediaUrl ? [mediaUrl] : undefined,
        profileId: profile?.id,
        userId: user?.id,
        username: profile?.username || 'user',
        userAvatar: profile?.avatar_url || '👤',
      });
      
      setPosts([{ ...newPost, likes: 0, comments: 0, reposts: 0, profile_id: profile?.id || null } as Post, ...posts]);
      resetForm();
      toast({ title: "Posted! 🎉", description: "Your post is now live" });
    } catch (error: any) {
      console.error('Post error:', error);
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewPostContent('');
    setPostType('text');
    setIsExpanded(false);
    setMediaPreview(null);
    setMediaFile(null);
    setMediaType(null);
    setPollOptions([
      { id: '1', text: '', votes: 0 },
      { id: '2', text: '', votes: 0 },
    ]);
  };

  const handleLike = async (postId: string) => {
    if (requireLogin('like this post')) return;
    if (!user?.id) return;
    
    const isLiked = userLikedPosts.has(postId);
    
    try {
      if (isLiked) {
        await unlikePost(postId, user.id);
        setUserLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      } else {
        await likePost(postId, user.id);
        setUserLikedPosts(prev => new Set(prev).add(postId));
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (requireLogin('bookmark this post')) return;
    if (!user?.id) return;
    
    const isBookmarked = userBookmarks.has(postId);
    
    try {
      if (isBookmarked) {
        await unbookmarkPost(postId, user.id);
        setUserBookmarks(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        toast({ title: "Removed from bookmarks" });
      } else {
        await bookmarkPost(postId, user.id);
        setUserBookmarks(prev => new Set(prev).add(postId));
        toast({ title: "Added to bookmarks" });
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const handleRepost = async (postId: string) => {
    if (requireLogin('repost this')) return;
    if (!user?.id) return;
    
    const isReposted = userReposts.has(postId);
    
    try {
      if (isReposted) {
        await unrepost(postId, user.id);
        setUserReposts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts(posts.map(p => p.id === postId ? { ...p, reposts: Math.max(0, p.reposts - 1) } : p));
        toast({ title: "Repost removed" });
      } else {
        await repost(postId, user.id);
        setUserReposts(prev => new Set(prev).add(postId));
        setPosts(posts.map(p => p.id === postId ? { ...p, reposts: p.reposts + 1 } : p));
        toast({ title: "Reposted! 🔁" });
      }
    } catch (error) {
      console.error('Failed to update repost:', error);
    }
  };

  const handleMediaSelect = (type: 'image' | 'video') => {
    if (requireLogin('upload media')) return;
    
    setPostType(type === 'image' ? 'image' : 'video');
    setMediaType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" });
      return;
    }
    
    setMediaFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
      setIsExpanded(true);
    };
    reader.readAsDataURL(file);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, { id: Date.now().toString(), text: '', votes: 0 }]);
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(o => o.id === id ? { ...o, text } : o));
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(o => o.id !== id));
    }
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-background">
      <LoginRequiredDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        action={loginAction}
      />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="RuxStar" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold">Social Feed</h1>
              <p className="text-sm text-muted-foreground">Share & discover designs</p>
            </div>
          </div>
          
          {/* User Status */}
          {isUserLoggedIn && profile ? (
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.username?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">@{profile.username}</span>
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </motion.div>

        {/* Create Post Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-card rounded-2xl border border-border shadow-sm mb-6 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                {isUserLoggedIn && profile ? (
                  profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.username?.charAt(0).toUpperCase() || '👤'
                  )
                ) : '👤'}
              </div>
              <div className="flex-1">
                <Textarea 
                  placeholder={
                    !isUserLoggedIn 
                      ? "Sign in to post..." 
                      : postType === 'poll' 
                        ? "Ask a question..." 
                        : "What's on your mind?"
                  } 
                  value={newPostContent} 
                  onChange={(e) => {
                    setNewPostContent(e.target.value);
                    if (!isExpanded && e.target.value) setIsExpanded(true);
                  }}
                  onFocus={() => {
                    if (!isUserLoggedIn) {
                      setLoginAction('create a post');
                      setShowLoginDialog(true);
                    } else {
                      setIsExpanded(true);
                    }
                  }}
                  className="border-0 resize-none focus-visible:ring-0 p-0 min-h-[50px] text-base placeholder:text-muted-foreground/60" 
                />

                {/* Media Preview */}
                <AnimatePresence>
                  {mediaPreview && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative mt-3 rounded-xl overflow-hidden border border-border"
                    >
                      {mediaType === 'video' ? (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Video selected</p>
                          </div>
                        </div>
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full max-h-80 object-cover" />
                      )}
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => {
                          setMediaPreview(null);
                          setMediaFile(null);
                          setMediaType(null);
                          setPostType('text');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Poll Options */}
                <AnimatePresence>
                  {postType === 'poll' && isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {pollOptions.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(e) => updatePollOption(option.id, e.target.value)}
                            className="flex-1"
                          />
                          {pollOptions.length > 2 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="shrink-0"
                              onClick={() => removePollOption(option.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 4 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={addPollOption}
                          className="text-primary"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add option
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <AnimatePresence>
            {isExpanded && isUserLoggedIn && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4"
              >
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                      className="hidden" 
                    />
                    <Button 
                      variant={postType === 'image' ? 'secondary' : 'ghost'} 
                      size="sm"
                      onClick={() => handleMediaSelect('image')}
                      className="gap-1.5"
                    >
                      <Image className="h-4 w-4 text-green-500" />
                      <span className="hidden sm:inline">Image</span>
                    </Button>
                    <Button 
                      variant={postType === 'video' ? 'secondary' : 'ghost'} 
                      size="sm"
                      onClick={() => handleMediaSelect('video')}
                      className="gap-1.5"
                    >
                      <Video className="h-4 w-4 text-purple-500" />
                      <span className="hidden sm:inline">Video</span>
                    </Button>
                    <Button 
                      variant={postType === 'poll' ? 'secondary' : 'ghost'} 
                      size="sm"
                      onClick={() => setPostType(postType === 'poll' ? 'text' : 'poll')}
                      className="gap-1.5"
                    >
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <span className="hidden sm:inline">Poll</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsExpanded(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreatePost} 
                      disabled={submitting || uploading || (!newPostContent.trim() && !mediaFile && postType !== 'poll')} 
                      size="sm"
                      className="gap-1.5"
                    >
                      {submitting || uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                index={index}
                isLiked={userLikedPosts.has(post.id)}
                isBookmarked={userBookmarks.has(post.id)}
                isReposted={userReposts.has(post.id)}
                onLike={() => handleLike(post.id)}
                onBookmark={() => handleBookmark(post.id)}
                onRepost={() => handleRepost(post.id)}
                onRequireLogin={() => {
                  setLoginAction('interact with posts');
                  setShowLoginDialog(true);
                }}
                isUserLoggedIn={isUserLoggedIn}
                userId={user?.id}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
