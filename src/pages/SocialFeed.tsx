import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, Share, Send, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getPosts, savePosts, Post } from '@/lib/mockData';

export default function SocialFeed() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>(getPosts());
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: 'current-user',
      username: 'you',
      userAvatar: '👤',
      content: newPostContent,
      media: [],
      likes: 0,
      comments: 0,
      reposts: 0,
      timestamp: new Date().toISOString(),
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    setNewPostContent('');
    toast({ title: "Posted!", description: "Your post is now live" });
  };

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts);
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
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">Social Feed</h1>
          <p className="text-muted-foreground">Share designs and discover creators</p>
        </motion.div>

        {/* Composer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-4 mb-6 shadow-card"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
              👤
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="border-0 resize-none focus-visible:ring-0 p-0 min-h-[60px]"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Media
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={!newPostContent.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl border border-border p-4 shadow-card"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl flex-shrink-0">
                  {post.userAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">@{post.username}</span>
                    <span className="text-muted-foreground text-sm">· {formatTime(post.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>

              {/* POD Attachment */}
              {post.podAttachment && (
                <div className="bg-muted/50 rounded-xl p-4 mb-3 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center text-3xl">
                      {post.podAttachment.designPreview}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{post.podAttachment.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.podAttachment.printType} • From ${post.podAttachment.price}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/pod/order?product=${post.podAttachment.productId}`}>
                        Order
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors">
                  <Repeat2 className="h-4 w-4" />
                  <span className="text-sm">{post.reposts}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Share className="h-4 w-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
