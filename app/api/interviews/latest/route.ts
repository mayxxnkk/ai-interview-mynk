import { db } from "@/firebase/admin";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
        return Response.json({ success: false, error: "userId required" }, { status: 400 });
    }

    try {
        const snap = await db
            .collection("interviews")
            .where("userId", "==", userId)
            .limit(20)
            .get();

        if (snap.empty) {
            return Response.json({ interview: null });
        }

        // Get the most recently created interview
        const interviews = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as any[];

        interviews.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return Response.json({ interview: interviews[0] });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error }, { status: 500 });
    }
}
