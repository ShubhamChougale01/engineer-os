import type { CheatSheetData } from "./types";

const neuralNetworks: CheatSheetData = {
  title: "The Ultimate Neural Networks Cheat Sheet",
  subtitle: "Neurons · forward pass · activations · backprop · initialization · production",
  sections: [
    {
      title: "Core Building Blocks",
      color: "violet",
      rows: [
        { term: "Neuron", desc: "Weighted sum of inputs plus a bias, passed through an activation", code: "z = w @ x + b\na = activation(z)" },
        { term: "Weight (W)", desc: "Learned scale on an input's contribution; the primary trainable parameter", code: "W.shape = (n_in, n_out)" },
        { term: "Bias (b)", desc: "Shifts the decision boundary independent of inputs; never initialize to a problem, safe at zero", code: "b = np.zeros(n_out)" },
        { term: "Perceptron", desc: "Single neuron with a step activation; the original 1958 model", code: "step(z) = 1 if z >= 0 else 0" },
        { term: "XOR limitation", desc: "A single perceptron cannot separate XOR — not linearly separable", code: "(0,0)->0 (0,1)->1\n(1,0)->1 (1,1)->0" },
        { term: "MLP (multi-layer perceptron)", desc: "Stack of layers; hidden layers reshape input space before final cut", code: "input -> hidden(s) -> output" },
        { term: "Universal approximation", desc: "Wide-enough single hidden layer can approximate any continuous function on a bounded domain (existence proof, not a training guarantee)", code: "# no code — a theorem" },
        { term: "Biological analogy limits", desc: "Loose historical inspiration only; real neurons spike in time, rewire, use biochemistry; backprop has no known biological equivalent", code: "# term is historical, not literal" },
        { term: "Depth vs width", desc: "Depth composes simpler features layer by layer; usually trains/generalizes better than pure width", code: "deep+narrow > shallow+very-wide (practice)" },
      ],
    },
    {
      title: "Forward Propagation",
      color: "blue",
      rows: [
        { term: "One layer", desc: "Affine transform then nonlinearity, repeated per layer", code: "z = a_prev @ W + b\na = activation(z)" },
        { term: "Why nonlinearity is required", desc: "Stacked linear layers collapse into ONE linear layer without it", code: "linear(linear(x)) == linear(x)" },
        { term: "Matrix shapes", desc: "Batch convention: rows = examples, columns = features", code: "X: (batch, n_in)\nW: (n_in, n_out)\nb: (n_out,)" },
        { term: "Worked numeric example", desc: "2 inputs -> 2 hidden -> 1 output, sigmoid throughout", code: "z1 = W1@x + b1; a1 = sigmoid(z1)\nz2 = W2@a1 + b2; a2 = sigmoid(z2)" },
        { term: "Logits", desc: "Raw pre-activation output scores before softmax/sigmoid", code: "logits = W_out @ a_last + b_out" },
        { term: "Parameter count", desc: "Roughly proportional to compute cost per layer", code: "params = n_in * n_out + n_out" },
      ],
    },
    {
      title: "Activations & Losses",
      color: "emerald",
      rows: [
        { term: "Step", desc: "Historical only — zero gradient everywhere, unusable for training", code: "1 if z >= 0 else 0" },
        { term: "Sigmoid", desc: "Squashes to (0,1); binary output layer; saturates -> vanishing gradients in deep hidden stacks", code: "1 / (1 + np.exp(-z))" },
        { term: "Tanh", desc: "Squashes to (-1,1), zero-centered; still saturates; common in RNN gates", code: "np.tanh(z)" },
        { term: "ReLU", desc: "max(0, z); default hidden-layer choice; non-saturating for z>0; can 'die'", code: "np.maximum(0, z)" },
        { term: "Leaky ReLU / GELU / Swish", desc: "Small negative slope (or smooth variants) to avoid dead neurons", code: "np.where(z>0, z, 0.01*z)" },
        { term: "Softmax", desc: "Output layer only, multi-class; turns logits into a probability distribution", code: "e = np.exp(z - z.max())\ne / e.sum()" },
        { term: "MSE", desc: "Regression + linear output; penalizes error quadratically", code: "np.mean((y - pred) ** 2)" },
        { term: "Binary cross-entropy", desc: "Binary classification + sigmoid output; matched gradient simplifies to (pred - y)", code: "-mean(y*log(p) + (1-y)*log(1-p))" },
        { term: "Categorical cross-entropy", desc: "Multi-class + softmax output", code: "-mean(sum(y_onehot * log(p), axis=-1))" },
        { term: "Activation/task decision table", desc: "Match layer role to activation", code: "hidden: ReLU/GELU\nbinary out: sigmoid+BCE\nmulticlass out: softmax+CCE\nregression out: linear+MSE" },
      ],
    },
    {
      title: "Backpropagation & Training",
      color: "amber",
      rows: [
        { term: "Backprop, one line", desc: "Chain rule applied layer by layer, output back to input", code: "dL/dW = dL/da * da/dz * dz/dW" },
        { term: "Output-layer gradient (sigmoid/softmax + matched loss)", desc: "Simplifies cleanly — large gradient when confidently wrong", code: "dz_out = (pred - y_true) / batch_size" },
        { term: "Propagate to previous layer", desc: "Push the error back through this layer's weights", code: "da_prev = dz @ W.T\ndz_prev = da_prev * act_deriv(a_prev)" },
        { term: "Weight/bias gradient", desc: "Outer product with the previous layer's activation", code: "dW = a_prev.T @ dz\ndb = dz.sum(axis=0)" },
        { term: "Gradient descent step", desc: "Nudge parameters opposite the gradient", code: "W -= lr * dW\nb -= lr * db" },
        { term: "Gradient checking", desc: "Numerically verify a hand-written backward pass", code: "(f(w+eps) - f(w-eps)) / (2*eps)" },
        { term: "Overfit-a-tiny-batch", desc: "Sanity check before any real training run", code: "train on 8 examples;\nloss should -> ~0" },
        { term: "Vanishing gradients", desc: "Many local derivatives < 1 multiplied across depth -> early layers stop learning", code: "cause: saturated sigmoid/tanh, deep stacks" },
        { term: "Exploding gradients", desc: "Many local derivatives > 1 multiplied across depth -> loss becomes NaN", code: "cause: poor weight scale, no clipping" },
        { term: "Gradient clipping", desc: "Cap gradient norm to prevent explosion", code: "clip_grad_norm_(params, max_norm=1.0)" },
        { term: "Adam optimizer", desc: "Adaptive per-parameter learning rate + momentum; default choice over plain SGD", code: "torch.optim.Adam(params, lr=0.01)" },
      ],
    },
    {
      title: "Initialization & Pitfalls",
      color: "rose",
      rows: [
        { term: "Zero-init failure", desc: "Every neuron in a layer identical forever — symmetry never breaks", code: "W = np.zeros((n_in, n_out))  # WRONG" },
        { term: "Xavier / Glorot init", desc: "For sigmoid/tanh; keeps activation variance roughly constant across layers", code: "randn(n_in,n_out) * sqrt(1/n_in)" },
        { term: "He init", desc: "For ReLU; double variance since ReLU zeroes ~half its inputs", code: "randn(n_in,n_out) * sqrt(2/n_in)" },
        { term: "Loss/activation mismatch", desc: "MSE vs softmax = poorly-scaled gradients; always match the pair", code: "softmax -> CCE, not MSE" },
        { term: "Forgetting optimizer.zero_grad()", desc: "PyTorch accumulates gradients across steps silently", code: "opt.zero_grad(); loss.backward(); opt.step()" },
        { term: "Unnormalized inputs", desc: "Wildly different feature scales destabilize early training", code: "x = (x - mean) / std" },
        { term: "Dying ReLU", desc: "Neuron stuck outputting zero forever, gradient also zero", code: "fix: leaky ReLU, lower lr, re-init" },
        { term: "is vs literal biology", desc: "Don't import neuroscience intuitions (sample efficiency, rewiring) onto trained networks", code: "# analogy is historical only" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "PyTorch layer", desc: "Linear layer + activation, framework-native autograd", code: "nn.Linear(n_in, n_out)\nnn.ReLU()  nn.Sigmoid()" },
        { term: "Training step (PyTorch)", desc: "Standard zero/forward/backward/step loop", code: "opt.zero_grad()\nloss = loss_fn(model(x), y)\nloss.backward(); opt.step()" },
        { term: "Save/load weights safely", desc: "Avoid pickle RCE risk on untrusted checkpoints", code: "torch.save(model.state_dict(), 'w.pt')\nload_state_dict(torch.load(f, weights_only=True))" },
        { term: "Eval mode", desc: "Disable dropout/batchnorm training behavior at inference", code: "model.eval()" },
        { term: "Mixed precision", desc: "float16/bfloat16 training; ~2-3x throughput, minor accuracy cost", code: "torch.cuda.amp.autocast()" },
        { term: "Monitoring signals", desc: "Watch these beyond just the loss curve", code: "grad_norm, activation stats,\ntrain/val loss gap, pred drift" },
        { term: "Debugging escalation", desc: "Order to check when training breaks", code: "shapes -> overfit-tiny-batch ->\nactivation/grad stats -> loss/activation match" },
        { term: "Composes into", desc: "This MLP core, specialized by structure", code: "CNN: convolution\nRNN: recurrence\nTransformer: attention + FFN" },
      ],
    },
  ],
};

export default neuralNetworks;
