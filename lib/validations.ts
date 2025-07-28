import { z } from 'zod';

export const urlSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine((url) => {
      try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }, 'URL must use HTTP or HTTPS protocol'),
});

export const shortCodeSchema = z.object({
  shortCode: z
    .string()
    .min(1, 'Short code is required')
    .max(20, 'Short code too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid characters in short code'),
});

export type UrlInput = z.infer<typeof urlSchema>;
export type ShortCodeInput = z.infer<typeof shortCodeSchema>;