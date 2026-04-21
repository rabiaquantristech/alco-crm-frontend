import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";

type Props = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onUploadComplete?: (data: any) => void; // ✅ NEW
  type?: "audio" | "video" | "document";
};

export default function UploadInput({
  label,
  value,
  onChange,
  onUploadComplete,
  type = "audio",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { token: authToken } = useAppSelector((state) => state.auth);


  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append(type, file);

    try {
      setUploading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs/upload-${type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`, // ✅ FIX
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Upload failed");

      onChange(data.url);

      onUploadComplete?.({
        url: data.url,
        duration: data.duration
      });
      toast.success("Upload ho gaya!");
    } catch (err: any) {
      toast.error(err.message || "Upload fail");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // size check
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Max 50MB allowed");
      return;
    }

    handleUpload(file);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs text-gray-600 mb-1">{label}</label>
      )}

      <div className="relative">
        {/* Input */}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          readOnly={!!value}
          className={`w-full text-sm px-3 py-2 pr-10 border rounded-xl focus:ring focus:ring-gray-400 outline-none
    ${value ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-950"}
  `}
        />
        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-950 hover:text-sky-500"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
        </button>

        {/* Hidden Input */}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={onFileChange}
          accept={
            type === "audio"
              ? "audio/*"
              : type === "video"
                ? "video/*"
                : ".pdf,.doc,.docx"
          }
        />
      </div>
    </div>
  );
}