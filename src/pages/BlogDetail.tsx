import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Tag, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";

// Static blog data - in a real app this would come from a database
const blogPostsData: Record<string, {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  date: string;
  author: string;
  category: string;
}> = {
  "1": {
    id: "1",
    title: "খাঁটি মধু চেনার ৫টি সহজ উপায়",
    excerpt: "বাজারে অনেক ভেজাল মধু পাওয়া যায়। জানুন কিভাবে সহজেই খাঁটি মধু চিনবেন এবং স্বাস্থ্যকর মধু কিনবেন।",
    content: [
      "মধু প্রকৃতির এক অমূল্য উপহার। কিন্তু বাজারে ভেজাল মধুর ছড়াছড়ি। তাই খাঁটি মধু চেনা খুবই জরুরি। আজ আমরা জানবো কিভাবে সহজেই খাঁটি মধু চিনতে পারবেন।",
      "১. পানি পরীক্ষা: এক গ্লাস পানিতে এক চামচ মধু ফেলুন। খাঁটি মধু সরাসরি নিচে চলে যাবে এবং দ্রবীভূত হবে না। ভেজাল মধু পানিতে মিশে যাবে।",
      "২. আগুন পরীক্ষা: একটি তুলার বল মধুতে ডুবিয়ে আগুন ধরান। খাঁটি মধু জ্বলবে, ভেজাল মধু জ্বলবে না কারণ এতে পানি মেশানো থাকে।",
      "৩. কাগজ পরীক্ষা: সাদা কাগজে মধু ফেলুন। খাঁটি মধু কাগজ ভেজাবে না বা দাগ ফেলবে না। ভেজাল মধু কাগজ ভিজিয়ে দেবে।",
      "৪. ক্রিস্টালাইজেশন: খাঁটি মধু ঠান্ডায় জমে যায় বা দানাদার হয়ে যায়। এটি মধুর স্বাভাবিক বৈশিষ্ট্য। ভেজাল মধু সাধারণত জমে না।",
      "৫. স্বাদ ও গন্ধ: খাঁটি মধুতে ফুলের হালকা গন্ধ থাকে এবং গলায় হালকা জ্বালা অনুভব হয়। ভেজাল মধুতে এই বৈশিষ্ট্য থাকে না।",
      "সবসময় বিশ্বস্ত উৎস থেকে মধু কিনুন। আমাদের অর্গানিক স্টোরে সুন্দরবনের খাঁটি মধু পাওয়া যায় যা ১০০% প্রাকৃতিক ও ভেজালমুক্ত।"
    ],
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&h=600&fit=crop",
    date: "১৫ জানুয়ারি, ২০২৬",
    author: "অর্গানিক স্টোর",
    category: "মধু",
  },
  "2": {
    id: "2",
    title: "ঘি এর অসাধারণ স্বাস্থ্য উপকারিতা",
    excerpt: "প্রাচীনকাল থেকে আয়ুর্বেদে ঘি এর ব্যবহার হয়ে আসছে। জানুন ঘি কেন আপনার খাদ্যতালিকায় রাখা উচিত।",
    content: [
      "ঘি হলো দুধের চর্বি থেকে তৈরি একটি পুষ্টিকর খাদ্য উপাদান। হাজার বছর ধরে ভারতীয় উপমহাদেশে ঘি রান্না ও ওষুধ হিসেবে ব্যবহৃত হয়ে আসছে।",
      "হজম শক্তি বাড়ায়: ঘি হজম প্রক্রিয়াকে উন্নত করে এবং পেটের সমস্যা দূর করতে সাহায্য করে। এটি অন্ত্রের স্বাস্থ্য ভালো রাখে।",
      "মস্তিষ্কের জন্য উপকারী: ঘিতে থাকা ফ্যাটি অ্যাসিড মস্তিষ্কের কার্যক্ষমতা বাড়ায় এবং স্মৃতিশক্তি উন্নত করে।",
      "ত্বক ও চুলের যত্নে: ঘি ত্বক ও চুলে প্রাকৃতিক আর্দ্রতা প্রদান করে। এটি শুষ্ক ত্বক ও চুলের জন্য অত্যন্ত উপকারী।",
      "রোগ প্রতিরোধ ক্ষমতা বাড়ায়: ঘিতে থাকা ভিটামিন এ, ডি, ই এবং কে শরীরের রোগ প্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে।",
      "হাড় মজবুত করে: ঘিতে থাকা ভিটামিন কে২ হাড়ে ক্যালসিয়াম শোষণে সাহায্য করে, যা হাড় মজবুত রাখে।",
      "প্রতিদিন পরিমিত পরিমাণে খাঁটি দেশি ঘি খাওয়া স্বাস্থ্যের জন্য অত্যন্ত উপকারী। আমাদের স্টোরে গরুর দুধের খাঁটি ঘি পাওয়া যায়।"
    ],
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=1200&h=600&fit=crop",
    date: "১০ জানুয়ারি, ২০২৬",
    author: "অর্গানিক স্টোর",
    category: "ঘি",
  },
  "3": {
    id: "3",
    title: "অর্গানিক খাবার কেন খাবেন?",
    excerpt: "রাসায়নিক ও কীটনাশকমুক্ত খাবার আপনার ও পরিবারের স্বাস্থ্যের জন্য কতটা গুরুত্বপূর্ণ জানুন।",
    content: [
      "অর্গানিক খাবার হলো এমন খাবার যা কোনো রাসায়নিক সার, কীটনাশক বা জিনগতভাবে পরিবর্তিত উপাদান ছাড়াই উৎপাদন করা হয়।",
      "স্বাস্থ্যকর জীবন: অর্গানিক খাবারে ক্ষতিকর রাসায়নিক থাকে না, তাই এটি শরীরের জন্য অনেক বেশি নিরাপদ এবং স্বাস্থ্যকর।",
      "পুষ্টি মান বেশি: গবেষণায় দেখা গেছে অর্গানিক খাবারে সাধারণ খাবারের তুলনায় বেশি ভিটামিন, মিনারেল ও অ্যান্টিঅক্সিডেন্ট থাকে।",
      "পরিবেশ বান্ধব: অর্গানিক চাষ পদ্ধতি মাটি, পানি ও বায়ু দূষণ কমায় এবং পরিবেশের ভারসাম্য রক্ষা করে।",
      "রোগ প্রতিরোধ: কীটনাশকমুক্ত খাবার ক্যান্সার, হরমোনাল সমস্যা ও অন্যান্য দীর্ঘমেয়াদী রোগের ঝুঁকি কমায়।",
      "স্বাদ ভালো: অর্গানিক ফল, সবজি ও অন্যান্য খাবারের স্বাদ প্রাকৃতিক এবং অনেক বেশি সুস্বাদু।",
      "আপনার পরিবারের স্বাস্থ্য সুরক্ষায় আজই অর্গানিক খাবারে স্যুইচ করুন। আমাদের স্টোরে সব ধরনের অর্গানিক পণ্য পাওয়া যায়।"
    ],
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    date: "৫ জানুয়ারি, ২০২৬",
    author: "অর্গানিক স্টোর",
    category: "স্বাস্থ্য",
  },
  "4": {
    id: "4",
    title: "বাদাম খাওয়ার সঠিক নিয়ম",
    excerpt: "বাদাম পুষ্টিকর হলেও অতিরিক্ত খেলে সমস্যা হতে পারে। জানুন কতটুকু ও কখন বাদাম খাওয়া উচিত।",
    content: [
      "বাদাম অত্যন্ত পুষ্টিকর একটি খাবার। এতে প্রোটিন, স্বাস্থ্যকর চর্বি, ভিটামিন ও খনিজ পদার্থ রয়েছে। তবে সঠিক নিয়মে না খেলে উপকারের বদলে ক্ষতি হতে পারে।",
      "প্রতিদিন কতটুকু খাবেন: একজন প্রাপ্তবয়স্ক মানুষের জন্য প্রতিদিন ২০-৩০ গ্রাম বা এক মুঠো বাদাম যথেষ্ট। অতিরিক্ত খেলে ওজন বাড়তে পারে।",
      "কখন খাবেন: সকালে নাস্তায় বা বিকেলে স্ন্যাক্স হিসেবে বাদাম খাওয়া ভালো। রাতে ভারী খাবারের পর বাদাম না খাওয়াই ভালো।",
      "ভিজিয়ে খাওয়ার উপকারিতা: বাদাম রাতে পানিতে ভিজিয়ে রেখে সকালে খেলে হজম সহজ হয় এবং পুষ্টি শোষণ বেশি হয়।",
      "বিভিন্ন বাদামের মিশ্রণ: শুধু একধরনের বাদাম না খেয়ে কাঠবাদাম, কাজু, পেস্তা, আখরোট মিশিয়ে খেলে বেশি উপকার পাওয়া যায়।",
      "কাদের সাবধান থাকতে হবে: যাদের বাদামে অ্যালার্জি আছে বা কিডনির সমস্যা আছে তাদের চিকিৎসকের পরামর্শে বাদাম খাওয়া উচিত।",
      "আমাদের স্টোরে বিভিন্ন ধরনের প্রিমিয়াম কোয়ালিটি বাদাম পাওয়া যায়। সব বাদামই তাজা ও ভেজালমুক্ত।"
    ],
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1200&h=600&fit=crop",
    date: "১ জানুয়ারি, ২০২৬",
    author: "অর্গানিক স্টোর",
    category: "বাদাম",
  },
};

