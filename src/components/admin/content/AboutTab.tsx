import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageContent, useUpdatePageContent } from "@/hooks/useCMSData";
import { ImageUpload } from "../ImageUpload";

const defaultAboutContent = {
  hero: {
    title: "আমাদের সম্পর্কে",
    subtitle: "প্রকৃতির বিশুদ্ধতা আপনার দোরগোড়ায় পৌঁছে দেওয়াই আমাদের লক্ষ্য"
  },
  story: {
    title: "আমাদের গল্প",
    p1: "দেশী অর্গানিক শুরু হয়েছিল একটি সাধারণ স্বপ্ন থেকে - বাংলাদেশের মুসলিম মা-বোনদের জন্য মানসম্মত, শরীয়ত সম্মত ও আধুনিক ডিজাইনের পোশাক সহজলভ্য করা।",
    p2: "বোরকা, হিজাব থেকে শুরু করে শিশুদের আরামদায়ক পোশাক, প্রতিটি ক্ষেত্রে আমরা প্রিমিয়াম কাপড়ের গুণগত মান নিশ্চিত করি। শুধু ব্যবসাই নয়, আপনাদের বিশ্বস্ত আস্থার প্রতীক হওয়াই আমাদের মূল লক্ষ্য।",
    image_url: "https://images.unsplash.com/photo-1589467610090-fa3b5efea682?q=80&w=600&fit=crop"
  },
  values: {
    title: "আমাদের মূল্যবোধ",
    items: [
      { icon: "Heart", title: "মানসম্মত ফ্যাব্রিক", description: "১০০% প্রিমিয়াম ও আরামদায়ক কাপড়, কোনো আপোষ নেই" },
      { icon: "Users", title: "বিশ্বস্ততা", description: "গ্রাহকদের সাথে সৎ ও স্বচ্ছ সম্পর্ক বজায় রাখা" },
      { icon: "Target", title: "গুণমান", description: "প্রতিটি পণ্যে সর্বোচ্চ মান নিশ্চিত করা" }
    ]
  },
  stats: [
    { value: "৫০০০+", label: "সন্তুষ্ট গ্রাহক" },
    { value: "১০০+", label: "অর্গানিক পণ্য" },
    { value: "৫০+", label: "জেলায় ডেলিভারি" },
    { value: "৪.৯", label: "গ্রাহক রেটিং" }
  ],
  why_choose: {
    title: "কেন আমাদের বেছে নেবেন?",
    items: [
      { icon: "Leaf", title: "প্রিমিয়াম কোয়ালিটি", description: "দেশের সেরা কাপড় ও আধুনিক ডিজাইন" },
      { icon: "Award", title: "শরীয়ত সম্মত", description: "মার্জিত ও ইসলামিক মূল্যবোধের সাথে মানানসই" },
      { icon: "Truck", title: "দ্রুত ডেলিভারি", description: "সারাদেশে দ্রুত ও নিরাপদ ডেলিভারি" },
      { icon: "Heart", title: "মানি ব্যাক গ্যারান্টি", description: "সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত" }
    ]
  }
};

