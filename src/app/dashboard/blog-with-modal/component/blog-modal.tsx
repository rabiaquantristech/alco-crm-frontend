"use client";
import { useState, useRef } from "react";

// ── Types ──
type BlogFormData = {
    thumbnail: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string;
    read_time: string;
    status: string;
    is_featured: boolean;
};

type BlogModalProps = {
    initialData?: any;
    onSubmit: (data: any) => void;
    onClose: () => void;
    isLoading: boolean;
    mode: "add" | "edit";
};

// ── Constants ──
const categories = ["nlp", "icf", "hypnotherapy", "coaching", "mindset", "general"];

// ── Thumbnail Uploader Component ──
function ThumbnailUploader({
    value,
    onChange,
}: {
    value: string;
    onChange: (base64: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) onChange(e.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    // ── Preview State ──
    if (value) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* Preview Image */}
                <img
                    src={value}
                    alt="Thumbnail preview"
                    className="w-full h-52 object-cover"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    {/* Change Button */}
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100 transition shadow"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Change
                    </button>

                    {/* Remove Button */}
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition shadow"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                    </button>
                </div>

                {/* Bottom Label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                    <p className="text-white text-xs font-medium">Thumbnail uploaded</p>
                </div>

                {/* Hidden input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
            </div>
        );
    }

    // ── Upload Zone ──
    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
        relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
        flex flex-col items-center justify-center gap-3 h-44
        ${isDragging
                    ? "border-yellow-400 bg-yellow-50 scale-[1.01]"
                    : "border-gray-200 bg-gray-50 hover:border-yellow-300 hover:bg-yellow-50/50"
                }
      `}
        >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-yellow-100" : "bg-gray-100"}`}>
                <svg
                    className={`w-6 h-6 transition-colors ${isDragging ? "text-yellow-500" : "text-gray-400"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>

            {/* Text */}
            <div className="text-center">
                <p className={`text-sm font-semibold transition-colors ${isDragging ? "text-yellow-600" : "text-gray-600"}`}>
                    {isDragging ? "Drop image here" : "Click to upload thumbnail"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                    PNG, JPG, WEBP up to 5MB
                </p>
            </div>

            {/* Browse Badge */}
            {!isDragging && (
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-500 shadow-sm">
                    Browse Files
                </span>
            )}

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}

// ── Main Modal Component ──
export default function BlogModal({
    initialData,
    onSubmit,
    onClose,
    isLoading,
    mode,
}: BlogModalProps) {
    const [form, setForm] = useState<BlogFormData>({
        thumbnail: initialData?.thumbnail || "",
        title: initialData?.title || "",
        excerpt: initialData?.excerpt || "",
        content: initialData?.content || "",
        category: initialData?.category || "general",
        tags: initialData?.tags?.join(", ") || "",
        read_time: initialData?.read_time?.toString() || "5",
        status: initialData?.status || "draft",
        is_featured: initialData?.is_featured || false,
    });

    const handleSubmit = () => {
        if (!form.title.trim()) {
            alert("Title is required!");
            return;
        }
        if (!form.content.trim()) {
            alert("Content is required!");
            return;
        }
        onSubmit({
            ...form,
            tags: form.tags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean),
            read_time: Number(form.read_time),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {mode === "add" ? "Write New Blog" : "Edit Blog"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition font-bold text-lg"
                    >
                        x
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">

                    {/* Thumbnail */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                            Thumbnail
                            <span className="text-gray-400 font-normal ml-1">(optional)</span>
                        </label>
                        <ThumbnailUploader
                            value={form.thumbnail}
                            onChange={(base64) => setForm({ ...form, thumbnail: base64 })}
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Write an engaging title..."
                            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-800"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            placeholder="Short summary shown in blog cards..."
                            rows={2}
                            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-800 resize-none"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                            Content <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="Write your full blog content here..."
                            rows={12}
                            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-800 resize-none font-mono"
                        />
                    </div>

                    {/* Category + Read Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Read Time (mins)
                            </label>
                            <input
                                type="number"
                                value={form.read_time}
                                onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                            Tags{" "}
                            <span className="text-gray-400 font-normal">(comma separated)</span>
                        </label>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            placeholder="nlp, mindset, coaching..."
                            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700"
                        />
                    </div>

                    {/* Status + Featured */}
                    <div className="flex items-center gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-5">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={form.is_featured}
                                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                                className="w-4 h-4 accent-yellow-400"
                            />
                            <label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">
                                Featured post
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {isLoading
                            ? "Saving..."
                            : mode === "add"
                                ? "Publish Blog"
                                : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
