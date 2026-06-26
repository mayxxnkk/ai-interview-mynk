import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth_action";
import GenerateInterview from "@/components/GenerateInterview";

const Page = async () => {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    return (
        <div className="relative flex flex-col gap-8">
            {/* Close button */}
            <Link
                href="/"
                className="absolute top-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-dark-200 border border-light-600 text-light-100 hover:bg-light-600 transition-colors text-xl font-bold"
                title="Back to Home"
            >
                ✕
            </Link>

            <div className="flex flex-col gap-2">
                <h2>Start an Interview</h2>
                <p className="text-light-400">Fill in the details and the AI will generate questions for you, then start the voice interview.</p>
            </div>

            <GenerateInterview userId={user.id} userName={user.name} />
        </div>
    );
};

export default Page;
