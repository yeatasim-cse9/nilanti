import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { AlertTriangle, RefreshCcw, HandCoins, Truck, Info, CreditCard } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: any;
}

const REFUND_REASONS = [
  "সাইজ ম্যাচ হয়নি",
  "কালার ভিন্ন",
  "পণ্যে ত্রুটি আছে",
  "ভুল পণ্য পাঠানো হয়েছে",
  "কাস্টমার সন্তুষ্ট নয়",
  "কুরিয়ার ডেলিভারি ব্যর্থ",
  "কুরিয়ার পণ্য ক্ষতিগ্রস্ত করেছে",
  "ডেলিভারি সমস্যা",
  "অন্যান্য",
];

export const RefundDialog = ({ open, onOpenChange, order }: Props) => {
  const [isPartial, setIsPartial] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(REFUND_REASONS[0]);
  const [returnChargeBySeller, setReturnChargeBySeller] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPaid = Number(order?.paid_amount || order?.total_amount || 0);
  const returnCharge = 130;

  useEffect(() => {
    if (open && order) {
      setAmount(totalPaid.toString());
      setIsPartial(false);
      setReason(REFUND_REASONS[0]);
      setReturnChargeBySeller(true);
    }
  }, [open, order, totalPaid]);

  const actualRefund = isPartial ? Number(amount) : totalPaid;
  const netRefund = returnChargeBySeller ? actualRefund : actualRefund - returnCharge;

  const handleRefund = async () => {
    if (!order) return;
    const amt = isPartial ? parseFloat(amount) : totalPaid;
    if (!amt || amt <= 0 || amt > totalPaid) { 
      toast.error("সঠিক পরিমাণ লিখুন (০ থেকে মোট পেইড টাকার মধ্যে)"); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        payment_status: "refunded",
        refund_amount: amt,
        refund_reason: reason,
        refund_return_charge_by_seller: returnChargeBySeller,
        refund_date: new Date().toISOString(),
        payment_transactions: arrayUnion({
          type: "refund",
          amount: -amt,
          reason,
          return_charge: returnChargeBySeller ? returnCharge : 0,
          recorded_at: new Date().toISOString(),
        }),
      });
      toast.success("রিফান্ড প্রক্রিয়া সম্পন্ন হয়েছে");
      onOpenChange(false);
    } catch {
      toast.error("রিফান্ড করা যায়নি");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95%] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 p-6 pb-5 relative overflow-hidden">
          {/* Decorative background patterns */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="p-2 bg-white/20 rounded-lg text-white backdrop-blur-sm border border-white/20">
                <RefreshCcw className="h-5 w-5" />
              </span>
              রিফান্ড প্রক্রিয়া
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium pt-1">
              অর্ডার নম্বর <span className="font-mono text-white font-bold bg-black/20 px-2 py-0.5 rounded ml-1">{order.order_number}</span> এর জন্য
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50">
          
          {/* Summary Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-normal">সর্বমোট পেইড</p>
                <p className="text-lg font-bold text-slate-800">৳{totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Refund Type Selector */}
            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <HandCoins className="h-4 w-4 text-emerald-500" /> রিফান্ড টাইপ
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setIsPartial(false); setAmount(totalPaid.toString()); }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    !isPartial 
                      ? "border-primary bg-primary/5 shadow-sm text-primary" 
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-bold">পুরো রিফান্ড</span>
                  <span className="text-xs mt-0.5 opacity-80 font-medium">৳{totalPaid}</span>
                  {!isPartial && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"></div>}
                </button>
                <button 
                  onClick={() => setIsPartial(true)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    isPartial 
                      ? "border-primary bg-primary/5 shadow-sm text-primary" 
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-bold">আংশিক রিফান্ড</span>
                  <span className="text-xs mt-0.5 opacity-80 font-medium">কাস্টম অ্যামাউন্ট</span>
                  {isPartial && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"></div>}
                </button>
              </div>
            </div>

            {/* Custom Amount Input */}
            {isPartial && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 fade-in">
                <Label className="text-slate-700 font-semibold">রিফান্ড পরিমাণ</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">৳</span>
                  <Input 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    type="number" 
                    className="pl-7 font-bold text-lg bg-white border-slate-200 focus-visible:ring-primary shadow-sm"
                  />
                </div>
                {Number(amount) > totalPaid && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> পরিমাণ মোট পেইড থেকে বেশি হতে পারবে না
                  </p>
                )}
              </div>
            )}

            {/* Courier Return Split */}
            {order.steadfast_consignment_id && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/60 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-4 w-4 text-amber-600" />
                  <Label className="text-amber-800 font-semibold m-0">কুরিয়ার রিটার্ন চার্জ (৳{returnCharge})</Label>
                </div>
                
                <div className="flex gap-2 bg-amber-100/30 p-1 rounded-lg border border-amber-200/50">
                  <button 
                    onClick={() => setReturnChargeBySeller(true)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                      returnChargeBySeller 
                        ? "bg-white text-amber-700 shadow-sm border border-amber-200" 
                        : "text-amber-600 hover:bg-amber-100/50"
                    }`}
                  >
                    দোকান বহন করবে
                  </button>
                  <button 
                    onClick={() => setReturnChargeBySeller(false)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                      !returnChargeBySeller 
                        ? "bg-white text-amber-700 shadow-sm border border-amber-200" 
                        : "text-amber-600 hover:bg-amber-100/50"
                    }`}
                  >
                    কাস্টমার বহন করবে
                  </button>
                </div>
                
                <div className="flex items-center justify-between border-t border-amber-200/50 pt-2 mt-2">
                  <span className="text-amber-700/80 text-xs font-medium">প্রকৃত রিফান্ড পেমেন্ট</span>
                  <span className="text-amber-800 font-bold text-sm bg-white px-2 py-0.5 rounded border border-amber-200 shadow-sm">
                    ৳{(Math.max(0, netRefund)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Notice */}
            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed text-blue-700/90 font-medium">
                রিফান্ডের টাকা ম্যানুয়ালি কাস্টমারকে পাঠিয়ে এখানে আপডেট করতে হবে। এই সিস্টেম শুধুমাত্র ডাটা সংরক্ষণের জন্য।
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">রিফান্ডের কারণ</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-white border-slate-200 shadow-sm h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map(r => (
                    <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destructive Warning */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-[11px] font-bold uppercase tracking-normal">সতর্কতা: এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না</p>
            </div>

          </div>
        </div>

        <DialogFooter className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50">
            বাতিল
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRefund} 
            disabled={isSubmitting || Number(amount) > totalPaid || Number(amount) <= 0}
            className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-200"
          >
            {isSubmitting ? "প্রসেস হচ্ছে..." : "রিফান্ড সম্পন্ন করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
