import type { SkillContent } from "../types";

/**
 * Machine Learning — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const machineLearning: SkillContent = {
  overview: `
Machine Learning (ML) is the branch of computer science where systems improve at a task by learning patterns from data instead of following rules a human programmer wrote by hand. Instead of writing "if income > X and credit score > Y, approve the loan," you show the system thousands of past decisions and it learns the mapping from inputs to outputs itself — including patterns no human explicitly wrote down.

For an AI engineer, Machine Learning is the foundation everything else stands on. Deep Learning is a subfield of ML that uses layered neural networks; Large Language Models are a deep-learning architecture (the Transformer) trained at enormous scale. You cannot reason well about why an LLM hallucinates, why a recommendation system drifts in production, or why a fraud model needs retraining without the classical ML vocabulary: overfitting, bias-variance tradeoff, evaluation metrics, train/test splits. This page builds that vocabulary from zero, then hands you off to the **Deep Learning** skill for the neural-network path and toward **LLM Fundamentals** for the modern AI-engineering path.

Key characteristics: ML is fundamentally statistical — every model is a function approximator fit to a finite sample of data, so every model carries assumptions and every prediction carries uncertainty. ML systems are only as good as the data and the evaluation used to build them; a model can achieve perfect training accuracy and still be useless in production. The field splits into three broad paradigms (supervised, unsupervised, reinforcement learning) and a spectrum of algorithm families from simple linear models to deep neural networks, each with distinct tradeoffs in interpretability, data requirements, and compute cost.
`,

  history: `
Machine Learning's roots trace to statistics and early AI research. **Arthur Samuel** coined the term "machine learning" in 1959 while building a checkers-playing program at IBM that improved through self-play. The field oscillated between optimism and "AI winters" as compute and data caught up slowly with the ideas.

| Year | Milestone |
|------|-----------|
| 1950 | Alan Turing proposes the "Turing Test" — can a machine imitate human intelligence? |
| 1957 | Frank Rosenblatt invents the Perceptron, the first trainable linear classifier |
| 1959 | Arthur Samuel coins "machine learning"; his checkers program beats amateur players |
| 1969 | Minsky and Papert's "Perceptrons" book shows single-layer perceptron limits — first AI winter begins |
| 1986 | Backpropagation popularized (Rumelhart, Hinton, Williams) — multi-layer networks become trainable |
| 1995 | Support Vector Machines (Vapnik) formalize the max-margin classifier |
| 1997 | Random forests and boosting ideas mature; IBM's Deep Blue beats Kasparov at chess (search, not learning) |
| 2001 | Breiman formalizes Random Forests |
| 2006 | "Deep learning" branding revival — Hinton's work on deep belief networks reignites neural nets |
| 2012 | AlexNet wins ImageNet by a huge margin — the deep-learning era begins in earnest |
| 2014 | XGBoost released — gradient boosting becomes the dominant tool for tabular data competitions |
| 2016 | AlphaGo (deep RL) beats a world champion Go player |
| 2017 | "Attention Is All You Need" — the Transformer architecture, the basis of modern LLMs |
| 2020s | Foundation models and LLMs dominate headlines, but classical ML still runs the majority of production tabular-data systems (fraud, credit, ranking, forecasting) |

The pattern worth internalizing: classical ML never died. Neural networks and LLMs get the attention, but gradient boosting, logistic regression, and clustering remain the default first choice for structured/tabular business data because they are cheaper, faster, and more interpretable — see Comparisons.
`,

  "why-it-exists": `
Machine Learning exists because for a huge class of real-world problems, nobody can write the rule.

Consider spam detection: what exact rule separates spam from legitimate email? Word lists fail (attackers adapt), regexes explode in complexity, and human intuition about "what looks spammy" cannot be fully articulated as an algorithm. Consider credit scoring, image recognition, or recommendation: the mapping from input to correct output is either too complex, too high-dimensional, or too dependent on subtle statistical regularities for a human to encode by hand.

The gap ML fills: instead of a programmer encoding *the rule*, a programmer encodes *the process for finding the rule* — pick a model family, define a loss function that measures wrong-ness, and let an optimization algorithm search for parameters that minimize that loss over historical examples. The world before ML relied on expert systems (hand-built decision rules encoded by domain experts) which were brittle, expensive to maintain, and impossible to scale to messy real-world data. ML replaced "encode the knowledge" with "encode the learning process," and let data do the rest.
`,

  "problem-it-solves": `
Machine Learning removes the need to manually encode pattern-recognition logic for problems that are statistical in nature: what does a fraudulent transaction look like across millions of edge cases, which customers will churn, what price will clear the market, which pixels form a cat.

Concretely, ML solves:

- **The rule-explosion problem**: rule-based systems grow unmanageable as edge cases multiply; a trained model absorbs edge cases as data, not as new "if" branches.
- **The manual feature-crafting bottleneck for structured data**: given the right features, a small dataset and a simple model can outperform a hand-tuned heuristic in hours instead of months.
- **Adaptation**: a model can be retrained as the world changes (new fraud patterns, shifting customer behavior) without a rewrite — see Monitoring and drift detection.
- **Prediction under uncertainty**: ML naturally produces probabilities and confidence estimates, not just binary answers.

What ML deliberately does **not** solve:

- **Causal reasoning**: a model finding that ice-cream sales correlate with drowning deaths will happily "predict" one from the other; it takes deliberate causal-inference techniques (A/B tests, causal graphs) to distinguish correlation from causation — ML alone will not tell you.
- **Reasoning outside the training distribution**: a model has no innate understanding, only learned statistical regularities; it fails silently (confidently wrong) on inputs unlike anything it saw in training.
- **Guaranteeing fairness or correctness**: a model trained on biased historical data reproduces and often amplifies that bias unless engineers explicitly audit for it — see Security and Best Practices.
- **Explaining itself by default**: many high-performing models (gradient boosting, deep nets) are not naturally interpretable; explainability requires deliberate extra tooling (SHAP, LIME) layered on top.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between supervised, unsupervised, and reinforcement learning, with a real example of each.
2. Walk through the full ML lifecycle end to end: data collection, cleaning, feature engineering, splitting, model selection, training, evaluation, deployment, monitoring.
3. Explain the intuition, strengths, and weaknesses of linear/logistic regression, decision trees, random forests, gradient boosting, k-means, and SVMs — and know which to reach for first.
4. Diagnose overfitting vs underfitting from a learning curve and fix each with the correct regularization technique (L1, L2, dropout, early stopping, more data).
5. Choose the correct evaluation metric for a task (accuracy, precision, recall, F1, ROC-AUC for classification; RMSE, MAE for regression) and explain when accuracy is a misleading metric.
6. Apply k-fold cross-validation correctly and explain why a single train/test split can mislead.
7. Preprocess data correctly: scale numeric features, encode categorical features, and avoid data leakage while doing so.
8. Build, evaluate, and interpret a complete scikit-learn pipeline from raw data to a scored model.
9. Explain why deep learning superseded classical ML for perception tasks (images, audio, text) while classical ML remains dominant for structured/tabular data.
10. Describe the production concerns unique to ML systems: model versioning, drift detection, and retraining triggers, and connect them to the **MLOps** skill.
`,

  prerequisites: `
- **Required**: comfort with basic programming (loops, functions, data structures) — see the **Python** skill, since essentially all ML tooling (scikit-learn, PyTorch, pandas) is Python-based. Basic algebra (vectors, functions, averages) is assumed; you do not need calculus to get through the beginner/intermediate sections.
- **Helpful**: basic statistics (mean, variance, probability, distributions) makes the evaluation-metrics and bias-variance sections click faster. Familiarity with pandas/NumPy for data manipulation speeds up the worked example.
- **Not required yet**: calculus and linear algebra depth, GPU programming, or neural-network internals — those belong to the **Deep Learning** and **Neural Networks** skills, which this page hands off to.

Dependency chain on this platform: **Python** to this page (**Machine Learning**) to **Neural Networks** to **Deep Learning** to **CNNs** / **RNNs** to **Transformers** / **Attention** to **Embeddings** / **Vector Search** to **LLM Fundamentals**. This page is the on-ramp for the entire "Machine Learning & Deep Learning" category.
`,

  "beginner-concepts": `
### The three paradigms

**Supervised learning**: you have labeled examples — inputs paired with known correct outputs — and the model learns to predict the output for new, unseen inputs.

~~~python
# Supervised: predict house price (output) from square footage (input)
X = [[650], [800], [1200], [1500]]   # features
y = [150000, 180000, 240000, 300000]  # labels (known prices)
# The model learns: price is approximately a function of square_footage
~~~

**Unsupervised learning**: you only have inputs, no labels — the model finds structure (groups, patterns, compressed representations) on its own.

~~~python
# Unsupervised: group customers by purchasing behavior — no "correct" group given
X = [[5, 200], [1, 20], [6, 250], [2, 30]]  # [visits_per_month, avg_spend]
# The model discovers clusters: frequent big spenders vs occasional small spenders
~~~

**Reinforcement learning (RL)**: an agent takes actions in an environment and learns from rewards/penalties over time, rather than from fixed labeled examples.

~~~text
Agent (e.g. a game-playing bot) observes state -> takes action -> environment
returns a reward signal (+1 win, -1 loss) -> agent updates its policy to
prefer actions that lead to higher long-term reward.
~~~

Rule of thumb: if you have historical "correct answers," it is supervised. If you are looking for hidden structure with no correct answers, it is unsupervised. If you are optimizing sequential decisions through trial and reward, it is reinforcement learning.

### Features, labels, and a training example

A **feature** is one measured input variable (square footage, age, pixel value). A **label** (or target) is the thing you want to predict. A **training example** is one row: a full set of feature values plus (for supervised learning) its label.

~~~python
import pandas as pd

data = pd.DataFrame({
    "sqft": [650, 800, 1200, 1500],
    "bedrooms": [1, 2, 3, 3],
    "price": [150000, 180000, 240000, 300000],   # the label
})
X = data[["sqft", "bedrooms"]]   # features (inputs)
y = data["price"]                 # label (target output)
~~~

### What "training" actually means

Training means searching for the model parameters that make the model's predictions match the known labels as closely as possible, as measured by a **loss function** (a number representing how wrong the predictions are). The training algorithm nudges parameters to reduce that loss, repeatedly, until it stops improving.

~~~python
# Conceptual loop every ML training algorithm follows, in plain terms:
# 1. Make a prediction with current parameters
# 2. Measure how wrong it is (the loss)
# 3. Adjust parameters slightly to reduce that loss
# 4. Repeat until loss stops decreasing meaningfully
~~~

### Classification vs regression

**Classification** predicts a category (spam / not spam, cat / dog / bird). **Regression** predicts a continuous number (house price, temperature). The task type determines which algorithms and metrics apply — this distinction recurs throughout the entire page.

~~~python
# Classification: output is one of a fixed set of classes
is_spam = model.predict(email_features)     # "spam" or "not spam"

# Regression: output is a continuous number
predicted_price = model.predict(house_features)  # e.g. 251340.75
~~~

Common beginner trap: judging every model by "accuracy" regardless of task — covered in depth in Evaluation Metrics below and revisited in Anti-Patterns.
`,

  "intermediate-concepts": `
### The train/validation/test split

Never train and evaluate on the same data — a model can memorize training data and look perfect while being useless on new data. The standard split:

~~~python
from sklearn.model_selection import train_test_split

# 60% train, 20% validation (tune hyperparameters), 20% test (final, untouched score)
X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
~~~

The **test set** is touched exactly once, at the very end. If you tune anything based on test-set performance, it stops being a valid measure of real-world performance — this is the single most common way ML projects deceive themselves.

### Cross-validation

A single split can get lucky or unlucky. **K-fold cross-validation** splits the training data into K folds, trains K times (holding out a different fold each time), and averages the score — a far more reliable estimate, especially with limited data.

~~~python
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

scores = cross_val_score(RandomForestClassifier(random_state=42), X_train, y_train, cv=5)
print(f"CV accuracy: {scores.mean():.3f} +/- {scores.std():.3f}")
# The +/- matters as much as the mean: high variance across folds means an unstable model
~~~

### Feature scaling and encoding

Many algorithms (linear/logistic regression, SVMs, k-means, k-NN, neural networks) are sensitive to feature scale — a feature ranging 0-1,000,000 dominates one ranging 0-1 even if it is less predictive. Tree-based models (decision trees, random forests, gradient boosting) are scale-invariant and do not need this step.

~~~python
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# StandardScaler: (x - mean) / std -> mean 0, unit variance
# Fit ONLY on training data, then transform train/val/test with the same fitted scaler
# to avoid data leakage (test-set statistics leaking into training).
preprocessor = ColumnTransformer([
    ("num", StandardScaler(), ["sqft", "age_years"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["neighborhood"]),
])
~~~

Categorical features need **encoding**: one-hot encoding for unordered categories (neighborhood, color), ordinal encoding for genuinely ordered categories (small/medium/large), and target/frequency encoding for high-cardinality categories (zip codes) where one-hot would explode column count.

### The bias-variance tradeoff

Every model's error decomposes into three parts: **bias** (error from overly simplistic assumptions — the model cannot capture the true pattern even with infinite data), **variance** (error from being overly sensitive to the specific training sample — different training sets produce wildly different models), and irreducible noise.

~~~text
High bias, low variance  -> underfitting: model too simple, misses real patterns
                            (e.g. a straight line fit to a curved relationship)
Low bias, high variance  -> overfitting: model too complex, memorizes noise
                            (e.g. a deep tree that perfectly fits every training point)
Sweet spot               -> validation error is minimized; this is the tuning target
~~~

This tradeoff is THE central tension of model selection: more complex models (deeper trees, more polynomial terms, more neural network layers) reduce bias but increase variance, and vice versa. Regularization (next section) is the primary tool for controlling this tradeoff directly.

### Overfitting, underfitting, and regularization

**Overfitting**: training accuracy is high, validation/test accuracy is much lower — the model memorized training-set quirks instead of learning generalizable patterns. **Underfitting**: both training and validation accuracy are low — the model is too simple to capture the pattern at all.

~~~python
from sklearn.linear_model import Ridge, Lasso

# L2 regularization (Ridge): penalizes the SUM OF SQUARES of coefficients,
# shrinking them toward zero smoothly — reduces variance, keeps all features.
ridge = Ridge(alpha=1.0)

# L1 regularization (Lasso): penalizes the SUM OF ABSOLUTE VALUES of coefficients,
# which can force some coefficients to EXACTLY zero — performs feature selection.
lasso = Lasso(alpha=0.1)
~~~

**Dropout** (used in neural networks, conceptually relevant here): during training, randomly "turn off" a fraction of neurons on each pass, forcing the network to not over-rely on any single pathway — a regularization technique analogous in spirit to L1/L2 penalties but specific to neural nets (full depth in the **Deep Learning** skill).

Other regularization tools: early stopping (halt training when validation loss starts rising even as training loss keeps falling), limiting tree depth, requiring a minimum number of samples per leaf, and simply gathering more training data (the most reliable variance-reducer of all).
`,

  "advanced-concepts": `
### Classical algorithms — intuition, strengths, and weaknesses

**Linear regression**: fits a straight line (or hyperplane) minimizing squared error between predictions and true continuous values. Good for: interpretable baselines, when the relationship is roughly linear, when you need coefficients that explain "how much does Y change per unit of X." Weak for: nonlinear relationships, unless you engineer polynomial/interaction features.

**Logistic regression**: linear regression's classification cousin — fits a linear boundary, then squashes the output through a sigmoid function into a 0-1 probability. Good for: fast, interpretable, strong baseline for binary classification, especially with many features and modest data; coefficients are directly interpretable as log-odds. Weak for: complex nonlinear decision boundaries.

**Decision trees**: recursively split the data on the feature/threshold that best separates classes (or reduces variance for regression), forming a tree of if/else rules. Good for: full interpretability (you can literally read the rules), handling mixed numeric/categorical data and nonlinearity with no scaling needed. Weak for: high variance — small data changes can produce a very different tree; prone to overfitting if grown deep.

**Random forests**: train many decision trees on random subsets of data and features (bagging), then average their predictions. Good for: strong accuracy out of the box with minimal tuning, robust to overfitting compared to a single tree, handles nonlinearity and feature interactions well, gives feature-importance scores. Weak for: less interpretable than a single tree, larger model size, can still struggle on very high-dimensional sparse data (text) compared to linear models or neural nets.

**Gradient boosting** (XGBoost, LightGBM, CatBoost): builds trees sequentially, where each new tree is trained to correct the errors (residuals) of the ensemble so far. Good for: usually the strongest performer on structured/tabular data, wins the majority of Kaggle competitions on tabular problems, handles missing values and mixed types natively in modern implementations. Weak for: more hyperparameters to tune than random forests, easier to overfit if not regularized (learning rate, tree depth, early stopping), sequential training is less parallelizable than bagging.

**K-means clustering**: an unsupervised algorithm that partitions data into K groups by iteratively assigning points to the nearest of K cluster centers, then recomputing centers as the mean of assigned points. Good for: fast, simple exploratory grouping, customer segmentation, when clusters are roughly spherical and similarly sized. Weak for: you must choose K in advance, sensitive to feature scaling and outliers, struggles with non-spherical or unevenly sized clusters.

**Support Vector Machines (SVMs)**: find the hyperplane that maximizes the margin (distance) between classes; the kernel trick lets SVMs find nonlinear boundaries by implicitly mapping data into higher-dimensional space. Good for: high-dimensional data with a clear margin (text classification historically), effective with relatively small-to-medium datasets. Weak for: does not scale well to very large datasets (training is roughly quadratic to cubic in sample count), less naturally probabilistic, mostly superseded by gradient boosting and neural networks for large-scale production use today.

### Decision table: which algorithm first?

| Situation | First choice | Why |
|-----------|--------------|-----|
| Tabular business data, need accuracy | Gradient boosting (XGBoost/LightGBM) | Best raw performance on structured data |
| Tabular data, need interpretability | Logistic/linear regression or a single decision tree | Coefficients/rules are directly readable |
| Small dataset, need a fast baseline | Logistic/linear regression | Low variance, hard to overfit, trains instantly |
| Unlabeled data, want groups | K-means (or hierarchical clustering) | Simplest unsupervised starting point |
| Images, audio, raw text, huge data | Deep learning (see Deep Learning skill) | Learns features automatically; classical ML needs hand-crafted features here |
| Sequential decision-making with rewards | Reinforcement learning | Classical supervised/unsupervised does not model reward-driven sequential actions |

### Evaluation metrics, precisely

**Classification metrics**: accuracy is the fraction of correct predictions — but it is dangerously misleading under **class imbalance** (a model predicting "not fraud" for every single transaction can be 99% accurate if only 1% of transactions are fraudulent, while catching zero actual fraud). Precision (of everything flagged positive, how much was truly positive) and recall (of everything truly positive, how much was caught) trade off against each other; F1 is their harmonic mean. ROC-AUC measures ranking quality across all classification thresholds, independent of the specific threshold chosen.

~~~text
Precision = TP / (TP + FP)   "when I say yes, how often am I right?"
Recall    = TP / (TP + FN)   "of all real positives, how many did I catch?"
F1        = 2 * (Precision * Recall) / (Precision + Recall)
ROC-AUC   = probability a random positive is ranked above a random negative
~~~

**Regression metrics**: RMSE (root mean squared error) penalizes large errors more heavily (squares them before averaging) — sensitive to outliers. MAE (mean absolute error) treats all errors linearly — more robust to outliers, easier to interpret directly in the label's units.

### Ensembling beyond a single model family

Beyond random forests and gradient boosting (which ensemble trees with themselves), senior practitioners **stack** heterogeneous models — combining a gradient-boosted tree, a linear model, and a neural network through a meta-learner — when squeezing out the last percentage points of accuracy matters (common in competitions, less common in production due to the added complexity and latency cost).
`,

  "internal-working": `
Under the hood, nearly every supervised ML algorithm follows the same optimization loop, differing only in the model's functional form and the specific search strategy.

~~~mermaid
flowchart LR
    A["Initialize parameters\n(random or zero)"] --> B["Forward pass:\ncompute predictions on a batch"]
    B --> C["Loss function:\nmeasure prediction error"]
    C --> D["Compute gradient:\nhow does loss change per parameter?"]
    D --> E["Update parameters:\nstep opposite the gradient"]
    E --> F{"Converged or\nmax iterations?"}
    F -- No --> B
    F -- Yes --> G["Final trained model"]
~~~

1. **Initialize**: model parameters (coefficients in linear regression, split thresholds in a tree, weights in a neural net) start at some default or random value.
2. **Forward pass**: the model computes a prediction for each training example using current parameters.
3. **Loss computation**: a loss function (mean squared error for regression, log-loss/cross-entropy for classification) turns "how wrong were the predictions" into a single number to minimize.
4. **Gradient computation**: for differentiable models (linear/logistic regression, neural networks), calculus computes exactly how much the loss would change if each parameter moved slightly — this is the **gradient**. Tree-based models instead search discretely over candidate splits, evaluating which split most reduces impurity (Gini/entropy for classification, variance for regression) or the loss gradient (gradient boosting specifically fits new trees to the negative gradient of the loss — hence the name).
5. **Parameter update**: gradient descent moves parameters a small step (the **learning rate**) in the direction that reduces loss. Trees instead greedily commit to the best split found and recurse.
6. **Iterate**: repeat until the loss stops improving meaningfully (convergence) or a maximum number of iterations/trees is reached.

For k-means (unsupervised), the loop is different but structurally analogous: assign each point to its nearest of K centers, recompute centers as the mean of their assigned points, repeat until assignments stop changing — this is an instance of the broader Expectation-Maximization pattern used across unsupervised learning.

The deep insight: "training a model" is always "searching a hypothesis space for the member that minimizes a loss function measured against your training data," whether that search is calculus-driven gradient descent or the greedy discrete search of a decision tree.
`,

  architecture: `
Thinking about ML at the system level means separating the **training-time architecture** from the **serving-time architecture** — they have very different requirements and often live in entirely different infrastructure.

### Training-time architecture

~~~mermaid
flowchart TB
    subgraph Sources["Data sources"]
        DB[("Production DB")]
        Logs[("Event logs")]
        Ext[("Third-party data")]
    end
    Sources --> Ingest["Ingestion / ETL pipeline"]
    Ingest --> Lake[("Feature store / data warehouse")]
    Lake --> FE["Feature engineering"]
    FE --> Split["Train / validation / test split"]
    Split --> Train["Training job\n(scikit-learn / XGBoost / PyTorch)"]
    Train --> Eval["Offline evaluation"]
    Eval --> Registry["Model registry\n(versioned artifacts)"]
~~~

### Serving-time (application) architecture

~~~text
ml-service/
+-- pyproject.toml
+-- src/mlservice/
|   +-- api/                # REST/gRPC endpoint receiving prediction requests
|   +-- features/            # feature-computation logic — MUST match training exactly
|   +-- models/               # loaded model artifact wrapper (predict/predict_proba)
|   +-- monitoring/            # logging of predictions, inputs, drift metrics
|   +-- config/                 # model version, thresholds, feature list
+-- tests/                        # unit tests + a "golden set" regression test
~~~

The single most important architectural rule in production ML: **training/serving skew must be zero.** The feature engineering code that ran during training must produce byte-for-byte identical features at serving time — a mismatch (different rounding, different missing-value handling, a feature computed from data unavailable in real time) is the most common cause of a model that scored well offline and performs badly in production. Feature stores exist specifically to enforce this consistency by computing features once and serving them identically to both training and inference.
`,

  "data-flow": `
Trace one prediction request through a deployed ML system, from raw input to a served decision:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as Prediction API
    participant FE as Feature pipeline
    participant Model as Loaded model
    participant Mon as Monitoring store

    Client->>API: POST /predict (raw input)
    API->>FE: compute features (same logic as training)
    FE->>FE: validate schema, handle missing values
    FE->>Model: feature vector
    Model->>Model: forward pass -> prediction + confidence
    Model-->>API: prediction
    API->>Mon: log input, prediction, model version, timestamp
    API-->>Client: prediction + confidence
    Note over Mon: logged data feeds drift detection and retraining decisions later
~~~

The critical detail most beginners miss: the feature pipeline (FE above) is not a training-only artifact — it must be packaged and deployed alongside the model itself, versioned together, because a model is only meaningful in combination with the exact feature transformation it was trained against. If a scaler was fit on training data with a certain mean/standard deviation, that exact fitted scaler (not a freshly-fit one) must transform serving-time inputs.

At training time, the flow is inverse and batch-oriented: historical data flows from a warehouse through the same feature pipeline, into the training algorithm, producing a versioned model artifact plus an evaluation report before it is ever allowed near production traffic — see Deployment and Production Checklist.
`,

  "production-usage": `
### The standard scikit-learn / pandas project shape

Most production classical-ML work happens inside a **pipeline** object that bundles preprocessing and modeling into one reproducible unit, preventing the classic bug of applying preprocessing inconsistently between training and inference.

~~~python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), ["age", "income"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["region"]),
])

pipeline = Pipeline([
    ("preprocess", preprocessor),
    ("model", GradientBoostingClassifier(n_estimators=200, learning_rate=0.05, max_depth=3)),
])

pipeline.fit(X_train, y_train)          # fits preprocessing AND model together
pipeline.predict(X_test)                # applies the SAME fitted preprocessing
~~~

Because the pipeline object is a single fitted artifact, it can be serialized (joblib/pickle-alternatives, or better, ONNX for cross-language serving) as one unit and deployed without training/serving skew.

### Experiment tracking and reproducibility

Real teams track every training run: hyperparameters, data version, code version, and resulting metrics, using tools like MLflow or Weights and Biases. This is non-negotiable once more than one person touches a model — "which run produced the model in production, and can we reproduce it exactly" must always be answerable.

### Config over hardcoding

Model hyperparameters, feature lists, and thresholds belong in versioned config files, not scattered constants in code — this is what allows a retraining pipeline to run unattended and what lets you audit exactly what configuration produced a given model version.
`,

  "industry-examples": `
- **Capital One / most major banks**: gradient-boosted trees and logistic regression underpin credit scoring and fraud detection — interpretability requirements (regulatory explainability) keep classical ML dominant here over black-box deep nets.
- **Netflix**: classical collaborative filtering and gradient boosting have historically powered large parts of the recommendation stack, now blended with deep learning, but tabular classical ML remains core to ranking and A/B experiment analysis.
- **Airbnb**: gradient boosting (via their internal ML platform, Bighead/Zipline) drives search ranking and pricing suggestions, combined with feature stores to guarantee training/serving consistency.
- **Stripe**: fraud detection ("Radar") is a widely cited production example of gradient-boosted trees operating at extremely high transaction volume with strict latency requirements.
- **Uber**: Michelangelo, Uber's internal ML platform, was one of the first widely publicized end-to-end ML platforms (feature store, training, serving, monitoring) built specifically because classical ML models needed the exact lifecycle discipline described on this page, at scale, across hundreds of models.
- **Any e-commerce company (Amazon, Etsy, etc.)**: classical ML (logistic regression, gradient boosting, k-means for segmentation) still runs demand forecasting, churn prediction, and customer segmentation even as deep learning-based recommendation and search have grown.

Pattern to notice: wherever data is tabular, well-structured, and interpretability or latency matters, classical ML remains the production default — deep learning takes over specifically where the input is unstructured (images, audio, raw text) or scale of data is enormous.
`,

  "best-practices": `
1. **Always establish a naive baseline first** (predict the mean/majority class) — a model that cannot beat that baseline is not yet worth deploying.
2. **Split data before touching it**: fit scalers, encoders, and imputers only on the training set to avoid data leakage into validation/test scores.
3. **Use cross-validation, not a single split, when data is limited** — a single lucky/unlucky split can make a mediocre model look great or a good model look bad.
4. **Match the metric to the business problem** — optimizing accuracy on an imbalanced dataset optimizes for the wrong thing; pick precision/recall/F1/ROC-AUC deliberately (see Common Errors).
5. **Start simple, add complexity only when justified by validation performance** — a logistic regression that is 2% worse than a neural network but ten times cheaper and fully interpretable often wins in production.
6. **Version data, code, and model artifacts together** — "which data produced this model" must always be answerable, especially for compliance-sensitive domains.
7. **Build the feature pipeline as a single reusable, testable unit** shared between training and serving — never hand-reimplement preprocessing in two places.
8. **Monitor for drift after deployment, not just accuracy at launch** — the world changes; a model's assumptions decay over time (see Monitoring).
9. **Prefer interpretable models when stakeholders need to trust or challenge a decision** (credit, hiring, healthcare) — regulatory and ethical reasons, not just technical ones.
10. **Tune hyperparameters on the validation set, never the test set** — the test set exists purely to estimate real-world performance once, at the end.
11. **Treat class imbalance explicitly**: resampling, class weights, or a metric that accounts for it — never ignore it and report accuracy.
12. **Document known model limitations and out-of-distribution behavior** for anyone downstream who consumes the model's predictions.
`,

  "anti-patterns": `
### Data leakage — the classic

~~~python
from sklearn.preprocessing import StandardScaler

# WRONG: fit the scaler on the entire dataset BEFORE splitting
scaler = StandardScaler().fit(X)               # sees test-set statistics!
X_scaled = scaler.transform(X)
X_train, X_test = train_test_split(X_scaled)    # test set "leaked" into training

# RIGHT: split first, fit scaler on train only, transform both with THAT scaler
X_train, X_test, y_train, y_test = train_test_split(X, y)
scaler = StandardScaler().fit(X_train)          # only sees training data
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)        # same fitted scaler, no leakage
~~~

Leakage inflates offline metrics and then the model underperforms in production — a subtle bug that passes review unless someone specifically checks for it.

### Other production-grade anti-patterns

- **Reporting accuracy on an imbalanced dataset** without checking class balance first — a 99% "accurate" fraud model can be catching zero fraud; always check the confusion matrix.
- **Tuning hyperparameters against the test set** repeatedly until it looks good — this silently turns the test set into a second validation set and invalidates your final performance estimate.
- **Deploying a model with no monitoring** — offline metrics at launch time say nothing about performance six months later once the data distribution shifts.
- **Different preprocessing code in training vs serving** ("we'll just reimplement the feature logic in the API") — the single most common cause of "works in the notebook, fails in production."
- **Throwing a neural network at a small tabular dataset** because it is fashionable — gradient boosting almost always wins on small-to-medium structured data with far less tuning effort.
- **Ignoring a strong baseline** — jumping straight to a complex ensemble without first checking whether a simple linear model already gets you 90% of the way there.
- **Treating the model as a black box with no error analysis** — not looking at which specific examples the model gets wrong, and why, before shipping.
- **One-hot encoding a very high-cardinality categorical feature** (e.g. zip code with 40,000 values) and exploding the feature space instead of using target/frequency encoding or embeddings.
`,

  performance: `
### Measure first

~~~python
import time
from sklearn.model_selection import cross_val_score

start = time.perf_counter()
scores = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")
print(f"CV took {time.perf_counter() - start:.2f}s, mean AUC {scores.mean():.3f}")
# Also profile training-time separately from inference-time latency —
# they have very different production implications.
~~~

### The performance hierarchy (apply in order)

1. **Better features before a better model** — a well-engineered feature (a ratio, a time-since-last-event, a domain-specific aggregate) often improves accuracy more than swapping algorithms.
2. **Better data quality** — fixing mislabeled examples, duplicate rows, or inconsistent units typically beats hyperparameter tuning.
3. **Right-size the model complexity** — a gradient-boosted model with 2,000 shallow trees is often both more accurate AND faster to serve than a single very deep tree; tune n_estimators/max_depth/learning_rate together.
4. **Hyperparameter search** — grid search for small spaces, randomized search or Bayesian optimization (Optuna) for larger ones; always search on cross-validated score, never the test set.
5. **Vectorize preprocessing** — pandas/NumPy vectorized operations instead of Python loops over rows; this is frequently the actual bottleneck in a "slow model," not the model itself.
6. **Reduce inference-time feature computation cost** — precompute and cache expensive features (e.g. a 30-day rolling aggregate) rather than recomputing per request.
7. **Model compression for serving** — for gradient boosting, reduce tree count post-training if latency-bound; export to a lean inference format (e.g. treelite, ONNX) instead of shipping the full training library.

### Facts worth knowing

- Tree-based ensembles' training time scales roughly with number of trees times tree depth times dataset size — reducing any one directly reduces training cost.
- Cross-validation multiplies training cost by K (typically 5 or 10) — for expensive models, use a smaller K or a single held-out validation set during early iteration, saving full CV for final candidates.
- Inference latency for gradient boosting and linear models is typically sub-millisecond per example; this is one reason classical ML remains preferred for latency-critical serving paths versus larger neural networks.
`,

  scalability: `
ML systems scale along two largely independent axes: **training-data/compute scale** and **serving-request scale**.

### Training-time scaling

~~~mermaid
flowchart LR
    Small["Small data\n(fits in memory)"] -->|"pandas + scikit-learn"| Fine["Single machine training"]
    Medium["Medium data\n(doesn't fit in memory)"] -->|"chunked processing, Dask, or sampling"| Fine
    Large["Large data\n(distributed)"] -->|"Spark MLlib, distributed XGBoost"| Cluster["Multi-node training cluster"]
~~~

Most classical ML training fits comfortably on a single machine even at millions of rows — this is a major practical advantage over deep learning, which frequently requires distributed, GPU-accelerated training even for moderate dataset sizes.

### Serving-time scaling

- Classical models (linear, tree ensembles) are cheap enough to serve on CPU with horizontal scaling — replicate the stateless prediction service behind a load balancer, exactly like any other stateless API (see the Load Balancers and Kubernetes skills).
- Batch scoring (scoring millions of records overnight) scales via distributed compute (Spark) rather than a request-response API.
- Feature computation, not the model itself, is usually the serving bottleneck at scale — precomputed feature stores with fast key lookups (Redis-backed) solve this.

| Bottleneck | Answer |
|------------|--------|
| Training data too large for memory | Sampling, chunked/out-of-core processing, or distributed frameworks (Spark MLlib, Dask-ML) |
| Cross-validation too slow on big models | Reduce K, use a single validation split during iteration, parallelize folds across cores |
| Serving latency too high | Simpler/smaller model, precomputed features, model export to a lean runtime (ONNX/treelite) |
| Too many models to manage (per-region, per-segment) | A model registry plus automated retraining pipeline, not manual retraining |
`,

  security: `
### ML-specific attack surface

1. **Training data poisoning**: an attacker who can influence training data (e.g. user-submitted reviews used to retrain a model) can bias the model's future predictions — validate and monitor data sources feeding automated retraining pipelines.
2. **Model inversion / membership inference**: an attacker with query access to a model can sometimes infer whether a specific individual's record was in the training set, or reconstruct sensitive attributes — a real concern for models trained on personal data (health, finance).
3. **Adversarial inputs**: carefully crafted inputs designed to fool a model (more prominent in deep learning/vision, but relevant to any deployed model) — rate-limit and monitor for suspicious input patterns.
4. **Pickle/serialization risk**: unpickling an untrusted scikit-learn model file can execute arbitrary code, exactly like any Python pickle — only load model artifacts from trusted, versioned sources; prefer safer serialization (ONNX, joblib from a controlled registry) over accepting arbitrary pickle files.
5. **Data privacy and compliance**: models trained on personal data may need to comply with regulations (GDPR "right to explanation," fair lending laws) — this is a core reason interpretable models are preferred in regulated industries.

### Practical defenses

- Validate and sanitize all inputs to a feature pipeline exactly as you would any production API input (see the OWASP Top 10 skill for the general discipline).
- Restrict who can trigger retraining pipelines and audit data sources feeding them.
- Log predictions and inputs for auditability, but scrub/encrypt personally identifiable information in those logs.
- Access-control the model registry — a swapped model artifact in production is a supply-chain risk exactly like a swapped software dependency.

See the dedicated **Security Fundamentals**, **OWASP Top 10**, and **MLOps** skills for depth on production hardening.
`,

  testing: `
ML testing spans two categories that beginners conflate: **software tests** (does the code run correctly) and **model-quality tests** (does the model perform well and stay reliable).

~~~python
# tests/test_pipeline.py — software-style unit test for the feature pipeline
import pandas as pd
from mlservice.features import compute_features

def test_missing_income_is_imputed():
    row = pd.DataFrame([{"age": 30, "income": None, "region": "west"}])
    features = compute_features(row)
    assert not features["income"].isna().any()

def test_unknown_region_does_not_crash():
    row = pd.DataFrame([{"age": 30, "income": 50000, "region": "unseen_region"}])
    features = compute_features(row)          # must not raise
    assert features.shape[0] == 1
~~~

~~~python
# tests/test_model_quality.py — model-quality regression test ("golden set")
def test_model_beats_baseline_on_holdout(trained_model, holdout_X, holdout_y):
    from sklearn.metrics import roc_auc_score
    preds = trained_model.predict_proba(holdout_X)[:, 1]
    auc = roc_auc_score(holdout_y, preds)
    assert auc > 0.75, "Model must beat the agreed minimum AUC bar before shipping"
~~~

### The senior testing doctrine

- Test the feature pipeline as rigorously as any other production code: missing values, unseen categories, out-of-range numbers, empty inputs.
- Keep a fixed **golden evaluation set** that every new model version must be scored against before promotion — catches silent regressions between versions.
- Test training/serving consistency directly: run one example through the training pipeline and the serving pipeline and assert identical output features.
- Statistical tests (comparing a new model's metric distribution to the old one, not just a point estimate) matter more as the stakes rise — a single percentage point difference on a small holdout set may be noise.
`,

  debugging: `
### The toolbox, in escalation order

1. **Look at the data first** — print value counts, check for nulls, duplicated rows, and label distribution before touching the model. Most "the model is bad" bugs are data bugs.
2. **Check the learning curve** — plot training vs validation score as training-set size (or training iterations) increases; diverging curves diagnose overfitting, both-low curves diagnose underfitting.

~~~python
from sklearn.model_selection import learning_curve
train_sizes, train_scores, val_scores = learning_curve(model, X, y, cv=5)
# Large gap between train_scores and val_scores -> overfitting
# Both scores low and flat -> underfitting
~~~

3. **Inspect the confusion matrix**, not just a single accuracy number, for classification problems — reveals exactly which classes are being confused.

~~~python
from sklearn.metrics import confusion_matrix, classification_report
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
~~~

4. **Error analysis on individual mispredictions** — manually inspect the worst-scoring examples; a pattern in the errors (a specific segment, a specific feature range) points directly at the fix.
5. **Feature importance / SHAP values** — when a model behaves unexpectedly, check which features are driving predictions; a surprising top feature often reveals a data leakage bug (e.g. a feature that indirectly encodes the label).
6. **Compare training vs serving features directly** — the number one production-only bug is a feature pipeline mismatch invisible in offline testing.

### Debugging drift-related issues

"The model used to work, now it doesn't" almost always means the input data distribution shifted — compare current feature distributions against the training-time distribution (see Monitoring) before assuming a code bug.
`,

  monitoring: `
Production ML visibility rests on three layers beyond standard software monitoring (see the Observability category for the general discipline).

### Prediction and input logging

~~~python
import structlog

log = structlog.get_logger()

def predict_and_log(features, model, model_version):
    prediction = model.predict_proba(features)[:, 1][0]
    log.info("prediction_served", model_version=model_version,
             prediction=float(prediction), feature_snapshot=features.to_dict())
    return prediction
~~~

### Data and prediction drift detection

~~~python
from scipy.stats import ks_2samp

# Compare a live feature's distribution against its training-time distribution.
# A significant Kolmogorov-Smirnov test result signals the input population has shifted.
statistic, p_value = ks_2samp(training_feature_values, live_feature_values)
if p_value < 0.01:
    log.warning("feature_drift_detected", feature="income", p_value=p_value)
~~~

Two distinct kinds of drift matter: **data drift** (the distribution of inputs changes — new customer segment, seasonal shift) and **concept drift** (the relationship between inputs and the true label changes — fraud patterns evolve, customer preferences shift). Both degrade model performance even though the model code never changed.

### What to measure

- **Model performance metrics** where ground truth eventually arrives (accuracy/AUC on a delayed feedback loop, e.g. did the flagged transaction turn out to be fraud).
- **Prediction distribution** over time — a sudden shift in the proportion of positive predictions, even without ground truth, is an early warning sign.
- **Feature distributions** versus training-time baselines, per feature.
- **Latency and throughput** of the serving path, exactly as for any other production API.

### Retraining triggers

Automated retraining should fire on a defined trigger, not manual whim: a schedule (weekly/monthly), a drift-threshold breach, or a performance-metric drop below an agreed floor — this is a core topic of the **MLOps** skill, which covers the full automation pipeline this section only introduces.
`,

  deployment: `
### The standard: a versioned, containerized prediction service

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/
COPY models/model_v12.joblib models/

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY --from=builder /app/models /app/models
ENV PATH="/app/.venv/bin:$PATH" MODEL_VERSION="v12"
USER appuser
EXPOSE 8000
CMD ["uvicorn", "mlservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: the model artifact is baked into the image alongside the exact code version that trained it (reproducibility), the runtime stage never contains build tools (smaller attack surface), and MODEL_VERSION is stamped as metadata so every prediction can be traced back to the artifact that produced it.

### Deployment strategies specific to ML

- **Shadow deployment**: run the new model alongside the current production model on live traffic, log both predictions, but only serve the old model's decision — compare offline before cutting over.
- **Canary rollout**: route a small percentage of traffic to the new model version, monitor its metrics, then ramp up — identical in spirit to standard software canary deploys, but the metric watched is model quality, not just error rate/latency.
- **Champion/challenger**: keep the current production model (champion) serving while a new candidate (challenger) is evaluated against the same live traffic distribution before promotion.

### Rollback readiness

Every deployed model version must be one config change away from rollback to the previous version — the model registry (see Production Usage) exists specifically to make "roll back to the model that was in production last Tuesday" a fast, safe operation.
`,

  "production-checklist": `
Before an ML model takes real production traffic:

- [ ] Naive baseline established and beaten by a meaningful, statistically significant margin
- [ ] Correct metric chosen for the task and class balance (not defaulting to accuracy blindly)
- [ ] Cross-validated performance reported, not a single lucky train/test split
- [ ] Test set touched exactly once, at the very end, for the final reported number
- [ ] Feature pipeline packaged as a single reusable artifact shared by training and serving
- [ ] No data leakage: scalers/encoders/imputers fit only on training data
- [ ] Model artifact versioned in a registry alongside the data/code version that produced it
- [ ] Golden evaluation set defined; every new candidate model scored against it before promotion
- [ ] Prediction and input logging in place, with PII scrubbed/encrypted
- [ ] Data and prediction drift monitoring wired up with defined alert thresholds
- [ ] Retraining trigger defined (schedule, drift threshold, or performance floor)
- [ ] Rollback path tested: can you safely revert to the previous model version quickly
- [ ] Latency and throughput load-tested for the serving path
- [ ] Documented model limitations and known out-of-distribution failure modes
- [ ] Fairness/bias check performed on relevant subgroups for sensitive applications
`,

  "common-mistakes": `
1. **Judging every model by accuracy** — on an imbalanced dataset this hides that the model catches almost none of the minority class; use precision/recall/F1/ROC-AUC instead.
2. **Data leakage from fitting preprocessing on the full dataset** before splitting — inflates offline scores that never materialize in production.
3. **Confusing correlation with causation** — a model finding a correlated feature will happily use it, even if it is a proxy or an artifact rather than a true cause.
4. **Not establishing a baseline** — without a naive baseline, you cannot tell if your fancy model is actually adding value.
5. **Tuning hyperparameters against the test set** repeatedly — this silently converts the test set into a second validation set and invalidates the final performance claim.
6. **Ignoring feature scaling for scale-sensitive algorithms** (linear/logistic regression, SVM, k-means, k-NN, neural nets) while it is unnecessary for tree-based models — applying it inconsistently, or omitting it where needed, degrades performance.
7. **Deploying without monitoring**, assuming a good offline score guarantees indefinite good production performance — the world drifts.
8. **Choosing an overly complex model for a small dataset** — a large neural network on a few thousand tabular rows tends to overfit badly compared to gradient boosting or even linear regression.
9. **One-hot encoding very high-cardinality features naively**, exploding dimensionality and hurting both performance and training time.
10. **Not doing error analysis** — shipping a model without ever looking at specific mispredicted examples misses patterns a metric alone cannot reveal.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Train accuracy near 100 percent, test accuracy much lower | Overfitting | Regularize (L1/L2), reduce model complexity, gather more data, use cross-validation to select complexity |
| High accuracy but model never predicts the minority class | Class imbalance ignored | Use precision/recall/F1/ROC-AUC; resample or use class weights |
| Great offline metrics, poor production performance | Data leakage or training/serving skew | Audit the pipeline for leakage; ensure identical feature logic in training and serving |
| ValueError on unseen categorical value at inference | Encoder not configured for unseen categories | Use handle_unknown="ignore" in OneHotEncoder or a robust encoding strategy |
| Model performance degrades gradually over weeks/months | Data or concept drift | Set up drift monitoring; trigger scheduled or threshold-based retraining |
| Wildly different cross-validation fold scores | High-variance model or too little data per fold | Increase K carefully, gather more data, reduce model complexity |
| Feature importance dominated by an unexpected column | Leaked label information (a proxy for the target) | Investigate that feature's relationship to the label; remove if it encodes the answer |
| Predictions are all nearly identical / model seems to ignore inputs | Severe underfitting, or a feature-scale problem drowning signal | Check scaling, increase model capacity, verify features actually vary meaningfully |
| Slow training on tree ensembles | Too many estimators or excessive depth for the data size | Tune n_estimators/max_depth/learning_rate together; use early stopping |

The habit that matters: check the confusion matrix and error cases before trusting any single summary metric.
`,

  faqs: `
**Q: Do I need to know calculus and linear algebra to learn Machine Learning?**
Not for the beginner/intermediate layer of this page — you can use scikit-learn productively with the intuitions given here. Calculus (gradients) and linear algebra become genuinely necessary once you move into the **Deep Learning** and **Neural Networks** skills, where you build and debug the internals directly.

**Q: Should I learn classical ML before deep learning?**
Yes. The vocabulary here — overfitting, bias-variance, evaluation metrics, train/test splits, regularization — is exactly the vocabulary deep learning reuses; skipping it makes deep learning harder to learn, not easier.

**Q: Is deep learning always better than classical ML?**
No. For structured/tabular data, gradient boosting typically matches or beats deep learning with far less data, tuning, and compute. Deep learning's advantage is specifically in unstructured data (images, audio, raw text) where it learns useful features automatically instead of requiring hand-crafted ones — see the shift discussed in Related Technologies.

**Q: How much data do I need?**
It depends heavily on the algorithm and the signal-to-noise ratio of the problem — simple linear models can work with hundreds of rows, gradient boosting typically wants thousands, and deep learning typically needs tens of thousands to millions of examples to outperform classical approaches. When in doubt, start simple and let the learning curve tell you whether more data would help.

**Q: What is the difference between a validation set and a test set?**
The validation set is used repeatedly during development to tune hyperparameters and choose between models. The test set is touched exactly once, at the very end, to produce an honest estimate of real-world performance — reusing it for tuning invalidates that estimate.

**Q: Why does my model perform well in testing but poorly in production?**
The most common causes, in order of frequency: training/serving feature mismatch, data leakage during development that inflated offline scores, and data/concept drift between the training period and the live traffic period — see Common Errors and Monitoring.

**Q: When should I use k-means versus another clustering method?**
K-means is the right first choice when you expect roughly spherical, similarly-sized clusters and you can reasonably guess K; for irregularly shaped or unevenly sized clusters, hierarchical clustering or DBSCAN often perform better.

**Q: How do I know when it's time to retrain a model?**
On a defined trigger, not intuition: a fixed schedule, a drift-detection threshold breach, or a monitored performance metric dropping below an agreed floor — covered fully in the **MLOps** skill.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the difference between supervised and unsupervised learning?* Supervised learning trains on labeled input-output pairs to predict outputs for new inputs; unsupervised learning finds structure (clusters, patterns) in unlabeled data with no target to predict.
2. *Explain overfitting in one sentence, and name two ways to fix it.* Overfitting is when a model fits training-set noise instead of the true underlying pattern, shown by high training accuracy but much lower validation accuracy; fixes include regularization (L1/L2) and gathering more training data.
3. *Why can accuracy be a misleading metric?* Under class imbalance, a model predicting only the majority class can score very high accuracy while catching none of the minority class — precision, recall, F1, or ROC-AUC give a truer picture.
4. *What is cross-validation and why use it over a single split?* K-fold cross-validation trains and evaluates K times on different holdout folds and averages the score, giving a more reliable, lower-variance estimate of real-world performance than one lucky/unlucky split.
5. *Why do you scale features for some algorithms but not others?* Distance- and gradient-based algorithms (linear/logistic regression, SVM, k-means, k-NN, neural nets) are sensitive to feature magnitude; tree-based models split on thresholds per feature independently and are scale-invariant.

**Senior:**

6. *Walk through the bias-variance tradeoff and how you would diagnose which one dominates in a specific model.* Bias is error from an overly simple model that cannot capture the true pattern; variance is error from a model overly sensitive to the specific training sample. Plot a learning curve: both scores low and converged means high bias; a persistent gap between training and validation score means high variance. Strong answers connect this directly to specific fixes (more features/complexity for bias, more data/regularization for variance).
7. *How would you detect and handle training/serving skew in a deployed model?* Package feature computation as a single shared artifact used identically in training and serving; add a test that runs one example through both paths and asserts identical output; monitor live feature distributions against training-time baselines to catch skew that slips through.
8. *When would you choose gradient boosting over a random forest, and vice versa?* Gradient boosting builds trees sequentially to correct prior errors, generally achieving higher accuracy with careful tuning (learning rate, early stopping) but is more prone to overfitting and slower to train; random forests bag independent trees in parallel, are more robust out of the box with less tuning, and are easier to parallelize.
9. *How do you handle a categorical feature with 100,000 unique values?* Avoid naive one-hot encoding (dimensionality explosion); use target/frequency encoding, hashing tricks, or embeddings (bridging into the Embeddings skill), with careful attention to leakage when computing target encodings.
10. *Explain concept drift versus data drift, and how you'd detect each in production.* Data drift is a shift in the input feature distribution (detectable via statistical tests like KS comparing live vs. training distributions, without needing ground truth); concept drift is a shift in the true relationship between inputs and labels, detectable only once ground truth arrives and monitored performance metrics decline.
11. *Design an ML system for real-time fraud detection at high transaction volume.* Requirements to raise: low-latency feature computation (precomputed aggregates in a feature store), a model choice favoring cheap inference (gradient boosting over deep nets, or a distilled model), shadow/canary deployment before full rollout, drift monitoring given adversarial adaptation by fraudsters, and a documented retraining cadence.
12. *Why does deep learning outperform classical ML on images but not typically on tabular business data?* Deep learning's convolutional/attention layers automatically learn hierarchical feature representations from raw pixels/tokens, replacing manual feature engineering that is nearly impossible to do well for unstructured data; on tabular data, features are already meaningful and structured, so gradient boosting's inductive bias (axis-aligned splits) matches the data better with far less data and compute required.
`,

  "coding-questions": `
### 1. Implement k-fold cross-validation from scratch (tests understanding, not library use)

~~~python
import numpy as np

def k_fold_cv(X, y, model_factory, k=5, metric=lambda yt, yp: (yt == yp).mean()):
    """Manual k-fold CV: model_factory() returns a fresh, unfit model each fold."""
    n = len(X)
    indices = np.arange(n)
    np.random.default_rng(42).shuffle(indices)
    folds = np.array_split(indices, k)

    scores = []
    for i in range(k):
        val_idx = folds[i]
        train_idx = np.concatenate([folds[j] for j in range(k) if j != i])
        model = model_factory()
        model.fit(X[train_idx], y[train_idx])
        preds = model.predict(X[val_idx])
        scores.append(metric(y[val_idx], preds))
    return np.mean(scores), np.std(scores)
~~~

Complexity: O(k) model fits, each on roughly (k-1)/k of the data. Follow-up: implement stratified k-fold, which preserves class proportions in every fold — important for imbalanced classification.

### 2. Compute precision, recall, and F1 from raw predictions (tests metric understanding)

~~~python
def precision_recall_f1(y_true, y_pred):
    """Binary classification metrics from scratch — no sklearn."""
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)
          if (precision + recall) else 0.0)
    return precision, recall, f1

assert precision_recall_f1([1, 1, 0, 1], [1, 0, 0, 1]) == (1.0, 2/3, 0.8)
~~~

Follow-up: extend to multi-class using macro-averaging (compute per-class then average) versus micro-averaging (aggregate all TP/FP/FN first).

### 3. Implement a simple k-means clustering loop (tests unsupervised-learning mechanics)

~~~python
import numpy as np

def k_means(X, k, max_iters=100, tol=1e-4, seed=42):
    """Lloyd's algorithm: assign -> recompute centers -> repeat until stable."""
    rng = np.random.default_rng(seed)
    centers = X[rng.choice(len(X), k, replace=False)]

    for _ in range(max_iters):
        distances = np.linalg.norm(X[:, None] - centers[None, :], axis=2)
        assignments = distances.argmin(axis=1)

        new_centers = np.array([
            X[assignments == i].mean(axis=0) if (assignments == i).any() else centers[i]
            for i in range(k)
        ])
        if np.linalg.norm(new_centers - centers) < tol:
            break
        centers = new_centers

    return centers, assignments
~~~

Complexity: O(iterations times n times k times d) where n is samples, d is dimensions. Follow-up: how would you choose K? (elbow method on inertia, or silhouette score), and how would you handle an empty cluster (reinitialize it, as handled above with the fallback to the previous center).
`,

  "hands-on-labs": `
### Lab 1 — Predict house prices with linear regression (beginner, about 1h)
Load a small tabular housing dataset, split into train/test, train a linear regression, and evaluate with RMSE and MAE. Plot predicted vs actual prices. Stretch: add polynomial features and observe the bias-variance tradeoff directly. Skills: the full beginner-to-intermediate pipeline, regression metrics.

### Lab 2 — Fraud/imbalanced classification (intermediate, about 2h)
Use a labeled dataset with a rare positive class (fraud, churn, or similar). Train a logistic regression baseline, then a gradient-boosted model. Compare accuracy vs precision/recall/F1/ROC-AUC directly, and demonstrate why accuracy alone is misleading here. Apply class weighting and observe metric changes. Deliverable: a short write-up naming the correct production metric and why. Skills: evaluation metrics under imbalance, gradient boosting.

### Lab 3 — Customer segmentation with k-means (intermediate, about 2h)
Cluster customers by behavioral features (recency, frequency, spend). Determine K using the elbow method, visualize clusters in 2D via PCA, and write a one-paragraph business interpretation of each cluster. Skills: unsupervised learning, feature scaling, exploratory analysis.

### Lab 4 — Production-style ML service (advanced/production, about 4h)
Take Lab 2's model, wrap the full pipeline (preprocessing + model) in a scikit-learn Pipeline object, serialize it, serve it behind a FastAPI endpoint, add prediction/input logging, and implement a basic drift check comparing live feature distributions to training-time distributions. Load test the endpoint. Skills: the entire production section of this page, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in ML-adjacent roles):

1. **End-to-end churn prediction platform** — Ingest historical customer data, build a feature pipeline with proper train/validation/test discipline, train and compare logistic regression, random forest, and gradient boosting, select via cross-validated ROC-AUC, and serve predictions through an API with prediction logging and a simple drift dashboard. Demonstrates: the full ML lifecycle, correct evaluation methodology, production packaging.

2. **Fraud detection with class imbalance** — Build a fraud-classification pipeline on a heavily imbalanced dataset, apply and compare resampling techniques (SMOTE, undersampling) versus class weighting, tune the decision threshold using a precision-recall curve tied to a business cost model (cost of a missed fraud vs. cost of a false alarm), and document the chosen operating point with justification. Demonstrates: metric selection under imbalance, business-aware threshold tuning.

3. **Automated retraining pipeline with drift detection** — Build a scheduled pipeline that retrains a model on fresh data, evaluates the new candidate against a fixed golden set, only promotes it to production if it beats the current champion by a defined margin, and logs a full audit trail of every decision. Demonstrates: MLOps-adjacent engineering, model registry thinking, retraining triggers — directly relevant to the **MLOps** skill.

Each project: proper train/validation/test discipline documented, a model card describing limitations and intended use, a reproducible pipeline (versioned data/code/model), and a README explaining metric choice and business tradeoffs — this reasoning is what distinguishes a senior ML engineering candidate from someone who only called .fit().
`,

  "case-studies": `
### Netflix: from classical collaborative filtering to a hybrid stack
Netflix's original recommendation approach relied heavily on classical collaborative filtering and matrix factorization techniques (well documented from the Netflix Prize era), later blended with gradient boosting and deep learning for ranking. Lesson: even as deep learning enters a system, classical ML techniques and rigorous offline/online evaluation methodology remain the backbone of the surrounding infrastructure.

### Uber's Michelangelo platform
Uber built one of the first widely publicized internal ML platforms specifically because dozens of teams were independently reinventing feature pipelines, training workflows, and model serving — leading to training/serving skew and inconsistent evaluation. Michelangelo standardized the lifecycle described in this page (feature store, training, evaluation, serving, monitoring) across the whole company. Lesson: the ML lifecycle discipline (Production Usage, Architecture, Monitoring sections) is not academic — it is exactly the problem large companies build entire platforms to solve.

### Zillow's home-price model and the iBuying business
Zillow's home-price estimation models faced significant public scrutiny when its home-buying business relied on pricing model predictions that did not adequately account for a shifting housing market (concept drift) in 2021, contributing to Zillow shutting down that business line. Lesson: a model's assumptions can quietly stop holding as the world changes, and the cost of undetected drift can be measured in real business terms, not just an accuracy metric on a dashboard.

### Amazon's abandoned hiring algorithm
Amazon built and ultimately scrapped an internal ML resume-screening tool after discovering it had learned to penalize resumes associated with women, because it was trained on historical hiring data reflecting past human bias. Lesson: a model trained on biased historical labels reproduces that bias faithfully and confidently; fairness auditing is not optional for models influencing consequential decisions about people.
`,

  comparisons: `
| Dimension | Linear/Logistic Regression | Decision Tree | Random Forest | Gradient Boosting | Neural Network |
|-----------|---------------------------|---------------|----------------|--------------------|------------------|
| Interpretability | High (direct coefficients) | High (readable rules) | Medium (feature importance only) | Medium (feature importance, SHAP needed for detail) | Low (needs dedicated explainability tools) |
| Typical accuracy on tabular data | Good baseline | Fair, prone to overfitting alone | Strong, robust | Usually the strongest on tabular | Competitive with enough data, rarely superior on small/medium tabular |
| Data required | Small to medium | Small to medium | Medium | Medium | Large, often much larger |
| Training speed | Very fast | Fast | Moderate | Moderate to slow (sequential) | Slow, typically needs a GPU |
| Handles nonlinearity | No (unless features engineered) | Yes | Yes | Yes | Yes, natively |
| Needs feature scaling | Yes | No | No | No | Yes |
| Best for | Fast interpretable baseline | Quick, explainable rules | Robust general-purpose tabular model | Best-in-class tabular accuracy | Unstructured data (images, audio, text) |

**How seniors choose**: start with a linear/logistic regression baseline to establish a floor and sanity-check features; move to gradient boosting for the best realistic accuracy on structured data with modest tuning effort; reach for random forests when robustness with minimal tuning matters more than squeezing out the last percentage point; reach for deep learning (see the **Deep Learning** skill) specifically when the input is unstructured (images, audio, raw text) or the dataset is large enough that learned representations clearly outperform hand-crafted features. K-means and other unsupervised methods are chosen not as competitors to the supervised algorithms above, but for a fundamentally different question — finding structure rather than predicting a known label.
`,

  "related-technologies": `
- **NumPy / pandas** — the numerical and tabular-data foundation nearly every classical ML workflow is built on.
- **scikit-learn** — the standard library for classical ML in Python: preprocessing, models, pipelines, evaluation, all in a consistent API.
- **XGBoost / LightGBM / CatBoost** — the production-grade gradient boosting implementations that power most winning tabular-data solutions.
- **MLflow / Weights and Biases** — experiment tracking and model registries for reproducibility at team scale.
- **Feature stores (Feast, Tecton)** — enforce consistent feature computation between training and serving, directly solving the training/serving skew problem covered in Architecture.
- **Neural Networks** — the model family that replaces hand-engineered features with learned representations; the natural next step once classical ML's ceiling is reached on unstructured data.
- **Deep Learning** — the broader discipline of training multi-layer neural networks; see it next for the theory and practice behind CNNs, RNNs, and Transformers.
- **CNNs / RNNs / Transformers / Attention** — specific deep-learning architectures for images, sequences, and (in the Transformer's case) the architecture underlying every modern LLM.
- **Embeddings / Vector Search** — how modern systems represent unstructured data (text, images) as dense vectors and search over them; the technique that bridges classical ML's feature engineering into deep learning's learned representations.
- **MLOps** — the operational discipline (CI/CD for models, automated retraining, monitoring at scale) that turns everything in Production Usage/Monitoring on this page into a repeatable, automated system.

On this platform, the natural next pages: **Neural Networks** to **Deep Learning** to **CNNs** / **RNNs** to **Transformers** to **Attention** to **Embeddings** to **Vector Search** to **LLM Fundamentals**, which is where the classical-ML foundation built here culminates for an AI engineer.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025 — check the scikit-learn, XGBoost, and LightGBM release notes for anything newer.

- **Gradient boosting remains dominant for tabular data**: XGBoost, LightGBM, and CatBoost continue to be the default choice in tabular-data competitions and production systems, with ongoing improvements in categorical-feature handling and GPU acceleration.
- **AutoML and automated feature engineering tools** (AutoGluon, H2O AutoML) have matured, automating much of the model-selection and hyperparameter-tuning workflow described in this page for standard tabular problems, though understanding the fundamentals remains essential to use them correctly and debug their output.
- **Growing interest in tabular deep learning** (architectures like TabNet and FT-Transformer) attempting to close the gap with gradient boosting on structured data, though gradient boosting still generally wins on typical business tabular datasets without very large data volumes.
- **Explainability tooling (SHAP, LIME) is now considered standard practice**, not optional, for any classical ML model influencing a consequential decision, driven by both regulatory pressure and internal trust requirements.
- **The classical ML / deep learning boundary keeps blurring** for feature representation: embeddings learned by neural networks increasingly feed into gradient-boosted models as engineered features, combining the strengths of both paradigms in production.

For anything version-specific (exact library APIs, latest algorithm variants), verify against the official scikit-learn and XGBoost/LightGBM documentation, since tooling here moves faster than any static page can track precisely.
`,

  "future-roadmap": `
Where classical Machine Learning is heading over the next few years, and what to invest career time in:

1. **AutoML absorbs routine model selection and tuning.** The mechanical parts of this page (trying several algorithms, tuning hyperparameters) increasingly get automated; the differentiating human skill shifts toward correct problem framing, feature engineering, evaluation methodology, and knowing when a metric or approach is wrong — bet career time here, not on manual grid search.
2. **Classical ML and deep learning keep hybridizing.** Expect more systems that use learned embeddings (from the Deep Learning/Embeddings skills) as inputs to gradient-boosted models rather than treating the two paradigms as competitors — understanding both remains valuable precisely because production systems increasingly combine them.
3. **Explainability and fairness auditing become table stakes**, not optional add-ons, driven by both regulation and the well-publicized failures covered in Case Studies — invest in SHAP/LIME fluency alongside raw modeling skill.
4. **MLOps maturity keeps rising** as the operational discipline (feature stores, automated retraining, drift monitoring) that this page introduces becomes as standard as CI/CD is for regular software — the **MLOps** skill is where that investment compounds.
5. **Tabular data remains classical ML's stronghold** for the foreseeable future; do not expect deep learning to displace gradient boosting on well-structured business data any time soon, even as LLMs dominate headlines elsewhere.

For your career: the highest-leverage bet is mastering evaluation methodology and problem framing (choosing the right metric, avoiding leakage, understanding drift) — these skills transfer unchanged whether the underlying model is a decision tree or a trillion-parameter Transformer.
`,

  "cheat-sheet": `
~~~python
# --- The lifecycle ---
# collect -> clean -> engineer features -> split -> select model -> train
# -> evaluate -> deploy -> monitor for drift -> retrain

# --- Split data FIRST, always ---
from sklearn.model_selection import train_test_split, cross_val_score
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- Scale/encode: fit on train only ---
from sklearn.preprocessing import StandardScaler, OneHotEncoder
scaler = StandardScaler().fit(X_train)          # fit on TRAIN
X_train_s = scaler.transform(X_train)
X_test_s = scaler.transform(X_test)             # transform test with SAME scaler

# --- Classical algorithms, one line each ---
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.cluster import KMeans
from sklearn.svm import SVC

# --- Train / predict pattern (same for every sklearn model) ---
model = GradientBoostingClassifier(n_estimators=200, max_depth=3, learning_rate=0.05)
model.fit(X_train_s, y_train)
preds = model.predict(X_test_s)
probs = model.predict_proba(X_test_s)[:, 1]

# --- Cross-validation ---
scores = cross_val_score(model, X_train_s, y_train, cv=5, scoring="roc_auc")

# --- Classification metrics ---
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              f1_score, roc_auc_score, confusion_matrix)
accuracy_score(y_test, preds)
precision_score(y_test, preds); recall_score(y_test, preds); f1_score(y_test, preds)
roc_auc_score(y_test, probs)
confusion_matrix(y_test, preds)

# --- Regression metrics ---
from sklearn.metrics import mean_squared_error, mean_absolute_error
mean_squared_error(y_test, preds, squared=False)   # RMSE
mean_absolute_error(y_test, preds)                 # MAE

# --- Regularization ---
from sklearn.linear_model import Ridge, Lasso   # L2, L1
Ridge(alpha=1.0); Lasso(alpha=0.1)

# --- Pipelines (prevent train/serving skew) ---
from sklearn.pipeline import Pipeline
pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

# --- Bias/variance quick diagnosis ---
# train acc high, val acc low  -> overfitting  -> regularize / more data / simplify
# train acc low, val acc low   -> underfitting -> more features / more complexity
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Supervised vs unsupervised learning | Labeled input-output pairs to predict outputs, vs. finding structure in unlabeled data |
| What is overfitting? | Model fits training noise; high train accuracy, much lower validation accuracy |
| Bias vs variance | Bias: error from an overly simple model; variance: error from a model overly sensitive to the training sample |
| Why is accuracy misleading under class imbalance? | A model predicting only the majority class can score high accuracy while catching none of the minority class |
| Precision vs recall | Precision: of predicted positives, how many were correct; recall: of true positives, how many were caught |
| L1 vs L2 regularization | L1 (Lasso) can zero out coefficients (feature selection); L2 (Ridge) shrinks coefficients smoothly toward zero |
| Why fit scalers on training data only? | Fitting on the full dataset leaks test-set statistics into training, inflating offline scores |
| When to use gradient boosting over random forest? | When squeezing maximum accuracy from tabular data and willing to tune more carefully |
| What does k-means require you to choose upfront? | The number of clusters, K |
| RMSE vs MAE | RMSE penalizes large errors more (squares them); MAE treats all errors linearly, more robust to outliers |
| Data drift vs concept drift | Data drift: input distribution shifts; concept drift: the true input-to-label relationship shifts |
| Which algorithms need feature scaling? | Linear/logistic regression, SVM, k-means, k-NN, neural networks — not tree-based models |
| Role of the validation set vs the test set | Validation: tune hyperparameters repeatedly; test: touched once, final honest performance estimate |
| Why does deep learning beat classical ML on images? | It learns hierarchical feature representations automatically instead of requiring hand-crafted features |
| What is training/serving skew? | A mismatch between feature computation at training time and at serving time, degrading production performance |
`,

  mcqs: `
**1. A fraud model scores 99 percent accuracy but catches almost no actual fraud. What is the most likely explanation?**

A) The model is excellent  B) Class imbalance makes accuracy misleading  C) The learning rate is too high  D) The test set is too large

**Answer: B** — with rare positives, predicting the majority class alone yields high accuracy while missing nearly all true positives; precision/recall/F1/ROC-AUC reveal the real picture.

**2. Which regularization technique can force some coefficients to exactly zero, effectively performing feature selection?**

A) L2 / Ridge  B) L1 / Lasso  C) Dropout  D) Early stopping

**Answer: B** — the L1 penalty's geometry can drive coefficients to exactly zero, unlike L2's smooth shrinkage.

**3. You must fit a StandardScaler. On which data should you fit it?**

A) The full dataset before splitting  B) The test set only  C) The training set only  D) It does not matter

**Answer: C** — fitting on anything beyond the training set leaks information and inflates offline evaluation.

**4. Training accuracy is 98 percent, validation accuracy is 65 percent. What is happening and what is the best first fix?**

A) Underfitting; add more features  B) Overfitting; regularize or simplify the model  C) Data leakage; nothing to fix  D) The metric is wrong

**Answer: B** — a large train/validation gap is the textbook sign of overfitting; regularization, reduced complexity, or more data are the standard fixes.

**5. Why is gradient boosting typically preferred over a single deep decision tree?**

A) It is always faster to train  B) Sequential trees correcting prior errors generalize better than one very deep, high-variance tree  C) It requires no tuning  D) It does not need a validation set

**Answer: B** — gradient boosting's ensemble of shallow, error-correcting trees typically has much lower variance than a single deep tree, which tends to overfit.

**6. Which best describes concept drift, as opposed to data drift?**

A) The input feature distribution shifts while the input-label relationship stays the same  B) The true relationship between inputs and the label changes over time  C) The model's code changes  D) The training set grows larger

**Answer: B** — concept drift specifically means the mapping from inputs to true outcomes has changed, distinct from data drift's shift in input distribution alone.
`,

  "revision-notes": `
**Paradigms in three lines:** Supervised learning predicts a known label from labeled examples; unsupervised learning finds structure with no label; reinforcement learning optimizes sequential actions through reward signals over time.

**The lifecycle in five lines:** Collect and clean data, engineer features, split into train/validation/test (fit any preprocessing on train only), select and train a model, evaluate with the metric matching the task, deploy behind a shared feature pipeline, and monitor continuously for data/concept drift with a defined retraining trigger.

**Classical algorithms in six lines:** Linear/logistic regression give fast, interpretable baselines. Decision trees are readable but high-variance alone. Random forests bag many trees for robust general-purpose accuracy. Gradient boosting sequentially corrects errors for the strongest typical tabular-data performance. K-means finds K roughly spherical clusters in unlabeled data. SVMs maximize margin and once dominated high-dimensional text classification before gradient boosting and neural networks took over most of that ground.

**Evaluation in four lines:** Bias-variance tradeoff governs underfitting versus overfitting; regularization (L1/L2, dropout conceptually, early stopping) manages it directly. Accuracy misleads under class imbalance — use precision/recall/F1/ROC-AUC for classification, RMSE/MAE for regression. Cross-validation gives a more reliable performance estimate than a single split. The test set is touched exactly once, at the end.

**Production in four lines:** Package feature computation and model together to guarantee zero training/serving skew. Version data, code, and model artifacts together in a registry. Monitor prediction distributions and feature distributions against training-time baselines to catch drift before ground truth confirms a problem. Define retraining triggers explicitly rather than retraining on intuition — this is the domain of the MLOps skill.

**Where this leads:** classical ML's ceiling on unstructured data (images, audio, raw text) is what motivates neural networks and deep learning, covered next, which learn feature representations automatically instead of requiring hand engineering — and ultimately culminates in the Transformer architecture underlying every modern LLM.
`,

  "learning-roadmap": `
A realistic path to strong Machine Learning fundamentals (adjust pace to your background):

**Week 1 — Foundations and paradigms.** Overview through Prerequisites, plus Beginner Concepts. Daily: identify whether five real-world problems you encounter are supervised, unsupervised, or reinforcement learning. Milestone: explain the three paradigms to someone else without notes.

**Week 2 — Core workflow.** Intermediate Concepts: train/validation/test splitting, cross-validation, feature scaling/encoding, bias-variance, regularization. Lab 1 (house price regression). Milestone: correctly diagnose overfitting versus underfitting from a learning curve.

**Week 3 — Classical algorithms in depth.** Advanced Concepts: linear/logistic regression, decision trees, random forests, gradient boosting, k-means, SVMs, and the decision table for choosing between them. Lab 3 (customer segmentation). Milestone: explain why gradient boosting usually wins on tabular data.

**Week 4 — Evaluation mastery.** Re-read the evaluation-metrics material closely; Lab 2 (imbalanced fraud/churn classification). Milestone: given any dataset, correctly pick and justify the evaluation metric before touching a model.

**Week 5 — Internals, architecture, and production.** Internal Working, Architecture, Data Flow, Production Usage, Deployment, Monitoring sections. Lab 4 (production-style ML service). Milestone: explain training/serving skew and how a feature store prevents it.

**Week 6 — Interview polish and first real project.** Interview/Coding Questions sections; start Real Project 1 (end-to-end churn prediction platform). Milestone: solve the k-fold cross-validation and precision/recall coding problems from memory, unprompted.

Then continue to **Neural Networks** and **Deep Learning** on this platform — the vocabulary and evaluation discipline built here (bias-variance, regularization, train/validation/test, drift) carries forward unchanged into every subsequent skill, all the way to **LLM Fundamentals**.
`,

  "official-docs": `
- [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html) — the definitive reference for classical ML in Python; the API consistency across algorithms is itself worth studying.
- [scikit-learn API reference](https://scikit-learn.org/stable/api/index.html) — precise parameter documentation for every estimator, preprocessor, and metric mentioned on this page.
- [XGBoost documentation](https://xgboost.readthedocs.io/) — the leading gradient boosting implementation; read the parameter-tuning guide closely.
- [LightGBM documentation](https://lightgbm.readthedocs.io/) — Microsoft's gradient boosting implementation, notably fast on large tabular datasets.
- [pandas documentation](https://pandas.pydata.org/docs/) — the data-manipulation layer nearly every ML pipeline is built on.
- [NumPy documentation](https://numpy.org/doc/stable/) — the numerical foundation beneath pandas and scikit-learn.
`,

  books: `
- **Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow** — Aurelien Geron. The best single practical bridge from classical ML through deep learning, code-first throughout.
- **An Introduction to Statistical Learning** — James, Witten, Hastie, Tibshirani (free online). The gentlest rigorous introduction to the statistics underlying every algorithm on this page.
- **The Elements of Statistical Learning** — Hastie, Tibshirani, Friedman (free online). The advanced, mathematically deeper companion to the above; read once the intuition from this page feels solid.
- **Pattern Recognition and Machine Learning** — Christopher Bishop. Classic, thorough, more mathematical treatment; strong for the probabilistic view of ML.
- **Feature Engineering for Machine Learning** — Zheng and Casari. A focused, practical treatment of exactly the feature-engineering skills this page only introduces.
- **Designing Machine Learning Systems** — Chip Huyen. The production/MLOps side of this page, book-length — read before the MLOps skill.
`,

  blogs: `
- **scikit-learn's own examples gallery** — dozens of runnable, well-commented examples covering nearly every algorithm on this page.
- **Machine Learning Mastery** (machinelearningmastery.com) — Jason Brownlee's consistently practical, code-first tutorials on classical ML topics.
- **Google's Machine Learning Crash Course** — a well-structured free course with strong intuition-building exercises, particularly on evaluation metrics and bias-variance.
- **Chip Huyen's blog** (huyenchip.com) — production ML systems and MLOps thinking from someone who has built these systems at scale.
- **Netflix Tech Blog / Uber Engineering Blog / Airbnb Engineering Blog** — the industry case studies referenced on this page originate largely from these sources; search each for "machine learning platform."
- **Towards Data Science** (on Medium) — mixed quality but high volume; useful for specific algorithm deep-dives, cross-check claims against official docs.
`,

  "research-papers": `
Classical ML's foundational papers are older and more statistics-flavored than the deep-learning literature, but they remain directly relevant:

- **"Random Forests"** (Breiman, 2001) — the original formalization of bagging with trees; still the clearest explanation of why the technique reduces variance.
- **"Greedy Function Approximation: A Gradient Boosting Machine"** (Friedman, 2001) — the foundational gradient boosting paper underlying XGBoost/LightGBM/CatBoost.
- **"XGBoost: A Scalable Tree Boosting System"** (Chen and Guestrin, 2016) — the systems paper behind the most widely deployed gradient boosting implementation; also a good read on production ML engineering, not just the algorithm.
- **"A Few Useful Things to Know About Machine Learning"** (Pedro Domingos, 2012) — not a novel algorithm paper but a widely cited, highly practical synthesis of ML engineering wisdom (bias-variance, overfitting, feature engineering) that reads as a condensed version of this entire page.
- **"A Unified Approach to Interpreting Model Predictions"** (Lundberg and Lee, 2017) — the SHAP paper, foundational for the explainability tooling referenced in Security and Best Practices.

For the transition into neural approaches: the classical-ML literature above is the correct prerequisite before reading the foundational deep-learning papers covered in the **Deep Learning** and **Neural Networks** skills.
`,

  videos: `
- **Andrew Ng's Machine Learning course (Coursera / Stanford CS229 lectures)** — the canonical structured introduction; the intuition-building style is the direct ancestor of how this page explains bias-variance and evaluation.
- **StatQuest with Josh Starmer (YouTube)** — exceptionally clear, visual explanations of exactly the algorithms in Advanced Concepts (random forests, gradient boosting, SVMs, k-means) with minimal unnecessary jargon.
- **3Blue1Brown's linear algebra and calculus series** — not ML-specific, but the visual intuition it builds pays off directly once you move into gradient descent internals.
- **Google's Machine Learning Crash Course videos** — short, focused explanations of evaluation metrics and the bias-variance tradeoff, well-suited to review.
- **Kaggle's tutorial notebooks and competition write-ups** — not a video series, but watching top-ranked solution walkthroughs teaches feature engineering and model selection judgment that no lecture fully conveys.
`,

  "github-repos": `
- [scikit-learn/scikit-learn](https://github.com/scikit-learn/scikit-learn) — the reference implementation for essentially every algorithm on this page; the examples directory is a learning resource in itself.
- [dmlc/xgboost](https://github.com/dmlc/xgboost) — the leading gradient boosting implementation; read the demo folder for practical usage patterns.
- [microsoft/LightGBM](https://github.com/microsoft/LightGBM) — Microsoft's fast gradient boosting library, notable for categorical-feature handling and speed on large datasets.
- [scikit-learn-contrib/imbalanced-learn](https://github.com/scikit-learn-contrib/imbalanced-learn) — resampling techniques (SMOTE and others) for the class-imbalance problem discussed throughout this page.
- [shap/shap](https://github.com/shap/shap) — the SHAP explainability library referenced in Security and Best Practices.
- [ageron/handson-ml3](https://github.com/ageron/handson-ml3) — Aurelien Geron's companion notebooks to the book above, excellent for hands-on practice.
- [trekhleb/homemade-machine-learning](https://github.com/trekhleb/homemade-machine-learning) — classical ML algorithms implemented from scratch for learning purposes, complementing the from-scratch coding problems on this page.
- [rasbt/python-machine-learning-book-3rd-edition](https://github.com/rasbt/python-machine-learning-book-3rd-edition) — Sebastian Raschka's well-regarded companion code.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Splitting and leakage discipline*: given a raw dataset, correctly implement a train/validation/test split, fit preprocessing only on train, and write an assertion-based test proving no leakage occurred.
2. *Metric selection*: given three different labeled datasets (balanced classification, heavily imbalanced classification, and a regression problem), justify in writing which metric you would report for each and why accuracy would mislead in one of them.
3. *Bias-variance diagnosis*: given several learning curve plots (some provided as data, some you generate by training a model at increasing training-set sizes), classify each as underfitting, overfitting, or well-fit, and propose the specific fix.
4. *Algorithm selection*: given short descriptions of five different business problems, select the most appropriate classical algorithm from Advanced Concepts for each and justify the choice against at least one alternative.
5. *From-scratch implementation*: implement k-fold cross-validation, precision/recall/F1, and k-means from scratch (see Coding Questions) without looking at the reference solutions first.
6. *Feature engineering*: given a raw dataset with dates, categorical IDs, and free-text fields, engineer at least five meaningful numeric features and justify each.
7. *Drift simulation*: artificially shift a feature's distribution in a held-out dataset, run a statistical drift test (KS test) against the training distribution, and confirm it fires correctly.

External sets: Kaggle (Titanic and House Prices competitions are the classic starting points; read top solution write-ups afterward, not just leaderboard scores), the UCI Machine Learning Repository for varied small datasets, and scikit-learn's own toy datasets for quick iteration.
`,

  "architecture-diagram": `
The reference production architecture for a classical ML system — the shape recurring across the industry examples on this page:

~~~mermaid
flowchart TB
    Sources[("Production DB / event logs / third-party data")] --> Ingest["Ingestion / ETL"]
    Ingest --> FS[("Feature store")]
    FS --> Train["Training pipeline\n(scikit-learn / XGBoost)"]
    Train --> Eval["Offline evaluation\nvs golden set"]
    Eval -->|passes bar| Registry[("Model registry\nversioned artifacts")]
    Registry --> Serve["Prediction API\n(loads model + feature pipeline together)"]
    FS -->|same feature logic| Serve
    Client["Client applications"] --> Serve
    Serve --> Mon["Monitoring:\npredictions, inputs, drift"]
    Mon -->|drift threshold or schedule| Trigger["Retraining trigger"]
    Trigger --> Train
~~~

Every box maps to a section on this page: Feature store to Architecture/Data Flow, training pipeline to Production Usage, offline evaluation to Testing/Evaluation metrics, monitoring and retraining trigger to Monitoring — and the whole loop is what the **MLOps** skill automates end to end.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Machine Learning))
    Paradigms
      Supervised
      Unsupervised
      Reinforcement learning
    Lifecycle
      Data collection and cleaning
      Feature engineering
      Train/validation/test split
      Model selection and training
      Evaluation
      Deployment
      Monitoring and retraining
    Classical algorithms
      Linear and logistic regression
      Decision trees
      Random forests
      Gradient boosting
      K-means
      SVMs
    Core theory
      Bias-variance tradeoff
      Overfitting and underfitting
      Regularization: L1, L2, dropout
      Cross-validation
    Evaluation
      Accuracy, precision, recall, F1
      ROC-AUC
      RMSE, MAE
      Class imbalance pitfalls
    Production
      Feature stores
      Model registry
      Drift detection
      Retraining triggers
    Path forward
      Neural Networks
      Deep Learning
      Transformers and Attention
      Embeddings and Vector Search
      LLM Fundamentals
~~~
`,
};

export default machineLearning;
