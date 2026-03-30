import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Landmark, Wallet, Banknote, CreditCard, Save, RefreshCw } from "lucide-react";
import { useUpdateOrder } from "@/hooks/useAdminData";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: any;
}

const COURIER_DELIVERY_CHARGE = 130;
const COD_PERCENT = 0.01;

const PAYMENT_METHODS = [
  { value: "courier_bank", label: "কুরিয়ার ট্রান্সফার (ব্যাংক)", icon: Landmark },
  { value: "courier_bkash", label: "কুরিয়ার ট্রান্সফার (বিকাশ)", icon: Landmark },
  { value: "cash", label: "ক্যাশ", icon: Banknote },
  { value: "bkash", label: "বিকাশ", icon: Wallet },
  { value: "nagad", label: "নগদ", icon: Wallet },
  { value: "rocket", label: "রকেট", icon: Wallet },
  { value: "bank", label: "ব্যাংক", icon: Landmark },
  { value: "card", label: "কার্ড", icon: CreditCard },
];

export const CollectPaymentDialog = ({ open, onOpenChange, order }: Props) => {
  const [isCourierCOD, setIsCourierCOD] = useState(true);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("courier_bank");
  const [txnId, setTxnId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = Number(order?.total_amount || 0);
  const paidAmount = Number(order?.paid_amount || 0);
  const due = totalAmount - paidAmount;
  const deliveryCharge = COURIER_DELIVERY_CHARGE;
  const codCharge = isCourierCOD ? Math.round(totalAmount * COD_PERCENT * 100) / 100 : 0;
  const totalDeduction = isCourierCOD ? deliveryCharge + codCharge : 0;
  const netReceivable = Number(amount || 0) - totalDeduction;

  useEffect(() => {
    if (open && order) {
      setAmount(due.toString());
      setIsCourierCOD(order.payment_method === "cod" && !!order.steadfast_consignment_id);
      setMethod(order.payment_method === "cod" ? "courier_bank" : "bkash");
      setTxnId("");
      setNote("");
    }
  }, [open, order, due]);

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("সঠিক পরিমাণ লিখুন"); return; }
    if (!order) return;
    setIsSubmitting(true);
    try {
      const newPaid = paidAmount + amt;
      const newStatus = newPaid >= totalAmount ? "paid" : "partial";
      const transaction = {
        amount: amt,
        method,
        txn_id: txnId || null,
        note: note || null,
        is_courier_cod: isCourierCOD,
        courier_delivery_charge: isCourierCOD ? deliveryCharge : 0,
        courier_cod_charge: codCharge,
        net_received: isCourierCOD ? netReceivable : amt,
        recorded_at: new Date().toISOString(),
      };
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        paid_amount: newPaid,
        payment_status: newStatus,
        cod_received: isCourierCOD ? true : (order.cod_received || false),
        payment_transactions: arrayUnion(transaction),
      });
      toast.success("পেমেন্ট সফলভাবে রেকর্ড হয়েছে");
      onOpenChange(false);
    } catch (e) {
      toast.error("সংরক্ষণ করা যায়নি");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95%] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="p-2 bg-primary/10 rounded-lg text-primary">
                <Banknote className="h-5 w-5" />
              </span>
              পেমেন্ট সংগ্রহ
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              অর্ডার <span className="font-mono text-primary font-bold">#{order.order_number}</span> এর পেমেন্ট রেকর্ড করুন
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Order Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-medium text-slate-500 mb-1">মোট বিল ও পেইড</span>
              <div className="text-sm font-bold text-slate-800">৳{totalAmount.toLocaleString()}</div>
              <div className="text-xs font-medium text-emerald-600">পেইড: ৳{paidAmount.toLocaleString()}</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-medium text-rose-500 mb-1">বর্তমান বকেয়া</span>
              <div className="text-xl font-extrabold text-rose-600">৳{due.toLocaleString()}</div>
            </div>
          </div>

          {/* Courier Info */}
          {order.steadfast_consignment_id && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold text-blue-800">
                  <Truck className="h-4 w-4" /> কুরিয়ার তথ্য
                </div>
                <Badge className={order.steadfast_status === "delivered" ? "bg-white text-green-700 hover:bg-white" : "bg-white text-blue-700 hover:bg-white"}>
                  {order.steadfast_status === "delivered" ? "✅ ডেলিভার্ড" : order.steadfast_status || "পেন্ডিং"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm bg-white p-3 rounded-lg border border-blue-50/50 shadow-sm">
                <div className="flex justify-between"><span className="text-slate-500 text-xs font-medium">কুরিয়ার</span><span className="font-semibold text-slate-700">স্টেডফাস্ট</span></div>
                <div className="flex justify-between"><span className="text-slate-500 text-xs font-medium">কনসাইনমেন্ট ID</span><span className="font-mono font-bold text-slate-700">{order.steadfast_consignment_id}</span></div>
              </div>

              {/* Payment Source Toggle */}
              <div className="pt-2 space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">পেমেন্ট সোর্স</Label>
                <div className="flex gap-2">
                  <button onClick={() => { setIsCourierCOD(true); setMethod("courier_bank"); }}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${isCourierCOD ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300"}`}>
                    <Truck className="h-5 w-5 mb-1.5" />
                    <span className="text-xs font-bold">কুরিয়ার COD</span>
                  </button>
                  <button onClick={() => { setIsCourierCOD(false); setMethod("cash"); }}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${!isCourierCOD ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300"}`}>
                    <Banknote className="h-5 w-5 mb-1.5" />
                    <span className="text-xs font-bold">সরাসরি</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Label className="text-sm font-bold text-slate-700 flex items-center justify-between">
              পেমেন্ট পরিমাণ 
              <Button variant="ghost" size="sm" onClick={() => setAmount(due.toString())} className="h-6 px-2.5 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary rounded-md">
                পুরো বকেয়া (৳{due})
              </Button>
            </Label>
            <div className="relative shadow-sm rounded-lg overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-100 border-r border-slate-200 flex items-center justify-center text-slate-500 font-medium z-10">৳</div>
              <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" 
                className="pl-14 text-lg font-bold h-12 bg-white border-slate-200 focus-visible:ring-primary/30" />
            </div>
          </div>

          {/* Courier Deductions Summary */}
          {isCourierCOD && Number(amount) > 0 && (
            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50 space-y-2 relative overflow-hidden">
              <div className="absolute -right-2 -top-2 text-amber-100/30">
                <Landmark className="h-20 w-20" />
              </div>
              <p className="font-bold text-amber-800 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-amber-200/50 pb-2 mb-2 relative z-10">
                <Landmark className="h-3.5 w-3.5" /> কুরিয়ার চার্জ কর্তন হিসাব
              </p>
              <div className="space-y-1.5 relative z-10">
                <div className="flex justify-between text-sm"><span className="text-amber-700/80 font-medium">ডেলিভারি চার্জ</span><span className="font-mono text-amber-900">-৳{deliveryCharge}</span></div>
                <div className="flex justify-between text-sm"><span className="text-amber-700/80 font-medium">COD চার্জ (১%)</span><span className="font-mono text-amber-900">-৳{codCharge.toFixed(2)}</span></div>
                <div className="flex justify-between text-[15px] font-bold border-t border-amber-200/50 pt-2 mt-2">
                  <span className="text-slate-700 font-medium">নেট প্রাপ্তি (আপনার একাউন্টে)</span>
                  <span className="text-emerald-700 bg-emerald-100/50 px-2.5 py-0.5 rounded-md border border-emerald-200/50 tracking-tight font-mono">৳{netReceivable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">পেমেন্ট মেথড</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="bg-slate-50/50 border-slate-200 h-11 shadow-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m.value} value={m.value} className="font-medium cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-slate-100 p-1 rounded-md"><m.icon className="h-3.5 w-3.5 text-slate-600" /></span>
                        <span>{m.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">ট্রানজেকশন ID</Label>
              <Input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="ঐচ্ছিক (TXN-XXXX)" className="bg-slate-50/50 border-slate-200 h-11 font-mono text-sm shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">নোট <span className="opacity-50 lowercase font-normal">(ঐচ্ছিক)</span></Label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="অতিরিক্ত তথ্য..." className="bg-slate-50/50 border-slate-200 shadow-sm" />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 text-slate-600 hover:bg-slate-100 font-medium">বাতিল</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !amount} className="gap-2 px-6 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 font-bold">
            {isSubmitting ? (
              <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> কনফার্ম পেমেন্ট</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
