import type { CheatSheetData } from "./types";

const multithreading: CheatSheetData = {
  title: "The Ultimate Multithreading Cheat Sheet",
  subtitle: "Synchronization primitives · deadlock prevention · thread pool sizing · priority inversion",
  sections: [
    {
      title: "Thread Basics",
      color: "violet",
      rows: [
        { term: "Threads share the process's memory", desc: "Cheap direct communication, but requires careful synchronization", code: "thread = threading.Thread(target=worker)\nthread.start(); thread.join()" },
        { term: "Thread-local storage", desc: "Each thread's own independent copy -- zero synchronization needed", code: "thread_local_data = threading.local()" },
      ],
    },
    {
      title: "Synchronization Primitive Selection",
      color: "blue",
      rows: [
        { term: "Mutex", desc: "Exactly 1 concurrent accessor", code: "with lock:\n    counter += 1   # read-add-write = 3 steps, NOT atomic alone" },
        { term: "Semaphore(N)", desc: "Up to N concurrent accessors -- resource pools (DB connections)", code: "semaphore = threading.Semaphore(3)" },
        { term: "Condition variable", desc: "Efficiently WAIT for a condition -- NEVER busy-poll", code: "with condition:\n    while not ready:   # ALWAYS while, never if\n        condition.wait()" },
        { term: "Read-write lock", desc: "MANY concurrent readers OR one writer -- read-heavy workloads", code: "// A plain mutex needlessly serializes reads that could run concurrently" },
      ],
    },
    {
      title: "Deadlock & Priority Inversion",
      color: "emerald",
      rows: [
        { term: "Deadlock: ALL FOUR conditions", desc: "Mutual exclusion + hold-and-wait + no preemption + circular wait", code: "" },
        { term: "THE fix: consistent lock ordering", desc: "Sort resources by a canonical ID before acquiring -- kills circular wait", code: "first, second = sorted([a, b], key=lambda x: x.id)\nwith first.lock:\n    with second.lock: ..." },
        { term: "Priority inversion", desc: "Low-priority lock-holder delayed by medium-priority work, starves a high-priority waiter", code: "// Real incident: NASA Mars Pathfinder, 1997" },
        { term: "Fix: priority inheritance", desc: "Temporarily boost the lock-holder's priority to match the waiter's", code: "" },
      ],
    },
    {
      title: "Thread Pool Sizing",
      color: "amber",
      rows: [
        { term: "CPU-bound", desc: "Size to available CORE COUNT -- more = pure overhead", code: "ProcessPoolExecutor(max_workers=os.cpu_count())" },
        { term: "I/O-bound", desc: "Can EXCEED core count -- blocked threads consume ZERO CPU", code: "ThreadPoolExecutor(max_workers=50)" },
        { term: "Why blocked beats spinning", desc: "A blocked thread = 0% CPU. A busy-wait loop wastes 100% of a core.", code: "" },
      ],
    },
    {
      title: "Security: TOCTOU",
      color: "rose",
      rows: [
        { term: "Time-Of-Check-To-Time-Of-Use", desc: "A non-atomic check-then-use gap = an exploitable race condition", code: "// e.g. check permission, THEN act -- a race can slip in between" },
        { term: "Fix", desc: "Wrap the check AND the action in the SAME lock -- make it atomic", code: "with lock:\n    if authorized: perform_action()" },
      ],
    },
    {
      title: "Testing Discipline",
      color: "cyan",
      rows: [
        { term: "Test under HIGH contention", desc: "Race conditions are timing-dependent -- 2 threads won't reveal them", code: "threads = [Thread(...) for _ in range(20)]   # not just 2" },
        { term: "Detect deadlocks with timeouts", desc: "A hung test (join() never returns) IS the failure signal", code: "t.join(timeout=5)\nassert not t.is_alive()" },
        { term: "Python's GIL reminder", desc: "Threading gives NO genuine parallelism for CPU-bound work", code: "// Use multiprocessing instead -- see the Concurrency skill" },
      ],
    },
  ],
};

export default multithreading;