const AboutTab = () => {
  const { data: aboutData, isLoading } = usePageContent("about_us");
  const updateContent = useUpdatePageContent();
  const [content, setContent] = useState<any>(defaultAboutContent);

  useEffect(() => {
    if ((aboutData as any)?.content) {
      // Merge with default to ensure no missing fields break the UI
      setContent({ ...defaultAboutContent, ...(aboutData as any).content });
    }
  }, [aboutData]);

  const saveContent = () => {
    updateContent.mutate({
      pageKey: "about_us",
      content: content,
      title_bn: "আমাদের সম্পর্কে"
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">আমাদের সম্পর্কে ("About Us" পেজ)</h2>
          <p className="text-sm text-muted-foreground">ওয়েবসাইটের About পেজের কনটেন্ট পরিবর্তন করুন</p>
        </div>
        <Button onClick={saveContent} className="gap-2" disabled={updateContent.isPending}>
          <Save className="h-4 w-4" />
          {updateContent.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </Button>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        
        {/* Hero Section */}
        <AccordionItem value="hero" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">হিরো সেকশন</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>শিরোনাম</Label>
                <Input
                  value={content.hero.title}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                />
              </div>
              <div className="grid gap-2">
                <Label>সাব-টাইটেল (Subtitle)</Label>
                <Input
                  value={content.hero.subtitle}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Story Section */}
        <AccordionItem value="story" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">আমাদের গল্প</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>শিরোনাম</Label>
                <Input
                  value={content.story.title}
                  onChange={(e) => setContent({ ...content, story: { ...content.story, title: e.target.value } })}
                />
              </div>
              <div className="grid gap-2">
                <Label>প্যারাগ্রাফ ১</Label>
                <Textarea
                  rows={3}
                  value={content.story.p1}
                  onChange={(e) => setContent({ ...content, story: { ...content.story, p1: e.target.value } })}
                />
              </div>
              <div className="grid gap-2">
                <Label>প্যারাগ্রাফ ২</Label>
                <Textarea
                  rows={3}
                  value={content.story.p2}
                  onChange={(e) => setContent({ ...content, story: { ...content.story, p2: e.target.value } })}
                />
              </div>
              <div className="grid gap-2">
                <Label>ছবি</Label>
                <ImageUpload
                  images={content.story.image_url ? [content.story.image_url] : []}
                  onChange={(urls) => setContent({ ...content, story: { ...content.story, image_url: urls[0] || "" } })}
                  multiple={false}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Values Section */}
        <AccordionItem value="values" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">আমাদের মূল্যবোধ</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <div className="space-y-4">
              <div className="grid gap-2 mb-4">
                <Label>শিরোনাম</Label>
                <Input
                  value={content.values.title}
                  onChange={(e) => setContent({ ...content, values: { ...content.values, title: e.target.value } })}
                />
              </div>
              <div className="space-y-3">
                <Label>মূল্যবোধের তালিকা</Label>
                {content.values.items.map((item: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">আইটেম {idx + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => {
                          const newItems = [...content.values.items];
                          newItems.splice(idx, 1);
                          setContent({ ...content, values: { ...content.values, items: newItems } });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">আইকন (Lucide)</Label>
                          <Input
                            className="h-8 text-sm"
                            value={item.icon}
                            onChange={(e) => {
                              const newItems = [...content.values.items];
                              newItems[idx] = { ...item, icon: e.target.value };
                              setContent({ ...content, values: { ...content.values, items: newItems } });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">শিরোনাম</Label>
                          <Input
                            className="h-8 text-sm"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...content.values.items];
                              newItems[idx] = { ...item, title: e.target.value };
                              setContent({ ...content, values: { ...content.values, items: newItems } });
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">বিবরণ</Label>
                        <Input
                          className="h-8 text-sm"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...content.values.items];
                            newItems[idx] = { ...item, description: e.target.value };
                            setContent({ ...content, values: { ...content.values, items: newItems } });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => {
                    const newItems = [...content.values.items, { icon: "Heart", title: "", description: "" }];
                    setContent({ ...content, values: { ...content.values, items: newItems } });
                  }}
                >
                  <Plus className="h-4 w-4" /> নতুন আইটেম যোগ করুন
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stats Section */}
        <AccordionItem value="stats" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">পরিসংখ্যান (Stats)</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <div className="space-y-3">
              {content.stats.map((stat: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs">মান (Value)</Label>
                    <Input
                      className="h-8 text-sm"
                      value={stat.value}
                      placeholder="e.g. ৫০০০+"
                      onChange={(e) => {
                        const newStats = [...content.stats];
                        newStats[idx] = { ...stat, value: e.target.value };
                        setContent({ ...content, stats: newStats });
                      }}
                    />
                  </div>
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs">লেবেল (Label)</Label>
                    <Input
                      className="h-8 text-sm"
                      value={stat.label}
                      placeholder="e.g. সন্তুষ্ট গ্রাহক"
                      onChange={(e) => {
                        const newStats = [...content.stats];
                        newStats[idx] = { ...stat, label: e.target.value };
                        setContent({ ...content, stats: newStats });
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-5 h-8 w-8 text-destructive flex-shrink-0"
                    onClick={() => {
                      const newStats = [...content.stats];
                      newStats.splice(idx, 1);
                      setContent({ ...content, stats: newStats });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 mt-2"
                onClick={() => {
                  const newStats = [...content.stats, { value: "", label: "" }];
                  setContent({ ...content, stats: newStats });
                }}
              >
                <Plus className="h-4 w-4" /> নতুন স্ট্যাট যোগ করুন
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Why Choose Us Section */}
        <AccordionItem value="why_choose" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">কেন আমাদের বেছে নেবেন?</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <div className="space-y-4">
              <div className="grid gap-2 mb-4">
                <Label>শিরোনাম</Label>
                <Input
                  value={content.why_choose.title}
                  onChange={(e) => setContent({ ...content, why_choose: { ...content.why_choose, title: e.target.value } })}
                />
              </div>
              <div className="space-y-3">
                <Label>বৈশিষ্ট্য তালিকা</Label>
                {content.why_choose.items.map((item: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">আইটেম {idx + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => {
                          const newItems = [...content.why_choose.items];
                          newItems.splice(idx, 1);
                          setContent({ ...content, why_choose: { ...content.why_choose, items: newItems } });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">আইকন (Lucide)</Label>
                          <Input
                            className="h-8 text-sm"
                            value={item.icon}
                            onChange={(e) => {
                              const newItems = [...content.why_choose.items];
                              newItems[idx] = { ...item, icon: e.target.value };
                              setContent({ ...content, why_choose: { ...content.why_choose, items: newItems } });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">শিরোনাম</Label>
                          <Input
                            className="h-8 text-sm"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...content.why_choose.items];
                              newItems[idx] = { ...item, title: e.target.value };
                              setContent({ ...content, why_choose: { ...content.why_choose, items: newItems } });
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">বিবরণ</Label>
                        <Input
                          className="h-8 text-sm"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...content.why_choose.items];
                            newItems[idx] = { ...item, description: e.target.value };
                            setContent({ ...content, why_choose: { ...content.why_choose, items: newItems } });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => {
                    const newItems = [...content.why_choose.items, { icon: "Check", title: "", description: "" }];
                    setContent({ ...content, why_choose: { ...content.why_choose, items: newItems } });
                  }}
                >
                  <Plus className="h-4 w-4" /> নতুন আইটেম যোগ করুন
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};

export default AboutTab;
