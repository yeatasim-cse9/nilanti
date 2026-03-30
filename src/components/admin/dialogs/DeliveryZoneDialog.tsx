import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateDeliveryZone, useUpdateDeliveryZone } from "@/hooks/useAdminData";

interface DeliveryZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: any;
}

export const DeliveryZoneDialog = ({ open, onOpenChange, zone }: DeliveryZoneDialogProps) => {
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    name_bn: "",
    charge: "",
    min_order_free_delivery: "",
    estimated_days: "",
    is_active: true,
  });

  useEffect(() => {
    if (zone) {
      setForm({
        name: zone.name || "",
        name_bn: zone.name_bn || "",
        charge: zone.charge?.toString() || "",
        min_order_free_delivery: zone.min_order_free_delivery?.toString() || "",
        estimated_days: zone.estimated_days?.toString() || "",
        is_active: zone.is_active ?? true,
      });
    } else {
      setForm({
        name: "",
        name_bn: "",
        charge: "",
        min_order_free_delivery: "",
        estimated_days: "",
        is_active: true,
      });
    }
  }, [zone, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: form.name,
      name_bn: form.name_bn,
      charge: parseFloat(form.charge),
      min_order_free_delivery: form.min_order_free_delivery ? parseFloat(form.min_order_free_delivery) : null,
      estimated_days: form.estimated_days ? parseInt(form.estimated_days) : 3,
      is_active: form.is_active,
    };

    try {
      if (zone) {
        await updateZone.mutateAsync({ id: zone.id, ...data });
      } else {
        await createZone.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{zone ? "জোন এডিট করুন" : "নতুন ডেলিভারি জোন"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>নাম (English)</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>নাম (বাংলা)</Label>
            <Input
              value={form.name_bn}
              onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ডেলিভারি চার্জ (৳)</Label>
              <Input
                type="number"
                value={form.charge}
                onChange={(e) => setForm({ ...form, charge: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>ফ্রি ডেলিভারি (৳ উপরে)</Label>
              <Input
                type="number"
                value={form.min_order_free_delivery}
                onChange={(e) => setForm({ ...form, min_order_free_delivery: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>আনুমানিক দিন</Label>
            <Input
              type="number"
              value={form.estimated_days}
              onChange={(e) => setForm({ ...form, estimated_days: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
            <Label>সক্রিয়</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
