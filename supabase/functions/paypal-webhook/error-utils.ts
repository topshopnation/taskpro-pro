
import { logger } from "./logger.ts";
import { createResponse } from "./response.ts";

// Define specific error types
export class WebhookError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "WebhookError";
    this.statusCode = statusCode;
  }
}

export class ValidationError extends WebhookError {
  constructor(message: string) {
    super(`Validation error: ${message}`, 400);
    this.name = "ValidationError";
  }
}

export class PaymentProcessingError extends WebhookError {
  constructor(message: string) {
    super(`Payment processing error: ${message}`, 422);
    this.name = "PaymentProcessingError";
  }
}

export class DatabaseError extends WebhookError {
  constructor(message: string) {
    super(`Database error: ${message}`, 500);
    this.name = "DatabaseError";
  }
}

// Global error handler
export function handleError(error: unknown) {
  if (error instanceof WebhookError) {
    logger.error(`${error.name}: ${error.message}`);
    return createResponse({ error: error.message, type: error.name }, error.statusCode);
  } else {
    // Generic error handling
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Unhandled exception:", error);
    return createResponse({ error: message }, 500);
  }
}

// Function to validate required fields
export function validateRequiredFields(obj: Record<string, any>, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => obj[field] === undefined);
  
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }
}
