import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerBill } from "@/types/wifi-billing";
import { useToast } from "@/components/ui/use-toast";

interface WhatsAppButtonProps {
  customer: CustomerBill;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function WhatsAppButton({ customer, variant = "outline", size = "sm" }: WhatsAppButtonProps) {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  const generateWhatsAppMessage = () => {
    const statusText = customer.status === 'pending' ? '⚠️ BELUM LUNAS' : '✅ SUDAH LUNAS';
    const dueDate = formatDate(customer.due_date);
    const amount = formatCurrency(customer.amount);
    
    return `🌐 *TAGIHAN INTERNET - ZAIDNET*

👤 *Nama:* ${customer.name}
      📦 *Paket:* ${customer.package_name || 'Paket Internet'}
💰 *Nominal:* ${amount}
📅 *Jatuh Tempo:* ${dueDate}
📍 *Status:* ${statusText}

${customer.status === 'pending' 
  ? `⏰ *Reminder:* Tagihan Anda akan jatuh tempo pada ${dueDate}. Mohon segera lakukan pembayaran untuk menghindari gangguan layanan.

💳 *Cara Pembayaran:*
- Transfer Bank
- Bayar Tunai ke Teknisi

📞 *Kontak:* Hubungi kami jika ada pertanyaan` 
  : `✅ *Terima kasih!* Pembayaran Anda sudah diterima.

🌐 Layanan internet Anda akan terus berjalan normal.`}

---
*ZaidNet - Layanan Internet Terpercaya*
🏠 Melayani: Hotspot & PPPoE
📱 Customer Service: [Nomor CS]`;
  };

  const handleWhatsAppClick = () => {
    if (!customer.phone_number || customer.phone_number.trim() === '') {
      toast({
        title: "Nomor WhatsApp Tidak Tersedia",
        description: "Pelanggan ini belum memiliki nomor WhatsApp. Silakan edit data pelanggan terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }

    // Format nomor telepon (hapus karakter non-digit, tambah 62 jika diawali 0)
          let formattedPhone = customer.phone_number.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Dibuka",
      description: `Pesan tagihan untuk ${customer.name} telah disiapkan di WhatsApp.`,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWhatsAppClick}
      className="gap-1"
      title={`Kirim reminder tagihan via WhatsApp ke ${customer.name}`}
    >
      <MessageCircle className="h-4 w-4" />
      {size !== "sm" && "WhatsApp"}
    </Button>
  );
}
