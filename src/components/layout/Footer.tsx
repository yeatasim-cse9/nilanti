import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter,
  ArrowRight
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useAdminData";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quick: [
      { name: "সকল পণ্য", href: "/shop" },
      { name: "আমাদের সম্পর্কে", href: "/about" },
      { name: "যোগাযোগ", href: "/contact" },
      { name: "ব্লগ", href: "/blog" },
      { name: "FAQ", href: "/faq" },
    ],
    customer: [
      { name: "আমার অর্ডার", href: "/account" },
      { name: "অর্ডার ট্র্যাকিং", href: "/track-order" },
      { name: "শিপিং পলিসি", href: "/shipping-policy" },
      { name: "রিটার্ন পলিসি", href: "/return-policy" },
      { name: "টার্মস & কন্ডিশন", href: "/terms" },
    ]
  };

  return (
    <footer className="relative bg-white border-t border-gray-100 overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Newsletter / CTA Section (Could be made dynamic later) */}
      <div className="border-b border-gray-50">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-primary/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left space-y-2">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 font-bengali">নীলান্তির সঙ্গে যুক্ত থাকুন</h3>
              <p className="text-muted-foreground font-bengali">নতুন কালেকশন ও স্পেশাল অফার পেতে আমাদের ফলো করুন।</p>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <Link 
                to="/shop" 
                className="group flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold font-bengali hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              >
                কেনাকাটা শুরু করুন
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {/* Background pattern for CTA */}
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
               <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="160" cy="40" r="120" stroke="currentColor" strokeWidth="40" />
               </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Identity - 4 Columns */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-primary/10 p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={settings?.logo || "/logo.png"} 
                  alt={settings?.store_name || "Nilanti"} 
                  className="h-full w-full object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-primary font-bengali leading-none">
                  {settings?.store_name || "নীলান্তি"}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mt-1">
                  {settings?.tagline || "বিশ্বস্ততার বুনন..."}
                </span>
              </div>
            </Link>
            
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm font-bengali">
              প্রিমিয়াম কোয়ালিটি হিজাব, আবায়া ও মুসলিম লাইফস্টাইল কালেকশন। আমাদের প্রতিটি পণ্য আপনার রুচি ও আভিজাত্যের প্রতিফলন। আমরা বিশ্বাস করি শালীনতাই সৌন্দর্য।
            </p>

            <div className="pt-4 flex items-center gap-4">
              {[
                { icon: Facebook, href: settings?.facebook || "#", label: "Facebook" },
                { icon: Instagram, href: settings?.instagram || "#", label: "Instagram" },
                { icon: Youtube, href: settings?.youtube || "#", label: "Youtube" },
                { icon: Twitter, href: settings?.twitter || "#", label: "Twitter" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections - 2 Columns each */}
          <div className="lg:col-span-2">
            <h4 className="text-gray-900 font-bold mb-6 font-bengali">দ্রুত লিংক</h4>
            <ul className="space-y-4">
              {footerLinks.quick.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-primary hover:translate-x-1 flex items-center gap-2 transition-all duration-300 font-bengali"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/20" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-gray-900 font-bold mb-6 font-bengali">গ্রাহক সেবা</h4>
            <ul className="space-y-4">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-primary hover:translate-x-1 flex items-center gap-2 transition-all duration-300 font-bengali"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/20" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-gray-900 font-bold mb-6 font-bengali">যোগাযোগ করুন</h4>
            <div className="space-y-4">
              <a
                href={`tel:${settings?.phone || "+8801XXXXXXXXX"}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">কল করুন</span>
                  <span className="text-sm font-semibold text-gray-900">{settings?.phone || "+880 1XXX-XXXXXX"}</span>
                </div>
              </a>

              <a
                href={`mailto:${settings?.email || "info@nilanti.com"}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">ইমেইল পাঠান</span>
                  <span className="text-sm font-semibold text-gray-900">{settings?.email || "info@nilanti.com"}</span>
                </div>
              </a>

              <div className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 transition-all duration-300 border border-transparent">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">আমাদের ঠিকানা</span>
                  <span className="text-sm font-semibold text-gray-900 font-bengali">{settings?.address || "ঢাকা, বাংলাদেশ"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - Integrated Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h5 className="text-[10px] uppercase font-black text-gray-400 tracking-widest font-bengali">পেমেন্ট মেথড:</h5>
            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <div className="px-2 py-1 border border-gray-100 rounded bg-gray-50/50 text-[9px] font-bold text-gray-500 uppercase">Cash on Delivery</div>
               <div className="px-2 py-1 border border-gray-100 rounded bg-gray-50/50 text-[9px] font-bold text-gray-500 uppercase">bKash</div>
               <div className="px-2 py-1 border border-gray-100 rounded bg-gray-50/50 text-[9px] font-bold text-gray-500 uppercase">Nagad</div>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400 font-bengali">
              © {currentYear} <span className="text-primary font-bold">{settings?.store_name || "নীলান্তি"}</span>। সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

