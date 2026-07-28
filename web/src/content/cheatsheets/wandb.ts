import type { CheatSheetData } from "./types";

const wandb: CheatSheetData = {
  title: "The Ultimate Weights & Biases Cheat Sheet",
  subtitle: "Run tracking · Sweeps · Artifacts · Tables · production toolbelt",
  sections: [
    {
      title: "Setup & Core Loop",
      color: "violet",
      rows: [
        { term: "Install", desc: "Add the client library", code: "pip install wandb" },
        { term: "Login (interactive)", desc: "Local dev authentication", code: "wandb login" },
        { term: "Login (non-interactive)", desc: "CI/containers use an env var, never a hardcoded key", code: "export WANDB_API_KEY=your_key_here" },
        { term: "wandb.init", desc: "Start a run; captures config, git commit, environment", code: "run = wandb.init(\n  project='my-project',\n  config={'lr': 1e-3, 'epochs': 10},\n)" },
        { term: "Context manager form", desc: "Guarantees finish() runs even on exceptions", code: "with wandb.init(project='p') as run:\n    run.log({'loss': 0.5})" },
        { term: "wandb.log", desc: "Log metrics/media at the current step (async, buffered)", code: "wandb.log({'epoch': e, 'loss': l, 'acc': a})" },
        { term: "Explicit step", desc: "Avoid jumbled x-axis when logging from multiple loops", code: "wandb.log({'loss': l}, step=epoch)" },
        { term: "wandb.finish", desc: "Flush buffered data, mark run complete", code: "run.finish()" },
        { term: "Read config back", desc: "Drive the training loop from the same tracked config", code: "cfg = run.config\nlr = cfg.learning_rate" },
      ],
    },
    {
      title: "Organization: Runs, Projects, Tags",
      color: "blue",
      rows: [
        { term: "entity / project / run", desc: "Team-or-user -> grouping -> single execution", code: "wandb.init(entity='my-team', project='clf', name='baseline-cnn')" },
        { term: "Descriptive run names", desc: "Beats the auto adjective-noun name at scale", code: "name='lora-r8-lr2e-4-seed1'" },
        { term: "job_type", desc: "Distinguishes pipeline stages for filtering", code: "job_type='train'  # or 'eval', 'preprocess', 'sweep-agent'" },
        { term: "group", desc: "Aggregate related runs (seeds, sweep members) as one unit", code: "group='lr-ablation'" },
        { term: "tags", desc: "Filterable labels across a project", code: "tags=['baseline', '2026-q3', 'ablation']" },
        { term: "notes", desc: "Free-text context on why this run exists", code: "notes='Testing cosine schedule vs linear warmup'" },
        { term: "Metric prefixes", desc: "Groups panels automatically in the dashboard", code: "wandb.log({'train/loss': tl, 'val/loss': vl})" },
        { term: "run.summary", desc: "Best/last value per metric, set explicitly if needed", code: "run.summary['best_val_accuracy'] = best_acc" },
      ],
    },
    {
      title: "Rich Logging & Tables",
      color: "emerald",
      rows: [
        { term: "Log images", desc: "First-class media object, not an afterthought", code: "wandb.log({'ex': [wandb.Image(img, caption=p) for img, p in batch]})" },
        { term: "Sample, don't flood", desc: "Fixed small sample at coarse intervals", code: "if epoch % 5 == 0:\n    wandb.log({'sample': [wandb.Image(i) for i in imgs[:8]]})" },
        { term: "wandb.Table", desc: "Interactive, filterable, media-rich rows", code: "t = wandb.Table(columns=['image','pred','actual'])\nt.add_data(wandb.Image(img), pred, actual)" },
        { term: "Log a Table", desc: "Filter to prediction != actual in the dashboard", code: "wandb.log({'errors': t})" },
        { term: "wandb.watch", desc: "Gradient/parameter histograms — real overhead, use sparingly", code: "wandb.watch(model, log='gradients', log_freq=100)" },
        { term: "wandb.save", desc: "Attach a raw file to a run (no versioning/lineage)", code: "wandb.save('model.pt')" },
        { term: "Alerts", desc: "Notify on divergence without babysitting the dashboard", code: "run.alert(title='Diverged', text='Loss is NaN',\n  level=wandb.AlertLevel.ERROR)" },
      ],
    },
    {
      title: "Artifacts (Versioning & Lineage)",
      color: "amber",
      rows: [
        { term: "Create an artifact", desc: "Content-addressed, versioned reference", code: "a = wandb.Artifact('dataset', type='dataset')\na.add_dir('./data/cleaned')" },
        { term: "Log an artifact", desc: "Attaches it as a run's output", code: "run.log_artifact(a)" },
        { term: "Consume an artifact", desc: "Declares lineage: this run used this version", code: "d = run.use_artifact('dataset:latest', type='dataset')\npath = d.download()" },
        { term: "Model artifact", desc: "Version checkpoints, not just files on disk", code: "m = wandb.Artifact('classifier', type='model',\n  metadata={'val_acc': 0.94})\nm.add_file('model.pt')" },
        { term: "Reference artifacts", desc: "Point at existing storage instead of copying huge data", code: "a.add_reference('s3://bucket/dataset/', name='raw')" },
        { term: "Promotion / production alias", desc: "Separate 'trained ok' from 'cleared for production'", code: "# tag or link the artifact version after passing eval gates" },
      ],
    },
    {
      title: "Sweeps (Hyperparameter Search)",
      color: "rose",
      rows: [
        { term: "Sweep config", desc: "Search method, target metric, parameter space", code: "method: bayes  # grid | random | bayes\nmetric:\n  name: val_accuracy\n  goal: maximize" },
        { term: "Parameter distributions", desc: "Continuous or discrete search spaces", code: "learning_rate:\n  distribution: log_uniform_values\n  min: 1e-5\n  max: 1e-1\nbatch_size:\n  values: [16, 32, 64, 128]" },
        { term: "Early termination", desc: "Kill unpromising trials early, save compute", code: "early_terminate:\n  type: hyperband\n  min_iter: 3" },
        { term: "Register a sweep (CLI)", desc: "Prints a sweep id to run agents against", code: "wandb sweep sweep.yaml" },
        { term: "Run an agent (CLI)", desc: "Run on N machines/GPUs in parallel for the same sweep", code: "wandb agent entity/project/SWEEP_ID" },
        { term: "Programmatic sweep + agent", desc: "Define and launch entirely in Python", code: "sweep_id = wandb.sweep(sweep_config, project='p')\nwandb.agent(sweep_id, function=train_fn, count=20)" },
      ],
    },
    {
      title: "Modes, Distributed & Toolbelt",
      color: "cyan",
      rows: [
        { term: "Offline mode", desc: "Log locally on air-gapped clusters, sync later", code: "export WANDB_MODE=offline\nwandb sync ./wandb/offline-run-xxxx" },
        { term: "Disabled mode", desc: "Every call becomes a no-op — quick local debugging/tests", code: "export WANDB_MODE=disabled" },
        { term: "Resume a run", desc: "Continue logging to the same run after a crash/preemption", code: "wandb.init(project='p', id='abcd1234', resume='must')" },
        { term: "Distributed rank guard", desc: "Only rank 0 talks to W&B — avoids duplicate/conflicting runs", code: "if rank == 0:\n    wandb.init(project='ddp-training')" },
        { term: "Debug a stuck run", desc: "Check the client-side log for what was actually sent", code: "WANDB_DEBUG=true python train.py\ntail -f wandb/latest-run/logs/debug.log" },
        { term: "Status & sync", desc: "Verify connection, sync pending offline runs, clean up", code: "wandb status\nwandb sync --clean" },
        { term: "Framework integrations", desc: "Auto-logging, minimal manual instrumentation", code: "TrainingArguments(report_to='wandb')  # HF Transformers\nWandbLogger()  # PyTorch Lightning" },
        { term: "Performance rule of thumb", desc: "Diagnose overhead by disabling logging and comparing", code: "WANDB_MODE=disabled  # baseline step time\n# then re-enable incrementally to isolate cost" },
      ],
    },
  ],
};

export default wandb;
