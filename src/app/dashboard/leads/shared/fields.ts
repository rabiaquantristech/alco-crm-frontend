import { ModalField } from "@/types/ui";

// ── Add Lead Fields ──────────────────────────────────────────
export const addLeadFields: ModalField[] = [
  { name: "first_name", label: "First Name", type: "input", inputType: "text", placeholder: "Ahmed" },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text", placeholder: "Khan" },
  { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "ahmed@gmail.com" },
  { name: "phone", label: "Phone", type: "input", inputType: "text", placeholder: "03001234567" },
  { name: "nationality", label: "Nationality", type: "input", inputType: "text", placeholder: "Pakistani" },
  { name: "profession", label: "Profession", type: "input", inputType: "text", placeholder: "Engineer" },
  { name: "opportunity_value", label: "Opportunity Value (Rs)", type: "input", inputType: "number", placeholder: "200000" },
  {
    name: "program_id", label: "Program", type: "select",
    options: [],
  },
  {
    name: "batch_id",
    label: "Batch",
    type: "select",
    options: [],
  },
  {
    name: "source", label: "Source", type: "select",
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
    ],
  },
  {
    name: "quality", label: "Quality", type: "select",
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ],
  },
  { name: "query", label: "Query", type: "textarea", placeholder: "Client ka sawaal..." },
  { name: "message", label: "Message", type: "textarea", placeholder: "Additional message..." },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Internal notes..." },
  { name: "utm_source", label: "UTM Source", type: "input", inputType: "text", placeholder: "google" },
  { name: "utm_medium", label: "UTM Medium", type: "input", inputType: "text", placeholder: "cpc" },
  { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text", placeholder: "nlp-2025" },
];

// ── Simple Add Lead Fields (Sales Rep / Sales Manager) ───────
export const simpleAddLeadFields: ModalField[] = [
  { name: "first_name", label: "First Name", type: "input", inputType: "text", placeholder: "Ahmed" },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text", placeholder: "Khan" },
  { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "ahmed@gmail.com" },
  { name: "phone", label: "Phone", type: "input", inputType: "text", placeholder: "03001234567" },
  {
    name: "source", label: "Source", type: "select",
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
    ],
  },
  {
    name: "quality", label: "Quality", type: "select",
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Koi notes..." },
];

// ── Edit Lead Fields (Admin / Sales Manager) ─────────────────
export const editLeadFields: ModalField[] = [
  { name: "first_name", label: "First Name", type: "input", inputType: "text" },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text" },
  { name: "email", label: "Email", type: "input", inputType: "email" },
  { name: "phone", label: "Phone", type: "input", inputType: "text" },
  { name: "nationality", label: "Nationality", type: "input", inputType: "text" },
  { name: "profession", label: "Profession", type: "input", inputType: "text" },
  { name: "opportunity_value", label: "Opportunity Value (Rs)", type: "input", inputType: "number" },
  {
    name: "program_id", label: "Program", type: "select",
    options: [],
  },
  {
    name: "batch_id",
    label: "Batch",
    type: "select",
    options: [],
  },
  {
    name: "status", label: "Status", type: "select",
    options: [
      { label: "New", value: "new" },
      { label: "Contacted", value: "contacted" },
      { label: "Qualified", value: "qualified" },
      { label: "Interested", value: "interested" },
      { label: "Converted", value: "converted" },
      { label: "Lost", value: "lost" },
    ],
  },
  {
    name: "quality", label: "Quality", type: "select",
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ],
  },
  {
    name: "source", label: "Source", type: "select",
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
    ],
  },
  { name: "query", label: "Query", type: "textarea", placeholder: "Client ka sawaal..." },
  { name: "message", label: "Message", type: "textarea", placeholder: "Additional message..." },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Internal notes..." },
  { name: "utm_source", label: "UTM Source", type: "input", inputType: "text" },
  { name: "utm_medium", label: "UTM Medium", type: "input", inputType: "text" },
  { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text" },
];

// ── Edit Lead Fields (Sales Rep — limited/disabled) ──────────
export const editLeadFieldsReadonly: ModalField[] = [
  { name: "first_name", label: "First Name", type: "input", inputType: "text", disabled: true },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text", disabled: true },
  { name: "email", label: "Email", type: "input", inputType: "email", disabled: true },
  { name: "phone", label: "Phone", type: "input", inputType: "text", disabled: true },
  {
    name: "quality", label: "Quality", type: "select", disabled: true,
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ],
  },
  {
    name: "source", label: "Source", type: "select", disabled: true,
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
    ],
  },
  {
    name: "status", label: "Status", type: "select",
    options: [
      { label: "New", value: "new" },
      { label: "Contacted", value: "contacted" },
      { label: "Qualified", value: "qualified" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Notes...", disabled: true },
  { name: "utm_source", label: "UTM Source", type: "input", inputType: "text", disabled: true },
  { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text", disabled: true },
];

// ── Activity Fields ──────────────────────────────────────────
export const activityFields: ModalField[] = [
  {
    name: "activity_type", label: "Activity Type", type: "select",
    options: [
      { label: "Call", value: "call" },
      { label: "Email", value: "email" },
      { label: "Meeting", value: "meeting" },
      { label: "Note", value: "note" },
    ],
  },
  { name: "title", label: "Title", type: "input", inputType: "text", placeholder: "First call" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Details..." },
  { name: "call_duration_minutes", label: "Call Duration (mins)", type: "input", inputType: "text", placeholder: "15" },
  { name: "call_outcome", label: "Call Outcome", type: "input", inputType: "text", placeholder: "interested" },
];

// ── Lost Fields ──────────────────────────────────────────────
export const lostFields: ModalField[] = [
  { name: "lost_reason", label: "Lost Reason", type: "input", inputType: "text", placeholder: "Too expensive" },
  { name: "lost_notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
];