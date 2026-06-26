import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth_action";
import { db } from "@/firebase/admin";

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    // Fetch feedback for this interview
    const feedbackSnap = await db
        .collection("feedback")
        .where("interviewId", "==", id)
        .where("userId", "==", user.id)
        .limit(1)
        .get();

    if (feedbackSnap.empty) {
        return (
            <div className="section-feedback">
                <h1>No Feedback Yet</h1>
                <p>You haven&apos;t completed this interview yet.</p>
                <Link href={`/interview/${id}`} className="btn-primary px-6 py-3 rounded-full text-center w-fit">
                    Take Interview
                </Link>
            </div>
        );
    }

    const feedback = feedbackSnap.docs[0].data() as Feedback;

    return (
        <section className="section-feedback">
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold">Interview Feedback</h1>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-dark-200 px-4 py-2 rounded-full">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="font-bold text-primary-100">{feedback.totalScore}/100</span>
                    </div>
                    <p className="text-light-400 text-sm">
                        Completed on {new Date(feedback.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
            </div>

            {/* Final Assessment */}
            <div className="flex flex-col gap-4 p-6 dark-gradient rounded-2xl border border-light-600/20">
                <h2 className="text-xl font-semibold text-primary-100">Final Assessment</h2>
                <p>{feedback.finalAssessment}</p>
            </div>

            {/* Category Scores */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-primary-100">Category Breakdown</h2>
                <div className="flex flex-col gap-4">
                    {feedback.categoryScores?.map((cat, i) => (
                        <div key={i} className="flex flex-col gap-2 p-5 dark-gradient rounded-2xl border border-light-600/20">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-semibold text-white">{cat.name}</h3>
                                <span className="text-primary-200 font-bold">{cat.score}/100</span>
                            </div>
                            {/* Score bar */}
                            <div className="w-full bg-dark-300 rounded-full h-2">
                                <div
                                    className="progress rounded-full h-2"
                                    style={{ width: `${cat.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-light-400">{cat.comment}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="flex sm:flex-row flex-col gap-6">
                <div className="flex flex-col gap-3 flex-1 p-5 dark-gradient rounded-2xl border border-light-600/20">
                    <h2 className="text-xl font-semibold text-success-100">Strengths</h2>
                    <ul className="flex flex-col gap-2">
                        {feedback.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-2 items-start">
                                <span className="text-success-100 mt-1">✓</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-3 flex-1 p-5 dark-gradient rounded-2xl border border-light-600/20">
                    <h2 className="text-xl font-semibold text-destructive-100">Areas to Improve</h2>
                    <ul className="flex flex-col gap-2">
                        {feedback.areasForImprovement?.map((a, i) => (
                            <li key={i} className="flex gap-2 items-start">
                                <span className="text-destructive-100 mt-1">→</span>
                                <span>{a}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Actions */}
            <div className="buttons">
                <Link href="/" className="btn-secondary px-6 py-3 rounded-full text-center">
                    Back to Dashboard
                </Link>
                <Link href={`/interview/${id}`} className="btn-primary px-6 py-3 rounded-full text-center">
                    Retake Interview
                </Link>
            </div>
        </section>
    );
};

export default Page;
