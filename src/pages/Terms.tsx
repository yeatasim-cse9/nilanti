import { FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";

const Terms = () => {
  const { getItemCount } = useCart();

  const sections = [
    {
      title: "১. সাধারণ শর্তাবলী",
      content: [
        "এই ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন।",
        "আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি।",
        "সকল পণ্যের মূল্য ও প্রাপ্যতা পরিবর্তন হতে পারে।",
      ],
    },
    {
      title: "২. অর্ডার ও পেমেন্ট",
      content: [
        "অর্ডার করার পর কনফার্মেশন SMS/ফোন পাবেন।",
        "ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট গ্রহণযোগ্য।",
        "অর্ডার বাতিল করতে চাইলে শিপিং এর আগে জানাতে হবে।",
        "ভুল তথ্য দিলে অর্ডার বাতিল হতে পারে।",
      ],
    },
    {
      title: "৩. ডেলিভারি",
      content: [
        "ডেলিভারি সময় আনুমানিক, গ্যারান্টিযুক্ত নয়।",
        "প্রাকৃতিক দুর্যোগ বা অনিয়ন্ত্রিত কারণে বিলম্ব হতে পারে।",
        "সঠিক ঠিকানা ও ফোন নম্বর দেওয়া গ্রাহকের দায়িত্ব।",
      ],
    },
    {
      title: "৪. রিটার্ন ও রিফান্ড",
      content: [
        "রিটার্ন পলিসি অনুযায়ী রিটার্ন গ্রহণযোগ্য।",
        "রিফান্ড প্রসেসিং এ ৩-৭ কার্যদিবস সময় লাগতে পারে।",
        "ব্যবহৃত বা ক্ষতিগ্রস্ত পণ্য রিটার্ন হবে না।",
      ],
    },
    {
      title: "৫. গোপনীয়তা",
      content: [
        "আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখা হয়।",
        "তৃতীয় পক্ষের সাথে তথ্য শেয়ার করা হয় না।",
        "শুধুমাত্র অর্ডার প্রসেসিং এ তথ্য ব্যবহৃত হয়।",
      ],
    },
    {
      title: "৬. পণ্যের মান",
      content: [
        "সব পণ্য ১০০% অর্গানিক ও খাঁটি হওয়ার গ্যারান্টি।",
        "মানের সমস্যা হলে প্রতিস্থাপন বা রিফান্ড দেওয়া হবে।",
        "পণ্যের ছবি প্রকৃত পণ্য থেকে কিছুটা ভিন্ন হতে পারে।",
      ],
    },
    {
      title: "৭. দায়বদ্ধতার সীমাবদ্ধতা",
      content: [
        "আমরা পরোক্ষ ক্ষতির জন্য দায়ী নই।",
        "সর্বোচ্চ দায় পণ্যের মূল্য পর্যন্ত সীমাবদ্ধ।",
        "ওয়েবসাইটে প্রযুক্তিগত সমস্যার জন্য দায়ী নই।",
      ],
    },
    {
      title: "৮. বিরোধ নিষ্পত্তি",
      content: [
        "সকল বিরোধ বাংলাদেশের আইন অনুযায়ী নিষ্পত্তি হবে।",
        "প্রথমে সরাসরি আলোচনার মাধ্যমে সমাধান করা হবে।",
        "আলোচনায় সমাধান না হলে আইনি পদক্ষেপ নেওয়া যাবে।",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={getItemCount()} />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              টার্মস & কন্ডিশন
            </h1>
            <p className="text-muted-foreground">
              সর্বশেষ আপডেট: জানুয়ারি ২০২৬
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 md:p-8">
            <div className="space-y-8">
              {sections.map((section, idx) => (
                <div key={idx}>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <ul className="space-y-2">
                    {section.content.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                এই শর্তাবলী সম্পর্কে প্রশ্ন থাকলে{" "}
                <a href="/contact" className="text-primary hover:underline">
                  আমাদের সাথে যোগাযোগ করুন
                </a>
                ।
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;