/**
 * Backend Architecture Entry Point
 * Exports database client, server services, sandboxed runners, and datasets.
 */

export * from "./db/client";
export * as services from "./services/api";
export * from "./runners/server-code-runner";
export * from "./runners/ai-code-reviewer";
export * from "./runners/code-evaluator";
