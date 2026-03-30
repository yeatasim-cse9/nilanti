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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBanner, useUpdateBanner } from "@/hooks/useAdminData";
import { ImageUpload } from "../ImageUpload";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: any;
}

export const BannerDialog = ({ open, onOpenChange, banner }: BannerDialogProps) => {
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    title_bn: "",
    subtitle: "",
    subtitle_bn: "",
    image_url: "",
    video_url: "",
    link_url: "",
    position: "hero",
    layout_type: "standard",
    sort_order: "0",
    is_active: true,
  });

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title || "",
        title_bn: banner.title_bn || "",
        subtitle: banner.subtitle || "",
        subtitle_bn: banner.subtitle_bn || "",
        image_url: banner.image_url || "",
        video_url: banner.video_url || "",
        link_url: banner.link_url || "",
        position: banner.position || "hero",
        layout_type: banner.layout_type || "standard",
        sort_order: banner.sort_order?.toString() || "0",
        is_active: banner.is_active ?? true,
      });
    } else {
      setForm({
        title: "",
        title_bn: "",
        subtitle: "",
        subtitle_bn: "",
        image_url: "",
        video_url: "",
        link_url: "",
        position: "hero",
        layout_type: "standard",
        sort_order: "0",
        is_active: true,
      });
    }
  }, [banner, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title: form.title || null,
      title_bn: form.title_bn || null,
      subtitle: form.subtitle || null,
      subtitle_bn: form.subtitle_bn || null,
      image_url: form.image_url,
      video_url: form.video_url || null,
      link_url: form.link_url || null,
      position: form.position,
      layout_type: form.layout_type,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (banner) {
        await updateBanner.mutateAsync({ id: banner.id, ...data });
      } else {
        await createBanner.mutateAsync(data);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{banner ? "ব্যানার এডিট করুন" : "নতুন ব্যানার"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>টাইটেল (English)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>টাইটেল (বাংলা)</Label>
              <Input
                value={form.title_bn}
                onChange={(e) => setForm({ ...form, title_bn: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>সাবটাইটেল (English)</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>সাবটাইটেল (বাংলা)</Label>
              <Input
                value={form.subtitle_bn}
                onChange={(e) => setForm({ ...form, subtitle_bn: e.target.value })}
              />
            </div>
          </div>
          <ImageUpload
            label="ছবির আপলোড *"
            images={form.image_url ? [form.image_url] : []}
            onChange={(urls) => setForm({ ...form, image_url: urls[0] || "" })}
            multiple={false}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ভিডিও URL (ঐচ্ছিক, Hero এর জন্য)</Label>
              <Input
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="যেমন: https://example.com/video.mp4"
              />
            </div>
            <div className="space-y-2">
              <Label>লিংক URL</Label>
              <Input
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>লিয়াউট টাইপ</Label>
              <Select value={form.layout_type} onValueChange={(v) => setForm({ ...form, layout_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">স্ট্যান্ডার্ড (Standard)</SelectItem>
                  <SelectItem value="split">স্প্লিট (Split View)</SelectItem>
                  <SelectItem value="video">ভিডিও (Video bg)</SelectItem>
                  <SelectItem value="bento">বেন্টো (Bento Grid)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>পজিশন</Label>
              <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">হিরো ব্যানার</SelectItem>
                  <SelectItem value="promo">প্রমো ব্যানার</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>সর্ট অর্ডার</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
            <Label>সক্রিয়</Label>
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
