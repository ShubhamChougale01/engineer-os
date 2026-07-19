import type { SkillContent } from "../types";

const machineLearning: SkillContent = {
  overview: `
Machine learning (ML) is the discipline of building systems that improve their performance on a task by learning patterns from data, rather than following explicitly hand-coded rules. Instead of a programmer writing "if X then Y" logic for every case, an ML algorithm is given examples (data) and a way to measure error, and it adjusts its own internal parameters to minimize that error — generalizing to new, unseen inputs it was never explicitly told about.

This skill is the foundational entry point for the entire "Machine Learning & Deep Learning" category, and for the AI Engineer OS platform's more advanced categories (LLMs, AI Agents, Production AI) built on top of it. Every subsequent skill — **Neural Networks**, **Deep Learning**, **Transformers**, and eventually the LLM-specific skills — is a specialization of the general ML paradigm covered here: a specific model architecture, a specific training procedure, or a specific optimization applied to this same fundamental "learn parameters from data to minimize error" loop.

For an AI engineer, understanding classical ML — supervised versus unsupervised learning, the bias-variance tradeoff, overfitting, and the standard train/validation/test workflow — is what lets you reason correctly about a modern LLM's own training and evaluation process, since even a many-billion-parameter transformer is trained using the same core gradient-descent-based loss-minimization principles covered here, just at a vastly larger scale and with far more sophisticated architectures.

Key characteristics: **supervised learning**, learning a mapping from labeled input-output examples; **unsupervised learning**, finding structure in data without labels; **the bias-variance tradeoff**, the fundamental tension between a model being too simple (underfitting) or too complex (overfitting) for the available data; **generalization**, a model's ability to perform well on genuinely new data, not just the data it was trained on — the single most important practical property any ML system must actually achieve to be useful.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1950 | **Alan Turing** proposes the "Turing Test" and speculates about machines that learn, in "Computing Machinery and Intelligence," an early conceptual seed for the field |
| 1957 | **Frank Rosenblatt** invents the **Perceptron**, one of the earliest trainable models capable of learning a linear decision boundary from labeled data, directly foreshadowing modern neural networks |
| 1969 | **Minsky and Papert's "Perceptrons"** book proves single-layer perceptrons cannot learn XOR-like non-linearly-separable functions, contributing to a significant slowdown in neural-network-specific research (part of the first "AI winter") |
| 1986 | **Rumelhart, Hinton, and Williams** popularize **backpropagation** for training multi-layer neural networks, providing a practical algorithm to overcome the single-layer perceptron's limitation |
| 1995 | **Vladimir Vapnik**'s **Support Vector Machines (SVMs)** gain prominence, offering strong theoretical guarantees and excellent practical performance on many classification tasks throughout the 1990s and 2000s |
| 2001 | **Leo Breiman** formalizes **Random Forests**, an ensemble method combining many decision trees, becoming a dominant, extremely reliable "classical ML" technique for structured/tabular data |
| 2012 | **AlexNet** wins the ImageNet competition by a wide margin using a deep convolutional neural network trained on GPUs, a watershed moment often cited as the start of the modern "deep learning revolution" (covered in depth in the **Deep Learning** skill) |
| 2010s–2020s | Classical ML techniques (gradient-boosted trees especially, via XGBoost/LightGBM) remain dominant for structured/tabular data problems, even as deep learning becomes dominant for unstructured data (images, text, audio) |

Machine learning's history reflects a genuinely long arc — from 1950s theoretical foundations, through a real "AI winter" caused by an early architecture's proven limitations, to a resurgence via better algorithms (backpropagation) and, eventually, the 2012 deep learning revolution enabled by GPU-scale compute — with classical ML techniques remaining genuinely, actively relevant today for an important, distinct class of problems (structured data) rather than being fully displaced by deep learning.
`,

  "why-it-exists": `
Machine learning exists because many real-world problems are genuinely too complex, too high-dimensional, or too poorly-understood to solve with explicitly hand-coded rules — no programmer can write an exhaustive set of if/else rules covering every possible way an email might be spam, every possible way a handwritten digit might be drawn, or every possible pattern in a customer's purchasing behavior that predicts churn. Yet in each of these cases, LABELED EXAMPLES (spam vs. not-spam emails, images of digits with their correct labels, past customer behavior with known churn outcomes) are often available or obtainable.

ML solves this by inverting the traditional programming relationship: instead of a human writing the rules and the computer applying them to data, the human provides DATA and a way to measure ERROR, and the computer (via an optimization algorithm) discovers the rules — or more precisely, a set of numerical PARAMETERS that approximately capture the pattern in the data — automatically. This is precisely why deep learning and transformers (covered in later skills in this category) have proven so much more effective at tasks like image recognition and language understanding than any hand-coded rule system ever achieved — the actual patterns underlying these tasks are far too complex and subtle for a human to explicitly enumerate, but are discoverable from sufficient labeled data via this same fundamental optimization process.
`,

  "problem-it-solves": `
Machine learning solves the **"how do we build a system that performs a task well when we can't explicitly enumerate the rules for that task, but we do have (or can obtain) example data"** problem.

Concretely, it provides:

- **A general framework for learning from data**: define a model (a function with adjustable parameters), a loss function (a way to measure how wrong the model's current predictions are), and an optimization algorithm (a way to adjust parameters to reduce that loss) — this same three-part framework underlies everything from a simple linear regression to a modern large language model.
- **Generalization to unseen data**: a well-trained model doesn't just memorize its training examples — it captures underlying patterns that let it make reasonable predictions on genuinely new inputs it's never seen.
- **Automatic feature discovery** (especially in deep learning, covered in its own skill): rather than a human manually engineering which input characteristics matter, sufficiently deep models can learn useful internal representations directly from raw data.
- **A principled way to measure and compare model quality**: metrics (accuracy, precision, recall, and many others, covered in depth) and validation procedures let practitioners rigorously compare different models and configurations rather than relying on intuition alone.

What machine learning does **not** solve, or solves only with genuine, unavoidable tradeoffs: ML models are fundamentally limited by the QUALITY and REPRESENTATIVENESS of their training data — a model trained on biased, unrepresentative, or insufficient data will produce biased, unreliable, or poorly-generalizing predictions, no matter how sophisticated the algorithm; ML doesn't eliminate the NEED for domain understanding — choosing appropriate features, an appropriate model class, and correctly interpreting results still requires genuine expertise; and no ML model achieves perfect accuracy on genuinely difficult, ambiguous, or noisy real-world problems — the OVERFITTING-versus-UNDERFITTING tradeoff (covered in depth below) is a fundamental, unavoidable tension every ML practitioner must navigate, not a problem with a single, complete solution.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Distinguish supervised, unsupervised, and reinforcement learning, and identify which fits a given problem.
2. Explain the bias-variance tradeoff and connect it concretely to underfitting and overfitting.
3. Explain the standard train/validation/test data split and why each is necessary.
4. Explain common evaluation metrics (accuracy, precision, recall, F1, ROC-AUC) and when each is appropriate.
5. Explain regularization and cross-validation as concrete techniques for managing the bias-variance tradeoff.
6. Compare classical ML algorithms (linear/logistic regression, decision trees, random forests, gradient boosting, SVMs, k-means) and their appropriate use cases.
7. Recognize common ML anti-patterns: data leakage, evaluating on training data, ignoring class imbalance.
8. Answer senior-level interview questions on bias-variance tradeoff and metric selection for a given business problem.
`,

  prerequisites: `
- **Required**: the **Data Structures** and **Algorithms** skills (Computer Science category) — for reasoning about the computational cost of training and inference.
- **Very helpful**: basic linear algebra and statistics (vectors, matrices, probability distributions, mean/variance) — not covered as a dedicated platform skill, but assumed background for this entire category.
- **Very helpful**: the **Python** skill, since virtually all practical ML work is done in Python (scikit-learn, NumPy, pandas).

Dependency chain: this page (Machine Learning) → **Neural Networks** → **Deep Learning** → **CNNs**/**RNNs**/**Transformers** for the increasingly specialized architectures covered next in this category.
`,

  "beginner-concepts": `
### The three broad paradigms

~~~
Supervised learning: learn a mapping from INPUT to a KNOWN
    OUTPUT label, using labeled training examples.
    Example: given emails labeled spam/not-spam, predict the
    label for a new, unseen email.
Unsupervised learning: find STRUCTURE in data with NO labels.
    Example: group customers into clusters based on purchasing
    behavior, with no predefined "correct" grouping.
Reinforcement learning: an AGENT learns by taking ACTIONS in
    an ENVIRONMENT and receiving REWARD signals, learning a
    POLICY that maximizes cumulative reward over time.
~~~

### A simple supervised learning example: linear regression

~~~python
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)  # learn parameters from labeled data
predictions = model.predict(X_test)  # apply to new, unseen data
~~~

The model learns a set of weights (one per input feature) that, combined linearly with the inputs, produce a prediction — "fitting" means finding the specific weight values that minimize the difference between predictions and actual labels across the training data.

### Training, validation, and test sets

~~~
Training set:   used to actually fit the model's parameters.
Validation set: used to tune hyperparameters and select among
                candidate models, WITHOUT touching the test set.
Test set:       used ONCE, at the very end, to estimate how the
                final chosen model will perform on genuinely new data.
~~~

This three-way split is essential specifically to get an honest, unbiased estimate of how a model will actually perform on new, real-world data — using the same data for both training and evaluation would produce an overly optimistic, misleading performance estimate.

### Overfitting versus underfitting, intuitively

~~~
Underfitting: the model is too SIMPLE to capture the pattern
    in the data -- performs poorly on BOTH training and test data.
Overfitting: the model is too COMPLEX, effectively MEMORIZING
    the training data's noise and specific examples rather than
    the underlying general pattern -- performs great on training
    data but poorly on new, unseen test data.
~~~
`,

  "intermediate-concepts": `
### The bias-variance tradeoff, formalized

~~~
Expected test error = Bias^2 + Variance + Irreducible error

Bias: error from a model being too SIMPLE to capture the
    true underlying pattern (systematic, consistent error).
Variance: error from a model being too SENSITIVE to the
    specific training data it happened to see (inconsistent
    predictions if retrained on a different training sample).
Irreducible error: inherent noise in the data itself, which
    NO model, however good, can eliminate.
~~~

This is the single most important theoretical concept in classical ML — every practical technique for improving a model (more data, regularization, a different model class, feature engineering) ultimately works by shifting this specific bias-variance balance in a favorable direction for the problem at hand.

### Regularization: explicitly penalizing complexity

~~~python
from sklearn.linear_model import Ridge  # L2 regularization
from sklearn.linear_model import Lasso  # L1 regularization

model = Ridge(alpha=1.0)  # alpha controls regularization strength
model.fit(X_train, y_train)
~~~

Regularization adds a penalty term to the loss function specifically discouraging overly large or complex model parameters, directly trading a small increase in bias for a (hopefully larger) decrease in variance — L2 (Ridge) shrinks weights smoothly toward zero; L1 (Lasso) can shrink some weights to EXACTLY zero, providing automatic feature selection.

### Cross-validation: a more robust performance estimate

~~~
K-fold cross-validation: split training data into K folds;
    train on K-1 folds, validate on the remaining fold; repeat
    K times, rotating which fold is held out; average the K
    validation scores for a more robust, less variance-prone
    performance estimate than a single train/validation split.
~~~

### Common classical ML algorithms and their core idea

~~~
Logistic regression: linear decision boundary for classification,
    via a sigmoid function mapping a linear combination to a probability.
Decision trees: a sequence of if/else splits on feature values,
    learned to best separate classes/predict a target.
Random forests: an ENSEMBLE of many decision trees, each trained
    on a random subset of data/features, averaging their
    predictions to reduce variance substantially.
Gradient boosting (XGBoost, LightGBM): an ensemble of trees
    built SEQUENTIALLY, each new tree correcting the previous
    ensemble's errors -- dominant for structured/tabular data.
Support Vector Machines (SVMs): find the decision boundary that
    maximizes the margin between classes.
k-means: an unsupervised algorithm partitioning data into K
    clusters by iteratively assigning points to the nearest
    cluster center and updating centers.
~~~
`,

  "advanced-concepts": `
### Evaluation metrics beyond accuracy

~~~
Accuracy: fraction of correct predictions -- MISLEADING under
    class imbalance (a 99%-negative dataset gets 99% accuracy
    by always predicting "negative," despite being useless).
Precision: of predicted positives, what fraction were actually
    positive -- important when false positives are costly.
Recall: of actual positives, what fraction were correctly
    identified -- important when false negatives are costly.
F1 score: harmonic mean of precision and recall, balancing both.
ROC-AUC: area under the ROC curve, measuring a classifier's
    ability to rank positive examples above negative ones
    across ALL possible classification thresholds.
~~~

Choosing the RIGHT metric for a specific business problem (not defaulting to accuracy) is a genuinely important, senior-level skill — a medical diagnosis model missing a genuine disease case (a false negative) is typically far more costly than a false alarm (a false positive), meaning recall should often be prioritized even at some cost to precision.

### The curse of dimensionality

~~~
As the number of input FEATURES grows, the volume of the
feature space grows exponentially, meaning training data
becomes exponentially SPARSER relative to that space -- models
need exponentially more data to reliably learn patterns in
high-dimensional spaces, a genuine, fundamental challenge
directly motivating dimensionality reduction techniques (PCA)
and, later, the representation-learning approach deep learning
takes (covered in the Deep Learning and Embeddings skills).
~~~

### Data leakage: a subtle, dangerous correctness bug

~~~
Data leakage occurs when information from OUTSIDE the training
data (often, inadvertently, from the test/validation set, or
from FUTURE data relative to what would genuinely be available
at prediction time) leaks into the training process, producing
an artificially inflated, misleadingly optimistic performance
estimate that will NOT hold up on genuinely new, real-world data.
~~~

A classic example: normalizing/scaling features using statistics (mean, standard deviation) computed across the ENTIRE dataset (including the test set) before splitting, rather than computing those statistics only from the training set and applying them to the test set — this subtly leaks test-set information into the training process.

### Feature engineering versus representation learning

~~~
Classical ML (pre-deep-learning): a human manually engineers
    FEATURES (transformations of raw data believed to be
    predictive), which the model then learns to weight/combine.
Deep learning: the model learns useful internal
    REPRESENTATIONS directly from raw(er) data, largely
    automating what used to require manual feature engineering
    -- covered in depth in the Deep Learning skill immediately
    following this one.
~~~
`,

  "internal-working": `
Tracing the core training loop underlying virtually all supervised ML, from linear regression to deep neural networks:

~~~mermaid
flowchart TB
    Init["Initialize model\nparameters (often randomly)"] --> Forward["Forward pass:\ncompute predictions\nfor a batch of training data"]
    Forward --> Loss["Compute LOSS:\nhow wrong are these\npredictions vs. actual labels?"]
    Loss --> Gradient["Compute GRADIENT:\nhow should each parameter\nchange to reduce loss?"]
    Gradient --> Update["Update parameters\n(a small step in the\ndirection reducing loss)"]
    Update --> Converged{"Converged /\nmax iterations reached?"}
    Converged -->|No| Forward
    Converged -->|Yes| Done["Final trained model"]
~~~

1. **Parameters start at some initial value** (often random for neural networks, or a closed-form solution for simple linear regression).
2. **The model makes predictions on a batch of training data** (the "forward pass"), using its current parameter values.
3. **A loss function quantifies the error** between these predictions and the actual known labels.
4. **An optimization algorithm (gradient descent, in most modern ML) computes how to adjust each parameter** to reduce this loss, then takes a small step in that direction.
5. **This loop repeats** many times, with the loss (ideally) decreasing each iteration, until the model converges to parameters that fit the training data well.

**Why this matters**: this exact loop — forward pass, loss computation, gradient computation, parameter update — is the SAME fundamental process underlying a simple linear regression, a random forest's individual trees, a deep neural network, AND a modern large language model (at a vastly larger scale) — understanding it here provides the conceptual foundation for every subsequent skill in this category.
`,

  architecture: `
A senior ML practitioner thinks about problem architecture in terms of choosing the right learning paradigm, deliberately managing the bias-variance tradeoff, and designing an evaluation strategy that will genuinely predict real-world performance.

### Choosing supervised, unsupervised, or a hybrid approach

~~~mermaid
flowchart TB
    Problem["A given ML problem"] --> Q1{"Do you have\nlabeled examples of\nthe desired output?"}
    Q1 -->|Yes| Supervised["Supervised learning"]
    Q1 -->|"No -- only\nraw, unlabeled data"| Q2{"Looking for structure/\ngroupings, not a\nspecific prediction?"}
    Q2 -->|Yes| Unsupervised["Unsupervised learning\n(clustering, dimensionality\nreduction)"]
    Q2 -->|"No -- learning\nthrough interaction/reward"| RL["Reinforcement learning"]
~~~

### Deliberately managing bias versus variance

~~~mermaid
flowchart LR
    Underfitting["Too much bias\n(underfitting)"] -->|"Add complexity,\nmore features, less\nregularization"| Balanced["Balanced fit"]
    Overfitting["Too much variance\n(overfitting)"] -->|"Add regularization,\nmore data, simpler\nmodel, cross-validation"| Balanced
~~~

A senior practitioner diagnoses which side of this tradeoff a model is currently on (by comparing training versus validation performance) BEFORE reaching for a specific remedy — adding model complexity to an already-overfitting model, or adding regularization to an already-underfitting one, makes the problem worse, not better.

### Designing an evaluation strategy that predicts real-world performance

~~~mermaid
flowchart TB
    Design["Evaluation design"] --> Metric["Choose a metric\nmatched to the ACTUAL\nbusiness cost of errors\n(not defaulting to accuracy)"]
    Design --> Split["Design train/val/test\nsplits that genuinely\nreflect how the model\nwill be used in production\n(e.g., time-based splits\nfor time-series data)"]
`,

  "data-flow": `
Tracing a labeled dataset's journey through the standard supervised ML workflow, from raw data to a deployed model's predictions:

~~~mermaid
sequenceDiagram
    participant RawData as Raw labeled data
    participant Split as Train/Val/Test split
    participant Training as Training loop
    participant Validation as Validation evaluation
    participant Test as Final test evaluation
    participant Production as Production predictions

    RawData->>Split: split into train/val/test
    Split->>Training: train set feeds\nthe training loop
    Training->>Validation: trained model evaluated\non validation set
    Validation->>Training: hyperparameters tuned\nbased on validation performance\n(repeat as needed)
    Training->>Test: FINAL model evaluated\nONCE on test set
    Test->>Production: deployed model makes\npredictions on genuinely\nnew, real-world data
~~~

The critical detail: the test set is touched only ONCE, at the very end, specifically to provide an honest, unbiased estimate of real-world performance — repeatedly evaluating on (and tuning based on) the test set would cause the same overfitting-to-evaluation-data problem that motivates the train/validation/test split in the first place, just one level higher.
`,

  "production-usage": `
### A representative scikit-learn classical ML pipeline

~~~python
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = RandomForestClassifier(n_estimators=200, max_depth=10)
cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="f1")

model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(classification_report(y_test, predictions))
~~~

### Non-negotiables for production ML systems

1. **Never evaluate on training data alone** — always hold out a genuinely unseen validation and test set.
2. **Choose an evaluation metric matched to the actual business cost of different error types**, not defaulting to accuracy.
3. **Guard explicitly against data leakage** — fit any data-dependent transformation (scaling, encoding) only on training data.
4. **Use cross-validation for a robust performance estimate**, especially with limited data.
5. **Account for class imbalance explicitly** (via appropriate metrics, resampling, or class weighting) rather than assuming a naive default handles it correctly.

### Common production patterns

- **Gradient-boosted trees (XGBoost/LightGBM)** as the dominant, highly reliable choice for structured/tabular business data (fraud detection, churn prediction, credit scoring).
- **Random forests** as a robust, low-maintenance baseline requiring comparatively little hyperparameter tuning.
- **A/B testing a new model against the current production model** before fully replacing it, verifying genuine real-world improvement.
`,

  "industry-examples": `
- **Netflix's recommendation system**: uses a combination of classical ML and deep learning techniques to predict user preferences from viewing history.
- **Credit scoring and fraud detection** across the financial industry: heavily reliant on gradient-boosted trees and logistic regression for their strong performance and interpretability on structured, tabular data.
- **Kaggle competitions**: consistently demonstrate that gradient-boosted tree ensembles (XGBoost, LightGBM) remain state-of-the-art for structured/tabular data problems, even in the deep learning era.
- **Spam filtering** (an early, foundational ML application): naive Bayes and logistic regression classifiers remain genuinely effective, illustrating that classical ML techniques are far from obsolete for well-suited problems.
`,

  "best-practices": `
1. **Always maintain a genuine train/validation/test split**, never evaluating final performance on data used during training or tuning.
2. **Choose evaluation metrics deliberately, matched to actual business costs**, not defaulting to accuracy under class imbalance.
3. **Diagnose bias versus variance explicitly** (comparing training and validation performance) before choosing a remedy.
4. **Use cross-validation** for a more robust performance estimate, particularly with limited training data.
5. **Guard against data leakage rigorously**, fitting any data-dependent transformation only on training data.
6. **Start with a simple baseline model** before reaching for more complex approaches, establishing a genuine performance floor to beat.
7. **Account for class imbalance explicitly**, via appropriate metrics, resampling, or class weighting.
8. **Prefer interpretable models (logistic regression, decision trees) when interpretability itself is a genuine business requirement**, not just raw predictive performance.
9. **Version datasets and model artifacts**, enabling reproducibility and rollback.
10. **Monitor deployed model performance continuously**, since real-world data distributions can drift over time (directly connecting to production AI monitoring concerns covered later in the platform).
`,

  "anti-patterns": `
### Evaluating a model on its own training data

~~~python
# WRONG — reports an overly optimistic, misleading
# performance estimate that won't hold on new data
model.fit(X, y)
print(model.score(X, y))  # evaluating on the SAME data trained on

# RIGHT — evaluate on genuinely held-out data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model.fit(X_train, y_train)
print(model.score(X_test, y_test))
~~~

### Data leakage via improper preprocessing order

~~~python
# WRONG — scaling statistics computed across the FULL dataset,
# including the test set, before splitting -- leaks test-set
# information into training
X_scaled = StandardScaler().fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)

# RIGHT — fit the scaler ONLY on training data, then apply
# (transform) that same fitted scaler to the test set
X_train, X_test, y_train, y_test = train_test_split(X, y)
scaler = StandardScaler().fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)
~~~

### Defaulting to accuracy under class imbalance

~~~
# WRONG — a fraud-detection model achieving "99.5% accuracy"
# on a dataset that's 99.5% non-fraud, by essentially always
# predicting "not fraud" -- a completely useless model
# RIGHT — use precision, recall, F1, or ROC-AUC, metrics that
# genuinely reflect performance on the minority (fraud) class
~~~

### Other production-grade anti-patterns

- **Adding model complexity to an already-overfitting model**, worsening variance rather than addressing the actual diagnosed problem.
- **Not using cross-validation with limited data**, relying on a single, potentially unrepresentative train/validation split.
- **Ignoring genuine feature/data distribution shift over time**, deploying a model once and never monitoring for degradation.
`,

  performance: `
### Rule zero: more/better data usually beats a fancier algorithm

For most real-world problems, obtaining more high-quality, representative training data typically improves performance more reliably than switching to a more sophisticated model architecture — a genuinely important, if sometimes underappreciated, practical lesson.

### The performance hierarchy (apply in order)

1. **Establish a simple baseline first**, providing a genuine floor to measure any added complexity against.
2. **Diagnose bias versus variance explicitly** before choosing a remedy (more data/regularization for variance; more complexity/features for bias).
3. **Use cross-validation for robust model/hyperparameter selection**, rather than a single validation split.
4. **Consider ensemble methods (random forests, gradient boosting)** for meaningfully better performance on structured data, at some cost to interpretability and training time.
5. **Profile actual training and inference time** for the chosen model class, verifying it fits genuine production latency/throughput requirements.

### Micro-level facts worth knowing

- Gradient-boosted trees generally outperform random forests on structured data but are more sensitive to hyperparameter tuning and can overfit more easily if not carefully regularized.
- Linear models (linear/logistic regression) train and predict extremely fast and remain genuinely competitive when the true relationship between features and target is approximately linear.
- k-fold cross-validation's computational cost scales linearly with K, a real, deliberate tradeoff between evaluation robustness and computation time.
`,

  scalability: `
Classical ML techniques generally scale differently than deep learning, directly motivating the platform's own progression toward the **Deep Learning** skill for genuinely large-scale, unstructured data problems.

### How classical ML approaches scaling

~~~mermaid
flowchart LR
    MoreData["Growing dataset size"] --> Q{"Structured/tabular\ndata, moderate scale?"}
    Q -->|Yes| ClassicalML["Classical ML\n(gradient boosting,\nrandom forests) scales well"]
    Q -->|"No -- massive,\nunstructured data\n(images, text, audio)"| DeepLearning["Deep learning's\nrepresentation-learning\napproach scales better\n(covered in Deep Learning skill)"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Classical ML's manual feature engineering not scaling to genuinely unstructured, high-dimensional data | Move to deep learning's automatic representation learning (covered in the **Deep Learning** skill) |
| Training time growing with dataset size for tree-based ensembles | Use a more scalable, parallelized implementation (LightGBM's histogram-based approach, for instance) |
| Curse of dimensionality limiting model quality with many features and limited data | Apply dimensionality reduction (PCA) or gather substantially more training data |
`,

  security: `
### ML models as a genuine attack surface

~~~
A production ML model is a legitimate attack surface: ADVERSARIAL
INPUTS specifically crafted to fool a model's predictions,
DATA POISONING attacks corrupting training data to degrade or
bias a model, and MODEL EXTRACTION attacks attempting to
reverse-engineer a proprietary model's behavior through
repeated queries are all genuine, documented concerns.
~~~

### Essential ML-related security practices

1. **Validate and sanitize input data at inference time**, treating model inputs as untrusted, directly connecting to the **OWASP Top 10** skill's own input-validation principles.
2. **Monitor for anomalous input distributions** that might indicate an adversarial attack or a genuine, concerning data drift.
3. **Protect training data pipelines** against poisoning, ensuring data provenance and integrity.
4. **Consider model access controls and rate limiting** for production model-serving endpoints, mitigating model-extraction risk.

See the **OWASP Top 10** skill for the broader security context this connects to, and the platform's later AI-specific safety skills (Guardrails, AI Red Teaming) for LLM-specific security concerns.
`,

  testing: `
### Testing model performance against a baseline

~~~python
def test_model_beats_naive_baseline():
    baseline_accuracy = majority_class_baseline(y_test)
    model_accuracy = model.score(X_test, y_test)
    assert model_accuracy > baseline_accuracy + 0.05  # meaningful improvement
~~~

### Testing for data leakage

~~~python
def test_no_overlap_between_train_and_test():
    train_ids = set(X_train.index)
    test_ids = set(X_test.index)
    assert train_ids.isdisjoint(test_ids)
~~~

### The senior testing doctrine

- Always test that a candidate model meaningfully outperforms a simple, naive baseline (majority class, mean prediction), not just that it "runs."
- Test explicitly for data leakage (train/test overlap, preprocessing fit only on training data).
- Use cross-validation results (not a single split) as the basis for model comparison decisions.
- Test model behavior on known edge cases and adversarial-style inputs, not just the typical validation distribution.
`,

  debugging: `
### The toolbox, in escalation order

1. **Compare training versus validation performance first** when a model underperforms, diagnosing bias (both poor) versus variance (training good, validation poor).
2. **Check for data leakage** if validation/test performance seems suspiciously, unrealistically good.
3. **Inspect the confusion matrix** (not just a single aggregate metric) to understand exactly which types of errors a classifier is making.
4. **Check for class imbalance and data distribution shift** if a deployed model's real-world performance diverges meaningfully from its validation-time performance.

### Debugging common ML-related symptoms

- "The model performs poorly on both training and test data" — likely underfitting; consider a more expressive model or better features.
- "The model performs great on training data but poorly on test data" — likely overfitting; consider regularization, more data, or a simpler model.
- "Validation performance seems unrealistically good" — check rigorously for data leakage in the preprocessing pipeline.
- "A deployed model's real-world performance has degraded over time" — check for data distribution shift between training data and current production inputs.
`,

  monitoring: `
### Key signals to track

- **Training versus validation loss curves**, the primary diagnostic for bias/variance issues during development.
- **Production prediction distribution and input feature distribution**, watching for drift relative to training-time distributions.
- **Business-relevant outcome metrics** (not just the model's own internal metric), verifying the model genuinely delivers real-world value.
- **Prediction latency and throughput**, ensuring production inference meets actual application requirements.

### Tools

Standard experiment-tracking tools (covered in depth in the platform's MLOps category) for logging training runs, metrics, and hyperparameters; scikit-learn's built-in evaluation utilities for classical ML; production monitoring dashboards for deployed model behavior.

### Alerting priorities

Alert on significant input/prediction distribution drift (a leading indicator of a model needing retraining), on business-outcome metrics diverging meaningfully from validation-time expectations, and on prediction latency exceeding acceptable production thresholds.
`,

  deployment: `
### A representative model deployment pattern

~~~python
import joblib

joblib.dump(model, "model_v1.joblib")

# In the serving application
model = joblib.load("model_v1.joblib")
predictions = model.predict(new_data)
~~~

### CI/CD pipeline considerations

Treat trained model artifacts as versioned, tracked outputs of a reproducible pipeline (data version, code version, hyperparameters all recorded), with automated evaluation against a held-out benchmark as a genuine deployment gate before a new model version replaces the current production model. See the **CI/CD** skill and the platform's MLOps category for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production ML model takes real predictions:

- [ ] Genuine train/validation/test split maintained throughout development, with the test set touched only once
- [ ] Evaluation metric chosen deliberately, matched to actual business error costs
- [ ] Data leakage explicitly checked for and ruled out
- [ ] Model meaningfully outperforms a simple, naive baseline
- [ ] Cross-validation used for model/hyperparameter selection where data is limited
- [ ] Class imbalance explicitly addressed if present
- [ ] Production input/prediction distribution monitoring in place
- [ ] Model artifact versioned and reproducible from tracked data/code/hyperparameters
`,

  "common-mistakes": `
1. **Evaluating a model on its own training data**, producing a misleadingly optimistic performance estimate.
2. **Data leakage via improper preprocessing order**, inflating validation/test performance unrealistically.
3. **Defaulting to accuracy under class imbalance**, masking genuinely poor performance on the minority class.
4. **Adding model complexity to an already-overfitting model**, worsening rather than fixing the diagnosed problem.
5. **Not using cross-validation with limited data**, relying on a potentially unrepresentative single split.
6. **Ignoring data distribution shift after deployment**, letting a model's real-world performance silently degrade.
7. **Choosing a model class based on popularity rather than genuine fit** for the problem's actual data characteristics.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Suspiciously high validation/test accuracy | Data leakage in preprocessing or feature engineering | Audit the pipeline for any data-dependent step fit on more than training data |
| Model performs poorly on both training and validation data | Underfitting — model or features too simple | Add model complexity, engineer better features, or reduce regularization |
| Model performs well on training, poorly on validation | Overfitting — model too complex relative to available data | Add regularization, gather more data, or simplify the model |
| High accuracy but poor real-world usefulness | Class imbalance masked by an inappropriate metric | Switch to precision/recall/F1/ROC-AUC matched to the actual problem |
| Real-world performance degrades after deployment | Data distribution shift between training and production | Monitor input distributions; retrain periodically on fresh data |
| Inconsistent cross-validation fold scores | High model variance, or a genuinely small/unrepresentative dataset | Investigate variance sources; consider more data or a more stable model class |
`,

  faqs: `
**What's the difference between supervised and unsupervised learning?**
Supervised learning learns a mapping from labeled input-output examples (predicting a known target); unsupervised learning finds structure (clusters, patterns) in data that has no labels at all.

**What is the bias-variance tradeoff?**
The fundamental tension between a model being too simple (high bias, underfitting) and too complex (high variance, overfitting) relative to the available training data — virtually every ML technique for improving performance works by shifting this balance favorably.

**Why can't I just use accuracy as my evaluation metric?**
Accuracy can be highly misleading under class imbalance — a model that always predicts the majority class can achieve very high accuracy while being completely useless for the minority class that's often the actual case of interest (fraud, disease, churn).

**What is data leakage, and why is it dangerous?**
When information from outside the legitimate training data (often the test set, or future information) inadvertently influences training, producing an artificially inflated performance estimate that won't hold on genuinely new, real-world data — a subtle, easy-to-introduce bug that can silently invalidate an entire evaluation.

**When should I use classical ML (like gradient boosting) instead of deep learning?**
For structured/tabular data (the kind that fits naturally into rows and columns, like a typical business database table), classical ML techniques (especially gradient-boosted trees) remain genuinely state-of-the-art and are generally easier to train, tune, and interpret than deep learning; deep learning's advantages are most pronounced for unstructured data (images, text, audio), covered in the **Deep Learning** skill.

**Why do I need a validation set if I already have a test set?**
The validation set is used for tuning hyperparameters and choosing among candidate models WITHOUT touching the test set — if you tuned based on test-set performance, the test set would no longer provide an honest, unbiased estimate of real-world performance, since you'd have implicitly "trained" on it through your tuning choices.
`,

  "interview-questions": `
### Junior level

1. **What is the difference between supervised and unsupervised learning?**
   Model answer: supervised learning uses labeled examples to learn a mapping to a known output; unsupervised learning finds structure in unlabeled data.

2. **What is overfitting?**
   Model answer: when a model learns the training data's noise and specific examples too closely, performing well on training data but poorly on new, unseen data.

3. **Why do we split data into training, validation, and test sets?**
   Model answer: training fits the model; validation tunes hyperparameters and selects models without touching the test set; the test set, used only once, provides an honest estimate of real-world performance.

4. **What is precision, and what is recall?**
   Model answer: precision is the fraction of predicted positives that were actually positive; recall is the fraction of actual positives that were correctly identified.

### Senior level

5. **Explain the bias-variance tradeoff precisely, and describe how you would diagnose which one is the dominant problem for an underperforming model.**
   Model answer: bias is systematic error from a model too simple to capture the true pattern (both training and validation performance are poor); variance is error from a model too sensitive to the specific training sample it saw (training performance is good, but validation performance is meaningfully worse) — diagnosing which is dominant requires comparing training and validation performance directly: a large gap between them (good training, poor validation) indicates high variance/overfitting, while both being poor indicates high bias/underfitting; the appropriate remedy differs entirely depending on this diagnosis, so it must be done explicitly before reaching for a fix.

6. **A fraud-detection model achieves 99.7% accuracy on a dataset where only 0.3% of transactions are actually fraudulent. Is this a good model? How would you properly evaluate it?**
   Model answer: this accuracy figure is almost certainly meaningless — a trivial model that always predicts "not fraud" would achieve 99.7% accuracy on this exact dataset while catching zero actual fraud, making it completely useless for the business's actual goal; proper evaluation requires metrics that specifically account for the minority (fraud) class — precision (of transactions flagged as fraud, how many actually were, relevant to the cost of investigating false alarms) and recall (of actual fraud transactions, how many were caught, relevant to the cost of missed fraud) computed specifically on the fraud class, likely combined into an F1 score or examined via a full precision-recall curve, since the business's actual tolerance for false positives versus false negatives should directly determine which specific classification threshold is chosen, not accuracy alone.

7. **Explain data leakage with a concrete example involving time-series data, and describe how you would design a train/test split to avoid it.**
   Model answer: for time-series data (e.g., predicting stock prices, or customer churn using historical behavior), a RANDOM train/test split can leak information from the future into training — a model might be trained on data from March while being evaluated on data from January, meaning at prediction time the model implicitly had access to patterns and information from AFTER the point it's meant to be predicting, which would never genuinely be available in real deployment; the correct approach is a TIME-BASED split, training only on data up to a certain cutoff date and evaluating only on data strictly after that cutoff, faithfully reproducing the actual temporal information constraint the model will face in real, live production use.

8. **When would you choose a gradient-boosted tree ensemble over a simple logistic regression for a tabular business dataset, and what tradeoffs are you accepting?**
   Model answer: choose gradient boosting when the true relationship between features and target is genuinely non-linear and involves complex feature interactions that a linear model's decision boundary fundamentally cannot capture, and when raw predictive performance is prioritized over model simplicity/interpretability; the tradeoffs accepted include reduced interpretability (a large tree ensemble's decision process is far harder to explain to a stakeholder than a logistic regression's individual feature coefficients), a real risk of overfitting if not carefully regularized (tree ensembles have many more effective degrees of freedom), longer training time, and generally more hyperparameters requiring careful tuning (number of trees, learning rate, tree depth, and others) — for problems where interpretability is a genuine business or regulatory requirement (e.g., certain credit-lending decisions), a simpler, more interpretable model may be preferred even at some cost to raw accuracy.

9. **How would you diagnose and fix an ML model whose production performance has degraded significantly since it was deployed, despite performing well during validation?**
   Model answer: first investigate whether the actual PRODUCTION INPUT DATA distribution has shifted meaningfully from the training data's distribution (a phenomenon commonly called data/concept drift) — comparing summary statistics or distributions of key input features between the original training data and recent production inputs is a natural first diagnostic step; if a meaningful shift is found, the standard remedy is retraining the model on more recent, representative data reflecting the current real-world distribution, ideally as part of an ongoing, monitored retraining cadence rather than a one-time fix; if input distributions appear stable but performance has still degraded, investigate whether the underlying real-world relationship between inputs and the target itself has changed (a genuinely different, harder problem than simple input drift, sometimes requiring a fundamentally different modeling approach or additional features capturing the new dynamics).

10. **Design an evaluation strategy for a churn-prediction model that will be used to decide which customers receive a costly retention offer.**
    Model answer: first clarify the actual business cost asymmetry — a false negative (missing a customer who was genuinely about to churn) costs the lost customer's future revenue, while a false positive (offering a costly retention incentive to a customer who wasn't actually going to churn) costs the incentive itself; this asymmetry should directly inform metric choice — likely optimizing for a specific point on the precision-recall curve (or a business-cost-weighted metric combining both) rather than a generic F1 score, tuned to the actual relative costs involved; use a TIME-BASED train/test split (since churn prediction is inherently a forward-looking, time-dependent problem) rather than a random split, to faithfully simulate genuine future prediction; and, ideally, validate the FINAL chosen model and threshold not just on a held-out historical test set but via a genuine A/B test in production (offering the retention incentive based on model predictions to one group while withholding it from a comparable control group), directly measuring the model's actual real-world business impact rather than relying solely on offline historical metrics.
`,

  "coding-questions": `
### 1. Implement k-fold cross-validation from scratch

~~~python
import numpy as np

def k_fold_cross_validate(X, y, model_fn, k=5):
    n = len(X)
    indices = np.arange(n)
    np.random.shuffle(indices)
    folds = np.array_split(indices, k)
    scores = []
    for i in range(k):
        val_idx = folds[i]
        train_idx = np.concatenate([folds[j] for j in range(k) if j != i])
        model = model_fn()
        model.fit(X[train_idx], y[train_idx])
        scores.append(model.score(X[val_idx], y[val_idx]))
    return np.mean(scores), np.std(scores)
# Follow-up: why report both the mean AND the standard deviation
# of the fold scores, rather than just the mean?
~~~

### 2. Implement precision, recall, and F1 from a confusion matrix

~~~python
def precision_recall_f1(true_positives, false_positives, false_negatives):
    precision = true_positives / (true_positives + false_positives)
    recall = true_positives / (true_positives + false_negatives)
    f1 = 2 * precision * recall / (precision + recall)
    return precision, recall, f1
# Follow-up: what happens to this function if true_positives is
# 0 (a model that never correctly predicts the positive class)?
# How would you handle this edge case safely?
~~~

### 3. Implement simple gradient descent for linear regression

~~~python
import numpy as np

def gradient_descent_linear_regression(X, y, lr=0.01, iterations=1000):
    m, n = X.shape
    weights = np.zeros(n)
    for _ in range(iterations):
        predictions = X @ weights
        errors = predictions - y
        gradient = (2 / m) * (X.T @ errors)
        weights -= lr * gradient
    return weights
# Follow-up: what would happen if the learning rate (lr) were
# set far too high, and how would you detect this happening
# during training just from the loss values?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build and evaluate a classical ML pipeline
Using scikit-learn, load a standard tabular dataset, implement a proper train/validation/test split, train a logistic regression and a random forest, and compare their performance using appropriate metrics. Deliverable: a documented comparison with justified metric choice. Skills exercised: basic ML workflow and evaluation.

### Lab 2 (Intermediate): Diagnose and fix overfitting
Deliberately train an overfitting model (e.g., a deep decision tree with no depth limit) on a small dataset, observe the training/validation performance gap, then apply regularization and cross-validation to improve generalization, documenting the before/after difference. Deliverable: a documented overfitting diagnosis and fix. Skills exercised: bias-variance diagnosis and regularization.

### Lab 3 (Advanced): Detect and fix data leakage
Given a deliberately leaky preprocessing pipeline (e.g., scaling fit on the full dataset before splitting), identify the leakage, quantify its impact on the reported performance metric, and fix the pipeline. Deliverable: a documented before/after comparison demonstrating leakage's impact. Skills exercised: data leakage detection and correction.

### Lab 4 (Production): Build a full evaluation strategy for an imbalanced classification problem
Given a genuinely imbalanced dataset (e.g., fraud or churn), design and implement an evaluation strategy using appropriate metrics (precision, recall, F1, ROC-AUC), handle the imbalance explicitly (via class weighting or resampling), and document the tradeoffs of your chosen classification threshold. Deliverable: a documented, justified evaluation and threshold-selection strategy. Skills exercised: applied metric selection and imbalance handling.
`,

  "real-projects": `
### 1. A customer churn prediction system with a time-based evaluation strategy
Engineering requirements: a gradient-boosted tree model trained on historical customer behavior, evaluated with a time-based train/test split, and a business-cost-weighted classification threshold.

### 2. A fraud detection pipeline with rigorous imbalance handling
Engineering requirements: precision/recall-based evaluation, explicit class-imbalance handling, and continuous production monitoring for data distribution drift.

### 3. A model comparison and selection framework
Engineering requirements: a reusable pipeline comparing multiple classical ML algorithms via cross-validation, selecting a final model based on a business-appropriate metric, with full leakage-guarding preprocessing.
`,

  "case-studies": `
### The "AI winter" following Minsky and Papert's perceptron limitations
Minsky and Papert's 1969 proof that single-layer perceptrons cannot learn non-linearly-separable functions (like XOR) significantly dampened neural network research funding and interest for over a decade, until backpropagation's popularization in 1986 provided a practical path to training multi-layer networks capable of overcoming this specific limitation. Lesson: a genuine, well-proven theoretical limitation of an early approach can meaningfully set back an entire research field's momentum, even when the limitation applies specifically to that early approach and not to the broader underlying idea (learning from data) itself.

### Kaggle competitions' consistent validation of gradient-boosted trees for tabular data
Across countless Kaggle competitions involving structured/tabular datasets, gradient-boosted tree implementations (XGBoost, then LightGBM) have repeatedly outperformed deep learning approaches, providing strong, repeated empirical evidence that classical ML techniques remain genuinely state-of-the-art for this specific data type, even as deep learning has become dominant for unstructured data. Lesson: a genuinely large, repeated body of empirical competitive evidence (rather than a priori assumption about "newer is always better") is the right basis for choosing an appropriate technique for a given data type.

### AlexNet's 2012 ImageNet win as deep learning's watershed moment
AlexNet's dramatic 2012 ImageNet competition win, using a deep convolutional neural network trained on GPUs, decisively demonstrated deep learning's superiority for image classification over the classical, hand-engineered-feature-based computer vision techniques that had dominated the field until then — directly launching the modern deep learning era covered in depth in the next skill. Lesson: a single, sufficiently dramatic and well-publicized demonstration of a new technique's superiority on a widely-recognized benchmark can rapidly and fundamentally shift an entire field's research and industry direction.
`,

  comparisons: `
| Aspect | Supervised Learning | Unsupervised Learning | Reinforcement Learning |
|--------|--------------------------|-----------------------------|------------------------------|
| Data requirement | Labeled examples | Unlabeled data | Interaction with an environment |
| Goal | Learn a mapping to a known output | Discover structure/patterns | Learn a policy maximizing reward |
| Example algorithms | Linear/logistic regression, random forests | k-means, PCA | Q-learning, policy gradients |

| Aspect | Classical ML (Gradient Boosting) | Deep Learning |
|--------|----------------------------------------|--------------------|
| Best fit | Structured/tabular data | Unstructured data (images, text, audio) |
| Feature engineering | Often manual | Largely automatic (representation learning) |
| Interpretability | Generally higher | Generally lower |
| Data/compute needs | Moderate | Often very large |

**How seniors choose**: default to classical ML (especially gradient-boosted trees) for structured/tabular business data, where it remains genuinely state-of-the-art and easier to train/interpret; reach for deep learning specifically for unstructured data or when automatic representation learning provides genuine, measurable benefit over manual feature engineering.
`,

  "related-technologies": `
- **Neural Networks** — the next skill in this category, covering the specific model architecture underlying deep learning.
- **Deep Learning** — the broader discipline of training deep (multi-layer) neural networks, covered in its own skill.
- **Data Structures** and **Algorithms** — foundational computer science concepts underlying efficient ML implementation.
- **Python** — the dominant language for practical ML work (scikit-learn, NumPy, pandas).
- **MLOps** category (covered later in the platform) — the operational discipline of deploying and maintaining ML systems in production.

Learning path: this page (Machine Learning) → **Neural Networks** → **Deep Learning** → **CNNs**/**RNNs**/**Transformers** for the increasingly specialized architectures covered next.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Gradient-boosted tree ensembles (XGBoost, LightGBM, CatBoost) remain the dominant, actively-recommended choice for structured/tabular data problems.
- Continued industry emphasis on rigorous evaluation methodology (proper train/test splits, appropriate metric selection, leakage prevention) as foundational, non-negotiable ML engineering practice.
- Growing integration of classical ML techniques alongside deep learning and LLM-based approaches within the same production systems, rather than one fully displacing the other.
- Given continued evolution in this space, verify current best-practice recommendations for specific algorithms/libraries against up-to-date documentation.
`,

  "future-roadmap": `
Where classical machine learning is heading, and what's worth betting career time on:

- **Continued relevance of classical ML for structured/tabular data**, unlikely to be displaced by deep learning for this specific data type.
- **Growing integration of classical ML with LLM-based systems** (e.g., using classical models for structured-data components of a broader AI system that also involves an LLM).
- **Continued emphasis on rigorous, business-aligned evaluation methodology** as a durable, foundational skill regardless of which specific algorithm or architecture is in use.
- **What to bet on**: deeply understanding the bias-variance tradeoff, proper evaluation methodology, and metric selection — these foundational concepts transfer directly to every subsequent skill in this category (including deep learning and LLMs), a far more durable investment than mastery of any single algorithm's current implementation.
`,

  "cheat-sheet": `
~~~
# ---- The three paradigms ----
Supervised:    learn mapping from labeled input -> output
Unsupervised:  find structure in unlabeled data
Reinforcement: learn a policy via reward signals from
                interacting with an environment
~~~

~~~
# ---- Bias-variance tradeoff ----
Underfitting (high bias): poor on BOTH train and validation
Overfitting (high variance): great on train, poor on validation
Fix bias: more complexity/features, less regularization
Fix variance: more data, more regularization, simpler model
~~~

~~~
# ---- Train / Validation / Test ----
Train:      fit model parameters
Validation: tune hyperparameters, select models
Test:       touch ONCE, at the end, for an honest estimate
~~~

~~~
# ---- Metrics beyond accuracy ----
Precision = TP / (TP + FP)   -- cost of false positives
Recall    = TP / (TP + FN)   -- cost of false negatives
F1        = harmonic mean of precision & recall
ROC-AUC   = ranking quality across ALL thresholds
# Accuracy is MISLEADING under class imbalance.
~~~

~~~
# ---- Classical algorithms, quick picks ----
Linear/logistic regression: fast, interpretable, linear boundary
Random forest:  robust baseline, low tuning needed
Gradient boosting (XGBoost/LightGBM): best for tabular data
SVM:            maximum-margin boundary
k-means:        unsupervised clustering
~~~

~~~
# ---- Data leakage: THE silent correctness bug ----
Fit scalers/encoders on TRAIN ONLY, then transform test.
Use TIME-BASED splits for time-series/temporal data.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Supervised vs unsupervised learning? | Supervised uses labeled examples; unsupervised finds structure with no labels. |
| What is the bias-variance tradeoff? | Tension between too-simple (underfit) and too-complex (overfit) models. |
| How do you diagnose overfitting? | Good training performance, meaningfully worse validation performance. |
| Why is accuracy misleading under class imbalance? | A trivial majority-class predictor can score high accuracy while being useless. |
| What is data leakage? | Info from outside training data (often test set) inadvertently influencing training. |
| Why use a validation set separate from the test set? | Tune/select models on validation; keep test set untouched for an honest final estimate. |
| Best classical algorithm for tabular data? | Gradient-boosted trees (XGBoost/LightGBM). |
| What does L1 regularization (Lasso) do differently from L2? | L1 can shrink weights to exactly zero (feature selection); L2 shrinks smoothly. |
| What is k-fold cross-validation? | Train/validate K times on rotating folds, average results for a robust estimate. |
| Fix for underfitting vs overfitting? | Underfitting: more complexity. Overfitting: more data/regularization/simpler model. |
`,

  mcqs: `
1. What is overfitting?
   A) A model too simple to capture patterns  B) A model that performs well on training data but poorly on new, unseen data  C) A model with too few parameters  D) A model that trains too quickly
   **Answer: B** — the model has essentially memorized training-specific noise rather than learning generalizable patterns.

2. Why is accuracy often a poor metric under class imbalance?
   A) Accuracy is never useful  B) A model always predicting the majority class can achieve high accuracy while being useless for the minority class  C) Accuracy is too hard to compute  D) Accuracy only works for regression
   **Answer: B** — precision, recall, F1, or ROC-AUC better reflect performance on the minority class of interest.

3. What is data leakage?
   A) A memory leak in training code  B) Information from outside the legitimate training data (often the test set) inadvertently influencing training, inflating performance estimates  C) A type of regularization  D) Missing data in the dataset
   **Answer: B** — a subtle bug that produces misleadingly optimistic evaluation results.

4. When should you use a time-based (rather than random) train/test split?
   A) Never  B) For time-series/temporal data, to faithfully simulate genuine future prediction without leaking future information into training  C) Only for image data  D) Always, regardless of data type
   **Answer: B** — a random split on temporal data can leak future information into the training set.

5. For structured/tabular business data, which technique generally performs best?
   A) Deep neural networks always  B) Gradient-boosted tree ensembles (XGBoost/LightGBM)  C) k-means clustering  D) Linear regression always
   **Answer: B** — consistently validated across many Kaggle competitions and industry benchmarks.
`,

  "revision-notes": `
Machine learning builds systems that improve at a task by learning patterns from DATA rather than explicit hand-coded rules — a model with adjustable PARAMETERS is fit to minimize a LOSS function measuring prediction error, via an optimization algorithm (most commonly gradient descent), and this same fundamental loop underlies everything from simple linear regression to modern large language models. The three broad paradigms are SUPERVISED learning (learning a mapping from labeled input-output examples), UNSUPERVISED learning (finding structure in unlabeled data), and REINFORCEMENT learning (learning a policy that maximizes reward through environment interaction).

The single most important theoretical concept is the BIAS-VARIANCE TRADEOFF: expected test error decomposes into bias (systematic error from a model too simple to capture the true pattern — UNDERFITTING, poor performance on both training and validation data), variance (error from a model too sensitive to its specific training sample — OVERFITTING, good training performance but meaningfully worse validation performance), and irreducible error (inherent data noise no model can eliminate). Virtually every practical ML improvement technique works by shifting this bias-variance balance favorably — REGULARIZATION (L1/Lasso can zero out weights entirely for automatic feature selection; L2/Ridge shrinks weights smoothly) trades a small bias increase for a hopefully larger variance decrease; more data generally reduces variance; more model complexity/features generally reduces bias.

The standard TRAIN/VALIDATION/TEST split exists specifically to obtain an honest performance estimate: training fits parameters, validation tunes hyperparameters and selects among models WITHOUT touching the test set, and the test set is used exactly ONCE at the end for an unbiased final estimate — repeatedly evaluating on (or tuning based on) the test set defeats its entire purpose. CROSS-VALIDATION (K-fold: train on K-1 folds, validate on the remaining fold, rotate and average) provides a more robust performance estimate than a single split, particularly valuable with limited data.

A critical, frequently-tested distinction: ACCURACY is often a misleading metric under CLASS IMBALANCE, since a model that always predicts the majority class can score very high accuracy while being completely useless for the minority class typically of actual interest (fraud, disease, churn) — PRECISION (of predicted positives, how many were correct — relevant when false positives are costly) and RECALL (of actual positives, how many were caught — relevant when false negatives are costly), combined into F1 or examined via ROC-AUC across all thresholds, are the appropriate alternatives, chosen deliberately based on the ACTUAL BUSINESS COST of each error type.

DATA LEAKAGE — when information from outside legitimate training data (commonly the test set, or genuinely future information relative to prediction time) inadvertently influences training — is a subtle, dangerous correctness bug producing an artificially inflated, misleading performance estimate; classic causes include fitting a scaler/encoder on the FULL dataset before splitting (rather than fitting only on training data and applying that same fit to test data), and using a RANDOM (rather than TIME-BASED) split for genuinely temporal/time-series data, which can leak future information into training.

Common CLASSICAL ML algorithms each have a distinct core idea: logistic regression (a linear decision boundary via a sigmoid function), decision trees (sequential if/else splits), random forests (an ensemble of many trees trained on random data/feature subsets, averaged to reduce variance), gradient boosting/XGBoost/LightGBM (trees built sequentially, each correcting the previous ensemble's errors — the dominant, actively-recommended choice for structured/tabular data even in the deep learning era, repeatedly validated across Kaggle competitions), SVMs (maximum-margin decision boundaries), and k-means (unsupervised clustering). DEEP LEARNING's key distinguishing advantage, covered in the next skill, is largely automating FEATURE ENGINEERING via learned REPRESENTATIONS directly from raw(er) data — most valuable for unstructured data (images, text, audio) where manual feature engineering is genuinely difficult, while classical ML (especially gradient boosting) remains the stronger, more interpretable, easier-to-train choice for structured/tabular data.

A senior ML practitioner establishes a simple baseline first, diagnoses bias versus variance explicitly BEFORE choosing a remedy, guards rigorously against data leakage, chooses evaluation metrics deliberately matched to actual business error costs (not defaulting to accuracy), and monitors deployed models continuously for real-world data distribution drift — this same disciplined evaluation methodology transfers directly to every subsequent, more advanced skill in this category, including deep learning and large language models.
`,

  "learning-roadmap": `
**Week 1 — Foundations**: understanding supervised/unsupervised/reinforcement learning and the train/validation/test workflow. Milestone: complete Lab 1, with a documented, justified classical ML comparison.

**Week 2 — Bias-variance mastery**: diagnosing and fixing overfitting and underfitting through regularization and cross-validation. Milestone: complete Lab 2, with a documented overfitting diagnosis and fix.

**Week 3 — Data leakage and evaluation rigor**: detecting and correcting data leakage, and choosing appropriate metrics for imbalanced problems. Milestone: complete Labs 3 and 4, with documented leakage correction and a justified imbalanced-classification evaluation strategy.

**Week 4 — Classical algorithm survey**: implementing and comparing logistic regression, random forests, and gradient boosting on a real dataset, building intuition for when each is the right choice.

Next platform skill once this roadmap is complete: **Neural Networks**, covering the specific model architecture underlying deep learning.
`,

  "official-docs": `
- **scikit-learn's official documentation** — the authoritative, comprehensive reference for classical ML algorithms and evaluation utilities in Python.
- **XGBoost and LightGBM official documentation** — authoritative references for the dominant gradient-boosting implementations.
- **Google's Machine Learning Crash Course** — a widely-used, accessible foundational reference for core ML concepts.
`,

  books: `
- **"An Introduction to Statistical Learning" — James, Witten, Hastie, Tibshirani** — the most widely-recommended, accessible foundational textbook for classical ML.
- **"The Elements of Statistical Learning" — Hastie, Tibshirani, Friedman** — a more mathematically rigorous companion/successor text.
- **"Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow" — Aurélien Géron** — a highly practical, code-focused introduction covering both classical ML and deep learning.
`,

  blogs: `
- **Google AI's official blog** — regularly publishes accessible explanations of ML concepts and research.
- **Sebastian Raschka's blog and newsletter** — widely respected, accessible technical writing on ML fundamentals and current research.
- **Towards Data Science (Medium publication)** — a large body of accessible, practitioner-written ML tutorials and explanations.
`,

  "research-papers": `
- **Rosenblatt, F. — "The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain"** (1958) — the foundational perceptron paper.
- **Rumelhart, D., Hinton, G., Williams, R. — "Learning Representations by Back-Propagating Errors"** (1986) — the paper popularizing backpropagation.
- **Breiman, L. — "Random Forests"** (2001) — the foundational random forest paper.
- **Chen, T. and Guestrin, C. — "XGBoost: A Scalable Tree Boosting System"** (2016) — the foundational XGBoost paper.
`,

  videos: `
- **Andrew Ng's Machine Learning course (Coursera/Stanford)** — one of the most widely-recommended, foundational ML courses ever produced.
- **StatQuest with Josh Starmer** — widely praised for clear, intuitive visual explanations of core ML and statistics concepts.
- **3Blue1Brown's neural network series** — exceptional visual intuition for the mathematical foundations directly relevant to this category.
`,

  "github-repos": `
- **scikit-learn/scikit-learn** — the official scikit-learn source repository.
- **dmlc/xgboost** — the official XGBoost source repository.
- **microsoft/LightGBM** — the official LightGBM source repository.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Paradigm identification**: given a described problem, identify whether it's genuinely supervised, unsupervised, or reinforcement learning.
2. **Bias-variance diagnosis**: given training and validation performance numbers, diagnose whether a model is underfitting or overfitting.
3. **Metric selection**: given a described business problem and its error-cost asymmetry, choose and justify an appropriate evaluation metric.
4. **Leakage detection**: given a described preprocessing pipeline, identify any data leakage and propose a fix.
5. **External practice sets**: Kaggle's "Titanic" and other beginner competitions for hands-on classical ML practice; "An Introduction to Statistical Learning" end-of-chapter exercises.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Data["Data"]
        RawData["Raw labeled/unlabeled data"]
    end
    subgraph Paradigms["Learning Paradigms"]
        Supervised["Supervised"]
        Unsupervised["Unsupervised"]
        RL["Reinforcement"]
    end
    subgraph Workflow["Standard ML Workflow"]
        Split["Train/Val/Test Split"]
        Training["Training Loop"]
        Evaluation["Evaluation (metrics)"]
    end
    subgraph Algorithms["Classical Algorithms"]
        LinearModels["Linear/Logistic Regression"]
        Trees["Decision Trees / Random Forests"]
        Boosting["Gradient Boosting"]
    end
    RawData --> Paradigms
    Supervised --> Split --> Training --> Evaluation
    Training --> Algorithms
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Machine Learning))
    Foundations
      Overview
      History perceptron backprop AlexNet
      Why it exists
      Problem it solves
    Paradigms
      Supervised
      Unsupervised
      Reinforcement
    Core Theory
      Bias variance tradeoff
      Overfitting underfitting
      Regularization
      Cross validation
    Evaluation
      Train val test split
      Accuracy precision recall F1
      ROC AUC
      Data leakage
    Classical Algorithms
      Linear logistic regression
      Decision trees
      Random forests
      Gradient boosting
      SVM
      K means
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default machineLearning;
