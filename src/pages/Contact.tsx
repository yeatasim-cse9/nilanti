import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useAdminData";
import { motion } from "framer-motion";

/* ─── Framer Motion Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.1 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.08 },
  }),
};

const Contact = () => {
  const { getItemCount } = useCart();
  const [loading, setLoading] = useState(false);
  const { data: settings } = useSiteSettings();

  const phone = settings?.phone || "+880 1XXX-XXXXXX";
  const email = settings?.email || "info@nilanti.com";
  const address = settings?.address || "ঢাকা, বাংলাদেশ";
  const workingHours = settings?.working_hours || "প্রতিদিন সকাল ৯টা - রাত ১০টা";
  const mapEmbedUrl = settings?.map_embed_url || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.success("আপনার বার্তা পাঠানো হয়েছে। শীঘ্রই যোগাযোগ করা হবে।");
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  };

  const contactCards = [
    {
      icon: Phone,
      label: "ফোন",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-500/8",
      ring: "ring-blue-500/10",
    },
    {
      icon: Mail,
      label: "ইমেইল",
      value: email,
      href: `mailto:${email}`,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-500/8",
      ring: "ring-emerald-500/10",
    },
    {
      icon: MapPin,
      label: "ঠিকানা",
      value: address,
      href: mapEmbedUrl ? "#map-section" : `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-500/8",
      ring: "ring-rose-500/10",
    },
    {
      icon: Clock,
      label: "সেবার সময়",
      value: workingHours,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-500/8",
      ring: "ring-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header cartCount={getItemCount()} />

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative overflow-hidden bg-gray-950 pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Background ambient orbs */}
        <motion.div
          className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-[120px]"
          animate={{ x: [0, 20, -10, 0], y: [0, -25, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-500/8 to-rose-500/5 blur-[100px]"
          animate={{ x: [0, -15, 10, 0], y: [0, 10, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grain texture */}
        <div className="hero-grain absolute inset-0 pointer-events-none opacity-40" />

        <div className="container relative z-10">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/70 text-[11px] font-semibold tracking-wide mb-6"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              আমরা সবসময় আপনার পাশে
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4"
            >
              যোগাযোগ করুন
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-400 text-base md:text-lg font-medium leading-relaxed"
            >
              যেকোনো প্রশ্ন, পরামর্শ বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।
              <br className="hidden md:block" />
              আমরা আপনার সেবায় নিবেদিত।
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 56V28C0 28 360 0 720 0C1080 0 1440 28 1440 28V56H0Z" fill="rgb(249,250,251)" />
          </svg>
        </div>
      </section>

      <main className="flex-1 -mt-4 relative z-10">
        {/* ═══════ CONTACT CARDS ═══════ */}
        <div className="container px-4 md:px-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 -mt-12 md:-mt-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {contactCards.map((card, i) => (
              <motion.div
                key={card.label}
                variants={scaleIn}
                custom={i}
              >
                <a
                  href={card.href}
                  className={`group relative block bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-xl ring-1 ${card.ring} transition-all duration-500 hover:-translate-y-1`}
                >
                  {/* Gradient top line */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${card.bg} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <card.icon className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                  </div>

                  <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1">
                    {card.label}
                  </p>
                  <p className="text-xs md:text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                    {card.value}
                  </p>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ═══════ MAIN CONTENT GRID ═══════ */}
        <div className="container px-4 md:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-5 gap-8 md:gap-12">

            {/* ═══ LEFT: Contact Form ═══ */}
            <motion.div
              className="lg:col-span-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-10 shadow-sm ring-1 ring-gray-100"
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-950 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                      বার্তা পাঠান
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-400 font-medium">
                      আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেবো
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] ml-1"
                      >
                        আপনার নাম *
                      </Label>
                      <Input
                        id="name"
                        required
                        placeholder="পূর্ণ নাম"
                        className="h-12 md:h-13 rounded-xl md:rounded-2xl bg-gray-50/80 border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm font-medium placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="contact-phone"
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] ml-1"
                      >
                        ফোন নম্বর *
                      </Label>
                      <Input
                        id="contact-phone"
                        required
                        placeholder="01XXXXXXXXX"
                        className="h-12 md:h-13 rounded-xl md:rounded-2xl bg-gray-50/80 border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm font-medium placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contact-email"
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] ml-1"
                    >
                      ইমেইল
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="email@example.com"
                      className="h-12 md:h-13 rounded-xl md:rounded-2xl bg-gray-50/80 border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm font-medium placeholder:text-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] ml-1"
                    >
                      বিষয়
                    </Label>
                    <Input
                      id="subject"
                      placeholder="আপনার প্রশ্নের বিষয়"
                      className="h-12 md:h-13 rounded-xl md:rounded-2xl bg-gray-50/80 border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm font-medium placeholder:text-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] ml-1"
                    >
                      বার্তা *
                    </Label>
                    <Textarea
                      id="message"
                      required
                      placeholder="আপনার বার্তা এখানে লিখুন..."
                      rows={5}
                      className="rounded-xl md:rounded-2xl bg-gray-50/80 border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm font-medium placeholder:text-gray-300 resize-none"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full h-13 md:h-14 rounded-2xl bg-gray-950 hover:bg-gray-800 text-white font-bold text-sm gap-2.5 shadow-xl shadow-gray-950/20 transition-all duration-300 group"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          পাঠানো হচ্ছে...
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          বার্তা পাঠান
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>

            {/* ═══ RIGHT: Map + Quick Info ═══ */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {/* Map Card */}
              <motion.div
                variants={fadeUp}
                custom={1}
                id="map-section"
                className="bg-white rounded-3xl md:rounded-[2rem] overflow-hidden shadow-sm ring-1 ring-gray-100"
              >
                <div className="p-5 md:p-6 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-gray-900">আমাদের লোকেশন</h3>
                      <p className="text-[10px] md:text-xs text-gray-400 font-medium">{address}</p>
                    </div>
                  </div>
                </div>

                {/* Map iframe or fallback */}
                <div className="relative h-[280px] md:h-[320px] bg-gray-100">
                  {mapEmbedUrl ? (
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="নীলান্তি লোকেশন ম্যাপ"
                      className="w-full h-full grayscale-[20%] contrast-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-14 h-14 rounded-2xl bg-gray-200/60 flex items-center justify-center mb-4">
                        <MapPin className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-500 mb-1">ম্যাপ সেট করা হয়নি</p>
                      <p className="text-[11px] text-gray-400 max-w-[200px]">
                        অ্যাডমিন প্যানেল থেকে Google Maps Embed URL বসান
                      </p>
                    </div>
                  )}
                </div>

                {/* Directions link */}
                <div className="p-4 md:p-5">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold transition-colors group"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Google Maps এ দেখুন
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>

              {/* Quick Contact Card */}
              <motion.div
                variants={fadeUp}
                custom={2}
                className="bg-gradient-to-br from-gray-950 to-gray-800 rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden"
              >
                {/* Ambient orbs */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-500/10 blur-[50px]" />

                <div className="relative z-10 space-y-5">
                  <div>
                    <h3 className="text-base md:text-lg font-black tracking-tight mb-1">
                      দ্রুত যোগাযোগ
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      সরাসরি কল বা মেসেজ করুন
                    </p>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ফোন</p>
                        <p className="text-sm font-bold text-white truncate">{phone}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </a>

                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ইমেইল</p>
                        <p className="text-sm font-bold text-white truncate">{email}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </a>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[11px] text-gray-400 font-medium">
                        {workingHours}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;