import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlogPosts, useDeleteBlogPost, useUpdateBlogPost } from "@/hooks/useCMSData";
import BlogPostDialog from "../dialogs/BlogPostDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BlogTab = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const deletePost = useDeleteBlogPost();
  const updatePost = useUpdateBlogPost();
  const [editPost, setEditPost] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePublish = (post: any) => {
    updatePost.mutate({
      id: post.id,
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : null,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">ব্লগ পোস্ট ({posts?.length || 0})</h2>
        <Button onClick={() => { setEditPost(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          নতুন পোস্ট
        </Button>
      </div>

      <div className="grid gap-4">
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{post.title}</h3>
                    <Badge variant={post.is_published ? "default" : "secondary"}>
                      {post.is_published ? "প্রকাশিত" : "ড্রাফট"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {post.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.author} • {post.category} • {new Date(post.created_at).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish(post)}
                    title={post.is_published ? "আনপাবলিশ" : "পাবলিশ"}
                  >
                    {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditPost(post); setDialogOpen(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!posts?.length && (
          <div className="text-center py-12 text-muted-foreground">
            কোন ব্লগ পোস্ট নেই। নতুন পোস্ট যোগ করুন।
          </div>
        )}
      </div>

      <BlogPostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={editPost}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>পোস্ট মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deletePost.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogTab;
