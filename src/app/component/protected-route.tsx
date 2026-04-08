"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, logout } from "@/store/authSlice";
import { getMe } from "@/utils/api";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (pathname === "/auth/callback") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    getMe()
      .then((res) => {
        const userData = res.data.user;

        dispatch(
          setCredentials({
            user: userData,
            token: token,
          })
        );

        // ✅ GLOBAL TEMP PASSWORD TOAST
        if (userData?.isTemporaryPassword && !toastShown) {
          toast((t) => (
            <div className="relative pt-4">
              <div>
                ⚠️ You are using a temporary password.
                <br />
                Please update it to continue securely.
              </div>

              <div className="flex flex-col gap-2 my-2">
                <button
                  className="text-yellow-600 underline text-sm"
                  onClick={() => {
                    router.push("/dashboard/profile");
                    toast.dismiss(t.id);
                  }}
                >
                  Update Password
                </button>

                <button
                  className="text-gray-500 text-sm absolute -top-1
                   -right-2"
                  onClick={() => toast.dismiss(t.id)}
                >
                  <IoMdClose />
                  {/* Close */}
                </button>
              </div>
            </div>
          ), {
            duration: Infinity,
          });

          setToastShown(true);
        }

        setIsLoading(false);
      })
      .catch(() => {
        dispatch(logout());
        router.push("/login");
      });

  }, [pathname, toastShown]);

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