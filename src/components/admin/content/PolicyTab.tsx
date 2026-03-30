import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageContents, useUpdatePageContent } from "@/hooks/useCMSData";

interface Section {
  title: string;
  content: string;
}

interface Question {
  question: string;
  answer: string;
}

const PolicyTab = () => {
  const { data: pageContents, isLoading } = usePageContents();
  const updateContent = useUpdatePageContent();
  const [editedContent, setEditedContent] = useState<Record<string, any>>({});

  const getContent = (pageKey: string) => {
    if (editedContent[pageKey]) return editedContent[pageKey];
    const page = pageContents?.find((p) => p.page_key === pageKey);
    return page?.content || { sections: [], questions: [] };
  };

  const setContent = (pageKey: string, content: any) => {
    setEditedContent((prev) => ({ ...prev, [pageKey]: content }));
  };

  const saveContent = (pageKey: string) => {
    updateContent.mutate({
      pageKey,
      content: editedContent[pageKey] || getContent(pageKey),
    });
  };

  const addSection = (pageKey: string) => {
    const content = getContent(pageKey);
    const sections = content.sections || [];
    setContent(pageKey, { ...content, sections: [...sections, { title: "", content: "" }] });
  };

  const removeSection = (pageKey: string, index: number) => {
    const content = getContent(pageKey);
    const sections = [...(content.sections || [])];
    sections.splice(index, 1);
    setContent(pageKey, { ...content, sections });
  };

  const updateSection = (pageKey: string, index: number, field: string, value: string) => {
    const content = getContent(pageKey);
    const sections = [...(content.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    setContent(pageKey, { ...content, sections });
  };

  const addQuestion = (pageKey: string) => {
    const content = getContent(pageKey);
    const questions = content.questions || [];
    setContent(pageKey, { ...content, questions: [...questions, { question: "", answer: "" }] });
  };

  const removeQuestion = (pageKey: string, index: number) => {
    const content = getContent(pageKey);
    const questions = [...(content.questions || [])];
    questions.splice(index, 1);
    setContent(pageKey, { ...content, questions });
  };

  const updateQuestion = (pageKey: string, index: number, field: string, value: string) => {
    const content = getContent(pageKey);
    const questions = [...(content.questions || [])];
    questions[index] = { ...questions[index], [field]: value };
    setContent(pageKey, { ...content, questions });
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  const policyPages = [
    { key: "return_policy", title: "রিটার্ন পলিসি", type: "sections" },
    { key: "shipping_policy", title: "শিপিং পলিসি", type: "sections" },
    { key: "terms", title: "টার্মস & কন্ডিশন", type: "sections" },
    { key: "privacy_policy", title: "প্রাইভেসি পলিসি", type: "sections" },
    { key: "faq", title: "সাধারণ জিজ্ঞাসা (FAQ)", type: "questions" },
  ];

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="space-y-4">
        {policyPages.map((page) => (
          <AccordionItem key={page.key} value={page.key} className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="font-medium">{page.title}</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {page.type === "sections" ? (
                <div className="space-y-4">
                  {(getContent(page.key).sections || []).map((section: Section, idx: number) => (
                    <Card key={idx}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>সেকশন {idx + 1}</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            onClick={() => removeSection(page.key, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="শিরোনাম"
                          value={section.title}
                          onChange={(e) => updateSection(page.key, idx, "title", e.target.value)}
                        />
                        <Textarea
                          placeholder="বিস্তারিত"
                          value={section.content}
                          onChange={(e) => updateSection(page.key, idx, "content", e.target.value)}
                          rows={4}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => addSection(page.key)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      সেকশন যোগ করুন
                    </Button>
                    <Button onClick={() => saveContent(page.key)} className="gap-2">
                      <Save className="h-4 w-4" />
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(getContent(page.key).questions || []).map((q: Question, idx: number) => (
                    <Card key={idx}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>প্রশ্ন {idx + 1}</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            onClick={() => removeQuestion(page.key, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="প্রশ্ন"
                          value={q.question}
                          onChange={(e) => updateQuestion(page.key, idx, "question", e.target.value)}
                        />
                        <Textarea
                          placeholder="উত্তর"
                          value={q.answer}
                          onChange={(e) => updateQuestion(page.key, idx, "answer", e.target.value)}
                          rows={3}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => addQuestion(page.key)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      প্রশ্ন যোগ করুন
                    </Button>
                    <Button onClick={() => saveContent(page.key)} className="gap-2">
                      <Save className="h-4 w-4" />
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default PolicyTab;
