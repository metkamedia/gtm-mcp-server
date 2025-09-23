import { z } from "zod";
import { ParameterSchema } from "./ParameterSchema.js";

export const CaseConversionTypeEnum = z.enum([
  "none",
  "lowercase",
  "uppercase",
]);

export const VariableSchema = z.object({
  accountId: z.string().describe("GTM Account ID."),
  containerId: z.string().describe("GTM Container ID."),
  workspaceId: z.string().describe("GTM Workspace ID."),
  variableId: z
    .string()
    .optional()
    .describe("The Variable ID uniquely identifies the GTM Variable."),
  fingerprint: z
    .string()
    .optional()
    .describe(
      "The fingerprint of the GTM Variable as computed at storage time. This value is recomputed whenever the variable is modified.",
    ),
  name: z.string().optional().describe("Variable display name."),
  type: z.string().optional().describe("Variable type."),
  parameter: z
    .array(ParameterSchema)
    .optional()
    .describe("The variable's parameters."),
  notes: z
    .string()
    .optional()
    .describe("User notes on how to apply this variable in the container."),
  tagManagerUrl: z
    .string()
    .optional()
    .describe("Auto generated link to the tag manager UI."),
});
