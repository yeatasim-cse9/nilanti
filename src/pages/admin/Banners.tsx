import { useState } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
import { useBanners, useUpdateBanner, useDeleteBanner } from "@/hooks/useAdminData";
import { BannerDialog } from "@/components/admin/dialogs/BannerDialog";
import { Skeleton } from "@/components/ui/skeleton";

const AdminBanners = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "hero" | "promo">("all");

  const { data: banners, isLoading } = useBanners();

  const filteredBanners = banners
    ?.filter((banner: any) => {
      if (filter === "all") return true;
      return banner.position === filter;
    })
    ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const handleEdit = (banner: any) => {
    setEditBanner(banner);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBanner.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    await updateBanner.mutateAsync({ id, is_active: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[260px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const heroBanners = banners?.filter((b: any) => b.position === "hero") || [];
  const promoBanners = banners?.filter((b: any) => b.position === "promo") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ব্যানার</h1>
          <p className="text-sm text-muted-foreground">
            হোমপেজ ব্যানার পরিচালনা করুন — হিরো: {heroBanners.length}টি, প্রোমো: {promoBanners.length}টি
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">সব</TabsTrigger>
              <TabsTrigger value="hero">হিরো</TabsTrigger>
              <TabsTrigger value="promo">প্রোমো</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="gap-2 shrink-0" onClick={() => { setEditBanner(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            নতুন ব্যানার
          </Button>
        </div>
      </div>

      {/* Banner Grid */}
      {filteredBanners?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">কোনো ব্যানার পাওয়া যায়নি</p>
            <p className="text-sm mt-1">নতুন ব্যানার যোগ করুন</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanners?.map((banner: any) => (
            <Card 
              key={banner.id} 
              className={`overflow-hidden transition-all duration-200 ${!banner.is_active ? 'opacity-60' : ''}`}
            >
              {/* Image Preview */}
              <div className="aspect-video relative bg-muted group">
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title_bn || "Banner"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}

                {/* Overlay on disabled */}
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Badge variant="secondary" className="gap-1">
                      <EyeOff className="h-3 w-3" />
                      নিষ্ক্রিয়
                    </Badge>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-8 gap-1"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    এডিট
                  </Button>
                </div>

                {/* Position Badge */}
                <div className="absolute top-2 left-2">
                  <Badge 
                    variant={banner.position === "hero" ? "default" : "secondary"}
                    className="text-[10px] font-semibold"
                  >
                    {banner.position === "hero" ? "হিরো" : "প্রোমো"}
                  </Badge>
                </div>

                {/* Sort Order */}
                {banner.sort_order !== undefined && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      #{banner.sort_order}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{banner.title_bn || banner.title || "Untitled"}</p>
                    {banner.subtitle_bn && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{banner.subtitle_bn}</p>
                    )}
                  </div>
                </div>

                {banner.link_url && (
                  <a
                    href={banner.link_url}
                    className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{banner.link_url}</span>
                  </a>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(v) => handleToggle(banner.id, v)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {banner.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(banner)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(banner.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        banner={editBanner}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ব্যানার স্থায়ীভাবে মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBanners;
