import { Truck, MapPin, Clock, Package, Shield } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";

const ShippingPolicy = () => {
  const { getItemCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={getItemCount()} />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              শিপিং পলিসি
            </h1>
            <p className="text-muted-foreground">
              ডেলিভারি ও শিপিং সম্পর্কিত তথ্য
            </p>
          </div>

          <div className="space-y-8">
            {/* Delivery Charges */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground mb-4">ডেলিভারি চার্জ</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">ঢাকার ভেতরে</h3>
                      <p className="text-2xl font-bold text-primary mb-1">৳৬০</p>
                      <p className="text-sm text-muted-foreground">১-২ কার্যদিবস</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">ঢাকার বাইরে</h3>
                      <p className="text-2xl font-bold text-primary mb-1">৳১২০</p>
                      <p className="text-sm text-muted-foreground">২-৪ কার্যদিবস</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Free Delivery */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
              <h2 className="text-lg font-semibold text-foreground mb-3">🎉 ফ্রি ডেলিভারি</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• ঢাকার ভেতরে ৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি</li>
                <li>• ঢাকার বাইরে ১০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি</li>
                <li>• বিশেষ প্রমোশনে সব অর্ডারে ফ্রি ডেলিভারি</li>
              </ul>
            </div>

            {/* Delivery Time */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">ডেলিভারি সময়</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">ঢাকা:</span>
                      অর্ডার কনফার্মের ১-২ কার্যদিবসের মধ্যে
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">ঢাকার বাইরে:</span>
                      অর্ডার কনফার্মের ২-৪ কার্যদিবসের মধ্যে
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">দ্রষ্টব্য:</span>
                      শুক্রবার ও সরকারি ছুটির দিন গণনা হবে না
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Courier Partner */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <Package className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">কুরিয়ার পার্টনার</h2>
                  <p className="text-muted-foreground mb-4">
                    আমরা বিশ্বস্ত কুরিয়ার সার্ভিসের মাধ্যমে আপনার পণ্য ডেলিভারি করি। প্রতিটি অর্ডারের জন্য ট্র্যাকিং নম্বর দেওয়া হয়।
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Steadfast Courier</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Sundarban Courier</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Pathao</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safe Packaging */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">নিরাপদ প্যাকেজিং</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• সব পণ্য সাবধানে প্যাক করা হয়</li>
                    <li>• ভাঙনীয় পণ্যে অতিরিক্ত প্রটেকশন</li>
                    <li>• খাদ্যপণ্যে ফুড-গ্রেড প্যাকেজিং</li>
                    <li>• পরিবেশ বান্ধব প্যাকেজিং ম্যাটেরিয়াল</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-muted/50 p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">গুরুত্বপূর্ণ তথ্য</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• ডেলিভারির আগে ফোন করে জানানো হবে</li>
                <li>• পণ্য গ্রহণের সময় চেক করে নিন</li>
                <li>• সমস্যা থাকলে তৎক্ষণাৎ জানান</li>
                <li>• ক্যাশ অন ডেলিভারিতে সঠিক টাকা রাখুন</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;