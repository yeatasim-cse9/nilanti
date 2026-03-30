import { forwardRef } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface OrderItem {
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_area?: string | null;
  subtotal: number;
  discount_amount?: number | null;
  delivery_charge?: number | null;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items?: OrderItem[];
}

interface InvoicePDFProps {
  order: Order;
}

const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(({ order }, ref) => {
  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;
  
  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      cod: "ক্যাশ অন ডেলিভারি",
      uddoktapay: "অনলাইন পেমেন্ট",
      bkash: "বিকাশ",
      nagad: "নগদ",
    };
    return methods[method] || method;
  };

  const getPaymentStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      unpaid: "বাকি",
      partial: "আংশিক পরিশোধ",
      paid: "পরিশোধিত",
      refunded: "ফেরত",
    };
    return statuses[status] || status;
  };

  return (
    <div
      ref={ref}
      className="bg-white p-8 text-black min-w-[600px]"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-700">অর্গানিক স্টোর</h1>
          <p className="text-sm text-gray-600 mt-1">১০০% প্রাকৃতিক ও অর্গানিক পণ্য</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">ইনভয়েস</h2>
          <p className="text-sm text-gray-600">অর্ডার: {order.order_number}</p>
          <p className="text-sm text-gray-600">
            তারিখ: {format(new Date(order.created_at), "dd MMMM, yyyy", { locale: bn })}
          </p>
        </div>
      </div>

      {/* Customer & Shipping Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold mb-2 text-gray-800">কাস্টমার তথ্য</h3>
          <p className="text-sm">{order.customer_name}</p>
          <p className="text-sm">{order.customer_phone}</p>
          {order.customer_email && <p className="text-sm">{order.customer_email}</p>}
        </div>
        <div>
          <h3 className="font-bold mb-2 text-gray-800">ডেলিভারি ঠিকানা</h3>
          <p className="text-sm">{order.shipping_address}</p>
          <p className="text-sm">
            {order.shipping_area && `${order.shipping_area}, `}
            {order.shipping_city}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 font-bold">পণ্য</th>
            <th className="text-center py-2 font-bold">পরিমাণ</th>
            <th className="text-right py-2 font-bold">দাম</th>
            <th className="text-right py-2 font-bold">মোট</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-2">
                {item.product_name}
                {item.variant_name && (
                  <span className="text-gray-500 text-xs block">{item.variant_name}</span>
                )}
              </td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-right py-2">{formatPrice(item.unit_price)}</td>
              <td className="text-right py-2">{formatPrice(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-1 text-sm">
            <span>সাবটোটাল:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {(order.discount_amount ?? 0) > 0 && (
            <div className="flex justify-between py-1 text-sm text-green-600">
              <span>ছাড়:</span>
              <span>-{formatPrice(order.discount_amount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between py-1 text-sm">
            <span>ডেলিভারি চার্জ:</span>
            <span>{formatPrice(order.delivery_charge || 0)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
            <span>সর্বমোট:</span>
            <span className="text-green-700">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-gray-600">পেমেন্ট পদ্ধতি: </span>
            <span className="font-medium">{getPaymentMethodText(order.payment_method)}</span>
          </div>
          <div>
            <span className="text-gray-600">পেমেন্ট স্ট্যাটাস: </span>
            <span className="font-medium">{getPaymentStatusText(order.payment_status)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
        <p>ধন্যবাদ আমাদের থেকে কেনাকাটা করার জন্য!</p>
        <p className="mt-1">যেকোনো সমস্যায় যোগাযোগ করুন: +880 1XXX-XXXXXX</p>
      </div>
    </div>
  );
});

InvoicePDF.displayName = "InvoicePDF";

export default InvoicePDF;
