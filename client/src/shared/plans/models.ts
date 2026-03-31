
export const BILLING_UNIT = {
  HOUR: "hour",
  HALF_DAY: "half_day",
  FULL_DAY: "full_day",
  FLAT: "flat",
  CUSTOM: "custom",
} as const;

export type BillingUnit = (typeof BILLING_UNIT)[keyof typeof BILLING_UNIT];

// Interface specifically for public display
export interface PublicPackageData {
  id: string;
  roomId: string; 
  name: string;
  description?: string;
  billingUnit: string;
  price: number;
  minDuration?: number;
  maxDuration?: number
  metadata: any; 
}