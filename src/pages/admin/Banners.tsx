import { useState } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const filteredBanners = banners?.filter((banner: any) => {
    if (filter === "all") return true;
    return banner.position === filter;
  });
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

  const getPositionBadge = (position: string) => {
    const config: Record<string, string> = {
      hero: "হিরো ব্যানার",
      promo: "প্রমো ব্যানার",
    };
    return <Badge variant="secondary">{config[position] || position}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[280px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ব্যানার</h1>
          <p className="text-muted-foreground">হোমপেজ ব্যানার পরিচালনা করুন ({filteredBanners?.length || 0}টি)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">সব ব্যানার</TabsTrigger>
              <TabsTrigger value="hero">হিরো ব্যানার</TabsTrigger>
              <TabsTrigger value="promo">প্রোমো ব্যানার</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="gap-2 shrink-0 w-full sm:w-auto" onClick={() => { setEditBanner(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            নতুন ব্যানার
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners?.map((banner: any) => (
          <div
            key={banner.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="aspect-video relative bg-muted">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title_bn || "Banner"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {!banner.is_active && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="text-white font-bold">নিষ্ক্রিয়</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-foreground">{banner.title_bn || banner.title || "Untitled"}</h3>
                {getPositionBadge(banner.position)}
              </div>
              {banner.link_url && (
                <a
                  href={banner.link_url}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  {banner.link_url}
                </a>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={(v) => handleToggle(banner.id, v)}
                  />
                  <span className="text-sm text-muted-foreground">সক্রিয়</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
