export type Project = { id: string; name: string; findings: number };

// In-memory stand-in for an API; the fixture only needs realistic state changes.
export const SAMPLE_PROJECTS: Project[] = [
  { id: "api-gateway", name: "api-gateway", findings: 3 },
  { id: "billing", name: "billing", findings: 0 },
];

export const SCAN_STEPS = ["Resolving hosts", "Crawling endpoints", "Matching rules", "Writing report"];
