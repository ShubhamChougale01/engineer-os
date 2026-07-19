import type { CheatSheetData } from "./types";

const designPatterns: CheatSheetData = {
  title: "The Ultimate Design Patterns Cheat Sheet",
  subtitle: "Creational, structural, behavioral · distinguishing similar patterns · SOLID connections",
  sections: [
    {
      title: "Creational (Object Construction)",
      color: "violet",
      rows: [
        { term: "Factory Method", desc: "ONE product type -- decouples client from concrete construction", code: "def animal_factory(t): return Dog() if t == 'dog' else Cat()" },
        { term: "Abstract Factory", desc: "A mutually-CONSISTENT family of related products", code: "// e.g. all UI elements matching the SAME theme, guaranteed" },
        { term: "Builder", desc: "Complex object, many optional steps, method chaining", code: "PizzaBuilder().set_size('L').add_topping('cheese').build()" },
        { term: "Singleton", desc: "Exactly ONE global instance -- USE SPARINGLY", code: "// Hidden global state hurts testing -- prefer dependency injection" },
      ],
    },
    {
      title: "Structural (Composing Objects)",
      color: "blue",
      rows: [
        { term: "Adapter", desc: "Makes an INCOMPATIBLE existing interface work as expected", code: "class PrinterAdapter(ModernInterface): ..." },
        { term: "Decorator", desc: "ADDS behavior by wrapping -- avoids combinatorial class explosion", code: "BoldDecorator(ItalicDecorator(Text('Hi'))).render()" },
        { term: "Facade", desc: "Hides MULTIPLE classes behind ONE simple interface", code: "computer.start_computer()   # hides CPU + Memory coordination" },
        { term: "Proxy", desc: "CONTROLS/mediates access (lazy load, auth check, remote call)", code: "// Different intent than Decorator despite similar wrapping" },
      ],
    },
    {
      title: "Behavioral (Communication)",
      color: "emerald",
      rows: [
        { term: "Strategy", desc: "CLIENT chooses the active algorithm/behavior, swappable", code: "class Checkout:\n    def __init__(self, strategy): self.strategy = strategy" },
        { term: "State", desc: "The OBJECT ITSELF transitions between behaviors internally", code: "// Structurally like Strategy, but who decides differs" },
        { term: "Observer", desc: "ONE-to-MANY, decoupled notification on state change", code: "subject.subscribe(observer); subject.notify(event)" },
        { term: "Command", desc: "Encapsulates a REQUEST as an object -> enables undo/queue/log", code: "class Command:\n    def execute(self): ...\n    def undo(self): ..." },
      ],
    },
    {
      title: "Distinguishing Similar-Looking Patterns",
      color: "amber",
      rows: [
        { term: "Strategy vs State", desc: "WHO decides? Client (Strategy) vs the object itself (State)", code: "" },
        { term: "Factory Method vs Abstract Factory", desc: "ONE product vs a mutually-consistent FAMILY", code: "" },
        { term: "Decorator vs Proxy", desc: "ADDS new behavior vs CONTROLS access to existing behavior", code: "" },
        { term: "Facade vs Adapter", desc: "Simplifies a COMPLEX subsystem vs fixes an INCOMPATIBLE interface", code: "" },
      ],
    },
    {
      title: "Direct SOLID Connections",
      color: "rose",
      rows: [
        { term: "Strategy = OCP", desc: "New behavior via a new class, ZERO modification to existing code", code: "" },
        { term: "Decorator = OCP", desc: "Add behavior by wrapping, never by modifying the original class", code: "" },
        { term: "Factory / Adapter = DIP", desc: "Client depends on an ABSTRACTION, not a concrete detail", code: "" },
      ],
    },
    {
      title: "Judgment: Avoid \"Pattern Fever\"",
      color: "cyan",
      rows: [
        { term: "THE #1 anti-pattern", desc: "A Strategy/Factory with only ONE implementation, ever", code: "// A plain function is often genuinely simpler and equally clear" },
        { term: "First-class functions can replace patterns", desc: "Strategy/Command often simpler as a passed function (Python/JS)", code: "def checkout(pay_fn, amount): return pay_fn(amount)" },
        { term: "Apply where variation GENUINELY exists", desc: "Patterns manage real complexity -- not a checklist to maximize", code: "" },
      ],
    },
  ],
};

export default designPatterns;
