export const uploadFile = async (file: File, type: "audio" | "video" | "document") => {
  const formData = new FormData();
  formData.append(type, file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs/upload-${type}`,
    {
      method: "POST",
      body: formData, // ❗ content-type mat lagana
    }
  );

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = await res.json();

  // 🔥 expected: { url: "..." }
  return data.url;
};