const PROPOSALES_BASE_URL = "https://api.proposales.com";

export interface ProposalDraft {
  title_md: string;
  description_md: string;
  language: string;
  blocks?: { type: string; content_id: number; quantity: number }[];
  recipient?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
  };
}

export interface CreatedProposal {
  uuid: string;
  url: string;
}

export async function createProposal(
  draft: ProposalDraft
): Promise<CreatedProposal> {
  const apiKey = process.env.PROPOSALES_API_KEY;
  const companyId = process.env.PROPOSALES_COMPANY_ID;

  if (!apiKey) throw new Error("PROPOSALES_API_KEY is not set");
  if (!companyId) throw new Error("PROPOSALES_COMPANY_ID is not set");
  // Only include recipient fields that have actual string values
  const recipientFields = draft.recipient
    ? Object.fromEntries(
        Object.entries(draft.recipient).filter(
          ([, v]) => typeof v === "string" && v.trim() !== ""
        )
      )
    : {};

  const body: Record<string, unknown> = {
    company_id: parseInt(companyId),
    language: "en",
    title_md: draft.title_md,
    description_md: draft.description_md,
  };

  if (draft.blocks && draft.blocks.length > 0) {
    body.blocks = draft.blocks;
  }

  // Only attach recipient if we have at least one real field
  if (Object.keys(recipientFields).length > 0) {
    body.recipient = recipientFields;
  }

  const res = await fetch(`${PROPOSALES_BASE_URL}/v3/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();

  if (!res.ok) {
    console.error(`Proposales API error ${res.status}: ${responseText}`);
    throw new Error("Something went wrong while creating the proposal. Please try again later.");
  }

  const data = JSON.parse(responseText);
  return data.proposal as CreatedProposal;
}
