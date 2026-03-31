"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { loginUser } from "@/utils/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import InputField from "../component/ui/inputField";
import Button from "../component/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

const loginSchema = z.object({
  email: z.string().email("Valid email daalo"),
  password: z.string().min(6, "Password kam az kam 6 characters ka hona chahiye"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginForm) => loginUser(data),
    onSuccess: (res) => {
      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.token,
      }));
      toast.success("Login successful! 🎉");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Login failed!");
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-gray-900 font-bold">A</span>
          </div>
          <span className="text-gray-900 font-bold text-xl">ALCO CRM</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h1>
        <p className="text-gray-400 text-sm mb-6">Login to your account to continue</p>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            {...register("email")}
          />

          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password}
            {...register("password")}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Button fullWidth isLoading={isPending} loadingText="Logging in...">
            Login
          </Button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google`;
            }}
            className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 text-gray-600 hover:bg-gray-50"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/linkedin`;
            }}
            className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 text-gray-600 hover:bg-gray-50"
          >
            <FaLinkedin size={20} className="text-blue-600" />
            Continue with LinkedIn
          </button>
        </div>

      </div>
    </div>
  );
}