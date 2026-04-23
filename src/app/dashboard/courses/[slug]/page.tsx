"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CheckCircle, Lock, ChevronRight } from "lucide-react";
import API from "@/utils/api";

const getLearningDashboard = (enrollmentId: string) =>
  API.get(`/api/v1/learn/${enrollmentId}`).then((r) => r.data.data);

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();

  const enrollmentId = params?.slug as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["learn-dashboard", enrollmentId],
    queryFn: () => getLearningDashboard(enrollmentId),
    enabled: !!enrollmentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-rose-500">
        Failed to load course
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            {data?.program?.name || "Course"}
          </h1>
          <p className="text-sm text-gray-400">
            {data?.completed_lessons || 0} / {data?.total_lessons || 0} lessons completed
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {data?.courses?.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No courses available
          </div>
        ) : (
          <div className="divide-y">
            {data?.courses?.map((course: any, idx: number) => (
              <div
                key={course._id}
                onClick={() =>
                  router.push(
                    `/dashboard/courses/${enrollmentId}/learn/${course._id}`
                  )
                }
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 text-xs font-bold">
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {course.total_lessons || 0} lessons
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {course.progress_percentage >= 100 ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : course.progress_percentage > 0 ? (
                    <span className="text-xs text-yellow-600 font-medium">
                      {course.progress_percentage}%
                    </span>
                  ) : (
                    <Lock size={14} className="text-gray-300" />
                  )}
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}