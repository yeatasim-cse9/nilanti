import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomepageSection } from "@/hooks/useCMSData";

const INSTAGRAM_POSTS = [
  { id: 1, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", link: "#" },
  { id: 2, image: "https://images.unsplash.com/photo-1434389670869-c875d150f83e?w=400&h=400&fit=crop", link: "#" },
  { id: 3, image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop", link: "#" },
  { id: 4, image: "https://images.unsplash.com/photo-1489987707023-afbc6e47b2d7?w=400&h=400&fit=crop", link: "#" },
  { id: 5, image: "https://images.unsplash.com/photo-1550614000-4b95d43818e6?w=400&h=400&fit=crop", link: "#" },
];

const InstagramFeed = () => {
  const { data: sectionData, isLoading } = useHomepageSection("instagram_feed");

  if (isLoading) return null;
  if (sectionData && (sectionData as any).is_active === false) return null;

  const section = sectionData as any;
  const title = section?.title_bn || "আমাদের ইন্সটাগ্রাম";
  const linkUrl = section?.link_url || "https://instagram.com";
  
  const rawPosts = section?.content?.posts || [];
  const validPosts = rawPosts.filter((p: any) => p && typeof p.image === 'string' && p.image.trim() !== "");
  
  // Use dynamic posts from Firestore if available, otherwise use placeholders
  const posts = validPosts.length > 0 
    ? validPosts.map((p: any, i: number) => ({ id: i, ...p }))
    : [
        { id: 1, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", link: "#" },
        { id: 2, image: "https://images.unsplash.com/photo-1434389670869-c875d150f83e?w=400&h=400&fit=crop", link: "#" },
        { id: 3, image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop", link: "#" },
        { id: 4, image: "https://images.unsplash.com/photo-1489987707023-afbc6e47b2d7?w=400&h=400&fit=crop", link: "#" },
        { id: 5, image: "https://images.unsplash.com/photo-1550614000-4b95d43818e6?w=400&h=400&fit=crop", link: "#" },
      ];

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <Link to={linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400 mb-2 hover:scale-110 transition-transform">
            <Instagram className="h-6 w-6" />
          </Link>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground hover:text-rose-600 transition-colors">
            <Link to={linkUrl} target="_blank" rel="noopener noreferrer">
              {title}
            </Link>
          </h2>
          <p className="text-muted-foreground text-lg">
            {section?.subtitle_bn || section?.content?.subtitle_bn || `আমাদের লেটেস্ট কালেকশন এবং কাস্টমারদের স্টাইল দেখতে ফলো করুন ${section?.content?.username || "@desiorganic"}`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              to={post.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={post.image}
                alt="Instagram Custom Post"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <Instagram className="text-white h-8 w-8 scale-50 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
