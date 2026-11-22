const demoCatalog = {
  products: {
    "craft-kit": {
      name: "Craft Kit",
      description: "Paper, stickers, and prompts for an afternoon of making.",
    },
    "puzzle-book": {
      name: "Puzzle Book",
      description: "Word and number puzzles to solve at your own pace.",
    },
    "star-stickers": {
      name: "Star Stickers",
      description: "Colourful stars for notebooks and creative projects.",
    },
  },
  services: {
    "creative-workshop": {
      name: "Creative Workshop",
      description: "Make a paper scene with a facilitator.",
      durationMinutes: 45,
    },
    "story-club": {
      name: "Story Club",
      description: "Read a short story together and imagine what happens next.",
      durationMinutes: 30,
    },
  },
}

export async function seedCatalog(db) {
  const batch = db.batch()

  for (const [collection, items] of Object.entries(demoCatalog)) {
    for (const [id, item] of Object.entries(items)) {
      batch.set(db.collection(collection).doc(id), item, { merge: true })
    }
  }

  await batch.commit()
}
