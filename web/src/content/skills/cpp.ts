import type { SkillContent } from "../types";

/**
 * C++ — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const cpp: SkillContent = {
  overview: `
C++ is a statically typed, compiled systems programming language that extends C with object-oriented programming, generic programming (templates), and — starting with C++11 and accelerating every three years since — a large set of modern, higher-level abstractions that compile down to the same "as fast as hand-written assembly" performance C has always offered. Its defining philosophy, stated by creator Bjarne Stroustrup, is "you don't pay for what you don't use": abstractions like classes, templates, and smart pointers cost nothing at runtime compared to writing the equivalent low-level code by hand, because the compiler resolves them entirely at compile time.

For an AI engineer, C++ is the language underneath nearly every performance-critical layer of the stack you actually run models on: PyTorch's and TensorFlow's core tensor and autograd engines are C++ with Python bindings; CUDA kernels are written in a C++ dialect; inference engines (TensorRT, ONNX Runtime, llama.cpp, ggml) are C++ specifically because Python's overhead is unacceptable at the innermost loop of matrix multiplication and memory management; and most production game engines, robotics stacks, and embedded/edge AI deployments run on C++. You will rarely write a training loop in C++, but you will very often be one call-stack frame away from it the moment you ask "why is this operation slow," and increasingly you'll need to read or extend a C++ kernel to squeeze out real inference latency.

Key characteristics: manual (or RAII-automated) memory management with no garbage collector; direct control over memory layout, alignment, and cache behavior; a template system powerful enough to do compile-time computation and generate zero-overhead generic code; multiple, sometimes conflicting, "eras" of idiomatic style coexisting in the same codebase (raw pointers and manual new/delete in legacy code vs. RAII, smart pointers, and ranges in modern C++20/23 code); and undefined behavior (UB) as a sharp, ever-present edge — a large class of C++ bugs are not just wrong, they are *undefined*, meaning the compiler is permitted to do anything at all, including something that looks like it worked until it silently doesn't.
`,

  history: `
C++ was created by **Bjarne Stroustrup** at Bell Labs, beginning as "C with Classes" — a practical attempt to add Simula-style object orientation to C without losing C's performance and hardware access.

| Year | Milestone |
|------|-----------|
| 1979 | Stroustrup begins "C with Classes" at Bell Labs |
| 1983 | Renamed C++ (the "++" is a joking nod to C's increment operator — "one better than C") |
| 1985 | First commercial release; "The C++ Programming Language" (1st edition) published |
| 1998 | **C++98** — the first ISO standard; templates, the STL (Standard Template Library), exceptions formalized |
| 2003 | C++03 — a minor bugfix standard over C++98 |
| 2011 | **C++11** — the single biggest overhaul in the language's history: move semantics, rvalue references, auto, lambdas, smart pointers (unique_ptr/shared_ptr), the memory model formalizing multithreading, range-based for loops |
| 2014 | C++14 — incremental refinements to C++11's features (generic lambdas, relaxed constexpr) |
| 2017 | C++17 — structured bindings, if constexpr, std::optional/variant/any, parallel STL algorithms |
| 2020 | **C++20** — concepts (constrained templates), ranges, coroutines, modules, three-way comparison (spaceship operator) |
| 2023 | C++23 — std::expected, deducing this, more constexpr and ranges additions |
| 2026+ | C++26 in active standardization: reflection, contracts, and further safety-profile proposals under discussion |

The shift to a three-year release cadence (C++11 onward, formalized from C++17) is the biggest process change in the language's history — it turned C++ from a language that changed once a decade into one that evolves continuously, while the "eras" of style it left behind (pre-C++11 raw-pointer code, C++11-14 early-modern code, C++17/20 code) still coexist in most large, long-lived C++ codebases.
`,

  "why-it-exists": `
C++ exists because of a concrete late-1970s gap: **C gave you raw hardware performance and control but no tools for organizing large programs**, while languages with better abstraction facilities (Simula's classes, for instance) sacrificed the performance and hardware access systems programming needed. Stroustrup's insight was that object-oriented abstraction did not have to cost anything at runtime if the compiler could resolve it all statically — a class's method call could compile to exactly the same machine code as a plain C function call with an explicit struct pointer argument, if the compiler did the work at compile time instead of deferring it to a runtime dispatch mechanism.

The "zero-overhead principle" this produced is still C++'s core differentiator today: templates generate specialized code per type at compile time (no runtime type-checking cost), classes and virtual functions are optional and precisely costed (you only pay the small vtable-indirection cost when you actually ask for dynamic dispatch), and RAII (Resource Acquisition Is Initialization) ties resource cleanup to object lifetime with no garbage collector and no runtime tracing overhead. Where garbage-collected languages traded some performance and predictability for programmer safety and convenience, C++ bet that a sufficiently well-designed type system and set of idioms (RAII, later smart pointers) could deliver most of that safety without ANY of the GC runtime cost — a bet still being refined today through Rust-influenced proposals like "safety profiles" for C++26 and beyond.
`,

  "problem-it-solves": `
C++ solves the **"I need C's performance and hardware control, but I also need real abstraction facilities to build and maintain large software"** problem.

Concretely, C++ gives you, at zero or near-zero runtime cost versus hand-written C:

- **Classes and encapsulation**: bundling data and behavior, controlling what's exposed to callers, without a runtime dispatch tax unless you explicitly ask for virtual functions.
- **Generic programming via templates**: write an algorithm or container ONCE (std::vector<T>, std::sort) and get a fully specialized, equally fast version compiled for every concrete type it's used with — no boxing, no runtime type checks.
- **RAII-based deterministic resource management**: memory, file handles, locks, and network connections are released automatically and deterministically when an object goes out of scope, without a garbage collector's pause times or unpredictability.
- **Direct control over memory layout**: you decide whether data is on the stack or heap, contiguous or scattered, aligned for SIMD or cache lines — control that matters enormously for the memory-bandwidth-bound workloads common in ML inference.
- **Interoperability with C**: essentially all of C is valid C++, so C++ can wrap and extend decades of existing C libraries and OS APIs directly, with zero foreign-function-interface overhead.

What C++ deliberately does **not** solve: memory safety by default (unlike Rust's compiler-enforced ownership model, C++ trusts the programmer, and a huge fraction of historical security vulnerabilities in C/C++ codebases trace directly to this), fast compile-or-iterate development velocity (compile times and the sheer surface area of the language make it a poor fit for quick scripts — see Python for that), and a single unified "modern" style (a 30-year-old language has 30 years of code written in every era's idioms, and C++ deliberately maintains backward compatibility with almost all of it).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between pointers, references, and values, and predict object lifetime and copy/move behavior in a given piece of code.
2. Write idiomatic modern C++ (C++17/20): RAII, smart pointers, range-based for, auto, structured bindings, and lambdas.
3. Use templates and concepts to write reusable, compile-time-generic code, and know when to reach for runtime polymorphism (virtual functions) instead.
4. Explain move semantics and rvalue references well enough to write efficient code that avoids unnecessary copies.
5. Reason about undefined behavior: identify the classic sources (out-of-bounds access, use-after-free, uninitialized reads, data races) and explain why UB is more dangerous than a simple runtime error.
6. Build concurrent C++ code using std::thread, std::mutex, and atomics, correctly identifying and avoiding data races.
7. Structure a production C++ project with CMake, manage dependencies, and choose appropriate compiler flags and sanitizers.
8. Profile and optimize C++ using the standard toolchain (perf, Valgrind, sanitizers) rather than guessing.
9. Answer senior-level interview questions on RAII, the rule of five, virtual dispatch cost, and memory model basics.
`,

  prerequisites: `
- **Required**: solid programming fundamentals in at least one other language — variables, functions, control flow, basic data structures. This page assumes general programming literacy, not prior C or C++ exposure.
- **Helpful**: exposure to **C** (or another language with manual memory management) makes pointers, the stack/heap distinction, and manual resource management click faster, though this page explains them from scratch.
- **Very helpful**: the **Data Structures** and **Algorithms** skills — C++ is frequently the language used to implement and reason about these at the lowest level, and interview-style C++ questions lean heavily on this overlap.

Dependency links: general **Computer Science** fundamentals (stack vs heap, pointers) → this page → **Concurrency**, **Multithreading**, **Systems Fundamentals**, and performance-critical portions of **Vision AI** / inference-serving skills (TensorRT, llama.cpp-style engines) all build on C++ fluency.
`,

  "beginner-concepts": `
### Your first program, compilation, and variables

~~~cpp
#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;

    int age = 36;           // a plain value on the stack
    const double pi = 3.14159; // const: cannot be reassigned after initialization
    std::string name = "Ada"; // std::string, NOT a raw char array — the modern default

    return 0;
}
~~~

Unlike interpreted languages, C++ is compiled ahead of time into a native binary: the compiler (g++, clang++, or MSVC) turns this source into machine code specific to your target CPU, which is why C++ programs start instantly and run fast, but must be recompiled for each target platform.

### Pointers and references — the two ways to refer to a value

~~~cpp
int x = 10;

int* ptr = &x;      // ptr HOLDS THE ADDRESS of x; & here means "address of"
*ptr = 20;           // *ptr means "the value ptr points to" — this changes x itself
std::cout << x;      // prints 20

int& ref = x;        // a reference: an ALIAS for x, not a separate variable
ref = 30;             // this IS x — no separate storage, cannot be null, cannot be reseated
std::cout << x;       // prints 30
~~~

A pointer can be reassigned to point elsewhere, can be null, and requires explicit dereferencing (*ptr). A reference is bound once at creation, can never be null (in well-defined code), and is used exactly like the original variable — modern C++ style strongly prefers references and smart pointers over raw pointers wherever possible, reserving raw pointers for "I do not own this and it might not exist" situations.

### Arrays, std::vector, and bounds

~~~cpp
#include <vector>

int raw_array[5] = {1, 2, 3, 4, 5};   // fixed size, no bounds checking — a classic UB source

std::vector<int> numbers = {1, 2, 3, 4, 5};  // dynamic array, the default sequence container
numbers.push_back(6);                          // grows automatically
int first = numbers.at(0);                     // .at() bounds-checks, throws std::out_of_range
int unsafe = numbers[10];                      // operator[] does NOT bounds-check — undefined behavior
~~~

Reaching for raw arrays and manual indexing is the single most common beginner habit to unlearn: std::vector gives you dynamic sizing, automatic memory management, and (via .at()) optional bounds checking, at essentially the same performance as a raw array for the common case.

### Functions, overloading, and default arguments

~~~cpp
double area(double radius) {
    return 3.14159 * radius * radius;
}

double area(double length, double width) {   // overload: same name, different parameters
    return length * width;
}

void greet(std::string name, std::string greeting = "Hello") {  // default argument
    std::cout << greeting << ", " << name << "!\\n";
}
~~~

### Classes — the core OOP building block

~~~cpp
class Point {
public:
    Point(double x, double y) : x_(x), y_(y) {}   // constructor with a member initializer list

    double distanceFromOrigin() const {            // const: this method doesn't modify the object
        return std::sqrt(x_ * x_ + y_ * y_);
    }

private:
    double x_, y_;   // private by default in a class; trailing underscore is a common convention
};

Point p(3.0, 4.0);
std::cout << p.distanceFromOrigin();   // 5.0
~~~

The member initializer list (: x_(x), y_(y)) is the idiomatic way to initialize members — it initializes them directly rather than default-constructing and then reassigning in the constructor body, which matters both for performance and for members that have no default constructor.

Common beginner trap: forgetting that operator[] on std::vector and raw arrays does not bounds-check — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### RAII — Resource Acquisition Is Initialization

~~~cpp
class FileHandle {
public:
    explicit FileHandle(const std::string& path) : file_(std::fopen(path.c_str(), "r")) {
        if (!file_) throw std::runtime_error("failed to open file");
    }
    ~FileHandle() {                 // destructor: runs automatically when the object goes out of scope
        if (file_) std::fclose(file_);
    }
    FileHandle(const FileHandle&) = delete;            // disallow copying (would double-close)
    FileHandle& operator=(const FileHandle&) = delete;

private:
    FILE* file_;
};

void process() {
    FileHandle f("data.txt");   // opened here
    // ... use f ...
}                                 // destructor runs HERE automatically, even if an exception was thrown
~~~

RAII is C++'s central idiom: tie a resource's lifetime (memory, file handles, locks, sockets) to an object's lifetime, and let the destructor release it automatically and deterministically — no garbage collector needed, and the cleanup runs even during stack unwinding from an exception, which manual try/finally-style cleanup in other languages has to do explicitly every time.

### Smart pointers — RAII applied to heap memory

~~~cpp
#include <memory>

std::unique_ptr<Point> p1 = std::make_unique<Point>(1.0, 2.0);   // sole owner, cannot be copied
// std::unique_ptr<Point> p2 = p1;      // COMPILE ERROR — copying is disabled
std::unique_ptr<Point> p2 = std::move(p1);   // ownership TRANSFERS; p1 is now null

std::shared_ptr<Point> s1 = std::make_shared<Point>(3.0, 4.0);   // reference-counted, shareable
std::shared_ptr<Point> s2 = s1;    // fine — the reference count increments to 2
~~~

std::unique_ptr models exclusive ownership (like Rust's default ownership) at zero overhead versus a raw pointer; std::shared_ptr models shared ownership via atomic reference counting, at a small but real runtime cost. Modern C++ style treats "new and delete written directly in application code" as a code smell — smart pointers should own memory, with raw pointers/references used only for non-owning access.

### Move semantics and rvalue references

~~~cpp
std::vector<int> make_big_vector() {
    std::vector<int> v(1'000'000, 42);
    return v;      // the compiler MOVES this out, not copies — no 1M-element copy happens
}

std::vector<int> a = make_big_vector();     // move, not copy
std::vector<int> b = std::move(a);           // explicit move: a is left in a valid-but-unspecified state
~~~

A move "steals" the internal resources (the heap pointer, size, capacity) of a temporary or explicitly-moved-from object instead of deep-copying them — an O(1) pointer swap instead of an O(n) copy. This is the single biggest performance-relevant addition of C++11: returning large objects by value became cheap, ending decades of workarounds (output parameters, manual pointer juggling) that existed purely to avoid copy costs.

### Templates — compile-time generic code

~~~cpp
template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

int i = maxOf(3, 7);            // compiler generates a maxOf<int> specialization
double d = maxOf(3.5, 2.1);      // and a separate maxOf<double> specialization

template <typename T>
class Stack {
public:
    void push(T value) { data_.push_back(value); }
    T pop() { T v = data_.back(); data_.pop_back(); return v; }
private:
    std::vector<T> data_;
};
~~~

Templates are resolved entirely at COMPILE TIME: the compiler generates a fully specialized, independently-optimized version of the function or class for each concrete type it's instantiated with — this is where the STL's genericity (std::vector<T>, std::sort) comes from, at the same performance as hand-written type-specific code.

### Exceptions and error handling

~~~cpp
double safeDivide(double a, double b) {
    if (b == 0.0) throw std::invalid_argument("division by zero");
    return a / b;
}

try {
    double result = safeDivide(10.0, 0.0);
} catch (const std::invalid_argument& e) {
    std::cerr << "Error: " << e.what() << "\\n";
} catch (...) {                              // catch-all — use sparingly, prefer specific types
    std::cerr << "Unknown error\\n";
}
~~~

### Lambdas and the standard algorithms

~~~cpp
#include <algorithm>

std::vector<int> nums = {5, 2, 8, 1, 9};
std::sort(nums.begin(), nums.end(), [](int a, int b) { return a > b; });  // descending, via a lambda

int count = std::count_if(nums.begin(), nums.end(), [](int n) { return n % 2 == 0; });

auto multiplier = [factor = 2](int x) { return x * factor; };  // captures "factor" by value
~~~

Lambdas (C++11+) let algorithms like std::sort, std::count_if, and std::transform take inline behavior instead of requiring a named function or functor class — the same shift toward functional-style composition seen in most modern languages.
`,

  "advanced-concepts": `
### The Rule of Zero / Three / Five

~~~cpp
// Rule of Five: if you need ANY of these, you almost certainly need ALL five
class Buffer {
public:
    Buffer(size_t size) : size_(size), data_(new int[size]) {}
    ~Buffer() { delete[] data_; }                                     // 1. destructor
    Buffer(const Buffer& other) : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
    }                                                                    // 2. copy constructor
    Buffer& operator=(const Buffer& other) { /* copy-and-swap idiom */ return *this; }  // 3. copy assignment
    Buffer(Buffer&& other) noexcept : size_(other.size_), data_(other.data_) {
        other.data_ = nullptr; other.size_ = 0;
    }                                                                    // 4. move constructor
    Buffer& operator=(Buffer&& other) noexcept { /* steal, then release old */ return *this; } // 5. move assignment
