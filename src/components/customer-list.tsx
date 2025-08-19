import { useState, useRef } from "react";
import { CustomerBill } from "@/types/wifi-billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Edit, Trash2, Plus, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { CustomerEditModal } from "./customer-edit-modal";
import { CustomerAddModal } from "./customer-add-modal";
import { WhatsAppButton } from "./whatsapp-button";
import { PrintButton } from "./print-button";
import * as XLSX from 'xlsx';

interface CustomerListProps {
  customers: CustomerBill[];
  onUpdateCustomer: (id: string, customer: Partial<CustomerBill>) => void;
  onDeleteCustomer: (id: string) => void;
  onAddCustomer: (customer: Omit<CustomerBill, 'id' | 'createdAt' | 'dueDate'>) => void;
  onImportCustomers: (customers: Omit<CustomerBill, 'id' | 'createdAt' | 'dueDate'>[]) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onDeleteSelected: () => void;
}

export function CustomerList({
  customers,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddCustomer,
  onImportCustomers,
  selectedIds,
  setSelectedIds,
  onDeleteSelected
}: CustomerListProps) {
  const [editingCustomer, setEditingCustomer] = useState<CustomerBill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredCustomers.map(c => c.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleConfirmDeleteSelected = () => {
    // PERBAIKAN ADA DI SINI: Gunakan backtick untuk string literal template
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} pelanggan yang dipilih?`)) {
      onDeleteSelected();
    }
  };

  const handleMarkPaid = (id: string) => {
    onUpdateCustomer(id, { status: 'paid' });
    showSuccess('Tagihan berhasil ditandai sebagai lunas');
  };

  const handleMarkPending = (id: string) => {
    onUpdateCustomer(id, { status: 'pending' });
    showSuccess('Status tagihan diubah menjadi belum bayar');
  };

  const handleEdit = (customer: CustomerBill) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pelanggan ini?')) {
      onDeleteCustomer(id);
      showSuccess('Data pelanggan berhasil dihapus');
    }
  };

  const handleSaveEdit = (customer: CustomerBill) => {
    onUpdateCustomer(customer.id, customer);
    showSuccess('Data pelanggan berhasil diperbarui');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();  
    reader.onload = (e) => {  
      try {  
        const data = e.target?.result;  
        const workbook = XLSX.read(data, { type: 'binary' });  
        const sheetName = workbook.SheetNames[0];  
        const worksheet = workbook.Sheets[sheetName];  
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];  

        const newCustomers = json.map(row => {  
          const name = row['Nama'] || row['nama'] || row['Nama Pelanggan'];  
          const amount = row['Nominal'] || row['nominal'] || row['Amount'];  

          if (!name || amount === undefined || isNaN(Number(amount))) {  
            return null;  
          }  

          return {  
            name: String(name),  
            amount: Number(amount),  
            status: 'pending' as 'pending',  
            notes: row['Catatan'] || row['catatan'] || '',  
          };  
        }).filter(Boolean) as Omit<CustomerBill, 'id' | 'createdAt' | 'dueDate'>[];  

        if (newCustomers.length > 0) {  
          onImportCustomers(newCustomers);  
          showSuccess(`${newCustomers.length} pelanggan berhasil diimpor.`);  
        } else {  
          showError("Tidak ada data valid. Pastikan file Excel memiliki kolom 'Nama' dan 'Nominal'.");  
        }  
      } catch (error) {  
        showError("Gagal mengimpor file. Pastikan format file benar.");  
      } finally {  
        if(fileInputRef.current) {  
            fileInputRef.current.value = '';  
        }  
      }  
    };  
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Tagihan Pelanggan</CardTitle>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Button onClick={handleConfirmDeleteSelected} size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus ({selectedIds.length})
                </Button>
              )}
              <Button onClick={handleImportClick} size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-1" />
                Impor
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari nama pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 w-10">
                    <Checkbox
                      checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Pilih semua"
                    />
                  </th>
                  <th className="text-left p-2">No</th>
                  <th className="text-left p-2">Nama Pelanggan</th>
                  <th className="text-left p-2">Nominal</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Checkbox
                        checked={selectedIds.includes(customer.id)}
                        onCheckedChange={(checked) => handleSelectOne(customer.id, !!checked)}
                        aria-label={`Pilih ${customer.name}`}
                      />
                    </td>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 font-medium">{customer.name}</td>
                    <td className="p-2">Rp {formatCurrency(customer.amount)}</td>
                    <td className="p-2">
                      <Badge
                        variant={customer.status === 'paid' ? 'default' : 'destructive'}
                        className={customer.status === 'paid' ? 'bg-green-500' : ''}
                      >
                        {customer.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {customer.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPaid(customer.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPending(customer.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <WhatsAppButton customer={customer} />
                        <PrintButton customer={customer} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(customer)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(customer.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <input  
          type="file"  
          ref={fileInputRef}  
          onChange={handleFileImport}  
          className="hidden"  
          accept=".xlsx, .xls, .csv"  
        />  

        <CustomerEditModal  
          customer={editingCustomer}  
          isOpen={isEditModalOpen}  
          onClose={() => {  
            setIsEditModalOpen(false);  
            setEditingCustomer(null);  
          }}  
          onSave={handleSaveEdit}  
        />  

        <CustomerAddModal  
          isOpen={isAddModalOpen}  
          onClose={() => setIsAddModalOpen(false)}  
          onAdd={onAddCustomer}  
        />  
    </>
  );
}
