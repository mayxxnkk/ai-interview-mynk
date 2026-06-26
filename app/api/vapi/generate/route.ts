// app/api/vapi/generate/route.ts
import { getRandomInterviewCover } from "@/lib/utils";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
    return Response.json({ success: true, data: "Thankyou!" }, { status: 200 });
}

export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userId } = await request.json();

    try {
        // Generate questions using Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]

Thank you!`,
                },
            ],
        });

        const questionsText = completion.choices[0]?.message?.content || "[]";
        
        // Clean up the response - extract JSON array
        const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
        const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        const interview = {
            role,
            type,
            level,
            techstack: String(techstack).split(","),
            questions,
            userId,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        // Save to Firestore using dynamic import
        try {
            const { db } = await import('@/firebase/admin');
            await db.collection("interviews").add(interview);
        } catch (dbError) {
            console.error('Firestore save error:', dbError);
            // Still return success with the questions even if DB fails
            return Response.json({ success: true, interview }, { status: 200 });
        }

        return Response.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Generate error:', error?.message || error);
        return Response.json({ success: false, error: error?.message || 'Failed to generate' }, { status: 500 });
    }
}
