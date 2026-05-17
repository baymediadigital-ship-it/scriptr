import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

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
      price: 29,
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
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
