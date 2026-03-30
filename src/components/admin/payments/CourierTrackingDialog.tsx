import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Truck, Package, MapPin, CheckCircle2, Banknote, Clock, ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: any;
  onCollectPayment: () => void;
}

const getSteadfastBadge = (status: string | null | undefined) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "পেন্ডিং", className: "bg-amber-100 text-amber-700 border-amber-200" },
    in_review: { label: "রিভিউতে", className: "bg-blue-100 text-blue-700 border-blue-200" },
    delivered: { label: "ডেলিভার্ড", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    partial_delivered: { label: "আংশিক", className: "bg-teal-100 text-teal-700 border-teal-200" },
    cancelled: { label: "বাতিল", className: "bg-rose-100 text-rose-700 border-rose-200" },
    hold: { label: "হোল্ড", className: "bg-slate-100 text-slate-700 border-slate-200" },
  };
  if (!status) return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 shadow-sm px-2.5">অজানা</Badge>;
  const { label, className } = config[status] || { label: status, className: "bg-slate-50 text-slate-700 border-slate-200" };
  return <Badge variant="outline" className={`${className} shadow-sm px-2.5 font-medium tracking-wide`}>{label}</Badge>;
};

export const CourierTrackingDialog = ({ open, onOpenChange, order, onCollectPayment }: Props) => {
  if (!order) return null;

  const steps = [
    { label: "অর্ডার কনফার্মড", desc: "সিস্টেমে অর্ডার যুক্ত হয়েছে", icon: Package, done: true, current: false },
    { label: "পিকআপ রিকোয়েস্ট", desc: "স্টেডফাস্টে রিকোয়েস্ট পাঠানো হয়েছে", icon: Truck, done: !!order.steadfast_consignment_id, current: !["in_review", "delivered", "partial_delivered"].includes(order.steadfast_status) && !!order.steadfast_consignment_id },
    { label: "ট্রানজিটে", desc: "হাব বা ডেলিভারি ম্যানের কাছে", icon: MapPin, done: ["delivered", "partial_delivered"].includes(order.steadfast_status), current: ["in_review"].includes(order.steadfast_status) },
    { label: "ডেলিভারি সম্পন্ন", desc: "গ্রাহকের কাছে পৌঁছেছে", icon: CheckCircle2, done: order.steadfast_status === "delivered" || order.steadfast_status === "partial_delivered", current: order.steadfast_status === "delivered" && !order.cod_received },
    { label: "পেমেন্ট রিসিভড", desc: "মার্চেন্ট পেমেন্ট গ্রহণ করেছে", icon: Banknote, done: !!order.cod_received, current: false },
  ];

  const totalAmount = Number(order.total_amount || 0);
  const deliveryCharge = 130;
  const codCharge = Math.round(totalAmount * 0.01 * 100) / 100;
  const netPayable = totalAmount - deliveryCharge - codCharge;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95%] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 p-6 pb-5 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white border border-white/20">
                <Truck className="h-5 w-5" />
              </span>
              কুরিয়ার ট্র্যাকিং
            </DialogTitle>
            <DialogDescription className="text-blue-100 font-medium pt-1">
              অর্ডার নম্বর: <span className="font-mono text-white font-bold bg-white/20 px-2 py-0.5 rounded ml-1">{order.order_number}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50">
          
          {/* Top Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-normal mb-1">কুরিয়ার</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm">স্টেডফাস্ট এক্সপ্রেস</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-normal mb-1">স্ট্যাটাস</p>
                {getSteadfastBadge(order.steadfast_status)}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-normal mb-1.5">কনসাইনমেন্ট আইডি</p>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="font-mono font-bold text-blue-700 tracking-wide text-sm">{order.steadfast_consignment_id || "N/A"}</span>
                {order.steadfast_consignment_id && (
                  <a 
                    href={`https://steadfast.com.bd/t/${order.steadfast_tracking_code || order.steadfast_consignment_id}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100/50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    ট্র্যাক করুন <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 pb-2">
            <p className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
               <Clock className="h-4 w-4 text-blue-500" /> ডেলিভারি টাইমলাইন
            </p>
            
            <div className="space-y-0 text-sm">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Timeline Line */}
                  {i !== steps.length - 1 && (
                    <div className={`absolute top-7 left-3 w-0.5 h-full -ml-[1px] ${step.done ? "bg-blue-500" : "bg-slate-200"}`}></div>
                  )}
                  
                  {/* Timeline Dot/Icon */}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    step.done 
                      ? "bg-blue-500 text-white shadow-sm ring-4 ring-blue-50" 
                      : step.current 
                        ? "bg-white border-2 border-blue-500 text-blue-500 ring-4 ring-blue-50" 
                        : "bg-slate-100 border border-slate-200 text-slate-400"
                  }`}>
                    {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.current ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> : <step.icon className="h-3 w-3" />}
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-bold text-sm ${step.current ? "text-blue-700" : step.done ? "text-slate-800" : "text-slate-500"}`}>
                          {step.label}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${step.current ? "text-blue-600/80" : "text-slate-500"}`}>
                          {step.desc}
                        </p>
                      </div>
                      
                      {/* Special Status Badges on specific steps */}
                      {i === 4 && order.cod_received && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-1.5 py-0 text-[10px] uppercase font-bold">
                          রিসিভড
                        </Badge>
                      )}
                      {i === 4 && !order.cod_received && order.steadfast_status === "delivered" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-1.5 py-0 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> পেন্ডিং
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COD Breakdown */}
          {order.payment_method === "cod" && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-xl p-4 border border-amber-200/60 shadow-sm relative overflow-hidden">
               {/* Decorative icon */}
               <Banknote className="absolute -right-2 -bottom-2 h-20 w-20 text-amber-500/5 rotate-[-15deg]" />
               
              <p className="font-bold text-amber-900 text-[11px] uppercase tracking-normal mb-3 flex items-center gap-1.5 relative z-10">
                <Banknote className="h-3.5 w-3.5 text-amber-600" /> COD পেমেন্ট সামারি
              </p>
              
              <div className="space-y-2 text-[13px] relative z-10 font-medium">
                <div className="flex justify-between items-center text-slate-600">
                  <span>কালেকশন পরিমাণ</span>
                  <span className="font-semibold text-slate-800">৳{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-rose-600">- ৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>COD চার্জ (১%)</span>
                  <span className="text-rose-600">- ৳{codCharge.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-amber-200/60 pt-2 mt-2">
                  <span className="text-amber-800 font-bold">নেট প্রাপ্য (মার্চেন্ট পেমেন্ট)</span>
                  <span className="text-emerald-700 font-black text-base">৳{netPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex gap-3 rounded-b-2xl">
           <Button 
              variant="outline" 
              className="flex-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-bold group"
              onClick={() => {
                if(order.steadfast_tracking_code || order.steadfast_consignment_id) {
                  window.open(`https://steadfast.com.bd/t/${order.steadfast_tracking_code || order.steadfast_consignment_id}`, '_blank');
                }
              }}
              disabled={!(order.steadfast_tracking_code || order.steadfast_consignment_id)}
            >
              <ExternalLink className="h-4 w-4 mr-2 text-blue-500 group-hover:text-blue-700" /> সাইটে ট্র্যাক করুন
            </Button>
            
            {order.steadfast_status === "delivered" && !order.cod_received && (
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 text-white font-bold group" 
                onClick={() => { onOpenChange(false); onCollectPayment(); }}
              >
                পেমেন্ট নিন <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
