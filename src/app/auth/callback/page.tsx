"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import toast from "react-hot-toast";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (!token || !userStr) {
      toast.error("Auth failed!");
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));

      // Pehle localStorage mein save karo
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Phir Redux mein save karo
      dispatch(setCredentials({ user, token }));

      toast.success("Login successful 🎉");

      // Thoda delay do taake Redux state set ho jaye
      setTimeout(() => {
        router.replace("/dashboard");
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error("Login failed!");
      router.replace("/login");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500">Logging you in...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}

// "use client";
// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useAppDispatch } from "@/store/hooks";
// import { setCredentials } from "@/store/authSlice";
// import toast from "react-hot-toast";

// export default function AuthCallback() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const token = searchParams.get("token");
//     const userStr = searchParams.get("user");

//     if (token && userStr) {
//       try {
//         const user = JSON.parse(decodeURIComponent(userStr));
//         dispatch(setCredentials({ user, token }));
//         toast.success("Login successful! 🎉");
//         router.push("/dashboard");
//       } catch (err) {
//         toast.error("Login failed!");
//         router.push("/login");
//       }
//     } else {
//       toast.error("Auth failed!");
//       router.push("/login");
//     }
//   }, []);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-gray-500">Logging you in...</p>
//     </div>
//   );
// }