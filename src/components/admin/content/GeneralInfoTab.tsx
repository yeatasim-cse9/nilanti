import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useHomepageSection, useUpdateHomepageSection, usePageContent, useUpdatePageContent } from "@/hooks/useCMSData";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useAdminData";

const GeneralInfoTab = () => {
  const { data: companyInfo, isLoading: companyLoading } = useHomepageSection("company_info");
  const { data: contactInfo, isLoading: contactLoading } = usePageContent("contact");
  const { data: siteSettings, isLoading: settingsLoading } = useSiteSettings();
  
  const updateSection = useUpdateHomepageSection();
  const updatePageContent = useUpdatePageContent();
  const updateSettings = useUpdateSiteSettings();

  const [company, setCompany] = useState<any>({});
  const [contact, setContact] = useState<any>({});
  const [social, setSocial] = useState<any>({});

  useEffect(() => {
    if ((companyInfo as any)?.content) {
      setCompany((companyInfo as any).content);
    }
  }, [companyInfo]);

  useEffect(() => {
    if ((contactInfo as any)?.content) {
      setContact((contactInfo as any).content);
    }
  }, [contactInfo]);

  useEffect(() => {
    if (siteSettings) {
      setSocial({
        facebook: siteSettings.facebook || "",
        instagram: siteSettings.instagram || "",
        youtube: siteSettings.youtube || "",
        whatsapp: siteSettings.whatsapp || "",
      });
    }
  }, [siteSettings]);

  const saveCompany = () => {
    updateSection.mutate({
      sectionId: "company_info",
      content: company,
    });
  };

  const saveContact = () => {
    updatePageContent.mutate({
      pageKey: "contact",
      content: contact,
    });
  };

  const saveSocial = () => {
    updateSettings.mutate([
      { key: "facebook", value: social.facebook },
      { key: "instagram", value: social.instagram },
      { key: "youtube", value: social.youtube },
      { key: "whatsapp", value: social.whatsapp },
    ]);
  };

  if (companyLoading || contactLoading || settingsLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>কোম্পানি তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>সংক্ষিপ্ত বিবরণ (ফুটারে দেখাবে)</Label>
            <Textarea
              value={company.short_description || ""}
              onChange={(e) => setCompany({ ...company, short_description: e.target.value })}
              rows={3}
              placeholder="কোম্পানির সংক্ষিপ্ত বিবরণ..."
            />
          </div>
          <div className="grid gap-2">
            <Label>বিস্তারিত (About পেইজে দেখাবে)</Label>
            <Textarea
              value={company.about_us || ""}
              onChange={(e) => setCompany({ ...company, about_us: e.target.value })}
              rows={5}
              placeholder="কোম্পানির বিস্তারিত তথ্য..."
            />
          </div>
          <Button onClick={saveCompany} className="gap-2">
            <Save className="h-4 w-4" />
            সংরক্ষণ করুন
          </Button>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>যোগাযোগ তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>ফোন নম্বর</Label>
              <Input
                value={contact.phone || ""}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="০১৭০০-০০০০০০"
              />
            </div>
            <div className="grid gap-2">
              <Label>ইমেইল</Label>
              <Input
                type="email"
                value={contact.email || ""}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="info@example.com"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>ঠিকানা</Label>
            <Textarea
              value={contact.address || ""}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              rows={2}
              placeholder="অফিসের ঠিকানা..."
            />
          </div>
          <div className="grid gap-2">
            <Label>হোয়াটসঅ্যাপ নম্বর</Label>
            <Input
              value={contact.whatsapp || ""}
              onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
              placeholder="০১৭০০-০০০০০০"
            />
          </div>
          <Button onClick={saveContact} className="gap-2">
            <Save className="h-4 w-4" />
            সংরক্ষণ করুন
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>সোশ্যাল মিডিয়া লিংক</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Facebook</Label>
              <Input
                value={social.facebook || ""}
                onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="grid gap-2">
              <Label>Instagram</Label>
              <Input
                value={social.instagram || ""}
                onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div className="grid gap-2">
              <Label>YouTube</Label>
              <Input
                value={social.youtube || ""}
                onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
            <div className="grid gap-2">
              <Label>WhatsApp</Label>
              <Input
                value={social.whatsapp || ""}
                onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
                placeholder="০১৭০০-০০০০০০"
              />
            </div>
          </div>
          <Button onClick={saveSocial} className="gap-2">
            <Save className="h-4 w-4" />
            সংরক্ষণ করুন
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralInfoTab;
