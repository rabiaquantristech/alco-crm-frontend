"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, logout } from "@/store/authSlice";
import { getMe } from "@/utils/api";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auth callback pe protect mat karo
    if (pathname === "/auth/callback") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ Token hai — getMe se fresh user data lo
    getMe()
      .then((res) => {
        dispatch(setCredentials({
          user: res.data.user,
          token: token,
        }));
        setIsLoading(false);
      })
      .catch(() => {
        // Token invalid ya expire — logout karo
        dispatch(logout());
        router.push("/login");
      });

  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}