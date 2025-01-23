export const generateCombinations = (arr, size) => {
  const results = [];
  const combine = (path, index) => {
    if (path.length === size) {
      results.push([...path]);
      return;
    }
    for (let i = index; i < arr.length; i++) {
      combine([...path, arr[i]], i + 1);
    }
  };
  combine([], 0);
  return results;
};

export const filterCombinations = (combinations, excludedNumber, filters) => {
  return combinations.filter((combination) => {
    const hasConsecutiveEvens = combination.some(
      (num, index) => num % 2 === 0 && combination[index + 1] % 2 === 0
    );
    const hasConsecutiveOdds = combination.some(
      (num, index) => num % 2 !== 0 && combination[index + 1] % 2 !== 0
    );
    const hasAllEvens = combination.every((num) => num % 2 === 0);
    const hasAllOdds = combination.every((num) => num % 2 !== 0);

    const hasThreeConsecutive = combination.some(
      (_, i) =>
        i <= combination.length - 3 &&
        combination[i + 1] === combination[i] + 1 &&
        combination[i + 2] === combination[i] + 2
    );

    const hasThreeInRange = (min, max) =>
      combination.filter((num) => num >= min && num <= max).length >= 3;

    const hasThreeInOnesPlace = Object.values(
      combination.reduce((acc, num) => {
        const ones = num % 10;
        acc[ones] = (acc[ones] || 0) + 1;
        return acc;
      }, {})
    ).some((count) => count >= 3);

    const hasThreeInFiveRange = combination.some((num, index) => {
      const range = combination.filter(
        (otherNum) => otherNum >= num && otherNum < num + 5
      );
      return range.length >= 3;
    });

    const containsExcludedNumber = combination.includes(Number(excludedNumber));

    const hasConsecutiveCountingNumbers = combination.some(
      (num, index) => combination[index + 1] === num + 1
    );

    return (
      !containsExcludedNumber &&
      (!filters.excludeAllEvenNumbers ||
        (!hasAllEvens && !hasConsecutiveEvens)) &&
      (!filters.excludeAllOddNumbers || (!hasAllOdds && !hasConsecutiveOdds)) &&
      (!filters.excludeThreeConsecutiveNumbers || !hasThreeConsecutive) &&
      (!filters.excludeThreeNumbersInRangeBetween1to9 ||
        !hasThreeInRange(1, 9)) &&
      (!filters.excludeThreenumbersInRangeBetween10to19 ||
        !hasThreeInRange(10, 19)) &&
      (!filters.excludeThreeNumbersInRangeBetween20to29 ||
        !hasThreeInRange(20, 29)) &&
      (!filters.excludeThreeNumbersInRangeBetween30to39 ||
        !hasThreeInRange(30, 39)) &&
      (!filters.excludeSameOnesDigit || !hasThreeInOnesPlace) &&
      (!filters.excludeThreeNumbersInRangeOfFive || !hasThreeInFiveRange) &&
      (!filters.excludeConsecutiveCountingNumbers ||
        !hasConsecutiveCountingNumbers)
    );
  });
};
