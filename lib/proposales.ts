const PROPOSALES_BASE_URL = "https://api.proposales.com";

export interface ProposalDraft {
  title_md: string;
  description_md: string;
  language: string;
  recipient?: {
    first_name?: string;
    last_name?: string;
    email?: string;
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

  const body = {
    company_id: parseInt(companyId, 10),
    language: draft.language || "en",
    title_md: draft.title_md,
    description_md: draft.description_md,
    ...(draft.recipient ? { recipient: draft.recipient } : {}),
  };

  const res = await fetch(`${PROPOSALES_BASE_URL}/v3/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Proposales API error ${res.status}: ${errorText}`
    );
  }

  const data = await res.json();
  return data.proposal as CreatedProposal;
}
