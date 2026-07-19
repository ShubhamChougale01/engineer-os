import type { CheatSheetData } from "./types";

const go: CheatSheetData = {
  title: "The Ultimate Go Cheat Sheet",
  subtitle: "Core language · concurrency · error handling · production toolbelt",
  sections: [
    {
      title: "Language Core",
      color: "violet",
      rows: [
        { term: "var / :=", desc: "Explicit declaration vs inferred, function-local only", code: "var age int = 36\nname := 'Ada'  // type inference" },
        { term: "Constants", desc: "Compile-time values", code: "const MaxRetries = 3\nconst Pi = 3.14159" },
        { term: "Basic types", desc: "The primitives you'll use daily", code: "string, int, int64, float64, bool\nbyte (alias uint8), rune (alias int32)" },
        { term: "Zero values", desc: "Every type has a default — no 'undefined'", code: "var n int      // 0\nvar s string   // ''\nvar p *int     // nil" },
        { term: "if / for", desc: "The only conditional and only loop keyword", code: "if x > 0 { ... } else { ... }\nfor i := 0; i < 3; i++ { ... }\nfor { ... }  // infinite loop" },
        { term: "Multiple return values", desc: "The idiomatic (result, error) pattern", code: "func divide(a, b float64) (float64, error) {\n  if b == 0 { return 0, errors.New('div by zero') }\n  return a / b, nil\n}" },
        { term: "Named returns", desc: "Pre-declared return variables (use sparingly)", code: "func split(sum int) (x, y int) {\n  x = sum * 4 / 9\n  y = sum - x\n  return\n}" },
        { term: "Variadic functions", desc: "Accept any number of arguments", code: "func sum(nums ...int) int {\n  total := 0\n  for _, n := range nums { total += n }\n  return total\n}" },
      ],
    },
    {
      title: "Collections",
      color: "blue",
      rows: [
        { term: "Slice", desc: "Dynamic-length view over an array", code: "xs := []int{1, 2, 3}\nxs = append(xs, 4)\nxs[1:3]  len(xs)  cap(xs)" },
        { term: "Array", desc: "Fixed-length, rarely used directly", code: "var a [5]int\nb := [3]string{'a', 'b', 'c'}" },
        { term: "Map", desc: "Hash table, unordered", code: "m := map[string]int{'a': 1}\nm['b'] = 2\nv, ok := m['c']  // comma-ok\ndelete(m, 'a')" },
        { term: "make", desc: "Allocate slices, maps, channels with capacity", code: "make([]int, 0, 10)   // len 0, cap 10\nmake(map[string]int)\nmake(chan int, 5)" },
        { term: "Range", desc: "Iterate slices, maps, channels, strings", code: "for i, v := range xs { ... }\nfor k, v := range m { ... }\nfor v := range ch { ... }" },
        { term: "Struct", desc: "The core composite type", code: "type Point struct { X, Y float64 }\np := Point{X: 1, Y: 2}" },
        { term: "Embedding", desc: "Composition over inheritance", code: "type Base struct { ID int }\ntype User struct {\n  Base       // embedded\n  Name string\n}" },
        { term: "Slice of structs sort", desc: "sort.Slice with a comparator", code: "sort.Slice(users, func(i, j int) bool {\n  return users[i].Age < users[j].Age\n})" },
      ],
    },
    {
      title: "Interfaces & Methods",
      color: "emerald",
      rows: [
        { term: "Interface definition", desc: "A set of method signatures", code: "type Shape interface {\n  Area() float64\n}" },
        { term: "Implicit satisfaction", desc: "No 'implements' keyword needed", code: "type Circle struct{ R float64 }\nfunc (c Circle) Area() float64 {\n  return math.Pi * c.R * c.R\n}" },
        { term: "Value vs pointer receiver", desc: "Copy vs mutate the original", code: "func (p Point) Read() {}       // copy\nfunc (p *Point) Scale(f float64) { p.X *= f }" },
        { term: "Empty interface / any", desc: "Holds a value of any type", code: "var x any = 42\nif n, ok := x.(int); ok { ... }  // type assertion" },
        { term: "Type switch", desc: "Branch on the dynamic type", code: "switch v := x.(type) {\ncase int: ...\ncase string: ...\ndefault: ...\n}" },
        { term: "Stringer interface", desc: "Custom String() controls fmt output", code: "func (p Point) String() string {\n  return fmt.Sprintf('(%v, %v)', p.X, p.Y)\n}" },
        { term: "Generics", desc: "Type parameters with interface constraints", code: "func Sum[T int | float64](xs []T) T {\n  var total T\n  for _, x := range xs { total += x }\n  return total\n}" },
      ],
    },
    {
      title: "Errors & Control Flow",
      color: "amber",
      rows: [
        { term: "Check every error", desc: "The single most common Go pattern", code: "result, err := doThing()\nif err != nil {\n  return err\n}" },
        { term: "Wrap with context", desc: "%w preserves the original error", code: "if err != nil {\n  return fmt.Errorf('loading config: %w', err)\n}" },
        { term: "errors.Is / errors.As", desc: "Inspect a wrapped error chain", code: "if errors.Is(err, os.ErrNotExist) { ... }\nvar pe *fs.PathError\nif errors.As(err, &pe) { ... }" },
        { term: "Custom error type", desc: "Domain-specific errors", code: "type NotFoundError struct{ ID string }\nfunc (e *NotFoundError) Error() string {\n  return 'not found: ' + e.ID\n}" },
        { term: "defer", desc: "Runs when the FUNCTION returns", code: "f, _ := os.Open('x.txt')\ndefer f.Close()" },
        { term: "panic / recover", desc: "For truly unexpected situations only", code: "defer func() {\n  if r := recover(); r != nil { log.Println(r) }\n}()" },
      ],
    },
    {
      title: "Concurrency",
      color: "rose",
      rows: [
        { term: "Goroutine", desc: "Lightweight concurrent function call", code: "go doWork()\ngo func(x int) { fmt.Println(x) }(42)" },
        { term: "Unbuffered channel", desc: "Synchronous handoff — send blocks until received", code: "ch := make(chan int)\ngo func() { ch <- 42 }()\nv := <-ch" },
        { term: "Buffered channel", desc: "Send blocks only once the buffer is full", code: "ch := make(chan int, 10)" },
        { term: "close + range", desc: "Signal completion; range exits once drained", code: "close(ch)\nfor v := range ch { ... }" },
        { term: "select", desc: "Wait on multiple channel ops at once", code: "select {\ncase v := <-ch1:\ncase <-time.After(time.Second):\n}" },
        { term: "sync.WaitGroup", desc: "Wait for a fixed set of goroutines", code: "var wg sync.WaitGroup\nwg.Add(1)\ngo func() { defer wg.Done(); work() }()\nwg.Wait()" },
        { term: "sync.Mutex", desc: "Protect shared state directly", code: "var mu sync.Mutex\nmu.Lock()\ndefer mu.Unlock()" },
        { term: "context.Context", desc: "Cancellation and deadlines through a call chain", code: "ctx, cancel := context.WithTimeout(ctx, 2*time.Second)\ndefer cancel()" },
        { term: "Semaphore via channel", desc: "Bound concurrency to N at once", code: "sem := make(chan struct{}, 10)\nsem <- struct{}{}       // acquire\ndefer func() { <-sem }() // release" },
        { term: "Race detector", desc: "Catch unsynchronized shared access", code: "go test -race ./...\ngo run -race main.go" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Modules", desc: "Dependency management", code: "go mod init github.com/you/app\ngo get pkg@latest\ngo mod tidy" },
        { term: "Build & run", desc: "Compile once, run anywhere (same OS/arch)", code: "go run main.go\ngo build -o app ./cmd/app\nGOOS=linux GOARCH=arm64 go build" },
        { term: "Static binary", desc: "No libc dependency — scratch Docker images", code: "CGO_ENABLED=0 go build -o app" },
        { term: "Testing", desc: "Table-driven, stdlib only", code: "func TestAdd(t *testing.T) {\n  if Add(2, 2) != 4 { t.Fatal('wrong') }\n}\ngo test -race -cover ./..." },
        { term: "Vet & lint", desc: "Static analysis beyond the compiler", code: "go vet ./...\ngolangci-lint run" },
        { term: "Structured logging", desc: "Standard library since Go 1.21", code: "logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))\nlogger.Info('order_placed', 'id', orderID)" },
        { term: "Profiling", desc: "CPU and memory profiles, production-safe", code: "import _ 'net/http/pprof'\ngo tool pprof http://host/debug/pprof/profile" },
        { term: "Graceful shutdown", desc: "Drain on SIGTERM", code: "srv.Shutdown(ctx) // stops accepting, waits for in-flight requests" },
      ],
    },
  ],
};

export default go;
