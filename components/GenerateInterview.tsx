"use client";
import React, { useState } from "react";
import InterviewAgent from "@/components/InterviewAgent";

interface Props {
    userId: string;
    userName: string;
}

const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "DevOps Engineer", "Product Manager", "UI/UX Designer"];
const levels = ["Junior", "Mid-Level", "Senior", "Lead"];
const types = ["Technical", "Behavioural", "Mixed"];
const techOptions = ["React", "Next.js", "Node.js", "TypeScript", "Python", "Java", "MongoDB", "PostgreSQL", "AWS", "Docker"];

const GenerateInterview = ({ userId, userName }: Props) => {
    const [step, setStep] = useState<"form" | "interview">("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);

    const [form, setForm] = useState({
        role: "",
        level: "Junior",
        type: "Mixed",
        techstack: [] as string[],
        amount: 5,
    });

    const toggleTech = (tech: string) => {
        setForm((prev) => ({
            ...prev,
            techstack: prev.techstack.includes(tech)
                ? prev.techstack.filter((t) => t !== tech)
                : [...prev.techstack, tech],
        }));
    };

    const handleGenerate = async () => {
        if (!form.role) { setError("Please select a role."); return; }
        if (form.techstack.length === 0) { setError("Please select at least one technology."); return; }
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/vapi/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: form.role,
                    level: form.level,
                    type: form.type,
                    techstack: form.techstack.join(","),
                    amount: form.amount,
                    userId,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error("Failed to generate interview");

            // Fetch the newly created interview (latest for this user)
            const snap = await fetch(`/api/interviews/latest?userId=${userId}`);
            const snapData = await snap.json();

            if (snapData.interview) {
                setInterviewId(snapData.interview.id);
                setQuestions(snapData.interview.questions);
                setStep("interview");
            } else {
                throw new Error("Could not load generated interview");
            }
        } catch (e: any) {
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (step === "interview" && interviewId) {
        return (
            <InterviewAgent
                userName={userName}
                userId={userId}
                interviewId={interviewId}
                type="interview"
                questions={questions}
            />
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-2xl">
            {/* Role */}
            <div className="flex flex-col gap-3">
                <label className="text-primary-100 font-semibold">Job Role</label>
                <div className="flex flex-wrap gap-2">
                    {roles.map((r) => (
                        <button
                            key={r}
                            onClick={() => setForm((p) => ({ ...p, role: r }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                form.role === r
                                    ? "bg-primary-200 text-dark-100 border-primary-200"
                                    : "bg-dark-200 text-light-100 border-light-600 hover:border-primary-200"
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Or type a custom role..."
                    value={roles.includes(form.role) ? "" : form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="bg-dark-200 rounded-full px-5 py-3 text-light-100 placeholder:text-light-400 border border-light-600 focus:outline-none focus:border-primary-200"
                />
            </div>

            {/* Level */}
            <div className="flex flex-col gap-3">
                <label className="text-primary-100 font-semibold">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                    {levels.map((l) => (
                        <button
                            key={l}
                            onClick={() => setForm((p) => ({ ...p, level: l }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                form.level === l
                                    ? "bg-primary-200 text-dark-100 border-primary-200"
                                    : "bg-dark-200 text-light-100 border-light-600 hover:border-primary-200"
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-3">
                <label className="text-primary-100 font-semibold">Interview Type</label>
                <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                        <button
                            key={t}
                            onClick={() => setForm((p) => ({ ...p, type: t }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                form.type === t
                                    ? "bg-primary-200 text-dark-100 border-primary-200"
                                    : "bg-dark-200 text-light-100 border-light-600 hover:border-primary-200"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-col gap-3">
                <label className="text-primary-100 font-semibold">Tech Stack</label>
                <div className="flex flex-wrap gap-2">
                    {techOptions.map((t) => (
                        <button
                            key={t}
                            onClick={() => toggleTech(t)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                form.techstack.includes(t)
                                    ? "bg-primary-200 text-dark-100 border-primary-200"
                                    : "bg-dark-200 text-light-100 border-light-600 hover:border-primary-200"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Number of Questions */}
            <div className="flex flex-col gap-3">
                <label className="text-primary-100 font-semibold">
                    Number of Questions: <span className="text-primary-200">{form.amount}</span>
                </label>
                <input
                    type="range"
                    min={3}
                    max={10}
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                    className="w-full accent-primary-200"
                />
                <div className="flex justify-between text-xs text-light-400">
                    <span>3</span><span>10</span>
                </div>
            </div>

            {error && <p className="text-destructive-100 text-sm">{error}</p>}

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary px-8 py-3 rounded-full font-bold text-center w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Generating Questions..." : "Generate & Start Interview"}
            </button>
        </div>
    );
};

export default GenerateInterview;
