import React from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "./displayTechIcons";

interface ExtendedCardProps extends InterviewCardProps {
    feedback?: Feedback | null;
}

const InterviewCard = ({ interviewId, userId, role, type, techstack, createdAt, feedback }: ExtendedCardProps) => {
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");
    const hasFeedback = !!feedback;

    return (
        <div className="card-border w-[360px] max-sm:w-full min-h-96">
            <div className="card-interview">
                <div>
                    <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
                        <p className="badge-text">{normalizedType}</p>
                    </div>
                    <Image
                        src={getRandomInterviewCover()}
                        alt="cover"
                        width={90}
                        height={90}
                        className="rounded-full object-fit size-[90px]"
                    />
                    <h3 className="mt-5 capitalize">{role} Interview</h3>

                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/calendar.svg" alt="date" width={22} height={22} />
                            <p>{formattedDate}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" alt="score" width={22} height={22} />
                            <p className={hasFeedback ? "text-primary-200 font-bold" : ""}>
                                {hasFeedback ? `${feedback.totalScore}/100` : "---/100"}
                            </p>
                        </div>
                    </div>

                    {/* Feedback summary or placeholder */}
                    {hasFeedback ? (
                        <div className="mt-4 flex flex-col gap-2">
                            <p className="line-clamp-2 text-sm">{feedback.finalAssessment}</p>
                            {/* Mini score bars */}
                            <div className="flex flex-col gap-1 mt-1">
                                {feedback.categoryScores?.slice(0, 3).map((cat) => (
                                    <div key={cat.name} className="flex items-center gap-2">
                                        <p className="text-xs text-light-400 w-28 truncate">{cat.name}</p>
                                        <div className="flex-1 bg-dark-300 rounded-full h-1.5">
                                            <div
                                                className="bg-primary-200 h-1.5 rounded-full"
                                                style={{ width: `${cat.score}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-primary-200 w-6 text-right">{cat.score}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="line-clamp-2 mt-5 text-sm">
                            You haven&apos;t taken this interview yet. Take it to improve your skills.
                        </p>
                    )}
                </div>

                <div className="flex flex-row justify-between items-center mt-4">
                    <DisplayTechIcons techStack={techstack} />
                    <Button className="btn-primary" asChild>
                        <Link href={hasFeedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
                            {hasFeedback ? "View Feedback" : "View Interview"}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;
