import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CreditCard, User, MapPin, Phone, Calendar, Search, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: any;
  onCollectPayment: () => void;
  onTrackCourier: () => void;
  onRefund: () => void;
}

const getPaymentBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "পেইড", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    unpaid: { label: "বকেয়া", cls: "bg-rose-100/80 text-rose-700 border-rose-200" },
    partial: { label: "আংশিক", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    refunded: { label: "রিফান্ড", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return <Badge variant="outline" className={`${cls} rounded-md font-medium px-2 shadow-sm`}>{label}</Badge>;
};

const formatDate = (d: any) => {
  try { return d ? format(new Date(d), "dd MMM yyyy, hh:mm a", { locale: bn }) : "—"; } catch { return "—"; }
};

export const PaymentDetailDialog = ({ open, onOpenChange, order, onCollectPayment, onTrackCourier, onRefund }: Props) => {
  if (!order) return null;

  const totalAmount = Number(order.total_amount || 0);
  const paidAmount = Number(order.paid_amount || 0);
  const due = totalAmount - paidAmount;
  const deliveryCharge = 130;
  const codCharge = Math.round(totalAmount * 0.01 * 100) / 100;
  const transactions: any[] = order.payment_transactions || [];
  const progressPercent = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95%] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 pb-5 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="p-2 bg-white/10 rounded-lg text-white border border-white/20">
                <Search className="h-5 w-5" />
              </span>
              পেমেন্ট বিস্তারিত
            </DialogTitle>
            <DialogDescription className="text-slate-300 font-medium pt-1">
              অর্ডার নম্বর: <span className="font-mono text-white font-bold bg-white/20 px-2 py-0.5 rounded ml-1">{order.order_number}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          
          {/* Payment breakdown visual bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">পেমেন্ট স্ট্যাটাস</span>
              {getPaymentBadge(order.payment_status)}
            </div>
            
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 flex">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${order.payment_status === 'refunded' ? 'bg-sky-500' : 'bg-emerald-500'}`} 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span className="text-emerald-600 font-bold">পেইড: ৳{paidAmount.toLocaleString()} ({progressPercent}%)</span>
              <span className="text-rose-600 font-bold">বকেয়া: ৳{due.toLocaleString()}</span>
              <span className="text-slate-700 font-bold">মোট: ৳{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 font-semibold text-slate-700 text-[13px] flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" /> গ্রাহক ও অর্ডার তথ্য
              </div>
              <div className="p-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between items-center"><span className="text-slate-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> তারিখ</span><span className="font-medium text-slate-700">{formatDate(order.created_at)}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">নাম</span><span className="font-semibold text-slate-800">{order.customer_name}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> ফোন</span><span className="font-mono font-medium text-slate-700">{order.customer_phone}</span></div>
                <div className="flex justify-between items-start pt-1"><span className="text-slate-500 flex items-center gap-1.5 mt-0.5"><MapPin className="h-3.5 w-3.5" /> ঠিকানা</span><span className="text-right max-w-[60%] font-medium text-slate-700">{order.shipping_address}, {order.shipping_city}</span></div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 font-semibold text-slate-700 text-[13px] flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> পেমেন্ট সামারি
              </div>
              <div className="p-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">পেমেন্ট মেথড</span>
                  <Badge variant="outline" className={`font-mono text-[11px] tracking-wide uppercase px-2 py-0 shadow-none ${order.payment_method === 'bkash' ? 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20' : order.payment_method === 'cod' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {order.payment_method === "cod" ? "ক্যাশ অন ডেলিভারি" : order.payment_method}
                  </Badge>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ট্রানজেকশন ID</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 rounded-sm border border-emerald-100">{order.transaction_id}</span>
                  </div>
                )}
                {transactions.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">কিস্তি সংখ্যা</span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 rounded-sm">{transactions.length}টি পেমেন্ট</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <span className="text-[11px] text-slate-500 leading-tight">পরবর্তীতে বিস্তারিত জানতে কাস্টমারের পেমেন্ট মাধ্যম ভেরিফাই করুন।</span>
                </div>
              </div>
            </div>
          </div>

          {/* Courier info */}
          {order.steadfast_consignment_id && (
            <div className="bg-blue-50/40 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
               <div className="bg-blue-100/50 px-4 py-2.5 border-b border-blue-100 font-semibold text-blue-800 text-[13px] flex items-center gap-2">
                কুরিয়ার ও শিপিং তথ্য
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between items-center"><span className="text-blue-700">কুরিয়ার</span><span className="font-medium">স্টেডফাস্ট এক্সপ্রেস</span></div>
                  <div className="flex justify-between items-center"><span className="text-blue-700">কনসাইনমেন্ট ID</span>
                    <a href={`https://steadfast.com.bd/t/${order.steadfast_tracking_code || order.steadfast_consignment_id}`}
                      target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline flex items-center gap-1 font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-sm">
                      {order.steadfast_consignment_id} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex justify-between items-center"><span className="text-blue-700">ডেলিভারি স্ট্যাটাস</span>
                    <Badge className={order.steadfast_status === "delivered" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "bg-white text-blue-700 hover:bg-white border border-blue-200"}>
                      {order.steadfast_status === "delivered" ? "✅ ডেলিভার্ড" : order.steadfast_status || "পেন্ডিং"}
                    </Badge>
                  </div>
                </div>

                {/* COD breakdown */}
                {order.payment_method === "cod" && (
                  <div className="bg-white rounded-lg p-3 border border-amber-200/50 shadow-sm space-y-2 text-[13px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <p className="font-bold text-amber-800 text-[11px] uppercase tracking-normal mb-2">কুরিয়ার চার্জ ব্রেকডাউন</p>
                    <div className="flex justify-between"><span className="text-slate-600">ডেলিভারি চার্জ</span><span className="font-medium">-৳{deliveryCharge}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">COD (১%)</span><span className="font-medium">-৳{codCharge.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">COD স্ট্যাটাস</span>
                      <Badge variant="outline" className={order.cod_received ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                        {order.cod_received ? "✅ মার্চেন্ট রিসিভড" : order.steadfast_status === "delivered" ? "💰 ট্রান্সফার পেন্ডিং" : "⏳ পেন্ডিং"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment history Timeline */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 font-semibold text-slate-700 text-[13px] flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-slate-500" /> পেমেন্ট টাইমলাইন
              </div>
              <div className="p-4 space-y-4">
                {transactions.map((t: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                      {i !== transactions.length - 1 && <div className="w-px h-full bg-slate-200 my-1"></div>}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-[15px]">৳{Number(t.amount).toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 text-[10px] uppercase font-mono px-1.5 py-0">
                              {t.method}
                            </Badge>
                            {t.txn_id && <span className="text-[11px] font-mono text-emerald-600 font-medium bg-emerald-50 px-1.5 rounded">TXN: {t.txn_id}</span>}
                          </div>
                          {t.note && <p className="text-[11px] text-slate-500 mt-1 italic">"{t.note}"</p>}
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                          {t.recorded_at ? format(new Date(t.recorded_at), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action buttons footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap justify-end gap-2.5 rounded-b-2xl">
          {order.steadfast_consignment_id && (
            <Button size="sm" variant="outline" onClick={() => { onOpenChange(false); onTrackCourier(); }} className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-medium h-9">
              🚚 ট্রাক করুন
            </Button>
          )}
          {(order.payment_status === "paid" || order.payment_status === "partial") && (
            <Button size="sm" variant="outline" onClick={() => { onOpenChange(false); onRefund(); }} className="bg-white border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-medium h-9">
              🔄 রিফান্ড
            </Button>
          )}
          {order.payment_status !== "paid" && (
            <Button size="sm" onClick={() => { onOpenChange(false); onCollectPayment(); }} className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-bold h-9 px-5">
              💰 পেমেন্ট নিন
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
