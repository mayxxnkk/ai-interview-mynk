'use server';

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        const formattedTranscript = transcript
            .map((msg) => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
            .join('\n');

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'user',
                    content: `You are an expert interview coach. Analyze the following interview transcript and provide detailed feedback as a JSON object.

Transcript:
${formattedTranscript}

Return a JSON object with exactly this structure:
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    { "name": "Communication Skills", "score": <number 0-100>, "comment": "<string>" },
    { "name": "Technical Knowledge", "score": <number 0-100>, "comment": "<string>" },
    { "name": "Problem Solving", "score": <number 0-100>, "comment": "<string>" },
    { "name": "Cultural Fit", "score": <number 0-100>, "comment": "<string>" },
    { "name": "Confidence and Clarity", "score": <number 0-100>, "comment": "<string>" }
  ],
  "strengths": ["<string>", "<string>", "<string>"],
  "areasForImprovement": ["<string>", "<string>", "<string>"],
  "finalAssessment": "<2-3 sentence paragraph>"
}

Be constructive, specific, and encouraging. Return only valid JSON.`,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const feedback = JSON.parse(content);

        const feedbackData = {
            interviewId,
            userId,
            totalScore: feedback.totalScore || 0,
            categoryScores: feedback.categoryScores || [],
            strengths: feedback.strengths || [],
            areasForImprovement: feedback.areasForImprovement || [],
            finalAssessment: feedback.finalAssessment || '',
            createdAt: new Date().toISOString(),
        };

        // Try to save to Firestore
        let savedFeedbackId = feedbackId || `feedback_${Date.now()}`;
        try {
            const { db } = await import('@/firebase/admin');
            if (feedbackId) {
                await db.collection('feedback').doc(feedbackId).set(feedbackData);
            } else {
                const docRef = await db.collection('feedback').add(feedbackData);
                savedFeedbackId = docRef.id;
            }
        } catch (dbError: any) {
            console.error('Firestore save error (non-fatal):', dbError?.message);
            // Continue - we still have the feedback data
        }

        // Return feedback data directly so it can be shown even if DB failed
        return { 
            success: true, 
            feedbackId: savedFeedbackId,
            feedbackData 
        };
    } catch (error: any) {
        console.error('Error generating feedback:', error?.message || error);
        return { success: false, error: 'Failed to generate feedback.' };
    }
}
