import type { CheatSheetData } from "./types";

const oop: CheatSheetData = {
  title: "The Ultimate OOP Cheat Sheet",
  subtitle: "Four pillars · composition vs inheritance · polymorphism · common anti-patterns",
  sections: [
    {
      title: "The Four Pillars",
      color: "violet",
      rows: [
        { term: "Encapsulation", desc: "Bundle data + methods, control external access to enforce invariants", code: "self._balance += amount   # via a method, never direct external mutation" },
        { term: "Abstraction", desc: "Expose a simplified interface, hide implementation complexity", code: "class Shape(ABC):\n    @abstractmethod\n    def area(self): pass" },
        { term: "Inheritance", desc: "Share structure/behavior via a genuine IS-A relationship", code: "class Dog(Animal): ..." },
        { term: "Polymorphism", desc: "Same call, different behavior -- resolved at RUNTIME by actual type", code: "for a in [Dog(), Cat()]: a.speak()   # dynamic dispatch" },
      ],
    },
    {
      title: "Inheritance vs Composition",
      color: "blue",
      rows: [
        { term: "Inheritance = IS-A", desc: "Reserve for clear, STABLE relationships, shallow hierarchies only", code: "class Dog(Animal): ...   # a Dog IS an Animal" },
        { term: "Composition = HAS-A", desc: "The RECOMMENDED DEFAULT -- looser coupling, more flexible", code: "class Car:\n    def __init__(self):\n        self.engine = Engine()" },
        { term: "The fragile base class problem", desc: "Deep hierarchies: base class changes ripple unpredictably", code: "// A change to a widely-inherited parent can break subclasses its author doesn't know exist" },
        { term: "super() -- never forget it", desc: "Extends parent init/behavior instead of silently skipping it", code: "def __init__(self, x):\n    super().__init__()\n    self.x = x" },
      ],
    },
    {
      title: "Contracts: Interfaces & Abstract Classes",
      color: "emerald",
      rows: [
        { term: "Interface", desc: "Pure contract, NO implementation -- a class can satisfy MANY", code: "" },
        { term: "Abstract class", desc: "Contract PLUS some shared, concrete implementation -- usually single-inherit only", code: "" },
        { term: "Duck typing (Python)", desc: "If it has the right methods, it satisfies the interface -- no formal inheritance needed", code: "def make_it_quack(x): x.make_sound()   # works for ANY object with that method" },
      ],
    },
    {
      title: "Class vs Instance",
      color: "amber",
      rows: [
        { term: "Class attribute", desc: "SHARED across all instances", code: "class Employee:\n    company = \"Acme\"   # one copy, shared" },
        { term: "Instance attribute", desc: "Unique per object", code: "self.name = name   # set in __init__" },
        { term: "staticmethod vs classmethod", desc: "static: no self/cls, a grouped utility. classmethod: gets cls, common for alt constructors", code: "@classmethod\ndef from_dict(cls, d): return cls(d['name'])" },
      ],
    },
    {
      title: "Common Anti-Patterns",
      color: "rose",
      rows: [
        { term: "Deep inheritance (5+ levels)", desc: "Hard to reason about -- a leaf class requires reading many parents", code: "// Flatten via composition instead" },
        { term: "Object obsession", desc: "Wrapping simple, stateless logic in unnecessary classes", code: "def calculate_discount(price, pct): return price * (pct/100)   # just a function!" },
        { term: "Exposing raw mutable state", desc: "Defeats encapsulation -- invariants can be bypassed from anywhere", code: "// Use methods/properties, not public unprotected attributes" },
        { term: "The diamond problem", desc: "Multiple inheritance -- ambiguous method resolution when parents collide", code: "// Python: resolved via C3 linearization (MRO). Java: disallows multi-implementation inheritance." },
      ],
    },
    {
      title: "Production Application",
      color: "cyan",
      rows: [
        { term: "Repository pattern", desc: "Abstract interface + swappable concrete implementations", code: "class UserRepository(ABC): ...\nclass PostgresUserRepository(UserRepository): ..." },
        { term: "Strategy pattern", desc: "Interchangeable algorithms/behaviors behind one interface", code: "// e.g. PaymentMethod: CreditCardPayment, PayPalPayment" },
        { term: "Extensibility payoff", desc: "New types added WITHOUT modifying existing consuming code", code: "// See the SOLID Principles skill's Open/Closed Principle" },
      ],
    },
  ],
};

export default oop;
