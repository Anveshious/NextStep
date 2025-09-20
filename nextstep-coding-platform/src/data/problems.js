export const problems = [
  {
    id: 1,
    title: "Sum of Two Numbers",
    topic: "Math",
    description: "Write a function that takes two numbers as parameters and returns their sum. Handle both positive and negative numbers correctly.",
    difficulty: "easy",
    testCases: [
      { input: [1, 2], expected: 3, description: "Basic positive sum" },
      { input: [5, -3], expected: 2, description: "Positive + negative" },
      { input: [-1, -4], expected: -5, description: "Both negative" },
      { input: [0, 100], expected: 100, description: "Zero + positive" }
    ],
    hints: [
      "Use the + operator to add numbers",
      "Make sure your function returns the result",
      "Negative numbers work the same way as positive ones"
    ],
    optimizationHint: "This is already optimal! Consider using arrow functions: const sum = (a, b) => a + b",
    template: `function sumTwoNumbers(a, b) {
    // Your code here
    return a + b;
}`
  },
  // ... rest of your problems
];