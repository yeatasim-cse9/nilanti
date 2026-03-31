import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadToImgBB } from "@/lib/imgbb";
import { ImageIcon, X, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}

import { useSiteSettings } from "@/hooks/useAdminData";

export const ImageUpload = ({ label = "ছবি আপলোড করুন", images, onChange, multiple = false }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { data: settings } = useSiteSettings();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...images];
    const apiKey = settings?.imgbb_api_key;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} একটি ছবি নয়`);
          continue;
        }

        const url = await uploadToImgBB(file, apiKey);
        if (multiple) {
          newImages.push(url);
        } else {
          onChange([url]);
          return;
        }
      }
      onChange(newImages);
    } catch (error: any) {
      toast.error(`আপলোড ব্যর্থ: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group w-24 h-24 rounded-lg overflow-hidden border">
            <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        
        {(multiple || images.length === 0) && (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] mt-1 text-muted-foreground">আপলোড</span>
              </>
            )}
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
};
