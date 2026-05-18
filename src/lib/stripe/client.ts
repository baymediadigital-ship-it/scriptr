import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// When raising prices, create a new $39/mo price in Stripe and set
// STRIPE_PRO_MONTHLY_V2_PRICE_ID in Vercel env vars.
// New signups will use V2 automatically. Existing users stay on V1 forever.
const MONTHLY_PRICE_ID = process.env.STRIPE_PRO_MONTHLY_V2_PRICE_ID
  || process.env.STRIPE_PRO_MONTHLY_PRICE_ID!;

const MONTHLY_PRICE = process.env.STRIPE_PRO_MONTHLY_V2_PRICE_ID ? 39 : 29;

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      outlierSearches: 10,
      scriptsGenerated: 5,
      trackedCompetitors: 2,
    },
  },
  pro: {
    name: "Pro",
    trialDays: 7,
    trialPrice: 5,
    trialPriceId: process.env.STRIPE_TRIAL_PRICE_ID!,
    monthly: {
      price: MONTHLY_PRICE,
      priceId: MONTHLY_PRICE_ID,
      // Legacy price — always $29, never changes for existing users
      legacyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      legacyPrice: 29,
    },
    yearly: {
      price: 249,
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
      savings: "Save $99",
      monthlyEquivalent: 20.75,
    },
    limits: {
      outlierSearches: Infinity,
      scriptsGenerated: Infinity,
      trackedCompetitors: Infinity,
    },
  },
} as const;

export type Plan = keyof typeof PLANS;
export type BillingInterval = "monthly" | "yearly";
