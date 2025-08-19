import { useState, useEffect } from "react";
import { CustomerBill } from "@/types/wifi-billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "./photo-upload";
import { LocationPicker } from "./location-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

interface CustomerEditModalProps {
  customer: CustomerBill | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: CustomerBill) => void;
}

export function CustomerEditModal({ customer, isOpen, onClose, onSave }: CustomerEditModalProps) {
  const [formData, setFormData] = useState<CustomerBill | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({ ...formData, amount: Number(formData.amount) });
      onClose();
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Data Pelanggan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Pelanggan</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Nominal Tagihan (Rp)</Label>
            <Input
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'pending' })}
              className="w-full p-2 border rounded-md"
            >
              <option value="pending">Belum Bayar</option>
              <option value="paid">Lunas</option>
            </select>
          </div>
          <div>
            <Label>Nomor WhatsApp</Label>
            <Input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div>
            <Label>Alamat</Label>
            <Input
              placeholder="Alamat lengkap pelanggan"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <Label>Paket Internet</Label>
            <Input
              placeholder="Nama paket (misal: 10 Mbps, 20 Mbps)"
              value={formData.packageName || ''}
              onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
            />
          </div>
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
            customerName={formData.name || 'Pelanggan'}
          />
          
          <PhotoUpload
            currentPhotoUrl={formData.photoUrl}
            onPhotoChange={(photoUrl) => setFormData({ ...formData, photoUrl: photoUrl || '' })}
            customerName={formData.name || 'Pelanggan'}
          />
          
          <div>
            <Label>Catatan (Opsional)</Label>
            <Input
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}