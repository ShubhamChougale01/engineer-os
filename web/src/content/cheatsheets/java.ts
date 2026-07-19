import type { CheatSheetData } from "./types";

const java: CheatSheetData = {
  title: "The Ultimate Java Cheat Sheet",
  subtitle: "Core language · modern constructs · concurrency · production toolbelt",
  sections: [
    {
      title: "Language Core",
      color: "violet",
      rows: [
        { term: "Variables & types", desc: "Statically typed, var for local inference", code: "int age = 36;\nvar name = \"Ada\";  // still static, just inferred" },
        { term: "Primitives vs objects", desc: "8 primitives are NOT objects; autoboxing bridges them", code: "int primitive = 5;\nInteger boxed = 5;  // autoboxed for generics" },
        { term: "Control flow", desc: "if/else, enhanced for-loop, switch", code: "for (String s : list) { ... }\nif (n > 0) { ... } else { ... }" },
        { term: "Classes", desc: "The core OOP building block", code: "public class Point {\n  private final double x, y;\n  public Point(double x, double y) { this.x = x; this.y = y; }\n}" },
        { term: "Interfaces", desc: "Pure contracts; implement many, extend one class", code: "interface Shape { double area(); }\nclass Circle implements Shape { public double area() { return 3.14; } }" },
        { term: "Exceptions", desc: "Checked (must declare/catch) vs unchecked", code: "try { risky(); }\ncatch (SpecificException e) { handle(e); }\nfinally { cleanup(); }" },
        { term: "== vs equals()", desc: "Reference identity vs content comparison", code: "a == b        // identity — usually WRONG for objects\na.equals(b)   // content — usually what you want" },
      ],
    },
    {
      title: "Collections & Generics",
      color: "blue",
      rows: [
        { term: "List / Map / Set", desc: "The Collections Framework's core interfaces", code: "List<String> xs = new ArrayList<>();\nMap<String, Integer> m = new HashMap<>();\nSet<String> s = new HashSet<>();" },
        { term: "Common operations", desc: "Add, lookup with defaults, membership", code: "xs.add(\"go\");\nm.getOrDefault(\"z\", -1);\ns.contains(\"a\");" },
        { term: "Generics", desc: "Compile-time type safety, no casting needed", code: "class Box<T> { T value; T get() { return value; } }\n<T extends Comparable<T>> T max(List<T> xs) { ... }" },
        { term: "Type erasure", desc: "Generic params exist only at compile time", code: "List<String> a = new ArrayList<>();\nList<Integer> b = new ArrayList<>();\na.getClass() == b.getClass(); // true!" },
        { term: "Immutable collections", desc: "Factory methods for fixed data", code: "List.of(1, 2, 3);\nMap.of(\"a\", 1, \"b\", 2);  // throws if mutated" },
        { term: "PriorityQueue / Deque", desc: "Heap and double-ended queue", code: "PriorityQueue<Integer> pq = new PriorityQueue<>();\nDeque<Integer> stack = new ArrayDeque<>();" },
      ],
    },
    {
      title: "Streams & Modern Java",
      color: "emerald",
      rows: [
        { term: "Stream pipeline", desc: "Functional-style filter/map/collect", code: "list.stream()\n  .filter(s -> s.length() > 4)\n  .map(String::toUpperCase)\n  .collect(Collectors.toList());" },
        { term: "Reductions", desc: "sum, average, reduce to one value", code: "list.stream().mapToInt(String::length).sum();\nlist.stream().reduce(\"\", (a, b) -> a + b);" },
        { term: "Records (16+)", desc: "Auto-generated constructor/equals/hashCode/toString", code: "record User(int id, String name) {}\nUser u = new User(1, \"Ada\");\nu.name();  // accessor, no \"get\" prefix" },
        { term: "Sealed + pattern matching (21+)", desc: "Exhaustive, compiler-checked branching", code: "sealed interface Shape permits Circle, Square {}\nswitch (shape) {\n  case Circle c -> area(c);\n  case Square s -> area(s);\n}" },
        { term: "Optional", desc: "Explicit absence instead of returning null", code: "Optional<User> find(int id) { ... }\nfind(1).map(User::name).orElse(\"unknown\");" },
        { term: "Pattern matching for instanceof", desc: "No separate cast needed (16+)", code: "if (obj instanceof String s) {\n  System.out.println(s.length());\n}" },
      ],
    },
    {
      title: "Concurrency",
      color: "amber",
      rows: [
        { term: "Threads", desc: "The classic building block", code: "Thread t = new Thread(() -> work());\nt.start(); t.join();" },
        { term: "ExecutorService", desc: "Managed thread pools", code: "var pool = Executors.newFixedThreadPool(10);\npool.submit(() -> work());\npool.shutdown();" },
        { term: "Virtual threads (21+)", desc: "Millions possible; auto-unmounted during I/O", code: "try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {\n  ex.submit(() -> blockingCall());\n}" },
        { term: "synchronized", desc: "Mutual exclusion around a critical section", code: "synchronized (lock) {\n  counter++;\n}" },
        { term: "Atomic classes", desc: "Lock-free compare-and-swap primitives", code: "AtomicInteger counter = new AtomicInteger(0);\ncounter.incrementAndGet();" },
        { term: "volatile", desc: "Guarantees cross-thread visibility of a field", code: "private volatile boolean running = true;" },
        { term: "CompletableFuture", desc: "Composable async pipelines", code: "CompletableFuture.supplyAsync(() -> fetch())\n  .thenApply(r -> transform(r));" },
      ],
    },
    {
      title: "equals/hashCode & Object Basics",
      color: "rose",
      rows: [
        { term: "Overriding equals()", desc: "Content comparison, following the contract", code: "@Override\npublic boolean equals(Object o) {\n  if (!(o instanceof Point p)) return false;\n  return x == p.x && y == p.y;\n}" },
        { term: "Overriding hashCode()", desc: "MUST match equals() — equal objects, same hash", code: "@Override\npublic int hashCode() { return Objects.hash(x, y); }" },
        { term: "toString()", desc: "Human-readable representation", code: "@Override\npublic String toString() { return \"Point(\" + x + \", \" + y + \")\"; }" },
        { term: "Comparable / Comparator", desc: "Natural ordering vs custom sort logic", code: "list.sort(Comparator.comparing(User::name));\nclass User implements Comparable<User> { ... }" },
        { term: "StringBuilder", desc: "Mutable buffer — never += in a loop", code: "var sb = new StringBuilder();\nfor (String s : parts) sb.append(s);\nString result = sb.toString();" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Maven basics", desc: "Build, test, package", code: "mvn clean package\nmvn test" },
        { term: "Gradle basics", desc: "The faster, DSL-based alternative", code: "./gradlew build\n./gradlew test" },
        { term: "JUnit 5 test", desc: "The standard testing framework", code: "@Test\nvoid addsNumbers() {\n  assertEquals(4, add(2, 2));\n}" },
        { term: "Mockito", desc: "Mocking dependencies in unit tests", code: "@Mock private Repository repo;\nwhen(repo.find(1)).thenReturn(user);" },
        { term: "SLF4J logging", desc: "Structured logging facade", code: "private static final Logger log = LoggerFactory.getLogger(Foo.class);\nlog.info(\"order_placed id={}\", orderId);" },
        { term: "try-with-resources", desc: "Guaranteed close(), even on exceptions", code: "try (var conn = dataSource.getConnection()) {\n  // use conn\n}" },
        { term: "Debugging tools", desc: "Live thread/heap inspection", code: "jstack <pid>      // dump all thread stacks\njmap -dump ...    // heap dump for leak analysis" },
        { term: "Container-aware JVM flags", desc: "Non-negotiable in Docker/Kubernetes", code: "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar" },
      ],
    },
  ],
};

export default java;
