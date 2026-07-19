import type { CheatSheetData } from "./types";

const embeddingsCheatSheet: CheatSheetData = {
  title: "Embeddings",
  subtitle: "Meaning as vectors",
  sections: [
    {
      title: "Dense vs One-Hot",
      color: "violet",
      rows: [
        { term: "One-hot", desc: "Every word EQUALLY distant — no similarity notion" },
        { term: "Embedding", desc: "LEARNED vector — similar meaning = close vectors" },
      ],
    },
    {
      title: "Word2Vec",
      color: "blue",
      rows: [
        { term: "CBOW", desc: "Predict CENTER word from CONTEXT" },
        { term: "Skip-gram", desc: "Predict CONTEXT from CENTER word" },
        { term: "Famous property", desc: "king - man + woman ~= queen" },
      ],
    },
    {
      title: "Static vs Contextual",
      color: "emerald",
      rows: [
        { term: "Static (Word2Vec/GloVe)", desc: "ONE fixed vector per word, no context" },
        { term: "Contextual (BERT-style)", desc: "Different vector per context — handles polysemy" },
        { term: "Where contextual comes from", desc: "Just a Transformer's own hidden states" },
      ],
    },
    {
      title: "Similarity Metrics",
      color: "amber",
      rows: [
        {
          term: "Cosine similarity",
          desc: "Angle only, ignores magnitude — the standard default",
          code: "cos_sim(a, b) = dot(a, b) / (norm(a) * norm(b))",
        },
        { term: "Dot product", desc: "Angle + magnitude — use if the model was trained for it" },
        { term: "Always verify", desc: "Use the metric the specific model was trained/documented for" },
      ],
    },
    {
      title: "Sentence Embeddings",
      color: "rose",
      rows: [
        { term: "Pooling", desc: "Mean or special-token pooling over all token embeddings" },
        { term: "Powers", desc: "Semantic search, RAG" },
      ],
    },
    {
      title: "Embedding Bias",
      color: "cyan",
      rows: [
        { term: "The concern", desc: "Reflects/amplifies societal bias present in training text" },
        { term: "Mitigation", desc: "Debiasing techniques, balanced data, fairness auditing" },
      ],
    },
  ],
};

export default embeddingsCheatSheet;
