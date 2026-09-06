import { NextResponse } from "next/server";

import { HTTP_STATUS } from "@/constants/api";
import { logger } from "@/lib/logger";
import { checkRateLimit, pruneRateLimitBuckets } from "@/lib/rate-limit";
import { leadRepository } from "@/repositories/lead.repository";
import { leadInputSchema } from "@/schemas/lead.schema";
import type { ApiResponse, SubmitLeadResult } from "@/types/api";
import { hashIp } from "@/utils/crypto";
import { getClientIp } from "@/utils/request";

// Prisma needs the Node runtime; a submission is never cacheable.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadResponse = NextResponse<ApiResponse<SubmitLeadResult>>;

const SCOPE = "api/lead";

function fail(error: string, status: number, fieldErrors?: Record<string, string[]>): LeadResponse {
  return NextResponse.json({ ok: false, error, fieldErrors }, { status });
}

export async function POST(request: Request): Promise<LeadResponse> {
  const clientIp = getClientIp(request);

  pruneRateLimitBuckets();
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    logger.warn(SCOPE, "rate limit exceeded", { ipHash: hashIp(clientIp) });
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again in a minute." },
      {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body.", HTTP_STATUS.BAD_REQUEST);
  }

  const parsed = leadInputSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      "Please check the highlighted fields.",
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const { company, ...lead } = parsed.data;

  // Honeypot filled in: accept silently so a bot learns nothing from the
  // response, but never write it to the list the sales team works from.
  if (company) {
    logger.info(SCOPE, "honeypot triggered", { ipHash: hashIp(clientIp) });
    return NextResponse.json(
      { ok: true, data: { id: "ignored" } },
      { status: HTTP_STATUS.ACCEPTED },
    );
  }

  try {
    const saved = await leadRepository.create({
      ...lead,
      source: request.headers.get("referer") ?? undefined,
      ipHash: clientIp === "unknown" ? undefined : hashIp(clientIp),
    });

    // Log the id and the band, never the buyer's contact details.
    logger.info(SCOPE, "lead captured", { leadId: saved.id, budgetRange: saved.budgetRange });

    return NextResponse.json({ ok: true, data: { id: saved.id } }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    // The lead is the product. A failed write has to be loud, not silent.
    logger.error(SCOPE, "failed to persist lead", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return fail(
      "We could not save your details. Please try again.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}