private:
    size_t size_;
    int* data_;
};

// Rule of Zero (the preferred modern default): own nothing manually, need none of the five
class ModernBuffer {
private:
    std::vector<int> data_;   // std::vector already handles all five correctly — just delegate
};
~~~

If a class manages a raw resource, it needs a destructor AND correct copy/move semantics (five special member functions) or it will double-free, leak, or silently slice. The Rule of Zero — composing your class entirely out of members (std::vector, std::string, std::unique_ptr) that already manage their own resources correctly — is the preferred modern style precisely because it sidesteps needing to write any of the five by hand.

### Undefined behavior — the sharpest edge in the language

~~~cpp
int arr[5] = {1, 2, 3, 4, 5};
int x = arr[10];              // UB: out-of-bounds read — may crash, may print garbage, may "work"

int* p = new int(5);
delete p;
*p = 10;                       // UB: use-after-free

int y;                         // UB: uninitialized read if used before assignment
std::cout << y;
~~~

Undefined behavior is not "an error the compiler catches" or even "a guaranteed crash" — the C++ standard places NO requirements on what happens once UB occurs, which means the compiler is legally permitted to assume UB never happens and optimize accordingly, sometimes producing results far more surprising than a simple crash (code that appears to work in debug builds but corrupts memory in release builds is the classic symptom). This is the single most important thing to internalize about C++ safety: a bug that "seems to work" is not evidence of correctness.

### Virtual functions and dynamic dispatch cost

~~~cpp
class Shape {
public:
    virtual double area() const = 0;    // pure virtual — makes Shape abstract
    virtual ~Shape() = default;          // ALWAYS virtual-destruct a base class used polymorphically
};
class Circle : public Shape {
public:
    explicit Circle(double r) : r_(r) {}
    double area() const override { return 3.14159 * r_ * r_; }
private:
    double r_;
};

std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(2.0));
double total = 0;
for (const auto& s : shapes) total += s->area();   // resolved at RUNTIME via the vtable
~~~

A virtual call costs one extra pointer indirection (through the vtable) versus a direct call — usually negligible, occasionally significant in an extremely hot inner loop, and the reason templates (compile-time, zero-indirection generics) are preferred over virtual dispatch when the set of types is known at compile time. Forgetting a virtual destructor on a base class is a classic UB source: deleting a derived object through a base pointer without one skips the derived destructor entirely.

### constexpr and compile-time computation

~~~cpp
constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}
constexpr int result = factorial(5);   // computed at COMPILE time — 120 is baked into the binary
~~~

constexpr functions can run at either compile time (when all inputs are known then) or runtime, letting the compiler eliminate entire computations before the program even starts — an increasingly large part of modern C++'s performance story, extended significantly by consteval (C++20, forces compile-time-only evaluation) and if constexpr for compile-time branching in templates.

### Memory model and atomics

~~~cpp
#include <atomic>

std::atomic<int> counter{0};
counter.fetch_add(1, std::memory_order_relaxed);   // atomic increment, no lock needed

std::atomic<bool> ready{false};
// Thread A:
data = compute();
ready.store(true, std::memory_order_release);       // publishes "data" safely to other threads
// Thread B:
while (!ready.load(std::memory_order_acquire)) {}    // sees "data" fully written once this is true
data_use(data);
~~~

C++11 formalized a precise memory model: std::atomic operations with acquire/release semantics let you reason exactly about what memory writes on one thread are guaranteed visible to another — the foundation lock-free data structures are built on, and a genuinely hard topic most engineers should default to std::mutex for unless profiling proves the lock is the bottleneck.

### Move-only types and perfect forwarding

~~~cpp
template <typename T>
void wrapper(T&& arg) {                          // universal reference (forwarding reference)
    inner(std::forward<T>(arg));                  // preserves whether arg was an lvalue or rvalue
}
~~~

std::forward, combined with a "universal reference" (T&& in a deduced template context, NOT the same thing as a normal rvalue reference), is how generic wrapper functions (like std::make_unique itself) pass their arguments through without losing move-versus-copy information — a subtle but important piece of writing truly generic, zero-overhead C++ library code.
`,

  "internal-working": `
The C++ compilation pipeline turns source into native machine code through several distinct, inspectable stages:

