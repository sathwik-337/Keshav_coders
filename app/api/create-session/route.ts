import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";

export async function POST(req: NextRequest) {
  try {
    const { notes, selectedDoctor, userEmail } = await req.json();

    if (!notes || !selectedDoctor || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();
    const createdOn = new Date().toISOString();

    await db.insert(SessionChatTable).values({
      sessionId,
      notes,
      selectedDoctor,
      conversation: [],
      report: {},
      createdBy: userEmail,
      createdOn,
    });

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error("CREATE SESSION ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
