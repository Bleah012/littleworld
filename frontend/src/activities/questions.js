// @ts-check

/** @typedef {import("../components/Illustration").World} World */
/** @typedef {{ instruction: string, answers: string[], correct: string, hint: string, stars?: number }} Question */
/** @typedef {Partial<Record<World, [Question, Question, Question]>>} QuestionSets */

/** @type {QuestionSets} */
const questions = {
  abc: [
    {
      instruction: "Which word means almost the same as “brave”?",
      answers: ["Calm", "Bold", "Quiet"],
      correct: "Bold",
      hint: "Think of someone willing to try something that feels scary.",
    },
    {
      instruction: "Which word means the opposite of “rare”?",
      answers: ["Bright", "Hidden", "Common"],
      correct: "Common",
      hint: "Look for a word that describes something you see often.",
    },
    {
      instruction: "Complete the sentence: Pip took a torch because the cave was …",
      answers: ["Dark", "Wide", "Warm"],
      correct: "Dark",
      hint: "A torch helps you see when there is very little light.",
    },
  ],
  numbers: [
    {
      instruction: "Pip has 5 stars and finds 8 more. How many stars does Pip have now?",
      answers: ["11", "13", "14"],
      correct: "13",
      hint: "Start at 5 and add 8.",
      stars: 5,
    },
    {
      instruction: "Each box holds 4 stars. How many stars are in 6 boxes?",
      answers: ["20", "24", "28"],
      correct: "24",
      hint: "Add six groups of 4.",
      stars: 4,
    },
    {
      instruction: "Pip gives away 6 of 24 stars. How many stars are left?",
      answers: ["20", "30", "18"],
      correct: "18",
      hint: "Subtract 6 from 24.",
      stars: 6,
    },
  ],
  games: [
    {
      instruction: "Find the circle!",
      answers: ["Circle", "Square", "Triangle"],
      correct: "Circle",
      hint: "A circle is round, with no corners.",
    },
    {
      instruction: "Find the triangle!",
      answers: ["Square", "Triangle", "Circle"],
      correct: "Triangle",
      hint: "A triangle has three pointy corners.",
    },
    {
      instruction: "Find the square!",
      answers: ["Triangle", "Circle", "Square"],
      correct: "Square",
      hint: "A square has four equal sides.",
    },
  ],
  explore: [
    {
      instruction: "Where do fish live?",
      answers: ["Ocean", "Forest", "Sky"],
      correct: "Ocean",
      hint: "Fish swim in water. Choose the ocean!",
    },
    {
      instruction: "What helps a flower grow?",
      answers: ["Shoes", "Sunshine", "Books"],
      correct: "Sunshine",
      hint: "Plants love light from the sun.",
    },
    {
      instruction: "Which animal can fly?",
      answers: ["Fox", "Fish", "Bird"],
      correct: "Bird",
      hint: "Look for the animal with wings.",
    },
  ],
}

/** @type {QuestionSets} */
const superExplorerQuestions = {
  abc: [
    {
      instruction: "Pip backed away from the shaky bridge. Which word best describes Pip?",
      answers: ["Bold", "Proud", "Wary"],
      correct: "Wary",
      hint: "Think of being careful when something might be risky.",
    },
    {
      instruction: "Choose the connecting word: The path was narrow, ___ we walked in single file.",
      answers: ["but", "so", "or"],
      correct: "so",
      hint: "The narrow path explains why they walked one behind the other.",
    },
    {
      instruction: "Pip drew a route through the forest on the map. What does “route” mean here?",
      answers: ["Path", "Tree", "Lake"],
      correct: "Path",
      hint: "Look for the word that means the way Pip plans to go.",
    },
  ],
  numbers: [
    {
      instruction: "Pip has 7 boxes of 5 stars. Four stars fall out. How many are still in the boxes?",
      answers: ["31", "34", "39"],
      correct: "31",
      hint: "Multiply 7 by 5 first. Then take away 4.",
      stars: 5,
    },
    {
      instruction: "What comes next in this star pattern? 4, 8, 16, 32, …",
      answers: ["48", "62", "64"],
      correct: "64",
      hint: "Each number is twice the one before it.",
      stars: 4,
    },
    {
      instruction: "Pip collects 6 stars a day for 4 days, then gives them equally to 3 friends. How many does each friend get?",
      answers: ["6", "8", "12"],
      correct: "8",
      hint: "Find the total for 4 days. Then divide by 3.",
      stars: 6,
    },
  ],
}

/**
 * @param {World} world
 * @param {number} step
 * @param {string} difficulty
 */
export default function getQuestion(world, step, difficulty) {
  const advanced =
    difficulty === "Super Explorer" ? superExplorerQuestions[world] : undefined
  const question = (advanced ?? questions[world])?.[step]
  if (!question || difficulty !== "Beginner") return question

  const distractor = question.answers.find((option) => option !== question.correct)
  return {
    ...question,
    answers: question.answers
      .filter((option) => option === question.correct || option === distractor)
      .sort(),
  }
}
