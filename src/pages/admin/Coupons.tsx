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

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>কোড</TableHead>
              <TableHead>ছাড়</TableHead>
              <TableHead className="text-center">মিনিমাম অর্ডার</TableHead>
              <TableHead className="text-center">ব্যবহার</TableHead>
              <TableHead>মেয়াদ</TableHead>
              <TableHead className="text-center">সক্রিয়</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons?.map((coupon: any) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <code className="font-mono font-bold">{coupon.code}</code>
                      {coupon.is_public && <Badge variant="outline" className="text-xs">পাবলিক</Badge>}
                    </div>
                    {coupon.name && <p className="text-xs text-muted-foreground mt-0.5 ml-6">{coupon.name}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    {coupon.discount_type === "percentage" || coupon.discount_type === "percentage_free_shipping" ? (
                      <><Percent className="h-3 w-3" />{coupon.discount_value}%</>
                    ) : coupon.discount_type === "free_shipping" ? (
                      <>🚚 ফ্রি শিপিং</>
                    ) : coupon.discount_type === "buy_x_get_y" ? (
                      <>Buy X Get Y</>
                    ) : (
                      <>৳{coupon.discount_value}</>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">৳{coupon.min_order_amount || 0}</TableCell>
                <TableCell className="text-center">
                  {coupon.usage_count || 0}/{coupon.usage_limit || "∞"}
                </TableCell>
                <TableCell className="text-sm">
                  {coupon.valid_until
                    ? format(new Date(coupon.valid_until), "dd MMM, yyyy", { locale: bn })
                    : "সীমাহীন"}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={(v) => handleToggle(coupon.id, v)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(coupon.id)}>
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
