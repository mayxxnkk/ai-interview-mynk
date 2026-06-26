import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth_action";
import { dummyInterviews } from "@/constants";

const Page = async () => {
    let user = null;
    let userInterviews: Interview[] = [];
    let feedbackMap: Record<string, Feedback> = {};

    try {
        user = await getCurrentUser();
    } catch (e) {
        console.log('getCurrentUser error:', e);
    }

    if (user) {
        try {
            const { db } = await import('@/firebase/admin');
            const interviewSnap = await db
                .collection("interviews")
                .where("userId", "==", user.id)
                .limit(10)
                .get();

            userInterviews = interviewSnap.docs
                .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (userInterviews.length > 0) {
                const feedbackSnap = await db
                    .collection("feedback")
                    .where("userId", "==", user.id)
                    .get();
                feedbackSnap.docs.forEach((doc) => {
                    const data = doc.data() as Feedback;
                    feedbackMap[data.interviewId] = { ...data, id: doc.id };
                });
            }
        } catch (e) {
            console.log('Firestore error (non-fatal):', e);
        }
    }

    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-ready with AI-Powered Practice &amp; Feedback</h2>
                    <p className="text-lg">
                        Practice on real interview questions &amp; get instant feedback
                    </p>
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>
                <Image src="/robot.png" alt="robot" width={400} height={400} className="max-sm:hidden" />
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                {userInterviews.length > 0 ? (
                    <div className="interviews-section">
                        {userInterviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                interviewId={interview.id}
                                userId={user?.id}
                                role={interview.role}
                                type={interview.type}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                                feedback={feedbackMap[interview.id] || null}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-light-400">
                        No interviews yet. Start one above or take a sample below!
                    </p>
                )}
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>
                <div className="interviews-section">
                    {dummyInterviews.map((interview) => (
                        <InterviewCard
                            key={interview.id}
                            interviewId={interview.id}
                            userId={user?.id}
                            role={interview.role}
                            type={interview.type}
                            techstack={interview.techstack}
                            createdAt={interview.createdAt}
                            feedback={null}
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Page;
