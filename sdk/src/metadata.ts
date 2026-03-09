import { RiftValidationError } from "./errors";
import type { ContestMetadata } from "./types";

const REQUIRED_FIELDS: Array<keyof ContestMetadata> = [
  "title",
  "description",
  "category",
  "task",
  "inputSpec",
  "outputSpec",
  "scoringMethod",
  "reviewRules",
];

export function validateMetadata(metadata: ContestMetadata): ContestMetadata {
  for (const field of REQUIRED_FIELDS) {
    const value = metadata[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new RiftValidationError(`Metadata field "${field}" is required`);
    }
  }

  if (metadata.tags && metadata.tags.some((tag) => !tag.trim())) {
    throw new RiftValidationError("Metadata tags cannot contain empty values");
  }

  return metadata;
}

export function metadataToJson(metadata: ContestMetadata): string {
  return JSON.stringify(validateMetadata(metadata), null, 2);
}
