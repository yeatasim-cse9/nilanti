import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Settings, 
  Box, 
  Tag as TagIcon,
  ShieldCheck,
  Percent,
  RefreshCw,
  Star,
  Info,
  X
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  useCategories, 
  useCreateProduct, 
  useUpdateProduct,
  useProducts 
} from "@/hooks/useAdminData";
import { Product, ColorVariant as FireColorVariant } from "@/types/firestore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "ইংরেজি নাম আবশ্যক"),
  name_bn: z.string().min(1, "বাংলা নাম আবশ্যক"),
  slug: z.string().min(1, "স্লাগ আবশ্যক"),
  description_bn: z.string().optional(),
  gender: z.string().optional(),
  product_type: z.string().optional(),
  fabric: z.string().optional(),
  fabric_composition: z.string().optional(),
  gsm: z.string().optional(),
  base_price: z.number().min(0, "দাম ০ বা তার বেশি হতে হবে"),
  sale_price: z.number().optional(),
  wholesale_price: z.number().optional(),
  min_wholesale_qty: z.number().optional(),
  stock_quantity: z.number().min(0).default(0),
  sku: z.string().optional(),
  weight_grams: z.number().optional(),
  low_stock_threshold: z.number().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  brand: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  pre_order: z.boolean().default(false),
  estimated_delivery: z.string().optional(),
  returnable: z.boolean().default(true),
  return_period: z.string().optional(),
  exchangeable: z.boolean().default(true),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  video_url: z.string().optional(),
  short_description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ColorVariant = FireColorVariant;

interface ProductVariant {
  color: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
}

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "Free Size"];
const FABRIC_TYPES = ["কটন", "পলিয়েস্টার", "লিনেন", "সিল্ক", "জর্জেট", "শিফন", "ডেনিম", "উল", "ভিসকোস", "মিক্সড"];
const WASH_INSTRUCTIONS = [
  "মেশিন ওয়াশ", "হ্যান্ড ওয়াশ", "ড্রাই ক্লিন ওনলি", "ঠান্ডা পানিতে ধোবেন", 
  "ব্লিচ করবেন না", "সরাসরি রোদে শুকাবেন না", "আয়রন: মাঝারি তাপ"
];

const DEFAULT_SIZE_CHART = {
  headers: ["Size", "Chest", "Length"],
  rows: [
    ["S", "38", "27"],
    ["M", "40", "28"],
    ["L", "42", "29"],
    ["XL", "44", "30"],
  ]
};

const AdminNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: categories } = useCategories();
  const { data: allProducts, isLoading: loadingProducts } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const [saving, setSaving] = useState(false);
  
  const isEditing = !!id;
  const editingProduct = allProducts?.find(p => p.id === id);
  
  // Custom States for Variants & Media
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorVariant[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeWashInstructions, setActiveWashInstructions] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [sizeChart, setSizeChart] = useState(DEFAULT_SIZE_CHART);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [frequentlyBoughtIds, setFrequentlyBoughtIds] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      name_bn: "",
      slug: "",
      description_bn: "",
      gender: "unisex",
      product_type: "",
      fabric: "",
      fabric_composition: "",
      gsm: "",
      base_price: 0,
      sale_price: undefined,
      wholesale_price: undefined,
      min_wholesale_qty: 1,
      stock_quantity: 0,
      sku: "",
      weight_grams: 0,
      low_stock_threshold: 5,
      category_id: "",
      subcategory_id: "",
      brand: "",
      is_active: true,
      is_featured: false,
      pre_order: false,
      estimated_delivery: "",
      returnable: true,
      return_period: "7",
      exchangeable: true,
      meta_title: "",
      meta_description: "",
      video_url: "",
      short_description: "",
    },
  });

  useEffect(() => {
    if (isEditing && editingProduct) {
      form.reset({
        name: editingProduct.name || "",
        name_bn: editingProduct.name_bn || "",
        slug: editingProduct.slug || "",
        description_bn: editingProduct.description_bn || "",
        gender: editingProduct.gender || "unisex",
        product_type: editingProduct.product_type || "",
        fabric: editingProduct.fabric || "",
        fabric_composition: editingProduct.fabric_composition || "",
        gsm: editingProduct.gsm || "",
        base_price: editingProduct.base_price || 0,
        sale_price: editingProduct.sale_price,
        wholesale_price: editingProduct.wholesale_price,
        min_wholesale_qty: editingProduct.min_wholesale_qty || 1,
        stock_quantity: editingProduct.stock_quantity || 0,
        sku: editingProduct.sku || "",
        weight_grams: editingProduct.weight_grams || 0,
        low_stock_threshold: editingProduct.low_stock_threshold || 5,
        category_id: editingProduct.category_id || "",
        subcategory_id: editingProduct.subcategory_id || "",
        brand: editingProduct.brand || "",
        is_active: editingProduct.is_active ?? true,
        is_featured: editingProduct.is_featured ?? false,
        pre_order: editingProduct.pre_order ?? false,
        estimated_delivery: editingProduct.estimated_delivery || "",
        returnable: editingProduct.returnable ?? true,
        return_period: editingProduct.return_period || "7",
        exchangeable: editingProduct.exchangeable ?? true,
        meta_title: editingProduct.meta_title || "",
        meta_description: editingProduct.meta_description || "",
        video_url: editingProduct.video_url || "",
        short_description: editingProduct.short_description || "",
      });

      setImages(editingProduct.images || []);
      setFeaturedImage(editingProduct.featured_image || null);
      setSelectedSizes(editingProduct.selected_sizes || []);
      setColors(editingProduct.colors || []);
      setVariants(editingProduct.variants || []);
      setTags(editingProduct.tags || []);
      setActiveWashInstructions(editingProduct.wash_instructions || []);
      setFeatures(editingProduct.features || []);
      if (editingProduct.size_chart) setSizeChart(editingProduct.size_chart);
      setRelatedProductIds(editingProduct.related_product_ids || []);
      setFrequentlyBoughtIds(editingProduct.frequently_bought_ids || []);
    }
  }, [isEditing, editingProduct, form]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const addColor = () => {
    setColors([...colors, { name: "", code: "#000000", image: "" }]);
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const generateVariants = () => {
    if (selectedSizes.length === 0 && colors.length === 0) {
      toast.error("প্রথমে সাইজ বা কালার সিলেক্ট করুন");
      return;
    }

    const newVariants: ProductVariant[] = [];
    const basePrice = form.getValues("base_price") || 0;

    if (colors.length > 0 && selectedSizes.length > 0) {
      colors.forEach(color => {
        selectedSizes.forEach(size => {
          newVariants.push({
            color: color.name || "Unknown",
            size: size,
            price: basePrice,
            stock: 0,
            sku: `${form.getValues("sku") || "SKU"}-${color.name.slice(0, 3).toUpperCase()}-${size}`
          });
        });
      });
    } else if (colors.length > 0) {
      colors.forEach(color => {
        newVariants.push({
          color: color.name || "Unknown",
          size: "N/A",
          price: basePrice,
          stock: 0,
          sku: `${form.getValues("sku") || "SKU"}-${color.name.slice(0, 3).toUpperCase()}`
        });
      });
    } else if (selectedSizes.length > 0) {
      selectedSizes.forEach(size => {
        newVariants.push({
          color: "N/A",
          size: size,
          price: basePrice,
          stock: 0,
          sku: `${form.getValues("sku") || "SKU"}-${size}`
        });
      });
    }

    setVariants(newVariants);
    toast.success(`${newVariants.length}টি ভ্যরিয়েন্ট তৈরি হয়েছে`);
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    try {
      const productData = {
        ...values,
        images,
        featured_image: featuredImage || images[0] || null,
        selected_sizes: selectedSizes,
        colors,
        variants,
        tags,
        wash_instructions: activeWashInstructions,
        features,
        size_chart: sizeChart,
        related_product_ids: relatedProductIds,
        frequently_bought_ids: frequentlyBoughtIds,
      };


      if (isEditing) {
        await updateProduct({ id, ...productData } as any);
      } else {
        await createProduct(productData as any);
      }
      
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error("পণ্য যোগ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Premium Sticky Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-2xl sticky top-0 z-[40] py-6 px-8 -mx-2 rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-2xl shadow-indigo-500/5 mb-8 transition-all duration-500">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-all duration-300" 
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/20 to-indigo-500/30 rounded-2xl blur-lg opacity-60" />
            <div className="relative p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20">
              <Box className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              {isEditing ? "পণ্য এডিট করুন" : "নতুন পণ্য যুক্ত করুন"}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Product Management Console</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/products")} 
            className="rounded-xl h-11 flex-1 sm:flex-none text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            বাতিল করুন
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="gap-2 rounded-xl h-11 px-6 sm:px-8 flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300" 
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "সেভ হচ্ছে..." : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl h-auto border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
                <TabsTrigger value="general" className="gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
                  <Box className="h-3.5 w-3.5" /> সাধারণ
                </TabsTrigger>
                <TabsTrigger value="variants" className="gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
                  <Settings className="h-3.5 w-3.5" /> ভ্যারিয়েন্ট
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
                  <ImageIcon className="h-3.5 w-3.5" /> মিডিয়া
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> অন্যান্য
                </TabsTrigger>
                <TabsTrigger value="cross-selling" className="gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
                  <Plus className="h-3.5 w-3.5" /> প্রোমোশন
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="border-white/60 dark:border-white/5 shadow-2xl shadow-indigo-500/5 rounded-[2rem] overflow-hidden bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl hover:shadow-indigo-500/10 transition-all duration-500">
                  <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border-b border-white/40 dark:border-white/5 pb-6">
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Box className="h-5 w-5 text-blue-500" />
                      </div>
                      মৌলিক তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>নাম (ইংরেজি)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Product Name in English" 
                                onChange={(e) => {
                                  field.onChange(e);
                                  form.setValue("slug", generateSlug(e.target.value));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name_bn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>নাম (বাংলা) *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="পণ্যের নাম বাংলায়" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>স্লাগ (URL) *</FormLabel>
                          <FormControl>
                            <div className="flex rounded-md shadow-sm border border-input focus-within:ring-1 focus-within:ring-ring">
                              <span className="inline-flex items-center px-3 rounded-l-md border-r bg-muted text-muted-foreground sm:text-sm">
                                desi-organic.com/p/
                              </span>
                              <Input 
                                {...field} 
                                className="border-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 w-full" 
                                placeholder="product-slug"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>টার্গেট জেন্ডার</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="জেন্ডার নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="men">পুরুষ (Men)</SelectItem>
                                <SelectItem value="women">মহিলা (Women)</SelectItem>
                                <SelectItem value="boys">ছেলেদের (Kids Boy)</SelectItem>
                                <SelectItem value="girls">মেয়েদের (Kids Girl)</SelectItem>
                                <SelectItem value="unisex">ইউনিসেক্স (Unisex)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="product_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>পণ্যের ধরন</FormLabel>
                            <Input {...field} placeholder="শার্ট, শাড়ি, পাঞ্জাবি ইত্যাদি" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>সংক্ষিপ্ত বিবরণ (বাংলা)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="এক লাইনে পণ্যের মূল বৈশিষ্ট্য..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description_bn"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>বিস্তারিত বিবরণ (বাংলা)</FormLabel>
                            <Badge variant="outline" className="text-[10px] font-normal">Rich Text Supported</Badge>
                          </div>
                          <FormControl>
                            <Textarea {...field} rows={6} placeholder="পণ্যের গুণাবলী ও বৈশিষ্ট্য লিখুন..." className="resize-none" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-semibold text-primary">ম্যাটেরিয়াল ও ফেব্রিক</CardTitle>
                    <CardDescription>কাপড়ের ধরন ও গুণমান সম্পর্কিত তথ্য</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fabric"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>কাপড়ের ধরন</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="সিলেক্ট করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FABRIC_TYPES.map(f => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gsm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GSM (কাপড়ের পুরুত্ব)</FormLabel>
                            <Input {...field} placeholder="যেমন: ১৬০, ২০০" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="fabric_composition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ফেব্রিক কম্পোজিশন</FormLabel>
                          <Input {...field} placeholder="যেমন: ৬০% কটন, ৪০% পলিয়েস্টার" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Variants Tab */}
              <TabsContent value="variants" className="space-y-6">
                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50/30 dark:from-slate-800/80 dark:to-green-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">সাইজ নির্ধারণ করুন</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_SIZES.map(size => (
                        <div 
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-5 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
                            selectedSizes.includes(size) 
                              ? "bg-gradient-to-r from-primary to-blue-600 text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                              : "bg-white dark:bg-slate-800 hover:bg-primary/5 border-slate-200 dark:border-slate-700 hover:border-primary/40"
                          }`}
                        >
                          <span className="font-black text-xs uppercase tracking-wider">{size}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-purple-50/30 dark:from-slate-800/80 dark:to-purple-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <div>
                      <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">কালার ভ্যারিয়েন্ট</CardTitle>
                      <CardDescription className="text-xs">বিভিন্ন রঙের নাম ও ছবি যোগ করুন</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addColor} className="gap-1.5 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold">
                      <Plus className="h-3.5 w-3.5" /> রঙ যোগ করুন
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {colors.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 border border-slate-200/60 dark:border-slate-700/40 rounded-xl bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-md transition-all duration-300">
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs">কালার নাম</Label>
                          <Input 
                            value={color.name} 
                            placeholder="যেমন: লাল, নেভি ব্লু"
                            onChange={(e) => {
                              const newColors = [...colors];
                              newColors[idx].name = e.target.value;
                              setColors(newColors);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">কোড</Label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={color.code}
                              className="w-10 h-10 border-none rounded cursor-pointer"
                              onChange={(e) => {
                                const newColors = [...colors];
                                newColors[idx].code = e.target.value;
                                setColors(newColors);
                              }}
                            />
                            <Input value={color.code} className="w-24 font-mono text-xs" readOnly />
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="mt-6 text-destructive"
                          onClick={() => removeColor(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {colors.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        কোন কালার যোগ করা হয়নি
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button type="button" onClick={generateVariants} className="gap-2 px-10 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300">
                    <RefreshCw className="h-4 w-4" /> ভ্যারিয়েন্ট তৈরি করুন
                  </Button>
                </div>

                {variants.length > 0 && (
                  <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/80 dark:to-indigo-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                      <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">ভ্যারিয়েন্ট ম্যাট্রিক্স</CardTitle>
                      <CardDescription className="text-xs">প্রতিটি কম্বিনেশনের জন্য আলাদা ইনভেন্টরি</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="p-2 border text-left">কম্বিনেশন</th>
                              <th className="p-2 border text-left w-24">দাম</th>
                              <th className="p-2 border text-left w-24">স্টক</th>
                              <th className="p-2 border text-left">SKU</th>
                              <th className="p-2 border text-center">মুছুন</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v, i) => (
                              <tr key={i} className="hover:bg-muted/30">
                                <td className="p-2 border">
                                  <Badge variant="outline" className="mr-1">{v.color}</Badge>
                                  <Badge variant="secondary">{v.size}</Badge>
                                </td>
                                <td className="p-2 border">
                                  <Input 
                                    type="number" 
                                    className="h-8 p-1 text-xs" 
                                    value={v.price} 
                                    onChange={(e) => {
                                      const n = [...variants];
                                      n[i].price = parseFloat(e.target.value) || 0;
                                      setVariants(n);
                                    }}
                                  />
                                </td>
                                <td className="p-2 border">
                                  <Input 
                                    type="number" 
                                    className="h-8 p-1 text-xs" 
                                    value={v.stock}
                                    onChange={(e) => {
                                      const n = [...variants];
                                      n[i].stock = parseInt(e.target.value) || 0;
                                      setVariants(n);
                                    }}
                                  />
                                </td>
                                <td className="p-2 border">
                                  <Input 
                                    className="h-8 p-1 text-xs font-mono" 
                                    value={v.sku}
                                    onChange={(e) => {
                                      const n = [...variants];
                                      n[i].sku = e.target.value;
                                      setVariants(n);
                                    }}
                                  />
                                </td>
                                <td className="p-2 border text-center">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-destructive"
                                    onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-800/80 dark:to-teal-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <div>
                      <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">সাইজ চার্ট (Size Chart)</CardTitle>
                      <CardDescription className="text-xs">পণ্যটির সঠিক মাপের তালিকা প্রদান করুন</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {sizeChart.headers.map((h, i) => (
                              <TableHead key={i} className="bg-muted/50 p-2">
                                <Input 
                                  value={h} 
                                  className="h-8 text-[10px] font-black uppercase text-center"
                                  onChange={(e) => {
                                    const newHeaders = [...sizeChart.headers];
                                    newHeaders[i] = e.target.value;
                                    setSizeChart({...sizeChart, headers: newHeaders});
                                  }}
                                />
                              </TableHead>
                            ))}
                            <TableHead className="w-10 bg-muted/50"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sizeChart.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="p-1">
                                  <Input 
                                    value={cell} 
                                    className="h-8 text-center text-xs"
                                    onChange={(e) => {
                                      const newRows = [...sizeChart.rows];
                                      newRows[rowIndex][cellIndex] = e.target.value;
                                      setSizeChart({...sizeChart, rows: newRows});
                                    }}
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="p-1 text-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => {
                                    const newRows = sizeChart.rows.filter((_, i) => i !== rowIndex);
                                    setSizeChart({...sizeChart, rows: newRows});
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full h-10 gap-2 border-t rounded-none text-xs"
                        onClick={() => {
                          const newRow = Array(sizeChart.headers.length).fill("");
                          setSizeChart({...sizeChart, rows: [...sizeChart.rows, newRow]});
                        }}
                      >
                        <Plus className="h-3 w-3" /> রো যুক্ত করুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/30 dark:from-slate-800/80 dark:to-orange-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> পণ্য গ্যালারি</CardTitle>
                    <CardDescription className="text-xs">একাধিক ছবি আপলোড করুন ও প্রধান ছবি বাছাই করুন</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ImageUpload 
                      images={images}
                      onChange={(urls) => setImages(urls)}
                      multiple={true}
                    />
                    
                    {images.length > 0 && (
                      <div className="space-y-3">
                        <Label>প্রধান ছবি বাছুন (Featured Image)</Label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {images.map((url, i) => (
                            <div 
                              key={i} 
                              onClick={() => setFeaturedImage(url)}
                              className={`relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                                featuredImage === url || (!featuredImage && i === 0) ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={url} alt={`Selection ${i}`} className="w-full h-full object-cover" />
                              {(featuredImage === url || (!featuredImage && i === 0)) && (
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground p-0.5 rounded-full">
                                  <Star className="h-3 w-3 fill-current" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <FormField
                      control={form.control}
                      name="video_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Video className="h-4 w-4" /> ভিডিও ইউটিউব/ফেসবুক লিঙ্ক (ঐচ্ছিক)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://youtube.com/watch?v=..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50/30 dark:from-slate-800/80 dark:to-cyan-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">কেয়ার ইন্সট্রাকশন</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {WASH_INSTRUCTIONS.map(item => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`wash-${item}`}
                            checked={activeWashInstructions.includes(item)}
                            onCheckedChange={(checked) => {
                              setActiveWashInstructions(prev => 
                                checked ? [...prev, item] : prev.filter(i => i !== item)
                              );
                            }}
                          />
                          <label htmlFor={`wash-${item}`} className="text-sm cursor-pointer">{item}</label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/50 pb-4">
                    <div>
                      <CardTitle className="text-lg font-semibold text-primary">হাইলাইট বৈশিষ্ট্যসমূহ (Features)</CardTitle>
                      <CardDescription>পণ্যের ১-৫টি মূল পয়েন্ট যোগ করুন</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {features.map((f, i) => (
                        <div key={i} className="flex gap-2">
                           <Input 
                            value={f} 
                            placeholder="যেমন: ১০০% পিওর সুতি কাপড়" 
                            onChange={(e) => {
                              const newFeatures = [...features];
                              newFeatures[i] = e.target.value;
                              setFeatures(newFeatures);
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0 text-destructive"
                            onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {features.length < 5 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full gap-2 border-dashed"
                          onClick={() => setFeatures([...features, ""])}
                        >
                          <Plus className="h-4 w-4" /> আরও বৈশিষ্ট্য যোগ করুন
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-rose-50/30 dark:from-slate-800/80 dark:to-rose-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">রিটার্ন ও এক্সচেঞ্জ পলিসি</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>রিটার্ন গ্রহণযোগ্য</Label>
                        <p className="text-xs text-muted-foreground italic">গ্রাহক পণ্যটি রিটার্ন করতে পারবে কি না</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="returnable"
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="return_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>রিটার্ন সময়সীমা (দিন)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="দিন নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="3">৩ দিন</SelectItem>
                                <SelectItem value="7">৭ দিন</SelectItem>
                                <SelectItem value="15">১৫ দিন</SelectItem>
                                <SelectItem value="30">৩০ দিন</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col gap-2 pt-8">
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="exchangeable"
                            render={({ field }) => (
                              <Checkbox id="exchange" checked={field.value} onCheckedChange={field.onChange} />
                            )}
                          />
                          <Label htmlFor="exchange" className="cursor-pointer">এক্সচেঞ্জ সুবিধা আছে</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-violet-50/30 dark:from-slate-800/80 dark:to-violet-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">প্রি-অর্ডার অপশন</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pre_order"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel>প্রি-অর্ডার এনাবল করুন</FormLabel>
                            <p className="text-xs text-muted-foreground">স্টক না থাকলে কাস্টমার এটি প্রি-অর্ডার করতে পারবে</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch("pre_order") && (
                      <FormField
                        control={form.control}
                        name="estimated_delivery"
                        render={({ field }) => (
                          <FormItem className="animate-in slide-in-from-top duration-300">
                            <FormLabel>আনুমানিক ডেলিভারি সময়</FormLabel>
                            <Input {...field} placeholder="যেমন: ৭-১০ কর্মদিবস" />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cross-Selling Tab */}
              <TabsContent value="cross-selling" className="space-y-6">
                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-sky-50/30 dark:from-slate-800/80 dark:to-sky-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">সম্পর্কিত পণ্য</CardTitle>
                    <CardDescription className="text-xs">এই পণ্যটির নিচে যে পণ্যগুলো দেখানো হবে</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>পণ্য নির্বাচন করুন</Label>
                          <Select onValueChange={(val) => {
                            if (val && !relatedProductIds.includes(val)) {
                              setRelatedProductIds([...relatedProductIds, val]);
                            }
                          }}>
                             <SelectTrigger>
                               <SelectValue placeholder="সব পণ্য থেকে খুঁজুন..." />
                             </SelectTrigger>
                             <SelectContent>
                               {allProducts?.filter(p => p.id !== id).map(p => (
                                 <SelectItem key={p.id} value={p.id}>{p.name_bn}</SelectItem>
                               ))}
                             </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <Label>সিলেক্টেড পণ্য ({relatedProductIds.length})</Label>
                           <div className="space-y-2">
                              {relatedProductIds.map(id => {
                                const p = allProducts?.find(item => item.id === id);
                                return (
                                  <div key={id} className="flex items-center justify-between p-2 bg-muted rounded-md text-xs">
                                     <span className="truncate">{p?.name_bn || id}</span>
                                     <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => setRelatedProductIds(relatedProductIds.filter(i => i !== id))}
                                     >
                                       <X className="h-3 w-3" />
                                     </Button>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     </div>
                  </CardContent>
                </Card>

                <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-pink-50/30 dark:from-slate-800/80 dark:to-pink-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                    <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">একত্রে কেনা প্রোডাক্ট</CardTitle>
                    <CardDescription className="text-xs">বান্ডেল ডিল হিসেবে সাজেস্ট করা হবে</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>পণ্য নির্বাচন করুন</Label>
                          <Select onValueChange={(val) => {
                            if (val && !frequentlyBoughtIds.includes(val)) {
                              setFrequentlyBoughtIds([...frequentlyBoughtIds, val]);
                            }
                          }}>
                             <SelectTrigger>
                               <SelectValue placeholder="সব পণ্য থেকে খুঁজুন..." />
                             </SelectTrigger>
                             <SelectContent>
                               {allProducts?.filter(p => p.id !== id).map(p => (
                                 <SelectItem key={p.id} value={p.id}>{p.name_bn}</SelectItem>
                               ))}
                             </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <Label>সিলেক্টেড পণ্য ({frequentlyBoughtIds.length})</Label>
                           <div className="space-y-2">
                              {frequentlyBoughtIds.map(id => {
                                const p = allProducts?.find(item => item.id === id);
                                return (
                                  <div key={id} className="flex items-center justify-between p-2 bg-muted rounded-md text-xs">
                                     <span className="truncate">{p?.name_bn || id}</span>
                                     <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => setFrequentlyBoughtIds(frequentlyBoughtIds.filter(i => i !== id))}
                                     >
                                       <X className="h-3 w-3" />
                                     </Button>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-white/60 dark:border-white/5 shadow-2xl shadow-emerald-500/5 rounded-[2rem] overflow-hidden bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl hover:shadow-emerald-500/10 transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border-b border-white/40 dark:border-white/5 pb-6">
                <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Percent className="h-5 w-5 text-emerald-500" />
                  </div>
                  মূল্য ও ইনভেন্টরি
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>নিয়মিত দাম (৳) *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সেল দাম (৳) (ঐচ্ছিক)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wholesale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>পাইকারি দাম</FormLabel>
                        <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_wholesale_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>মিন কোয়ান্টিটি</FormLabel>
                        <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)} />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>মোট স্টক</FormLabel>
                        {variants.length > 0 && <span className="text-[10px] text-primary italic">Managed by variants</span>}
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={variants.length > 0}
                          value={variants.length > 0 ? variants.reduce((acc, curr) => acc + curr.stock, 0) : field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>বেস SKU</FormLabel>
                        <Input {...field} placeholder="P-001" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight_grams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ওজন (গ্রাম)</FormLabel>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/30 dark:from-slate-800/80 dark:to-amber-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-amber-500" /> সংগঠন ও ট্যাগ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>মূল ক্যাটাগরি</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটাগরি বাছাই করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.filter((cat: any) => !cat.parent_id).map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name_bn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategory_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সাব-ক্যাটাগরি</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!form.watch("category_id")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="সাব-ক্যাটাগরি বাছাই করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories
                            ?.filter((cat: any) => cat.parent_id === form.watch("category_id"))
                            .map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name_bn}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ব্র্যান্ড / কালেকশন</FormLabel>
                      <Input {...field} placeholder="যেমন: Desi Organic, Premium" />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel>ট্যাগসমূহ</FormLabel>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map(t => (
                      <Badge key={t} variant="secondary" className="gap-1 pr-1">
                        {t} <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter(tag => tag !== t))} />
                      </Badge>
                    ))}
                  </div>
                  <Input 
                    placeholder="হিট এন্টার..." 
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !tags.includes(val)) {
                          setTags([...tags, val]);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/30 dark:from-slate-800/80 dark:to-blue-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" /> স্ট্যাটাস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>পণ্যটি চালু আছে (Active)</FormLabel>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>বিশেষ অফার (Featured)</FormLabel>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-white/50 dark:border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50/30 dark:from-slate-800/80 dark:to-purple-900/10 border-b border-slate-200/60 dark:border-slate-700/40 pb-4">
                <CardTitle className="text-base font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-center pb-1">সার্চ ইঞ্জিন (SEO)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO টাইটেল</FormLabel>
                      <Input {...field} className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO ডেসক্রিপশন</FormLabel>
                      <Textarea {...field} rows={2} className="text-xs resize-none" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminNewProduct;
