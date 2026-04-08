"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { forgotPassword, loginUser, resetPassword } from "@/utils/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import InputField from "../component/ui/inputField";
import Button from "../component/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import Modal from "../component/ui/model/modal";

const loginSchema = z.object({
  email: z.string().email("Valid email daalo"),
  password: z.string().min(6, "Password kam az kam 6 characters ka hona chahiye"),
});

type LoginForm = z.infer<typeof loginSchema>;

// Modal fields
const forgotFields = [
  {
    name: "email",
    label: "Email",
    type: "input" as const,
    inputType: "email",
    placeholder: "you@example.com",
  },
];

const resetFields = [
  {
    name: "otp",
    label: "OTP Code",
    type: "input" as const,
    inputType: "text",
    placeholder: "6 digit OTP daalo",
  },
  {
    name: "newPassword",
    label: "New Password",
    type: "input" as const,
    inputType: "password",
    placeholder: "••••••••",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "input" as const,
    inputType: "password",
    placeholder: "••••••••",
  },
];

type ModalStep = "forgot" | "reset" | null;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email");
  const passwordParam = searchParams.get("password");

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginForm) => loginUser(data),
    // Login onSuccess mein refresh_token save nahi ho raha
    onSuccess: (res) => {
      dispatch(setCredentials({
        user: res.data.data.user,
        token: res.data.data.access_token,
      }));
      // ✅ Yeh line add karo
      localStorage.setItem("refresh_token", res.data.data.refresh_token);
      toast.success("Login successful! 🎉");
      console.log("Login response:", res.data.data.user);
      if (res.data.data.user.isTemporaryPassword == true) {
        router.push(`/dashboard/profile?password=${passwordParam}`);
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Login failed!");
    },
  });

  // Forgot password mutation
  const { mutate: sendOtp, isPending: isSending } = useMutation({
    mutationFn: (data: Record<string, string | boolean>) =>
      forgotPassword({ email: data.email as string }),
    onSuccess: (_, variables) => {
      setOtpEmail(variables.email as string);
      toast.success("OTP has been sent! 📧");
      setModalStep("reset");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Email not Found!");
    },
  });

  // Reset password mutation
  const { mutate: doReset, isPending: isResetting } = useMutation({
    mutationFn: (data: Record<string, string | boolean>) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return resetPassword({
        email: otpEmail,
        otp: data.otp as string,
        newPassword: data.newPassword as string,
      });
    },
    onSuccess: () => {
      toast.success("Password has been reset! 🔒 Now log in");
      setModalStep(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.message || "Incorrect or expired OTP!");
    },
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
    if (passwordParam) {
      setValue("password", passwordParam);
    }
  }, [emailParam, passwordParam, setValue]);


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

        {/* Login Form */}
        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            {...register("email")}
          />

          <div>
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
            {/* Forgot Password link */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setModalStep("forgot")}
                className="text-xs text-yellow-600 hover:text-yellow-700 transition"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button fullWidth isLoading={isPending} loadingText="Logging in...">
            Login
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google`}
            className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 text-gray-600 hover:bg-gray-50 transition"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/linkedin`}
            className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 text-gray-600 hover:bg-gray-50 transition"
          >
            <FaLinkedin size={20} className="text-blue-600" />
            Continue with LinkedIn
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {modalStep === "forgot" && (
        <Modal
          isOpen={true}
          onClose={() => setModalStep(null)}
          title="Forgot Password"
          subtitle="Enter your email — we’ll send you an OTP."
          fields={forgotFields}
          onSubmit={(data) => sendOtp(data)}
          isLoading={isSending}
          step="forgot"
        />
      )}

      {/* Reset Password Modal */}
      {modalStep === "reset" && (
        <Modal
          isOpen={true}
          onClose={() => setModalStep(null)}
          title="Reset Password"
          subtitle={`OTP has been sent! ${otpEmail}`}
          fields={resetFields}
          onSubmit={(data) => doReset(data)}
          isLoading={isResetting}
          step="reset"
          onBack={() => setModalStep("forgot")}
        />
      )}
    </div>
  );
}