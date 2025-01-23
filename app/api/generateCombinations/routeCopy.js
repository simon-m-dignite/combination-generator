import {
  generateCombinations,
  filterCombinations,
} from "../../../utils/combinations";

export async function GET(req) {
  return new Response("Hello world", { status: 200 });
}

export async function POST(req) {
  const { start, end, combinationSize, excludedNumber, filters } =
    await req.json();

  try {
    // Generate combinations
    const numbers = Array.from(
      { length: end - start + 1 },
      (_, i) => i + start
    );

    const combinations = generateCombinations(numbers, combinationSize);

    // Filter combinations
    const filteredCombinations = filterCombinations(
      combinations,
      excludedNumber,
      filters
    );

    // Return the filtered combinations in the response
    return new Response(JSON.stringify(filteredCombinations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating combinations:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
