import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createProposal } from "@/lib/proposales";

const SYSTEM_PROMPT = `You are an expert hospitality sales writer for Axels Beer @ Breakfast — a lads' holiday experience brand. Your job is to transform a brief client inquiry into a fun, energetic, and professional proposal structure.

Given an inquiry, return ONLY a valid JSON object (no markdown, no explanation) with this shape:

{
  "title_md": "string — a punchy, fun proposal title that fits the Axels B@B brand",
  "description_md": "string — an upbeat proposal description using markdown. Use # for headers, * for bold. 3–4 paragraphs covering: enthusiastic intro, what's included, why it'll be legendary, and a clear next step CTA.",
  "language": "en",
  "recipient": {
    "first_name": "string or null",
    "last_name": "string or null",
    "email": "string or null",
    "company_name": "string or null"
  }
}

Write in a fun, laddish but professional voice. Be specific — pull details from the inquiry. If recipient details aren't mentioned, set those fields to null.`;

export async function POST(req: NextRequest) {
  try {
    const { inquiry } = await req.json();

    if (!inquiry || typeof inquiry !== "string" || inquiry.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a more detailed inquiry." },
        { status: 400 }
      );
    }

    // Step 1: Use Vercel AI SDK to call Claude
    const { text: rawText } = await generateText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Here is the client inquiry:\n\n${inquiry}`,
      maxTokens: 1024,
    });

    let draft;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      draft = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Step 2: Create the proposal in Proposales
    const proposal = await createProposal(draft);

    return NextResponse.json({
      success: true,
      proposal: {
        url: proposal.url,
        uuid: proposal.uuid,
        title: draft.title_md,
        description: draft.description_md,
      },
    });
  } catch (err: unknown) {
    console.error("Error generating proposal:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
