import type { CheatSheetData } from "./types";

const rnnCheatSheet: CheatSheetData = {
  title: "RNNs",
  subtitle: "Recurrent networks for sequences",
  sections: [
    {
      title: "Core Idea",
      color: "violet",
      rows: [
        {
          term: "Hidden state update",
          desc: "Same weights reused at every time step",
          code: "h_t = tanh(Wx @ x_t + Wh @ h_{t-1} + b)",
        },
        { term: "Weight sharing", desc: "Across TIME (vs. CNN's sharing across SPACE)" },
      ],
    },
    {
      title: "Vanishing Gradients",
      color: "rose",
      rows: [
        { term: "BPTT", desc: "Backprop through T steps = backprop through a T-layer net" },
        { term: "Why RNNs suffer most", desc: "Long sequences = severe multiplicative gradient shrinkage" },
      ],
    },
    {
      title: "Gated Variants",
      color: "blue",
      rows: [
        { term: "LSTM", desc: "Cell state + forget/input/output gates — mostly additive updates" },
        { term: "GRU", desc: "Single update gate, merged cell/hidden state — fewer params" },
        { term: "Bidirectional RNN", desc: "Only when the FULL sequence is available upfront" },
      ],
    },
    {
      title: "Fundamental Limitation",
      color: "amber",
      rows: [
        { term: "Non-parallelizable", desc: "h_t requires h_{t-1} — inherent sequential dependency" },
        { term: "Gradient clipping", desc: "Near-mandatory safeguard against exploding gradients" },
      ],
    },
    {
      title: "The Bridge to Transformers",
      color: "emerald",
      rows: [
        { term: "seq2seq bottleneck", desc: "Entire input compressed into ONE fixed-size final hidden state" },
        { term: "Attention (2015)", desc: "Decoder attends over ALL encoder hidden states — fixes bottleneck" },
        { term: "\"Attention Is All You Need\" (2017)", desc: "Attention alone, no recurrence -> Transformer" },
      ],
    },
    {
      title: "When RNNs Still Win",
      color: "cyan",
      rows: [
        { term: "Genuine streaming use cases", desc: "Fixed-size hidden state = constant memory regardless of history" },
      ],
    },
  ],
};

export default rnnCheatSheet;
