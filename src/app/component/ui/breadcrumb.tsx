"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: Props) {
  return (
    <div className="flex items-center gap-1 text-sm mb-6 flex-wrap">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={14} className="text-gray-300" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-400 hover:text-yellow-600 transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}