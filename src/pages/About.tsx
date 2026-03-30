import * as Icons from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { usePageContent } from "@/hooks/useCMSData";

// Helper component to render Lucide icons dynamically by name
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Leaf;
  return <IconComponent className={className} />;
};

const defaultAboutContent = {
  hero: {
    title: "আমাদের সম্পর্কে",
    subtitle: "আপনার আভিজাত্য ও মার্জিত আউটফিটের বিশ্বাসযোগ্য ঠিকানা হওয়া আমাদের লক্ষ্য"
  },
  story: {
    title: "আমাদের গল্প",
    p1: "নীলান্তি শুরু হয়েছিল একটি সাধারণ স্বপ্ন থেকে - বাংলাদেশের মুসলিম মা-বোনদের জন্য মানসম্মত, শরীয়ত সম্মত ও আধুনিক ডিজাইনের পোশাক সহজলভ্য করা।",
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
    { value: "৫০০০+", label: "হাসিখুশি গ্রাহক" },
    { value: "৩০০+", label: "সেরা ডিজাইন" },
    { value: "৬৪", label: "জেলায় ডেলিভারি" },
    { value: "৫.০", label: "গ্রাহক রেটিং" }
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

const About = () => {
  const { getItemCount } = useCart();
  const { data: aboutData } = usePageContent("about_us");
  
  // Merge loaded data with defaults to prevent broken UI
  const content = { ...defaultAboutContent, ...((aboutData as any)?.content || {}) };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={getItemCount()} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container text-center">

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {content.hero?.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.hero?.subtitle}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">{content.story?.title}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>{content.story?.p1}</p>
                  <p>{content.story?.p2}</p>
                </div>
              </div>
              <div className="bg-muted rounded-2xl p-8">
                {content.story?.image_url && (
                  <img
                    src={content.story.image_url}
                    alt="About Us"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12">{content.values?.title}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {(content.values?.items || []).map((value: any, index: number) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <DynamicIcon name={value.icon} className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(content.stats || []).map((stat: any, index: number) => (
                <div key={index} className="text-center p-6 bg-muted/30 rounded-xl">
                  <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-primary/5">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12">{content.why_choose?.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(content.why_choose?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <DynamicIcon name={item.icon} className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;