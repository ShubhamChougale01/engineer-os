import type { CheatSheetData } from "./types";

const machineLearningCheatSheet: CheatSheetData = {
  title: "The Ultimate Machine Learning Cheat Sheet",
  subtitle: "Paradigms · lifecycle · classical algorithms · evaluation · production toolbelt",
  sections: [
    {
      title: "Paradigms & Core Vocabulary",
      color: "violet",
      rows: [
        { term: "Supervised learning", desc: "Learn a mapping from labeled input to output", code: "X = features\ny = known labels\nmodel.fit(X, y)" },
        { term: "Unsupervised learning", desc: "Find structure in unlabeled data", code: "KMeans(n_clusters=3).fit(X)  # no y" },
        { term: "Reinforcement learning", desc: "Learn a policy via reward signals from an environment", code: "state -> action -> reward -> policy update" },
        { term: "Feature", desc: "One measured input variable (a column)", code: "X[['sqft', 'bedrooms']]" },
        { term: "Label / target", desc: "The value you want to predict", code: "y = data['price']" },
        { term: "Classification vs regression", desc: "Predict a category vs a continuous number", code: "spam/not-spam   vs   251340.75" },
        { term: "Loss function", desc: "A number measuring how wrong predictions are", code: "MSE (regression), log-loss (classification)" },
        { term: "Training", desc: "Search for parameters that minimize the loss", code: "predict -> measure loss -> adjust -> repeat" },
      ],
    },
    {
      title: "The ML Lifecycle & Data Splitting",
      color: "blue",
      rows: [
        { term: "Lifecycle", desc: "Collect, clean, engineer features, split, train, evaluate, deploy, monitor", code: "raw data -> features -> model -> production" },
        { term: "train_test_split", desc: "Hold out data never trained on", code: "from sklearn.model_selection import train_test_split\nXtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2)" },
        { term: "Train / Validation / Test", desc: "Fit params / tune hyperparameters / final honest score", code: "Train: fit()\nValidation: tune, select model\nTest: touch ONCE, at the end" },
        { term: "K-fold cross-validation", desc: "Train/validate K times on rotating folds, average the score", code: "cross_val_score(model, X, y, cv=5)" },
        { term: "Stratified split", desc: "Preserve class proportions in each split/fold", code: "train_test_split(X, y, stratify=y)" },
        { term: "Time-based split", desc: "For temporal data — never use a random split", code: "train on data before cutoff_date\ntest on data after cutoff_date" },
        { term: "Data leakage", desc: "Info from outside training data inflating scores", code: "WRONG: fit scaler on full X before split\nRIGHT: fit scaler on X_train only" },
      ],
    },
    {
      title: "Preprocessing: Scaling & Encoding",
      color: "emerald",
      rows: [
        { term: "StandardScaler", desc: "(x - mean) / std -> mean 0, unit variance", code: "scaler = StandardScaler().fit(X_train)\nX_train_s = scaler.transform(X_train)\nX_test_s = scaler.transform(X_test)" },
        { term: "Needs scaling", desc: "Linear/logistic regression, SVM, k-means, k-NN, neural nets", code: "distance/gradient-based algorithms" },
        { term: "No scaling needed", desc: "Tree-based models are scale-invariant", code: "DecisionTree, RandomForest, GradientBoosting" },
        { term: "OneHotEncoder", desc: "Unordered categories -> binary columns", code: "OneHotEncoder(handle_unknown='ignore')" },
        { term: "Ordinal encoding", desc: "Genuinely ordered categories", code: "small=0, medium=1, large=2" },
        { term: "High-cardinality categories", desc: "Avoid one-hot exploding column count", code: "target/frequency encoding for zip codes, IDs" },
        { term: "ColumnTransformer", desc: "Apply different preprocessing per column type", code: "ColumnTransformer([\n  ('num', StandardScaler(), num_cols),\n  ('cat', OneHotEncoder(), cat_cols),\n])" },
        { term: "Pipeline", desc: "Bundle preprocessing + model as one fitted unit", code: "Pipeline([('prep', preprocessor), ('model', clf)])" },
      ],
    },
    {
      title: "Bias-Variance & Regularization",
      color: "amber",
      rows: [
        { term: "Underfitting (high bias)", desc: "Model too simple — poor on BOTH train and validation", code: "Fix: more features, more complexity, less regularization" },
        { term: "Overfitting (high variance)", desc: "Great on train, meaningfully worse on validation", code: "Fix: regularize, more data, simpler model" },
        { term: "Bias-variance decomposition", desc: "Total error = bias squared + variance + irreducible noise", code: "more complexity -> lower bias, higher variance" },
        { term: "L2 / Ridge", desc: "Penalizes sum of squares of coefficients — shrinks smoothly", code: "Ridge(alpha=1.0)" },
        { term: "L1 / Lasso", desc: "Penalizes sum of absolute values — can zero out coefficients", code: "Lasso(alpha=0.1)   # automatic feature selection" },
        { term: "Dropout (neural nets)", desc: "Randomly disable neurons during training", code: "conceptual analogue of L1/L2 for deep learning" },
        { term: "Early stopping", desc: "Halt training when validation loss starts rising", code: "stop when val_loss no longer improves" },
        { term: "Learning curve", desc: "Diagnose bias vs variance visually", code: "learning_curve(model, X, y, cv=5)" },
      ],
    },
    {
      title: "Classical Algorithms",
      color: "rose",
      rows: [
        { term: "Linear regression", desc: "Fast, interpretable baseline for continuous targets", code: "LinearRegression().fit(X, y)" },
        { term: "Logistic regression", desc: "Linear boundary + sigmoid -> probability", code: "LogisticRegression().fit(X, y)" },
        { term: "Decision tree", desc: "Readable if/else rules; high variance alone", code: "DecisionTreeClassifier(max_depth=5)" },
        { term: "Random forest", desc: "Bag many trees — robust, low tuning needed", code: "RandomForestClassifier(n_estimators=200)" },
        { term: "Gradient boosting", desc: "Sequential trees correcting prior errors — best for tabular data", code: "GradientBoostingClassifier(n_estimators=200,\n  learning_rate=0.05, max_depth=3)" },
        { term: "XGBoost / LightGBM", desc: "Production-grade gradient boosting implementations", code: "import xgboost as xgb\nxgb.XGBClassifier().fit(X, y)" },
        { term: "SVM", desc: "Maximum-margin hyperplane; kernel trick for nonlinearity", code: "SVC(kernel='rbf')" },
        { term: "k-means", desc: "Partition into K clusters by nearest-center assignment", code: "KMeans(n_clusters=4).fit(X)" },
        { term: "Algorithm choice", desc: "Tabular + accuracy -> boosting; interpretability -> linear/tree", code: "see the Advanced Concepts decision table" },
      ],
    },
    {
      title: "Evaluation Metrics",
      color: "cyan",
      rows: [
        { term: "Accuracy", desc: "Fraction correct — MISLEADING under class imbalance", code: "accuracy_score(y_test, preds)" },
        { term: "Precision", desc: "Of predicted positives, how many were correct", code: "precision_score(y_test, preds)  # TP/(TP+FP)" },
        { term: "Recall", desc: "Of true positives, how many were caught", code: "recall_score(y_test, preds)  # TP/(TP+FN)" },
        { term: "F1 score", desc: "Harmonic mean of precision and recall", code: "f1_score(y_test, preds)" },
        { term: "ROC-AUC", desc: "Ranking quality across ALL thresholds", code: "roc_auc_score(y_test, probs)" },
        { term: "Confusion matrix", desc: "Full breakdown of correct/incorrect per class", code: "confusion_matrix(y_test, preds)" },
        { term: "RMSE", desc: "Root mean squared error — penalizes large errors more", code: "mean_squared_error(y_test, preds, squared=False)" },
        { term: "MAE", desc: "Mean absolute error — robust to outliers", code: "mean_absolute_error(y_test, preds)" },
        { term: "Class imbalance fix", desc: "Resampling or class weights, plus the right metric", code: "class_weight='balanced'" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "violet",
      rows: [
        { term: "Naive baseline", desc: "Predict mean/majority class — the floor to beat", code: "DummyClassifier(strategy='most_frequent')" },
        { term: "Feature store", desc: "Guarantees identical features in training and serving", code: "prevents training/serving skew" },
        { term: "Model registry", desc: "Versioned artifacts tied to the data/code that produced them", code: "MLflow / Weights and Biases" },
        { term: "Serialize a pipeline", desc: "Ship preprocessing + model as one artifact", code: "import joblib\njoblib.dump(pipeline, 'model_v12.joblib')" },
        { term: "Drift detection", desc: "Compare live feature distributions to training-time ones", code: "from scipy.stats import ks_2samp\nks_2samp(train_vals, live_vals)" },
        { term: "Data drift vs concept drift", desc: "Input distribution shifts vs the input-label relationship shifts", code: "data drift: detect without ground truth\nconcept drift: needs ground truth" },
        { term: "Retraining trigger", desc: "Schedule, drift threshold, or performance floor", code: "never retrain on intuition alone" },
        { term: "Shadow / canary deploy", desc: "Compare a challenger model against the champion safely", code: "log both, serve only the champion, then ramp up" },
      ],
    },
  ],
};

export default machineLearningCheatSheet;
