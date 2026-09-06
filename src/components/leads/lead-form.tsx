"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";

import { LeadConfirmation } from "@/components/leads/lead-confirmation";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, fieldErrorId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting, submitCount },
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

  function onSubmit(values: LeadInput) {
    // mutate, not mutateAsync: the rejection is already surfaced through
    // submitLead.isError, and awaiting it here would additionally throw out of
    // handleSubmit as an unhandled promise rejection.
    submitLead.mutate(values);
  }

  // With several errors at once, a summary is faster to act on than hunting
  // down individual fields, so focus moves to it rather than leaving keyboard
  // and screen reader users sitting on the submit button.
  //
  // This runs as an effect keyed on submitCount, not inside the invalid
  // handler: at handler time React has not committed the summary yet, so
  // there is nothing to focus. submitCount is in the key so a second failed
  // submit re-announces instead of going silent.
  useEffect(() => {
    if (submitCount > 0 && showSummary) summaryRef.current?.focus();
  }, [submitCount, showSummary]);

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {showSummary ? (
        <div
          className="bg-destructive-surface border-destructive text-destructive mt-6 border-l-4 p-4
            text-[0.9375rem]"
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
        >
          <strong>{errorEntries.length} fields need attention.</strong>
          <ul className="mt-2 list-disc pl-4 text-sm">
            {errorEntries.map(([name, error]) => (
              <li key={name}>
                <a className="underline" href={`#${name}`}>
                  {FIELD_LABELS[name]}: {String(error?.message ?? "")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {submitLead.isError ? (
        <div
          className="bg-destructive-surface border-destructive text-destructive mt-6 border-l-4 p-4
            text-[0.9375rem]"
          role="alert"
        >
          {submitLead.error.message}
        </div>
      ) : null}

      <Field>
        <FieldLabel htmlFor="name" required>
          Full name
        </FieldLabel>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? fieldErrorId("name") : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <FieldError id={fieldErrorId("name")}>{errors.name.message}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="email" required>
          Email
        </FieldLabel>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? fieldErrorId("email") : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <FieldError id={fieldErrorId("email")}>{errors.email.message}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="phone" required>
          Phone
        </FieldLabel>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+971 50 123 4567"
          aria-required="true"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? fieldErrorId("phone") : undefined}
          {...register("phone")}
        />
        {errors.phone ? (
          <FieldError id={fieldErrorId("phone")}>{errors.phone.message}</FieldError>
        ) : null}
      </Field>

      {/* Radix Select is not a native input, so it is driven by Controller
          rather than register — the current shadcn form pattern. */}
      <Field>
        <FieldLabel htmlFor="budgetRange" required>
          Budget band
        </FieldLabel>
        <Controller
          control={control}
          name="budgetRange"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="budgetRange"
                ref={field.ref}
                onBlur={field.onBlur}
                aria-required="true"
                aria-invalid={Boolean(errors.budgetRange)}
                aria-describedby={
                  errors.budgetRange ? fieldErrorId("budgetRange") : undefined
                }
              >
                <SelectValue placeholder="Select a band" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.budgetRange ? (
          <FieldError id={fieldErrorId("budgetRange")}>{errors.budgetRange.message}</FieldError>
        ) : null}
      </Field>

      {/* Honeypot: off-screen and untabbable, so only a bot fills it. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <Button className="mt-8" type="submit" disabled={isBusy}>
        {isBusy ? "Sending…" : "Request a callback"}
      </Button>
    </form>
  );
}
