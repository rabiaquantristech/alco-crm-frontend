"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  Lock,
  Play,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import API from "@/utils/api";
import LessonModal from "../../../components/lesson-modal";

const getCourseContent = (enrollmentId: string, courseId: string) =>
  API.get(`/api/v1/learn/${enrollmentId}/courses/${courseId}`).then(
    (r) => r.data.data
  );

export default function CourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const enrollmentId = params?.slug as string;
  const courseId = params?.courseId as string;

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["course-content", enrollmentId, courseId],
    queryFn: () => getCourseContent(enrollmentId, courseId),
    enabled: !!enrollmentId && !!courseId,
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

  const course = data?.course;

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
            {course?.title || "Course"}
          </h1>
          <p className="text-sm text-gray-400">
            {data?.completed_lessons || 0} / {data?.total_lessons || 0} lessons
          </p>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {course?.lessons?.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No lessons available
          </div>
        ) : (
          <div className="divide-y">
            {course?.lessons?.map((lesson: any, idx: number) => (
              <div
                key={lesson._id}
                onClick={() => setActiveLessonId(lesson._id)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 text-xs font-bold">
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {lesson.content_type?.replace("_", " ")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {lesson.progress_percentage >= 100 ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : lesson.progress_percentage > 0 ? (
                    <span className="text-xs text-yellow-600 font-medium">
                      {lesson.progress_percentage}%
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

      {/* Lesson Modal */}
      {activeLessonId && (
        <LessonModal
          enrollmentId={enrollmentId}
          lessonId={activeLessonId}
          onClose={() => setActiveLessonId(null)}
          onComplete={() => {
            queryClient.invalidateQueries({
              queryKey: ["course-content", enrollmentId, courseId],
            });
            queryClient.invalidateQueries({
              queryKey: ["learn-dashboard", enrollmentId],
            });
          }}
        />
      )}
    </div>
  );
}