import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/useCMSData";
import { ImageUpload } from "../ImageUpload";

const formSchema = z.object({
  title: z.string().min(1, "শিরোনাম আবশ্যক"),
  slug: z.string().min(1, "স্লাগ আবশ্যক"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: any;
}

const BlogPostDialog = ({ open, onOpenChange, post }: BlogPostDialogProps) => {
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const isEditing = !!post;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      author: "অর্গানিক স্টোর",
      category: "",
      is_published: false,
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        image_url: post.image_url || "",
        author: post.author || "অর্গানিক স্টোর",
        category: post.category || "",
        is_published: post.is_published || false,
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image_url: "",
        author: "অর্গানিক স্টোর",
        category: "",
        is_published: false,
      });
    }
  }, [post, form]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updatePost.mutate(
        { id: post.id, ...values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPost.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "ব্লগ পোস্ট সম্পাদনা" : "নতুন ব্লগ পোস্ট"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শিরোনাম *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>স্লাগ (URL) *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>লেখক</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ক্যাটাগরি</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="যেমন: স্বাস্থ্য, রেসিপি" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ছবির আপলোড</FormLabel>
                  <FormControl>
                    <ImageUpload
                      images={field.value ? [field.value] : []}
                      onChange={(urls) => field.onChange(urls[0] || "")}
                      multiple={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>সংক্ষিপ্ত বিবরণ</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="ব্লগ পোস্টের সংক্ষিপ্ত বিবরণ..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>বিস্তারিত</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={10} placeholder="পুরো ব্লগ পোস্ট লিখুন..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">প্রকাশ করুন</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      এটি সক্রিয় করলে পোস্ট সবার জন্য দৃশ্যমান হবে
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
                {isEditing ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostDialog;