const relatedPosts = [
  { id: "1", title: "খাঁটি মধু চেনার ৫টি সহজ উপায়", category: "মধু" },
  { id: "2", title: "ঘি এর অসাধারণ স্বাস্থ্য উপকারিতা", category: "ঘি" },
  { id: "3", title: "অর্গানিক খাবার কেন খাবেন?", category: "স্বাস্থ্য" },
  { id: "4", title: "বাদাম খাওয়ার সঠিক নিয়ম", category: "বাদাম" },
];

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getItemCount } = useCart();
  
  const post = id ? blogPostsData[id] : null;
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartCount={getItemCount()} />
        <main className="flex-1 py-12">
          <div className="container text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">ব্লগ পোস্ট পাওয়া যায়নি</h1>
            <p className="text-muted-foreground mb-6">দুঃখিত, আপনি যে ব্লগ পোস্টটি খুঁজছেন তা পাওয়া যায়নি।</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                ব্লগে ফিরে যান
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const otherPosts = relatedPosts.filter(p => p.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={getItemCount()} />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="container py-8">
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            সব ব্লগ দেখুন
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-2">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {post.title}
              </h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {post.content.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-foreground font-medium">
                    <Share2 className="h-4 w-4" />
                    শেয়ার করুন:
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-foreground mb-4">আরো পড়ুন</h3>
                <div className="space-y-4">
                  {otherPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.id}`}
                      className="block group"
                    >
                      <h4 className="text-foreground group-hover:text-primary transition-colors font-medium mb-1">
                        {relatedPost.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">{relatedPost.category}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <Link to="/shop">
                    <Button className="w-full">আমাদের পণ্য দেখুন</Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
