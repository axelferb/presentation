import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createProposal } from "@/lib/proposales";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a sales writer for Axels Beer @ Breakfast, a lads holiday brand. Given a client inquiry, return ONLY a raw JSON object with no markdown, no code blocks, no backticks, no newlines inside string values.

Return exactly this shape:
{"title_md":"short punchy title here","description_md":"3-4 sentences describing the package in a fun laddish tone. No line breaks. No special characters.","language":"en","num_people":15,"include_breakfast":false}

For num_people, extract the number of people from the inquiry. If you cannot determine it, use 1.
For include_breakfast, set to true if the inquiry mentions breakfast, otherwise false.
If a recipient first name is provided, address them by name naturally somewhere in the description_md (e.g. "Hey John, ...").`;

export async function POST(req: NextRequest) {
  try {
    const { inquiry, arrivalDate, departureDate, recipient } = await req.json();

    if (!inquiry || typeof inquiry !== "string" || inquiry.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a more detailed inquiry." },
        { status: 400 }
      );
    }

    const datePart = [
      arrivalDate ? `Arrival date: ${arrivalDate}` : "",
      departureDate ? `Departure date: ${departureDate}` : "",
      recipient?.first_name ? `Recipient first name: ${recipient.first_name}` : "",
    ].filter(Boolean).join("\n");

    const { object: rawDraft } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      output: "no-schema",
      system: SYSTEM_PROMPT,
      prompt: `Client inquiry: ${inquiry}${datePart ? `\n${datePart}` : ""}`,
      maxTokens: 512,
    });

    const obj = rawDraft as Record<string, unknown>;

    const numPeople = Math.max(1, parseInt(String(obj.num_people || "1"), 10) || 1);
    const includeBreakfast = obj.include_breakfast === true;

    const blocks: { type: string; content_id: number; quantity: number }[] = [
      { type: "product-block", content_id: 178929, quantity: numPeople },
    ];
    if (includeBreakfast) {
      blocks.push({ type: "product-block", content_id: 178960, quantity: numPeople });
    }

    const draft = {
      title_md: String(obj.title_md || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim(),
      description_md: String(obj.description_md || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim(),
      language: String(obj.language || "en"),
      blocks,
      recipient,
    };

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
    console.error("Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}