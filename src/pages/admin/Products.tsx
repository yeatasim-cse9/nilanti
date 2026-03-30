import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  ShoppingBag,
  AlertCircle,
  Tag,
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts, useUpdateProduct, useDeleteProduct, useCategories } from "@/hooks/useAdminData";
import { ProductDialog } from "@/components/admin/dialogs/ProductDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const categoryMap = useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc: any, cat: any) => {
      acc[cat.id] = cat.name_bn || cat.name;
      return acc;
    }, {});
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product: any) => {
      const matchesSearch = 
        product.name_bn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "active") return matchesSearch && product.is_active;
      if (activeTab === "inactive") return matchesSearch && !product.is_active;
      if (activeTab === "low_stock") return matchesSearch && product.stock_quantity <= (product.low_stock_threshold || 5);
      
      return matchesSearch;
    });
  }, [products, searchQuery, activeTab]);

  const stats = useMemo(() => {
    if (!products) return { total: 0, outOfStock: 0, featured: 0, lowStock: 0 };
    return {
      total: products.length,
      outOfStock: products.filter(p => (p.stock_quantity || 0) <= 0).length,
      featured: products.filter(p => p.is_featured).length,
      lowStock: products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 5) && (p.stock_quantity || 0) > 0).length
    };
  }, [products]);

  const handleEdit = (product: any) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    }
  };

  const handleToggle = async (id: string, field: string, value: boolean) => {
    try {
      await updateProduct.mutateAsync({ id, [field]: value });
    } catch (error) {
      toast.error("আপডেট করা যায়নি");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedProducts.length === 0) return;

    if (action === "delete") {
      if (!confirm(`আপনি কি নিশ্চিতভাবে ${selectedProducts.length}টি পণ্য মুছে ফেলতে চান?`)) return;
      
      const loadingToast = toast.loading("মুছে ফেলা হচ্ছে...");
      try {
        await Promise.all(selectedProducts.map(id => deleteProduct.mutateAsync(id)));
        toast.dismiss(loadingToast);
        toast.success("পণ্যগুলো মুছে ফেলা হয়েছে");
        setSelectedProducts([]);
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("কিছু পণ্য মুছতে সমস্যা হয়েছে");
      }
      return;
    }

    const loadingToast = toast.loading("আপডেট হচ্ছে...");
    try {
      const isActive = action === "activate";
      await Promise.all(selectedProducts.map(id => updateProduct.mutateAsync({ id, is_active: isActive })));
      toast.dismiss(loadingToast);
      toast.success("পণ্যগুলো আপডেট করা হয়েছে");
      setSelectedProducts([]);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent uppercase tracking-tight">
            পণ্য ক্যাটালগ
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-normal opacity-60">Inventory & Catalog Management</p>
        </div>
        <Button 
          className="gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full h-12 px-8 font-black uppercase text-xs tracking-normal bg-primary hover:-translate-y-1" 
          onClick={() => navigate("/admin/products/new")}
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-primary/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Total Products <ShoppingBag className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tracking-tighter">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-red-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-red-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Out of Stock <XCircle className="h-4 w-4 text-red-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600 tracking-tighter">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-amber-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-amber-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Low Stock <AlertCircle className="h-4 w-4 text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 tracking-tighter">{stats.lowStock}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-yellow-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-yellow-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Featured <Star className="h-4 w-4 text-yellow-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-yellow-600 tracking-tighter">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <TabsList className="bg-white/50 backdrop-blur p-1 rounded-full border border-white/60 h-12 h-auto flex-wrap">
            <TabsTrigger value="all" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-primary data-[state=active]:text-white transition-all">All Products</TabsTrigger>
            <TabsTrigger value="active" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-slate-500 data-[state=active]:text-white transition-all">Drafts</TabsTrigger>
            <TabsTrigger value="low_stock" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all">Low Stock</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-3">
            {selectedProducts.length > 0 && (
              <div className="animate-in slide-in-from-right-4 duration-300 flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                <span className="text-[10px] font-black text-primary uppercase tracking-normal border-r border-primary/10 pr-3 mr-1">
                  {selectedProducts.length} Selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 group text-[10px] font-black uppercase tracking-normal text-primary hover:bg-primary hover:text-white rounded-full px-4 border border-primary/20">
                      Bulk Actions <MoreHorizontal className="h-3 w-3 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-primary/10 shadow-2xl">
                    <DropdownMenuItem onClick={() => handleBulkAction("activate")} className="rounded-xl focus:bg-emerald-50 text-emerald-600 font-bold p-3">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Activate Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("deactivate")} className="rounded-xl focus:bg-slate-50 text-slate-600 font-bold p-3">
                      <XCircle className="h-4 w-4 mr-2" /> Deactivate Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-primary/5" />
                    <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="rounded-xl focus:bg-red-50 text-red-600 font-bold p-3">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="সিলেক্টেড পণ্যে খুঁজুন..."
                className="pl-11 h-12 bg-white/80 border-white/60 rounded-full text-xs font-bold shadow-sm focus-visible:ring-primary/20 pr-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 bg-primary/5 rounded flex items-center justify-center border border-primary/10">
                 <Filter className="h-2.5 w-2.5 text-primary/40" />
              </div>
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-primary/[0.02] overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[700px] no-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-12 pl-6">
                      <Checkbox 
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="rounded-md border-slate-300 data-[state=checked]:bg-primary"
                      />
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500 py-6">Product Details</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500">Category</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-normal text-slate-500">Price (৳)</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Inventory</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500 uppercase">Visibility</TableHead>
                    <TableHead className="text-right pr-6 font-black text-[10px] uppercase tracking-normal text-slate-500">Metrics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                          <ShoppingBag className="h-16 w-16 mb-6 text-primary" />
                          <h3 className="text-xl font-black text-primary uppercase tracking-tight">No products found</h3>
                          <p className="text-sm font-bold mt-2">Try adjusting your filters or search query.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product: any) => (
                      <TableRow key={product.id} className="hover:bg-slate-50/80 transition-all border-slate-50 group">
                        <TableCell className="pl-6">
                          <Checkbox 
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                            className="rounded-md border-slate-300 data-[state=checked]:bg-primary"
                          />
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-20 rounded-2xl overflow-hidden bg-slate-100 ring-4 ring-white shadow-xl flex-shrink-0 relative group-hover:ring-primary/5 transition-all">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name_bn}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                              )}
                              {product.is_featured && (
                                <div className="absolute top-1 right-1 h-3 w-3 bg-yellow-400 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-black text-primary text-base line-clamp-1 group-hover:text-accent transition-colors">{product.name_bn}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-normal flex items-center gap-1.5 opacity-60">
                                  <Tag className="w-3 h-3 text-primary/40" /> {product.sku || 'No SKU'}
                                </span>
                                {product.variants?.length > 0 && (
                                  <span className="text-[8px] font-black text-white uppercase tracking-normal bg-emerald-500/90 px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20">
                                    {product.variants.length} Variants
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/80 text-[10px] font-bold text-primary border-primary/10 shadow-sm rounded-full px-4 py-1">
                            {product.categories?.name_bn || categoryMap[product.category_id] || product.category_id || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-black text-primary text-lg tracking-tighter">৳{product.sale_price ? product.sale_price.toLocaleString() : (product.base_price || 0).toLocaleString()}</span>
                            {product.sale_price && (
                              <span className="text-[10px] text-muted-foreground/60 line-through font-bold">৳{product.base_price?.toLocaleString()}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`text-xl font-black tracking-tighter ${
                              product.stock_quantity <= 0 ? "text-red-500" : 
                              product.stock_quantity <= (product.low_stock_threshold || 5) ? "text-amber-500" : "text-primary/70"
                            }`}>
                              {product.stock_quantity || 0}
                            </span>
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                               <div 
                                 className={`h-full rounded-full ${
                                   product.stock_quantity <= 0 ? "bg-red-400" : 
                                   product.stock_quantity <= (product.low_stock_threshold || 5) ? "bg-amber-400" : "bg-emerald-400"
                                 }`} 
                                 style={{ width: `${Math.min(100, (product.stock_quantity / 50) * 100)}%` }}
                               />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-4 items-center justify-center">
                            <div className="flex items-center gap-2 group/sw transition-all">
                              <Switch
                                checked={product.is_active}
                                onCheckedChange={(v) => handleToggle(product.id, "is_active", v)}
                                className="data-[state=checked]:bg-emerald-500 scale-90"
                              />
                              <span className={`text-[8px] font-black uppercase tracking-normal ${product.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {product.is_active ? 'Online' : 'Draft'}
                              </span>
                            </div>
                             <div className="flex items-center gap-2 group/sw transition-all opacity-40 hover:opacity-100">
                              <Switch
                                checked={product.is_featured}
                                onCheckedChange={(v) => handleToggle(product.id, "is_featured", v)}
                                className="data-[state=checked]:bg-yellow-500 scale-90"
                              />
                              <Star className={`w-3 h-3 ${product.is_featured ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <div className="flex items-center justify-end gap-2">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-10 w-10 rounded-full hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-transparent hover:border-primary/10"
                               onClick={() => handleEdit(product)}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100 shadow-sm border border-transparent hover:border-slate-200">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-primary/10 shadow-2xl">
                                   <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 px-3 pb-2 pt-1">Product Menu</DropdownMenuLabel>
                                   <DropdownMenuItem onClick={() => navigate(`/product/${product.slug}`)} className="rounded-xl font-bold p-3">
                                    <Eye className="h-4 w-4 mr-2 text-primary" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(product)} className="rounded-xl font-bold p-3">
                                    <Edit className="h-4 w-4 mr-2 text-blue-500" /> Full Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-2 bg-primary/5" />
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:bg-red-50 font-bold rounded-xl p-3" 
                                    onClick={() => setDeleteId(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Remove This
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>



      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-red-600 text-2xl font-black uppercase tracking-tight">
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 font-medium py-4">
              আপনি কি নিশ্চিত যে <strong>{products?.find((p: any) => p.id === deleteId)?.name_bn}</strong> পণ্যটি ডিলিট করতে চান? এটি চিরস্থায়ীভাবে ডাটাবেজ থেকে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 bg-slate-50 p-6 -mx-6 -mb-6 rounded-b-[32px]">
            <AlertDialogCancel className="border-slate-200 h-14 rounded-2xl flex-1 font-bold text-xs uppercase tracking-normal">Cancel Action</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 h-14 rounded-2xl flex-1 font-bold text-xs uppercase tracking-normal"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;

