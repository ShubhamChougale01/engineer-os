import type { CheatSheetData } from "./types";

const concurrency: CheatSheetData = {
  title: "The Ultimate Concurrency Cheat Sheet",
  subtitle: "Concurrency vs parallelism · race conditions/deadlock · async/await · model selection",
  sections: [
    {
      title: "The Core Distinction",
      color: "violet",
      rows: [
        { term: "Concurrency = STRUCTURE", desc: "Dealing with many things at once -- possible on ONE core", code: "// A single-threaded async event loop is concurrent but NOT parallel" },
        { term: "Parallelism = EXECUTION", desc: "Doing many things at the SAME instant -- needs MULTIPLE cores", code: "" },
      ],
    },
    {
      title: "Race Conditions & Deadlock",
      color: "blue",
      rows: [
        { term: "Race condition", desc: "counter += 1 is 3 steps (read/add/write) -- interleaving loses updates", code: "with lock:\n    counter += 1   # now safe" },
        { term: "Deadlock: ALL FOUR conditions", desc: "Mutual exclusion + hold-and-wait + no preemption + circular wait", code: "" },
        { term: "#1 deadlock fix", desc: "Consistent lock acquisition ORDER everywhere -- kills circular wait", code: "first, second = sorted([a, b], key=lambda x: x.id)" },
        { term: "Livelock vs deadlock", desc: "Deadlock: stalled. Livelock: actively 'busy,' ZERO real progress.", code: "" },
      ],
    },
    {
      title: "Async/Await & Event Loops",
      color: "emerald",
      rows: [
        { term: "Event loop mechanics", desc: "One thread, tasks yield control at await points cooperatively", code: "// No OS-level preemption -- avoids context-switch overhead entirely" },
        { term: "THE #1 async anti-pattern", desc: "A blocking call freezes the ENTIRE event loop, not just one task", code: "await asyncio.sleep(5)   # RIGHT -- yields control\ntime.sleep(5)              # WRONG -- freezes everything" },
        { term: "Structured concurrency", desc: "Bound task lifetimes to a parent scope -- no fire-and-forget", code: "async with asyncio.TaskGroup() as tg:\n    tg.create_task(fetch_a())" },
      ],
    },
    {
      title: "Model Selection",
      color: "amber",
      rows: [
        { term: "CPU-bound + GIL language (Python)", desc: "-> multiprocessing (threads give NO genuine parallelism)", code: "" },
        { term: "CPU-bound + non-GIL language", desc: "-> threads work fine for genuine parallelism", code: "" },
        { term: "I/O-bound + HIGH concurrency", desc: "-> async/await -- lowest per-task overhead at scale", code: "" },
        { term: "I/O-bound + modest concurrency", desc: "-> threads or async/await, either works", code: "" },
      ],
    },
    {
      title: "Message-Passing Alternative",
      color: "rose",
      rows: [
        { term: "CSP-style (Go channels)", desc: "Communicate via messages, no shared mutable state to race on", code: "" },
        { term: "Actor model (Erlang/Elixir)", desc: "No shared state AT ALL between actors -- eliminates races by construction", code: "// Powers WhatsApp's massive concurrent, fault-tolerant scale" },
      ],
    },
    {
      title: "Security & Testing",
      color: "cyan",
      rows: [
        { term: "TOCTOU vulnerability", desc: "Non-atomic check-then-use gap an attacker exploits", code: "// FIX: make check + use ATOMIC, or re-verify immediately before use" },
        { term: "Test under HIGH contention", desc: "Race conditions are timing-dependent -- light load won't reveal them", code: "threads = [Thread(target=...) for _ in range(50)]   # not just 2" },
      ],
    },
  ],
};

export default concurrency;
