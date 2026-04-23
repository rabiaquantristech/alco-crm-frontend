"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getLessonContent, updateLessonProgress,
    completeLesson, getLessonComments, addLessonComment
} from "@/utils/api";
import { X, CheckCircle, Send, Mic, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
    enrollmentId: any;
    lessonId: string;
    onClose: () => void;
    onComplete?: () => void;
};

export default function LessonModal({ enrollmentId, lessonId, onClose, onComplete }: Props) {
    const queryClient = useQueryClient();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [comment, setComment] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const progressSaveTimer = useRef<NodeJS.Timeout | null>(null);

    // ── Fetch lesson ──
    const { data: lessonData, isLoading } = useQuery({
        queryKey: ["lesson", enrollmentId, lessonId],
        queryFn: () => getLessonContent(enrollmentId, lessonId).then(r => r.data.data),
    });

    const lesson = lessonData?.lesson;
    const savedProgress = lessonData?.progress;

    // ── Fetch comments ──
    const { data: commentsData, isLoading: isLoadingComments } = useQuery({
        queryKey: ["lesson-comments", lessonId],
        queryFn: () => getLessonComments(enrollmentId, lessonId).then(r => r.data.data),
    });

    // ── Set initial state ──
    useEffect(() => {
        if (savedProgress) {
            setProgress(savedProgress.progress_percentage || 0);
            setIsCompleted(savedProgress.is_completed || false);
            // Audio position restore karo
            if (audioRef.current && savedProgress.last_position_seconds) {
                audioRef.current.currentTime = savedProgress.last_position_seconds;
            }
        }
    }, [savedProgress]);

    // ── Progress update mutation ──
    const { mutate: saveProgress } = useMutation({
        mutationFn: (data: any) => updateLessonProgress(enrollmentId, lessonId, data),
    });

    // ── Complete mutation ──
    const { mutate: markComplete, isPending: isCompleting } = useMutation({
        mutationFn: () => completeLesson(enrollmentId, lessonId),
        onSuccess: () => {
            setIsCompleted(true);
            setProgress(100);
            toast.success("Lesson completed! 🎉");
            queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
            queryClient.invalidateQueries({ queryKey: ["learn-dashboard", enrollmentId] });
            onComplete?.();
        },
        onError: () => toast.error("Failed to mark complete"),
    });

    // ── Add comment mutation ──
    const { mutate: postComment, isPending: isPosting } = useMutation({
        mutationFn: (text: string) => addLessonComment(enrollmentId, lessonId, {
            comment: text,
            timestamp_seconds: Math.floor(audioRef.current?.currentTime || 0),
        }),
        onSuccess: () => {
            setComment("");
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", lessonId] });
        },
        onError: () => toast.error("Failed to post comment"),
    });

    // ── Audio event handlers ──
    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;

        const pct = Math.round((audio.currentTime / audio.duration) * 100);
        setProgress(pct);

        // Debounce save — har 10 second mein save
        if (progressSaveTimer.current) {
            clearTimeout(progressSaveTimer.current);
        }
        progressSaveTimer.current = setTimeout(() => {
            saveProgress({
                progress_percentage: pct,
                last_position_seconds: Math.floor(audio.currentTime),
            });
        }, 10000);
    };

    const handleAudioEnded = () => {
        setProgress(100);
        saveProgress({ progress_percentage: 100, last_position_seconds: 0 });
        if (!isCompleted) {
            markComplete();
        }
    };

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (progressSaveTimer.current) {
                clearTimeout(progressSaveTimer.current);
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
                    <div className="flex-1 min-w-0 mr-4">
                        {isLoading ? (
                            <div className="h-5 bg-gray-100 rounded animate-pulse w-48" />
                        ) : (
                            <>
                                <h2 className="font-semibold text-gray-800 truncate">{lesson?.title}</h2>
                                <p className="text-xs text-gray-400 mt-0.5 capitalize flex items-center gap-1">
                                    <Mic size={11} />
                                    {lesson?.content_type?.replace("_", " ")}
                                    {lesson?.duration_minutes && (
                                        <span className="ml-2 flex items-center gap-1">
                                            <Clock size={11} />
                                            {lesson.duration_minutes} min
                                        </span>
                                    )}
                                </p>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Audio Player */}
                            {lesson?.content_url && (
                                <div className="p-5 border-b">
                                    <div className="bg-gray-50 rounded-2xl p-5">

                                        {/* Audio element */}
                                        <audio
                                            ref={audioRef}
                                            src={lesson.content_url}
                                            onTimeUpdate={handleTimeUpdate}
                                            onEnded={handleAudioEnded}
                                            controls
                                            className="w-full"
                                            style={{ borderRadius: "12px" }}
                                        />

                                        {/* Progress bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                                <span>Progress</span>
                                                <span className="font-medium text-gray-700">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Mark Complete Button */}
                                        <div className="mt-4 flex justify-end">
                                            {isCompleted ? (
                                                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                                    <CheckCircle size={16} />
                                                    Completed
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => markComplete()}
                                                    disabled={isCompleting || progress < 50}
                                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl text-sm font-medium hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <CheckCircle size={14} />
                                                    {isCompleting ? "Marking..." : "Mark Complete"}
                                                </button>
                                            )}
                                        </div>

                                        {progress < 50 && !isCompleted && (
                                            <p className="text-xs text-gray-400 text-right mt-1">
                                                Listen at least 50% to mark complete
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {lesson?.description && (
                                <div className="px-5 py-4 border-b">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">About this lesson</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{lesson.description}</p>
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    Comments
                                    <span className="text-xs text-gray-400 font-normal">
                                        ({commentsData?.length || 0})
                                    </span>
                                </h3>

                                {/* Add Comment */}
                                <div className="flex gap-3 mb-5">
                                    <div className="flex-1 flex items-center gap-2 border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-yellow-300 bg-gray-50">
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && comment.trim() && postComment(comment)}
                                            placeholder="Add a comment..."
                                            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                        />
                                        {audioRef.current && audioRef.current.currentTime > 0 && (
                                            <span className="text-xs text-gray-300 flex-shrink-0">
                                                @ {formatTime(audioRef.current.currentTime)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => comment.trim() && postComment(comment)}
                                        disabled={isPosting || !comment.trim()}
                                        className="p-2.5 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition disabled:opacity-40"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>

                                {/* Comments List */}
                                {isLoadingComments ? (
                                    <div className="text-center py-4 text-sm text-gray-400">Loading comments...</div>
                                ) : commentsData?.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-gray-400">
                                        No comments yet — be the first!
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {commentsData?.map((c: any) => (
                                            <div key={c._id} className="flex gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0"
                                                    style={{ background: c.user_id?.avatarColor || "#FBBF24" }}
                                                >
                                                    {c.user_id?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-semibold text-gray-800">
                                                            {c.user_id?.name}
                                                        </span>
                                                        {c.timestamp_seconds > 0 && (
                                                            <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded font-mono">
                                                                {formatTime(c.timestamp_seconds)}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-300">
                                                            {new Date(c.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{c.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Next/Prev lesson navigation */}
                {lessonData && (
                    <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0 rounded-b-2xl">
                        <button
                            disabled={!lessonData.prev_lesson}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                            {lessonData.prev_lesson?.title || "Previous"}
                        </button>
                        <button
                            disabled={!lessonData.next_lesson}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {lessonData.next_lesson?.title || "Next"}
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}