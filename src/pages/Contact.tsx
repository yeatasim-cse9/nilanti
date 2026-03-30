import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useAdminData";

const Contact = () => {
  const { getItemCount } = useCart();
  const [loading, setLoading] = useState(false);
  const { data: settings } = useSiteSettings();

  const phone = settings?.phone || "+880 1XXX-XXXXXX";
  const email = settings?.email || "info@desiorganic.com";
  const address = settings?.address || "ঢাকা, বাংলাদেশ";
  const workingHours = settings?.working_hours || "প্রতিদিন সকাল ৯টা - রাত ১০টা";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("আপনার বার্তা পাঠানো হয়েছে। শীঘ্রই যোগাযোগ করা হবে।");
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={getItemCount()} />

      <main className="flex-1 py-12">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              যোগাযোগ করুন
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ফোন</h3>
                    <p className="text-muted-foreground">{phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ইমেইল</h3>
                    <p className="text-muted-foreground">{email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ঠিকানা</h3>
                    <p className="text-muted-foreground">
                      {address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">সেবার সময়</h3>
                    <p className="text-muted-foreground">{workingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card p-8 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">বার্তা পাঠান</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">আপনার নাম *</Label>
                      <Input id="name" required placeholder="নাম লিখুন" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">ফোন নম্বর *</Label>
                      <Input id="phone" required placeholder="01XXXXXXXXX" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">বিষয়</Label>
                    <Input id="subject" placeholder="বিষয় লিখুন" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">বার্তা *</Label>
                    <Textarea
                      id="message"
                      required
                      placeholder="আপনার বার্তা লিখুন..."
                      rows={5}
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? "পাঠানো হচ্ছে..." : (
                      <>
                        <Send className="h-4 w-4" />
                        বার্তা পাঠান
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;