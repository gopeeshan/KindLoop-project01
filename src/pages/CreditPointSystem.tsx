
type Category =
  | "Clothing & Accessories"
  | "Electronics"
  | "Books & Education"
  | "Furniture"
  | "Sports & Outdoors"
  | "Kitchen & Dining"
  | "Home & Garden"
  | "Toys & Games"
  | "Baby & Kids"
  | "Others";

type Condition =
  | "Excellent"
  | "Very Good"
  | "Good"
  | "Acceptable"
  | "Needs Repair"
  | "Not Sure";

type UsageDuration =
  | "Within 1"
  | "2 to 4"
  | "5 to 7"
  | "8 to 10"
  | "More Than 10"
  | "Not Sure";

const categoryBasePoints: Record<Category, number> = {
  "Clothing & Accessories": 10,
  Electronics: 20,
  "Books & Education": 15,
  Furniture: 25,
  "Sports & Outdoors": 18,
  "Kitchen & Dining": 12,
  "Home & Garden": 14,
  "Toys & Games": 10,
  "Baby & Kids": 15,
  Others: 0, // invalid
};

const conditionMultipliers: Record<Condition, number> = {
  Excellent: 1.5,
  "Very Good": 1.3,
  Good: 1.0,
  Acceptable: 0.7,
  "Needs Repair": 0.3,
  "Not Sure": 0, // invalid
};

const usageMultipliers: Record<UsageDuration, number> = {
  "Within 1": 1.5,
  "2 to 4": 1.2,
  "5 to 7": 1.0,
  "8 to 10": 0.7,
  "More Than 10": 0.4,
  "Not Sure": 0, // invalid
};

// Max possible raw score: Furniture (25) × Excellent (1.5) × Within 1 (1.5)
const MAX_POSSIBLE_SCORE = 25 * 1.5 * 1.5; // = 56.25

function calculateNormalizedCreditPoints(
  category: Category,
  condition: Condition,
  usageDuration: UsageDuration
): number {
  if (
    category === "Others" ||
    condition === "Not Sure" ||
    usageDuration === "Not Sure"
  ) {
    return 0;
  }

  const base = categoryBasePoints[category];
  const conditionMultiplier = conditionMultipliers[condition];
  const usageMultiplier = usageMultipliers[usageDuration];

  const rawPoints = base * conditionMultiplier * usageMultiplier;
  const normalized = Math.round((rawPoints / MAX_POSSIBLE_SCORE) * 100);
  return normalized;
}
