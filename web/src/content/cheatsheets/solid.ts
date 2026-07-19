import type { CheatSheetData } from "./types";

const solid: CheatSheetData = {
  title: "The Ultimate SOLID Principles Cheat Sheet",
  subtitle: "Single Responsibility · Open/Closed · Liskov · Interface Segregation · Dependency Inversion",
  sections: [
    {
      title: "S — Single Responsibility",
      color: "violet",
      rows: [
        { term: "One reason to change", desc: "Real test: MULTIPLE independent stakeholders/reasons -> split", code: "// WRONG: ReportManager formats AND sends email\n// RIGHT: ReportGenerator + EmailSender" },
        { term: "Don't over-split cohesive logic", desc: "5 tiny classes that always change together = wasted ceremony", code: "// SRP is about INDEPENDENT reasons, not minimizing method count" },
      ],
    },
    {
      title: "O — Open/Closed",
      color: "blue",
      rows: [
        { term: "Extend via NEW code, not modification", desc: "Adding a variant shouldn't touch existing, tested code", code: "class VIPDiscount(DiscountStrategy):   # ADD -- touch nothing else\n    def calculate(self, amt): return amt * 0.15" },
        { term: "Achieved via", desc: "Polymorphism + dependency injection of concrete implementations", code: "" },
      ],
    },
    {
      title: "L — Liskov Substitution",
      color: "emerald",
      rows: [
        { term: "Subtypes must be SAFELY substitutable", desc: "Not just conceptually 'is-a' -- behavioral contract must hold", code: "// Classic trap: Square(Rectangle) -- linked setters break callers" },
        { term: "Check beyond method signatures", desc: "Preconditions (no strengthening), postconditions/invariants (no weakening), exceptions", code: "// A subclass raising a DIFFERENT exception type violates LSP too" },
      ],
    },
    {
      title: "I — Interface Segregation",
      color: "amber",
      rows: [
        { term: "Don't force irrelevant methods", desc: "Bloated 'kitchen sink' interfaces hurt every implementer", code: "// WRONG: Worker{work(), eat()} -- RobotWorker.eat() = forced no-op" },
        { term: "Fix: role-based interfaces", desc: "Split into cohesive, focused contracts", code: "class Workable: def work()...\nclass Eatable: def eat()..." },
      ],
    },
    {
      title: "D — Dependency Inversion",
      color: "rose",
      rows: [
        { term: "Depend on ABSTRACTIONS, not concretions", desc: "Both high-level AND low-level code depend on the SAME interface", code: "class Notifier: def send(to, msg): raise NotImplementedError" },
        { term: "Inject, don't construct internally", desc: "This is THE mechanism that enables fast, isolated unit tests", code: "def __init__(self, notifier: Notifier):   # injected, swappable\n    self.notifier = notifier" },
        { term: "Architectural scale", desc: "Hexagonal/clean architecture -- business logic depends on NOTHING external", code: "" },
      ],
    },
    {
      title: "Judgment: Don't Over-Apply",
      color: "cyan",
      rows: [
        { term: "THE #1 anti-pattern", desc: "An interface with only ONE implementation ever, 'just in case'", code: "// Adds indirection with zero realized benefit" },
        { term: "Apply where GENUINE complexity warrants it", desc: "Not as a universal checklist to maximize", code: "" },
        { term: "Design pattern connections", desc: "Strategy = OCP. Factory/Repository = DIP. Decorator = OCP.", code: "// See the Design Patterns skill" },
      ],
    },
  ],
};

export default solid;
