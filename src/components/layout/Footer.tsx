import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ArrowRight,
  ArrowUpRight
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
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Ambient decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Newsletter / CTA Banner */}
      <div className="border-b border-white/5">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.04] rounded-2xl md:rounded-3xl p-7 md:p-10 border border-white/5 backdrop-blur-sm relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                নীলান্তির সঙ্গে যুক্ত থাকুন
              </h3>
              <p className="text-gray-400 text-sm mt-1.5">
                নতুন কালেকশন ও স্পেশাল অফার পেতে আমাদের ফলো করুন।
              </p>
            </div>
            <Link
              to="/shop"
              className="relative z-10 group flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:shadow-[0_8px_24px_rgba(255,255,255,0.1)] active:scale-[0.97] transition-all duration-300"
            >
              কেনাকাটা শুরু করুন
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container pt-14 pb-10 md:pt-16 md:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Identity */}
          <div className="col-span-2 lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center overflow-hidden">
                <img
                  src={settings?.logo || "/logo.png"}
                  alt={settings?.store_name || "Nilanti"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-extrabold text-white tracking-tight block leading-none">
                  {settings?.store_name || "নীলান্তি"}
                </span>
                <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-medium mt-0.5 block">
                  {settings?.tagline || "বিশ্বস্ততার বুনন..."}
                </span>
              </div>
            </Link>

            <p className="text-gray-500 text-[13px] leading-relaxed max-w-xs">
              প্রিমিয়াম কোয়ালিটি হিজাব, আবায়া ও মুসলিম লাইফস্টাইল কালেকশন। আমরা বিশ্বাস করি শালীনতাই সৌন্দর্য।
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
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
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-5">
              দ্রুত লিংক
            </h4>
            <ul className="space-y-3">
              {footerLinks.quick.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[13px] text-gray-500 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-5">
              গ্রাহক সেবা
            </h4>
            <ul className="space-y-3">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[13px] text-gray-500 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-4 space-y-3">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-5">
              যোগাযোগ করুন
            </h4>

            <a
              href={`tel:${settings?.phone || "+8801XXXXXXXXX"}`}
              className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 border border-white/5"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors flex-shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-600 tracking-wider block">কল করুন</span>
                <span className="text-[13px] font-semibold text-gray-300">{settings?.phone || "+880 1XXX-XXXXXX"}</span>
              </div>
            </a>

            <a
              href={`mailto:${settings?.email || "info@nilanti.com"}`}
              className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 border border-white/5"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors flex-shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-600 tracking-wider block">ইমেইল পাঠান</span>
                <span className="text-[13px] font-semibold text-gray-300">{settings?.email || "info@nilanti.com"}</span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 flex-shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-600 tracking-wider block">ঠিকানা</span>
                <span className="text-[13px] font-semibold text-gray-300">{settings?.address || "ঢাকা, বাংলাদেশ"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-7 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase font-bold text-gray-600 tracking-widest">পেমেন্ট:</span>
            <div className="flex items-center gap-2">
              {["Cash on Delivery", "bKash", "Nagad"].map((m) => (
                <span key={m} className="px-2.5 py-1 border border-white/5 rounded-md bg-white/[0.03] text-[9px] font-bold text-gray-500 uppercase">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-gray-600">
            © {currentYear} <span className="text-gray-400 font-semibold">{settings?.store_name || "নীলান্তি"}</span>। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
