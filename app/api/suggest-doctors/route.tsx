import { AIDoctorAgents } from "@/app/shared/list";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/config/OpenAiModel";

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    // ✅ Ask AI to return ONLY doctor IDs (most reliable method)
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite-preview-09-2025",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are a medical assistant AI.

You MUST select doctors ONLY from the provided list.

Doctor List:
${JSON.stringify(AIDoctorAgents)}

Rules:
- Analyze user symptoms.
- Return EXACTLY 5 most relevant doctor IDs.
- Do NOT create new doctors.
- Do NOT explain anything.
- Return STRICT JSON ONLY in this format:

{
  "doctorIds": [1,2,3,4,5]
}
`
        },
        {
          role: "user",
          content: `User Symptoms: ${notes}`
        }
      ],
    });

    const rawContent =
      completion.choices[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.error("JSON Parse Error:", rawContent);
      return NextResponse.json(
        { error: "Invalid AI response format", raw: rawContent },
        { status: 500 }
      );
    }

    const doctorIds: number[] = parsed.doctorIds || [];

    // ✅ Map IDs to real doctor objects
    const suggestedDoctors = AIDoctorAgents.filter((doctor) =>
      doctorIds.includes(doctor.id)
    );

    // ✅ Return clean array (LIKE YOUR SCREENSHOT)
    return NextResponse.json(suggestedDoctors);

  } catch (error) {
    console.error("Suggest Doctors API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}