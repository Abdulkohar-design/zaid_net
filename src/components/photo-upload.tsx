import { useState, useRef } from "react";
import { Camera, Upload, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string | null) => void;
  customerName: string;
}

export function PhotoUpload({ currentPhotoUrl, onPhotoChange, customerName }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "File Tidak Valid",
        description: "Mohon pilih file gambar (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onPhotoChange(result);
      setIsUploading(false);
      
      toast({
        title: "Foto Berhasil Diupload",
        description: `Foto rumah ${customerName} telah diperbarui`,
      });
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Gagal memproses file gambar",
        variant: "destructive"
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Foto Dihapus",
      description: `Foto rumah ${customerName} telah dihapus`,
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Foto Rumah</label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={previewUrl} 
                alt={`Rumah ${customerName}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
            
            <div className="flex gap-2 justify-center">
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Foto Rumah {customerName}</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img 
                      src={previewUrl} 
                      alt={`Rumah ${customerName}`}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4 mr-1" />
                {isUploading ? 'Uploading...' : 'Ganti'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRemovePhoto}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Belum ada foto rumah untuk {customerName}
            </p>
            <Button 
              variant="outline" 
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Foto'}
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-gray-500">
        Format: JPG, PNG, GIF. Maksimal 5MB.
      </p>
    </div>
  );
}
