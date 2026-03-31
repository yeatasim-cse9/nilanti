import { useState } from "react";
import { Plus, Edit, Trash2, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCoupons, useUpdateCoupon, useDeleteCoupon } from "@/hooks/useAdminData";
import { CouponDialog } from "@/components/admin/dialogs/CouponDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const AdminCoupons = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: coupons, isLoading } = useCoupons();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const handleEdit = (coupon: any) => {
    setEditCoupon(coupon);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCoupon.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    await updateCoupon.mutateAsync({ id, is_active: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">কুপন</h1>
          <p className="text-muted-foreground">ডিসকাউন্ট কুপন পরিচালনা করুন ({coupons?.length || 0}টি)</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditCoupon(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          নতুন কুপন
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table className="table-responsive-stack">
          <TableHeader className="bg-slate-50/50 hidden md:table-header-group">
            <TableRow>
              <TableHead className="font-bold">কোড</TableHead>
              <TableHead className="font-bold">ছাড়</TableHead>
              <TableHead className="text-center font-bold">মিনিমাম অর্ডার</TableHead>
              <TableHead className="text-center font-bold">ব্যবহার</TableHead>
              <TableHead className="font-bold">মেয়াদ</TableHead>
              <TableHead className="text-center font-bold">সক্রিয়</TableHead>
              <TableHead className="text-right font-bold pr-6">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons?.map((coupon: any) => (
              <TableRow key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell data-label="কোড">
                  <div className="flex flex-col md:items-start items-end">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <code className="font-mono font-bold text-slate-900">{coupon.code}</code>
                      {coupon.is_public && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/20 text-primary bg-primary/5 uppercase font-bold tracking-wider">পাবলিক</Badge>}
                    </div>
                    {coupon.name && <p className="text-[10px] font-medium text-slate-500 mt-0.5 md:ml-6">{coupon.name}</p>}
                  </div>
                </TableCell>
                <TableCell data-label="ছাড়">
                  <div className="flex md:justify-start justify-end">
                    <Badge variant="secondary" className="gap-1 font-bold bg-emerald-50 text-emerald-700 border-emerald-100">
                      {coupon.discount_type === "percentage" || coupon.discount_type === "percentage_free_shipping" ? (
                        <><Percent className="h-3 w-3" />{coupon.discount_value}%</>
                      ) : coupon.discount_type === "free_shipping" ? (
                        <>🚚 ফ্রি শিপিং</>
                      ) : (
                        <>৳{coupon.discount_value}</>
                      )}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell data-label="মিনিমাম অর্ডার" className="text-center md:text-center text-right font-semibold">
                  ৳{coupon.min_order_amount || 0}
                </TableCell>
                <TableCell data-label="ব্যবহার" className="text-center md:text-center text-right">
                  <span className="font-medium text-slate-700">{coupon.usage_count || 0}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-500">{coupon.usage_limit || "∞"}</span>
                </TableCell>
                <TableCell data-label="মেয়াদ" className="text-sm md:text-left text-right font-medium text-slate-600">
                  {coupon.valid_until
                    ? format(new Date(coupon.valid_until), "dd MMM, yyyy", { locale: bn })
                    : "সীমাহীন"}
                </TableCell>
                <TableCell data-label="সক্রিয়" className="text-center md:text-center text-right">
                  <div className="flex items-center md:justify-center justify-end">
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={(v) => handleToggle(coupon.id, v)}
                      className="scale-90"
                    />
                  </div>
                </TableCell>
                <TableCell data-label="অ্যাকশন" className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-slate-100"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-rose-50 text-rose-600"
                      onClick={() => setDeleteId(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        coupon={editCoupon}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কুপন স্থায়ীভাবে মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCoupons;
