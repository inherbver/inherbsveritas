import "server-only";
import Stripe from 'stripe';

if (!process.env['STRIPE_SECRET_KEY']) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env['STRIPE_WEBHOOK_SECRET']) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
}

if (!process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
  apiVersion: '2025-08-27.basil', // Version API Stripe supportée
  typescript: true,
});

export const config = {
  publishableKey: process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!,
  webhookSecret: process.env['STRIPE_WEBHOOK_SECRET']!,
  appUrl: process.env['NEXT_PUBLIC_APP_URL']!,
} as const;