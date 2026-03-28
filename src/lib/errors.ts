import { NextResponse } from "next/server";
import type { StructuredError } from "@/types/api";

export function createErrorResponse(
  code: string,
  reason: string,
  remediation: string,
  status: number
) {
  return NextResponse.json(
    { error: { code, reason, remediation } satisfies StructuredError },
    { status }
  );
}

export const ERRORS = {
  INVALID_YOUTUBE_URL: {
    code: "INVALID_YOUTUBE_URL",
    reason: "The provided URL is not a valid YouTube video URL",
    remediation: "Provide a URL in the format: https://youtube.com/watch?v=VIDEO_ID",
    status: 400,
  },
  VIDEO_NOT_FOUND: {
    code: "VIDEO_NOT_FOUND",
    reason: "No video found for the provided URL",
    remediation: "Check that the video exists and is publicly accessible",
    status: 404,
  },
  YOUTUBE_API_ERROR: {
    code: "YOUTUBE_API_ERROR",
    reason: "Failed to fetch data from YouTube API",
    remediation: "Try again in a few moments. If the problem persists, the API key may be invalid",
    status: 502,
  },
  PERMISSION_DENIED: {
    code: "PERMISSION_DENIED",
    reason: "Authentication required for this action",
    remediation: "Sign in or create an account to continue",
    status: 401,
  },
  ENTITY_NOT_FOUND: {
    code: "ENTITY_NOT_FOUND",
    reason: "The requested resource was not found",
    remediation: "Verify the ID is correct and you have access",
    status: 404,
  },
  DUPLICATE_SAVE: {
    code: "DUPLICATE_SAVE",
    reason: "This video has already been saved to your account",
    remediation: "Check your dashboard for the existing saved analysis",
    status: 409,
  },
  INVALID_CHANNEL_URL: {
    code: "INVALID_CHANNEL_URL",
    reason: "The provided URL is not a valid YouTube channel URL",
    remediation: "Provide a URL like: https://youtube.com/@channelname",
    status: 400,
  },
  NO_RECENT_VIDEOS: {
    code: "NO_RECENT_VIDEOS",
    reason: "This channel has no public videos",
    remediation: "Try a channel with public videos",
    status: 404,
  },
  CHANNEL_NOT_FOUND: {
    code: "CHANNEL_NOT_FOUND",
    reason: "Could not find a YouTube channel for the provided URL",
    remediation: "Check the URL and try again",
    status: 404,
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    reason: "Invalid request data",
    remediation: "Check the request body matches the expected format",
    status: 400,
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    reason: "An unexpected error occurred",
    remediation: "Try again in a few moments",
    status: 500,
  },
  EMAIL_TAKEN: {
    code: "EMAIL_TAKEN",
    reason: "An account with this email already exists",
    remediation: "Try logging in instead, or use a different email",
    status: 409,
  },
  LOGIN_FAILED: {
    code: "LOGIN_FAILED",
    reason: "Invalid email or password",
    remediation: "Check your credentials and try again",
    status: 401,
  },
  LOGOUT_FAILED: {
    code: "LOGOUT_FAILED",
    reason: "Failed to sign out",
    remediation: "Try again or clear your browser cookies",
    status: 500,
  },
  REGISTRATION_FAILED: {
    code: "REGISTRATION_FAILED",
    reason: "Unable to create account",
    remediation: "Check your email and password and try again",
    status: 400,
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    reason: "Too many requests — please slow down and try again",
    remediation: "Wait a moment before retrying",
    status: 429,
  },
  PASSWORD_TOO_SHORT: {
    code: "PASSWORD_TOO_SHORT",
    reason: "Password must be at least 8 characters",
    remediation: "Choose a longer password",
    status: 400,
  },
  VIDEO_AI_GENERATION_FAILED: {
    code: "VIDEO_AI_GENERATION_FAILED",
    reason: "Failed to generate AI analysis for this video",
    remediation: "Try again in a few moments. If the problem persists, the AI service may be temporarily unavailable",
    status: 502,
  },
} as const;

export function errorResponse(key: keyof typeof ERRORS) {
  const e = ERRORS[key];
  return createErrorResponse(e.code, e.reason, e.remediation, e.status);
}
