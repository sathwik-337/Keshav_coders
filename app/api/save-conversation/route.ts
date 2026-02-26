import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { openai } from "@/config/OpenAiModel";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, conversation } = await req.json();
    if (!sessionId || !conversation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let report: any = null;
    try {
      console.log("Generating report for session:", sessionId);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `
You are a multilingual medical report generator.
Given a conversation between a user and an AI doctor, produce a concise JSON report.
Analyze the conversation to extract key medical information.

Response Format (STRICT JSON):
{
  "language": "English" | "Hindi" | "Spanish" | ...,
  "summary": "Brief clinical summary of the consultation.",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "diagnosis": "Potential diagnosis or 'Undetermined'",
  "advice": ["Actionable advice 1", "Medication suggestion"],
  "followUpQuestions": ["Question 1 to ask patient next time"]
}

Do not include any markdown formatting (like \`\`\`json). Just the raw JSON object.
`,
          },
          {
            role: "user",
            content: JSON.stringify(conversation),
          },
        ],
      });
      
      let raw = completion.choices[0]?.message?.content || "{}";
      // Clean up markdown if present
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      
      report = JSON.parse(raw);
    } catch (err) {
      console.error("REPORT GENERATION ERROR:", err);
      // Fallback report structure
      report = {
        language: "Unknown",
        summary: "Failed to generate report due to an error.",
        symptoms: [],
        advice: ["Please consult a real doctor."],
      };
    }

    await db
      .update(SessionChatTable)
      .set({ conversation, report })
      .where(eq(SessionChatTable.sessionId, sessionId));

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("SAVE CONVERSATION ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
