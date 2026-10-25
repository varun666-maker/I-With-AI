"use client";

import React from "react";

/**
 * Honeypot spam protection field (Launch Checklist Item 10).
 * Hidden from real users using absolute positioning and aria-hidden,
 * but picked up by spam bots.
 */
export function HoneypotField({
  name = "website_hp_verification",
  value = "",
  onChange,
}: {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <label htmlFor={name}>Leave this field empty for verification</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

/**
 * Helper to validate that a honeypot field is empty.
 * Returns true if clean (human), false if spam bot.
 */
export function isHumanSubmission(honeypotValue?: string): boolean {
  return !honeypotValue || honeypotValue.trim().length === 0;
}