~~~mermaid
flowchart LR
    A["source .cpp/.h"] --> B["Preprocessor\n(macros, #include expansion)"]
    B --> C["Compiler frontend\n(parse to AST, type-check,\ntemplate instantiation)"]
    C --> D["Optimizer\n(inlining, dead-code elimination,\nvectorization)"]
    D --> E["Codegen\n(target-specific assembly)"]
    E --> F["Object files (.o)"]
    F --> G["Linker\n(resolve symbols across\ntranslation units + libraries)"]
    G --> H["Native executable / library"]
~~~

1. **Preprocessing**: #include directives are textually expanded, macros substituted — purely textual, before the compiler proper sees anything.
2. **Compilation (per translation unit)**: each .cpp file is compiled independently into an object file; templates are instantiated here, generating a concrete specialization's code for every distinct type used with that template in that translation unit.
3. **Optimization**: the compiler (GCC/Clang built on LLVM, or MSVC) applies inlining, dead-code elimination, loop unrolling, and auto-vectorization (turning scalar loops into SIMD instructions) — the -O2/-O3 flags control how aggressively.
4. **Linking**: the linker combines all object files and libraries into one executable, resolving every function/symbol reference across translation unit boundaries — this is where "undefined reference" errors come from (a symbol was declared but never defined anywhere the linker could find).

**Why templates cause slow compiles and code bloat**: each distinct template instantiation (Stack<int>, Stack<std::string>, ...) generates its own compiled copy of the code — the same "monomorphization" tradeoff Rust makes, and the reason large template-heavy C++ codebases can have painfully slow build times, addressed partly by C++20 modules (which avoid re-parsing headers repeatedly) and explicit template instantiation control.

**Why "one definition rule" (ODR) violations are UB**: a class, function, or template must have EXACTLY one definition across the whole program (inline/header definitions must be identical in every translation unit that includes them) — violating this is undefined behavior, often manifesting as bizarre, hard-to-reproduce bugs when two translation units disagree about a type's layout.
`,

  architecture: `
A senior engineer thinks about C++ at two levels: the **memory/runtime architecture** (what actually exists once a program runs) and the **project architecture** (how a real C++ codebase is organized and built).

### Runtime memory architecture

~~~mermaid
flowchart TB
    subgraph Process["Running C++ process"]
        Stack["Stack\n(function calls, local variables,\nfreed automatically on scope exit)"]
        Heap["Heap\n(new/delete, smart pointers —\nmanual or RAII-managed lifetime)"]
        Static["Static/global storage\n(globals, static locals — lifetime = program duration)"]
        Text["Text/code segment\n(compiled instructions, read-only)"]
    end
    Stack -->|may point into| Heap
~~~

Unlike Java, Go, or Python, there is no managed runtime layer inside a C++ binary: every byte of memory is either automatic (stack, freed when scope ends), dynamic (heap, freed exactly when you or a smart pointer's destructor says so), or static (globals, alive for the program's whole life) — full manual control, and full manual responsibility.

### Project architecture (production C++ with CMake)

~~~
myservice/
├── CMakeLists.txt            # the standard cross-platform build configuration
├── include/myservice/         # public headers, exposed to consumers of this library
├── src/                        # implementation (.cpp) files
│   ├── main.cpp                # thin entrypoint
│   ├── api/                     # request handling
│   └── domain/                  # core business logic, framework-agnostic
├── tests/                       # unit tests (GoogleTest/Catch2)
└── third_party/ or vcpkg.json  # dependency management
~~~

Rules mature C++ teams follow: separate public headers (include/) from implementation (src/) so consumers only see what they need; prefer a package manager (vcpkg, Conan) over vendoring dependencies by hand; keep the "physical design" (which headers include which) as shallow as possible, since C++'s compile model makes deep header-include chains a direct, measurable build-time cost.
`,

  "data-flow": `
What happens from source to a running process, and then through one function call:

~~~mermaid
sequenceDiagram
    participant Build as Build system (CMake)
    participant Compiler as Compiler (per .cpp)
    participant Linker
    participant OS
    participant Proc as Running process

    Build->>Compiler: compile each translation unit independently
    Compiler->>Compiler: preprocess, parse, instantiate templates, optimize, emit .o
    Compiler->>Linker: hand off object files
    Linker->>Linker: resolve symbols across all .o files + libraries
    Linker->>OS: produce final executable
    OS->>Proc: exec — process starts, stack allocated, globals constructed
    Proc->>Proc: main() runs; function calls push/pop the stack;\nnew/smart pointers allocate on the heap
    Proc-->>OS: exit — stack unwinds, remaining RAII destructors run, process ends
~~~

For a single function call, the data flow that matters most for correctness: **pass by value** copies (or moves, if the argument is an rvalue) the object — the callee gets an independent copy; **pass by reference** (T&) gives the callee direct access to the caller's object with zero copy; **pass by const reference** (const T&) is the default choice for large objects the callee only reads — no copy, no risk of the callee mutating the caller's data; **pass by pointer** (T*) additionally allows "no object" (nullptr) as a valid state, which a reference cannot represent.

The most misunderstood part for newcomers: **object lifetime and dangling references**. Returning a reference or pointer to a local (stack) variable is UB the instant the function returns — the stack frame is gone, and the reference/pointer is dangling. Nearly every "this crashes intermittently" C++ bug for a beginner traces back to a reference or pointer outliving the object it refers to.
`,

  "production-usage": `
### Build systems and toolchains

~~~bash
# CMake — the de facto standard cross-platform build system
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . -j$(nproc)

# Compilers
g++ -std=c++20 -O2 -Wall -Wextra main.cpp -o app     # GCC
clang++ -std=c++20 -O2 -Wall -Wextra main.cpp -o app  # Clang
~~~

Non-negotiables for production:

1. **-Wall -Wextra (or higher) treated as errors in CI** — the compiler's warnings catch a huge share of real bugs (uninitialized variables, signed/unsigned comparison mismatches, shadowed variables) before they ever reach a sanitizer or a customer.
2. **Release builds (-O2/-O3, NDEBUG defined)** for anything performance-sensitive — debug builds (-O0 -g) can be an order of magnitude slower and are for development/debugging only.
3. **A package manager (vcpkg or Conan)** for third-party dependencies instead of vendoring or manually managing system libraries — reproducible builds across machines and CI.
4. **Pin the C++ standard explicitly** (-std=c++20, etc.) in CMakeLists.txt — never rely on a compiler's shifting default.

### Common production stacks

