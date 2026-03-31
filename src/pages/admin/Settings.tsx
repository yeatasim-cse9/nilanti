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
  ChevronRight,
  ShieldCheck,
  Smartphone
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
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-[2.5rem]" />
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
      bg: "bg-blue-500/10",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <Label htmlFor="store-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">স্টোরের নাম</Label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/40 group-focus-within/field:text-blue-500 transition-colors">
                  <Store className="h-full w-full" />
                </div>
                <Input
                  id="store-name"
                  className="pl-11 h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-blue-500/20"
                  value={form.store_name}
                  onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ট্যাগলাইন</Label>
              <Input
                id="tagline"
                className="h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-blue-500/20"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ফোন নম্বর</Label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/40 group-focus-within/field:text-blue-500 transition-colors">
                  <Phone className="h-full w-full" />
                </div>
                <Input
                  id="phone"
                  className="pl-11 h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-blue-500/20"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ইমেইল</Label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/40 group-focus-within/field:text-blue-500 transition-colors">
                  <Mail className="h-full w-full" />
                </div>
                <Input
                  id="email"
                  type="email"
                  className="pl-11 h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-blue-500/20"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ঠিকানা</Label>
            <div className="relative group/field">
              <div className="absolute left-4 top-4 h-4 w-4 text-blue-500/40 group-focus-within/field:text-blue-500 transition-colors">
                <MapPin className="h-full w-full" />
              </div>
              <Textarea
                id="address"
                className="pl-11 min-h-[100px] bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-blue-500/20 resize-none"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-muted/30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-blue-600" />
               </div>
               <Label className="text-xs font-black uppercase tracking-tight">স্টোর লোগো</Label>
            </div>
            <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-muted">
              <ImageUpload 
                images={form.logo ? [form.logo] : []} 
                onChange={(urls) => setForm({ ...form, logo: urls[0] || "" })}
                multiple={false}
              />
              <p className="text-[10px] font-bold text-muted-foreground mt-4 text-center uppercase tracking-widest opacity-60">P.S. Use a high-quality PNG with transparent background</p>
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
      bg: "bg-purple-500/10",
      content: (
        <div className="space-y-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="space-y-2">
              <Label htmlFor={`notification-${num}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">বার্তা {num}</Label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/40 group-focus-within/field:text-purple-500 transition-colors">
                  <Bell className="h-full w-full" />
                </div>
                <Input
                  id={`notification-${num}`}
                  className="pl-11 h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-purple-500/20 placeholder:text-muted-foreground/30"
                  placeholder="অফার বা গুরুত্বপূর্ণ ঘোষণা লিখুন..."
                  value={(form as any)[`notification_${num}`]}
                  onChange={(e) => setForm({ ...form, [`notification_${num}`]: e.target.value })}
                />
              </div>
            </div>
          ))}
          <div className="p-6 bg-purple-50/50 rounded-[2rem] border border-purple-100/50">
             <p className="text-[10px] font-medium text-purple-900/60 leading-relaxed italic">
               * এই বার্র্তাগুলো আপনার ওয়েবসাইটের সবথেকে উপরের টপ বারে স্লাইডার আকারে প্রদর্শিত হবে।
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
      bg: "bg-emerald-500/10",
      content: (
        <div className="space-y-6">
          {["facebook", "instagram", "youtube"].map((platform) => (
             <div key={platform} className="space-y-2">
                <Label htmlFor={platform} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 capitalize">{platform}</Label>
                <div className="relative group/field">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/40 group-focus-within/field:text-emerald-500 transition-colors">
                    <Globe className="h-full w-full" />
                  </div>
                  <Input
                    id={platform}
                    className="pl-11 h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-emerald-500/20"
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
      bg: "bg-orange-500/10",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hours" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">সার্ভিস টাইম</Label>
            <div className="relative group/field">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500/40 group-focus-within/field:text-orange-500 transition-colors">
                <Clock className="h-full w-full" />
              </div>
              <Input
                id="hours"
                className="pl-11 h-14 bg-white/50 border-white/60 rounded-2xl font-bold shadow-sm focus-visible:ring-orange-500/20"
                value={form.working_hours}
                onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                placeholder="প্রতিদিন সকাল ৯টা - রাত ১০টা"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100/50">
             <div className="w-12 h-12 rounded-2xl bg-white border border-orange-200 flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-6 w-6 text-orange-500" />
             </div>
             <div>
                <p className="text-xs font-black uppercase text-orange-900 tracking-tight">সাপোর্ট লেশেন্স</p>
                <p className="text-[10px] font-bold text-orange-900/40 uppercase tracking-widest">Always online for queries</p>
             </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="relative group">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
          <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-4">
            সেটিংস <Settings className="h-8 w-8 animate-[spin_4s_linear_infinite]" />
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1 opacity-60">
            Nilanti Store Configuration & Global Preferences
          </p>
        </div>
        
        <Button 
          className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-[0.1em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group"
          onClick={handleSave} 
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Checking...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Save className="h-4 w-4 group-hover:scale-120 transition-transform" />
              <span>সংরক্ষণ করুন</span>
            </div>
          )}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <Card 
            key={section.id} 
            className="border-none shadow-xl transition-all duration-500 hover:shadow-2xl group overflow-hidden rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-white/40 flex flex-col animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-primary">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg", section.bg, section.color)}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ml-13">
                    {section.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1">
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;

