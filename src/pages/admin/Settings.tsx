import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState({
    store_name: "নীলান্তি",
    tagline: "বিশ্বস্ততার বুনন...",
    phone: "",
    email: "",
    address: "",
    notification_1: "",
    notification_2: "",
    notification_3: "",
    facebook: "",
    instagram: "",
    youtube: "",
    working_hours: "",
    logo: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || "নীলান্তি",
        tagline: settings.tagline || "বিশ্বস্ততার বুনন...",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        notification_1: settings.notification_1 || "",
        notification_2: settings.notification_2 || "",
        notification_3: settings.notification_3 || "",
        facebook: settings.facebook || "",
        instagram: settings.instagram || "",
        youtube: settings.youtube || "",
        working_hours: settings.working_hours || "",
        logo: settings.logo || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsArray = Object.entries(form).map(([key, value]) => ({
      key,
      value,
    }));
    await updateSettings.mutateAsync(settingsArray);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">সেটিংস</h1>
        <p className="text-muted-foreground">স্টোর সেটিংস পরিচালনা করুন</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle>স্টোর তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">স্টোরের নাম</Label>
              <Input
                id="store-name"
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">ট্যাগলাইন</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2 pt-2">
              <Label>স্টোর লোগো</Label>
              <ImageUpload 
                images={form.logo ? [form.logo] : []} 
                onChange={(urls) => setForm({ ...form, logo: urls[0] || "" })}
                multiple={false}
              />
              <p className="text-[10px] text-muted-foreground">পরামর্শ: পরিষ্কার ব্যাকগ্রাউন্ডের PNG ছবি ব্যবহার করুন</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Bar */}
        <Card>
          <CardHeader>
            <CardTitle>নোটিফিকেশন বার</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-1">বার্তা ১</Label>
              <Input
                id="notification-1"
                value={form.notification_1}
                onChange={(e) => setForm({ ...form, notification_1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-2">বার্তা ২</Label>
              <Input
                id="notification-2"
                value={form.notification_2}
                onChange={(e) => setForm({ ...form, notification_2: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-3">বার্তা ৩</Label>
              <Input
                id="notification-3"
                value={form.notification_3}
                onChange={(e) => setForm({ ...form, notification_3: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>সোশ্যাল লিংক</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle>কাজের সময়</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hours">সার্ভিস টাইম</Label>
              <Input
                id="hours"
                value={form.working_hours}
                onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                placeholder="প্রতিদিন সকাল ৯টা - রাত ১০টা"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave} disabled={updateSettings.isPending}>
          <Save className="h-4 w-4" />
          {updateSettings.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
