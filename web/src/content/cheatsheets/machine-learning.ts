import type { CheatSheetData } from "./types";

const machineLearningCheatSheet: CheatSheetData = {
  title: "Machine Learning",
  subtitle: "Supervised, unsupervised, and the ML lifecycle",
  sections: [
    {
      title: "The Three Paradigms",
      color: "violet",
      rows: [
        { term: "Supervised", desc: "Learn a mapping from labeled input -> output" },
        { term: "Unsupervised", desc: "Find structure in unlabeled data" },
        { term: "Reinforcement", desc: "Learn a policy via reward signals from an environment" },
      ],
    },
    {
      title: "Bias-Variance Tradeoff",
      color: "blue",
      rows: [
        { term: "Underfitting (high bias)", desc: "Poor on BOTH train and validation" },
        { term: "Overfitting (high variance)", desc: "Great on train, meaningfully worse on validation" },
        { term: "Fix bias", desc: "More complexity/features, less regularization" },
        { term: "Fix variance", desc: "More data, more regularization, simpler model" },
      ],
    },
    {
      title: "Train / Val / Test",
      color: "emerald",
      rows: [
        { term: "Train", desc: "Fit model parameters" },
        { term: "Validation", desc: "Tune hyperparameters, select models" },
        { term: "Test", desc: "Touch ONCE, at the end, for an honest estimate" },
      ],
    },
    {
      title: "Metrics Beyond Accuracy",
      color: "amber",
      rows: [
        { term: "Precision", desc: "TP / (TP + FP) — cost of false positives" },
        { term: "Recall", desc: "TP / (TP + FN) — cost of false negatives" },
        { term: "F1", desc: "Harmonic mean of precision & recall" },
        { term: "Accuracy warning", desc: "Misleading under class imbalance" },
      ],
    },
    {
      title: "Classical Algorithms",
      color: "rose",
      rows: [
        { term: "Logistic regression", desc: "Fast, interpretable, linear boundary" },
        { term: "Random forest", desc: "Robust baseline, low tuning needed" },
        { term: "Gradient boosting", desc: "XGBoost/LightGBM — best for tabular data" },
        { term: "k-means", desc: "Unsupervised clustering" },
      ],
    },
    {
      title: "Data Leakage",
      color: "cyan",
      rows: [
        {
          term: "Fit-then-transform",
          desc: "Fit scalers/encoders on TRAIN ONLY",
          code: "scaler = StandardScaler().fit(X_train)\nX_test_scaled = scaler.transform(X_test)",
        },
        { term: "Time-series split", desc: "Use TIME-BASED splits, not random, for temporal data" },
      ],
    },
  ],
};

export default machineLearningCheatSheet;
