import type { CheatSheetData } from "./types";

const rust: CheatSheetData = {
  title: "The Ultimate Rust Cheat Sheet",
  subtitle: "Ownership · borrowing · traits · concurrency · production toolbelt",
  sections: [
    {
      title: "Ownership & Borrowing",
      color: "violet",
      rows: [
        { term: "Immutable by default", desc: "let is immutable; opt into mutation explicitly", code: "let x = 5;\nlet mut y = 10;\ny += 1;" },
        { term: "Move", desc: "Assigning a heap type transfers ownership", code: "let s1 = String::from('hi');\nlet s2 = s1;  // s1 is now invalid" },
        { term: "Copy types", desc: "Stack-only primitives duplicate instead of moving", code: "let a = 5;\nlet b = a;  // both valid — i32 implements Copy" },
        { term: "Immutable borrow (&T)", desc: "Read access, original stays valid", code: "fn len(s: &String) -> usize { s.len() }" },
        { term: "Mutable borrow (&mut T)", desc: "Exclusive write access", code: "fn push(s: &mut String) { s.push('!'); }" },
        { term: "The aliasing rule", desc: "One mutable XOR many immutable refs, never both", code: "// compile error: cannot borrow as mutable\n// while also borrowed as immutable" },
        { term: "clone() as an escape hatch", desc: "Legitimate when a real copy is needed — not a reflex", code: "let owned = borrowed.clone();" },
        { term: "Lifetimes", desc: "Express how long a borrowed reference is valid", code: "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n  if x.len() > y.len() { x } else { y }\n}" },
      ],
    },
    {
      title: "Types & Pattern Matching",
      color: "blue",
      rows: [
        { term: "Struct", desc: "The core composite type", code: "struct Point { x: f64, y: f64 }\nlet p = Point { x: 1.0, y: 2.0 };" },
        { term: "Enum with data", desc: "Each variant can carry different data", code: "enum Status {\n  Pending,\n  Active(u32),\n  Done { reason: String },\n}" },
        { term: "match (exhaustive)", desc: "Compiler REQUIRES every case handled", code: "match status {\n  Status::Pending => 'waiting',\n  Status::Active(n) => 'running',\n  Status::Done { reason } => 'finished',\n}" },
        { term: "Option<T>", desc: "No null — absence is explicit", code: "fn find(id: u32) -> Option<User> { ... }\nmatch opt { Some(v) => use_it(v), None => default() }" },
        { term: "Result<T, E>", desc: "Fallibility is explicit, not exceptions", code: "fn parse(s: &str) -> Result<u32, String> { ... }" },
        { term: "? operator", desc: "Propagate Err early, unwrap Ok otherwise", code: "let n = fallible_call()?;" },
        { term: "if let / while let", desc: "Match just one pattern concisely", code: "if let Some(x) = opt { use_x(x); }" },
        { term: "unwrap_or / map_err", desc: "Fallbacks and error transformation without match", code: "opt.unwrap_or(0)\nresult.map_err(|e| format!('failed: {}', e))" },
      ],
    },
    {
      title: "Traits & Generics",
      color: "emerald",
      rows: [
        { term: "Trait definition", desc: "Shared behavior contract", code: "trait Shape {\n  fn area(&self) -> f64;\n}" },
        { term: "impl Trait for Type", desc: "Explicit implementation, unlike Go's implicit interfaces", code: "impl Shape for Circle {\n  fn area(&self) -> f64 { 3.14159 * self.r * self.r }\n}" },
        { term: "Generic function", desc: "One function, many types", code: "fn largest<T: PartialOrd>(xs: &[T]) -> &T { ... }" },
        { term: "impl Trait (static dispatch)", desc: "Monomorphized — zero runtime cost", code: "fn print_area(s: &impl Shape) { ... }" },
        { term: "dyn Trait (dynamic dispatch)", desc: "vtable — needed for heterogeneous collections", code: "let shapes: Vec<Box<dyn Shape>> = vec![Box::new(c), Box::new(sq)];" },
        { term: "Derive macros", desc: "Auto-implement common traits", code: "#[derive(Debug, Clone, PartialEq)]\nstruct User { id: u32, name: String }" },
        { term: "Default method", desc: "Traits can provide a body, overridable", code: "trait Shape {\n  fn describe(&self) -> String { format!('area {}', self.area()) }\n}" },
      ],
    },
    {
      title: "Iterators & Collections",
      color: "amber",
      rows: [
        { term: "Vec", desc: "Growable array, the default sequence type", code: "let mut xs: Vec<i32> = vec![1, 2, 3];\nxs.push(4);" },
        { term: "HashMap", desc: "Hash table, unordered", code: "let mut m = std::collections::HashMap::new();\nm.insert('a', 1);\nm.entry('a').or_insert(0);" },
        { term: "map / filter / collect", desc: "Lazy, zero-cost iterator chains", code: "let evens: Vec<i32> = xs.iter().filter(|&&x| x % 2 == 0).cloned().collect();" },
        { term: "fold / sum", desc: "Reduce an iterator to one value", code: "let total: i32 = xs.iter().sum();\nlet total2 = xs.iter().fold(0, |acc, x| acc + x);" },
        { term: "Closures", desc: "Anonymous functions capturing their environment", code: "let add = |a: i32, b: i32| a + b;" },
        { term: "Slices", desc: "A borrowed VIEW into a sequence, no copy", code: "let slice: &[i32] = &v[1..3];" },
        { term: "String vs &str", desc: "Owned, heap-allocated vs borrowed string slice", code: "let owned: String = String::from('hi');\nlet borrowed: &str = &owned;" },
      ],
    },
    {
      title: "Concurrency",
      color: "rose",
      rows: [
        { term: "Threads", desc: "OS-level parallelism", code: "let handle = std::thread::spawn(|| { work() });\nhandle.join().unwrap();" },
        { term: "Arc<Mutex<T>>", desc: "The standard pattern for shared mutable state", code: "let counter = std::sync::Arc::new(std::sync::Mutex::new(0));\nlet c2 = std::sync::Arc::clone(&counter);\n*c2.lock().unwrap() += 1;" },
        { term: "Send / Sync", desc: "Compile-time thread-safety guarantees", code: "// a type NOT implementing Send simply won't compile\n// when moved into thread::spawn's closure" },
        { term: "Channels (mpsc)", desc: "Pass ownership of data between threads", code: "let (tx, rx) = std::sync::mpsc::channel();\ntx.send(42).unwrap();\nlet v = rx.recv().unwrap();" },
        { term: "async / await", desc: "Requires an executor — tokio is dominant", code: "async fn fetch() -> Result<Data, Error> {\n  client.get(url).await?.json().await\n}" },
        { term: "tokio entrypoint", desc: "The standard async runtime setup", code: "#[tokio::main]\nasync fn main() { ... }" },
        { term: "rayon parallel iterators", desc: "One-line data parallelism across cores", code: "use rayon::prelude::*;\nxs.par_iter().map(|x| expensive(x)).collect()" },
      ],
    },
    {
      title: "Smart Pointers & unsafe",
      color: "cyan",
      rows: [
        { term: "Box<T>", desc: "Heap allocation, single owner", code: "let boxed: Box<i32> = Box::new(5);" },
        { term: "Rc<T>", desc: "Reference counted, single-threaded sharing", code: "let shared = std::rc::Rc::new(data);\nlet s2 = std::rc::Rc::clone(&shared);" },
        { term: "RefCell<T>", desc: "Interior mutability, borrow-checked at RUNTIME", code: "let cell = std::cell::RefCell::new(5);\n*cell.borrow_mut() += 1;" },
        { term: "unsafe block", desc: "Unlocks 5 specific capabilities — not an off switch", code: "unsafe { *raw_ptr }" },
        { term: "Miri", desc: "Catches undefined behavior in unsafe code", code: "cargo +nightly miri run" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "violet",
      rows: [
        { term: "Cargo basics", desc: "Build, run, test — the whole toolchain", code: "cargo new app\ncargo build --release\ncargo run\ncargo test" },
        { term: "Add a dependency", desc: "Cargo.toml + Cargo.lock (commit both for binaries)", code: "cargo add tokio --features full" },
        { term: "Linting & formatting", desc: "Non-negotiable in CI", code: "cargo clippy -- -D warnings\ncargo fmt --check" },
        { term: "Testing", desc: "Built into the language, no extra framework needed", code: "#[test]\nfn it_works() { assert_eq!(2 + 2, 4); }" },
        { term: "Debugging", desc: "dbg! prints value + file/line, returns it unchanged", code: "let x = dbg!(compute());\nRUST_BACKTRACE=1 cargo run" },
        { term: "Static binary (musl)", desc: "For a truly dependency-free scratch Docker image", code: "rustup target add x86_64-unknown-linux-musl\ncargo build --release --target x86_64-unknown-linux-musl" },
        { term: "Supply-chain audit", desc: "Check dependencies against known CVEs", code: "cargo audit" },
      ],
    },
  ],
};

export default rust;
