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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateCoupon, useUpdateCoupon, useCategories, useProducts } from "@/hooks/useAdminData";
import { Dices, X, TrendingUp } from "lucide-react";
import { Coupon } from "@/types/firestore";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: any;
}

const PREFIXES = ["EID", "SUMMER", "WINTER", "SALE", "NEW", "VIP", "SAVE", "FLAT", "FEST"];

function generateCode() {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${suffix}`;
}

function toDatetimeLocal(isoString: string | null | undefined) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const defaultForm = {
  name: "",
  code: "",
  description: "",
  discount_type: "percentage" as Coupon["discount_type"],
  discount_value: "",
  max_discount: "",
  min_order_amount: "",
  max_order_amount: "",
  min_order_quantity: "",
  valid_from: "",
  valid_until: "",
  usage_limit: "",
  usage_limit_per_customer: "",
  applicable_to: "all" as Coupon["applicable_to"],
  applicable_category_ids: [] as string[],
  applicable_product_ids: [] as string[],
  excluded_category_ids: [] as string[],
  excluded_product_ids: [] as string[],
  apply_to_sale_items: true,
  customer_target: "all" as Coupon["customer_target"],
  is_public: false,
  is_stackable: false,
  is_active: true,
  buy_x_qty: "",
  get_y_qty: "",
  get_discount_percent: "100",
};

export const CouponDialog = ({ open, onOpenChange, coupon }: CouponDialogProps) => {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const { data: categories } = useCategories();
  const { data: products } = useProducts();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (coupon) {
      setForm({
        name: coupon.name || "",
        code: coupon.code || "",
        description: coupon.description || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value?.toString() || "",
        max_discount: coupon.max_discount?.toString() || "",
        min_order_amount: coupon.min_order_amount?.toString() || "",
        max_order_amount: coupon.max_order_amount?.toString() || "",
        min_order_quantity: coupon.min_order_quantity?.toString() || "",
        valid_from: toDatetimeLocal(coupon.valid_from),
        valid_until: toDatetimeLocal(coupon.valid_until),
        usage_limit: coupon.usage_limit?.toString() || "",
        usage_limit_per_customer: coupon.usage_limit_per_customer?.toString() || "",
        applicable_to: coupon.applicable_to || "all",
        applicable_category_ids: coupon.applicable_category_ids || [],
        applicable_product_ids: coupon.applicable_product_ids || [],
        excluded_category_ids: coupon.excluded_category_ids || [],
        excluded_product_ids: coupon.excluded_product_ids || [],
        apply_to_sale_items: coupon.apply_to_sale_items ?? true,
        customer_target: coupon.customer_target || "all",
        is_public: coupon.is_public ?? false,
        is_stackable: coupon.is_stackable ?? false,
        is_active: coupon.is_active ?? true,
        buy_x_qty: coupon.buy_x_get_y?.buy_qty?.toString() || "",
        get_y_qty: coupon.buy_x_get_y?.get_qty?.toString() || "",
        get_discount_percent: coupon.buy_x_get_y?.get_discount_percent?.toString() || "100",
      });
    } else {
      setForm(defaultForm);
    }
  }, [coupon, open]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleMulti = (key: keyof typeof form, id: string) => {
    const arr = (form[key] as string[]) || [];
    set(key, arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isFreeShipping = form.discount_type === "free_shipping";
    const isBuyXGetY = form.discount_type === "buy_x_get_y";

    const data: Omit<Coupon, "id" | "created_at" | "updated_at" | "usage_count"> = {
      name: form.name,
      code: form.code.toUpperCase(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: isFreeShipping ? 0 : parseFloat(form.discount_value) || 0,
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_order_amount: form.max_order_amount ? parseFloat(form.max_order_amount) : null,
      min_order_quantity: form.min_order_quantity ? parseInt(form.min_order_quantity) : null,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      usage_limit_per_customer: form.usage_limit_per_customer ? parseInt(form.usage_limit_per_customer) : null,
      applicable_to: form.applicable_to,
      applicable_category_ids: form.applicable_to === "categories" ? form.applicable_category_ids : [],
      applicable_product_ids: form.applicable_to === "products" ? form.applicable_product_ids : [],
      excluded_category_ids: form.excluded_category_ids,
      excluded_product_ids: form.excluded_product_ids,
      apply_to_sale_items: form.apply_to_sale_items,
      customer_target: form.customer_target,
      specific_customer_ids: [],
      is_public: form.is_public,
      is_stackable: form.is_stackable,
      is_active: form.is_active,
      buy_x_get_y: isBuyXGetY ? {
        buy_qty: parseInt(form.buy_x_qty) || 1,
        get_qty: parseInt(form.get_y_qty) || 1,
        get_discount_percent: parseInt(form.get_discount_percent) || 100,
      } : undefined,
    };

    try {
      if (coupon) {
        await updateCoupon.mutateAsync({ id: coupon.id, ...data });
      } else {
        await createCoupon.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isFreeShipping = form.discount_type === "free_shipping";
  const isBuyXGetY = form.discount_type === "buy_x_get_y";
  const isPercentage = form.discount_type === "percentage" || form.discount_type === "percentage_free_shipping";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? "কুপন এডিট করুন" : "নতুন কুপন"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">সাধারণ</TabsTrigger>
              <TabsTrigger value="rules">শর্তাবলী</TabsTrigger>
              <TabsTrigger value="applicability">প্রযোজ্যতা</TabsTrigger>
              <TabsTrigger value="advanced">অ্যাডভান্সড</TabsTrigger>
            </TabsList>

            {/* ─── GENERAL TAB ─── */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>কুপনের নাম <span className="text-red-500">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="যেমন: ঈদ স্পেশাল ২০% ছাড়"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>কুপন কোড <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    value={form.code}
                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                    placeholder="যেমন: EID2025"
                    className="font-mono tracking-widest uppercase"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => set("code", generateCode())}
                    title="অটো জেনারেট"
                  >
                    <Dices className="h-4 w-4 mr-1" /> জেনারেট
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>বিবরণ (ঐচ্ছিক)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="অভ্যন্তরীণ নোট বা কুপন সম্পর্কে বিবরণ"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ডিসকাউন্ট টাইপ</Label>
                  <Select value={form.discount_type} onValueChange={(v) => set("discount_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট পরিমাণ (৳)</SelectItem>
                      <SelectItem value="free_shipping">ফ্রি শিপিং</SelectItem>
                      <SelectItem value="percentage_free_shipping">শতাংশ + ফ্রি শিপিং</SelectItem>
                      <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!isFreeShipping && !isBuyXGetY && (
                  <div className="space-y-2">
                    <Label>ডিসকাউন্ট মান {isPercentage ? "(%)" : "(৳)"}</Label>
                    <Input
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => set("discount_value", e.target.value)}
                      placeholder={isPercentage ? "যেমন: 20" : "যেমন: 100"}
                      required={!isFreeShipping && !isBuyXGetY}
                    />
                  </div>
                )}
              </div>

              {isPercentage && (
                <div className="space-y-2">
                  <Label>সর্বোচ্চ ডিসকাউন্ট (৳)</Label>
                  <Input
                    type="number"
                    value={form.max_discount}
                    onChange={(e) => set("max_discount", e.target.value)}
                    placeholder="খালি রাখলে কোনো সীমা নেই"
                  />
                </div>
              )}

              {isBuyXGetY && (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                  <p className="text-sm font-medium">Buy X Get Y সেটিংস</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">কিনতে হবে (X)</Label>
                      <Input type="number" value={form.buy_x_qty} onChange={(e) => set("buy_x_qty", e.target.value)} placeholder="2" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">পাবে (Y)</Label>
                      <Input type="number" value={form.get_y_qty} onChange={(e) => set("get_y_qty", e.target.value)} placeholder="1" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">ছাড় (%)</Label>
                      <Input type="number" max={100} value={form.get_discount_percent} onChange={(e) => set("get_discount_percent", e.target.value)} placeholder="100 = ফ্রি" />
                    </div>
                  </div>
                </div>
              )}

              {/* Active toggle in General */}
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
                <Label>কুপন সক্রিয়</Label>
              </div>
            </TabsContent>

            {/* ─── RULES TAB ─── */}
            <TabsContent value="rules" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>মিনিমাম অর্ডার (৳)</Label>
                  <Input type="number" value={form.min_order_amount} onChange={(e) => set("min_order_amount", e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>সর্বোচ্চ অর্ডার (৳)</Label>
                  <Input type="number" value={form.max_order_amount} onChange={(e) => set("max_order_amount", e.target.value)} placeholder="খালি = কোনো সীমা নেই" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ন্যূনতম পণ্য সংখ্যা (কার্টে)</Label>
                <Input type="number" value={form.min_order_quantity} onChange={(e) => set("min_order_quantity", e.target.value)} placeholder="খালি = কোনো সীমা নেই" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>মেয়াদ শুরু</Label>
                  <Input type="datetime-local" value={form.valid_from} onChange={(e) => set("valid_from", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>মেয়াদ শেষ</Label>
                  <Input type="datetime-local" value={form.valid_until} onChange={(e) => set("valid_until", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>মোট ব্যবহার সীমা</Label>
                  <Input type="number" value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value)} placeholder="খালি = সীমাহীন" />
                </div>
                <div className="space-y-2">
                  <Label>প্রতি কাস্টমার সীমা</Label>
                  <Input type="number" value={form.usage_limit_per_customer} onChange={(e) => set("usage_limit_per_customer", e.target.value)} placeholder="খালি = সীমাহীন" />
                </div>
              </div>

              {coupon && (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" /> ব্যবহারের পরিসংখ্যান
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">মোট ব্যবহার:</span>
                      <span className="ml-2 font-semibold">{coupon.usage_count || 0} বার</span>
                    </div>
                    {coupon.usage_limit && (
                      <div>
                        <span className="text-muted-foreground">বাকি:</span>
                        <span className="ml-2 font-semibold text-green-600">{coupon.usage_limit - (coupon.usage_count || 0)} বার</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ─── APPLICABILITY TAB ─── */}
            <TabsContent value="applicability" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="font-medium">কোন পণ্যে প্রযোজ্য?</Label>
                <RadioGroup value={form.applicable_to} onValueChange={(v) => set("applicable_to", v)} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="app-all" />
                    <Label htmlFor="app-all">সব পণ্যে</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="categories" id="app-cats" />
                    <Label htmlFor="app-cats">নির্দিষ্ট ক্যাটাগরিতে</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="products" id="app-prods" />
                    <Label htmlFor="app-prods">নির্দিষ্ট পণ্যে</Label>
                  </div>
                </RadioGroup>
              </div>

              {form.applicable_to === "categories" && (
                <div className="space-y-2">
                  <Label>ক্যাটাগরি সিলেক্ট করুন</Label>
                  <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[60px]">
                    {form.applicable_category_ids.map((id) => {
                      const cat = (categories as any[])?.find((c: any) => c.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleMulti("applicable_category_ids", id)}>
                          {cat?.name_bn || id} <X className="h-3 w-3" />
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border rounded-md p-2">
                    {(categories as any[])?.filter((c: any) => !c.parent_id).map((cat: any) => (
                      <button key={cat.id} type="button"
                        onClick={() => toggleMulti("applicable_category_ids", cat.id)}
                        className={`text-left text-sm px-2 py-1 rounded hover:bg-muted transition-colors ${form.applicable_category_ids.includes(cat.id) ? "bg-primary text-primary-foreground" : ""}`}>
                        {cat.name_bn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.applicable_to === "products" && (
                <div className="space-y-2">
                  <Label>পণ্য সিলেক্ট করুন</Label>
                  <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[60px]">
                    {form.applicable_product_ids.map((id) => {
                      const prod = (products as any[])?.find((p: any) => p.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleMulti("applicable_product_ids", id)}>
                          {prod?.name_bn || prod?.name || id} <X className="h-3 w-3" />
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                    {(products as any[])?.map((prod: any) => (
                      <button key={prod.id} type="button"
                        onClick={() => toggleMulti("applicable_product_ids", prod.id)}
                        className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-muted transition-colors ${form.applicable_product_ids.includes(prod.id) ? "bg-primary text-primary-foreground" : ""}`}>
                        {prod.name_bn || prod.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <Label className="font-medium">বাদ দেওয়া ক্যাটাগরি</Label>
                <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[50px]">
                  {form.excluded_category_ids.map((id) => {
                    const cat = (categories as any[])?.find((c: any) => c.id === id);
                    return (
                      <Badge key={id} variant="destructive" className="gap-1 cursor-pointer" onClick={() => toggleMulti("excluded_category_ids", id)}>
                        {cat?.name_bn || id} <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border rounded-md p-2">
                  {(categories as any[])?.filter((c: any) => !c.parent_id).map((cat: any) => (
                    <button key={cat.id} type="button"
                      onClick={() => toggleMulti("excluded_category_ids", cat.id)}
                      className={`text-left text-sm px-2 py-1 rounded hover:bg-muted transition-colors ${form.excluded_category_ids.includes(cat.id) ? "bg-destructive text-destructive-foreground" : ""}`}>
                      {cat.name_bn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.apply_to_sale_items} onCheckedChange={(v) => set("apply_to_sale_items", v)} />
                <div>
                  <Label>সেল আইটেমে প্রযোজ্য</Label>
                  <p className="text-xs text-muted-foreground">বন্ধ করলে ইতিমধ্যে ডিসকাউন্টেড পণ্যে কুপন কাজ করবে না</p>
                </div>
              </div>
            </TabsContent>

            {/* ─── ADVANCED TAB ─── */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="font-medium">কার জন্য প্রযোজ্য?</Label>
                <RadioGroup value={form.customer_target} onValueChange={(v) => set("customer_target", v)} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="ct-all" />
                    <Label htmlFor="ct-all">সবার জন্য</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="new" id="ct-new" />
                    <div>
                      <Label htmlFor="ct-new">শুধু নতুন কাস্টমার</Label>
                      <p className="text-xs text-muted-foreground">যারা প্রথমবার অর্ডার করছেন</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="old" id="ct-old" />
                    <div>
                      <Label htmlFor="ct-old">শুধু পুরনো কাস্টমার</Label>
                      <p className="text-xs text-muted-foreground">যাদের আগে অন্তত ১টি অর্ডার আছে</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label className="font-medium">ভিজিবিলিটি ও ব্যবহার নিয়ন্ত্রণ</Label>

                <div className="flex items-center gap-3">
                  <Switch checked={form.is_public} onCheckedChange={(v) => set("is_public", v)} />
                  <div>
                    <Label>পাবলিক কুপন</Label>
                    <p className="text-xs text-muted-foreground">
                      {form.is_public ? "ওয়েবসাইটের অফার সেকশনে দেখাবে" : "শুধু কোড জানলেই ব্যবহার করা যাবে (প্রাইভেট)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={form.is_stackable} onCheckedChange={(v) => set("is_stackable", v)} />
                  <div>
                    <Label>অন্য কুপনের সাথে ব্যবহারযোগ্য</Label>
                    <p className="text-xs text-muted-foreground">
                      {form.is_stackable ? "একসাথে একাধিক কুপন ব্যবহার করা যাবে" : "একটি অর্ডারে শুধু এই কুপনটিই ব্যবহার করা যাবে"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
