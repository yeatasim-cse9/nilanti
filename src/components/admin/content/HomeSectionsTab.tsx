import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Save, Plus, Trash2, Edit, LayoutGrid, LayoutList, Image as ImageIcon } from "lucide-react";
import { 
  useHomepageSections, 
  useUpdateHomepageSection, 
  useCreateHomepageSection,
  useDeleteHomepageSection,
  useUpdateHomepageOrder,
  useTestimonials, 
  useCreateTestimonial, 
  useUpdateTestimonial, 
  useDeleteTestimonial 
} from "@/hooks/useCMSData";
import { 
  useBanners, 
  useCreateBanner, 
  useUpdateBanner, 
  useDeleteBanner 
} from "@/hooks/useAdminData";
import TestimonialDialog from "../dialogs/TestimonialDialog";
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

const HomeSectionsTab = () => {
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials();
  const { data: banners, isLoading: bannersLoading } = useBanners();
  
  const updateSection = useUpdateHomepageSection();
  const updateOrder = useUpdateHomepageOrder();
  const deleteTestimonial = useDeleteTestimonial();
  
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSection, setNewSection] = useState({ id: "", title_bn: "", is_active: true });
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [editedSections, setEditedSections] = useState<Record<string, any>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTestimonial, setEditTestimonial] = useState<any>(null);
  const [testimonialDialog, setTestimonialDialog] = useState(false);

  const createSection = useCreateHomepageSection();
  const deleteSection = useDeleteHomepageSection();

  const setSection = (id: string, updates: any) => {
    setEditedSections((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || sections?.find(s => s.id === id) || {}), ...updates }
    }));
  };

  const getSection = (id: string) => {
    return editedSections[id] || sections?.find(s => s.id === id);
  };

  const saveSection = (id: string) => {
    const data = editedSections[id];
    if (data) {
      updateSection.mutate({ sectionId: id, ...data });
    }
  };

  const handleAddSection = () => {
    if (!newSection.id) return;
    const formattedId = newSection.id.trim().toLowerCase().replace(/\s+/g, "_");
    createSection.mutate({ ...newSection, id: formattedId }, {
      onSuccess: () => {
        setIsAddingSection(false);
        setNewSection({ id: "", title_bn: "", is_active: true });
      }
    });
  };

  const handleDeleteSection = (id: string) => {
    deleteSection.mutate(id);
    setSectionToDelete(null);
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination || !sections) return;

    const items = Array.from(sections as any[]).sort((a, b) => (a.order || 999) - (b.order || 999));
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedOrders = items.map((item, index) => ({
      id: item.id,
      order: index + 1
    }));

    updateOrder.mutate(updatedOrders);
  };

  if (sectionsLoading || testimonialsLoading || bannersLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-bold">হোমপেজ সেকশনসমূহ</h3>
        <Button onClick={() => setIsAddingSection(true)} variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          নতুন সেকশন যোগ করুন
        </Button>
      </div>

      {isAddingSection && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">নতুন সেকশন যোগ করুন</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>সেকশন আইডি (Unique ID)</Label>
                <Input
                  value={newSection.id}
                  onChange={(e) => setNewSection({ ...newSection, id: e.target.value })}
                  placeholder="e.g. flash_sale, featured_products"
                />
              </div>
              <div className="grid gap-2">
                <Label>সেকশন টাইটেল (বাংলা)</Label>
                <Input
                  value={newSection.title_bn}
                  onChange={(e) => setNewSection({ ...newSection, title_bn: e.target.value })}
                  placeholder="যেমন: বিশেষ অফার"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddingSection(false)}>বাতিল</Button>
              <Button onClick={handleAddSection}>সংরক্ষণ করুন</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
        {["hero_banner", "promotional_banners"].map(bannerId => {
          const banner = (sections as any[])?.find(s => s.id === bannerId);
          if (!banner) return null;
          return (
            <Card key={bannerId} className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{banner.title_bn || banner.id}</p>
                    <p className="text-xs text-muted-foreground uppercase">{banner.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-xs font-bold text-muted-foreground">{banner.is_active ? 'ACTIVE' : 'INACTIVE'}</Label>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={(v) => updateSection.mutate({ sectionId: bannerId, is_active: v })}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <LayoutList className="h-4 w-4" />
          হোমপেজ সেকশন অর্ডার (ড্রাগ করে সাজান)
        </h3>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="homepage-sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {(sections as any[])?.sort((a, b) => (a.order || 999) - (b.order || 999)).map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="group"
                    >
                      <Accordion type="single" collapsible className="bg-card rounded-lg border shadow-sm overflow-hidden hover:border-primary/30 transition-all">
                        <AccordionItem key={section.id} value={section.id} className="border-none">
                          <div className="flex items-center w-full">
                            <div {...provided.dragHandleProps} className="px-3 py-4 text-muted-foreground hover:text-primary cursor-grab active:cursor-grabbing border-r bg-muted/30">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <AccordionTrigger className="px-4 py-4 hover:no-underline flex-1 py-3 text-left">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${section.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-semibold text-foreground/90">{section.title_bn || section.id}</span>
                  <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded leading-none">ID: {section.id}</span>
                </div>
              </AccordionTrigger>
              <div className="px-4 flex items-center gap-2">
                <Switch
                  checked={editedSections[section.id]?.is_active ?? section.is_active}
                  onCheckedChange={(v) => {
                    setSection(section.id, { is_active: v });
                    updateSection.mutate({ sectionId: section.id, is_active: v });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8 hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSectionToDelete(section.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AccordionContent className="px-4 pb-4 pt-2 border-t bg-muted/20">
              <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
                {/* Title and Subtitle for all sections */}
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">শিরোনাম (বাংলা)</Label>
                  <Input
                    value={getSection(section.id)?.title_bn || ""}
                    onChange={(e) => setSection(section.id, { title_bn: e.target.value })}
                    className="bg-card"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">উপ-শিরোনাম (বাংলা)</Label>
                  <Input
                    value={getSection(section.id)?.subtitle_bn || ""}
                    onChange={(e) => setSection(section.id, { subtitle_bn: e.target.value })}
                    className="bg-card"
                  />
                </div>

                {/* Announcement Bar specific fields */}
                {section.id === 'announcement_bar' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-primary/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">ঘোষণা টেক্সট</Label>
                      <Input
                        value={getSection(section.id)?.text_bn || ""}
                        onChange={(e) => setSection(section.id, { text_bn: e.target.value })}
                        className="bg-card"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">ব্যাকগ্রাউন্ড কালার</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="h-9 w-12 p-1 bg-card"
                            value={getSection(section.id)?.bg_color || "#16a34a"}
                            onChange={(e) => setSection(section.id, { bg_color: e.target.value })}
                          />
                          <Input
                            value={getSection(section.id)?.bg_color || "#16a34a"}
                            onChange={(e) => setSection(section.id, { bg_color: e.target.value })}
                            className="bg-card flex-1 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">টেক্সট কালার</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="h-9 w-12 p-1 bg-card"
                            value={getSection(section.id)?.text_color || "#ffffff"}
                            onChange={(e) => setSection(section.id, { text_color: e.target.value })}
                          />
                          <Input
                            value={getSection(section.id)?.text_color || "#ffffff"}
                            onChange={(e) => setSection(section.id, { text_color: e.target.value })}
                            className="bg-card flex-1 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner Management (Hero & Promo) */}
                {(section.id === 'hero_banner' || section.id === 'promotional_banners') && (
                  <div className="space-y-4 border rounded-lg p-4 bg-accent/5">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">ব্যানার লিস্ট</Label>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-1"
                        onClick={() => {
                          const position = section.id === 'hero_banner' ? 'hero' : 'promo';
                          createBanner.mutate({
                            title_bn: "নতুন ব্যানার",
                            subtitle_bn: "সাবটাইটেল এখানে",
                            image_url: "",
                            link_url: "",
                            position: position,
                            is_active: true,
                            sort_order: ((banners as any[])?.filter((b: any) => b.position === position).length || 0) + 1
                          });
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        ব্যানার যোগ করুন
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 mt-2">
                      {(banners as any[])?.filter(b => b.position === (section.id === 'hero_banner' ? 'hero' : 'promo')).map((banner) => (
                        <Card key={banner.id} className="bg-card border-muted-foreground/10 group/banner">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold">শিরোনাম (বাংলা)</Label>
                                  <Input 
                                    className="h-8 text-sm"
                                    value={banner.title_bn || ""} 
                                    onChange={(e) => updateBanner.mutate({ id: banner.id, title_bn: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold">সাবটাইটেল (বাংলা)</Label>
                                  <Input 
                                    className="h-8 text-sm"
                                    value={banner.subtitle_bn || ""} 
                                    onChange={(e) => updateBanner.mutate({ id: banner.id, subtitle_bn: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold">ইমেজ ইউআরএল</Label>
                                  <Input 
                                    className="h-8 text-sm"
                                    value={banner.image_url || ""} 
                                    onChange={(e) => updateBanner.mutate({ id: banner.id, image_url: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold">লিংক ইউআরএল</Label>
                                  <Input 
                                    className="h-8 text-sm"
                                    value={banner.link_url || ""} 
                                    onChange={(e) => updateBanner.mutate({ id: banner.id, link_url: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Switch 
                                  checked={banner.is_active} 
                                  onCheckedChange={(v) => updateBanner.mutate({ id: banner.id, is_active: v })}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive opacity-0 group-hover/banner:opacity-100 transition-opacity"
                                  onClick={() => deleteBanner.mutate(banner.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Money Back Guarantee settings */}
                {section.id === 'money_back_guarantee' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-primary/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বিবরণ (বাংলা)</Label>
                      <Input
                        value={getSection(section.id)?.content?.description_bn || ""}
                        onChange={(e) => {
                          const content = { ...(getSection(section.id)?.content || {}), description_bn: e.target.value };
                          setSection(section.id, { content });
                        }}
                        className="bg-card"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বাটন লিংক</Label>
                      <Input
                        value={getSection(section.id)?.content?.primary_button_link || ""}
                        onChange={(e) => {
                          const content = { ...(getSection(section.id)?.content || {}), primary_button_link: e.target.value };
                          setSection(section.id, { content });
                        }}
                        className="bg-card"
                      />
                    </div>
                  </div>
                )}

                {/* Categories Slider settings */}
                {section.id === 'categories_slider' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-primary/5">
                    <p className="text-xs text-muted-foreground italic">এই সেকশনে শুধুমাত্র শিরোনাম পরিবর্তন করা যাবে। ক্যাটাগরিগুলো 'ক্যাটাগরি' মেনু থেকে ম্যানেজ করুন।</p>
                  </div>
                )}

                {/* Flash Sale settings */}
                {section.id === 'flash_sale' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-orange-500/5">
                    <p className="text-xs text-muted-foreground italic">পণ্যগুলো 'প্রোডাক্টস' মেনু থেকে 'Flash Sale' অপশন অন করে ম্যানেজ করুন। এখানে শুধুমাত্র শিরোনাম পরিবর্তন করা যাবে।</p>
                  </div>
                )}

                {/* Featured Products settings */}
                {section.id === 'featured_products' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-500/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">শিরোনাম (বাংলা)</Label>
                      <Input
                        value={getSection(section.id)?.title_bn || ""}
                        onChange={(e) => setSection(section.id, { title_bn: e.target.value })}
                        className="bg-card"
                        placeholder="e.g. বিশেষ আকর্ষণ"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2">পণ্যগুলো 'প্রোডাক্টস' মেনু থেকে 'Featured' অপশন অন করে ম্যানেজ করুন।</p>
                  </div>
                )}

                {/* Promotional Banners settings */}
                {section.id === 'promotional_banners' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-purple-500/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">শিরোনাম (বাংলা)</Label>
                      <Input
                        value={getSection(section.id)?.title_bn || ""}
                        onChange={(e) => setSection(section.id, { title_bn: e.target.value })}
                        className="bg-card"
                        placeholder="e.g. নতুন কালেকশন"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বিবরণ (বাংলা)</Label>
                      <Textarea
                        value={getSection(section.id)?.subtitle_bn || ""}
                        onChange={(e) => setSection(section.id, { subtitle_bn: e.target.value })}
                        className="bg-card min-h-[100px]"
                        placeholder="আপনার কালেকশন সম্পর্কে কিছু লিখুন..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2">ব্যানারগুলো 'ব্যানার' মেনু থেকে 'Position: promo' সেট করে ম্যানেজ করুন।</p>
                  </div>
                )}

                {/* Newsletter settings */}
                {section.id.toLowerCase() === 'newsletter' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-yellow-500/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">শিরোনাম (বাংলা)</Label>
                      <Input
                        value={getSection(section.id)?.title_bn || ""}
                        onChange={(e) => setSection(section.id, { title_bn: e.target.value })}
                        className="bg-card"
                        placeholder="e.g. অফারের খবর পেতে চান?"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বিবরণ (বাংলা)</Label>
                      <Textarea
                        value={getSection(section.id)?.subtitle_bn || ""}
                        onChange={(e) => setSection(section.id, { subtitle_bn: e.target.value })}
                        className="bg-card min-h-[100px]"
                        placeholder="সাবস্ক্রাইব করার জন্য একটি আকর্ষণীয় লেখা লিখুন..."
                      />
                    </div>
                  </div>
                )}

                {/* All Products settings */}
                {section.id === 'all_products' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-emerald-500/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বিবরণ (বাংলা)</Label>
                      <Input
                        value={getSection(section.id)?.content?.description_bn || ""}
                        onChange={(e) => {
                          const content = { ...(getSection(section.id)?.content || {}), description_bn: e.target.value };
                          setSection(section.id, { content });
                        }}
                        className="bg-card"
                      />
                    </div>
                  </div>
                )}

                {/* Customer Reviews settings */}
                {section.id === 'customer_reviews' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-yellow-500/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বিবরণ (বাংলা)</Label>
                      <Textarea
                        value={getSection(section.id)?.content?.description_bn || ""}
                        onChange={(e) => {
                          const content = { ...(getSection(section.id)?.content || {}), description_bn: e.target.value };
                          setSection(section.id, { content });
                        }}
                        className="bg-card min-h-[80px]"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2">রিভিউগুলো নিচের 'রিভিউ ম্যানেজমেন্ট' সেকশন থেকে যোগ বা পরিবর্তন করুন।</p>
                  </div>
                )}

                {/* Instagram Feed settings */}
                {section.id === 'instagram_feed' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-rose-500/5">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">ইন্সটাগ্রাম প্রোফাইল লিংক</Label>
                      <Input
                        value={getSection(section.id)?.link_url || ""}
                        onChange={(e) => setSection(section.id, { link_url: e.target.value })}
                        className="bg-card"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">ইন্সটাগ্রাম ইউজারনেম (যেমন: @desiorganic)</Label>
                      <Input
                        value={getSection(section.id)?.content?.username || ""}
                        onChange={(e) => {
                          const content = { ...(getSection(section.id)?.content || {}), username: e.target.value };
                          setSection(section.id, { content });
                        }}
                        placeholder="@username"
                        className="bg-card"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">সাবটাইটেল (বাংলা)</Label>
                      <Input
                        value={getSection(section.id)?.subtitle_bn || ""}
                        onChange={(e) => setSection(section.id, { subtitle_bn: e.target.value })}
                        placeholder="আমাদের লেটেস্ট কালেকশন এবং..."
                        className="bg-card"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider font-bengali">ইন্সটাগ্রাম ফিড ইমেজ (৫টি রিকমেন্ডেড)</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            const current = getSection(section.id)?.content?.posts || [];
                            setSection(section.id, { content: { ...(getSection(section.id)?.content || {}), posts: [...current, { image: "", link: "" }] } });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          যোগ করুন
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {(getSection(section.id)?.content?.posts || []).map((post: any, idx: number) => (
                          <div key={idx} className="flex gap-2 group/post">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder={`ইমেজ ইউআরএল ${idx + 1}`}
                                value={post.image || ""}
                                onChange={(e) => {
                                  const posts = [...(getSection(section.id)?.content?.posts || [])];
                                  posts[idx] = { ...posts[idx], image: e.target.value };
                                  setSection(section.id, { content: { ...(getSection(section.id)?.content || {}), posts } });
                                }}
                                className="bg-card text-xs h-9"
                              />
                              <Input
                                placeholder={`লিংক ${idx + 1} (ঐচ্ছিক)`}
                                value={post.link || ""}
                                onChange={(e) => {
                                  const posts = [...(getSection(section.id)?.content?.posts || [])];
                                  posts[idx] = { ...posts[idx], link: e.target.value };
                                  setSection(section.id, { content: { ...(getSection(section.id)?.content || {}), posts } });
                                }}
                                className="bg-card text-xs h-8"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-9 w-9 shrink-0 self-start opacity-0 group-hover/post:opacity-100 transition-opacity"
                              onClick={() => {
                                const posts = [...(getSection(section.id)?.content?.posts || [])];
                                posts.splice(idx, 1);
                                setSection(section.id, { content: { ...(getSection(section.id)?.content || {}), posts } });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                {/* Why Choose Us settings */}
                {section.id === 'why_choose_us' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">পার্থক্যসমূহ</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const current = Array.isArray(getSection(section.id)?.content) ? getSection(section.id)?.content : [];
                          setSection(section.id, { content: [...current, { feature: "", others: "", us: "" }] });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        যোগ করুন
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {(Array.isArray(getSection(section.id)?.content) ? getSection(section.id)?.content : []).map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 group/item border rounded p-2 bg-card relative">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="বৈশিষ্ট্য (যেমন: কাপড়ের মান)"
                              value={item.feature || ""}
                              onChange={(e) => {
                                const arr = [...(getSection(section.id)?.content || [])];
                                arr[idx] = { ...arr[idx], feature: e.target.value };
                                setSection(section.id, { content: arr });
                              }}
                              className="bg-card text-xs h-8"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="অন্যান্য (যেমন: সাধারণ কাপড়)"
                                value={item.others || ""}
                                onChange={(e) => {
                                  const arr = [...(getSection(section.id)?.content || [])];
                                  arr[idx] = { ...arr[idx], others: e.target.value };
                                  setSection(section.id, { content: arr });
                                }}
                                className="bg-destructive/10 text-xs h-8"
                              />
                              <Input
                                placeholder="আমরা (যেমন: ১০০% প্রিমিয়াম)"
                                value={item.us || ""}
                                onChange={(e) => {
                                  const arr = [...(getSection(section.id)?.content || [])];
                                  arr[idx] = { ...arr[idx], us: e.target.value };
                                  setSection(section.id, { content: arr });
                                }}
                                className="bg-primary/10 text-xs h-8"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8 self-center"
                            onClick={() => {
                              const arr = [...(getSection(section.id)?.content || [])];
                              arr.splice(idx, 1);
                              setSection(section.id, { content: arr });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits settings */}
                {section.id === 'benefits' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-primary/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">সাবটাইটেল (বাংলা)</Label>
                        <Input
                          value={getSection(section.id)?.subtitle_bn || ""}
                          onChange={(e) => setSection(section.id, { subtitle_bn: e.target.value })}
                          className="h-8 mt-1"
                          placeholder="e.g. আমাদের সার্ভিস"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">শিরোনাম (বাংলা)</Label>
                        <Input
                          value={getSection(section.id)?.title_bn || ""}
                          onChange={(e) => setSection(section.id, { title_bn: e.target.value })}
                          className="h-8 mt-1"
                          placeholder="e.g. আপনার কেনাকাটা হোক সহজ ও আনন্দদায়ক"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">বিবরণ (বাংলা)</Label>
                        <Input
                          value={getSection(section.id)?.description_bn || ""}
                          onChange={(e) => setSection(section.id, { description_bn: e.target.value })}
                          className="h-8 mt-1"
                          placeholder="e.g. সেরা পণ্যের পাশাপাশি আমরা নিশ্চিত করি সেরা গ্রাহক সেবা।"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">সুবিধাসমূহ</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const current = Array.isArray(getSection(section.id)?.content) ? getSection(section.id)?.content : [];
                          setSection(section.id, { content: [...current, { icon: "Check", title: "", description: "" }] });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        যোগ করুন
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(Array.isArray(getSection(section.id)?.content) ? getSection(section.id)?.content : []).map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 border rounded p-2 bg-card">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="আইকন নাম (e.g. Truck, Shield)"
                              value={item.icon || ""}
                              onChange={(e) => {
                                const arr = [...(getSection(section.id)?.content || [])];
                                arr[idx] = { ...arr[idx], icon: e.target.value };
                                setSection(section.id, { content: arr });
                              }}
                              className="bg-card text-xs h-8"
                            />
                            <Input
                              placeholder="শিরোনাম"
                              value={item.title || ""}
                              onChange={(e) => {
                                const arr = [...(getSection(section.id)?.content || [])];
                                arr[idx] = { ...arr[idx], title: e.target.value };
                                setSection(section.id, { content: arr });
                              }}
                              className="bg-card text-xs h-8"
                            />
                            <Input
                              placeholder="বিবরণ"
                              value={item.description || ""}
                              onChange={(e) => {
                                const arr = [...(getSection(section.id)?.content || [])];
                                arr[idx] = { ...arr[idx], description: e.target.value };
                                setSection(section.id, { content: arr });
                              }}
                              className="bg-card text-xs h-8"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8 self-center"
                            onClick={() => {
                              const arr = [...(getSection(section.id)?.content || [])];
                              arr.splice(idx, 1);
                              setSection(section.id, { content: arr });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-dashed h-10 hover:border-rose-500 hover:bg-rose-500/5 transition-all text-xs"
                          onClick={() => {
                            const posts = [...(getSection(section.id)?.content?.posts || []), { image: "", link: "#" }];
                            setSection(section.id, { content: { ...(getSection(section.id)?.content || {}), posts } });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          নতুন ইমেজ যোগ করুন
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits / Content List management */}
                {(section.id === 'benefits' || section.id === 'why_choose_us') && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">কনটেন্ট আইটেম সমূহ</Label>
                    <div className="grid gap-3">
                      {(getSection(section.id)?.content || []).map((item: any, idx: number) => (
                        <Card key={idx} className="border-muted shadow-none bg-card hover:border-primary/20 transition-colors">
                          <CardContent className="p-4 space-y-3">
                            {section.id === 'benefits' ? (
                              <>
                                  <div className="grid grid-cols-2 gap-3">
                                   <div className="space-y-1">
                                     <Label className="text-[10px] font-bold text-muted-foreground">আইকন নাম অথবা ইমেজ ইউআরএল (যেমন: http...)</Label>
                                     <Input
                                       placeholder="Leaf, Truck অথবা http://..."
                                       value={item.icon || ""}
                                       onChange={(e) => {
                                         const content = [...(getSection(section.id)?.content || [])];
                                         content[idx] = { ...content[idx], icon: e.target.value };
                                         setSection(section.id, { content });
                                       }}
                                     />
                                   </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground">শিরোনাম</Label>
                                    <Input
                                      placeholder="আইটেম টাইটেল"
                                      value={item.title || ""}
                                      onChange={(e) => {
                                        const content = [...(getSection(section.id)?.content || [])];
                                        content[idx] = { ...content[idx], title: e.target.value };
                                        setSection(section.id, { content });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold text-muted-foreground">বিবরণ</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="সংক্ষিপ্ত বিবরণ"
                                      value={item.description || ""}
                                      onChange={(e) => {
                                        const content = [...(getSection(section.id)?.content || [])];
                                        content[idx] = { ...content[idx], description: e.target.value };
                                        setSection(section.id, { content });
                                      }}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive shrink-0 h-9 w-9 hover:bg-destructive/10"
                                      onClick={() => {
                                        const content = [...(getSection(section.id)?.content || [])];
                                        content.splice(idx, 1);
                                        setSection(section.id, { content });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="grid grid-cols-4 gap-2 items-end">
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold text-muted-foreground">পয়েন্ট</Label>
                                  <Input
                                    value={item.feature || ""}
                                    onChange={(e) => {
                                      const content = [...(getSection(section.id)?.content || [])];
                                      content[idx] = { ...content[idx], feature: e.target.value };
                                      setSection(section.id, { content });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold text-muted-foreground">অন্যরা</Label>
                                  <Input
                                    value={item.others || ""}
                                    onChange={(e) => {
                                      const content = [...(getSection(section.id)?.content || [])];
                                      content[idx] = { ...content[idx], others: e.target.value };
                                      setSection(section.id, { content });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold text-muted-foreground">নীলান্তি</Label>
                                  <Input
                                    value={item.us || ""}
                                    onChange={(e) => {
                                      const content = [...(getSection(section.id)?.content || [])];
                                      content[idx] = { ...content[idx], us: e.target.value };
                                      setSection(section.id, { content });
                                    }}
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive h-9 w-9 hover:bg-destructive/10 justify-self-end"
                                  onClick={() => {
                                    const content = [...(getSection(section.id)?.content || [])];
                                    content.splice(idx, 1);
                                    setSection(section.id, { content });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const content = [...(getSection(section.id)?.content || []), 
                          section.id === 'benefits' ? { icon: "Star", title: "", description: "" } : { feature: "", others: "", us: "" }
                        ];
                        setSection(section.id, { content });
                      }}
                      className="w-full gap-2 border-dashed h-10 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      নতুন রোম (Row) যোগ করুন
                    </Button>
                  </div>
                )}

                {/* Money Back / Simple content sections */}
                {(section.id === 'money_back_guarantee' || section.id === 'order_confirmation') && (
                  <div className="space-y-4 border rounded-lg p-4 bg-accent/5">
                     <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">বিবরণ / মেসেজ</Label>
                        <Textarea
                          value={section.id === 'money_back_guarantee' ? (getSection(section.id)?.content?.description_bn || "") : (getSection(section.id)?.content?.thank_you_message || "")}
                          onChange={(e) => {
                            const currentContent = getSection(section.id)?.content || {};
                            const key = section.id === 'money_back_guarantee' ? 'description_bn' : 'thank_you_message';
                            setSection(section.id, { content: { ...currentContent, [key]: e.target.value } });
                          }}
                          className="bg-card min-h-[80px]"
                        />
                      </div>
                      {section.id === 'order_confirmation' && (
                        <div className="grid gap-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">অতিরিক্ত নোট</Label>
                          <Textarea
                            value={getSection(section.id)?.content?.note || ""}
                            onChange={(e) => {
                              const currentContent = getSection(section.id)?.content || {};
                              setSection(section.id, { content: { ...currentContent, note: e.target.value } });
                            }}
                            className="bg-card"
                          />
                        </div>
                      )}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button onClick={() => saveSection(section.id)} className="gap-2 shadow-sm">
                    <Save className="h-4 w-4" />
                    সেকশন সেভ করুন
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )}
  </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">রিভিউ ম্যানেজমেন্ট</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditTestimonial(null); setTestimonialDialog(true); }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            নতুন রিভিউ
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(testimonials as any[])?.map((t) => (
              <Card key={t.id} className="bg-muted/30 hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{t.customer_name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`h-2.5 w-2.5 ${i < t.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{t.comment}"</p>
                      {t.product_name && (
                        <p className="text-[10px] text-primary mt-2 font-medium">পণ্য: {t.product_name}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditTestimonial(t); setTestimonialDialog(true); }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonial Dialog and Alerts */}
      <TestimonialDialog
        open={testimonialDialog}
        onOpenChange={setTestimonialDialog}
        testimonial={editTestimonial}
      />

      {/* Delete Testimonial Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>রিভিউ মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteTestimonial.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Section Dialog */}
      <AlertDialog open={!!sectionToDelete} onOpenChange={() => setSectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>সেকশনটি চিরতরে মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              "{sectionToDelete}" আইডি এর এই সেকশনটি এবং এর ভেতরের সকল তথ্য মুছে যাবে। এটি আর ফিরে পাওয়া সম্ভব নয়।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => sectionToDelete && handleDeleteSection(sectionToDelete)}
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HomeSectionsTab;
