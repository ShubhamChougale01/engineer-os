import type { CheatSheetData } from "./types";

const cpp: CheatSheetData = {
  title: "The Ultimate C++ Cheat Sheet",
  subtitle: "Pointers & RAII · templates · move semantics · concurrency · production toolbelt",
  sections: [
    {
      title: "Core Syntax",
      color: "violet",
      rows: [
        { term: "Variables & const", desc: "const cannot be reassigned after initialization", code: "int age = 36;\nconst double pi = 3.14159;" },
        { term: "Pointer", desc: "Holds an address; & is address-of, * is dereference", code: "int x = 10;\nint* ptr = &x;\n*ptr = 20;" },
        { term: "Reference", desc: "An alias, bound once, never null, no reseat", code: "int& ref = x;\nref = 30;  // this IS x" },
        { term: "Control flow", desc: "if/else, range-based for, switch", code: "for (int n : nums) { ... }\nif (n > 0) { ... } else { ... }" },
        { term: "Functions & overloading", desc: "Same name, different parameter types", code: "double area(double r);\ndouble area(double l, double w);" },
        { term: "Class", desc: "Constructor with member initializer list", code: "class Point {\npublic:\n  Point(double x, double y) : x_(x), y_(y) {}\nprivate:\n  double x_, y_;\n};" },
      ],
    },
    {
      title: "RAII & Ownership",
      color: "blue",
      rows: [
        { term: "unique_ptr", desc: "Exclusive ownership, zero overhead vs raw pointer", code: "auto p = std::make_unique<Widget>();\nauto p2 = std::move(p);  // p is now null" },
        { term: "shared_ptr", desc: "Shared ownership, atomic reference counting", code: "auto s1 = std::make_shared<Widget>();\nauto s2 = s1;  // refcount now 2" },
        { term: "Rule of Zero", desc: "Preferred default: own nothing raw, need none of the five", code: "class Good {\n  std::vector<int> data_;\n  std::unique_ptr<Impl> impl_;\n};" },
        { term: "Rule of Five", desc: "Managing a raw resource needs all five special members", code: "~Buffer(); Buffer(const Buffer&);\nBuffer& operator=(const Buffer&);\nBuffer(Buffer&&) noexcept;\nBuffer& operator=(Buffer&&) noexcept;" },
        { term: "RAII lock", desc: "Never manually unlock a mutex", code: "std::mutex m;\nstd::lock_guard<std::mutex> lock(m);" },
        { term: "Never new/delete directly", desc: "Manual pairing is exception-unsafe and leak-prone", code: "// WRONG: Widget* w = new Widget(); delete w;\n// RIGHT: auto w = std::make_unique<Widget>();" },
      ],
    },
    {
      title: "Templates & Move Semantics",
      color: "emerald",
      rows: [
        { term: "Function template", desc: "Compiler generates a specialization per type used", code: "template <typename T>\nT maxOf(T a, T b) { return a > b ? a : b; }" },
        { term: "Class template", desc: "Generic containers, e.g. a Stack<T>", code: "template <typename T>\nclass Stack {\n  std::vector<T> data_;\n};" },
        { term: "Move constructor", desc: "Steals resources — O(1), not a deep copy", code: "Buffer(Buffer&& o) noexcept\n  : data_(o.data_) { o.data_ = nullptr; }" },
        { term: "std::move", desc: "Casts to rvalue reference — enables a move, does not move itself", code: "std::vector<int> b = std::move(a);  // a is now empty" },
        { term: "Return value optimization", desc: "Returning a local by value is a move, not a copy", code: "std::vector<int> make() {\n  std::vector<int> v(1000000);\n  return v;  // moved, not copied\n}" },
        { term: "constexpr", desc: "Computed at compile time when inputs are known then", code: "constexpr int fact(int n) {\n  return n <= 1 ? 1 : n * fact(n - 1);\n}" },
      ],
    },
    {
      title: "STL Containers & Algorithms",
      color: "amber",
      rows: [
        { term: "vector", desc: "Dynamic array, the default sequence container", code: "std::vector<int> v = {1, 2, 3};\nv.push_back(4);\nv.at(0);  // bounds-checked" },
        { term: "unordered_map", desc: "Hash table, average O(1) lookup", code: "std::unordered_map<std::string, int> m;\nm[\"a\"] = 1;" },
        { term: "sort / find", desc: "Standard algorithms over iterator ranges", code: "std::sort(v.begin(), v.end());\nstd::find(v.begin(), v.end(), 2);" },
        { term: "Lambdas", desc: "Inline behavior for algorithms", code: "std::sort(v.begin(), v.end(),\n  [](int a, int b) { return a > b; });" },
        { term: "Exceptions", desc: "Catch by const reference, never by value", code: "try { risky(); }\ncatch (const std::exception& e) { handle(e); }" },
        { term: "operator[] vs at()", desc: "Unchecked (UB) vs bounds-checked (throws)", code: "v[10];      // UB if out of range\nv.at(10);   // throws std::out_of_range" },
      ],
    },
    {
      title: "Concurrency & UB",
      color: "rose",
      rows: [
        { term: "std::thread", desc: "OS-level parallelism", code: "std::thread t([]{ work(); });\nt.join();" },
        { term: "mutex + condition_variable", desc: "Classic producer-consumer synchronization", code: "std::unique_lock<std::mutex> lock(m);\ncv.wait(lock, [] { return ready; });" },
        { term: "std::atomic", desc: "Lock-free updates with explicit memory ordering", code: "std::atomic<int> counter{0};\ncounter.fetch_add(1, std::memory_order_relaxed);" },
        { term: "Undefined behavior", desc: "Compiler may do ANYTHING — not a guaranteed crash", code: "int arr[5];\narr[10];  // UB: out-of-bounds, not caught" },
        { term: "Virtual destructor", desc: "Required on any polymorphic base class", code: "class Shape {\npublic:\n  virtual ~Shape() = default;\n};" },
        { term: "Signed/unsigned comparison", desc: "Negative int silently becomes huge when compared unsigned", code: "int i = -1;\nsize_t s = 5;\ni < s;  // true?! i converts to huge unsigned" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Compile with warnings", desc: "Non-negotiable — catches real bugs before runtime", code: "g++ -std=c++20 -O2 -Wall -Wextra main.cpp -o app" },
        { term: "CMake basics", desc: "The de facto standard cross-platform build system", code: "cmake -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build -j$(nproc)" },
        { term: "AddressSanitizer", desc: "Catches memory errors at the exact faulting line", code: "g++ -fsanitize=address -g main.cpp -o app" },
        { term: "UndefinedBehaviorSanitizer", desc: "Catches UB the type system can't rule out", code: "g++ -fsanitize=undefined -g main.cpp -o app" },
        { term: "Testing (GoogleTest)", desc: "The dominant production test framework", code: "TEST(DiscountTest, Basic) {\n  EXPECT_DOUBLE_EQ(applyDiscount(100, 10), 90);\n}" },
        { term: "Debugging (gdb)", desc: "Set breakpoints, inspect state, step through", code: "g++ -g -O0 main.cpp -o app\ngdb ./app" },
        { term: "Profiling", desc: "Measure before optimizing, always on release builds", code: "perf record -g ./app\nperf report" },
      ],
    },
  ],
};

export default cpp;
