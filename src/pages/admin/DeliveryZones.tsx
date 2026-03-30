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

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>জোন</TableHead>
              <TableHead className="text-right">চার্জ</TableHead>
              <TableHead className="text-right">ফ্রি ডেলিভারি</TableHead>
              <TableHead className="text-center">সময়</TableHead>
              <TableHead className="text-center">সক্রিয়</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones?.map((zone: any) => (
              <TableRow key={zone.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{zone.name_bn}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ৳{zone.charge}
                </TableCell>
                <TableCell className="text-right">
                  {zone.min_order_free_delivery ? `৳${zone.min_order_free_delivery}+` : "প্রযোজ্য নয়"}
                </TableCell>
                <TableCell className="text-center">{zone.estimated_days} দিন</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={(v) => handleToggle(zone.id, v)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(zone.id)}>
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
