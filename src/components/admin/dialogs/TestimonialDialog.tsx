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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTestimonial, useUpdateTestimonial } from "@/hooks/useCMSData";

const formSchema = z.object({
  customer_name: z.string().min(1, "নাম আবশ্যক"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "মন্তব্য আবশ্যক"),
  product_name: z.string().optional(),
  avatar_url: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: any;
}

const TestimonialDialog = ({ open, onOpenChange, testimonial }: TestimonialDialogProps) => {
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const isEditing = !!testimonial;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      rating: 5,
      comment: "",
      product_name: "",
      avatar_url: "",
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (testimonial) {
      form.reset({
        customer_name: testimonial.customer_name || "",
        rating: testimonial.rating || 5,
        comment: testimonial.comment || "",
        product_name: testimonial.product_name || "",
        avatar_url: testimonial.avatar_url || "",
        is_active: testimonial.is_active ?? true,
        sort_order: testimonial.sort_order || 0,
      });
    } else {
      form.reset({
        customer_name: "",
        rating: 5,
        comment: "",
        product_name: "",
        avatar_url: "",
        is_active: true,
        sort_order: 0,
      });
    }
  }, [testimonial, form]);

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateTestimonial.mutate(
        { id: testimonial.id, ...values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createTestimonial.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "রিভিউ সম্পাদনা" : "নতুন রিভিউ"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>গ্রাহকের নাম *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="যেমন: রহিম উদ্দিন" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>রেটিং *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {"★".repeat(rating)}{"☆".repeat(5 - rating)} ({rating})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মন্তব্য *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="গ্রাহকের মন্তব্য..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পণ্যের নাম (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="যেমন: সুন্দরবনের খাঁটি মধু" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ক্রম</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">সক্রিয়</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      রিভিউ ওয়েবসাইটে দেখাবে
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
              <Button type="submit" disabled={createTestimonial.isPending || updateTestimonial.isPending}>
                {isEditing ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialDialog;
