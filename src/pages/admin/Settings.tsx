import { useState, useEffect } from "react";
import { 
  Save, 
  Store, 
  Bell, 
  Share2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Settings,
  ShieldCheck,
  Smartphone,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";

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
    map_embed_url: "",
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
        map_embed_url: settings.map_embed_url || "",
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
      <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: "store-info",
      title: "স্টোর তথ্য",
      description: "Basic branding and contact details",
      icon: Store,
      color: "text-blue-600",
      bg: "bg-blue-50",
      borderColor: "border-blue-200",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store-name" className="text-xs font-medium text-muted-foreground">স্টোরের নাম</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="store-name"
                  className="pl-10 h-10"
                  value={form.store_name}
                  onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-xs font-medium text-muted-foreground">ট্যাগলাইন</Label>
              <Input
                id="tagline"
                className="h-10"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">ফোন নম্বর</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10 h-10"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10 h-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">ঠিকানা</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                className="pl-10 min-h-[80px] resize-none"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Label className="text-xs font-medium">স্টোর লোগো</Label>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl border border-dashed">
              <ImageUpload 
                images={form.logo ? [form.logo] : []} 
                onChange={(urls) => setForm({ ...form, logo: urls[0] || "" })}
                multiple={false}
              />
              <p className="text-[10px] text-muted-foreground mt-3 text-center">PNG with transparent background recommended</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "notifications",
      title: "নোটিফিকেশন বার",
      description: "App-wide promotional messages",
      icon: Bell,
      color: "text-purple-600",
      bg: "bg-purple-50",
      borderColor: "border-purple-200",
      content: (
        <div className="space-y-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="space-y-2">
              <Label htmlFor={`notification-${num}`} className="text-xs font-medium text-muted-foreground">বার্তা {num}</Label>
              <div className="relative">
                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={`notification-${num}`}
                  className="pl-10 h-10"
                  placeholder="অফার বা গুরুত্বপূর্ণ ঘোষণা লিখুন..."
                  value={(form as any)[`notification_${num}`]}
                  onChange={(e) => setForm({ ...form, [`notification_${num}`]: e.target.value })}
                />
              </div>
            </div>
          ))}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-xs text-purple-700 leading-relaxed">
              * এই বার্তাগুলো আপনার ওয়েবসাইটের সবথেকে উপরের টপ বারে স্লাইডার আকারে প্রদর্শিত হবে।
            </p>
          </div>
        </div>
      )
    },
    {
      id: "social",
      title: "সোশ্যাল লিংক",
      description: "Connect your store social profiles",
      icon: Share2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      content: (
        <div className="space-y-4">
          {["facebook", "instagram", "youtube"].map((platform) => (
            <div key={platform} className="space-y-2">
              <Label htmlFor={platform} className="text-xs font-medium text-muted-foreground capitalize">{platform}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={platform}
                  className="pl-10 h-10"
                  value={(form as any)[platform]}
                  onChange={(e) => setForm({ ...form, [platform]: e.target.value })}
                  placeholder={`https://${platform}.com/yourstore`}
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "operating",
      title: "কাজের সময়",
      description: "Customer service operating hours",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
      borderColor: "border-orange-200",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours" className="text-xs font-medium text-muted-foreground">সার্ভিস টাইম</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="hours"
                className="pl-10 h-10"
                value={form.working_hours}
                onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                placeholder="প্রতিদিন সকাল ৯টা - রাত ১০টা"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="p-2 rounded-lg bg-white border border-orange-200">
              <ShieldCheck className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-800">সাপোর্ট সেশন</p>
              <p className="text-xs text-orange-600">Always online for queries</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "map-location",
      title: "ম্যাপ লোকেশন",
      description: "Google Maps embed for Contact page",
      icon: Map,
      color: "text-rose-600",
      bg: "bg-rose-50",
      borderColor: "border-rose-200",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="map-url" className="text-xs font-medium text-muted-foreground">Google Maps Embed URL</Label>
            <div className="relative">
              <Map className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="map-url"
                className="pl-10 min-h-[80px] resize-none text-xs"
                value={form.map_embed_url}
                onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 space-y-2">
            <p className="text-xs font-semibold text-rose-800">কিভাবে পাবেন:</p>
            <ol className="text-xs text-rose-700 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Google Maps এ আপনার লোকেশন সার্চ করুন</li>
              <li>"Share" → "Embed a map" ট্যাব নির্বাচন করুন</li>
              <li>"COPY HTML" এ ক্লিক করুন</li>
              <li>কোড থেকে <code className="bg-rose-100 px-1 py-0.5 rounded font-mono text-[11px]">src="..."</code> এর URL পেস্ট করুন</li>
            </ol>
            {form.map_embed_url && (
              <div className="mt-3 rounded-lg overflow-hidden border border-rose-200 h-[160px]">
                <iframe
                  src={form.map_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Map Preview"
                />
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            সেটিংস
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            স্টোর কনফিগারেশন ও প্রেফারেন্স
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={updateSettings.isPending}
          className="gap-2"
        >
          {updateSettings.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              সংরক্ষণ হচ্ছে...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.id} className={cn("border", section.borderColor)}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", section.bg)}>
                  <section.icon className={cn("h-5 w-5", section.color)} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{section.title}</CardTitle>
                  <CardDescription className="text-xs">{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
