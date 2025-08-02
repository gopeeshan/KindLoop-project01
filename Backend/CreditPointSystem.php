<?php
function calculateNormalizedCreditPoints($category, $condition, $usageDuration)
{
    $categoryBasePoints = [
        "Clothing & Accessories" => 10,
        "Electronics" => 20,
        "Books & Education" => 15,
        "Furniture" => 25,
        "Sports & Outdoors" => 18,
        "Kitchen & Dining" => 12,
        "Home & Garden" => 14,
        "Toys & Games" => 10,
        "Baby & Kids" => 15,
        "Others" => 0
    ];

    $conditionMultipliers = [
        "Excellent" => 1.5,
        "Very Good" => 1.3,
        "Good" => 1.0,
        "Acceptable" => 0.7,
        "Needs Repair" => 0.3,
        "Not Sure" => 0
    ];

    $usageMultipliers = [
        "Within 1" => 1.5,
        "2 to 4" => 1.2,
        "5 to 7" => 1.0,
        "8 to 10" => 0.7,
        "More Than 10" => 0.4,
        "Not Sure" => 0
    ];

    $MAX_POSSIBLE_SCORE = 25 * 1.5 * 1.5; // = 56.25

    if (
        $category === "Others" ||
        $condition === "Not Sure" ||
        $usageDuration === "Not Sure"
    ) {
        return 0;
    }

    $base = $categoryBasePoints[$category] ?? 0;
    $conditionMultiplier = $conditionMultipliers[$condition] ?? 0;
    $usageMultiplier = $usageMultipliers[$usageDuration] ?? 0;

    $rawPoints = $base * $conditionMultiplier * $usageMultiplier;
    $credits = round(($rawPoints / $MAX_POSSIBLE_SCORE) * 100);

    return $credits;
}
