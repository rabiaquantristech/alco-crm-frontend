import { Suspense } from "react";
import LoginClient from "./loginClient";
import Loader from "../component/loader/Loader";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader />}>
      <LoginClient />
    </Suspense>
  );
}