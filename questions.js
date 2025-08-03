const questionPool = [
  {
    id: "q1",
    text: "How much do you enjoy horror movies?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "tv"
  },
  {
    id: "q2",
    text: "How outgoing are you at social events?",
    type: "scale", min: 1, max: 10, weight: 3, topic: "personality"
  },
  {
    id: "q3",
    text: "How much do you care about current news?",
    type: "scale", min: 1, max: 10, weight: 1, topic: "news"
  },
  {
    id: "q4",
    text: "How much do you enjoy watching sports?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "sports"
  },
  {
    id: "q5",
    text: "How important is humor in a partner?",
    type: "scale", min: 1, max: 10, weight: 3, topic: "personality"
  },
  {
    id: "q6",
    text: "How adventurous are you with food?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "lifestyle"
  },
  {
    id: "q7",
    text: "How often do you watch documentaries?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "tv"
  },
  {
    id: "q8",
    text: "How much do you enjoy outdoor activities?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "lifestyle"
  },
  {
    id: "q9",
    text: "How often do you follow trending topics on social media?",
    type: "scale", min: 1, max: 10, weight: 1, topic: "social"
  },
  {
    id: "q10",
    text: "How much do you enjoy deep conversations?",
    type: "scale", min: 1, max: 10, weight: 3, topic: "personality"
  },
  {
    id: "q11",
    text: "How often do you watch stand-up comedy?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "tv"
  },
  {
    id: "q12",
    text: "How important is punctuality to you?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "values"
  },
  {
    id: "q13",
    text: "How much do you like to travel?",
    type: "scale", min: 1, max: 10, weight: 3, topic: "lifestyle"
  },
  {
    id: "q14",
    text: "How tech-savvy are you?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "tech"
  },
  {
    id: "q15",
    text: "How competitive are you by nature?",
    type: "scale", min: 1, max: 10, weight: 1, topic: "personality"
  },
  {
    id: "q16",
    text: "How much do you enjoy reading books?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "hobbies"
  },
  {
    id: "q17",
    text: "How much do you like pets?",
    type: "scale", min: 1, max: 10, weight: 3, topic: "values"
  },
  {
    id: "q18",
    text: "How organized are you in daily life?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "values"
  },
  {
    id: "q19",
    text: "How often do you watch romantic films?",
    type: "scale", min: 1, max: 10, weight: 1, topic: "tv"
  },
  {
    id: "q20",
    text: "How open are you to trying new hobbies?",
    type: "scale", min: 1, max: 10, weight: 2, topic: "lifestyle"
  }
];

function getRandomQuestions(count = 8) {
  const shuffled = questionPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = { questionPool, getRandomQuestions };
