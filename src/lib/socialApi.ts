import { supabase } from '@/integrations/supabase/client';

// Like a post
export async function likePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_likes')
    .insert({ post_id: postId, user_id: userId });
  
  if (error) {
    if (error.code === '23505') {
      // Already liked, ignore
      return false;
    }
    throw error;
  }
  
  // Increment likes count on post
  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .single();
  
  if (post) {
    await supabase
      .from('posts')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('id', postId);
  }
  
  return true;
}

// Unlike a post
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  // Decrement likes count on post
  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .single();
  
  if (post && post.likes > 0) {
    await supabase
      .from('posts')
      .update({ likes: post.likes - 1 })
      .eq('id', postId);
  }
  
  return true;
}

// Check if user has liked a post
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
}

// Get user's liked posts
export async function getUserLikedPosts(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_likes')
    .select('post_id')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data?.map(l => l.post_id) || [];
}

// Bookmark a post
export async function bookmarkPost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ post_id: postId, user_id: userId });
  
  if (error) {
    if (error.code === '23505') return false; // Already bookmarked
    throw error;
  }
  return true;
}

// Remove bookmark
export async function unbookmarkPost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  
  if (error) throw error;
  return true;
}

// Get user's bookmarked posts
export async function getUserBookmarks(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data?.map(b => b.post_id) || [];
}

// Repost a post
export async function repost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('reposts')
    .insert({ post_id: postId, user_id: userId });
  
  if (error) {
    if (error.code === '23505') return false; // Already reposted
    throw error;
  }
  
  // Increment reposts count
  const { data: post } = await supabase
    .from('posts')
    .select('reposts')
    .eq('id', postId)
    .single();
  
  if (post) {
    await supabase
      .from('posts')
      .update({ reposts: (post.reposts || 0) + 1 })
      .eq('id', postId);
  }
  
  return true;
}

// Remove repost
export async function unrepost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('reposts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  // Decrement reposts count
  const { data: post } = await supabase
    .from('posts')
    .select('reposts')
    .eq('id', postId)
    .single();
  
  if (post && post.reposts > 0) {
    await supabase
      .from('posts')
      .update({ reposts: post.reposts - 1 })
      .eq('id', postId);
  }
  
  return true;
}

// Get user's reposts
export async function getUserReposts(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('reposts')
    .select('post_id')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data?.map(r => r.post_id) || [];
}

// Upload media for social post
export async function uploadSocialMedia(
  file: File, 
  userId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('social-media')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('social-media')
    .getPublicUrl(filePath);
  
  return publicUrl;
}

// Create a post with profile link
export async function createSocialPost(data: {
  content: string;
  media?: string[];
  profileId?: string;
  userId?: string;
  username: string;
  userAvatar?: string;
  podProductId?: string;
  podPrintType?: string;
  podDesignPreview?: string;
}) {
  const { error, data: post } = await supabase
    .from('posts')
    .insert({
      content: data.content,
      media: data.media || [],
      profile_id: data.profileId,
      user_id: data.userId,
      username: data.username,
      user_avatar: data.userAvatar || '👤',
      pod_product_id: data.podProductId,
      pod_print_type: data.podPrintType,
      pod_design_preview: data.podDesignPreview,
    })
    .select()
    .single();
  
  if (error) throw error;
  return post;
}
