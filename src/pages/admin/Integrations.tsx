import { useState, useEffect } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Truck,
  CreditCard,
  Image,
  Flame,
  BarChart3,
  Shield,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useCheckBDCourierConnection } from "@/hooks/useBDCourier";

// ─── Helper: Password-style input with show/hide ───────────────────────────
const SecretInput = ({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono text-xs"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// ─── Helper: Copy button ──────────────────────────────────────────────────
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="কপি করুন"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

// ─── Helper: Instruction box ─────────────────────────────────────────────
const InstructionBox = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 p-3 space-y-1.5">
    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium text-xs">
      <Info className="h-3.5 w-3.5" />
      কিভাবে আপডেট করবেন
    </div>
    <div className="text-xs text-blue-600/80 dark:text-blue-300/70 space-y-1 leading-relaxed">
      {children}
    </div>
  </div>
);

// ─── Helper: Status badge ────────────────────────────────────────────────
const StatusBadge = ({ configured }: { configured: boolean }) => (
  <Badge
    variant={configured ? "default" : "destructive"}
    className={`text-[10px] px-1.5 py-0 ${configured ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800" : ""}`}
  >
    {configured ? "✓ কনফিগার করা হয়েছে" : "✗ সেটআপ প্রয়োজন"}
  </Badge>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

const AdminIntegrations = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const testBDCourierConnection = useCheckBDCourierConnection();

  const [form, setForm] = useState({
    // Steadfast
    steadfast_api_key: "",
    steadfast_secret_key: "",
    steadfast_base_url: "https://portal.packzy.com/api/v1",

    // UddoktaPay
    uddoktapay_api_key: "",
    uddoktapay_base_url: "https://vibeable.paymently.io/api",

    // ImgBB
    imgbb_api_key: "",

    // Firebase
    firebase_api_key: "",
    firebase_auth_domain: "",
    firebase_project_id: "",
    firebase_storage_bucket: "",
    firebase_messaging_sender_id: "",
    firebase_app_id: "",

    // Facebook Pixel
    fb_pixel_id: "",

    // BD Courier
    bdcourier_api_key: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        steadfast_api_key: settings.steadfast_api_key || "",
        steadfast_secret_key: settings.steadfast_secret_key || "",
        steadfast_base_url: settings.steadfast_base_url || "https://portal.packzy.com/api/v1",

        uddoktapay_api_key: settings.uddoktapay_api_key || "",
        uddoktapay_base_url: settings.uddoktapay_base_url || "https://vibeable.paymently.io/api",

        imgbb_api_key: settings.imgbb_api_key || "",

        firebase_api_key: settings.firebase_api_key || "",
        firebase_auth_domain: settings.firebase_auth_domain || "",
        firebase_project_id: settings.firebase_project_id || "",
        firebase_storage_bucket: settings.firebase_storage_bucket || "",
        firebase_messaging_sender_id: settings.firebase_messaging_sender_id || "",
        firebase_app_id: settings.firebase_app_id || "",

        fb_pixel_id: settings.fb_pixel_id || "",

        bdcourier_api_key: settings.bdcourier_api_key || "",
      });
    }
  }, [settings]);

  const handleSave = async (category: string, keys: string[]) => {
    const settingsArray = keys.map((key) => ({
      key,
      value: (form as any)[key],
    }));
    try {
      await updateSettings.mutateAsync(settingsArray);
      toast.success(`${category} সেটিংস সংরক্ষিত হয়েছে`);
    } catch {
      toast.error("সংরক্ষণ করতে সমস্যা হয়েছে");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ইন্টিগ্রেশন সেটিংস</h1>
        <p className="text-muted-foreground text-sm mt-1">
          থার্ড-পার্টি সার্ভিসের API কী এবং ক্রেডেনশিয়ালস এখান থেকে ম্যানেজ করুন
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-700 dark:text-amber-300">
          <strong>গুরুত্বপূর্ণ:</strong> API কী পরিবর্তন করলে সংশ্লিষ্ট সার্ভিস সাময়িকভাবে বন্ধ হতে পারে।
          পরিবর্তনের পর অবশ্যই সার্ভিসটি কাজ করছে কিনা যাচাই করুন। কী গুলো নিরাপদ রাখুন — কারো সাথে শেয়ার করবেন না।
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courier" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="courier" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Truck className="h-3.5 w-3.5" />
            কুরিয়ার সার্ভিস
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
            <CreditCard className="h-3.5 w-3.5" />
            পেমেন্ট গেটওয়ে
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Image className="h-3.5 w-3.5" />
            মিডিয়া / স্টোরেজ
          </TabsTrigger>
          <TabsTrigger value="firebase" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
            <Flame className="h-3.5 w-3.5" />
            Firebase
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
            <BarChart3 className="h-3.5 w-3.5" />
            অ্যানালিটিক্স
          </TabsTrigger>
        </TabsList>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB: কুরিয়ার সার্ভিস (Steadfast + BD Courier) */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <TabsContent value="courier" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Steadfast Courier ── */}
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Steadfast Courier</CardTitle>
                      <CardDescription className="text-[11px]">ডেলিভারি ও শিপিং ম্যানেজমেন্ট</CardDescription>
                    </div>
                  </div>
                  <StatusBadge configured={!!form.steadfast_api_key && !!form.steadfast_secret_key} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="steadfast-api" className="text-xs">API Key</Label>
                  <SecretInput
                    id="steadfast-api"
                    value={form.steadfast_api_key}
                    onChange={(v) => setForm({ ...form, steadfast_api_key: v })}
                    placeholder="আপনার Steadfast API Key লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steadfast-secret" className="text-xs">Secret Key</Label>
                  <SecretInput
                    id="steadfast-secret"
                    value={form.steadfast_secret_key}
                    onChange={(v) => setForm({ ...form, steadfast_secret_key: v })}
                    placeholder="আপনার Steadfast Secret Key লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steadfast-url" className="text-xs">Base URL</Label>
                  <Input
                    id="steadfast-url"
                    value={form.steadfast_base_url}
                    onChange={(e) => setForm({ ...form, steadfast_base_url: e.target.value })}
                    placeholder="https://portal.packzy.com/api/v1"
                    className="font-mono text-xs"
                  />
                </div>

                <InstructionBox>
                  <p>১. <a href="https://portal.packzy.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">portal.packzy.com</a> -এ লগইন করুন</p>
                  <p>২. ড্যাশবোর্ড থেকে <strong>Settings → API</strong> -তে যান</p>
                  <p>৩. <strong>API Key</strong> ও <strong>Secret Key</strong> কপি করুন</p>
                  <p>৪. Base URL সাধারণত <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">https://portal.packzy.com/api/v1</code></p>
                  <p>৫. এই কী দিয়ে অর্ডার তৈরি, স্ট্যাটাস চেক, রিটার্ন রিকোয়েস্ট করা হয়</p>
                </InstructionBox>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSave("Steadfast", ["steadfast_api_key", "steadfast_secret_key", "steadfast_base_url"])}
                    disabled={updateSettings.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    সংরক্ষণ
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ── BD Courier ── */}
            <Card className="border-l-4 border-l-violet-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">BD Courier (Fraud Check)</CardTitle>
                      <CardDescription className="text-[11px]">কাস্টমার রিস্ক অ্যানালিসিস সার্ভিস</CardDescription>
                    </div>
                  </div>
                  <StatusBadge configured={!!form.bdcourier_api_key} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bdcourier-api" className="text-xs">API Key</Label>
                  <SecretInput
                    id="bdcourier-api"
                    value={form.bdcourier_api_key}
                    onChange={(v) => setForm({ ...form, bdcourier_api_key: v })}
                    placeholder="আপনার BD Courier API Key লিখুন"
                  />
                </div>

                <InstructionBox>
                  <p>১. <a href="https://bdcourier.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">bdcourier.com</a> -এ অ্যাকাউন্ট তৈরি / লগইন করুন</p>
                  <p>২. ড্যাশবোর্ড থেকে <strong>API Keys</strong> সেকশনে যান</p>
                  <p>৩. নতুন API Key জেনারেট করুন অথবা বিদ্যমান কী কপি করুন</p>
                  <p>৪. এই কী দিয়ে কাস্টমারের ফোন নম্বর দিয়ে কুরিয়ার ডেলিভারি হিস্ট্রি ও ফ্রড রিস্ক চেক করা হয়</p>
                  <p>৫. ফ্রড চেকে সাকসেস/ক্যান্সেল রেশিও দেখানো হয় যেটা অর্ডার অ্যাপ্রুভের সময় সাহায্য করে</p>
                </InstructionBox>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        testBDCourierConnection.mutate(undefined, {
                          onSuccess: (data) => {
                            if (data.status === "success" || data.success) {
                              toast.success("BD Courier-এর সাথে সফলভাবে কানেক্ট করা হয়েছে!");
                            } else {
                              toast.error(`কানেকশন কাজ করছে না: ${data.message || "Unknown error"}`);
                            }
                          },
                          onError: (err: any) => {
                            toast.error(`কানেকশন এরর: ${err.message}`);
                          }
                        });
                      }}
                      disabled={testBDCourierConnection.isPending}
                      className="gap-2"
                    >
                      {testBDCourierConnection.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3 text-green-500" />}
                      {testBDCourierConnection.isPending ? "চেক করা হচ্ছে..." : "কানেকশন চেক করুন"}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSave("BD Courier", ["bdcourier_api_key"])}
                    disabled={updateSettings.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    সংরক্ষণ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB: পেমেন্ট গেটওয়ে (UddoktaPay) */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <TabsContent value="payment" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-sky-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">UddoktaPay</CardTitle>
                      <CardDescription className="text-[11px]">অনলাইন পেমেন্ট গেটওয়ে (bKash, Nagad, Rocket ইত্যাদি)</CardDescription>
                    </div>
                  </div>
                  <StatusBadge configured={!!form.uddoktapay_api_key} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="uddokta-api" className="text-xs">API Key</Label>
                  <SecretInput
                    id="uddokta-api"
                    value={form.uddoktapay_api_key}
                    onChange={(v) => setForm({ ...form, uddoktapay_api_key: v })}
                    placeholder="আপনার UddoktaPay API Key লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uddokta-url" className="text-xs">Base URL</Label>
                  <Input
                    id="uddokta-url"
                    value={form.uddoktapay_base_url}
                    onChange={(e) => setForm({ ...form, uddoktapay_base_url: e.target.value })}
                    placeholder="https://vibeable.paymently.io/api"
                    className="font-mono text-xs"
                  />
                </div>

                <InstructionBox>
                  <p>১. <a href="https://uddoktapay.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">uddoktapay.com</a> -এ মার্চেন্ট অ্যাকাউন্টে লগইন করুন</p>
                  <p>২. <strong>Settings → API Keys</strong> -তে যান</p>
                  <p>৩. আপনার <strong>RT-UDDOKTAPAY-API-KEY</strong> কপি করুন</p>
                  <p>৪. Base URL আপনার প্যানেল URL অনুযায়ী সেট করুন (যেমন: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">https://vibeable.paymently.io/api</code>)</p>
                  <p>৫. এই কী দিয়ে bKash, Nagad, Rocket সহ সব মোবাইল ব্যাংকিং পেমেন্ট প্রসেস করা হয়</p>
                  <p>৬. Sandbox/Test মোডে আলাদা কী ইউজ করুন — প্রোডাকশনে Live API Key দিন</p>
                </InstructionBox>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSave("UddoktaPay", ["uddoktapay_api_key", "uddoktapay_base_url"])}
                    disabled={updateSettings.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    সংরক্ষণ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB: মিডিয়া / স্টোরেজ (ImgBB) */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <TabsContent value="media" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Image className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">ImgBB</CardTitle>
                      <CardDescription className="text-[11px]">পণ্যের ছবি আপলোড ও হোস্টিং সার্ভিস</CardDescription>
                    </div>
                  </div>
                  <StatusBadge configured={!!form.imgbb_api_key} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imgbb-api" className="text-xs">API Key</Label>
                  <SecretInput
                    id="imgbb-api"
                    value={form.imgbb_api_key}
                    onChange={(v) => setForm({ ...form, imgbb_api_key: v })}
                    placeholder="আপনার ImgBB API Key লিখুন"
                  />
                </div>

                <InstructionBox>
                  <p>১. <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">imgbb.com</a> -এ একটি ফ্রি অ্যাকাউন্ট তৈরি করুন</p>
                  <p>২. লগইন করার পর <a href="https://api.imgbb.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">api.imgbb.com</a> -এ যান</p>
                  <p>৩. <strong>"Get API Key"</strong> বাটনে ক্লিক করুন</p>
                  <p>৪. জেনারেটেড API Key কপি করুন এবং এখানে পেস্ট করুন</p>
                  <p>৫. এই কী দিয়ে পণ্যের ছবি, ব্যানার, ক্যাটাগরি ইমেজ ইত্যাদি আপলোড করা হয়</p>
                  <p>৬. ফ্রি প্ল্যানে প্রতিদিন <strong>সীমাহীন আপলোড</strong> সাপোর্ট করে</p>
                </InstructionBox>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSave("ImgBB", ["imgbb_api_key"])}
                    disabled={updateSettings.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    সংরক্ষণ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB: Firebase */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <TabsContent value="firebase" className="space-y-6 mt-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Firebase</CardTitle>
                    <CardDescription className="text-[11px]">Authentication, Firestore Database, Cloud Storage</CardDescription>
                  </div>
                </div>
                <StatusBadge configured={!!form.firebase_api_key && !!form.firebase_project_id} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fb-apikey" className="text-xs">API Key</Label>
                  <SecretInput
                    id="fb-apikey"
                    value={form.firebase_api_key}
                    onChange={(v) => setForm({ ...form, firebase_api_key: v })}
                    placeholder="AIzaSy..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-auth" className="text-xs">Auth Domain</Label>
                  <Input
                    id="fb-auth"
                    value={form.firebase_auth_domain}
                    onChange={(e) => setForm({ ...form, firebase_auth_domain: e.target.value })}
                    placeholder="your-project.firebaseapp.com"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-project" className="text-xs">Project ID</Label>
                  <Input
                    id="fb-project"
                    value={form.firebase_project_id}
                    onChange={(e) => setForm({ ...form, firebase_project_id: e.target.value })}
                    placeholder="your-project-id"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-storage" className="text-xs">Storage Bucket</Label>
                  <Input
                    id="fb-storage"
                    value={form.firebase_storage_bucket}
                    onChange={(e) => setForm({ ...form, firebase_storage_bucket: e.target.value })}
                    placeholder="your-project.appspot.com"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-sender" className="text-xs">Messaging Sender ID</Label>
                  <Input
                    id="fb-sender"
                    value={form.firebase_messaging_sender_id}
                    onChange={(e) => setForm({ ...form, firebase_messaging_sender_id: e.target.value })}
                    placeholder="123456789"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-appid" className="text-xs">App ID</Label>
                  <Input
                    id="fb-appid"
                    value={form.firebase_app_id}
                    onChange={(e) => setForm({ ...form, firebase_app_id: e.target.value })}
                    placeholder="1:123456:web:abc123"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <InstructionBox>
                <p>১. <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Firebase Console</a> -এ আপনার প্রজেক্টে যান</p>
                <p>২. <strong>Project Settings → General</strong> -এ ক্লিক করুন (⚙️ আইকন)</p>
                <p>৩. নিচে স্ক্রল করে <strong>"Your apps"</strong> সেকশনে Web App খুঁজুন</p>
                <p>৪. <strong>SDK setup and configuration → Config</strong> সিলেক্ট করুন</p>
                <p>৫. প্রদর্শিত কনফিগ অবজেক্ট থেকে সব ভ্যালু কপি করুন:</p>
                <ul className="ml-3 space-y-0.5 list-disc list-inside">
                  <li><code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">apiKey</code> → API Key</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">authDomain</code> → Auth Domain</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">projectId</code> → Project ID</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">storageBucket</code> → Storage Bucket</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">messagingSenderId</code> → Messaging Sender ID</li>
                  <li><code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-[10px]">appId</code> → App ID</li>
                </ul>
                <p className="pt-1">⚠️ <strong>সতর্কতা:</strong> Firebase কনফিগ পরিবর্তন করলে সাইটের Authentication ও Database কানেকশন বন্ধ হয়ে যাবে। শুধুমাত্র প্রজেক্ট মাইগ্রেশনের সময় পরিবর্তন করুন।</p>
              </InstructionBox>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleSave("Firebase", [
                    "firebase_api_key", "firebase_auth_domain", "firebase_project_id",
                    "firebase_storage_bucket", "firebase_messaging_sender_id", "firebase_app_id"
                  ])}
                  disabled={updateSettings.isPending}
                >
                  <Save className="h-3.5 w-3.5" />
                  সংরক্ষণ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB: অ্যানালিটিক্স (Facebook Pixel) */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Facebook / Meta Pixel</CardTitle>
                      <CardDescription className="text-[11px]">ফেসবুক অ্যাড ট্র্যাকিং ও কনভার্সন অপ্টিমাইজেশন</CardDescription>
                    </div>
                  </div>
                  <StatusBadge configured={!!form.fb_pixel_id} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pixel-id" className="text-xs">Pixel ID</Label>
                  <Input
                    id="pixel-id"
                    value={form.fb_pixel_id}
                    onChange={(e) => setForm({ ...form, fb_pixel_id: e.target.value })}
                    placeholder="আপনার Facebook Pixel ID লিখুন (যেমন: 910751078293429)"
                    className="font-mono text-xs"
                  />
                </div>

                <InstructionBox>
                  <p>১. <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline font-medium">Facebook Events Manager</a> -এ যান</p>
                  <p>২. বাম পাশে <strong>Data Sources</strong> থেকে আপনার Pixel সিলেক্ট করুন</p>
                  <p>৩. <strong>Settings</strong> ট্যাবে ক্লিক করুন</p>
                  <p>৪. <strong>"Pixel ID"</strong> কপি করুন (সাধারণত ১৫-১৬ ডিজিটের নম্বর)</p>
                  <p>৫. নতুন Pixel তৈরি করতে <strong>"+ Connect Data Sources"</strong> → <strong>"Web"</strong> সিলেক্ট করুন</p>
                  <p>৬. এই Pixel দিয়ে নিম্নলিখিত ইভেন্ট ট্র্যাক করা হয়:</p>
                  <ul className="ml-3 space-y-0.5 list-disc list-inside">
                    <li><strong>PageView</strong> — প্রতিটি পেজ ভিজিট</li>
                    <li><strong>ViewContent</strong> — পণ্য দেখা</li>
                    <li><strong>AddToCart</strong> — কার্টে যোগ করা</li>
                    <li><strong>Purchase</strong> — অর্ডার সম্পন্ন (Advanced Matching সহ)</li>
                  </ul>
                  <p className="pt-1">✨ <strong>টিপস:</strong> আপনার Pixel ID এখন সম্পূর্ণ ডায়নামিক। এটি সেভ করার সাথে সাথেই পুরো সাইটে কাজ শুরু করে দেবে।</p>
                </InstructionBox>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSave("Facebook Pixel", ["fb_pixel_id"])}
                    disabled={updateSettings.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    সংরক্ষণ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Quick Reference: Current Config ────────────────────────────── */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            ইন্টিগ্রেশন সামারি
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Steadfast", configured: !!form.steadfast_api_key && !!form.steadfast_secret_key, color: "emerald" },
              { label: "BD Courier", configured: !!form.bdcourier_api_key, color: "violet" },
              { label: "UddoktaPay", configured: !!form.uddoktapay_api_key, color: "sky" },
              { label: "ImgBB", configured: !!form.imgbb_api_key, color: "pink" },
              { label: "Firebase", configured: !!form.firebase_api_key && !!form.firebase_project_id, color: "orange" },
              { label: "FB Pixel", configured: !!form.fb_pixel_id, color: "blue" },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-lg border p-2.5 text-center transition-colors ${
                  item.configured
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                }`}
              >
                <p className="text-xs font-medium">{item.label}</p>
                <p className={`text-[10px] mt-0.5 ${item.configured ? "text-emerald-600" : "text-red-500"}`}>
                  {item.configured ? "✓ সক্রিয়" : "✗ সেটআপ নেই"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntegrations;
