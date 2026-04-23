"use client";
import ProtectedRoute from "@/app/component/protected-route";
import { useAppSelector } from "@/store/hooks";
import AdminCourses from "./components/admin-courses";
import UserCourses from "./components/user-courses";

export default function CoursesPage() {
  const { user } = useAppSelector((state) => state.auth);

  const renderView = () => {
    switch (user?.role) {
      case "super_admin":
      case "admin":
        return <AdminCourses />;

      case "user":
      default:
        return <UserCourses />;
    }
  };

  return (
    <ProtectedRoute>
      {renderView()}
    </ProtectedRoute>
  );
}