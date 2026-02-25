import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    // ✅ Check authentication
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = user.primaryEmailAddress?.emailAddress;

    // ✅ Check if user exists
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email!));

    // ✅ Create new user if not exists
    if (users.length === 0) {
      const result = await db
        .insert(usersTable)
        .values({
          name: user.fullName,
          email: email,
          credit: 10,
        })
        .returning();

      return NextResponse.json(result[0]);
    }

    // ✅ Return existing user
    return NextResponse.json(users[0]);

  } catch (error) {
    console.error("USER API ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}