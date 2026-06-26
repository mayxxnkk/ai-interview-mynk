"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/feedback_action";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const InterviewAgent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onMessage = (message: any) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage: SavedMessage = {
                    role: message.role,
                    content: message.transcript,
                };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onError = (error: any) => {
            console.error("Vapi error:", error);
            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("message", onMessage);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("message", onMessage);
            vapi.off("error", onError);
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }
    }, [messages]);

    // When call finishes, generate feedback then redirect
    useEffect(() => {
        const handleFinished = async () => {
            if (callStatus !== CallStatus.FINISHED) return;

            // Only generate feedback for real interviews with a transcript
            if (type === "interview" && interviewId && messages.length > 0) {
                setIsGeneratingFeedback(true);
                try {
                    const result = await createFeedback({
                        interviewId,
                        userId: userId!,
                        transcript: messages,
                        feedbackId,
                    });
                    if (result.success) {
                        router.push(`/interview/${interviewId}/feedback`);
                        return;
                    }
                } catch (e) {
                    console.error("Feedback generation failed:", e);
                } finally {
                    setIsGeneratingFeedback(false);
                }
            }
            router.push("/");
        };

        handleFinished();
    }, [callStatus]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        try {
            if (type === "generate") {
                await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                    variableValues: {
                        username: userName,
                        userid: userId,
                    },
                });
            } else {
                const formattedQuestions = questions
                    ?.map((q, i) => `${i + 1}. ${q}`)
                    .join("\n");

                await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                    variableValues: {
                        username: userName,
                        questions: formattedQuestions,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to start call:", error);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleEndCall = () => {
        vapi.stop();
        setCallStatus(CallStatus.FINISHED);
    };

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI Interviewer"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="user avatar"
                            width={540}
                            height={540}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {isGeneratingFeedback ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-200" />
                        <p className="text-primary-100 text-sm">Generating your feedback...</p>
                    </div>
                ) : callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span
                            className={cn(
                                "absolute animate-ping rounded-full opacity-75",
                                callStatus !== CallStatus.CONNECTING && "hidden"
                            )}
                        />
                        <span>
                            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                                ? "Call"
                                : "Connecting..."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleEndCall}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default InterviewAgent;
