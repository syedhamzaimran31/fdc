import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { logger } from "@/lib/logger";
import type { Lead, LeadCreateInput } from "@/types/lead";

/**
 * Fallback used only when DATABASE_URL is unset, so a reviewer can clone the
 * repo and submit the form without provisioning Postgres first.
 *
 * It is NOT a second persistence option. On a serverless host the filesystem is
 * read-only apart from a per-instance /tmp, so a write here can silently vanish
 * — which is the exact failure this project started by fixing. It is therefore
 * gated on the environment variable being absent, announced in the server log,
 * and surfaced on the page itself. Production always has a database.
 */
const STORE_PATH = path.join(process.cwd(), "data", "leads.json");

let leads: Lead[] = [];
let warned = false;

function warnOnce(): void {
  if (warned) return;
  warned = true;
  logger.warn(
    "demo-store",
    "DATABASE_URL is not set — leads are being kept in memory and are not durable",
    { storePath: STORE_PATH },
  );
}

/** Best effort. A read-only filesystem is expected, not exceptional. */
async function persist(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
  } catch {
    // Ignored deliberately: in-memory is the contract here, the file is a bonus.
  }
}

export const demoStore = {
  async create(input: LeadCreateInput): Promise<Lead> {
    warnOnce();

    const now = new Date();
    const lead: Lead = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      budgetRange: input.budgetRange,
      status: input.status ?? "NEW",
      source: input.source ?? null,
      ipHash: input.ipHash ?? null,
      createdAt: now,
      updatedAt: now,
    };

    leads.push(lead);
    await persist();

    return lead;
  },

  async listRecent(limit = 50): Promise<Lead[]> {
    warnOnce();
    return [...leads].reverse().slice(0, limit);
  },

  reset(): void {
    leads = [];
  },
};
