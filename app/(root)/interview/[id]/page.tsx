import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import InterviewAgent from "@/components/InterviewAgent";
import { getCurrentUser } from "@/lib/actions/auth_action";
import { dummyInterviews } from "@/constants";

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    let interview: Interview | null = null;

    // Try Firestore first
    try {
        const { db } = await import('@/firebase/admin');
        const interviewDoc = await db.collection("interviews").doc(id).get();
        if (interviewDoc.exists) {
            interview = { id: interviewDoc.id, ...interviewDoc.data() } as Interview;
        }
    } catch (e) {
        console.log('Firestore error, trying dummy interviews');
    }

    // Fall back to dummy interviews
    if (!interview) {
        interview = dummyInterviews.find((i) => i.id === id) || null;
    }

    if (!interview) redirect("/");

    return (
        <div className="relative flex flex-col gap-8">
            <Link
                href="/"
                className="absolute top-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-dark-200 border border-light-600 text-light-100 hover:bg-light-600 transition-colors text-xl font-bold"
                title="Back to Home"
            >
                ✕
            </Link>

            <div className="flex flex-col gap-2">
                <h2 className="capitalize">{interview.role} Interview</h2>
                <p className="text-light-400">Level: {interview.level} · Type: {interview.type}</p>
            </div>

            <InterviewAgent
                userName={user.name}
                userId={user.id}
                interviewId={id}
                type="interview"
                questions={interview.questions}
            />
        </div>
    );
};

export default Page;
