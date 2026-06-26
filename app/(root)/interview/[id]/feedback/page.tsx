import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth_action";
import FeedbackClient from "./FeedbackClient";

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    let feedback: Feedback | null = null;

    try {
        const { db } = await import('@/firebase/admin');
        const feedbackSnap = await db
            .collection("feedback")
            .where("interviewId", "==", id)
            .where("userId", "==", user.id)
            .limit(1)
            .get();

        if (!feedbackSnap.empty) {
            feedback = { id: feedbackSnap.docs[0].id, ...feedbackSnap.docs[0].data() } as Feedback;
        }
    } catch (e) {
        console.log('Firestore fetch error, will try client-side fallback');
    }

    return <FeedbackClient interviewId={id} serverFeedback={feedback} />;
};

export default Page;
