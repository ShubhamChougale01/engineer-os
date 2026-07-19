import type { CheatSheetData } from "./types";

const operatingSystems: CheatSheetData = {
  title: "The Ultimate Operating Systems Cheat Sheet",
  subtitle: "Processes & threads · scheduling · synchronization · deadlocks · the GIL",
  sections: [
    {
      title: "Processes vs Threads",
      color: "violet",
      rows: [
        { term: "Process", desc: "Own isolated memory space -- crash-safe, higher overhead", code: "// A crash in one process can't directly corrupt another's memory" },
        { term: "Thread", desc: "Shares its process's memory -- cheap comms, needs synchronization", code: "// Communication is cheap (shared memory), but requires careful coordination" },
        { term: "Process lifecycle", desc: "The core state machine every OS scheduler manages", code: "new -> ready -> running -> (waiting -> ready -> running)* -> terminated" },
        { term: "fork() + copy-on-write", desc: "Child shares parent's memory pages until either actually WRITES", code: "// Makes process creation cheap -- no upfront full memory copy" },
      ],
    },
    {
      title: "Virtual Memory",
      color: "blue",
      rows: [
        { term: "Each process gets its own address space", desc: "OS maps virtual -> physical RAM invisibly, via page tables", code: "" },
        { term: "Page fault", desc: "Needed page not in RAM -- OS loads it from disk (real, sometimes big cost)", code: "// Not an error -- the normal mechanism for on-demand paging" },
        { term: "Thrashing (a critical misdiagnosis trap)", desc: "High CPU + high swap/page-faults = memory pressure, NOT compute load", code: "// Fix memory pressure, don't just add more CPU capacity" },
      ],
    },
    {
      title: "Scheduling",
      color: "emerald",
      rows: [
        { term: "Round robin", desc: "Fair, fixed time slices -- but overhead grows with very short slices", code: "" },
        { term: "Priority scheduling", desc: "Risks starvation without 'aging' to boost long-waiting processes", code: "" },
        { term: "Multilevel feedback queue", desc: "What real schedulers (Linux's CFS) actually use, in sophisticated form", code: "// CPU-bound demoted, I/O-bound favored, based on observed behavior" },
        { term: "Context switch has real cost", desc: "Saving/restoring state + invalidating warmed CPU caches", code: "// Oversized thread pools can hurt throughput, not help it" },
      ],
    },
    {
      title: "Synchronization Primitives",
      color: "amber",
      rows: [
        { term: "Mutex", desc: "Exactly 1 thread at a time in the protected section", code: "with lock:\n    counter += 1" },
        { term: "Semaphore", desc: "Up to N concurrent accessors -- for limited resource pools", code: "semaphore = threading.Semaphore(3)" },
        { term: "Condition variable", desc: "Efficient wait-for-condition, NOT busy-polling", code: "while not ready:\n    condition.wait()" },
        { term: "Race condition", desc: "'Increment' is 3 steps (read, add, write) -- interleaving loses updates", code: "// counter = counter + 1  is NOT atomic without a lock" },
      ],
    },
    {
      title: "Deadlocks & Priority Inversion",
      color: "rose",
      rows: [
        { term: "Deadlock: ALL FOUR conditions must hold", desc: "Mutual exclusion + hold-and-wait + no preemption + circular wait", code: "" },
        { term: "THE fix: consistent lock ordering", desc: "Eliminates circular wait -- acquire locks in the SAME order everywhere", code: "first, second = sorted([a, b], key=lambda x: x.id)" },
        { term: "Priority inversion", desc: "Low-priority lock-holder delayed by medium-priority work, starving a high-priority waiter", code: "// Famous real incident: NASA Mars Pathfinder" },
        { term: "Fix: priority inheritance", desc: "Temporarily boost the lock-holder's priority to match the waiter's", code: "" },
      ],
    },
    {
      title: "Python's GIL & Container Theory",
      color: "cyan",
      rows: [
        { term: "The GIL", desc: "Only ONE thread executes Python bytecode at a time -- ANY core count", code: "// Threading doesn't parallelize CPU-bound Python work" },
        { term: "Fix for CPU-bound parallelism", desc: "multiprocessing -- separate processes, each with its OWN GIL", code: "ProcessPoolExecutor(max_workers=os.cpu_count())" },
        { term: "I/O-bound work is fine with threads", desc: "GIL releases during I/O waits -- threads help here", code: "ThreadPoolExecutor(max_workers=50)   # can exceed core count" },
        { term: "Containers = OS theory, applied", desc: "Namespaces extend isolation, cgroups extend scheduling/limits", code: "// Not a new paradigm -- see the Linux skill for the concrete mapping" },
      ],
    },
  ],
};

export default operatingSystems;
