import type { SkillContent } from "../types";

/**
 * Java — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const java: SkillContent = {
  overview: `
Java is a statically typed, object-oriented, garbage-collected language that compiles to bytecode and runs on the Java Virtual Machine (JVM) — "write once, run anywhere" was its founding promise, and three decades later it remains one of the most deployed languages in enterprise and large-scale backend software. Java's defining characteristic is not any single language feature but the JVM itself: a mature, heavily engineered runtime with a world-class garbage collector, a Just-In-Time compiler that routinely outperforms naive expectations for a "managed" language, and an ecosystem (Maven Central) with millions of battle-tested libraries.

For an AI engineer, Java shows up less in model training (Python dominates there) and more in the enterprise data and serving infrastructure AI systems plug into: large-scale data pipelines (Spark's core is Scala/JVM, with a Java API), search and retrieval infrastructure (Elasticsearch and Solr are both Java), and the backend services of any large company whose existing systems an AI feature needs to integrate with. Understanding Java is frequently the price of admission for shipping an AI feature into a decade-old enterprise Java codebase rather than a greenfield Python service.

Key characteristics: statically typed with a rich, decades-refined type system; automatic memory management via a highly tunable garbage collector; genuine backward compatibility (code from Java 8 largely still runs on Java 21); a massive standard library and dependency ecosystem; and, since Java 21, virtual threads — a fundamental rethinking of how the JVM handles concurrency that closes much of the gap with newer languages' lightweight-concurrency models.
`,

  history: `
Java was created by **James Gosling** and colleagues at Sun Microsystems, originally under the name "Oak," targeting embedded consumer devices before pivoting toward the exploding World Wide Web.

| Year | Milestone |
|------|-----------|
| 1991 | James Gosling begins the "Green Project" at Sun, targeting interactive television and embedded devices |
| 1995 | Renamed Java, publicly released; "write once, run anywhere" becomes the founding slogan, riding the early Web's popularity |
| 1996 | JDK 1.0 released |
| 2004 | Java 5 (Tiger) — generics, annotations, enums, autoboxing: the biggest language overhaul in a decade |
| 2006 | Sun open-sources Java as OpenJDK |
| 2010 | Oracle acquires Sun Microsystems, becoming Java's steward |
| 2014 | Java 8 — lambda expressions and the Stream API, a genuinely transformative release bringing functional-style programming into the mainstream |
| 2017 | Java 9 — the Module System (Project Jigsaw) |
| 2018 | Oracle moves Java to a 6-month release cadence with Long-Term Support (LTS) releases every few years, ending the old multi-year release model |
| 2021 | Java 17 (LTS) — sealed classes, pattern matching for switch (preview) |
| 2023 | Java 21 (LTS) — **virtual threads** (Project Loom) ship as a final feature: lightweight, JVM-managed threads at massive scale, plus record patterns and pattern matching for switch finalized |
| 2024–2025 | Continued Project Amber (language ergonomics) and Project Panama (foreign function/memory) maturation; Java 23/24 continue the 6-month cadence |
| 2025+ | Structured concurrency (following on from virtual threads) continues stabilizing through preview releases |

The shift from a multi-year release cycle to a 6-month cadence with periodic LTS releases (Java 8, 11, 17, 21) is the single biggest process change in Java's history — it let genuinely significant features (lambdas, virtual threads) ship faster while still giving conservative enterprises a stable LTS target to adopt.
`,

  "why-it-exists": `
Java exists because of a very concrete 1990s problem: **software needed to run across an explosion of incompatible hardware and operating systems**, and C/C++'s "compile separately for every target platform" model was too slow and error-prone for the coming wave of networked, embedded, and web-delivered software.

James Gosling's team's answer was to introduce an intermediate layer: instead of compiling directly to machine code for one specific CPU/OS combination, Java compiles to **bytecode** — an abstract instruction set for the Java Virtual Machine. Any platform with a JVM implementation can run that exact same bytecode unmodified. "Write once, run anywhere" was a direct, deliberate solution to platform fragmentation, at a moment (the rise of the Web, then countless device types) when that fragmentation was becoming an acute business problem for anyone shipping software.

The other core design goal was **safety and simplicity relative to C++**: automatic memory management (no manual malloc/free, eliminating a huge class of memory bugs), no pointer arithmetic, no multiple inheritance of implementation (interfaces instead), and a garbage collector handling the exact lifecycle problems that made C++ notoriously easy to get wrong at scale — explicitly a reaction to the operational pain large C++ codebases had caused throughout the 1980s and 90s.
`,

  "problem-it-solves": `
Java solves the **portable, safe, large-team enterprise software problem**: how do you write software once, run it reliably across many platforms, and have hundreds of engineers maintain a shared codebase for a decade or more without it collapsing under its own complexity?

Concretely, Java removes:

- **Platform fragmentation**: bytecode plus a JVM per platform means the exact same compiled artifact runs on Windows, Linux, macOS, or embedded hardware without recompilation.
- **Manual memory management bugs**: the garbage collector frees memory automatically, eliminating use-after-free, double-free, and most memory leaks (leaks are still possible via unintentionally-retained references, but the entire class of pointer-arithmetic bugs is gone).
- **Ambiguous multiple inheritance**: Java allows implementing many interfaces but extending only one class, sidestepping the diamond-inheritance problems C++ multiple inheritance can create.
- **Undocumented, unstructured large codebases**: strong static typing plus a mature IDE ecosystem (IntelliJ IDEA, Eclipse) makes navigating and safely refactoring million-line codebases genuinely tractable — a major reason large, long-lived enterprise systems still choose Java.
- **Long-term maintenance risk**: Java's near-fanatical commitment to backward compatibility means code written for Java 8 largely still compiles and runs correctly on Java 21, a rare and deliberately engineered property among modern languages.

What Java deliberately does **not** solve: fast iteration for small scripts or prototypes (verbosity and a mandatory compile step make it a poor fit there), and it historically traded away some raw performance and low-level control for safety and portability — though the JIT compiler has closed much of that gap over decades of engineering investment.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Write idiomatic modern Java: records, sealed classes, pattern matching, and the Stream API alongside classic OOP.
2. Explain how the JVM executes bytecode: class loading, the JIT compiler, and the generational garbage collector.
3. Use Java's type system effectively: generics, interfaces, and the newer sealed/record constructs for modeling domain data precisely.
4. Understand and use virtual threads (Java 21+) to write highly concurrent code without the historical ceremony of thread pools for every blocking call.
5. Structure a production Java project with Maven or Gradle, and understand the module system's role in large codebases.
6. Test with JUnit 5 and Mockito, and profile with standard JVM tooling (JFR, async-profiler).
7. Package and deploy a Java service in Docker with a production-appropriate JVM configuration.
8. Answer senior-level interview questions on garbage collection, the memory model, equals/hashCode, and virtual threads.
`,

  prerequisites: `
- **Required**: basic programming literacy — variables, loops, functions, and some exposure to object-oriented concepts (classes, objects) in any language.
- **Helpful**: familiarity with a statically typed language (C#, TypeScript, Go) makes Java's type system feel immediately familiar, though this page assumes none.
- **For internals sections**: general familiarity with the idea of a virtual machine or bytecode interpretation (from any managed language) helps, though the JVM is explained from scratch here.

Dependency links: **Computer Science** fundamentals (OOP, SOLID principles, design patterns) → this page → **Spring Boot**, and general **System Design** concepts all build directly on Java fluency — it remains the dominant language for large-scale enterprise system design interviews and real-world architecture.
`,

  "beginner-concepts": `
### Your first program and the compile step

~~~java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
~~~

Unlike Python or JavaScript, Java requires an explicit compile step before running: javac Main.java produces Main.class (bytecode), and java Main runs it on the JVM. Every top-level class typically lives in its own file named identically to the public class.

### Variables and types

~~~java
int age = 36;
double pi = 3.14159;
boolean active = true;
String name = "Ada";

var inferred = "Ada";   // Java 10+ local variable type inference — still statically typed!
~~~

Java is statically typed: once age is declared int, it can never hold anything else. var (Java 10+) lets the compiler INFER the type from the right-hand side — it does not make Java dynamically typed; the type is still fixed at compile time, just not written out explicitly.

### Primitives vs objects, and autoboxing

~~~java
int primitive = 5;              // a raw primitive, stored directly, no object overhead
Integer boxed = 5;               // an OBJECT wrapping an int — autoboxing converts automatically

List<Integer> numbers = new ArrayList<>();
numbers.add(5);                  // generics require objects, so autoboxing happens here
~~~

Java has eight primitive types (int, long, double, float, boolean, char, byte, short) that are NOT objects — a real performance and memory distinction from languages where "everything is an object." Generics (like List<T>) require object types, which is why List<int> doesn't compile and List<Integer> does — the compiler autoboxes primitives into their wrapper classes as needed.

### Collections

~~~java
List<String> langs = new ArrayList<>(List.of("java", "kotlin", "scala"));
Map<String, Integer> ranks = new HashMap<>();
ranks.put("java", 1);
Set<String> unique = new HashSet<>(langs);

langs.add("groovy");
int rank = ranks.getOrDefault("python", -1);
~~~

Rule of thumb: ArrayList for most sequences, HashMap for key/value lookups (O(1) average), HashSet for uniqueness checks — the same universal collection-choice logic as any language, expressed through Java's Collections Framework interfaces (List, Map, Set).

### Control flow and methods

~~~java
public static String describe(int n) {
    if (n < 0) {
        return "negative";
    } else if (n == 0) {
        return "zero";
    }
    return "positive";
}

for (String lang : langs) {          // enhanced for-loop ("for-each")
    System.out.println(lang);
}

int total = langs.stream().mapToInt(String::length).sum();
~~~

### Classes and objects

~~~java
public class Point {
    private final double x, y;

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double distanceTo(Point other) {
        double dx = x - other.x, dy = y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

Point p1 = new Point(0, 0);
Point p2 = new Point(3, 4);
System.out.println(p1.distanceTo(p2));   // 5.0
~~~

Common beginner trap: comparing objects with == instead of equals — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### Interfaces and abstract classes

~~~java
public interface Shape {
    double area();
    default String describe() {                   // default methods (Java 8+)
        return "A shape with area " + area();
    }
}

public class Circle implements Shape {
    private final double radius;
    public Circle(double radius) { this.radius = radius; }
    public double area() { return Math.PI * radius * radius; }
}
~~~

Java allows implementing many interfaces but extending only one class — the language's answer to avoiding the diamond problem of multiple inheritance while still supporting flexible polymorphism.

### Generics

~~~java
public class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

public static <T extends Comparable<T>> T max(List<T> items) {
    T best = items.get(0);
    for (T item : items) {
        if (item.compareTo(best) > 0) best = item;
    }
    return best;
}
~~~

Generics are erased at compile time (type erasure — covered in Advanced Concepts) but give compile-time type safety without casting, avoiding the ClassCastException risk that pre-Java-5 code (using raw Object collections) was prone to.

### The Stream API and lambdas

~~~java
List<String> names = List.of("Ada", "Grace", "Alan", "Barbara");

List<String> longNames = names.stream()
    .filter(n -> n.length() > 4)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());

double avgLength = names.stream()
    .mapToInt(String::length)
    .average()
    .orElse(0.0);
~~~

Streams (Java 8+) bring a functional, pipeline-oriented style to Java: filter/map/collect chains that read close to how you'd describe the transformation in English, compiling down to efficient iteration internally.

### Records — concise, immutable data carriers (Java 16+)

~~~java
public record User(int id, String name, String email) {}

User u = new User(1, "Ada", "ada@example.com");
System.out.println(u.name());        // auto-generated accessor, no "get" prefix
System.out.println(u);                 // auto-generated toString()
u.equals(new User(1, "Ada", "ada@example.com"));   // auto-generated equals/hashCode
~~~

A record auto-generates the constructor, accessors, equals, hashCode, and toString from its component list — eliminating the notorious boilerplate of a classic Java "POJO" (Plain Old Java Object) that used to require an IDE to generate dozens of lines by hand.

### Exception handling

~~~java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) { super(message); }
}

public void withdraw(double amount) {
    if (amount > balance) {
        throw new InsufficientFundsException("Need " + amount + ", have " + balance);
    }
    balance -= amount;
}

try {
    account.withdraw(1000);
} catch (InsufficientFundsException e) {
    System.out.println("Failed: " + e.getMessage());
} finally {
    logTransaction();
}
~~~

Java distinguishes **checked exceptions** (must be declared with throws or caught — the compiler enforces handling) from **unchecked exceptions** (RuntimeException and subclasses — optional to catch). This distinction is a genuine, often-debated Java design choice covered further in Advanced Concepts.

### Pattern matching for switch and sealed classes (Java 21+)

~~~java
public sealed interface Shape permits Circle, Square {}
public record Circle(double radius) implements Shape {}
public record Square(double side) implements Shape {}

public static double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Square s -> s.side() * s.side();
    };
}
~~~

sealed restricts which classes may implement an interface, and the switch expression over a sealed hierarchy is EXHAUSTIVE — the compiler verifies every permitted subtype is handled, the same safety property discriminated unions provide in other languages.
`,

  "advanced-concepts": `
### Type erasure — generics are a compile-time-only feature

~~~java
List<String> strings = new ArrayList<>();
List<Integer> integers = new ArrayList<>();
System.out.println(strings.getClass() == integers.getClass());   // true!
~~~

At runtime, both lists are simply ArrayList — the generic type parameter <String> or <Integer> exists only at compile time for type-checking, then is ERASED. This is why you cannot do new T() inside a generic method, cannot create an array of a generic type directly, and why List<int[]>.class doesn't exist as a distinct runtime type from List.class. Type erasure was a deliberate backward-compatibility decision when generics were added in Java 5 (2004) — it let generic code interoperate with pre-generics bytecode.

### The Java Memory Model and volatile

~~~java
public class SharedFlag {
    private volatile boolean running = true;   // guarantees visibility across threads

    public void stop() { running = false; }
    public void run() {
        while (running) { doWork(); }          // without volatile, this could loop FOREVER
    }                                            // due to per-thread caching of the field
}
~~~

The Java Memory Model (JMM) formally defines what visibility and ordering guarantees exist between threads. Without volatile or proper synchronization, one thread's write to a shared field is NOT guaranteed to ever become visible to another thread reading it — a subtle, real bug class distinct from simple race conditions, since it can manifest as "the other thread just never sees the update" rather than a crash.

### Virtual threads (Project Loom, Java 21+)

~~~java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> {
            // blocking I/O here does NOT tie up a scarce OS thread
            fetchFromDatabase();
            return null;
        });
    }
}
~~~

Virtual threads are JVM-managed, extremely lightweight threads (millions can exist simultaneously, unlike OS threads which are expensive to create in bulk). When a virtual thread blocks on I/O, the JVM automatically UNMOUNTS it from its carrier OS thread, freeing that OS thread to run other virtual threads — conceptually similar to how Go's goroutines multiplex onto OS threads, but retaining Java's familiar synchronous, blocking-style code (no async/await coloring problem). This is the single most significant Java concurrency change in over a decade, closing much of the ergonomic gap with Go's goroutines while keeping ordinary, sequential-looking Java code.

### equals, hashCode, and the contract between them

~~~java
public class Point {
    private final int x, y;
    // ... constructor ...

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
~~~

The contract: if two objects are equal() they MUST have the same hashCode(); the reverse is not required (different objects CAN share a hash code — a "collision" — which is fine, just less efficient). Violating this contract silently breaks HashMap/HashSet lookups — an object can go "missing" from a HashSet even though an equal() one was added, because it hashed to a different bucket. Records generate a correct equals/hashCode pair automatically, sidestepping this entire class of bug for immutable data types.

### Checked vs unchecked exceptions — the ongoing debate

Java is one of the only mainstream languages with checked exceptions (the compiler forces you to declare or catch them). Proponents argue they document a method's failure modes directly in its signature; critics (including much of the Java community itself over time) argue they encourage exception-swallowing anti-patterns and don't scale well through layers of abstraction, callbacks, or streams (a lambda inside a Stream pipeline cannot throw a checked exception without wrapping it). Modern Java style guides increasingly favor unchecked exceptions for most application-level errors, reserving checked exceptions for genuinely recoverable, expected conditions at API boundaries.

### The JIT compiler and escape analysis

The JVM initially interprets bytecode, then profiles which methods run "hot" (frequently), and compiles those specific methods to optimized native machine code at runtime (Just-In-Time compilation) — this is why long-running Java processes often get FASTER after a warm-up period, and why microbenchmarks must account for JIT warm-up or risk measuring the slow interpreted path instead of steady-state performance. Escape analysis lets the JIT allocate some objects that provably never "escape" a method (are never referenced outside it) on the stack instead of the heap, reducing garbage collector pressure for hot code paths.
`,

  "internal-working": `
The JVM turns Java source into running code through a distinct compile-then-run pipeline, unlike a fully native-compiled language:

~~~mermaid
flowchart LR
    A["source .java"] --> B["javac compiler"]
    B --> C["bytecode .class files"]
    C --> D["Class loader"]
    D --> E["Bytecode interpreter\n(cold code)"]
    E --> F["JIT compiler\n(hot methods -> native code)"]
    F --> G["Garbage collector\nmanages the heap throughout"]
~~~

1. **Compile to bytecode**: javac compiles .java source to .class files containing bytecode — a platform-independent instruction set, NOT native machine code.
2. **Class loading**: the JVM's class loader locates, verifies (bytecode verification is a real security boundary — it rejects malformed or unsafe bytecode before execution), and initializes classes on demand, lazily, the first time they're referenced.
3. **Interpretation, then JIT compilation**: the JVM starts by interpreting bytecode directly (slow but immediate); it profiles execution and, once a method is called enough times ("hot"), the JIT compiler (HotSpot's C1 and C2 compilers, tiered together) compiles that specific method to optimized native machine code — this is why Java performance characteristically improves after a warm-up period, unlike an ahead-of-time compiled language that's at full speed immediately.
4. **Garbage collection**: runs continuously alongside your program, managing the heap. Modern collectors (G1 by default since Java 9, ZGC and Shenandoah for extremely low-pause requirements) are generational — they exploit the empirical observation that most objects die young, collecting a small "young generation" region frequently and cheaply, and the "old generation" (long-lived objects) much less often.

**Generational garbage collection in more detail**: new objects are allocated in the young generation (specifically an "Eden" space); most die quickly and are collected cheaply. Objects surviving several young-generation collections get promoted to the old generation. This generational hypothesis (most objects are short-lived) is why Java's GC, despite the overhead of tracing garbage collection in general, achieves throughput competitive with manual memory management for most workloads.

**Why "write once, run anywhere" actually works**: bytecode is the portable artifact; each platform needs only its own JVM implementation (HotSpot being Oracle/OpenJDK's reference implementation) to execute identical .class files — the JVM, not your compiled code, is what's platform-specific.
`,

  architecture: `
A senior engineer thinks about Java at two levels: the **JVM runtime architecture** (what exists once your program is running) and the **application architecture** (how a Java codebase is organized).

### JVM runtime architecture

~~~mermaid
flowchart TB
    subgraph JVM["JVM process"]
        subgraph Memory["Memory areas"]
            Heap["Heap\n(young gen + old gen,\nGC-managed objects)"]
            Stack["Per-thread stacks\n(local variables, call frames)"]
            Metaspace["Metaspace\n(class metadata)"]
        end
        subgraph Exec["Execution engine"]
            Interp["Bytecode interpreter"]
            JIT["JIT compiler (C1/C2)"]
        end
        GC["Garbage collector\n(G1 / ZGC / Shenandoah)"]
    end
    Interp --> Heap
    JIT --> Heap
    GC --> Heap
~~~

Key facts: each thread gets its own stack (fast, automatically reclaimed when the thread exits, no GC involvement); all objects live on the shared heap, which the garbage collector manages; class metadata lives in Metaspace (replacing the old, fixed-size "PermGen" region in Java 8+, removing a once-common OutOfMemoryError source).

### Application architecture (production Java service)

The standard layered layout used by mature Java teams (frequently on Spring Boot, though the pattern predates and outlives any specific framework):

~~~
myservice/
├── pom.xml (Maven) or build.gradle (Gradle)
├── src/main/java/com/example/myservice/
│   ├── api/                 # REST controllers, request/response DTOs
│   ├── service/               # business logic
│   ├── repository/            # data access, often Spring Data interfaces
│   ├── domain/                 # core entities/records
│   └── config/                  # dependency injection wiring, application config
└── src/test/java/...           # mirrors main structure
~~~

Rules: dependencies point inward (api → service → repository), domain objects (increasingly records) are the single source of truth for shape, and repositories are typically defined as interfaces with the concrete implementation injected — enabling test doubles without a mocking framework in many cases.
`,

  "data-flow": `
What happens when you run **java -jar myservice.jar**:

~~~mermaid
sequenceDiagram
    participant OS
    participant JVM
    participant CL as Class Loader
    participant Exec as Execution Engine
    participant GC as Garbage Collector

    OS->>JVM: launch java process
    JVM->>JVM: initialize heap, stacks, JIT compiler infra
    JVM->>CL: load the main class
    CL->>CL: verify bytecode, initialize static fields
    JVM->>Exec: begin interpreting main()'s bytecode
    Exec->>Exec: profile hot methods; JIT-compile them to native code
    Exec->>GC: allocations trigger young-gen collections as needed
    Exec-->>OS: exit code (JVM shuts down, all non-daemon threads finished)
~~~

For an HTTP request in a Java web service (typically Spring Boot on an embedded Tomcat or Netty server), the data flow is: a TCP connection arrives → the server's connector accepts it and hands the request to a thread (historically a pooled OS thread; increasingly a virtual thread since Java 21) → the framework routes to your controller method → your method calls into services/repositories, potentially blocking on database I/O → the response is serialized and written back. With virtual threads, thousands of concurrent "blocking-style" requests can be handled with ordinary synchronous code and no reactive-programming ceremony, because the JVM transparently parks the virtual thread during I/O without tying up an OS thread.

The most misunderstood part for newcomers: **class loading is lazy**. A class is not loaded, verified, and initialized until the FIRST time it's actually referenced at runtime — this is why a typo in rarely-executed code can compile fine and only surface as a runtime error (a NoClassDefFoundError or similar) much later, and why static initializer blocks run exactly once, at first use, not at program startup.
`,

  "production-usage": `
### Build tools: Maven and Gradle

~~~xml
<!-- pom.xml (Maven) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
~~~

~~~bash
mvn clean package          # Maven: compile, test, package into a JAR
./gradlew build            # Gradle: the same, with a faster incremental build model
~~~

Non-negotiables for production:

1. **A locked dependency tree** — Maven's dependency management (or Gradle's lockfiles) ensures reproducible builds; audit for version conflicts ("dependency hell") explicitly.
2. **A specific JDK version pinned** in the build file and CI — Java's LTS releases (17, 21) are the common production targets; track them deliberately.
3. **JVM flags tuned for the deployment environment**, not left at defaults — heap size (-Xmx), garbage collector choice, and container-awareness flags all matter (covered in Performance and Deployment).

### Configuration

Spring Boot's externalized configuration (application.yml/properties, environment variable overrides, profiles for dev/staging/prod) is the ecosystem standard; validate configuration at startup and fail fast on missing required values, exactly as in any production language.

### Long-running services

- The JVM itself IS the long-running process — no separate "runtime install" step on the target machine beyond having a compatible JVM present (or bundling one via jlink/jpackage for a custom minimal runtime image).
- Virtual threads (Java 21+) have substantially changed the concurrency story for I/O-heavy services — many teams can now write straightforward blocking-style code and still achieve very high concurrency, avoiding the historical complexity of reactive programming (Project Reactor, RxJava) purely for scaling connection counts.
- Container-aware JVM settings (correct since Java 10+) mean the JVM correctly detects a container's CPU/memory limits (cgroups) rather than the host machine's — a historically painful misconfiguration source in earlier Java versions running in Docker/Kubernetes.
`,

  "industry-examples": `
- **Google**: significant portions of Google's internal infrastructure, plus prominent public products, run on Java (alongside C++ and other languages); Google is also a major contributor to OpenJDK.
- **Amazon**: extensively uses Java across its retail and AWS backend services; Amazon Corretto is Amazon's own free, production-ready OpenJDK distribution, reflecting how central Java is to their infrastructure.
- **Netflix**: a famously large, sophisticated Java/Spring Boot microservices architecture; open-sourced many widely used Java tools (Hystrix, Eureka, and others from their "Netflix OSS" era) that shaped how the industry builds resilient distributed Java systems.
- **LinkedIn**: Java (and Scala on the JVM) power much of LinkedIn's backend; they open-sourced Kafka (though Kafka's core is Scala/JVM, its ecosystem is deeply Java-centric) and numerous other JVM infrastructure projects.
- **Elastic (Elasticsearch, Logstash)**: Elasticsearch itself is written in Java, making it a foundational piece of JVM-based infrastructure that AI/search-heavy systems frequently depend on directly.
- **Banks and large enterprises broadly**: Java's stability guarantees, mature tooling, and two-decades-plus talent pool make it the default choice for core banking, insurance, and enterprise systems where a decade-plus maintenance horizon is the norm, not the exception.

Pattern to notice: Java's industry footprint concentrates in **large-scale, long-lived enterprise systems and infrastructure** where stability, backward compatibility, and a deep talent pool matter more than cutting-edge language ergonomics — a different adoption profile than a language like Rust or Go, but an equally durable one.
`,

  "best-practices": `
1. **Favor composition over inheritance** — deep inheritance hierarchies are a classic, widely-cited Java anti-pattern; prefer implementing interfaces and delegating behavior.
2. **Use records for immutable data carriers** wherever the type is genuinely just a bundle of values — eliminates the equals/hashCode/toString boilerplate class entirely.
3. **Prefer unchecked exceptions for most application errors**, reserving checked exceptions for narrow, genuinely recoverable API-boundary conditions — modern Java style has largely converged here.
4. **Program to interfaces, not implementations** (List<String> list = new ArrayList<>();, never ArrayList<String> list = ...;) for flexibility and testability.
5. **Use the Optional type** for method return values that may legitimately be absent, instead of returning null — makes absence explicit in the type signature.
6. **Immutability by default** for domain objects — final fields, records, defensive copying of mutable collections passed in or out.
7. **Dependency injection via constructors**, not field injection — makes dependencies explicit and testable without a DI framework running.
8. **Use try-with-resources** for anything implementing AutoCloseable (files, database connections, sockets) — guarantees closure even on exceptions.
9. **Adopt virtual threads for I/O-bound concurrency** (Java 21+) instead of reflexively reaching for reactive programming frameworks — much simpler code for the same scalability in many cases.
10. **Run a static analyzer (SpotBugs, Error Prone) and enforce a formatter** (google-java-format, or your team's convention) in CI.
`,

  "anti-patterns": `
### Comparing objects with == instead of equals

~~~java
String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);         // false! == compares REFERENCES, not content
System.out.println(a.equals(b));    // true — this is what you actually wanted

Integer x = 200, y = 200;
System.out.println(x == y);          // false — outside the cached -128..127 range!
Integer p = 100, q = 100;
System.out.println(p == q);          // true — Integer caching, a classic interview gotcha
~~~

== compares object references (identity) for non-primitives, not their content — always use .equals() for value comparison, and be aware Integer's autoboxing cache (-128 to 127 by default) makes == occasionally "work" for small values, which is exactly what makes this bug so insidious in real code.

### Other production-grade anti-patterns

- **Deep inheritance hierarchies**: three or more levels of extends is a common maintainability smell; prefer composition and interfaces.
- **Catching Exception or Throwable broadly** and swallowing it silently — hides real bugs and can even catch OutOfMemoryError or other conditions you genuinely cannot safely recover from.
- **Returning null instead of Optional or an empty collection** — forces every caller to remember a null check; a common, decades-old source of NullPointerException.
- **Mutable public fields on shared objects** instead of encapsulation — breaks invariants and thread-safety guarantees silently.
- **Overusing checked exceptions** through layers of lambdas and streams, forcing awkward try/catch wrapping inside functional-style code that wasn't designed for them.
- **String concatenation in a loop with +** — creates a new String object each iteration (Strings are immutable); use StringBuilder for anything beyond a handful of iterations.
- **Ignoring the equals/hashCode contract** when overriding one but not the other — silently breaks HashMap/HashSet behavior in ways that are hard to debug because the object often "looks" correct when printed.
- **new Thread() per unit of work** for high-concurrency workloads pre-Java-21 — expensive OS thread creation; use an ExecutorService (or virtual threads on 21+) instead.
`,

  performance: `
### Rule zero: measure first, and account for JIT warm-up

~~~bash
# JFR (Java Flight Recorder) — low-overhead, production-safe profiling built into the JVM
java -XX:StartFlightRecording=filename=recording.jfr -jar myservice.jar
jfr print --events jdk.ExecutionSample recording.jfr

# async-profiler — a popular, low-overhead sampling profiler for CPU and allocations
./profiler.sh -d 30 -f flamegraph.html <pid>
~~~

Naive microbenchmarks that don't account for JIT warm-up measure the SLOW interpreted/early-tiered path, not steady-state performance — use a proper benchmarking harness (JMH, the Java Microbenchmark Harness) which explicitly handles warm-up iterations before measuring.

### The performance hierarchy (apply in order)

1. **Better algorithm / data structure** — universal across languages; a HashMap lookup beats a linear ArrayList scan regardless of JIT sophistication.
2. **Reduce allocations in hot paths** — every allocation is eventual garbage collector work; reuse buffers, prefer primitive arrays over boxed collections in genuinely hot code, and let escape analysis do its job by keeping objects method-local where possible.
3. **Choose the right garbage collector for your latency/throughput tradeoff** — G1 (default) balances both well for most services; ZGC or Shenandoah for sub-millisecond pause requirements at the cost of some throughput; the Parallel collector for maximum throughput batch workloads that don't care about pause times.
4. **Concurrency for I/O-bound work**: virtual threads (21+) for massive concurrent blocking I/O with simple code; traditional thread pools (ExecutorService) still fine for moderate concurrency.
5. **Parallelize CPU-bound work** with parallel streams (.parallelStream()) or the ForkJoinPool directly for genuinely CPU-bound, data-parallel workloads — measure first, since parallel streams have real overhead that can lose to sequential streams for small workloads.
6. **Tune JVM flags for your specific workload**: heap sizing (-Xmx/-Xms), GC selection (-XX:+UseZGC etc.), and (for containers) explicit memory limits matching the container's actual allocation.

### Micro-level facts worth knowing

- String concatenation compiles to StringBuilder usage automatically for simple cases in modern javac, but an explicit StringBuilder is still correct and clearer for loops.
- Autoboxing (int to Integer) has real allocation and unboxing-null-pointer-exception risk in hot paths — prefer primitive collections (or primitive arrays) when performance-critical.
- The JIT's escape analysis can stack-allocate objects that provably don't escape a method — a genuine, if not fully controllable, "free" optimization in hot code.
- Records' auto-generated equals/hashCode are correct by construction — a real, if small, performance and correctness win over hand-written (and sometimes subtly wrong) implementations.
`,

  scalability: `
Java services scale the same way any networked service does — **horizontally** — with a JVM-specific twist introduced by virtual threads.

### Single machine

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Java service (JVM process 1)\nvirtual-thread-per-request"]
    LB --> S2["Java service (JVM process N)"]
    S1 & S2 --> DB[("PostgreSQL /\nEnterprise RDBMS")]
    S1 & S2 --> RD[("Redis / distributed cache")]
~~~

Before virtual threads (pre-Java-21), scaling connection count within one JVM meant either a large, expensive thread pool (each OS thread costs real memory and scheduling overhead, so "thousands of concurrent requests" meant thousands of threads) or reactive programming (Project Reactor/RxJava) trading code complexity for scalability. Virtual threads let ordinary blocking-style code scale to enormous concurrent request counts with a single JVM process, closing much of that historical tradeoff.

### Beyond one machine

- **Stateless services + externalized state**: identical discipline to any language — session/cache state in Redis, scaling is more JVM instances behind a load balancer.
- **JVM startup time and memory footprint** have historically been real considerations for scale-to-zero/serverless deployments (a JVM's warm-up period is a poor fit for extremely short-lived invocations); GraalVM's native image compilation (ahead-of-time compiling Java to a native binary, sacrificing some JIT-driven peak throughput for near-instant startup and lower memory) directly addresses this for serverless/microservice contexts.
- **Kafka, Spark, and Elasticsearch** (all JVM-based) are frequently the actual scaling backbone AI/data-heavy systems depend on even when the application layer itself is Python.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| GC pause impact on tail latency | Switch to ZGC/Shenandoah for sub-millisecond pauses; tune generation sizing for G1 |
| Thread-per-request scaling ceiling (pre-21) | Virtual threads (21+); or reactive programming (Reactor/RxJava) on older versions |
| Slow cold start (serverless/scale-to-zero) | GraalVM native image; class data sharing (CDS/AppCDS); smaller container images |
| Excessive object allocation churn | Escape analysis-friendly code (keep objects method-local); primitive collections for hot paths |
`,

  security: `
### Java-specific dangers

1. **Deserialization vulnerabilities**: Java's built-in object serialization (ObjectInputStream.readObject) executing on untrusted data is a well-documented, historically exploited remote-code-execution vector — the general guidance is to avoid native Java serialization for untrusted data entirely, preferring JSON (Jackson) with explicit, allow-listed types.
2. **XML External Entity (XXE) attacks**: older, default-configured XML parsers (DocumentBuilderFactory and similar) can be tricked into reading arbitrary local files or making network requests via crafted XML — disable external entity processing explicitly unless genuinely needed.
3. **SQL injection**: exactly as dangerous as in any language — use PreparedStatement with parameterized queries (or an ORM like Hibernate/JPA using them internally), never string-concatenate user input into SQL.
4. **Log4Shell (CVE-2021-44228)**: a landmark real-world example — a popular logging library's message-lookup feature allowed remote code execution via a crafted log message containing attacker-controlled JNDI lookup syntax, affecting an enormous swath of the Java ecosystem simultaneously. Lesson embedded in the industry's response: audit even "boring" infrastructure dependencies (logging!) for dangerous default behaviors, and keep dependencies patched aggressively.
5. **Class loading of untrusted code**: dynamically loading and executing classes from untrusted sources (plugin systems, user uploads) is a genuine RCE risk if not carefully sandboxed.

### Cryptography

- Use the javax.crypto and java.security packages' well-audited implementations directly, never hand-rolled cryptographic primitives.
- BCrypt or Argon2 (via a well-maintained library) for password hashing, never a raw hash function.
- SecureRandom, not java.util.Random, for anything security-sensitive (tokens, session IDs, keys) — Random is not cryptographically secure and is predictable.

### Supply chain

- Maven Central artifacts are widely used but not immune to typosquatting or compromised releases — dependency scanning tools (OWASP Dependency-Check, Snyk) checking against known CVEs are a standard CI step.
- Log4Shell specifically drove a significant, ongoing industry-wide push toward automated dependency vulnerability scanning as a non-negotiable practice, not an optional nicety.

See the dedicated **SQL Injection**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond what's Java-specific.
`,

  testing: `
**JUnit 5** is the ecosystem standard test framework, typically paired with **Mockito** for mocking and **AssertJ** for fluent assertions.

~~~java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.assertj.core.api.Assertions.assertThat;

class PricingTest {

    @Test
    void appliesBasicDiscount() {
        assertThat(Pricing.applyDiscount(100, 10)).isEqualTo(90);
    }

    @ParameterizedTest
    @CsvSource({"100, 0, 100", "100, 100, 0", "59.99, 15, 50.99"})
    void discountMatrix(double price, double percent, double expected) {
        assertThat(Pricing.applyDiscount(price, percent)).isCloseTo(expected, within(0.01));
    }

    @Test
    void rejectsInvalidDiscount() {
        assertThatThrownBy(() -> Pricing.applyDiscount(100, 150))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("percent");
    }
}
~~~

### Mocking with Mockito

~~~java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository repository;
    @InjectMocks private OrderService service;

    @Test
    void savesOrderThroughRepository() {
        when(repository.save(any())).thenReturn(new Order(1L, "placed"));
        Order result = service.placeOrder(new OrderRequest(...));
        assertThat(result.status()).isEqualTo("placed");
        verify(repository).save(any());
    }
}
~~~

### The senior testing doctrine

- Test **behavior through public interfaces**, not implementation details — tests should survive internal refactors.
- Prefer **fakes implementing your repository interfaces** over heavy mocking when the interaction is complex — reduces brittle mock-verification tests.
- Constructor injection (rather than field injection) makes plain unit testing (no Spring context needed) the default, fast path; reserve @SpringBootTest (which boots a real application context) for genuine integration tests.
- JaCoCo for coverage reporting; aim for meaningful coverage of business logic, not 100% of trivial getters/setters.
- Testcontainers for integration tests against a real (ephemeral, Dockerized) database instead of mocking the data layer entirely — catches real SQL/ORM-mapping bugs unit tests can't.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the stack trace from the top** (Java stack traces print the innermost/most-recent frame FIRST, the opposite convention from some other languages) — look for the first frame that's YOUR code, not a framework internal.
2. **Conditional breakpoints and the debugger** — IntelliJ IDEA's and Eclipse's debuggers are mature and full-featured; conditional breakpoints (pause only when x > 100) are essential for debugging loops/collections without stepping through every iteration.
3. **jstack <pid>** — dumps every thread's current stack trace instantly; the fastest answer to "why is this service hung" (commonly: a deadlock, or every thread blocked waiting on the same lock/resource).
4. **jcmd and jconsole/VisualVM** — live inspection of heap usage, thread states, and GC activity in a running JVM without restarting it.
5. **Java Flight Recorder (JFR)** — continuous, extremely low-overhead production profiling built directly into the JVM; can be left running in production and analyzed after the fact when an issue occurs.
6. **Heap dumps** (jmap -dump, or automatic on OutOfMemoryError with -XX:+HeapDumpOnOutOfMemoryError) analyzed with Eclipse Memory Analyzer (MAT) — the standard tool for finding exactly what's retaining memory in a leak.

### Debugging deadlocks specifically

~~~bash
jstack <pid> | grep -A 5 "Found one Java-level deadlock"
~~~

jstack explicitly detects and reports classic two-lock deadlocks by name — a genuinely convenient built-in diagnostic most languages' tooling doesn't offer as directly.

### Debugging memory leaks

- Take two heap dumps some time apart under load; compare growth in Eclipse MAT's "dominator tree" view to see exactly which object graph is growing unboundedly.
- Common real-world causes: unbounded caches (a HashMap used as a cache with no eviction policy), listener/callback registrations that are never deregistered, and ThreadLocal values not cleaned up in pooled-thread environments.
`,

  monitoring: `
Production Java visibility rests on the same three pillars as any language (see the Observability category for depth), with mature, JVM-specific tooling:

### Structured logging

~~~java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger log = LoggerFactory.getLogger(OrderService.class);

log.info("order_placed order_id={} user_id={} amount_cents={}", orderId, userId, amountCents);
~~~

SLF4J as the logging facade (with Logback or Log4j2 as the actual implementation) is the ecosystem standard; structured/JSON logging (via a Logback JSON encoder) is standard practice for log aggregation systems.

### Metrics (Micrometer + Prometheus)

~~~java
@Timed(value = "checkout.duration")
public void checkout(Order order) { ... }

Counter.builder("http.requests").tag("route", "/checkout").tag("status", "200")
    .register(meterRegistry).increment();
~~~

Micrometer is Spring Boot's standard metrics facade, with a Prometheus registry the common production choice — tracking the same RED metrics (Rate, Errors, Duration) as any production service.

### JVM-specific signals to watch

- **GC pause time and frequency** (exposed automatically via JFR or Micrometer's JVM metrics binder) — spikes here directly hit tail latency; a rising trend often precedes an OutOfMemoryError.
- **Heap usage trend over time** — a heap that never shrinks back down after GC, growing release over release, is a leading leak indicator.
- **Thread count and thread pool saturation** — especially relevant pre-virtual-threads, where an exhausted thread pool silently queues (or rejects) new requests.
- **Class loading metrics** — unusual growth (common with certain dynamic proxy/bytecode-generation-heavy frameworks misconfigured) can itself become a Metaspace memory issue.

### Tracing (OpenTelemetry / Spring Cloud Sleuth)

The Java OpenTelemetry agent can auto-instrument a huge swath of common frameworks (Spring, JDBC drivers, HTTP clients) with zero code changes via a Java agent flag (-javaagent:opentelemetry-javaagent.jar) — often the fastest path to distributed tracing in an existing Java service.
`,

  deployment: `
### The standard: multi-stage Docker with a JDK build, JRE (or custom) runtime

~~~dockerfile
# ---- build stage ----
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN ./gradlew bootJar --no-daemon

# ---- runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN adduser -D appuser
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", \\
    "-XX:+UseContainerSupport", \\
    "-XX:MaxRAMPercentage=75.0", \\
    "-jar", "app.jar"]
~~~

Why each choice matters: the build stage needs a full JDK (compiler included); the runtime stage needs only a JRE (or, ideally, a jlink-generated custom minimal runtime containing only the modules your app actually uses); -XX:+UseContainerSupport (default since Java 10) makes the JVM correctly read the CONTAINER's memory limit rather than the host's; -XX:MaxRAMPercentage explicitly bounds heap size as a fraction of that container limit, avoiding both OOM-kills (heap too large) and wasted memory (heap too conservative); non-root user mitigates container-escape impact.

### GraalVM native image (optional, for serverless/fast-startup needs)

~~~bash
native-image -jar app.jar
~~~

Ahead-of-time compiling Java directly to a native binary trades some JIT-driven peak throughput and a more restrictive reflection/dynamic-class-loading model for near-instant startup and dramatically lower memory footprint — the standard answer when JVM warm-up time is itself the problem (serverless functions, scale-to-zero microservices).

### Serving topology

- Spring Boot ships an embedded server (Tomcat, Netty, or Jetty) by default — no separate application server installation needed, a significant simplification versus the old-style external application-server deployment model (WebLogic, WebSphere) common in the 2000s.
- Health endpoints via Spring Boot Actuator (/actuator/health, /actuator/metrics) wired to orchestrator probes.
- Graceful shutdown: handle SIGTERM, stop accepting new requests, let in-flight requests drain (Spring Boot's graceful shutdown support, or manual ExecutorService shutdown hooks).

### CI/CD pipeline

Build (Maven/Gradle) → static analysis (SpotBugs/Error Prone) → test (JUnit + Testcontainers) → dependency scan (OWASP Dependency-Check) → build image → push → deploy with rolling update. See the **CI/CD** and **GitHub Actions** skills.
`,

  "production-checklist": `
Before a Java service takes real traffic:

- [ ] Build file (pom.xml/build.gradle) with a pinned, locked dependency tree; JDK version pinned (17 or 21 LTS)
- [ ] Static analysis (SpotBugs/Error Prone) and a formatter enforced in CI on every PR
- [ ] JUnit test suite green, including integration tests (Testcontainers) for the data layer
- [ ] Config externalized (Spring profiles/env vars), validated at startup, fail-fast on missing values
- [ ] Structured logging (SLF4J + Logback JSON) with correlation IDs
- [ ] JVM container-awareness flags set correctly (-XX:+UseContainerSupport, -XX:MaxRAMPercentage)
- [ ] Garbage collector explicitly chosen for the workload's latency/throughput tradeoff, not left at an unexamined default
- [ ] Health endpoints (Spring Boot Actuator or equivalent) wired to orchestrator probes
- [ ] Graceful SIGTERM handling verified (in-flight requests drain before exit)
- [ ] Micrometer/Prometheus metrics: request rate, error rate, p95/p99 latency, JVM GC/heap metrics
- [ ] Error tracking (Sentry or equivalent) wired with proper stack-trace symbolication
- [ ] Dependency vulnerability scan (OWASP Dependency-Check/Snyk) in CI, given the post-Log4Shell industry standard
- [ ] No secrets in code/config files in git; vault or platform secret store
- [ ] Load test done: know your requests/sec ceiling and failure mode, including under GC pressure
- [ ] Runbook: how to roll back, scale up, and read the dashboards (including jstack/heap-dump procedure for incidents)
`,

  "common-mistakes": `
1. **Using == instead of equals() for object comparison** — see Anti-Patterns; the Integer caching behavior makes this bug intermittently "work," which is precisely what makes it dangerous.
2. **Returning null instead of Optional or an empty collection** — forces every caller to remember a null check, the classic root cause behind a huge share of NullPointerExceptions.
3. **Violating the equals/hashCode contract** by overriding one without the other — silently breaks HashMap/HashSet behavior in confusing, hard-to-reproduce ways.
4. **String concatenation with + inside a loop** — creates a new immutable String object every iteration; use StringBuilder.
5. **Catching Exception or Throwable broadly** and swallowing it — hides real bugs, and can even suppress conditions (like OutOfMemoryError) you genuinely cannot safely recover from at that point.
6. **Field injection instead of constructor injection** in Spring — makes unit testing without the full Spring context harder, and hides a class's real dependency list.
7. **Deep inheritance hierarchies** for code reuse instead of composition — a classic, widely taught Java anti-pattern that still recurs in real codebases.
8. **Not closing resources** (files, connections, streams) without try-with-resources — resource leaks that eventually manifest as "too many open files" or connection-pool exhaustion errors.
9. **Assuming Integer == works for all values** because it "worked" during testing with small numbers — the -128..127 caching range is an implementation detail, not a language guarantee to rely on.
10. **Blocking indefinitely on I/O with no timeout** — HTTP clients, database drivers, and socket operations should always have explicit timeouts configured; the default is frequently "wait forever," a real production risk.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| NullPointerException | Calling a method on a null reference — historically Java's most common runtime error | Use Optional for maybe-absent values; modern Java (14+) gives "helpful NPEs" pinpointing the exact null expression |
| ClassCastException | An unsafe cast, or (rarely, pre-generics-era code) a raw-type collection mixing types | Use generics properly; avoid unchecked casts flagged by the compiler |
| ConcurrentModificationException | Modifying a collection while iterating it directly (not via the iterator's own remove) | Use Iterator.remove(), a CopyOnWriteArrayList, or collect changes and apply them after iteration |
| OutOfMemoryError: Java heap space | Genuine memory leak, or heap sized too small for the actual workload | Heap dump analysis (Eclipse MAT); increase -Xmx if legitimately undersized; fix the retaining reference if a real leak |
| StackOverflowError | Unbounded or excessively deep recursion | Add a base case; convert to an iterative algorithm for genuinely deep recursion |
| Found one Java-level deadlock (jstack) | Two threads acquiring the same two locks in opposite order | Establish and enforce a consistent lock-acquisition ordering |
| NoClassDefFoundError | A class was present at compile time but missing (or a version mismatch) at runtime classpath | Check the runtime classpath/dependency versions match what was compiled against |
| UnsupportedOperationException | Calling a mutating method (add/remove) on an immutable collection (List.of, Collections.unmodifiableList) | Use a genuinely mutable collection (new ArrayList<>(...)) if mutation is actually needed |
| java.sql.SQLException: Connection is closed | Using a database connection after it's been returned to the pool or closed | Ensure connection lifecycle matches try-with-resources scope; check connection pool configuration |
| OutOfMemoryError: Metaspace | Excessive dynamic class generation/loading (common with certain misconfigured proxy-heavy frameworks) or a genuine classloader leak in an app-server-style redeployment scenario | Increase -XX:MaxMetaspaceSize if legitimate; investigate classloader leaks otherwise |

The habit that matters: read the full stack trace (Java's convention prints the deepest/most-recent frame first), use jstack/heap dumps for anything concurrency- or memory-shaped, and fix the actual retaining reference or lock ordering rather than papering over the symptom with a restart.
`,

  faqs: `
**Q: Is Java "too verbose" compared to modern languages?**
Less true than it used to be — records (Java 16+), var type inference (10+), pattern matching, and the Stream API have all substantially reduced classic Java boilerplate. Historical Java (getters/setters/equals/hashCode by hand) earned the reputation; modern Java has deliberately addressed much of it.

**Q: Is Java slow?**
Not meaningfully, for most workloads, after JIT warm-up — the HotSpot JVM's Just-In-Time compilation routinely achieves performance competitive with statically compiled languages for long-running services. Where Java genuinely loses ground is cold-start latency (mitigated by GraalVM native image) and truly hard-real-time or embedded contexts where a garbage collector's pauses are unacceptable regardless of how well-tuned.

**Q: Should I use checked exceptions?**
Modern Java style has largely converged on preferring unchecked exceptions for most application-level errors, reserving checked exceptions for narrow, genuinely recoverable conditions at clear API boundaries — checked exceptions interact poorly with lambdas/streams and functional-style code, a real, widely-felt ergonomic cost.

**Q: Are virtual threads a replacement for reactive programming (Project Reactor/RxJava)?**
For most services whose reactive adoption was purely about scaling concurrent I/O (not genuinely needing reactive's backpressure/composition operators for their own sake), yes — virtual threads let you write simple, blocking-style code and get comparable scalability with far less cognitive overhead. Reactive programming remains genuinely useful for its composition model in specific cases, but it's no longer the ONLY path to high concurrency in Java.

**Q: Maven or Gradle?**
Both are fully production-viable; Maven's XML-based, convention-heavy model is often considered more predictable for large teams and simpler build needs, while Gradle's Groovy/Kotlin DSL and incremental build model appeal to teams wanting more build-logic flexibility and faster iterative builds. Many large companies (Google, notably) use Gradle at scale; many enterprises default to Maven for its stability and ubiquity.

**Q: What Java version should I target?**
An LTS release (17 or 21 as of this writing) for production; 21 specifically if virtual threads, record patterns, or sealed classes materially benefit your codebase. Non-LTS releases are fine for staying current with the latest previews but require more frequent upgrade cycles than most enterprises want to commit to.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between == and equals() for objects?* == compares references (identity, do they point to the same object) for non-primitives; equals() compares content/value, and should be overridden (alongside hashCode) for meaningful value comparison.
2. *What is autoboxing?* Automatic conversion between a primitive (int) and its wrapper object (Integer), needed because generics require object types; it happens implicitly but has real allocation cost in hot paths.
3. *Explain checked vs unchecked exceptions.* Checked exceptions must be declared (throws) or caught, enforced by the compiler; unchecked (RuntimeException and subclasses) are optional to catch — a genuinely debated Java-specific design choice.
4. *What is a record, and what does it generate automatically?* A concise, immutable data carrier (Java 16+) that auto-generates the constructor, accessors, equals, hashCode, and toString from its declared components.
5. *Interface vs abstract class — when would you use each?* Interfaces for a pure behavioral contract (a class can implement many); abstract classes when you need to share actual field state or partial implementation across a family of related classes (a class can extend only one).

**Senior:**

6. *Explain how the JVM's garbage collector works, generationally.* New objects allocate in the young generation (Eden); most die quickly and are collected cheaply; survivors get promoted to the old generation, collected far less often — exploiting the empirical "most objects die young" observation for overall throughput.
7. *What is type erasure, and what does it prevent you from doing?* Generic type parameters exist only at compile time and are erased at runtime for backward compatibility with pre-generics bytecode; this is why you can't do new T(), can't create a generic array directly, and why List<String> and List<Integer> share the same runtime Class object.
8. *Explain virtual threads and how they differ from platform (OS) threads.* JVM-managed, extremely lightweight threads that can number in the millions; when a virtual thread blocks on I/O, the JVM unmounts it from its carrier OS thread automatically, freeing that thread for other work — ordinary blocking-style code achieves goroutine-like scalability without an async/await coloring problem.
9. *Design choice: 10,000 concurrent slow database calls in a service.* Pre-21: a large thread pool (memory-expensive) or reactive programming; 21+: virtual threads with ordinary blocking JDBC calls, letting the JVM handle the I/O-parking transparently — discuss the tradeoff each approach makes and why virtual threads changed the calculus.
10. *What's the Java Memory Model's role, and when does volatile matter?* The JMM formally defines what visibility/ordering guarantees exist between threads; without volatile (or proper synchronization), a write by one thread is not guaranteed to ever become visible to another thread reading the same field — a subtler bug than a classic race condition, since it can manifest as permanent staleness rather than a crash.
11. *Walk through the equals/hashCode contract and a real bug it prevents.* Equal objects MUST produce the same hashCode (the reverse isn't required); violating this silently breaks HashMap/HashSet — an object added to a HashSet can become "invisible" to a later contains() check with an equal object, because it hashed into a different bucket than expected.
12. *How would you diagnose a production JVM service experiencing GC-related latency spikes?* Enable/inspect JFR recordings or Micrometer's JVM GC metrics for pause frequency/duration; consider switching from G1 to ZGC/Shenandoah if pause time (not throughput) is the actual bottleneck; check for allocation-heavy hot paths via async-profiler's allocation flame graphs before assuming the collector itself is misconfigured.
`,

  "coding-questions": `
### 1. Thread-safe LRU cache (tests generics + collections + synchronization)

~~~java
import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // accessOrder=true reorders on get()
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;        // eviction policy expressed as a single override
    }

    public synchronized V getSync(K key) { return get(key); }
    public synchronized void putSync(K key, V value) { put(key, value); }
}
~~~

Discussion: LinkedHashMap's accessOrder mode plus removeEldestEntry gives an LRU cache almost for free; follow-up asks about lock granularity (a single synchronized method serializes ALL access — discuss ReadWriteLock or a segmented approach for real contention).

### 2. Flatten arbitrarily nested lists (tests recursion + generics + Optional-style null handling)

~~~java
import java.util.*;

public static List<Object> flatten(List<?> nested) {
    List<Object> result = new ArrayList<>();
    for (Object item : nested) {
        if (item instanceof List<?> inner) {           // pattern matching for instanceof (16+)
            result.addAll(flatten(inner));
        } else {
            result.add(item);
        }
    }
    return result;
}

// flatten(List.of(1, List.of(2, List.of(3, List.of(4)), 5))) -> [1, 2, 3, 4, 5]
~~~

Discussion: pattern matching for instanceof (Java 16+) eliminates the old cast-after-check ceremony; follow-up asks for a Stream-based version using flatMap for practice with functional-style recursion-avoidance where applicable.

### 3. Rate limiter — token bucket (production-flavored, tests concurrency + records)

~~~java
import java.util.concurrent.atomic.AtomicReference;

public class TokenBucket {
    private record State(double tokens, long lastNanos) {}
    private final double rate, capacity;
    private final AtomicReference<State> state;

    public TokenBucket(double rate, double capacity) {
        this.rate = rate;
        this.capacity = capacity;
        this.state = new AtomicReference<>(new State(capacity, System.nanoTime()));
    }

    public boolean allow() {
        while (true) {
            State current = state.get();
            long now = System.nanoTime();
            double elapsedSec = (now - current.lastNanos()) / 1_000_000_000.0;
            double refilled = Math.min(capacity, current.tokens() + elapsedSec * rate);
            if (refilled < 1.0) {
                if (state.compareAndSet(current, new State(refilled, now))) return false;
            } else {
                State next = new State(refilled - 1.0, now);
                if (state.compareAndSet(current, next)) return true;
            }
        }
    }
}
~~~

Discussion: a lock-free implementation using AtomicReference.compareAndSet with an immutable record as the state snapshot — a genuinely idiomatic modern-Java concurrency pattern, avoiding explicit locks entirely; follow-up asks to compare against a simpler synchronized version and discuss the tradeoffs.
`,

  "hands-on-labs": `
### Lab 1 — CLI todo app (beginner, ~1h)
Build a todo CLI storing tasks in JSON (using Jackson): add/list/done/delete commands, records for the Task type, java.nio.file for storage. Skills: records, collections, basic file I/O, a JSON library.

### Lab 2 — Concurrent web scraper (intermediate, ~2h)
Fetch the status of 200 URLs three ways: sequential (java.net.http.HttpClient, blocking), a fixed thread pool (ExecutorService), and virtual threads (Executors.newVirtualThreadPerTaskExecutor(), Java 21+). Time all three; discuss the results. Skills: HttpClient, ExecutorService, virtual threads viscerally.

### Lab 3 — Mini dependency injection container (advanced, ~4h)
Implement a tiny DI container from scratch: scan classes for a custom @Inject annotation using reflection, resolve constructor dependencies recursively, wire up a small object graph. You'll genuinely understand what Spring's ApplicationContext does afterward. Skills: reflection, annotations, generics.

### Lab 4 — Instrument and deploy (production, ~3h)
Take Lab 2's scraper, wrap it in a Spring Boot REST endpoint (POST /scrape), add SLF4J structured logs, Micrometer/Prometheus metrics, Actuator health endpoints, a multi-stage Dockerfile with proper container-aware JVM flags, and run it in Docker with resource limits. Load test with a tool like hey or JMeter. Skills: the whole production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **A Spring Boot inventory/order management API** — Full CRUD with a real relational database (PostgreSQL via Spring Data JPA), proper layered architecture (controller/service/repository), validation, and a comprehensive test suite (unit + Testcontainers integration tests). Demonstrates: the classic, still extremely common enterprise Java web-service shape.

2. **A virtual-threads-powered LLM API gateway** — A Spring Boot (or plain Java HTTP server) service proxying requests to one or more LLM provider APIs, using virtual threads to handle very high concurrent connection counts with simple blocking-style code, streaming responses back, tracking per-provider cost/latency metrics. Demonstrates: modern Java's concurrency story applied directly to an AI-engineering-relevant problem.

3. **A from-scratch mini ORM** — Implement a small object-relational mapper: annotation-based entity mapping, a basic query builder, connection pooling. You'll deeply understand what Hibernate/JPA actually do under the hood afterward. Demonstrates: reflection, annotations, JDBC fundamentals, and genuine "how does the framework work" depth that stands out in interviews.

Each project: Maven or Gradle with a locked dependency tree, full JUnit test suite (unit + Testcontainers where relevant), CI via GitHub Actions, README with an architecture diagram. The engineering discipline around the code is what gets senior interviews, exactly as with any language on this platform.
`,

  "case-studies": `
### Netflix: Java/Spring Boot microservices at massive scale
Netflix built one of the industry's most influential large-scale Java microservices architectures, open-sourcing widely adopted tools (Eureka for service discovery, Hystrix for circuit-breaking, and others from their "Netflix OSS" catalog) that shaped how the broader industry builds resilient distributed Java systems. Lesson: Java's mature ecosystem and Netflix's own engineering investment produced patterns (circuit breakers, service discovery) that became industry-standard concepts well beyond Java itself.

### Log4Shell (2021): a supply-chain wake-up call
A critical remote-code-execution vulnerability in the widely used Log4j logging library (a message-lookup feature processing attacker-controlled JNDI syntax) affected an enormous share of Java's ecosystem simultaneously, since logging libraries are transitively depended on almost everywhere. The industry response drove a lasting, widespread shift toward automated dependency vulnerability scanning as a default CI practice rather than an optional add-on. Lesson: even the most "boring," ubiquitous infrastructure dependency (a logging library) can be a critical attack surface — auditing dependencies isn't optional at scale.

### Project Loom / virtual threads: a decade-long concurrency rethink
Virtual threads (finalized in Java 21, 2023) were the culmination of years of dedicated engineering (Project Loom) specifically to close the ergonomic gap between Java's traditional thread-per-request model and lighter-weight concurrency primitives in newer languages (Go's goroutines being the most-cited comparison), WITHOUT requiring existing code to be rewritten in a reactive/async style. Lesson: a mature, widely-deployed language can make a genuinely fundamental runtime change (how concurrency works) while preserving near-total backward compatibility with existing code style — a difficult, deliberately engineered achievement.

### Amazon Corretto: a major cloud provider building its own JDK distribution
Amazon's decision to build and maintain Corretto (its own free, production-ready, long-term-supported OpenJDK distribution) rather than relying solely on Oracle's or others' builds reflects how central Java remains to AWS's own infrastructure and to a huge share of their customers' workloads. Lesson: even amid genuine industry diversification toward Go, Rust, and other newer languages, Java's install base and criticality to existing systems remains large enough that a major cloud provider invests directly in owning its own JDK supply chain.
`,

  comparisons: `
| Dimension | Java | Kotlin | C# | Go | Python |
|-----------|------|--------|-----|-----|--------|
| Runtime | JVM (bytecode, JIT) | JVM (fully interoperable with Java) | .NET CLR (conceptually similar to JVM) | Native binary, no VM | CPython interpreter |
| Typing | Static, verbose historically, less so now (records, var) | Static, concise by design | Static, modern and concise | Static, minimalist | Dynamic + optional hints |
| Concurrency | Threads; virtual threads (21+) close the goroutine gap | Coroutines (structured, lightweight) plus full Java interop | async/await, Tasks | Goroutines + channels (CSP) | asyncio (GIL-bound) or multiprocessing |
| Null safety | Historically null-heavy; Optional and modern patterns mitigate | Null safety built into the type system itself | Nullable reference types (opt-in, C# 8+) | No null; explicit zero values | None built-in; hints can flag Optional-style patterns |
| Ecosystem maturity | Enormous, decades-deep (Maven Central) | Full access to the entire Java ecosystem | Enormous within .NET, growing cross-platform | Growing, infrastructure-focused | Enormous, AI/data-dominant |
| Best at | Large, long-lived enterprise systems, JVM infrastructure | Modern JVM development, Android | Enterprise .NET shops, Windows-adjacent, Unity games | Cloud-native infra, networked services | AI/data, glue, iteration speed |

**How seniors choose**: Java for large, long-lived enterprise systems where its ecosystem maturity, tooling, and backward-compatibility guarantees matter, or when integrating with existing JVM infrastructure (Kafka, Spark, Elasticsearch); Kotlin when starting a NEW JVM project today and wanting more modern ergonomics with full Java interop (the dominant choice for new Android development); Go for greenfield cloud-native infrastructure prioritizing simplicity and fast builds; Python when AI/data work dominates. A common real-world shape: a large enterprise's core systems remain Java, while newer AI-feature services around them are Python, connected via Kafka or REST/gRPC.
`,

  "related-technologies": `
- **Spring Boot / Spring Framework** — the dominant Java application framework; see the dedicated Spring Boot skill for depth.
- **Kotlin** — a modern, fully Java-interoperable JVM language, increasingly the default choice for new JVM projects and Android development specifically.
- **Maven / Gradle** — the two dominant build tools; either is a fully viable production choice.
- **Hibernate / JPA** — the standard ORM layer for relational data access in Java applications.
- **Kafka** — while its core is Scala/JVM, its client ecosystem is deeply Java-centric; the standard choice for event streaming in JVM-heavy architectures.
- **Elasticsearch** — written in Java; foundational search/retrieval infrastructure that AI/RAG systems frequently depend on directly.
- **JUnit 5 / Mockito / Testcontainers** — the standard testing stack.
- **GraalVM** — enables native-image compilation for fast-startup, low-memory Java deployments (serverless, CLI tools).
- **Project Loom (virtual threads) / Project Panama (foreign function interface)** — the two most significant ongoing JVM platform evolution efforts.

On this platform, the natural next pages: **Spring Boot** → **PostgreSQL** → **Kafka** → **Docker** → **System Design**.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check the OpenJDK project pages and Oracle's release notes for anything newer.

- **Java 21** (Sep 2023, LTS): virtual threads finalized (Project Loom), record patterns and pattern matching for switch finalized, sequenced collections (a new interface unifying "has a defined encounter order" collections), and generational ZGC.
- **Java 22/23** (2024): continued Project Amber ergonomics work (unnamed variables/patterns, statements before super() in constructors as a preview), and ongoing Project Panama (Foreign Function & Memory API) stabilization for safer, more ergonomic native-code interop.
- **Java 24/25** (expected 2025, with 25 as the next LTS): continued structured concurrency (building further on virtual threads — scoping related concurrent tasks together with unified error handling and cancellation) progressing through preview stages toward finalization. Verify specifics against the official release notes as this stabilizes.
- **Ecosystem shifts that matter more than individual language features**: Kotlin's continued growth as the default choice for new JVM/Android projects; the accelerating industry-wide adoption of virtual threads for I/O-bound services since Java 21's release, often cited as reducing the need for reactive-programming complexity; GraalVM native image seeing growing adoption specifically for serverless and CLI-tool use cases.
- **Support window**: LTS releases (17, 21, and future 25) receive multi-year support from Oracle and the broader OpenJDK ecosystem (Amazon Corretto, Eclipse Temurin, etc.); non-LTS releases receive only 6 months of support until the next release — production systems should target an LTS release specifically.
`,

  "future-roadmap": `
Where Java is heading over the next few releases:

1. **Virtual threads' ecosystem effects keep compounding.** As more frameworks and libraries become fully virtual-thread-aware (avoiding legacy patterns like ThreadLocal-heavy code or synchronized blocks that can "pin" a virtual thread to its carrier), expect the practical performance and simplicity benefits to keep improving beyond the initial Java 21 release itself.
2. **Structured concurrency matures.** Building on virtual threads, structured concurrency (treating a group of related concurrent subtasks as a single unit with unified cancellation and error handling) is progressing through preview releases — expect it to become the idiomatic way to compose concurrent operations safely, addressing a class of bugs (orphaned subtasks, inconsistent error propagation) that ad-hoc thread/executor management makes easy to get wrong.
3. **Project Panama continues easing native interop.** The Foreign Function & Memory API aims to make calling native code and manipulating off-heap memory safer and more ergonomic than the historical JNI (Java Native Interface), directly relevant to Java code needing to interface with native ML/inference libraries.
4. **Pattern matching and data-oriented programming deepen.** Continued refinement of record patterns, sealed classes, and switch expressions points toward Java increasingly supporting a "data-oriented" style (precise, exhaustively-matched data modeling) alongside its classical OOP roots, narrowing the ergonomic gap with languages like Rust's enums or Kotlin's sealed classes.
5. **GraalVM native image adoption keeps growing** for serverless and CLI use cases specifically, as the tradeoffs (some peak-throughput and reflection-flexibility cost, for dramatically better startup/memory) become better understood and tooled around industry-wide.

For your career: bet on genuinely fluent virtual-threads-based concurrency, comfort with modern data-oriented constructs (records, sealed classes, pattern matching), and — given Java's enterprise concentration — the ability to navigate large, long-lived codebases confidently. Those separate "knows Java syntax" from "senior Java engineer who ships reliable enterprise systems" over the next several years.
`,

  "cheat-sheet": `
~~~java
// --- Variables & types ---
int age = 36; double pi = 3.14159; boolean active = true;
var inferred = "Ada";           // still statically typed, just inferred

// --- Primitives vs objects ---
int primitive = 5;               // no object overhead
Integer boxed = 5;                // autoboxed — needed for generics

// --- Collections ---
List<String> xs = new ArrayList<>(List.of("a", "b"));
Map<String, Integer> m = new HashMap<>();
m.put("a", 1); m.getOrDefault("z", -1);
Set<String> unique = new HashSet<>(xs);

// --- Streams ---
List<String> result = xs.stream()
    .filter(s -> s.length() > 1)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());

// --- Records (Java 16+) ---
public record User(int id, String name) {}
// auto-generates constructor, accessors, equals, hashCode, toString

// --- Sealed classes + pattern matching (Java 21+) ---
sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}
double area = switch (shape) {
    case Circle c -> Math.PI * c.r() * c.r();
    case Square s -> s.side() * s.side();
};

// --- Optional (no null returns) ---
Optional<User> find(int id) { ... }
find(1).map(User::name).orElse("unknown");

// --- Exceptions ---
try { risky(); }
catch (SpecificException e) { handle(e); }
finally { cleanup(); }
// checked: must declare "throws" or catch; unchecked: RuntimeException subclasses

// --- Interfaces & generics ---
interface Shape2 { double area(); default String describe() { return "shape"; } }
class Box<T> { T value; T get() { return value; } }

// --- Concurrency ---
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {   // Java 21+
    executor.submit(() -> blockingWork());
}
synchronized (lock) { criticalSection(); }
AtomicInteger counter = new AtomicInteger(0);

// --- Equality ---
a.equals(b);          // content comparison — use this, not ==
Objects.hash(x, y);   // consistent hashCode helper

// --- Toolchain ---
// mvn clean package / ./gradlew build
// java -jar app.jar
// jstack <pid> / jmap -dump / jfr print
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| == vs equals() | == compares references (identity); equals() compares content — always use equals() for value comparison |
| What is autoboxing? | Automatic conversion between a primitive and its wrapper object (int to Integer), needed for generics |
| Checked vs unchecked exceptions | Checked must be declared/caught (compiler-enforced); unchecked (RuntimeException) are optional |
| What does a record auto-generate? | Constructor, accessors, equals, hashCode, toString from its declared components |
| What is type erasure? | Generic type parameters exist only at compile time and are erased at runtime, for backward compatibility |
| The equals/hashCode contract | Equal objects MUST share a hashCode; different objects CAN share one (collision is fine) |
| What are virtual threads? | JVM-managed, extremely lightweight threads (millions possible); unmounted from the OS thread automatically during I/O blocking |
| Interface vs abstract class | Interface: pure contract, implement many; abstract class: shared state/partial implementation, extend only one |
| Why does Java "warm up"? | The JIT compiler profiles hot methods and compiles them to native code at RUNTIME, not ahead of time |
| Generational GC's core idea | Most objects die young — collect the young generation frequently and cheaply, the old generation rarely |
| What does volatile guarantee? | Visibility of a field's writes across threads — without it, a write may never become visible to another thread |
| sealed + switch pattern matching | Restricts which classes implement an interface; the compiler verifies exhaustive handling in a switch |
| StringBuilder vs + in a loop | + creates a new immutable String each iteration; StringBuilder mutates one buffer — always prefer it in loops |
| jstack's most useful trick | Automatically detects and names classic two-lock deadlocks |
| Java's core promise | "Write once, run anywhere" — bytecode plus a per-platform JVM, not native per-platform compilation |
`,

  mcqs: `
**1. What does this print?**

~~~java
String a = new String("hi");
String b = new String("hi");
System.out.println(a == b);
System.out.println(a.equals(b));
~~~

A) true, true  B) false, false  C) false, true  D) true, false

**Answer: C** — == compares references (two separate String objects here, so false); equals() compares content (both "hi", so true).

**2. Which best describes type erasure?**

A) Generics are checked at runtime only  B) Generic type parameters exist only at compile time and are removed from bytecode  C) All types are erased and Java becomes dynamically typed  D) Only primitive types are erased

**Answer: B** — this is exactly type erasure; it's why List<String> and List<Integer> share the same runtime Class object.

**3. What happens when a virtual thread blocks on I/O (Java 21+)?**

A) The entire JVM pauses  B) It is unmounted from its carrier OS thread, freeing that thread for other virtual threads  C) It throws an exception  D) It's promoted to a platform thread permanently

**Answer: B** — this automatic unmounting is exactly what lets virtual threads scale to very high concurrency with ordinary blocking-style code.

**4. Which statement about equals() and hashCode() is TRUE?**

A) Two equal objects can have different hashCodes  B) Two objects with the same hashCode must be equal  C) Two equal objects must have the same hashCode  D) Overriding one automatically overrides the other

**Answer: C** — this is the required direction of the contract; the reverse (same hashCode implies equal) is explicitly NOT required — collisions are allowed.

**5. What is the generational garbage collector's core assumption?**

A) All objects live equally long  B) Most objects die young, so the young generation should be collected frequently and cheaply  C) Old objects should be collected more often than young ones  D) Garbage collection should never run during normal operation

**Answer: B** — this empirical observation (the "generational hypothesis") is the foundation of how G1, ZGC, and most modern collectors are designed.

**6. Which is the recommended fix for string concatenation inside a loop with many iterations?**

A) Keep using +  B) Use StringBuilder and append in the loop, converting to a String once at the end  C) Use == instead of equals  D) Disable garbage collection during the loop

**Answer: B** — + creates a new immutable String object every iteration; StringBuilder mutates one growable buffer, avoiding that repeated allocation.
`,

  "revision-notes": `
**Language core in 8 lines:** Statically typed, compiled to portable bytecode, runs on the JVM ("write once, run anywhere"). Eight primitives are not objects; generics require objects, so autoboxing converts automatically. Collections Framework: List/Map/Set interfaces, ArrayList/HashMap/HashSet the default implementations. == compares references; equals() compares content — always use equals() for value comparison, and keep hashCode consistent with it. Records (16+) auto-generate the constructor/accessors/equals/hashCode/toString for immutable data. Sealed classes + pattern matching for switch (21+) give exhaustive, discriminated-union-style modeling. Streams (8+) bring functional-style filter/map/collect pipelines.

**Concurrency in 5 lines:** Virtual threads (21+) are JVM-managed, extremely lightweight threads that unmount from their carrier OS thread during I/O blocking, letting ordinary blocking-style code scale to massive concurrency without async/await. The Java Memory Model formally defines cross-thread visibility; volatile and proper synchronization are required for correctness, not just avoiding crashes — unsynchronized code can silently show stale values forever. synchronized blocks and AtomicReference/AtomicInteger (compare-and-swap) are the two classic tools for protecting shared state. jstack automatically detects classic two-lock deadlocks by name.

**Runtime in 4 lines:** javac compiles to bytecode; the JVM interprets it initially, then JIT-compiles hot methods to native code after profiling ("warm-up" is real and affects benchmarking). Generational garbage collection (young generation collected cheaply and often; old generation rarely) exploits the "most objects die young" observation for throughput. Class loading is lazy — a class loads, verifies, and initializes only on first actual reference.

**Production in 5 lines:** Maven or Gradle with a locked dependency tree; target an LTS JDK (17 or 21). SLF4J + Logback JSON structured logging; Micrometer/Prometheus for RED metrics plus JVM GC/heap metrics. Container-aware JVM flags (-XX:+UseContainerSupport, -XX:MaxRAMPercentage) are non-negotiable in Docker/Kubernetes. Dependency vulnerability scanning (post-Log4Shell industry standard) in CI. GraalVM native image for fast-startup/serverless needs.

**Interview reflexes:** ==/equals()/hashCode() contract, autoboxing and its cost, type erasure's practical consequences, virtual threads vs platform threads, generational GC's core hypothesis, volatile and the JMM, checked vs unchecked exceptions' tradeoffs, why Java benchmarks need JIT warm-up.
`,

  "learning-roadmap": `
A realistic path to senior-level Java (adjust pace to your background):

**Week 1–2 — Foundations.** Beginner Concepts section + Lab 1. Daily: solve small problems using collections, control flow, and basic classes. Milestone: build any CLI tool you'll actually use, using records for its data types.

**Week 3–4 — Idiomatic modern Java.** Intermediate Concepts: interfaces, generics, streams, records, exceptions. Refactor Week-1 code to use streams and records where natural. Milestone: you reach for a record instead of a hand-written POJO without thinking.

**Week 5–6 — Concurrency and internals.** Advanced Concepts + Lab 2 (concurrent scraper). Build the same task with a thread pool AND virtual threads; understand the JVM's generational GC and JIT warm-up well enough to explain them to someone else. Milestone: the three-way scraper benchmark and a paragraph explaining the results.

**Week 7–8 — Internals + architecture.** Internal Working, Architecture, Data Flow sections; Lab 3 (mini DI container). Read a small real Java library's source. Milestone: jstack and a heap dump hold no mystery.

**Week 9–10 — Production.** Production Usage → Deployment sections; Lab 4. Milestone: a containerized (container-aware JVM flags), instrumented Spring Boot service on your GitHub with a real test suite.

**Week 11–12 — Interview polish + first real project.** Interview/Coding Questions sections; start Real Project 2 (virtual-threads LLM gateway). Milestone: explain the equals/hashCode contract, virtual threads, type erasure, and generational GC out loud, unprompted.

Then continue to **Spring Boot** on this platform — everything here compounds there.
`,

  "official-docs": `
- [Oracle Java Documentation](https://docs.oracle.com/en/java/javase/) — the official reference, including the JLS (Java Language Specification) for precise semantics.
- [OpenJDK](https://openjdk.org/) — the open-source reference implementation project; where the language and JVM actually evolve in the open.
- [The Java Tutorials](https://docs.oracle.com/javase/tutorial/) — Oracle's official, genuinely solid introductory tutorial series.
- [JEP Index](https://openjdk.org/jeps/0) — Java Enhancement Proposals; read the JEPs for virtual threads (444), records (395), and pattern matching for switch (441) to understand exactly what shipped and why.
- [Baeldung](https://www.baeldung.com/) — not official, but consistently high-quality, precise coverage of nearly every Java/Spring topic.
- [Spring documentation](https://docs.spring.io/) — essential once you move to Spring Boot specifically.
- [Maven Central](https://central.sonatype.com/) — the standard dependency repository; browse it to understand the ecosystem's breadth.
`,

  books: `
- **Effective Java, 3rd ed.** — Joshua Bloch. THE canonical Java book; specific, numbered items on doing things correctly, written by a JDK architect. Read this early and often.
- **Java Concurrency in Practice** — Brian Goetz et al. The definitive treatment of Java's concurrency model, the Java Memory Model, and correct multithreaded design — still the standard reference despite predating virtual threads.
- **Modern Java in Action** (or its predecessor Java 8 in Action) — Urma, Fusco, Mycroft. The best treatment of streams, lambdas, and the functional-style shift Java 8 brought.
- **Spring in Action, 6th ed.** — Craig Walls. The standard practical introduction once you move to Spring Boot.
- **Java Performance: The Definitive Guide, 2nd ed.** — Scott Oaks. Deep, precise coverage of the JIT, garbage collectors, and profiling — the Performance section of this page, book-length.
- **Core Java, Volumes I & II** — Cay Horstmann. Thorough, up-to-date, and frequently used as a comprehensive reference alongside more opinionated books like Effective Java.
`,

  blogs: `
- **Baeldung** (baeldung.com) — consistently excellent, precise, up-to-date coverage across nearly every Java and Spring topic; often the first search result for good reason.
- **Java Magazine / Inside Java** (inside.java) — official Oracle content, including deep dives on new features like virtual threads directly from the OpenJDK team.
- **Brian Goetz's talks and writing** — the Java Language Architect at Oracle; authoritative insight into concurrency, records, and pattern matching design decisions.
- **Nicolai Parlog's blog** (nipafx.dev) — deep, precise Java language-feature explainers, especially strong on newer features (records, sealed classes, pattern matching).
- **DZone (Java zone)** — a large aggregator of community Java content, useful for breadth.
- **Netflix Tech Blog** — the large-scale Java/Spring Boot microservices war stories referenced in Case Studies.
- **The Java Posse / Java Off-Heap podcasts** — for audio-format ongoing ecosystem coverage.
`,

  "research-papers": `
Java-relevant systems literature worth reading as a senior engineer:

- **"The Java Virtual Machine Specification"** (Lindholm, Yellin, Bracha, Buckley — the official spec, book-length but authoritative) — the precise definition of bytecode, class file format, and verification rules; closer to a formal specification than a typical paper, but the primary source for JVM internals.
- **"Java Memory Model" (JSR-133)** design documents (Manson, Pugh, Adve) — the formal specification of what visibility/ordering guarantees exist between threads, the theoretical foundation behind volatile and synchronized.
- **"Garbage Collection: Algorithms for Automatic Dynamic Memory Management"** (Jones, Lins) — not Java-specific, but the foundational text on generational and tracing garbage collection algorithms that Java's collectors implement.
- **"Escape Analysis for Java"** (Choi, Gupta, Serrano, Sreedhar, Midkiff, 1999-2003 era papers) — the technique behind the JIT's ability to stack-allocate objects that provably don't escape a method.
- **Project Loom's own design documents** (available via the OpenJDK Loom project pages, written by Ron Pressler and the JVM team) — the primary source for understanding virtual threads' actual implementation, closer to an engineering design doc than a formal paper but authoritative and detailed.

For AI-adjacent engineering specifically: papers on JVM-based data processing systems (Spark's own architecture papers, though Spark's core is Scala) are more relevant to how Java/JVM infrastructure actually shows up in AI systems than any ML-specific paper — Java's role is almost always in the enterprise data/serving layer around models, not in training them.
`,

  videos: `
- **Brian Goetz — various Java Virtual Machine Language Summit and Devoxx talks** — the Java Language Architect explaining concurrency, records, and pattern matching design decisions directly from the source.
- **Ron Pressler — Project Loom talks (various JVM Language Summit / Devoxx years)** — virtual threads explained by the engineer who led their design.
- **Venkat Subramaniam's conference talks** — consistently excellent, energetic coverage of modern Java features and functional-style idioms.
- **Josh Long's Spring Boot content (SpringOne, YouTube)** — the most prolific and authoritative Spring Boot educator, directly from the Spring team.
- **Devoxx (YouTube, official channel)** — one of the largest Java-focused conferences; browse by year for deep dives across every level.
- **JEP Café (YouTube, Nicolai Parlog)** — short, focused videos on individual Java Enhancement Proposals, excellent for understanding exactly what shipped in each release.
`,

  "github-repos": `
- [openjdk/jdk](https://github.com/openjdk/jdk) — the JDK's own source; genuinely educational, especially the java.util.concurrent package for concurrency primitives done right.
- [spring-projects/spring-boot](https://github.com/spring-projects/spring-boot) — the dominant application framework's own source; auto-configuration internals are a masterclass in convention-over-configuration design.
- [google/guava](https://github.com/google/guava) — Google's widely used Java utility library; excellent example of well-designed, defensively-coded Java APIs.
- [junit-team/junit5](https://github.com/junit-team/junit5) — the standard testing framework; useful both as a tool and as an example of extensible, annotation-driven API design.
- [mockito/mockito](https://github.com/mockito/mockito) — the standard mocking framework's own source.
- [Netflix](https://github.com/Netflix) (organization) — numerous open-sourced large-scale Java/Spring Boot infrastructure projects reflecting real production patterns.
- [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns) — classic design patterns implemented idiomatically in Java, an excellent reference alongside the Design Patterns skill on this platform.
- [TheAlgorithms/Java](https://github.com/TheAlgorithms/Java) — algorithm implementations for practice reference.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Collections fluency*: word-frequency counter over a large text file using a HashMap, then top-K via a PriorityQueue (Java's built-in min-heap).
2. *Streams*: rewrite a series of manual for-loops (filter, transform, aggregate) as Stream pipelines; then write the reverse exercise (a complex Stream chain, explain what it does in plain English).
3. *Generics*: implement a generic Pair<A, B> class, then a generic binary search tree with proper Comparable bounds.
4. *Records & pattern matching*: model a small expression evaluator (numbers, +, -, *) as a sealed interface hierarchy of records, evaluated via exhaustive switch pattern matching.
5. *Concurrency*: implement a producer/consumer using BlockingQueue and a fixed thread pool; then the same problem using virtual threads (Java 21+), comparing code complexity and resource usage.
6. *equals/hashCode*: implement a custom class correctly overriding both, write a test proving a HashSet correctly deduplicates instances, then deliberately break the contract and observe the resulting bug.
7. *Exception design*: design a small exception hierarchy for a domain (e.g., a payment system) distinguishing recoverable (checked) from programmer-error (unchecked) failures, with justification for each choice.
8. *Testing*: take problem 5's producer/consumer and write a JUnit test suite using Testcontainers-style patterns (or an in-memory fake) proving correctness under concurrent load.

External sets: LeetCode (solve in idiomatic modern Java — good exercise in translating typical algorithmic patterns using streams and records where natural), Advent of Code (excellent for standard-library fluency), CodingBat's Java problems (good for pure syntax/logic warm-up at the beginner tier).
`,

  "architecture-diagram": `
The reference architecture for a production Java enterprise service — the shape you'll build repeatedly on this platform, often integrating with existing large-scale systems:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/internal services)"] --> LB["Load balancer / API gateway"]
    LB --> API1["Spring Boot service pod 1\n(virtual-thread-per-request, 21+)"]
    LB --> API2["Spring Boot service pod N"]
    API1 & API2 -->|Spring Data JPA| PG[("PostgreSQL /\nEnterprise RDBMS")]
    API1 & API2 --> RD[("Redis\ncache · sessions")]
    API1 & API2 -->|produce/consume| KF["Kafka\n(event streaming)"]
    API1 & API2 -->|search/RAG retrieval| ES[("Elasticsearch")]
    subgraph Observability
        MI["Micrometer -> Prometheus"] --> GF["Grafana"]
        OT["OpenTelemetry (Java agent)"]
        LG["SLF4J + Logback JSON logs"]
    end
    API1 -.metrics/traces/logs.-> Observability
    API2 -.metrics/traces/logs.-> Observability
~~~

Every box has a dedicated skill page on this platform; this diagram is the map of how they compose, with Java frequently occupying exactly the enterprise application and data-serving layer shown here — the systems an AI feature has to integrate WITH, not necessarily where the model itself runs.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Java))
    Language
      Classes & interfaces
      Generics & type erasure
      Records (16+)
      Sealed classes & pattern matching (21+)
      Streams & lambdas (8+)
    Concurrency
      Threads & ExecutorService
      Virtual threads (Loom, 21+)
      Java Memory Model
      volatile & synchronized
      Atomic classes
    Internals
      javac -> bytecode
      Class loading (lazy)
      JIT compiler (C1/C2)
      Generational GC
      Escape analysis
    Production
      Maven & Gradle
      JUnit 5 & Mockito
      SLF4J & Micrometer
      Container-aware JVM flags
      GraalVM native image
    Ecosystem
      Spring Boot
      Kafka
      Elasticsearch
      Kotlin
    Career
      Interview classics
      equals/hashCode mastery
      Reading path
~~~
`,
};

export default java;