- **High-performance services**: raw C++ with a lightweight framework (Drogon, Pistache) or gRPC directly, when Python's/Go's overhead is unacceptable for the workload.
- **ML/inference**: LibTorch (PyTorch's C++ API), ONNX Runtime, TensorRT — you write C++ around a model artifact produced by a Python training pipeline.
- **Testing**: GoogleTest or Catch2 as the standard unit-testing frameworks, wired into CTest (CMake's test runner) for CI integration.
`,

  "industry-examples": `
- **Google**: C++ is one of Google's primary languages for performance-critical infrastructure — Chrome's rendering engine, significant parts of Search, and TensorFlow's core runtime are C++; Google also maintains the widely used Abseil library and the Google C++ Style Guide followed far beyond Google itself.
- **Meta (PyTorch)**: PyTorch's tensor operations, autograd engine, and much of its performance-critical core are implemented in C++ (ATen/LibTorch), with Python as a thin, ergonomic wrapper on top — the exact pattern an AI engineer encounters constantly without realizing it.
- **NVIDIA**: CUDA (the dominant GPU programming model for deep learning) is a C++ dialect; TensorRT, NVIDIA's inference-optimization engine, is C++ for the same latency-critical reasons.
- **Bloomberg**: one of the largest C++ codebases in finance, low-latency trading and data systems where C++'s deterministic performance is a hard requirement; Bloomberg also open-sourced BDE, a widely referenced modern-C++ library.
- **Epic Games / game engines generally**: Unreal Engine is C++ throughout, chosen for the combination of raw performance and fine-grained memory control real-time rendering demands.
- **Adobe**: Photoshop and much of the Creative Suite's performance-critical image-processing core remain C++, for the same direct-memory-control reasons.
- **Georgia Tech / robotics and ROS (Robot Operating System)**: robotics stacks lean heavily on C++ for deterministic, low-latency control loops — directly relevant to embedded and edge AI deployment.

Pattern to notice: C++ adoption clusters around **latency-critical, memory-bandwidth-bound, or hardware-adjacent workloads** — precisely where a garbage collector's pauses or an interpreted language's overhead would be unacceptable, and precisely the profile of most inference-serving and real-time AI infrastructure.
`,

  "best-practices": `
1. **Follow the Rule of Zero** — compose classes out of members that already manage their own resources (std::vector, std::unique_ptr, std::string) rather than writing manual destructors/copy/move constructors by hand.
2. **Prefer smart pointers over raw new/delete** — std::unique_ptr for exclusive ownership (the default), std::shared_ptr only when ownership genuinely must be shared.
3. **Pass large objects by const reference**, small/cheap-to-copy types (int, double) by value, and use move semantics (std::move) explicitly when transferring ownership of an expensive-to-copy object you no longer need.
4. **Prefer std::vector and std::array over raw C arrays** — bounds-checkable (via .at()), self-managing size, and equally fast for the common case.
5. **Enable and treat compiler warnings as errors** (-Wall -Wextra -Werror in CI) — the single highest-leverage bug-prevention step available before reaching for heavier tools.
6. **Use RAII for every resource**, not just memory — locks (std::lock_guard), files, sockets, database connections — anything with an acquire/release pair belongs in an RAII wrapper.
7. **Prefer templates (compile-time polymorphism) over virtual functions** when the set of types is known at compile time; reserve virtual dispatch for genuine runtime polymorphism needs.
8. **Run sanitizers in CI** (AddressSanitizer for memory errors, UndefinedBehaviorSanitizer for UB, ThreadSanitizer for data races) — they catch entire bug classes static analysis and code review routinely miss.
9. **Initialize every variable at declaration** — an uninitialized read is undefined behavior, not just "probably zero."
10. **Use const liberally** — const member functions, const parameters, const references — it documents intent and lets the compiler catch accidental mutation.
11. **Prefer standard library algorithms (std::sort, std::transform, std::accumulate) over hand-written loops** — they're well-tested, often better-optimized, and communicate intent more directly.
12. **Keep header dependencies shallow** — every #include is a real compile-time cost across every translation unit that (transitively) includes it; forward-declare where possible.
`,

  "anti-patterns": `
### Manual new/delete instead of RAII

~~~cpp
// WRONG — manual, exception-unsafe, easy to forget the delete on every code path
void process() {
    Widget* w = new Widget();
    doSomething(w);   // if this throws, w leaks forever
    delete w;
}

// RIGHT — RAII via smart pointer; freed automatically on every exit path, including exceptions
void processBetter() {
    auto w = std::make_unique<Widget>();
    doSomething(w.get());
}   // destructor runs here, guaranteed, even if doSomething() throws
~~~

Manual new/delete pairs are the classic C++ anti-pattern: every exit path (including exceptions and early returns) must reach the matching delete, and missing even one is a leak or a double-free waiting to happen. Modern C++ style treats a raw new/delete in application code as something to flag in review.

### Other production-grade anti-patterns

- **Using operator[] on a vector/map when bounds/key existence isn't guaranteed**: silently undefined behavior (vector) or silently default-inserts (map) instead of the explicit, checkable .at() or .find(); prefer the checked form when the input isn't already validated.
- **Returning a reference or pointer to a local variable**: the classic dangling-reference bug — the stack frame is gone the instant the function returns.
- **Slicing**: assigning a derived-class object to a base-class object BY VALUE truncates it to just the base portion, silently losing the derived data — pass/store polymorphic types via pointer or reference (or smart pointer), never by value.
- **Catching exceptions by value instead of by const reference**: catch (MyException e) copies (and can slice) the exception object; catch (const MyException& e) avoids both problems and is the idiomatic form.
- **Overusing std::shared_ptr as a default** where std::unique_ptr (or no smart pointer at all, for a non-owning view) would do — shared_ptr's atomic refcounting has a real, measurable cost, and reference cycles between shared_ptrs leak memory silently unless broken with std::weak_ptr.
- **Ignoring compiler warnings** — many flag genuine bugs (signed/unsigned comparison, uninitialized use), not just style nits.
- **Premature micro-optimization without profiling** — hand-rolling a "faster" data structure or loop before measuring, often making code both slower (defeating compiler optimizations it would otherwise apply) and harder to maintain.
`,

  performance: `
### Rule zero: measure first

~~~bash
g++ -O2 -pg main.cpp -o app && ./app && gprof app gmon.out   # classic profiler
perf record -g ./app && perf report                            # modern Linux profiling, flame-graph-ready
valgrind --tool=callgrind ./app                                  # detailed call-graph profiling (slow but precise)
~~~

Never optimize a debug build (-O0) — it has no optimizations applied and profiling it tells you almost nothing about production performance; always profile an -O2/-O3 release build with debug symbols (-g) still included for readable stack traces.

### The performance hierarchy (apply in order)

1. **Better algorithm / data structure** — identical to any language; raw C++ speed does not fix an O(n²) algorithm.
2. **Reduce allocations and copies** — pass by const reference, use std::move for objects you no longer need, reserve() a vector's capacity upfront when the size is known to avoid repeated reallocation.
3. **Cache-friendly data layout** — prefer contiguous containers (std::vector) over pointer-chasing ones (std::list, linked structures) for anything iterated in a hot loop; "structure of arrays" often outperforms "array of structures" for SIMD-friendly, cache-friendly access.
4. **Let the compiler vectorize** — write simple, branch-light loops over contiguous data and let -O3's auto-vectorizer generate SIMD instructions; check with -fopt-info-vec (GCC) whether a given loop actually vectorized.
5. **Move virtual dispatch out of the hottest inner loops** where profiling shows it matters — prefer templates/CRTP (compile-time polymorphism) in the single hottest path, while keeping virtual dispatch everywhere else for its flexibility.
6. **Parallelize with std::thread, a thread pool, or a parallel STL algorithm** (std::execution::par with std::transform/std::sort) for genuinely CPU-bound, data-parallel work.

### Micro-level facts worth knowing

- std::string has small-string optimization (SSO) in every major standard library — short strings (typically under ~15-22 bytes) avoid a heap allocation entirely.
- emplace_back constructs the object directly in the container's storage, avoiding a temporary-then-move/copy that push_back(Type(...)) can incur.
- Branch prediction and cache misses, not raw instruction count, dominate the cost of most real-world hot loops — this is why profiling beats intuition almost every time.
`,

  scalability: `
C++ services scale the same way any networked service does — **horizontally** — with C++-specific strengths coming from its low per-request memory/CPU overhead and total absence of GC pause times.

### Single machine

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["C++ service (process 1)\nthread pool or async I/O"]
    LB --> S2["C++ service (process N)"]
    S1 & S2 --> DB[("PostgreSQL / storage layer")]
    S1 & S2 --> Cache[("Redis / in-process cache")]
~~~

Because C++ has no garbage collector and precise control over memory layout, a well-written C++ service typically has the lowest, most predictable per-request latency and memory footprint of any mainstream language — the reason it remains the default for the innermost, most latency-sensitive tier of a system (an inference engine, a matching engine) even when the outer API layer is written in something more productive like Python or Go.

### Beyond one machine

- **Stateless services + externalized state**: the same discipline as any language — a database/cache holds shared state, scaling is more processes/containers behind a load balancer.
- **Thread pools and async I/O** (Boost.Asio, or a framework built on it) scale a single process across many concurrent connections without one OS thread per connection.
- **SIMD and multi-core parallelism together**: a single C++ inference process can use both vectorized instructions (within a core) and multiple threads (across cores) simultaneously — the combination underlying most high-throughput CPU inference engines.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Excessive dynamic allocation in a hot path | Pool allocators, arena allocation, or reserve()-ing containers upfront to avoid repeated malloc/free |
| Lock contention on a shared mutex under high concurrency | Shard the lock across partitions of the data, or replace with a lock-free structure once profiling proves it's needed |
| Memory-bandwidth-bound workload (common in inference) | Restructure data layout for cache locality (structure-of-arrays), reduce unnecessary copies, use SIMD-friendly alignment |
| Slow builds in a large template-heavy codebase | Explicit template instantiation, reducing header include depth, precompiled headers, or C++20 modules |
`,

  security: `
### What C++ does NOT protect you from by default

C++ trusts the programmer with memory in a way few mainstream languages still do, and this is the single largest source of historical C/C++ security vulnerabilities:

1. **Buffer overflows**: writing past the end of a raw array or buffer is undefined behavior and, in attacker-controlled scenarios, a classic remote-code-execution vector — the root cause behind a huge fraction of historical CVEs in C/C++ codebases (Microsoft and Google have both published data attributing roughly 70% of their serious security vulnerabilities to memory-safety bugs, precisely this class).
2. **Use-after-free and double-free**: dereferencing or freeing memory that's already been released — reliably exploitable in many real-world cases, and one of the reasons RAII/smart-pointer discipline is treated as a security practice, not just a style preference.
3. **Integer overflow**: signed integer overflow is undefined behavior (not wraparound, as some other languages define); unsigned overflow wraps by defined rule but can still cause logic errors (e.g., subtracting past zero on an unsigned type) with security consequences (e.g., a resulting huge "length" value driving a buffer overflow).
4. **Format string vulnerabilities**: passing untrusted input directly as a printf-family format string lets an attacker read or write arbitrary memory — always use a literal format string with user input as an argument, never the reverse.

### What genuinely helps

- **Smart pointers and RAII everywhere** eliminate most use-after-free and double-free bugs by construction, without eliminating the language's underlying capability for them.
- **AddressSanitizer (ASan) and UndefinedBehaviorSanitizer (UBSan)** in CI and during development catch a large share of memory and UB bugs before they reach production — treat them as close to mandatory for any codebase handling untrusted input.
- **Bounds-checked access (.at() over operator[])** at trust boundaries where input isn't already validated.
- **Static analysis** (Clang Static Analyzer, Coverity, cppcheck) as an additional, complementary line of defense in CI.
- **Modern C++'s "safety profiles" direction** (an active area of C++26+ standardization, influenced directly by Rust's success at compile-time memory safety) aims to close some of this gap without abandoning the language's zero-overhead philosophy — worth watching, not yet something to rely on in code shipping today.

### Cryptography and secrets

Use well-audited libraries (OpenSSL, libsodium, Botan) rather than implementing cryptographic primitives — the same universal rule as any language; never hardcode secrets, load them from environment variables or a vault (see the **Secrets Management** skill).

See the dedicated **SQL Injection**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond what's C++-specific — those attack classes are data-handling problems, not something the language's memory model changes.
`,

  testing: `
C++ has no built-in test framework — GoogleTest and Catch2 are the two dominant third-party choices for production codebases.

~~~cpp
#include <gtest/gtest.h>

double applyDiscount(double price, double percent) {
    return price * (1.0 - percent / 100.0);
}

TEST(DiscountTest, BasicDiscount) {
    EXPECT_DOUBLE_EQ(applyDiscount(100.0, 10.0), 90.0);
}

TEST(DiscountTest, ZeroPercentIsUnchanged) {
    EXPECT_DOUBLE_EQ(applyDiscount(50.0, 0.0), 50.0);
}
~~~

~~~bash
cmake --build . --target run_tests
ctest --output-on-failure     # CMake's built-in test runner, works with any framework registered via add_test
~~~

### Table-driven-style tests and parameterization

~~~cpp
class DiscountTestP : public ::testing::TestWithParam<std::tuple<double, double, double>> {};

TEST_P(DiscountTestP, MatchesExpected) {
    auto [price, pct, expected] = GetParam();
    EXPECT_NEAR(applyDiscount(price, pct), expected, 0.01);
}
INSTANTIATE_TEST_SUITE_P(Cases, DiscountTestP, ::testing::Values(
    std::make_tuple(100.0, 0.0, 100.0),
    std::make_tuple(100.0, 100.0, 0.0),
    std::make_tuple(59.99, 15.0, 50.99)
));
~~~

### The senior testing doctrine

- Unit test pure logic in isolation; use dependency injection (pass interfaces/abstract base classes) to substitute test doubles for I/O-bound collaborators rather than reaching for a heavy mocking framework by default.
- Always run the suite under AddressSanitizer/UBSan in CI, not just a plain build — many bugs only surface under a sanitizer, never in a normal passing test run.
- Benchmark with Google Benchmark for anything performance-sensitive — it handles warm-up and statistical noise correctly, unlike naive wall-clock timing.
- ctest integrates any framework into CI uniformly, so the CI pipeline doesn't need framework-specific logic.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the compiler error/warning fully** — GCC and Clang's diagnostics are detailed and often point precisely at the fix; treat -Wall -Wextra output as seriously as an error.
2. **std::cerr / assert for quick inspection**:

~~~cpp
assert(index >= 0 && index < size);   // aborts immediately in debug builds if false; compiled OUT in release (NDEBUG)
~~~

3. **gdb / lldb** — the standard native debuggers; set breakpoints, inspect variables and the call stack, step through line by line.

~~~bash
g++ -g -O0 main.cpp -o app    # -g keeps debug symbols; -O0 keeps the code matching source line-for-line
gdb ./app
(gdb) break main
(gdb) run
(gdb) next
(gdb) print someVariable
~~~

4. **AddressSanitizer (ASan)** — compiled in with -fsanitize=address, catches buffer overflows, use-after-free, and memory leaks at the exact line they occur, with a readable stack trace — often faster to a root cause than manual debugging for memory bugs.
5. **UndefinedBehaviorSanitizer (UBSan)** — -fsanitize=undefined catches signed overflow, null-pointer dereference, and other UB the type system can't statically rule out.
6. **Valgrind (memcheck)** — slower than ASan but doesn't require recompilation and catches an overlapping but not identical set of memory issues; useful when you can't rebuild with sanitizers.
7. **ThreadSanitizer (TSan)** — -fsanitize=thread specifically for diagnosing data races in multithreaded code, which are notoriously hard to reproduce with a plain debugger.

### Debugging crashes specifically

- A core dump (ulimit -c unlimited, then gdb ./app core) captures the exact state at the moment of a crash for post-mortem analysis — essential when a bug only reproduces in production.
- "Works in debug, crashes in release" almost always means undefined behavior that -O0 happens to not expose but -O2/-O3's optimizer does — reach for UBSan/ASan first, not more manual debugging.
`,

  monitoring: `
Production C++ visibility rests on the same three pillars as any language (see the Observability category for depth), with C++-specific tooling built around native performance counters and structured logging libraries.

### Structured logging

~~~cpp
#include <spdlog/spdlog.h>

spdlog::info("processing order id={} user={}", orderId, userId);
spdlog::error("payment failed: {}", errorMessage);
~~~

spdlog is the most widely used modern C++ logging library — fast, header-only-friendly, structured, with configurable sinks (console, rotating file, syslog).

### Metrics (Prometheus)

~~~cpp
#include <prometheus/counter.h>
#include <prometheus/histogram.h>

auto& requests = prometheus::BuildCounter().Name("http_requests_total").Register(registry);
requests.Add({{"route", "/checkout"}, {"status", "200"}}).Increment();
~~~

The prometheus-cpp client library exposes the same RED metrics (Rate, Errors, Duration) any production service tracks, scraped by a standard Prometheus server.

### C++-specific signals to watch

- **Allocator behavior and fragmentation**: switching to jemalloc or tcmalloc can materially change throughput and memory footprint under high allocation pressure — worth benchmarking for allocation-heavy services.
- **perf counters** (cache misses, branch mispredictions) via perf stat give a hardware-level view of why a hot path is slow that application-level metrics can't show.
- **Sanitizer-clean CI as an ongoing signal**: running the ASan/UBSan/TSan build regularly (not just once) catches regressions before they reach production.

### Tracing (OpenTelemetry)

The OpenTelemetry C++ SDK provides distributed tracing spans that integrate with the same backends (Jaeger, Tempo) used by every other language in a polyglot system.
`,

  deployment: `
### The standard: multi-stage Docker producing a minimal runtime image

~~~dockerfile
# ---- build stage ----
FROM ubuntu:24.04 AS builder
RUN apt-get update && apt-get install -y build-essential cmake git
WORKDIR /app
COPY CMakeLists.txt .
COPY src/ src/
COPY include/ include/
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j$(nproc)

# ---- runtime stage ----
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y ca-certificates libstdc++6 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/build/myservice /usr/local/bin/myservice
RUN useradd -m appuser
USER appuser
EXPOSE 8080
CMD ["myservice"]
~~~

Why each choice matters: a two-stage build keeps the final image free of the full compiler toolchain (smaller, smaller attack surface); libstdc++6 is required in the runtime image unless the binary was statically linked (-static-libstdc++ or a fully static build) — a common source of "works on my machine, missing library in the container" bugs; a non-root user mitigates container-escape impact exactly as in any language.

### Static linking for minimal images

~~~bash
g++ -O2 -static-libstdc++ -static-libgcc main.cpp -o app   # statically link the C++ runtime itself
~~~

A fully static build (including musl libc, similar to Go's/Rust's static-binary story) lets the runtime stage be a truly minimal scratch or distroless image, at the cost of a larger binary and losing the ability to patch libc independently via the OS package manager.

### Serving topology

- A C++ service typically sits behind a reverse proxy (nginx, or a cloud load balancer) that terminates TLS, exactly as with any backend language.
- Health endpoints (/healthz, /readyz) wired to orchestrator probes, same pattern as any service.
- Graceful shutdown: handle SIGTERM, stop accepting new connections, let in-flight requests complete before exiting.

### CI/CD pipeline

Compile with warnings-as-errors → run the test suite under a sanitizer build → run the plain optimized build's tests → static analysis (cppcheck/Clang Static Analyzer) → build the release Docker image → scan → push → deploy with rolling update. See the **CI/CD** and **GitHub Actions** skills.
`,

  "production-checklist": `
Before a C++ service takes real traffic:

- [ ] Compiled with -O2/-O3 for the shipped binary — never a debug (-O0) build in production
- [ ] -Wall -Wextra -Werror enforced in CI on every PR
- [ ] Test suite passes under AddressSanitizer AND UndefinedBehaviorSanitizer at least once per merge
- [ ] No raw new/delete in application code without a documented, reviewed reason — smart pointers/RAII by default
- [ ] Every base class used polymorphically has a virtual destructor
- [ ] Config from env vars, validated at startup, fail-fast on missing/invalid values
- [ ] Structured logging (spdlog or equivalent) with request/correlation IDs
- [ ] Explicit timeouts on every outbound network/database call
- [ ] /healthz and /readyz endpoints wired to orchestrator probes
- [ ] Graceful SIGTERM handling verified (in-flight requests drain before exit)
- [ ] Prometheus metrics: request rate, error rate, p95/p99 latency
- [ ] Static analysis (cppcheck or Clang Static Analyzer) run in CI
- [ ] No secrets in code/config files in git; vault or platform secret store
- [ ] Dependency versions pinned (vcpkg.json / Conan lockfile) and reproducible across machines
- [ ] Load test done: known requests/sec ceiling and failure mode
- [ ] Runbook: how to roll back, scale up, and read the dashboards
`,

  "common-mistakes": `
1. **Treating undefined behavior as "probably fine if it doesn't crash"** — UB is a permission for the compiler to do anything, including something that looks correct today and breaks the moment the compiler version, optimization level, or an unrelated code change shifts.
2. **Reaching for raw new/delete instead of smart pointers** — usually a holdover from pre-C++11 habits or unfamiliarity with std::unique_ptr/make_unique, and the single biggest source of leaks and double-frees in new code.
3. **Not understanding move semantics**, leading to unnecessary deep copies of large objects (or, in the opposite direction, using std::move on something still needed afterward, leaving it in a used-but-valid-unspecified state).
4. **Forgetting a virtual destructor on a polymorphic base class** — deleting a derived object through a base pointer silently skips the derived destructor, leaking any resources it owned.
5. **Comparing signed and unsigned integers without thinking about it** — a classic silent-bug source (a negative int compared against an unsigned size_t implicitly converts the int to a huge positive value).
6. **Copying large objects by value in function signatures** out of habit — pass by const reference unless a genuine independent copy or move is intended.
7. **Ignoring compiler warnings** because "the code compiles" — many warnings flag genuine latent bugs, not style preferences.
8. **Writing a class that needs a destructor without also handling copy/move correctly** — violates the Rule of Five, typically causing a double-free or a shallow, incorrect copy.
9. **Using .size() on an empty container without checking**, then indexing at [0] anyway — a bounds violation that's UB, not a caught exception, unless .at() is used.
10. **Overusing macros for things templates or constexpr functions do more safely** — macros are pure text substitution, invisible to the type system, and a common source of subtle, hard-to-debug errors.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Segmentation fault | Dereferencing a null/dangling pointer, or stack overflow from deep/infinite recursion | Check pointers before dereferencing; use a debugger or ASan to find the exact faulting line |
| Undefined reference to (linker error) | A function/variable is declared but never defined, or a library isn't linked | Ensure the .cpp implementing it is compiled/linked; check CMakeLists.txt target_link_libraries |
| Double free or corruption | Two owners both delete the same pointer (missing Rule of Five, or manual new/delete mismanagement) | Use smart pointers; audit ownership — exactly one owner should ever call delete |
| Heap-buffer-overflow (ASan) | Reading/writing past the allocated bounds of a heap object | Bounds-check with .at(), fix the loop condition or index arithmetic |
| Stack smashing detected | Buffer overflow on a stack-allocated array (classic C-style char buffer) | Use std::string/std::array with bounds checking instead of raw fixed-size C arrays |
| Pure virtual function called | Calling a virtual function during construction/destruction of a base class, or on a partially destroyed object | Never call virtual functions from a constructor/destructor expecting derived-class behavior |
| terminate called after throwing an instance of X | An exception escaped a destructor or a noexcept function, or was never caught | Never let a destructor throw; ensure exceptions are caught at an appropriate boundary |
| Multiple definition of X (linker) | A non-inline function/variable defined in a header included by multiple translation units, violating ODR | Mark it inline, move the definition to a single .cpp file, or use a header guard correctly |
`,

  faqs: `
**Is C++ "harder" than Python or Go?**
For the same task, yes — C++ requires you to reason about memory, lifetimes, and often template mechanics that garbage-collected languages abstract away. That reasoning is exactly what buys the performance and control C++ offers; it's a real tradeoff, not just accidental complexity.

**Should I learn C before C++?**
Not required. Learning "modern C++" (RAII, smart pointers, std::vector) directly, without first internalizing C's raw-pointer, manual-memory style, is a well-supported and increasingly common path — this page teaches it that way.

**Why does C++ still allow unsafe, UB-prone code if it's so dangerous?**
Backward compatibility with 40+ years of existing code and libraries, plus the zero-overhead philosophy: safety checks the language doesn't need for your use case shouldn't cost you performance you didn't ask to pay for. This is precisely the tradeoff Rust's design pushes back against.

**Do I need to know C++ as an AI engineer?**
Not to train or fine-tune models day-to-day (Python dominates there), but very likely yes if you work on inference optimization, custom CUDA kernels, or performance-critical serving infrastructure — reading and lightly modifying C++ is a common, valuable skill even if you rarely write it from scratch.

**What's the difference between std::unique_ptr and std::shared_ptr, and when do I use each?**
unique_ptr models exclusive ownership at zero overhead — use it by default. shared_ptr models genuinely shared ownership via atomic reference counting — use it only when multiple independent owners truly need to keep an object alive, since the refcounting has a real (small) cost.

**Is C++ still evolving, or is it legacy?**
Actively evolving — C++20 and C++23 added major features (concepts, ranges, coroutines, modules), and C++26 is in active standardization; it is simultaneously one of the oldest mainstream languages and one of the most actively developed.

**Why do C++ codebases look so different from each other?**
Different codebases were written in different "eras" of the language (pre-C++11 raw-pointer style vs. modern RAII/smart-pointer style) and rarely get fully rewritten — reading older C++ and modern C++ are close to two different skills, both worth having.
`,

  "interview-questions": `
### Junior level

1. **What is the difference between a pointer and a reference?**
   Model answer: A pointer holds an address, can be reassigned or null, and requires explicit dereferencing (*ptr); a reference is an alias bound once at creation, cannot be null in well-defined code, and is used exactly like the original variable.

2. **What is RAII and why does C++ use it?**
   Model answer: Resource Acquisition Is Initialization — tying a resource's lifetime to an object's scope, so the destructor releases it automatically and deterministically, without a garbage collector, even during exception-driven stack unwinding.

3. **What's the difference between std::vector and a raw array?**
   Model answer: std::vector dynamically resizes, manages its own memory, and offers optional bounds checking via .at(); a raw array has fixed size and no bounds checking, a classic UB source when indexed incorrectly.

4. **What does the const keyword do on a member function?**
   Model answer: It promises the function will not modify the object's non-mutable members, letting it be called on const instances/references and documenting intent to callers and the compiler.

5. **What is undefined behavior?**
   Model answer: Code the C++ standard places no requirements on the outcome of — the compiler may do anything, including something that appears to work, making UB more dangerous than a guaranteed crash or exception.

### Senior level

6. **Explain move semantics and why they were added in C++11.**
   Model answer: Move "steals" a temporary or explicitly-moved-from object's internal resources (an O(1) pointer swap) instead of deep-copying them (O(n)); added because returning large objects by value was previously expensive, forcing workarounds like output parameters that move semantics made unnecessary.

7. **What is the Rule of Five, and when does the Rule of Zero apply instead?**
   Model answer: If a class manages a raw resource, it needs all five special member functions (destructor, copy constructor/assignment, move constructor/assignment) defined correctly together; the Rule of Zero — composing only from members that already manage their own resources — avoids needing any of them and is the preferred modern default.

8. **How does virtual dispatch work internally, and what does it cost?**
   Model answer: Each polymorphic object holds a hidden vtable pointer to a table of function pointers for its dynamic type; a virtual call is one extra pointer indirection through that table versus a direct call — usually negligible, occasionally worth avoiding in the single hottest inner loop via templates/CRTP instead.

9. **What is a data race, and how does std::atomic help?**
   Model answer: Two threads accessing the same memory concurrently, at least one writing, without synchronization — undefined behavior in C++. std::atomic operations, combined with acquire/release memory ordering, let threads safely publish and observe shared data without a full mutex when the access pattern is simple enough.

10. **Why is comparing a signed int to an unsigned size_t dangerous?**
    Model answer: The signed value implicitly converts to unsigned for the comparison; a negative int becomes a huge positive number, silently breaking loop conditions or bounds checks that assumed normal signed comparison semantics.

11. **What's the actual difference between templates and virtual functions for achieving polymorphism?**
    Model answer: Templates resolve at compile time (monomorphization — a specialized copy per type, zero dispatch cost, larger binary, needs the type known at compile time); virtual functions resolve at runtime (one vtable indirection, smaller binary, works with types not known until runtime) — choose based on whether the set of types is closed and known ahead of time.

12. **How would you diagnose a "works in debug, crashes in release" bug?**
    Model answer: Strongly suspect undefined behavior that -O0 happened not to expose but -O2/-O3's optimizer's assumptions do — reach for AddressSanitizer and UndefinedBehaviorSanitizer builds first, rather than manual debugging of the release binary directly.
`,

  "coding-questions": `
### 1. Reverse a linked list (iterative, with proper ownership)

~~~cpp
struct Node {
    int value;
    std::unique_ptr<Node> next;
    explicit Node(int v) : value(v), next(nullptr) {}
};

std::unique_ptr<Node> reverse(std::unique_ptr<Node> head) {
    std::unique_ptr<Node> prev = nullptr;
    while (head) {
        std::unique_ptr<Node> next = std::move(head->next);  // save the rest
        head->next = std::move(prev);                          // point current at the reversed-so-far list
        prev = std::move(head);                                 // advance prev
        head = std::move(next);                                 // advance head
    }
    return prev;
}
// Time: O(n), Space: O(1) extra (ownership is transferred, not copied)
// Follow-up: how would this differ using raw pointers, and what would you have to manage manually?
~~~

### 2. Detect a cycle in a vector-based graph (DFS with recursion stack)

~~~cpp
bool hasCycleUtil(int node, std::vector<std::vector<int>>& graph,
                   std::vector<bool>& visited, std::vector<bool>& inStack) {
    visited[node] = true;
    inStack[node] = true;
    for (int neighbor : graph[node]) {
        if (!visited[neighbor]) {
            if (hasCycleUtil(neighbor, graph, visited, inStack)) return true;
        } else if (inStack[neighbor]) {
            return true;   // back edge to a node currently on the recursion stack — a cycle
        }
    }
    inStack[node] = false;
    return false;
}

bool hasCycle(std::vector<std::vector<int>>& graph) {
    int n = graph.size();
    std::vector<bool> visited(n, false), inStack(n, false);
    for (int i = 0; i < n; ++i) {
        if (!visited[i] && hasCycleUtil(i, graph, visited, inStack)) return true;
    }
    return false;
}
// Time: O(V + E), Space: O(V)
// Follow-up: how would you convert this to an iterative version to avoid stack-overflow risk on huge graphs?
~~~

### 3. Implement a thread-safe bounded queue (producer-consumer)

~~~cpp
template <typename T>
class BoundedQueue {
public:
    explicit BoundedQueue(size_t capacity) : capacity_(capacity) {}

    void push(T item) {
        std::unique_lock<std::mutex> lock(mutex_);
        notFull_.wait(lock, [this] { return queue_.size() < capacity_; });
        queue_.push(std::move(item));
        notEmpty_.notify_one();
    }

    T pop() {
        std::unique_lock<std::mutex> lock(mutex_);
        notEmpty_.wait(lock, [this] { return !queue_.empty(); });
        T item = std::move(queue_.front());
        queue_.pop();
        notFull_.notify_one();
        return item;
    }

private:
    size_t capacity_;
    std::queue<T> queue_;
    std::mutex mutex_;
    std::condition_variable notFull_, notEmpty_;
};
// Follow-up: how would you add a try_pop with a timeout, and what changes for multiple consumer threads?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a CLI inventory tracker
Build a command-line tool using std::vector<Struct> to track items (name, quantity, price), supporting add/remove/list, with input validation. Deliverable: a working CLI; skills exercised: classes, std::vector, std::string, basic I/O.

### Lab 2 (Intermediate): Implement a generic LRU cache
Build a template-based LRU cache using std::unordered_map + a doubly linked list, supporting get/put in O(1). Deliverable: a tested, templated Cache<K, V> class with a GoogleTest suite. Skills exercised: templates, RAII, iterators, Rule of Zero/Five.

### Lab 3 (Advanced): Multithreaded work-stealing task queue
Build a thread pool where idle threads can "steal" work from busy threads' queues, using std::thread, std::mutex/condition_variable or atomics. Deliverable: a benchmarked thread pool showing throughput scaling with core count. Skills exercised: concurrency, atomics, memory model, profiling.

### Lab 4 (Production): Wrap a model inference engine with a C++ HTTP service
Take a small ONNX or LibTorch model and serve it behind a minimal C++ HTTP server (Drogon or Pistache), with proper RAII resource management, structured logging, health endpoints, and a Dockerfile. Deliverable: a containerized inference microservice with a load test showing p95/p99 latency. Skills exercised: production architecture, deployment, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A lightweight embedded key-value store
Engineering requirements: a persistent, single-file key-value store with a custom binary format, RAII-managed file handles, crash-safe writes (write-ahead log), and a benchmark comparing against SQLite for simple workloads. Demonstrates memory-mapped I/O, RAII, and careful UB-free binary parsing.

### 2. A CPU-based matrix multiplication and neural-network inference library
Engineering requirements: hand-written, SIMD-optimized (using intrinsics or auto-vectorization) matrix multiply and a minimal feed-forward network inference path, benchmarked against a naive triple-loop implementation and against calling into an existing library (Eigen). Demonstrates the performance hierarchy in this page in a directly AI-relevant context.

### 3. A production-grade thread-safe rate limiter service
Engineering requirements: a token-bucket rate limiter exposed over gRPC, backed by atomics for lock-free hot-path updates, full test coverage under ThreadSanitizer, containerized with a CI pipeline running sanitizer builds. Demonstrates concurrency correctness, production tooling, and deployment discipline end to end.
`,

  "case-studies": `
### Discord's move away from (and Bloomberg's toward) C++
Discord famously moved a Go service to Rust to eliminate GC-pause latency spikes (see the Rust skill) rather than to C++, while Bloomberg's low-latency trading systems remain heavily C++ — the lesson: when GC pauses are unacceptable, teams choose between C++'s manual control and Rust's compile-time-safe alternative based on team experience and risk tolerance for UB, not on raw performance alone, since both can achieve comparable throughput.

### NVIDIA's CUDA and the "C++ dialect" pattern
CUDA is fundamentally C++ extended with GPU-specific keywords and memory spaces — NVIDIA's choice to build on C++ rather than invent a wholly new language let it inherit templates, RAII, and the entire existing C++ toolchain and developer base, dramatically accelerating adoption compared to a from-scratch language would have. Lesson: extending a mature, widely known language can be a bigger strategic win than a "cleaner" from-scratch design.

### Heartbleed and the cost of manual memory management
The 2014 Heartbleed vulnerability in OpenSSL (written in C, C++'s close relative) stemmed from a missing bounds check on a buffer read — a single missed validation exposed private keys and credentials across a huge fraction of the internet's TLS traffic. Lesson: manual memory management's power comes with a real, industry-wide-scale cost when a single oversight occurs in security-critical code, which is precisely the case for RAII discipline, sanitizers, and (increasingly) language-level safety proposals.

### Google's migration to Abseil and modern C++ style guides
Google's internal shift toward a strict, curated modern-C++ subset (via Abseil and its style guide) across a codebase of that scale demonstrates that even with decades of legacy C++ code, disciplined incremental modernization (banning raw new/delete in new code, mandating smart pointers) measurably reduces a large, real-world codebase's bug rate without a full rewrite. Lesson: style-guide and static-analysis discipline can retrofit much of modern C++'s safety benefit onto old code.
`,

  comparisons: `
| Aspect | C++ | Rust | Go | Java |
|--------|-----|------|----|----|
| Memory safety | Manual/RAII, not compiler-enforced | Compiler-enforced (borrow checker) | Garbage collected | Garbage collected |
| Performance | Native, zero-overhead abstractions | Native, comparable to C++ | Native but GC pauses possible | JIT-compiled, GC pauses possible |
| Learning curve | Steep (UB, templates, multiple eras of style) | Steep (borrow checker) initially, then productive | Shallow, deliberately simple | Moderate |
| Generics | Templates (compile-time, powerful, complex errors) | Generics + traits (compile-time) | Generics (added later, simpler) | Generics (type-erased, less powerful) |
| Concurrency safety | Manual discipline + sanitizers | Compiler-enforced (Send/Sync) | Goroutines + race detector | Manual discipline + tooling |
| Ecosystem for AI | Inference engines, CUDA, game/robotics | Growing (tokenizers, some inference tooling) | Infra tooling around ML systems | Enterprise data pipelines (Spark) |
| Compile times | Often slow (templates, headers) | Often slow (monomorphization, borrow checking) | Very fast | Fast (incremental) |

**How seniors choose**: reach for C++ when you need the absolute performance ceiling AND either full control over an existing C/C++ codebase or ecosystem (CUDA, an existing engine) that's already C++; reach for Rust when starting fresh and want comparable performance with compile-time safety guarantees and a team willing to climb the borrow-checker learning curve; reach for Go when developer velocity and operational simplicity matter more than the last 10-20% of raw performance; reach for Java when you're embedded in an existing JVM/enterprise ecosystem (Spark, Kafka clients) that makes the JVM the path of least resistance.
`,

  "related-technologies": `
- **C** — C++'s ancestor and still nearly-fully compatible subset; understanding C deepens intuition for what C++ is doing "underneath" its higher-level abstractions.
- **Rust** — the modern alternative solving the same performance-with-safety problem via compile-time enforcement instead of programmer discipline; see the **Rust** skill for a direct contrast.
- **CUDA** — NVIDIA's C++ dialect for GPU programming, essential for anyone writing custom kernels for model training or inference.
- **CMake** — the de facto standard C++ build system; fluency here is close to mandatory for any real C++ project.
- **Concurrency** and **Multithreading** — the general CS fundamentals this page's std::thread/atomics sections build directly on.
- **Data Structures** and **Algorithms** — C++ is a common language for implementing and reasoning about these at the lowest level, especially in interview contexts.
- **Vision AI** and inference-serving skills (TensorRT, ONNX Runtime, llama.cpp-style engines) — the direct AI-production context where C++ fluency pays off most.
- **Python** — the language C++ most often sits underneath, via pybind11 or similar bindings, in real ML systems.

Learning path: general **Computer Science** fundamentals → this page → **Concurrency**/**Multithreading** for the threading model in depth → **Rust** for a contrasting modern-safety perspective → inference/serving skills for the direct AI-production payoff.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **C++23** is the current fully ratified standard, adding std::expected (a Result-like type for error handling without exceptions), deducing this (simplifying certain template patterns), and further ranges/constexpr extensions.
- **C++26** is in active standardization, with reflection (compile-time introspection of types), contracts (preconditions/postconditions as a language feature), and continued "safety profiles" discussion — an explicit, ongoing response to Rust's compile-time-safety success story.
- Compiler support (GCC, Clang, MSVC) for C++20/23 features has matured significantly; C++20 modules in particular remain the least uniformly supported major feature across toolchains as of this cutoff — verify current compiler support before committing a large codebase to modules.
- Given the pace of standardization, verify current compiler feature-support tables (cppreference.com maintains an up-to-date compatibility matrix) before relying on any C++23/26 feature in a new production codebase.
`,

  "future-roadmap": `
Where C++ is heading, and what's worth betting career time on:

- **Safety profiles and "Safe C++" proposals** — the standards committee is actively working on ways to opt specific code into stronger, more Rust-like compile-time safety guarantees without breaking existing code; understanding this direction now positions you well as it lands over the next several standard cycles.
- **Continued modules adoption** — as tooling catches up, C++20 modules should meaningfully improve build times for large codebases; worth tracking for any team maintaining a big C++ project.
- **Deeper GPU/heterogeneous-compute integration** — SYCL and continued CUDA evolution keep C++ as the primary language for programming accelerators, directly relevant as AI workloads increasingly span CPU/GPU/custom silicon.
- **Reflection (C++26)** — compile-time introspection will reduce boilerplate (serialization, ORMs) that currently requires macros or external code generation, a genuinely significant ergonomics upgrade once it lands.
- **What to bet on**: modern C++ idioms (RAII, smart pointers, templates/concepts, the standard algorithms library) rather than pre-C++11 style — the language's own standardization committee is visibly steering toward safety and ergonomics without abandoning performance, and fluency in that direction ages better than legacy-style C++.
`,

  "cheat-sheet": `
~~~cpp
// ---- Core syntax ----
int x = 5; const double pi = 3.14; std::string s = "hi";
int* ptr = &x; *ptr = 10;          // pointer: address-of / dereference
int& ref = x;                       // reference: alias, no null, no reseat

// ---- RAII + smart pointers ----
auto p = std::make_unique<Widget>();      // exclusive ownership, zero overhead
auto s2 = std::make_shared<Widget>();      // shared ownership, atomic refcount
auto moved = std::move(p);                  // transfer ownership, p becomes null

// ---- Rule of Zero ----
class Good { std::vector<int> data_; std::unique_ptr<Impl> impl_; };  // no manual dtor needed

// ---- Templates ----
template <typename T> T maxOf(T a, T b) { return a > b ? a : b; }

// ---- Containers + algorithms ----
std::vector<int> v = {3, 1, 2};
std::sort(v.begin(), v.end());
auto it = std::find(v.begin(), v.end(), 2);

// ---- Concurrency ----
std::thread t([]{ work(); }); t.join();
std::mutex m; std::lock_guard<std::mutex> lock(m);
std::atomic<int> counter{0}; counter.fetch_add(1);

// ---- Build & tools ----
// g++ -std=c++20 -O2 -Wall -Wextra -fsanitize=address main.cpp -o app
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Pointer vs reference? | Pointer: address, reassignable, can be null. Reference: alias, bound once, never null. |
| What is RAII? | Tying resource lifetime to object scope; destructor releases it automatically and deterministically. |
| unique_ptr vs shared_ptr? | unique_ptr: exclusive ownership, zero overhead. shared_ptr: shared ownership, atomic refcount, real cost. |
| What does std::move do? | Casts to an rvalue reference, enabling move semantics — it does not itself move anything. |
| Rule of Five? | If you need a custom destructor, you likely need copy ctor/assign and move ctor/assign too. |
| Rule of Zero? | Compose from self-managing members so none of the five special functions need writing. |
| What is undefined behavior? | Code the standard places no requirements on the outcome of — compiler may do anything. |
| Template vs virtual function? | Template: compile-time, zero dispatch cost, needs known types. Virtual: runtime, one vtable indirection, flexible. |
| Why is a missing virtual destructor dangerous? | Deleting a derived object via a base pointer skips the derived destructor — resource leak/UB. |
| What does const on a method mean? | The method promises not to modify the object's non-mutable state. |
| What is a data race? | Concurrent access to shared memory, one write, no synchronization — undefined behavior in C++. |
| AddressSanitizer catches what? | Buffer overflows, use-after-free, memory leaks — with an exact source line. |
| Why prefer .at() over operator[]? | .at() bounds-checks and throws; operator[] is unchecked, undefined behavior if out of bounds. |
| What is small string optimization? | Short strings avoid heap allocation entirely, stored inline in the std::string object. |
| Why does slicing happen? | Assigning a derived object to a base object BY VALUE truncates it to just the base portion. |
`,

  mcqs: `
1. What happens when you read past the end of a std::vector using operator[]?
   A) Throws std::out_of_range  B) Returns zero  C) Undefined behavior  D) Compile error
   **Answer: C** — operator[] does not bounds-check; .at() would throw instead.

2. Which special member functions must a class managing a raw resource typically define together (Rule of Five)?
   A) Only the destructor  B) Destructor, copy ctor/assign, move ctor/assign  C) Only copy ctor  D) Only move ctor
   **Answer: B** — all five, or none of them (Rule of Zero) by delegating to self-managing members.

3. What does std::move actually do?
   A) Physically moves memory  B) Casts its argument to an rvalue reference  C) Deep-copies the object  D) Frees the object
   **Answer: B** — it enables move semantics via a cast; the actual "stealing" happens in the move constructor/assignment it selects.

4. Why is a missing virtual destructor on a polymorphic base class dangerous?
   A) It's a compile error  B) It slows down construction  C) Deleting via a base pointer skips the derived destructor  D) It has no effect
   **Answer: C** — resources owned by the derived part are never released.

5. What does AddressSanitizer primarily detect?
   A) Style violations  B) Memory errors like buffer overflows and use-after-free  C) Slow algorithms  D) Missing tests
   **Answer: B** — it instruments memory access to catch these at the exact faulting line.

6. Templates resolve polymorphism at:
   A) Runtime, via a vtable  B) Compile time, generating specialized code per type  C) Link time  D) They don't provide polymorphism
   **Answer: B** — this is why they're zero-overhead but can increase compile time and binary size.
`,

  "revision-notes": `
C++ extends C with zero-overhead object orientation, generics (templates), and RAII-based deterministic resource management, all compiled ahead-of-time to native machine code with no garbage collector. Its central philosophy — "you don't pay for what you don't use" — means abstractions cost nothing at runtime versus hand-written low-level equivalents, which is precisely why it remains the default language underneath performance-critical AI infrastructure: inference engines, CUDA kernels, and the core of frameworks like PyTorch.

The language's sharpest edge is undefined behavior: a large class of mistakes (out-of-bounds access, use-after-free, uninitialized reads, data races) are not simply runtime errors but UB, meaning the compiler may legally do anything, including produce code that appears correct until an unrelated change (compiler version, optimization level) breaks it. This is why modern C++ style leans so heavily on RAII and smart pointers (std::unique_ptr by default, std::shared_ptr only for genuine shared ownership) — they eliminate the most common UB sources by construction, and why sanitizers (AddressSanitizer, UndefinedBehaviorSanitizer, ThreadSanitizer) are treated as close to mandatory in CI rather than optional tooling.

Move semantics (C++11) solved a real historical performance problem — returning large objects by value used to force copies or ugly output-parameter workarounds; now a move is an O(1) resource transfer. Templates provide compile-time generic code at zero dispatch cost, contrasted with virtual functions' runtime polymorphism (one vtable indirection) — seniors choose templates when the type set is known at compile time and virtual dispatch when it genuinely isn't.

Production C++ is built with CMake, tested with GoogleTest or Catch2, profiled with perf/Valgrind/Google Benchmark rather than guessed at, and deployed as a native binary in a minimal container — often the innermost, most latency-critical tier of a larger polyglot system whose outer layers are written in something more productive like Python or Go. The Rule of Zero (compose from self-managing members) versus the Rule of Five (write all five special member functions correctly if you manage a raw resource) is the core discipline for correct resource management; getting it wrong is the single most common source of leaks, double-frees, and crashes in real C++ codebases.

Security-wise, C++ trusts the programmer with memory in a way few modern languages still do — buffer overflows and use-after-free bugs remain a top historical CVE category in C/C++ software, which is precisely why RAII discipline, sanitizers, and (increasingly) proposed "safety profiles" for future C++ standards exist: to close as much of that gap as possible without abandoning the zero-overhead performance that makes C++ worth using in the first place.
`,

  "learning-roadmap": `
**Week 1 — Foundations**: syntax, variables, pointers vs references, functions, classes, compiling with g++/clang++. Milestone: write and compile a small CLI program using classes and std::vector.

**Week 2 — RAII and smart pointers**: RAII idiom, std::unique_ptr/std::shared_ptr, the Rule of Zero/Three/Five, exceptions. Milestone: refactor a manual new/delete program to be fully RAII-based with zero leaks (verify under Valgrind or ASan).

**Week 3 — Templates and the STL**: templates, std::vector/std::map/std::unordered_map, the standard algorithms (sort, find, transform), lambdas. Milestone: implement a small generic data structure (e.g., a templated stack or LRU cache).

**Week 4 — Move semantics and modern idioms**: rvalue references, std::move, perfect forwarding, structured bindings, std::optional/std::variant. Milestone: profile and eliminate unnecessary copies in a program using move semantics correctly.

**Week 5 — Concurrency**: std::thread, std::mutex/condition_variable, std::atomic, the memory model basics. Milestone: build a thread-safe bounded queue (see Coding Questions) and verify it under ThreadSanitizer.

**Week 6 — Production practices**: CMake, GoogleTest/Catch2, sanitizers in CI, profiling with perf, Dockerized deployment. Milestone: complete the Lab 4 hands-on project (a containerized inference microservice) end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Concurrency** (for the general CS theory underneath std::thread/atomics) or **CUDA-adjacent** inference-serving skills if your goal is AI-infrastructure work specifically.
`,

  "official-docs": `
- **cppreference.com** — the de facto standard reference for the C++ standard library and language features, including up-to-date compiler compatibility tables; the single most-used C++ reference by working engineers.
- **isocpp.org** — the official Standard C++ Foundation site, with FAQs, core guidelines links, and standardization committee news.
- **C++ Core Guidelines** (isocpp.github.io/CppCoreGuidelines) — Stroustrup and Sutter's community-maintained best-practices guide, extremely widely cited in code review.
- **GCC and Clang documentation** — for compiler-specific flags, sanitizer options, and diagnostics.
- **CMake documentation** (cmake.org/cmake/help/latest) — for the build system nearly every production C++ project uses.
`,

  books: `
- **"The C++ Programming Language" (4th ed.) — Bjarne Stroustrup** — the language creator's own comprehensive reference; dense but authoritative.
- **"Effective Modern C++" — Scott Meyers** — the standard for learning idiomatic C++11/14 (move semantics, smart pointers, auto) with concrete, numbered items.
- **"A Tour of C++" (3rd ed.) — Bjarne Stroustrup** — a much shorter, faster on-ramp than the full language reference, good for an experienced programmer new to C++.
- **"C++ Concurrency in Action" — Anthony Williams** — the definitive deep dive on std::thread, atomics, and the memory model.
- **"C++ Templates: The Complete Guide" — Vandevoorde, Josuttis, Gregor** — the reference once you need to go deep on template metaprogramming.
- **"Design Patterns" (the Gang of Four book)** — not C++-specific, but its examples are C++ and it remains foundational for OOP design vocabulary used throughout the industry.
`,

  blogs: `
- **isocpp.org/blog** — the official Standard C++ Foundation blog, aggregating high-signal community and committee news.
- **Herb Sutter's blog (herbsutter.com)** — one of the standards committee's most prominent members, writing on language direction and modern idioms.
- **Fluent C++ (fluentcpp.com)** — practical, example-driven modern C++ idiom explanations.
- **Arthur O'Dwyer's blog (quuxplusone.github.io)** — deep, precise dives into template mechanics and language corner cases.
- **The Chromium/LLVM engineering blogs** — real large-codebase C++ engineering practices from teams operating at extreme scale.
`,

  "research-papers": `
Research papers specifically about the C++ language itself are relatively thin compared to a research-heavy field like machine learning — most authoritative "papers" here are actually the ISO standard proposal documents (WG21 papers), which are the closest thing to primary research literature for language evolution:

- **Stroustrup, B. — "A history of C++: 1979-1991"** (HOPL-II, 1993) and its successor **"Evolving a language in and for the real world: C++ 1991-2006"** (HOPL-III, 2007) — the closest things to formal research papers on the language's own design history, written by its creator.
- **WG21 proposal papers** (open-std.org/jtc1/sc22/wg21/docs/papers) — the actual design documents behind every language feature (e.g., P0912 for coroutines, P2300 for std::execution) are the primary literature for anyone wanting to understand WHY a feature was designed the way it was, not just how to use it.
- For foundational reading on the safety-vs-performance tradeoff C++ sits inside, the Rust language's own design papers and Microsoft/Google's published memory-safety CVE data (referenced throughout this page) are the closest adjacent research grounding the "why memory safety matters" argument.
`,

  videos: `
- **CppCon** (the largest annual C++ conference, fully recorded and free on YouTube) — the single best source of deep, current C++ talks from the people who write the standard and major implementations.
- **"Back to Basics" track at CppCon** — specifically aimed at solidifying fundamentals correctly, excellent for this page's beginner/intermediate material.
- **Herb Sutter's "CppCon keynotes"** — recurring, direction-setting talks on where the language is headed.
- **The Cherno (YouTube)** — widely watched, approachable modern C++ tutorial series with a strong game-engine-development bent.
- **Jason Turner's "C++ Weekly"** — short, focused episodes on specific modern-C++ idioms and gotchas, good for continued learning after the basics.
`,

  "github-repos": `
- **isocpp/CppCoreGuidelines** — the community-maintained best-practices guide referenced throughout this page.
- **google/googletest** — the GoogleTest/GoogleMock testing framework used across a huge share of production C++ codebases.
- **catchorg/Catch2** — the leading lightweight alternative test framework, popular for its header-only simplicity.
- **abseil/abseil-cpp** — Google's collection of modern C++ utility libraries, and a strong example of idiomatic large-scale modern C++ style.
- **microsoft/GSL** — the Guidelines Support Library, concrete utilities (span, not_null) implementing Core Guidelines recommendations.
- **fmtlib/fmt** — the modern, type-safe string formatting library that became the basis for std::format in C++20.
- **google/benchmark** — the standard micro-benchmarking library referenced in this page's Performance and Testing sections.
- **ggml-org/llama.cpp** — a directly AI-relevant, widely studied real-world C++ inference engine, excellent for reading production-grade performance-oriented C++.
- **CLIUtils/CLI11** — a well-regarded, header-only command-line argument parsing library, useful for the Hands-on Labs' CLI project.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Pointers/references/ownership**: implement a doubly linked list from scratch using raw pointers, then refactor it to use std::unique_ptr — compare the code and reason about what changed.
2. **RAII/smart pointers**: write an RAII wrapper around a C-style resource (e.g., a POSIX file descriptor or a mutex) from scratch.
3. **Templates**: implement a generic, type-safe Stack<T> and Queue<T>, then add a templated function that works across both via a shared interface.
4. **Move semantics**: profile a function that unnecessarily copies large objects, then fix it with move semantics and measure the improvement.
5. **Concurrency**: implement a thread-safe singleton, a producer-consumer queue, and a simple thread pool.
6. **External practice sets**: LeetCode's C++ track for algorithmic practice; Exercism's C++ track for idiom-focused exercises with mentor feedback; the "C++ Core Guidelines" checker (clang-tidy with cppcoreguidelines checks) run against your own code as a self-review exercise.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Client / upstream service"] -->|gRPC or HTTP| LB["Load balancer / reverse proxy\n(TLS termination)"]
    LB --> Svc1["C++ service instance\n(thread pool + async I/O)"]
    LB --> Svc2["C++ service instance N"]
    Svc1 --> Cache[("In-process / Redis cache")]
    Svc1 --> DB[("PostgreSQL or storage layer")]
    Svc1 --> Infer["Inference engine\n(LibTorch / ONNX Runtime / TensorRT)"]
    subgraph Observability
        Logs["Structured logs (spdlog)"]
        Metrics["Prometheus metrics"]
        Traces["OpenTelemetry traces"]
    end
    Svc1 -.-> Logs
    Svc1 -.-> Metrics
    Svc1 -.-> Traces
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((C++))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Language
      Pointers vs references
      Classes and RAII
      Templates
      Move semantics
      Rule of Zero/Three/Five
    Internals
      Compilation pipeline
      Undefined behavior
      Virtual dispatch
      Memory model and atomics
    Production
      CMake and build tooling
      Testing GoogleTest Catch2
      Sanitizers ASan UBSan TSan
      Deployment Docker
      Monitoring spdlog Prometheus
    Ecosystem
      CUDA and GPU programming
      Inference engines
      Comparisons to Rust Go Java
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default cpp;
