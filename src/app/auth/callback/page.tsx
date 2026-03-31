"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        dispatch(setCredentials({ user, token }));
        toast.success("Login successful! 🎉");
        router.push("/dashboard");
      } catch (err) {
        toast.error("Login failed!");
        router.push("/login");
      }
    } else {
      toast.error("Auth failed!");
      router.push("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Logging you in...</p>
    </div>
  );
}