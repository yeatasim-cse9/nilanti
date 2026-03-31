import { useState } from "react";
import { Plus, Edit, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useDeliveryZones, useUpdateDeliveryZone, useDeleteDeliveryZone } from "@/hooks/useAdminData";
import { DeliveryZoneDialog } from "@/components/admin/dialogs/DeliveryZoneDialog";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDeliveryZones = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editZone, setEditZone] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: zones, isLoading } = useDeliveryZones();
  const updateZone = useUpdateDeliveryZone();
  const deleteZone = useDeleteDeliveryZone();

  const handleEdit = (zone: any) => {
    setEditZone(zone);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteZone.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    await updateZone.mutateAsync({ id, is_active: value });
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
          <h1 className="text-2xl font-bold text-foreground">ডেলিভারি জোন</h1>
          <p className="text-muted-foreground">ডেলিভারি চার্জ পরিচালনা করুন ({zones?.length || 0}টি)</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditZone(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          নতুন জোন
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table className="table-responsive-stack">
          <TableHeader className="bg-slate-50/50 hidden md:table-header-group">
            <TableRow>
              <TableHead className="font-bold">জোন</TableHead>
              <TableHead className="text-right font-bold">চার্জ</TableHead>
              <TableHead className="text-right font-bold">ফ্রি ডেলিভারি</TableHead>
              <TableHead className="text-center font-bold">সময়</TableHead>
              <TableHead className="text-center font-bold">সক্রিয়</TableHead>
              <TableHead className="text-right font-bold pr-6">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones?.map((zone: any) => (
              <TableRow key={zone.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell data-label="জোন">
                  <div className="flex items-center gap-3 md:justify-start justify-end">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-slate-900">{zone.name_bn}</span>
                  </div>
                </TableCell>
                <TableCell data-label="চার্জ" className="text-right md:text-right text-right font-bold text-slate-900">
                  ৳{zone.charge}
                </TableCell>
                <TableCell data-label="ফ্রি ডেলিভারি" className="text-right md:text-right text-right font-medium text-slate-600">
                  {zone.min_order_free_delivery ? `৳${zone.min_order_free_delivery}+` : "প্রযোজ্য নয়"}
                </TableCell>
                <TableCell data-label="সময়" className="text-center md:text-center text-right font-medium text-slate-600">
                  {zone.estimated_days} দিন
                </TableCell>
                <TableCell data-label="সক্রিয়" className="text-center md:text-center text-right">
                  <div className="flex items-center md:justify-center justify-end">
                    <Switch
                      checked={zone.is_active}
                      onCheckedChange={(v) => handleToggle(zone.id, v)}
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
                      onClick={() => handleEdit(zone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-rose-50 text-rose-600"
                      onClick={() => setDeleteId(zone.id)}
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

      <DeliveryZoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        zone={editZone}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ডেলিভারি জোন স্থায়ীভাবে মুছে ফেলা হবে।
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

export default AdminDeliveryZones;
