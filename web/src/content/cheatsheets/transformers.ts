import type { CheatSheetData } from "./types";

const transformers: CheatSheetData = {
  title: "The Ultimate Transformers Cheat Sheet",
  subtitle: "Self-attention · multi-head attention · encoder/decoder families · production serving",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Self-attention", desc: "Every token looks at every other token and weighs relevance", code: "scores = Q @ K.T / sqrt(d)\nweights = softmax(scores)\nout = weights @ V" },
        { term: "Query (Q)", desc: "What this token is looking for", code: "Q = X @ W_q" },
        { term: "Key (K)", desc: "What this token offers, for matching", code: "K = X @ W_k" },
        { term: "Value (V)", desc: "The information blended in once matched", code: "V = X @ W_v" },
        { term: "Scaling factor", desc: "Divide scores by sqrt(head_dim) to stop softmax saturating", code: "scores = (Q @ K.T) / (head_dim ** 0.5)" },
        { term: "Softmax", desc: "Turns scores into a probability distribution over positions", code: "weights = softmax(scores, dim=-1)\n# rows sum to 1" },
        { term: "Parallelizable training", desc: "No step-by-step recurrence -> whole sequence attends in one batched op", code: "# RNN: h_t depends on h_(t-1)  -- sequential\n# Transformer: attention(X) -- parallel" },
        { term: "Positional encoding", desc: "Attention is order-blind; add position info explicitly", code: "x = token_embedding + positional_encoding" },
        { term: "Multi-head attention", desc: "Several attention 'views' in parallel subspaces, then concatenated", code: "heads = [attn(Qi, Ki, Vi) for i in range(H)]\nout = concat(heads) @ W_o" },
      ],
    },
    {
      title: "Block Structure",
      color: "blue",
      rows: [
        { term: "Transformer block", desc: "Attention sublayer + feedforward sublayer, each wrapped in residual + norm", code: "x = x + Attn(LayerNorm(x))\nx = x + FFN(LayerNorm(x))" },
        { term: "Residual connection", desc: "Skip connection gives gradients a direct path through deep stacks", code: "out = sublayer(x) + x" },
        { term: "Layer normalization", desc: "Normalizes activations per token across the feature dim", code: "LayerNorm(x): (x - mean) / std * gamma + beta" },
        { term: "Pre-norm vs post-norm", desc: "Pre-norm (normalize before sublayer) trains more stably at depth", code: "pre:  x + f(norm(x))\npost: norm(x + f(x))" },
        { term: "Feedforward sublayer", desc: "Per-token independent transform; usually 4x embed_dim hidden size", code: "FFN(x) = Linear2(GELU(Linear1(x)))" },
        { term: "Causal mask", desc: "Blocks attention to future positions (decoder-only)", code: "mask = tril(ones(seq_len, seq_len))\nscores = scores.masked_fill(mask==0, -inf)" },
        { term: "Padding mask", desc: "Blocks attention to padding tokens in a batch", code: "scores = scores.masked_fill(pad_mask==0, -inf)" },
        { term: "Cross-attention", desc: "Decoder queries attend to encoder's keys/values (encoder-decoder models)", code: "Q from decoder, K/V from encoder output" },
      ],
    },
    {
      title: "Architecture Families",
      color: "emerald",
      rows: [
        { term: "Encoder-only (BERT-style)", desc: "Bidirectional attention, masked-LM pretraining", code: "use: classification, embeddings, retrieval" },
        { term: "Decoder-only (GPT-style)", desc: "Causal attention, next-token-prediction pretraining", code: "use: chat, generation, in-context learning" },
        { term: "Encoder-decoder", desc: "Bidirectional encoder + causal decoder + cross-attention", code: "use: translation, summarization" },
        { term: "Masked language modeling", desc: "Predict masked tokens using full bidirectional context", code: "input: 'The [MASK] sat' -> predict 'cat'" },
        { term: "Next-token prediction", desc: "Predict the next token given only prior tokens", code: "input: 'The cat' -> predict 'sat'" },
        { term: "Tokenization", desc: "Text -> subword tokens -> embedding lookup (see LLM Fundamentals)", code: "ids = tokenizer.encode(text)\nx = embedding(ids)" },
        { term: "Sinusoidal positional encoding", desc: "Fixed sin/cos function of position, no learned params", code: "pe[:,0::2] = sin(pos / 10000^(2i/d))\npe[:,1::2] = cos(pos / 10000^(2i/d))" },
        { term: "Learned / RoPE positions", desc: "Learned table, or relative rotary encoding (extrapolates better)", code: "# RoPE rotates Q/K by a position-dependent angle" },
      ],
    },
    {
      title: "PyTorch Idioms",
      color: "amber",
      rows: [
        { term: "Toy attention", desc: "Minimal working scaled dot-product attention", code: "scores = q @ k.transpose(-2,-1) / d**0.5\nw = F.softmax(scores, dim=-1)\nout = w @ v" },
        { term: "nn.MultiheadAttention", desc: "Built-in production-grade multi-head attention", code: "attn = nn.MultiheadAttention(embed_dim, num_heads,\n  batch_first=True)\nout, _ = attn(x, x, x, attn_mask=mask)" },
        { term: "nn.LayerNorm", desc: "Built-in layer normalization", code: "norm = nn.LayerNorm(embed_dim)" },
        { term: "nn.Embedding", desc: "Token id -> learned vector lookup", code: "emb = nn.Embedding(vocab_size, embed_dim)\nx = emb(token_ids)" },
        { term: "Full block", desc: "Attention + FFN, residual + pre-norm", code: "x = x + attn(norm1(x), mask)\nx = x + ffn(norm2(x))" },
        { term: "Causal mask helper", desc: "Lower-triangular boolean mask", code: "mask = torch.tril(torch.ones(n, n)).bool()" },
        { term: "Inference mode", desc: "Disable gradient tracking for serving", code: "model.eval()\nwith torch.no_grad():\n    out = model(**inputs)" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Forgetting the scale factor", desc: "Unscaled scores saturate softmax -> vanishing gradients", code: "# WRONG: scores = q @ k.T\n# RIGHT: scores = q @ k.T / d**0.5" },
        { term: "Missing positional encoding", desc: "Model becomes blind to token order entirely", code: "# WRONG: x = embedding(ids)\n# RIGHT: x = embedding(ids) + pos_encoding" },
        { term: "Tokenizer/model mismatch", desc: "Silently wrong inputs, no error thrown, garbage output", code: "# tokenizer and model must be the exact matched pair" },
        { term: "Missing attention mask on padding", desc: "Padded tokens leak into real attention", code: "# WRONG: model(input_ids)\n# RIGHT: model(input_ids, attention_mask=mask)" },
        { term: "Ignoring context-length limit", desc: "Truncation discovered in production, not before", code: "# count tokens BEFORE sending the request" },
        { term: "Quadratic cost surprise", desc: "Doubling sequence length ~4x's attention compute/memory", code: "cost ~ O(seq_len^2)" },
        { term: "Assuming attention = memory", desc: "Model only sees what's in the current context window", code: "# nothing persists between calls unless re-included" },
        { term: "Post-norm at high depth", desc: "Can destabilize training; pre-norm is the modern default", code: "# prefer: x + f(norm(x))" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "KV cache", desc: "Reuse past keys/values -> O(1) per new generated token", code: "# without cache: recompute full attention every token\n# with cache: append + reuse" },
        { term: "Time-to-first-token", desc: "Prompt processing latency (parallel, one pass)", code: "TTFT = time(prompt_in -> first_token_out)" },
        { term: "Time-per-token", desc: "Generation latency (sequential, one step per token)", code: "latency_per_token = total_gen_time / n_tokens" },
        { term: "Continuous batching", desc: "Serving engines (vLLM, TGI) batch requests dynamically for throughput", code: "# use a serving engine, don't hand-roll batching" },
        { term: "Mixed precision inference", desc: "bf16/fp16 halves memory bandwidth, minimal quality loss", code: "model.half()  # or bf16 via autocast" },
        { term: "Context utilization metric", desc: "Fraction of context window used per request", code: "util = (input_tokens + output_tokens) / context_window" },
        { term: "Streaming output", desc: "Send tokens to client as generated, not all at once", code: "for token in model.generate_stream(prompt):\n    yield token" },
        { term: "Safe weight loading", desc: "Prefer safetensors over pickle-based checkpoints", code: "from safetensors.torch import load_file\nweights = load_file('model.safetensors')" },
        { term: "Prompt-injection awareness", desc: "No architectural separation between instructions and data", code: "# treat all context-window content as untrusted input" },
      ],
    },
  ],
};

export default transformers;
