"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { LeadConfirmation } from "@/components/leads/lead-confirmation";
import { Field, errorId } from "@/components/ui/field";
import { BUDGET_RANGES } from "@/constants/budget-ranges";
import { useSubmitLead } from "@/hooks/use-submit-lead";
import { leadInputSchema, type LeadInput } from "@/schemas/lead.schema";

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  email: "Email",
  phone: "Phone",
  budgetRange: "Budget band",
};

export function LeadForm() {
  const submitLead = useSubmitLead();
  const summaryRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadInputSchema),
    // Validate when a field is left, not on every keystroke: telling someone
    // their email is invalid while they are halfway through typing it is
    // noise, not help.
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", company: "" },
  });

  const errorEntries = Object.entries(errors).filter(([key]) => key in FIELD_LABELS);
  const showSummary = errorEntries.length > 1;

  async function onSubmit(values: LeadInput) {
    await submitLead.mutateAsync(values);
  }

  function onInvalid() {
    // With several errors at once, a summary is faster to act on than hunting
    // down individual fields. Focus moves to it so keyboard and screen reader
    // users are told what happened rather than left sitting on the button.
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  function startOver() {
    submitLead.reset();
    reset();
  }

  if (submitLead.isSuccess) {
    return (
      <LeadConfirmation
        reference={submitLead.data.id}
        submitted={getValues()}
        onStartOver={startOver}
      />
    );
  }

  const isBusy = isSubmitting || submitLead.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      {showSummary ? (
        <div className="notice" ref={summaryRef} tabIndex={-1} role="alert">
          <strong>{errorEntries.length} fields need attention.</strong>
          <ul className="notice-list">
            {errorEntries.map(([name, error]) => (
              <li key={name}>
                <a href={`#${name}`}>
                  {FIELD_LABELS[name]}: {String(error?.message ?? "")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {submitLead.isError ? (
        <div className="notice" role="alert">
          {submitLead.error.message}
        </div>
      ) : null}

      <Field id="name" label="Full name" error={errors.name?.message} required>
        <input
          id="name"
          type="text"
          className="field-control"
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? errorId("name") : undefined}
          {...register("name")}
        />
      </Field>

      <Field id="email" label="Email" error={errors.email?.message} required>
        <input
          id="email"
          type="email"
          className="field-control"
          inputMode="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? errorId("email") : undefined}
          {...register("email")}
        />
      </Field>

      <Field id="phone" label="Phone" error={errors.phone?.message} required>
        <input
          id="phone"
          type="tel"
          className="field-control"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+971 50 123 4567"
          aria-required="true"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? errorId("phone") : undefined}
          {...register("phone")}
        />
      </Field>

      <Field id="budgetRange" label="Budget band" error={errors.budgetRange?.message} required>
        <select
          id="budgetRange"
          className="field-control field-select"
          defaultValue=""
          aria-required="true"
          aria-invalid={Boolean(errors.budgetRange)}
          aria-describedby={errors.budgetRange ? errorId("budgetRange") : undefined}
          {...register("budgetRange")}
        >
          <option value="" disabled>
            Select a band
          </option>
          {BUDGET_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Honeypot: off-screen and untabbable, so only a bot fills it. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <button className="submit" type="submit" disabled={isBusy}>
        {isBusy ? "Sending…" : "Request a callback"}
      </button>
    </form>
  );
}
