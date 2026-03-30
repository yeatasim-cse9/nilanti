import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/hooks/useAdminData";
import { ImageUpload } from "../ImageUpload";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
}

export const ProductDialog = ({ open, onOpenChange, product }: ProductDialogProps) => {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    name_bn: "",
    slug: "",
    description: "",
    description_bn: "",
    base_price: "",
    sale_price: "",
    stock_quantity: "",
    category_id: "",
    is_featured: false,
    is_flash_sale: false,
    flash_sale_end: "",
    is_active: true,
    images: [] as string[],
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        name_bn: product.name_bn || "",
        slug: product.slug || "",
        description: product.description || "",
        description_bn: product.description_bn || "",
        base_price: product.base_price?.toString() || "",
        sale_price: product.sale_price?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        category_id: product.category_id || "",
        is_featured: product.is_featured || false,
        is_flash_sale: product.is_flash_sale || false,
        flash_sale_end: product.flash_sale_end || "",
        is_active: product.is_active ?? true,
        images: product.images || [],
      });
    } else {
      setForm({
        name: "",
        name_bn: "",
        slug: "",
        description: "",
        description_bn: "",
        base_price: "",
        sale_price: "",
        stock_quantity: "",
        category_id: "",
        is_featured: false,
        is_flash_sale: false,
        flash_sale_end: "",
        is_active: true,
        images: [],
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: form.name,
      name_bn: form.name_bn,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || null,
      description_bn: form.description_bn || null,
      base_price: parseFloat(form.base_price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_flash_sale: form.is_flash_sale,
      flash_sale_end: form.is_flash_sale ? form.flash_sale_end || null : null,
      is_active: form.is_active,
      images: form.images,
    };

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ করুন"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>নাম (English)</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>নাম (বাংলা)</Label>
              <Input
                value={form.name_bn}
                onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>স্লাগ</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="space-y-2">
              <Label>ক্যাটাগরি</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি বাছাই করুন" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name_bn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>দাম (৳)</Label>
              <Input
                type="number"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>সেল দাম (৳)</Label>
              <Input
                type="number"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>স্টক</Label>
              <Input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>বিবরণ (বাংলা)</Label>
            <Textarea
              value={form.description_bn}
              onChange={(e) => setForm({ ...form, description_bn: e.target.value })}
              rows={3}
            />
          </div>

          <ImageUpload
            label="ছবির আপলোড"
            images={form.images}
            onChange={(urls) => setForm({ ...form, images: urls })}
            multiple={true}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={form.is_flash_sale}
                onCheckedChange={(v) => setForm({ ...form, is_flash_sale: v })}
              />
              <Label className="font-semibold text-orange-600 dark:text-orange-400">ফ্ল্যাশ সেল (Flash Sale)</Label>
            </div>
            {form.is_flash_sale && (
              <div className="space-y-2">
                <Label className="text-orange-600 dark:text-orange-400">ফ্ল্যাশ সেল শেষ হওয়ার সময়</Label>
                <Input
                  type="datetime-local"
                  value={form.flash_sale_end}
                  onChange={(e) => setForm({ ...form, flash_sale_end: e.target.value })}
                  required={form.is_flash_sale}
                  className="border-orange-200 focus-visible:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
              <Label>বিশেষ পণ্য</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>সক্রিয়</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
