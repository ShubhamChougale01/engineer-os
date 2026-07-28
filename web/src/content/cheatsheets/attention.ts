import type { CheatSheetData } from "./types";

const attention: CheatSheetData = {
  title: "The Ultimate Attention Cheat Sheet",
  subtitle: "Query-Key-Value · scaled dot-product · multi-head · causal masking · cost",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Attention (plain English)", desc: "Dynamically weight which input parts matter most for each output", code: "score(query, key) -> weight\noutput = weighted sum of values" },
        { term: "Query (Q)", desc: "What the current position is looking for", code: "Q = x @ W_q" },
        { term: "Key (K)", desc: "What each position advertises about its content", code: "K = x @ W_k" },
        { term: "Value (V)", desc: "The actual content returned, weighted by relevance", code: "V = x @ W_v" },
        { term: "Why not one fixed vector?", desc: "Early seq2seq compressed the whole input into 1 vector - info bottleneck", code: "old: encoder -> 1 vector -> decoder\nnew: decoder looks at ALL positions" },
        { term: "Compatibility score", desc: "Dot product between a query and a key", code: "score = Q @ K.T" },
        { term: "Softmax", desc: "Turns scores into a probability distribution (sums to 1)", code: "weights = softmax(scores, dim=-1)" },
        { term: "Weighted sum", desc: "Final attention output per query position", code: "output = weights @ V" },
        { term: "Self-attention", desc: "Q, K, V all come from the SAME sequence", code: "self_out = attn(x, x, x)" },
        { term: "Cross-attention", desc: "Q from one sequence, K/V from a DIFFERENT one", code: "cross_out = attn(decoder_q, encoder_k, encoder_v)" },
      ],
    },
    {
      title: "The Formula, Worked",
      color: "blue",
      rows: [
        { term: "Scaled dot-product attention", desc: "The complete formula", code: "Attention(Q,K,V) =\n  softmax(Q@K.T / sqrt(d_k)) @ V" },
        { term: "Why scale by sqrt(d_k)", desc: "Dot product variance grows with d_k; unscaled scores push softmax into a peaked, near-zero-gradient regime", code: "scores = Q @ K.T / math.sqrt(d_k)" },
        { term: "Toy numeric example", desc: "3 keys, 1 query, hand-traceable", code: "scores = keys @ q          # [0.9, 0.1, 0.2]\nweights = softmax(scores)   # mostly on 1st key\noutput = weights @ values" },
        { term: "Numerical stability trick", desc: "Subtract max before exponentiating", code: "ex = np.exp(x - x.max())\nweights = ex / ex.sum()" },
        { term: "Shape of the score matrix", desc: "All-pairs comparison: every query vs every key", code: "scores.shape == (seq_q, seq_k)" },
        { term: "Attention output shape", desc: "Same shape as Value, one row per query position", code: "output.shape == (seq_q, d_v)" },
        { term: "Permutation invariance", desc: "Raw attention has no sense of order by itself", code: "shuffle input -> outputs shuffle too\n# position added separately (pos. encodings)" },
      ],
    },
    {
      title: "Multi-Head & Causal Masking",
      color: "emerald",
      rows: [
        { term: "Multi-head, the 5 steps", desc: "Project, split, attend per head, concat, project", code: "1 project full Q,K,V\n2 split into h heads\n3 attention per head (parallel)\n4 concat heads\n5 final W_o projection" },
        { term: "Split heads", desc: "Reshape into (batch, heads, seq, d_k)", code: "x.view(b, seq, h, d_k).transpose(1,2)" },
        { term: "Combine heads", desc: "Inverse of split - must round-trip exactly", code: "x.transpose(1,2).reshape(b, seq, h*d_k)" },
        { term: "Head dimension rule", desc: "d_model must divide evenly by num_heads", code: "assert d_model % num_heads == 0\nd_k = d_model // num_heads" },
        { term: "Causal (masked) attention", desc: "Prevents seeing future tokens - required for GPT-style generation", code: "mask = torch.tril(torch.ones(n, n))\n# lower triangle = allowed" },
        { term: "Applying the mask", desc: "Set disallowed scores to -inf BEFORE softmax, never after", code: "scores.masked_fill(mask==0, float('-inf'))\nweights = softmax(scores)" },
        { term: "Encoder vs decoder masking", desc: "Encoder: bidirectional, no mask. Decoder: causal mask on self-attn", code: "BERT-style: full attention\nGPT-style: triangular mask" },
        { term: "Padding mask", desc: "Ignore padded tokens in a batch of variable-length sequences", code: "combined_mask = causal_mask & padding_mask" },
      ],
    },
    {
      title: "Cost, Scale & Inference",
      color: "amber",
      rows: [
        { term: "Compute cost", desc: "Quadratic in sequence length", code: "O(n^2 * d) time\ndoubling n -> ~4x compute" },
        { term: "Naive memory cost", desc: "Full score matrix materialized", code: "O(n^2) memory per head per layer" },
        { term: "Why long context is expensive", desc: "All-pairs comparison scales quadratically - the core scalability challenge", code: "n=1k -> 1M score entries\nn=100k -> 10B score entries" },
        { term: "KV-cache", desc: "Cache past K/V so generation only computes the newest token's K/V", code: "k_cache = cat([k_cache, new_k], dim=seq)\nv_cache = cat([v_cache, new_v], dim=seq)" },
        { term: "Why KV-cache works", desc: "Causal masking guarantees past K/V never depend on future tokens", code: "# no need to recompute prefix each step" },
        { term: "Grouped/multi-query attention", desc: "Share K/V heads across Q heads to shrink KV-cache memory", code: "MQA: 1 shared K/V head\nGQA: a few shared K/V head groups" },
        { term: "Fused kernels", desc: "Same math, avoids materializing full O(n^2) score matrix in memory", code: "F.scaled_dot_product_attention(\n  q, k, v, is_causal=True)" },
        { term: "Efficient attention research (hedge)", desc: "Sparse / linear / windowed variants exist to cut quadratic cost - active area, no single settled winner", code: "# verify current adoption/benchmarks\n# before citing a specific technique" },
      ],
    },
    {
      title: "Gotchas & Debugging",
      color: "rose",
      rows: [
        { term: "Forgetting the scale factor", desc: "Unscaled dot products -> peaked softmax -> vanishing gradients", code: "WRONG: Q @ K.T\nRIGHT: Q @ K.T / sqrt(d_k)" },
        { term: "Masking after softmax", desc: "Breaks the sum-to-1 property; renormalization needed", code: "WRONG: softmax(scores) * mask\nRIGHT: mask scores with -inf THEN softmax" },
        { term: "Wrong softmax axis", desc: "Must normalize over the KEY dimension", code: "softmax(scores, dim=-1)  # over keys" },
        { term: "All-masked row -> NaN", desc: "A query with zero valid keys produces NaN after softmax", code: "# ensure every query can attend to\n# at least itself" },
        { term: "Verify weights sum to 1", desc: "Quick sanity check for a correct implementation", code: "torch.allclose(weights.sum(-1),\n  torch.ones_like(weights.sum(-1)))" },
        { term: "Sanity-check against reference", desc: "Compare a custom implementation to PyTorch's built-in", code: "F.scaled_dot_product_attention(q,k,v)" },
        { term: "Attention-weight over-interpretation", desc: "Weights are a partial diagnostic signal, not a full causal explanation", code: "# treat visualizations as one clue,\n# not proof of model reasoning" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Fused SDPA (PyTorch)", desc: "Auto-dispatches to a memory-efficient kernel when possible", code: "import torch.nn.functional as F\nF.scaled_dot_product_attention(q, k, v)" },
        { term: "FlashAttention-family kernels", desc: "IO-aware; avoids materializing the full score matrix on GPU", code: "# same math, far less memory traffic" },
        { term: "Profiling attention cost", desc: "Confirm attention is actually the bottleneck before optimizing", code: "torch.profiler.profile(... profile_memory=True)\ntorch.cuda.max_memory_allocated()" },
        { term: "Serving frameworks", desc: "Manage KV-cache memory across concurrent requests", code: "# e.g. paged KV-cache allocators\n# in dedicated inference servers" },
        { term: "Context-length budgeting", desc: "Size max context to real product needs, not the model max", code: "max_context_length = smallest value\n  covering real requirements" },
        { term: "Attention entropy monitoring", desc: "Rough health signal - near-zero entropy can mean collapsed attention", code: "entropy = -(w * (w+eps).log()).sum(-1)" },
        { term: "Related platform skills", desc: "Where to go next", code: "Transformers -> full architecture\nEmbeddings -> what Q/K/V project from\nVector Search -> similarity at scale" },
      ],
    },
  ],
};

export default attention;
