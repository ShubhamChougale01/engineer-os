import type { SkillContent } from "../types";

/**
 * Design Patterns — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const designPatterns: SkillContent = {
  overview: `
Design patterns are proven, reusable, named solutions to recurring software design problems — a shared vocabulary that lets engineers communicate complex structural ideas ("just use a Strategy pattern here") in a few words rather than lengthy explanation, and a catalog of battle-tested approaches to problems that have already been solved well many times before. The canonical catalog, popularized by the "Gang of Four" (Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides), organizes patterns into three families: **creational** (how objects are constructed), **structural** (how objects and classes are composed into larger structures), and **behavioral** (how objects communicate and distribute responsibility).

For an AI engineer, design pattern fluency is essential for reading and contributing to virtually any substantial object-oriented codebase — the Strategy pattern underlies interchangeable ML model implementations behind a common interface, the Factory pattern underlies how frameworks construct configured objects, the Observer pattern underlies event-driven and pub/sub systems, and the Adapter pattern underlies how many libraries wrap incompatible third-party APIs into a consistent interface. Design patterns are the direct, concrete continuation of the **SOLID Principles** skill (covered immediately before this one) — many patterns are, in effect, named, proven implementations of specific SOLID principles applied to recurring problem shapes.

Key characteristics: **creational patterns** (Factory Method, Abstract Factory, Builder, Singleton, Prototype) solving object construction complexity and flexibility; **structural patterns** (Adapter, Decorator, Facade, Composite, Proxy) solving how to compose classes and objects into larger, flexible structures; **behavioral patterns** (Strategy, Observer, Command, Iterator, Template Method, State) solving how objects communicate and how responsibility is distributed among them; and a shared understanding that patterns describe a PROBLEM-SOLUTION SHAPE, not a rigid, mechanically-applied template to force onto every situation.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1977 | **Christopher Alexander**, an architect (of buildings, not software), publishes **"A Pattern Language"**, introducing the concept of a "pattern" as a named, reusable solution to a recurring design problem — originally applied to physical architecture and urban design |
| 1987 | **Kent Beck** and **Ward Cunningham** apply Alexander's pattern concept to software for the first time, presenting design patterns for Smalltalk user interfaces at an object-oriented programming conference |
| 1994 | The **"Gang of Four"** — Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides — publish **"Design Patterns: Elements of Reusable Object-Oriented Software"**, cataloging 23 patterns across creational, structural, and behavioral categories, becoming THE foundational, canonical reference for software design patterns |
| 1990s–2000s | Design patterns become a standard part of software engineering education and professional vocabulary, with the Gang of Four's 23 patterns forming the near-universal shared reference point across the industry |
| 2000s | Additional pattern catalogs emerge for specific domains: enterprise application patterns (Martin Fowler's "Patterns of Enterprise Application Architecture"), concurrency patterns, and later, cloud/microservices patterns |
| 2010s–2020s | Continued, ongoing industry discussion recognizing that some Gang of Four patterns are less relevant in languages with first-class functions/closures (which can achieve similar flexibility more simply than certain object-oriented pattern implementations), while the underlying PROBLEMS these patterns solve remain universally relevant regardless of specific implementation mechanics |

Design patterns' origin in Christopher Alexander's architectural theory — genuinely borrowed from building design, not originally a computing concept at all — is a notable, often-overlooked historical detail illustrating how a powerful organizing idea (naming and cataloging recurring solution shapes) transferred productively across an entirely different discipline.
`,

  "why-it-exists": `
Design patterns exist because, by the early 1990s, experienced object-oriented software engineers had independently, repeatedly discovered the SAME effective solutions to the SAME recurring design problems across many different projects and domains — but without a shared vocabulary or catalog, each team was essentially rediscovering these solutions from scratch, often after first encountering (and initially mishandling) the same problem the hard way.

The Gang of Four's specific insight, directly borrowed from Christopher Alexander's architectural pattern language, was that naming and cataloging these recurring solution shapes would provide two distinct, valuable benefits: first, a SHARED VOCABULARY letting engineers communicate complex design ideas efficiently ("this needs a Strategy pattern" conveys, in three words, an entire well-understood structural approach that would otherwise require paragraphs to explain from scratch); and second, a curated, battle-tested REFERENCE letting engineers facing a new instance of a known problem shape start from a proven solution rather than reinventing (and potentially re-discovering the same pitfalls of) an ad-hoc approach.

Design patterns' genuine, lasting value is this combination of shared vocabulary and proven solution catalog — they don't invent fundamentally new capabilities beyond what OOP (covered in its own skill) and SOLID principles (covered immediately before this one) already enable, but they crystallize the BEST, most commonly useful ways of applying those underlying capabilities to specific, frequently-recurring problem shapes, saving engineers from independently rediscovering solutions (and their associated pitfalls) that have already been thoroughly worked out.
`,

  "problem-it-solves": `
Design patterns solve the **"how do we communicate and apply proven, well-understood solutions to recurring object-oriented design problems, rather than every engineer independently reinventing (and potentially mishandling) the same solutions repeatedly"** problem.

Concretely, the pattern catalog provides:

- **A shared vocabulary for design communication**: naming a pattern ("use a Factory here") conveys an entire well-understood structural approach in a few words, dramatically accelerating design discussions and code reviews compared to explaining the same structure from scratch every time.
- **Proven solutions to specific, recurring problem shapes**: creational patterns for construction complexity, structural patterns for composition flexibility, behavioral patterns for communication/responsibility distribution — each addressing a genuinely common design challenge with a battle-tested approach.
- **A direct, concrete continuation of SOLID principles**: many patterns are, in effect, named implementations of specific SOLID principles (the Strategy pattern directly implementing Open/Closed, the Factory pattern directly supporting Dependency Inversion) applied to a specific recurring shape.
- **A framework for recognizing structural similarity across different domains**: once you recognize "this is fundamentally an Observer pattern problem" (something needs to be notified when another thing's state changes), you can apply the same proven structural approach whether the domain is a GUI event system, a stock price feed, or an ML training progress callback.

What design patterns do **not** solve, or solve with a real tradeoff: patterns are not a checklist to apply universally — forcing a pattern onto a problem that doesn't genuinely have that specific shape produces unnecessary complexity without benefit (a real, common anti-pattern in its own right, sometimes called "pattern fever" or over-engineering); some patterns are LESS necessary in languages with first-class functions/closures, which can achieve similar flexibility (the Strategy pattern's core benefit, for instance) more simply than a full object-oriented pattern implementation requires; and patterns describe a PROBLEM-SOLUTION SHAPE, requiring genuine engineering judgment to recognize when a specific situation actually matches that shape, not a mechanical template to apply blindly.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the three pattern families (creational, structural, behavioral) and what general class of problem each addresses.
2. Implement and correctly apply the most commonly used patterns: Factory Method, Singleton, Builder, Adapter, Decorator, Facade, Strategy, Observer, and Command.
3. Recognize which pattern (if any) genuinely fits a new design problem, rather than forcing a pattern where a simpler solution would serve better.
4. Explain the connection between specific design patterns and the SOLID principles they directly implement.
5. Recognize common design pattern anti-patterns: over-engineering, forcing patterns where unneeded, and pattern misapplication.
6. Read and reason about design patterns as they appear in real production frameworks and libraries.
7. Choose between structurally similar patterns (Strategy versus State, Factory Method versus Abstract Factory) based on their specific distinguishing characteristics.
8. Apply patterns judiciously, understanding when a pattern's structure genuinely earns its complexity versus when a simpler approach suffices.
9. Answer senior-level interview questions on pattern selection, tradeoffs, and real-world application.
`,

  prerequisites: `
- **Required**: the **OOP** skill and the **SOLID Principles** skill (both covered immediately before this one in this category) — design patterns are concrete implementations built directly on both foundations, and don't make sense without them.
- **Helpful**: exposure to at least one substantial, real-world object-oriented codebase, since pattern recognition benefits from having encountered genuine, non-trivial design problems firsthand.

Dependency links: **OOP** → **SOLID Principles** → this page, completing the natural progression from OOP fundamentals through disciplined principles to a catalog of proven, reusable solutions built directly on those principles.
`,

  "beginner-concepts": `
### The Factory Method pattern (creational)

~~~python
class Dog:
    def speak(self):
        return "Woof"

class Cat:
    def speak(self):
        return "Meow"

def animal_factory(animal_type):
    if animal_type == "dog":
        return Dog()
    elif animal_type == "cat":
        return Cat()
    raise ValueError("Unknown animal type")

pet = animal_factory("dog")
~~~

A Factory Method centralizes object construction logic in one place, letting client code request an object by a simpler description (a type name) without needing to know the specific construction details — directly supporting Dependency Inversion, since calling code depends on the factory's return type (an abstract interface both Dog and Cat satisfy) rather than constructing a specific concrete class directly.

### The Singleton pattern (creational)

~~~python
class ConfigManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._config = {}
        return cls._instance

config1 = ConfigManager()
config2 = ConfigManager()
assert config1 is config2   -- both variables reference the SAME instance
~~~

Singleton ensures a class has exactly one instance, globally accessible — genuinely useful for shared resources like configuration or connection pools, though widely recognized as easy to overuse (covered further in Anti-Patterns), since it introduces global state that can make testing and reasoning about a codebase harder.

### The Strategy pattern (behavioral)

~~~python
class PaymentStrategy:
    def pay(self, amount):
        raise NotImplementedError

class CreditCardPayment(PaymentStrategy):
    def pay(self, amount):
        return "Paid " + str(amount) + " via credit card"

class PayPalPayment(PaymentStrategy):
    def pay(self, amount):
        return "Paid " + str(amount) + " via PayPal"

class Checkout:
    def __init__(self, payment_strategy):
        self.payment_strategy = payment_strategy
    def complete(self, amount):
        return self.payment_strategy.pay(amount)
~~~

Strategy lets an algorithm (or behavior) be selected at runtime and swapped freely — this is the pattern most directly implementing the Open/Closed Principle covered in the **SOLID Principles** skill, since adding a new payment method requires writing a new class with zero modification to Checkout.

### The Adapter pattern (structural)

~~~python
class OldPrinter:
    def print_old_format(self, text):
        return "[OLD FORMAT] " + text

class ModernPrinterInterface:
    def print_document(self, text):
        raise NotImplementedError

class PrinterAdapter(ModernPrinterInterface):
    def __init__(self, old_printer):
        self.old_printer = old_printer
    def print_document(self, text):
        return self.old_printer.print_old_format(text)
~~~

Adapter wraps an existing, incompatible class (OldPrinter, with a different method name/signature) to conform to an expected interface (ModernPrinterInterface), letting genuinely incompatible code work together without modifying either the old class or the code expecting the new interface.
`,

  "intermediate-concepts": `
### The Observer pattern (behavioral)

~~~python
class Subject:
    def __init__(self):
        self._observers = []
    def subscribe(self, observer):
        self._observers.append(observer)
    def notify(self, event):
        for observer in self._observers:
            observer.update(event)

class EmailNotifier:
    def update(self, event):
        return "Emailing about: " + event

class LogRecorder:
    def update(self, event):
        return "Logging: " + event

subject = Subject()
subject.subscribe(EmailNotifier())
subject.subscribe(LogRecorder())
subject.notify("order_placed")   -- BOTH observers are notified automatically
~~~

Observer lets multiple, independent objects be notified automatically when a subject's state changes, without the subject needing to know anything specific about its observers beyond the shared update() interface — the direct foundation of event-driven systems, pub/sub messaging, and reactive UI frameworks.

### The Decorator pattern (structural)

~~~python
class Coffee:
    def cost(self):
        return 2.0
    def description(self):
        return "Coffee"

class MilkDecorator:
    def __init__(self, coffee):
        self.coffee = coffee
    def cost(self):
        return self.coffee.cost() + 0.5
    def description(self):
        return self.coffee.description() + " with milk"

order = MilkDecorator(Coffee())
print(order.description(), order.cost())   -- "Coffee with milk" 2.5
~~~

Decorator adds behavior to an object dynamically, by WRAPPING it in another object providing the same interface plus additional behavior — a direct implementation of the Open/Closed Principle, since new decorations (SugarDecorator, WhipCreamDecorator) can be added or combined without modifying the original Coffee class at all.

### The Builder pattern (creational)

~~~python
class Pizza:
    def __init__(self):
        self.toppings = []
        self.size = None

class PizzaBuilder:
    def __init__(self):
        self.pizza = Pizza()
    def set_size(self, size):
        self.pizza.size = size
        return self   -- enables method chaining
    def add_topping(self, topping):
        self.pizza.toppings.append(topping)
        return self
    def build(self):
        return self.pizza

pizza = PizzaBuilder().set_size("large").add_topping("cheese").add_topping("mushroom").build()
~~~

Builder separates the construction of a complex object (with many optional configuration steps) from its final representation, using method chaining for a readable, flexible construction process — particularly useful when an object has many optional parameters that would otherwise require an unwieldy constructor with many arguments.

### The Facade pattern (structural)

~~~python
class CPU:
    def start(self):
        return "CPU starting"

class Memory:
    def load(self):
        return "Memory loading"

class ComputerFacade:
    def __init__(self):
        self.cpu = CPU()
        self.memory = Memory()

    def start_computer(self):
        -- hides the complexity of coordinating multiple subsystems
        return self.cpu.start() + ", " + self.memory.load()

computer = ComputerFacade()
computer.start_computer()   -- one simple call, hiding significant internal complexity
~~~

Facade provides a simplified, unified interface to a complex subsystem made of many interacting classes, hiding that complexity from client code that just needs the common, high-level operation.

### The Command pattern (behavioral)

~~~python
class Command:
    def execute(self):
        raise NotImplementedError

class TurnOnLightCommand(Command):
    def __init__(self, light):
        self.light = light
    def execute(self):
        return self.light.turn_on()

class RemoteControl:
    def __init__(self):
        self.history = []
    def press_button(self, command):
        result = command.execute()
        self.history.append(command)   -- enables undo/logging/queuing
        return result
~~~

Command encapsulates a request (an action plus its parameters) as an object, letting requests be queued, logged, undone, or passed around as first-class values — directly relevant to task queues, undo systems, and job scheduling.
`,

  "advanced-concepts": `
### Distinguishing Strategy from State (structurally similar, semantically different)

~~~
Strategy: the CLIENT chooses which algorithm/behavior to use,
    and the choice typically doesn't change based on the object's
    own internal state
State: the OBJECT ITSELF transitions between different states
    (and correspondingly different behaviors) based on its own
    internal logic, often without the client being directly
    aware a transition even occurred
~~~

Both patterns look structurally nearly identical (an interface with multiple interchangeable implementations, held as a reference by a context object) — the distinguishing factor is WHO decides which implementation is active and WHY: Strategy is client-driven, explicit choice; State is object-driven, internal transition logic (a TrafficLight object transitioning itself from Red to Green to Yellow based on its own timer logic, for instance).

### Abstract Factory versus Factory Method

~~~python
# Factory Method: ONE method creating ONE type of product
class DialogFactory:
    def create_button(self):
        raise NotImplementedError

# Abstract Factory: a FAMILY of related products created together,
# ensuring they're mutually compatible (e.g., all matching one theme)
class UIFactory:
    def create_button(self):
        raise NotImplementedError
    def create_checkbox(self):
        raise NotImplementedError

class DarkThemeFactory(UIFactory):
    def create_button(self):
        return DarkButton()
    def create_checkbox(self):
        return DarkCheckbox()   -- guaranteed to match the SAME theme as the button
~~~

Abstract Factory extends Factory Method's idea to create FAMILIES of related objects together, specifically guaranteeing internal consistency (all UI elements matching the same visual theme, for instance) that creating each element via independent, unrelated factory calls couldn't guarantee.

### The Proxy pattern and its several distinct use cases

~~~python
class RealImage:
    def __init__(self, filename):
        self.filename = filename
        self._load_from_disk()   -- expensive operation
    def _load_from_disk(self):
        pass
    def display(self):
        return "Displaying " + self.filename

class LazyImageProxy:
    def __init__(self, filename):
        self.filename = filename
        self._real_image = None   -- NOT loaded yet
    def display(self):
        if self._real_image is None:
            self._real_image = RealImage(self.filename)   -- loaded ONLY when actually needed
        return self._real_image.display()
~~~

Proxy provides a stand-in for another object, controlling access to it — common variants include a LAZY proxy (deferring expensive construction until genuinely needed, shown above), a PROTECTION proxy (adding authorization checks before delegating), and a REMOTE proxy (representing an object that actually lives on a different machine/process, hiding the network communication details).

### Recognizing pattern over-application ("pattern fever")

~~~
Signs of forcing a pattern where it isn't genuinely warranted:
├── A Factory for a class that's constructed in exactly ONE way,
│    with no genuine variation ever needed
├── A Strategy pattern with only ONE implementation, ever
├── An Observer pattern for a single, direct, one-to-one
│    relationship that a simple method call would serve just as well
└── Deep layers of Decorators adding negligible individual behavior,
     where a single combined class would be simpler to understand
~~~

A senior engineer applies patterns specifically where their GENUINE benefit (flexibility for real anticipated variation, decoupling for real testing/extension needs) outweighs their added structural complexity — patterns are a tool for managing genuine complexity, not a checklist to demonstrate sophistication.

### Patterns in languages with first-class functions

~~~python
# Instead of a full Strategy pattern with classes, a language with
# first-class functions can often achieve the SAME flexibility
# more simply, by just passing a function directly
def pay_with_credit_card(amount):
    return "Paid " + str(amount) + " via credit card"

def checkout(payment_function, amount):
    return payment_function(amount)

checkout(pay_with_credit_card, 100)   -- no Strategy classes needed at all
~~~

In languages supporting first-class functions (Python, JavaScript, and many others), some Gang of Four patterns (Strategy and Command, particularly) can often be achieved more simply by passing functions directly rather than constructing a full class hierarchy — recognizing when a language feature already provides a pattern's core benefit more simply is itself a valuable, senior-level judgment.
`,

  "internal-working": `
What happens internally when the Observer pattern's notification mechanism executes, tracing the decoupled subject-observer relationship:

~~~mermaid
sequenceDiagram
    participant Client as Client code
    participant Subject as Subject (e.g., an Order)
    participant ObserverA as EmailNotifier (observer)
    participant ObserverB as LogRecorder (observer)

    Client->>Subject: subject.subscribe(ObserverA)
    Client->>Subject: subject.subscribe(ObserverB)
    Client->>Subject: subject.notify("order_placed")
    loop For each subscribed observer
        Subject->>ObserverA: observer.update("order_placed")
        ObserverA-->>Subject: (handles its own concern independently)
        Subject->>ObserverB: observer.update("order_placed")
        ObserverB-->>Subject: (handles its own concern independently)
    end
~~~

1. **The subject maintains a list of observers**, added via subscribe(), without knowing anything specific about what each observer actually does beyond a shared update() interface.
2. **When a notable event occurs, the subject calls notify()**, which iterates through every subscribed observer and calls update() on each — the subject remains completely decoupled from any specific observer's actual behavior.
3. **Each observer independently handles the notification** according to its own logic (sending an email, writing a log entry), with NO coordination or awareness between different observers required.

**Why this matters**: this decoupling is precisely what lets NEW observers be added later (a future SMSNotifier) without modifying the Subject class at all — directly connecting to the Open/Closed Principle covered in the **SOLID Principles** skill, and illustrating exactly how a specific named pattern operationalizes a general principle into a concrete, reusable structure.
`,

  architecture: `
A senior engineer thinks about design pattern application across several dimensions: recognizing which pattern (if any) genuinely fits a new problem's shape, distinguishing structurally similar patterns by their semantic intent, and resisting the temptation to apply patterns where they add complexity without genuine benefit.

### The pattern-recognition decision framework

~~~mermaid
flowchart TB
    Q1{"What kind of problem\nam I facing?"}
    Q1 -->|"Object construction is\ncomplex or needs flexibility"| Creational["Consider a CREATIONAL pattern\n(Factory, Builder, Singleton)"]
    Q1 -->|"Need to compose objects/classes\ninto a larger, flexible structure"| Structural["Consider a STRUCTURAL pattern\n(Adapter, Decorator, Facade)"]
    Q1 -->|"Need to manage how objects\ncommunicate or distribute\nresponsibility"| Behavioral["Consider a BEHAVIORAL pattern\n(Strategy, Observer, Command)"]
~~~

This top-level classification (creational, structural, behavioral) is the first, most valuable filter for narrowing down which specific pattern might apply, before drilling into the more granular distinctions between structurally similar patterns.

### Distinguishing structurally similar patterns by semantic intent

~~~
Strategy vs State: WHO decides the active behavior (client vs
    the object itself), and WHY (explicit choice vs internal
    transition logic)?
Factory Method vs Abstract Factory: ONE product type, or a
    FAMILY of related products needing mutual consistency?
Decorator vs Proxy: adding NEW behavior (Decorator), or
    controlling/mediating ACCESS to existing behavior (Proxy)?
Facade vs Adapter: simplifying a COMPLEX subsystem's interface
    (Facade), or making an INCOMPATIBLE interface work with
    what's expected (Adapter)?
~~~

Many patterns look structurally similar at a surface level (an interface with a context class holding a reference to it) — the genuine distinguishing factor is almost always the SEMANTIC INTENT (what problem is this actually solving, and why), not the surface-level class structure.

### The genuine-benefit-versus-complexity judgment

~~~mermaid
flowchart LR
    NewProblem["A new design problem"] --> Genuine{"Is there GENUINE,\nanticipated variation or\ncomplexity this pattern\nwould actually manage?"}
    Genuine -->|Yes| ApplyPattern["Apply the matching pattern"]
    Genuine -->|No, this is simple\nand unlikely to vary| KeepSimple["Keep it simple --\ndon't force a pattern"]
~~~

This judgment — directly connecting to the **SOLID Principles** skill's own emphasis on avoiding over-application — is the single most valuable practical skill for design pattern application: recognizing a pattern's shape is necessary but not sufficient; the pattern's added structure must genuinely earn its complexity for the specific situation at hand.
`,

  "data-flow": `
Tracing how the Decorator pattern composes behavior at runtime, layer by layer:

~~~mermaid
sequenceDiagram
    participant Client
    participant Sugar as SugarDecorator
    participant Milk as MilkDecorator
    participant Coffee as Coffee (base)

    Client->>Sugar: order.cost()
    Sugar->>Milk: self.wrapped.cost()
    Milk->>Coffee: self.wrapped.cost()
    Coffee-->>Milk: 2.0
    Milk-->>Sugar: 2.0 + 0.5 = 2.5
    Sugar-->>Client: 2.5 + 0.25 = 2.75
~~~

The critical detail: each decorator layer calls the WRAPPED object's method first, then adds its own specific behavior/cost on top of the result — this layered, recursive delegation is precisely what lets decorators be combined in any order and any combination (milk only, sugar only, both, neither) without needing a separate class for every possible combination, a genuine combinatorial explosion problem the Decorator pattern specifically avoids.
`,

  "production-usage": `
### A production-style Strategy pattern for pluggable ML model backends

~~~python
class ModelBackend:
    def predict(self, input_data):
        raise NotImplementedError

class OpenAIBackend(ModelBackend):
    def predict(self, input_data):
        -- call the OpenAI API
        pass

class LocalModelBackend(ModelBackend):
    def predict(self, input_data):
        -- run inference on a locally-hosted model
        pass

class InferenceService:
    def __init__(self, backend: ModelBackend):
        self.backend = backend   -- swappable via dependency injection
    def run(self, input_data):
        return self.backend.predict(input_data)
~~~

This directly illustrates a genuine, common AI engineering application of Strategy plus Dependency Inversion together — InferenceService can switch between a cloud API and a locally-hosted model, or add a new backend later (a new provider's API), without any changes to InferenceService itself.

### Non-negotiables for production design pattern application

1. **Verify the pattern genuinely fits the problem's actual shape**, not just a superficial structural resemblance.
2. **Prefer the simplest pattern that solves the actual need** — don't reach for Abstract Factory when a plain Factory Method suffices, or a full class-based Strategy when a first-class function would serve equally well.
3. **Document WHY a specific pattern was chosen**, helping future maintainers understand the design rationale rather than "simplifying" it into something less flexible than the situation actually requires.
4. **Avoid Singleton for anything beyond genuinely global, shared resources**, given its well-recognized testing and global-state drawbacks.

### Common production patterns

- **Strategy** for pluggable, interchangeable business logic (payment methods, ML model backends, sorting/ranking algorithms).
- **Factory/Abstract Factory** for constructing configured objects based on environment or configuration (different implementations for testing versus production).
- **Observer** as the direct foundation of event-driven architectures, webhooks, and pub/sub messaging systems.
- **Adapter** for integrating third-party libraries or legacy systems with incompatible interfaces into a consistent application-internal interface.
`,

  "industry-examples": `
- **LangChain's chain/agent abstractions**: extensively use Strategy-pattern-style interchangeable components (different LLM providers, different retrieval strategies) behind common interfaces.
- **PyTorch's optimizer classes** (SGD, Adam, and others): a direct Strategy pattern application, letting training code swap optimization algorithms via a common interface.
- **Django's middleware system**: a direct application of the Decorator/Chain of Responsibility pattern family, letting request/response processing be composed from independent, stackable layers.
- **Most GUI frameworks' event handling systems**: a direct, large-scale application of the Observer pattern, letting UI components react to user interactions without tight coupling between the event source and every possible handler.
- **Database connection libraries wrapping multiple database drivers**: a common Adapter pattern application, presenting a consistent interface atop genuinely different underlying database client libraries.
- **Cloud SDK libraries** (boto3 for AWS, and similar): extensively use Factory patterns for constructing appropriately-configured service clients.
`,

  "best-practices": `
1. **Recognize the problem shape BEFORE reaching for a specific pattern**, using the creational/structural/behavioral classification as a first filter.
2. **Distinguish structurally similar patterns by their semantic intent**, not surface-level class structure alone.
3. **Prefer the simplest solution that genuinely fits** — a first-class function often achieves Strategy's benefit more simply than a full class hierarchy in languages that support it.
4. **Document the rationale for a chosen pattern**, helping future maintainers understand why the added structure exists.
5. **Avoid Singleton except for genuinely global, shared resources**, given its well-documented testing and global-state drawbacks.
6. **Connect patterns explicitly to the SOLID principles they implement**, deepening understanding of WHY a pattern's structure provides its specific benefit.
7. **Resist "pattern fever"** — applying a pattern because it demonstrates sophistication, rather than because the situation genuinely warrants its structure.
8. **Use Decorator for combinatorial behavior variations** rather than creating a separate class for every possible combination.
9. **Use Facade to simplify genuinely complex subsystem interactions**, not as an unnecessary extra layer atop already-simple code.
10. **Review pattern usage periodically**, recognizing when a pattern applied for anticipated future flexibility never actually needed that flexibility, and simplifying accordingly.
`,

  "anti-patterns": `
### Forcing a pattern where a simpler solution suffices

~~~python
# WRONG — a full Strategy pattern with classes for a case with
# only ONE implementation, ever, and no genuine anticipated variation
class TaxCalculationStrategy:
    def calculate(self, amount):
        raise NotImplementedError

class StandardTaxStrategy(TaxCalculationStrategy):   -- the ONLY implementation, ever
    def calculate(self, amount):
        return amount * 0.08

# RIGHT — a plain function, genuinely simpler and equally clear
def calculate_tax(amount):
    return amount * 0.08
~~~

Applying a pattern's full structural ceremony (interfaces, multiple classes) for a case with no genuine variation adds indirection and cognitive overhead without a corresponding benefit — this is "pattern fever," a real, common anti-pattern.

### Singleton overuse introducing hidden global state

~~~python
# WRONG — using Singleton for something that should genuinely be
# an explicit, injectable dependency, making testing genuinely
# harder (global state persists across tests unless carefully reset)
class DatabaseConnection:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

# RIGHT — an explicit, injected dependency, easily replaced with
# a test double, with lifecycle managed explicitly rather than
# hidden inside global class state
class Service:
    def __init__(self, db_connection):   -- injected, not a hidden Singleton
        self.db_connection = db_connection
~~~

Singleton's global, hidden state makes tests harder to isolate (state can leak between tests unless carefully reset) and makes dependencies less explicit/discoverable than proper dependency injection — many situations reaching for Singleton are better served by dependency injection instead.

### Other production-grade anti-patterns

- **Deep layers of Decorators adding negligible individual behavior**, where a single combined class would genuinely be simpler to understand and maintain.
- **Using Abstract Factory when a simple Factory Method suffices**, adding unnecessary structure for a family-consistency guarantee that isn't actually needed.
- **Not distinguishing Strategy from State correctly**, applying the wrong pattern's mental model and producing a confusing design that doesn't match the actual problem's semantics.
- **Applying patterns as a checklist to "look professional"** rather than because the specific situation's genuine complexity warrants the added structure.
`,

  performance: `
### Rule zero: design patterns are a maintainability/flexibility discipline, not a performance technique

Most design patterns introduce negligible runtime overhead in modern languages/runtimes — the concern is almost always code organization, flexibility, and maintainability, not execution speed.

### The performance hierarchy (apply in order)

1. **Don't sacrifice a genuinely beneficial pattern's clarity/flexibility for premature performance optimization**, since the actual bottleneck is rarely the small overhead of an extra abstraction layer.
2. **Consider Proxy's lazy-loading variant specifically for genuine performance benefit** — deferring expensive object construction until actually needed is one of the few patterns with a direct, intentional performance motivation.
3. **Avoid excessive Decorator layering in genuinely hot code paths** if profiling identifies meaningful overhead, though this is rarely the case in typical application code.
4. **Profile before removing pattern-based abstractions for performance reasons**, since intuition about "patterns are slow" is frequently wrong or irrelevant relative to the actual bottleneck.

### Micro-level facts worth knowing

- The Flyweight pattern (not covered in depth on this page, but part of the broader Gang of Four catalog) exists specifically to reduce memory usage by sharing common state across many similar objects, a genuine, deliberate performance-motivated pattern.
- Proxy's lazy-loading variant can provide real, measurable performance benefit by deferring expensive construction (loading a large file, establishing a network connection) until genuinely needed, rather than eagerly during initial object creation.
`,

  scalability: `
Design patterns' "scalability" concern, like SOLID's, is fundamentally about CODEBASE scalability — how well a design's flexibility holds up as a system grows in complexity and the number of variations/implementations it needs to support.

### Why patterns matter more as variation genuinely grows

~~~mermaid
flowchart LR
    FewVariations["A system with genuinely\nfew, stable variations"] --> SimpleFine["A simple, direct approach\n(conditionals, a few functions)\nremains perfectly adequate"]
    ManyVariations["A system with genuinely\nmany, growing variations"] --> PatternValue["Pattern-based flexibility\n(Strategy, Factory) becomes\ngenuinely valuable, avoiding\nan unmanageable conditional sprawl"]
~~~

The genuine value of patterns like Strategy and Factory becomes apparent specifically as the number of variations a system needs to support GROWS — a system with two payment methods might not need Strategy's full structure, but one that's grown to support fifteen, with more being added regularly, genuinely benefits from it.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A growing sprawl of conditional branches for different variants | Strategy or Factory pattern, replacing conditionals with polymorphism |
| Needing to combine many optional behaviors flexibly | Decorator pattern, avoiding a combinatorial explosion of separate classes |
| A complex subsystem becoming hard for client code to use correctly | Facade pattern, providing a simplified, unified interface |
| Many independent parts needing to react to the same event | Observer pattern, decoupling the event source from its many reactors |
`,

  security: `
### Patterns' indirect security benefits through decoupling and testability

~~~
A Strategy or Adapter pattern applied to security-sensitive
integrations (an authentication provider, a payment gateway) lets
that integration be swapped or thoroughly tested with a fake
implementation, supporting more comprehensive security testing
than tightly-coupled, hard-to-substitute code would allow.
~~~

Design patterns don't directly address security vulnerabilities, but well-applied Strategy and Adapter patterns (directly supporting Dependency Inversion) enable more thorough testing of security-critical integrations by allowing fake, adversarial-scenario-covering implementations to be substituted during testing.

### Essential design-pattern-related security practices

1. **Use Strategy/Adapter for security-critical external integrations** (authentication providers, payment gateways), enabling thorough testing with fake implementations covering edge/adversarial cases.
2. **Be cautious with Singleton for anything holding security-sensitive state** (session data, credentials), given its global-state visibility and testing challenges.
3. **Apply Proxy's protection variant deliberately** when access control needs to be enforced consistently before delegating to a sensitive underlying object.

See the **OWASP Top 10** and **Secrets Management** skills for the broader security context this connects to.
`,

  testing: `
### Testing a Strategy pattern implementation

~~~python
def test_checkout_uses_the_injected_payment_strategy():
    fake_strategy = FakePaymentStrategy()
    checkout = Checkout(fake_strategy)
    checkout.complete(100)
    assert fake_strategy.was_called_with(100)

def test_all_payment_strategies_honor_the_shared_contract():
    for strategy_class in [CreditCardPayment, PayPalPayment]:
        strategy = strategy_class()
        result = strategy.pay(50)
        assert isinstance(result, str)   -- verify the CONTRACT is honored consistently
~~~

### Testing an Observer pattern implementation

~~~python
def test_subject_notifies_all_subscribed_observers():
    subject = Subject()
    observer_a, observer_b = FakeObserver(), FakeObserver()
    subject.subscribe(observer_a)
    subject.subscribe(observer_b)
    subject.notify("test_event")
    assert observer_a.received_events == ["test_event"]
    assert observer_b.received_events == ["test_event"]
~~~

### The senior testing doctrine

- Test through the pattern's public interface (the Strategy's pay() method, the Subject's notify() mechanism), not internal implementation details.
- Verify every concrete implementation of a shared interface (every Strategy, every Observer) honors the expected contract consistently.
- Use fake implementations injected via Strategy/Adapter patterns to test high-level logic in isolation from real external dependencies.
- Test that new pattern implementations (a new Strategy, a new Decorator) integrate correctly without requiring changes to existing code.
`,

  debugging: `
### The toolbox, in escalation order

1. **Identify which pattern (if any) a piece of confusing code is actually implementing**, since recognizing "this is a Decorator chain" or "this is an Observer relationship" immediately clarifies how to reason about its behavior.
2. **Trace through a Decorator chain's layered calls explicitly** if behavior seems wrong, since each layer's contribution can be individually verified.
3. **Check Observer subscription/unsubscription logic** if notifications seem to be missing or duplicated, a common source of Observer-pattern-specific bugs (forgetting to unsubscribe, causing duplicate or stale notifications).
4. **Verify Factory/Builder logic produces the expected fully-configured object**, particularly checking for missing required configuration steps in a Builder chain.

### Debugging common design-pattern-specific symptoms

- "An Observer is receiving notifications after it should have been removed" — check for a missing unsubscribe() call, a common Observer pattern bug.
- "A Decorator chain produces an unexpected result" — trace through each layer individually, verifying each decorator's specific contribution to the final result.
- "A Singleton behaves differently in tests than expected" — check for global state leaking between tests, since Singleton's shared instance can retain state across supposedly-independent test cases unless explicitly reset.
- "The wrong Strategy implementation seems to be active" — verify which concrete strategy was actually injected/configured, rather than assuming based on the code's apparent intent.
`,

  monitoring: `
### Key signals to track

- **Number of Observer subscriptions over time**, for systems with dynamic subscription/unsubscription, catching potential subscription leaks (observers that should have unsubscribed but didn't).
- **Which Strategy/implementation is actively selected**, useful for systems with runtime-configurable behavior, to confirm the intended configuration is actually in effect.

### Tools

Standard application logging/instrumentation for tracking which concrete pattern implementations are active in a given deployment; code review tools/static analysis for identifying pattern usage and potential over-application (interfaces with only one implementation, for instance).

### Alerting priorities

For most design-pattern-related concerns, "monitoring" is less about runtime alerting and more about ONGOING CODE REVIEW discipline, catching pattern over-application or misapplication during design and review rather than through runtime metrics.
`,

  deployment: `
### Patterns supporting environment-specific configuration

~~~python
# A Factory pattern selecting the appropriate concrete implementation
# based on the deployment environment
def create_notifier(environment):
    if environment == "production":
        return RealEmailNotifier()
    return FakeEmailNotifier()   -- for testing/development environments
~~~

Factory patterns are commonly used specifically to select environment-appropriate concrete implementations (a real payment gateway in production, a sandbox/fake one in testing) based on configuration, a genuinely common, valuable production deployment pattern.

### CI/CD pipeline considerations

Testing that all concrete implementations of a shared interface (every Strategy, every Adapter) are exercised in CI, verifying each correctly honors the expected contract. See the **CI/CD** skill for the general pipeline depth this builds on.
`,

  "production-checklist": `
Before design-pattern-heavy production code ships:

- [ ] The chosen pattern genuinely fits the problem's actual shape, verified against its specific semantic intent (not just superficial structural resemblance)
- [ ] The simplest solution that genuinely solves the need was chosen (a function instead of a full Strategy class hierarchy, where the language supports it)
- [ ] Singleton usage limited to genuinely global, shared resources, with explicit awareness of its testing/global-state tradeoffs
- [ ] Pattern choice documented with rationale, helping future maintainers understand the design's intent
- [ ] Every concrete implementation of a shared interface tested consistently against the expected contract
- [ ] Decorator chains kept to a reasonable depth, avoiding negligible-benefit layering
- [ ] Observer subscription/unsubscription lifecycle managed correctly, avoiding subscription leaks
- [ ] No patterns applied purely to "look sophisticated" without genuine anticipated complexity/variation justifying them
`,

  "common-mistakes": `
1. **Forcing a pattern where a simpler solution (a plain function, a simple conditional) would serve better** — "pattern fever."
2. **Overusing Singleton**, introducing hidden global state that complicates testing and reasoning about the codebase.
3. **Confusing structurally similar patterns** (Strategy versus State, Factory Method versus Abstract Factory) by their surface structure rather than semantic intent.
4. **Applying Abstract Factory when a simple Factory Method suffices**, adding unnecessary complexity for an unneeded family-consistency guarantee.
5. **Creating excessively deep Decorator chains** with negligible individual behavior, where a combined class would be simpler.
6. **Not documenting WHY a specific pattern was chosen**, leaving future maintainers to guess at the design rationale.
7. **Forgetting Observer unsubscription**, causing subscription leaks or stale notifications.
8. **Applying patterns as a checklist to demonstrate sophistication** rather than because the situation genuinely warrants the added structure.
9. **Not connecting patterns to the SOLID principles they implement**, missing the deeper understanding of WHY a pattern provides its specific benefit.
10. **Not recognizing when a language's first-class functions already provide a pattern's core benefit** more simply than a full class-based implementation.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Observer receives notifications after removal | Missing or incorrect unsubscribe() call | Verify unsubscription logic explicitly, particularly around object lifecycle/cleanup |
| Singleton behaves inconsistently across tests | Global state persisting between supposedly-independent test cases | Explicitly reset Singleton state between tests, or replace with proper dependency injection |
| Decorator chain produces unexpected result | Incorrect layering order, or a specific decorator's logic error | Trace through each layer individually to isolate which one produces the unexpected contribution |
| Factory returns the wrong concrete type | Incorrect configuration/type parameter passed to the factory | Verify the factory's input parameter and its mapping to concrete types |
| Builder produces an incompletely-configured object | A required configuration step was skipped in the builder chain | Verify all required steps are called before build(), or add validation within build() itself |
| Strategy pattern uses the wrong implementation | Incorrect dependency injection configuration | Verify which concrete strategy was actually injected at construction time |
`,

  faqs: `
**What are the three families of design patterns?**
Creational (object construction: Factory, Builder, Singleton), structural (composing objects/classes into larger structures: Adapter, Decorator, Facade), and behavioral (communication and responsibility distribution between objects: Strategy, Observer, Command).

**Should I always use a design pattern when I recognize a matching problem shape?**
Not necessarily — recognizing a pattern's shape is necessary but not sufficient; the pattern's added structure must genuinely earn its complexity for your specific situation, and forcing a pattern where a simpler solution suffices ("pattern fever") is a real, common anti-pattern.

**How do design patterns relate to SOLID principles?**
Directly — many patterns are, in effect, named, proven implementations of specific SOLID principles applied to recurring problem shapes: Strategy directly implements Open/Closed, Factory and Adapter directly support Dependency Inversion, and Decorator also implements Open/Closed (adding behavior via wrapping, not modification).

**What's the difference between Strategy and State patterns?**
Both look structurally similar, but Strategy is CLIENT-driven (the calling code explicitly chooses which algorithm/behavior to use), while State is OBJECT-driven (the object itself transitions between internal states and corresponding behaviors based on its own logic).

**Is Singleton a good pattern to use?**
It's genuinely useful for truly global, shared resources (a single configuration manager, for instance), but it's widely recognized as easy to overuse — its hidden global state makes testing harder (state can leak between tests) and makes dependencies less explicit than proper dependency injection; many situations reaching for Singleton are better served by explicit dependency injection instead.

**Do I need design patterns if my language has first-class functions?**
Some patterns (particularly Strategy and Command) can often be achieved more simply by passing functions directly rather than constructing full class hierarchies, in languages supporting first-class functions (Python, JavaScript) — recognizing this is itself a valuable, senior-level judgment, though the underlying PROBLEM the pattern solves remains relevant regardless of the specific implementation mechanics used.
`,

  "interview-questions": `
### Junior level

1. **What are the three categories of design patterns in the Gang of Four catalog?**
   Model answer: creational (object construction), structural (composing objects/classes into larger structures), and behavioral (communication and responsibility distribution between objects).

2. **What problem does the Strategy pattern solve?**
   Model answer: it lets an algorithm or behavior be selected and swapped at runtime, letting new implementations be added without modifying the code that uses them polymorphically.

3. **What problem does the Observer pattern solve?**
   Model answer: it lets multiple, independent objects be automatically notified when a subject's state changes, without the subject needing specific knowledge of each observer's behavior.

4. **What is the Singleton pattern, and what's a common criticism of it?**
   Model answer: it ensures a class has exactly one, globally-accessible instance; it's commonly criticized for introducing hidden global state that complicates testing and reasoning about a codebase.

5. **What's the difference between the Adapter and Facade patterns?**
   Model answer: Adapter makes an existing, incompatible interface conform to what's expected; Facade provides a simplified, unified interface to a complex subsystem made of many interacting classes.

### Senior level

6. **Explain the semantic difference between the Strategy and State patterns despite their structural similarity.**
   Model answer: both involve a context object holding a reference to an interchangeable implementation of a shared interface, but Strategy is CLIENT-driven (external code explicitly chooses which behavior to use, and that choice typically doesn't change based on the object's own state), while State is OBJECT-driven (the object itself manages transitions between different internal states and their corresponding behaviors, often without the client being directly aware a transition occurred).

7. **How does the Decorator pattern avoid a combinatorial explosion of classes?**
   Model answer: rather than creating a separate class for every possible combination of optional behaviors (CoffeeWithMilk, CoffeeWithSugar, CoffeeWithMilkAndSugar, and so on), Decorator lets behaviors be composed by wrapping objects in any combination and order at runtime, with each decorator layer independently adding its own specific behavior atop whatever it wraps — turning what would be an exponential number of classes into a linear number of composable decorator classes.

8. **When would you choose Abstract Factory over a simple Factory Method?**
   Model answer: when you need to create FAMILIES of related objects that must remain mutually consistent (matching UI theme elements — buttons, checkboxes, all from the same theme — being a classic example), where creating each element via independent, unrelated factory calls couldn't guarantee that consistency; a simple Factory Method suffices when you're only creating one type of product without this cross-consistency requirement.

9. **Why is Singleton often better replaced by dependency injection in production code?**
   Model answer: Singleton's globally-accessible, hidden instance makes dependencies implicit (any code can reach the Singleton directly without declaring it as a dependency) and makes testing harder (Singleton state can persist across supposedly-independent tests unless carefully reset); explicit dependency injection makes the dependency visible in a class's constructor, is trivially replaceable with a test double, and avoids the shared-state risks Singleton introduces.

10. **How does the Factory pattern directly support the Dependency Inversion Principle?**
    Model answer: client code depends on the factory's abstract RETURN TYPE (an interface multiple concrete products satisfy) rather than constructing a specific concrete class directly — this means client code is decoupled from concrete construction details, satisfying DIP's requirement that high-level code depend on abstractions rather than concrete low-level implementations.

11. **Design a notification system using the Observer pattern that avoids a common subscription-leak bug.**
    Model answer: implement subscribe() and unsubscribe() methods on the subject, and ensure every object that subscribes has a corresponding, reliably-triggered unsubscription (via explicit cleanup code, a context manager, or a weak reference to the observer that doesn't prevent garbage collection) — the classic bug is an observer that subscribes but is never properly unsubscribed even after it's logically "done," continuing to receive (and potentially crash on, or waste resources handling) notifications indefinitely.

12. **How would you recognize that a design pattern is being over-applied ("pattern fever") in a code review?**
    Model answer: look for interfaces with only ONE ever-implemented concrete class with no realistic prospect of a second, factory methods for objects constructed in exactly one way with no genuine variation, or deep decorator/wrapper layers each adding negligible individual behavior — in each case, the pattern's structural ceremony (extra classes, interfaces, indirection) isn't earning its complexity because the genuine variation or flexibility need the pattern is meant to manage doesn't actually exist in this specific situation.
`,

  "coding-questions": `
### 1. Implement a Factory pattern selecting environment-appropriate implementations

~~~python
class PaymentGateway:
    def charge(self, amount):
        raise NotImplementedError

class StripeGateway(PaymentGateway):
    def charge(self, amount):
        return "Charged " + str(amount) + " via Stripe"

class SandboxGateway(PaymentGateway):
    def charge(self, amount):
        return "SANDBOX: would charge " + str(amount)

def create_payment_gateway(environment):
    if environment == "production":
        return StripeGateway()
    return SandboxGateway()
# Follow-up: how does depending on the create_payment_gateway()
# factory's abstract return type (PaymentGateway), rather than
# directly constructing StripeGateway or SandboxGateway in calling
# code, directly satisfy the Dependency Inversion Principle?
~~~

### 2. Implement a Decorator-based text formatting system

~~~python
class Text:
    def __init__(self, content):
        self.content = content
    def render(self):
        return self.content

class BoldDecorator:
    def __init__(self, wrapped):
        self.wrapped = wrapped
    def render(self):
        return "**" + self.wrapped.render() + "**"

class ItalicDecorator:
    def __init__(self, wrapped):
        self.wrapped = wrapped
    def render(self):
        return "_" + self.wrapped.render() + "_"

formatted = BoldDecorator(ItalicDecorator(Text("Hello")))
print(formatted.render())   -- "**_Hello_**"
# Follow-up: how many separate classes would be needed to support
# every combination of bold, italic, underline, and strikethrough
# WITHOUT the Decorator pattern (using one class per combination),
# versus WITH it, and why does this difference matter as more
# formatting options are added?
~~~

### 3. Implement the Command pattern with undo support

~~~python
class Command:
    def execute(self):
        raise NotImplementedError
    def undo(self):
        raise NotImplementedError

class AddTextCommand(Command):
    def __init__(self, document, text):
        self.document, self.text = document, text
    def execute(self):
        self.document.content += self.text
    def undo(self):
        self.document.content = self.document.content[:-len(self.text)]

class CommandHistory:
    def __init__(self):
        self.history = []
    def execute(self, command):
        command.execute()
        self.history.append(command)
    def undo_last(self):
        if self.history:
            self.history.pop().undo()
# Follow-up: why does encapsulating both execute() AND undo() logic
# together within each Command object (rather than having CommandHistory
# separately track "what changed" to reverse it) make this design
# more robust and easier to extend with new command types?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement the core creational patterns
Implement Factory Method, Builder, and Singleton for a small domain (e.g., a vehicle configuration system), with a written explanation of when each is genuinely appropriate. Deliverable: working implementations with example usage. Skills exercised: creational pattern mechanics.

### Lab 2 (Intermediate): Implement the core structural patterns
Implement Adapter (wrapping an incompatible legacy interface), Decorator (composable behavior for a domain of your choice), and Facade (simplifying a multi-class subsystem). Deliverable: working implementations demonstrating each pattern's specific benefit. Skills exercised: structural pattern mechanics.

### Lab 3 (Advanced): Implement the core behavioral patterns
Implement Strategy, Observer, and Command for a small application (e.g., a simple event-driven notification system with undoable actions). Deliverable: a working mini-application demonstrating all three patterns integrated together. Skills exercised: behavioral pattern mechanics, pattern integration.

### Lab 4 (Production): Refactor a conditional-heavy codebase using appropriate patterns
Given a deliberately conditional-heavy piece of code (a large if/elif chain selecting behavior based on a type parameter), refactor it using the most appropriate pattern (Strategy or Factory), demonstrating that adding a new variant requires zero modification to existing code. Deliverable: before/after code with a demonstrated extension. Skills exercised: pattern recognition and application, Open/Closed Principle in practice.
`,

  "real-projects": `
### 1. A pluggable notification system supporting multiple channels
Engineering requirements: Strategy pattern for interchangeable notification channels (email, SMS, push), Observer pattern for letting multiple parts of a system react to the same underlying event (an order status change triggering both a notification AND a log entry), and Factory pattern for constructing the appropriate channel implementation based on user preference.

### 2. A middleware/request-processing pipeline
Engineering requirements: Decorator (or Chain of Responsibility, a closely related pattern) for composing independent, stackable request-processing steps (authentication, logging, rate limiting) that can be combined flexibly without modifying a monolithic request handler.

### 3. A configuration-driven ML model serving system
Engineering requirements: Strategy pattern for interchangeable model backends (a local model, a cloud API, a fallback), Factory pattern for constructing the appropriate backend based on deployment configuration, and Adapter pattern for presenting a consistent interface atop genuinely different underlying provider SDKs/client libraries.
`,

  "case-studies": `
### Christopher Alexander's architectural patterns transferring to software
The Gang of Four's direct borrowing of Christopher Alexander's "pattern language" concept — originally developed for physical building and urban design, not software at all — and its enormously successful adaptation to object-oriented programming illustrates how a powerful organizing idea (naming and cataloging recurring solution shapes) can transfer productively across entirely unrelated disciplines. Lesson: genuinely valuable organizing principles (naming recurring solutions, building a shared vocabulary) can be more fundamental and transferable than the specific domain they were first articulated in.

### The industry's recognition that some patterns are language-dependent
The growing recognition, particularly as functional programming influences spread into mainstream languages, that some Gang of Four patterns (Strategy and Command especially) can be achieved more simply via first-class functions/closures in languages that support them, illustrates that design patterns describe PROBLEMS and their solution SHAPES, not a mandatory specific implementation mechanic — the underlying problem (needing interchangeable, swappable behavior) remains relevant, but a full class-based pattern implementation isn't always the simplest way to solve it in every language. Lesson: understanding a pattern's underlying PROBLEM and INTENT is more durable and transferable than memorizing its specific canonical class-based implementation.

### "Pattern fever" as a well-documented, common over-application failure mode
Following widespread design pattern popularity in the late 1990s-2000s, considerable industry discussion emerged specifically critiquing over-application — codebases with excessive Factory/Strategy/Abstract Factory layers for genuinely simple, non-varying logic, sometimes derisively called "enterprise FizzBuzz" style over-engineering. Lesson: even a genuinely valuable engineering discipline (design patterns) requires the same judicious, complexity-justified application discussed for SOLID principles — a well-intentioned tool, applied without judgment, can itself become the source of unnecessary complexity it was meant to help manage.
`,

  comparisons: `
| Pattern | Category | Solves | Distinguishing Factor |
|---------|----------|--------|-------------------------|
| Factory Method | Creational | Decouples client code from concrete construction | ONE product type |
| Abstract Factory | Creational | Creates families of mutually-consistent related objects | MULTIPLE related products, guaranteed consistency |
| Builder | Creational | Complex object construction with many optional steps | Method chaining, step-by-step configuration |
| Adapter | Structural | Makes an incompatible interface work as expected | Wraps an EXISTING, incompatible class |
| Decorator | Structural | Adds behavior dynamically, avoiding combinatorial class explosion | Wraps to ADD behavior, composable in any combination |
| Facade | Structural | Simplifies a complex subsystem's interface | Hides MULTIPLE classes behind one simple interface |
| Strategy | Behavioral | Interchangeable algorithms/behaviors, client-selected | CLIENT chooses the active implementation |
| State | Behavioral | Object-driven behavior transitions | OBJECT ITSELF transitions between behaviors |
| Observer | Behavioral | Automatic notification of interested parties on state change | ONE-to-MANY notification, decoupled |
| Command | Behavioral | Encapsulates a request as a first-class object | Enables undo, queuing, logging of ACTIONS |

**How seniors choose**: start from the creational/structural/behavioral classification, then distinguish structurally similar candidates by their specific semantic intent (who decides, what's being composed, what's being decoupled) — always verifying the pattern's genuine benefit outweighs its added structural complexity for the specific situation at hand.
`,

  "related-technologies": `
- **OOP** and **SOLID Principles** — the direct foundations design patterns are built on; covered immediately before this skill in this category.
- **LangChain**, **PyTorch**, **Django** — production frameworks extensively applying Strategy, Observer, Decorator, and Factory patterns throughout their own internal design.
- **Distributed Systems** — many microservices/cloud architecture patterns (circuit breaker, API gateway) are conceptually direct extensions of Gang of Four patterns applied at a distributed-systems scale.

Learning path: **OOP** → **SOLID Principles** → this page, completing the Computer Science category's core object-oriented design foundations, directly applicable to reading and contributing to virtually any substantial object-oriented codebase covered elsewhere on this platform.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- The Gang of Four's 23 patterns remain the canonical, near-universal reference point in software engineering education and professional vocabulary, more than three decades after their original publication.
- Continued healthy industry recognition that some patterns are more naturally expressed via first-class functions/closures in modern, multi-paradigm languages, without diminishing the enduring relevance of the underlying PROBLEMS these patterns solve.
- Growing application of pattern-based thinking to distributed systems and cloud architecture (circuit breaker, API gateway, and similar patterns), extending the same "name and catalog recurring solution shapes" philosophy to a larger architectural scale.
- Continued emphasis on judicious, complexity-justified pattern application as mature industry guidance, correcting earlier "pattern fever" over-application tendencies.
`,

  "future-roadmap": `
Where design patterns are heading, and what's worth betting career time on:

- **Continued near-permanent relevance of the Gang of Four's core catalog** as the foundational, shared vocabulary for object-oriented design across the industry.
- **Continued extension of pattern-based thinking to new scales** (distributed systems, cloud-native architecture patterns) building on the same underlying "name and catalog recurring solutions" philosophy.
- **Growing recognition of language-appropriate pattern implementation** — using first-class functions where they suffice, reserving full class-based pattern structures for cases that genuinely need them.
- **What to bet on**: deeply understanding each pattern's underlying PROBLEM and semantic INTENT (not just its canonical class structure), and the judgment of when a pattern's complexity is genuinely warranted — this transfers directly across languages, frameworks, and even architectural scales, a far more durable investment than memorizing any single pattern's exact implementation syntax.
`,

  "cheat-sheet": `
~~~python
# ---- CREATIONAL: object construction ----
# Factory Method: ONE product type, decouples construction from client code
def animal_factory(t): return Dog() if t == "dog" else Cat()

# Builder: complex object, many optional steps, method chaining
PizzaBuilder().set_size("large").add_topping("cheese").build()

# Singleton: exactly ONE global instance -- USE SPARINGLY (hidden global state hurts testing)
~~~

~~~python
# ---- STRUCTURAL: composing objects into larger structures ----
# Adapter: makes an INCOMPATIBLE interface work as expected
class PrinterAdapter(ModernInterface):
    def __init__(self, old): self.old = old
    def print_document(self, t): return self.old.print_old_format(t)

# Decorator: ADD behavior by wrapping -- avoids combinatorial class explosion
BoldDecorator(ItalicDecorator(Text("Hello"))).render()

# Facade: hides MULTIPLE classes behind ONE simple interface
~~~

~~~python
# ---- BEHAVIORAL: communication & responsibility ----
# Strategy: CLIENT chooses the active algorithm/behavior
class Checkout:
    def __init__(self, strategy): self.strategy = strategy   # injected, swappable

# Observer: ONE-to-MANY, decoupled notification on state change
subject.subscribe(observer); subject.notify(event)

# Command: encapsulates a REQUEST as an object -> enables undo/queue/log
class Command:
    def execute(self): ...
    def undo(self): ...
~~~

~~~
# ---- Distinguishing similar-looking patterns ----
Strategy vs State: WHO decides? Client (Strategy) vs the object itself (State)
Factory Method vs Abstract Factory: ONE product vs a mutually-consistent FAMILY
Decorator vs Proxy: ADDS new behavior vs CONTROLS/mediates access
Facade vs Adapter: simplifies a COMPLEX subsystem vs fixes an INCOMPATIBLE interface

# ---- THE #1 anti-pattern: "pattern fever" ----
# A Strategy/Factory with only ONE implementation, ever = wasted ceremony
# Prefer a plain function when there's no genuine anticipated variation

# ---- Direct SOLID connections ----
# Strategy = OCP.  Factory/Adapter = DIP.  Decorator = OCP.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Three pattern families? | Creational (construction), structural (composition), behavioral (communication). |
| What does Factory Method solve? | Decouples client code from concrete construction details -- ONE product type. |
| Abstract Factory vs Factory Method? | Abstract Factory creates a mutually-CONSISTENT family of related products. |
| Strategy vs State -- key distinction? | Strategy: client chooses. State: the object itself transitions based on internal logic. |
| Why does Decorator avoid a combinatorial explosion? | Behaviors compose by wrapping, in any combination, instead of one class per combination. |
| Facade vs Adapter? | Facade simplifies a complex subsystem. Adapter fixes an incompatible interface. |
| What does Observer decouple? | The event source from its many, independent reactors -- ONE-to-MANY notification. |
| Why is Singleton often criticized? | Hidden global state complicates testing -- prefer explicit dependency injection instead. |
| Command pattern's key benefit? | Encapsulates a request as an object -- enables undo, queuing, and logging of actions. |
| What is "pattern fever"? | Forcing a pattern's structure where no genuine variation/complexity justifies it. |
| Which patterns implement OCP directly? | Strategy and Decorator -- new behavior via new classes, zero modification. |
| Which patterns support DIP? | Factory and Adapter -- client code depends on an abstraction, not a concrete detail. |
`,

  mcqs: `
1. What are the three categories of design patterns in the Gang of Four catalog?
   A) Simple, complex, advanced  B) Creational, structural, behavioral  C) Client, server, database  D) Static, dynamic, hybrid
   **Answer: B** — organizing patterns by construction, composition, and communication concerns respectively.

2. What is the key distinguishing factor between the Strategy and State patterns?
   A) Strategy uses interfaces, State doesn't  B) WHO decides the active behavior -- the client (Strategy) or the object itself via internal transitions (State)  C) State is faster  D) There is no real difference
   **Answer: B** — both look structurally similar but differ in semantic intent.

3. Why does the Decorator pattern avoid a combinatorial explosion of classes?
   A) It uses less memory  B) Behaviors are composed by wrapping objects in any combination at runtime, rather than requiring one class per combination  C) It only supports one decoration at a time  D) It uses inheritance instead of composition
   **Answer: B** — this is Decorator's central structural benefit as more optional behaviors are added.

4. What is a common, well-recognized criticism of the Singleton pattern?
   A) It's too fast  B) It introduces hidden global state that complicates testing and reasoning about a codebase  C) It requires too much memory  D) It can't be implemented in most languages
   **Answer: B** — many situations reaching for Singleton are better served by explicit dependency injection.

5. How does the Factory pattern directly support the Dependency Inversion Principle?
   A) It doesn't relate to DIP at all  B) Client code depends on the factory's abstract return type rather than constructing a concrete class directly  C) It makes code run faster  D) It eliminates the need for interfaces
   **Answer: B** — this decouples client code from concrete construction details.

6. What is "pattern fever"?
   A) A bug in pattern implementation  B) Forcing a design pattern's structural ceremony onto a problem that doesn't genuinely have that shape or need that flexibility  C) Using too few patterns  D) A performance issue caused by patterns
   **Answer: B** — a well-recognized over-application anti-pattern, adding complexity without genuine benefit.
`,

  "revision-notes": `
Design patterns are proven, reusable, NAMED solutions to recurring software design problems, cataloged canonically by the "Gang of Four" (Gamma, Helm, Johnson, Vlissides) in their 1994 book, directly borrowing the "pattern" concept from architect Christopher Alexander's 1977 work on physical building design. The catalog organizes 23 patterns into three families: CREATIONAL (Factory Method, Abstract Factory, Builder, Singleton — solving object CONSTRUCTION complexity and flexibility), STRUCTURAL (Adapter, Decorator, Facade — solving how to COMPOSE objects/classes into larger, flexible structures), and BEHAVIORAL (Strategy, Observer, Command — solving how objects COMMUNICATE and distribute responsibility).

Design patterns exist specifically because experienced engineers had independently, repeatedly discovered the SAME effective solutions to the SAME recurring problems, but without a shared vocabulary each team was rediscovering these solutions from scratch — naming and cataloging them provides both a shared communication vocabulary ("use a Strategy here" conveys an entire structural approach in three words) and a proven, battle-tested reference. Many patterns are, in effect, NAMED IMPLEMENTATIONS of specific SOLID principles (covered immediately before this skill) applied to recurring shapes: Strategy and Decorator both directly implement the Open/Closed Principle (new behavior via new classes, zero modification to existing code); Factory and Adapter both directly support the Dependency Inversion Principle (client code depends on an abstraction, not a concrete construction/interface detail).

FACTORY METHOD centralizes construction of ONE product type, decoupling client code from concrete construction details; ABSTRACT FACTORY extends this to create FAMILIES of related products that must remain mutually consistent (matching UI theme elements, for instance) — a guarantee independent Factory Method calls couldn't provide. BUILDER separates complex object construction (with many optional steps) from its final representation, typically via method chaining. SINGLETON ensures exactly one, globally-accessible instance, but is widely criticized for introducing hidden global state that complicates testing — many situations reaching for Singleton are better served by explicit dependency injection instead.

ADAPTER wraps an EXISTING, incompatible class to conform to an expected interface, letting genuinely incompatible code work together without modifying either side. DECORATOR adds behavior dynamically by wrapping an object, letting behaviors be composed in ANY combination without needing a separate class for every possible combination — avoiding a combinatorial explosion as more optional behaviors are added. FACADE provides a simplified, unified interface hiding a complex subsystem made of many interacting classes.

STRATEGY lets an algorithm/behavior be selected and swapped, with the CLIENT explicitly choosing which implementation to use — directly implementing Open/Closed, since adding a new strategy (a new payment method) requires zero modification to existing code. OBSERVER lets multiple, independent objects be automatically notified when a subject's state changes, decoupling the subject entirely from any specific observer's behavior — the direct foundation of event-driven architectures and pub/sub systems. COMMAND encapsulates a request (action plus parameters) as a first-class object, enabling undo, queuing, and logging of actions.

A CRITICAL, frequently-tested distinction: STRATEGY versus STATE look structurally nearly identical (a context object holding a reference to an interchangeable implementation), but differ in WHO decides the active behavior and WHY — Strategy is client-driven, explicit choice; State is object-driven, internal transition logic based on the object's own state. Similarly, FACTORY METHOD versus ABSTRACT FACTORY differ in whether ONE product type or a mutually-consistent FAMILY of related products is being created; DECORATOR (adds new behavior) versus PROXY (controls/mediates access to existing behavior) differ in their fundamental purpose despite similar wrapping structure.

The single most important, senior-level judgment this page emphasizes is recognizing "PATTERN FEVER" — forcing a pattern's structural ceremony (extra interfaces, classes, indirection) onto a situation that doesn't genuinely have that specific problem shape or need that flexibility. An interface with only ONE ever-implemented concrete class, a Factory for an object constructed in exactly one way, or deep Decorator layers each adding negligible behavior are all common, well-recognized signs of over-application — patterns are a tool for managing GENUINE, anticipated complexity and variation, not a checklist to apply universally or to demonstrate sophistication. In languages with first-class functions (Python, JavaScript), some patterns (Strategy and Command especially) can often be achieved more simply by passing functions directly, illustrating that patterns describe a PROBLEM-SOLUTION SHAPE requiring genuine engineering judgment to recognize and apply, not a mechanical template to force onto every situation.
`,

  "learning-roadmap": `
**Week 1 — Creational patterns**: Factory Method, Builder, and Singleton, with explicit judgment on when each is genuinely appropriate. Milestone: implement all three for a small domain, documenting when each is (and isn't) warranted (Lab 1).

**Week 2 — Structural patterns**: Adapter, Decorator, and Facade, with attention to Decorator's combinatorial-explosion-avoidance benefit specifically. Milestone: implement all three, demonstrating each pattern's specific structural benefit (Lab 2).

**Week 3 — Behavioral patterns**: Strategy, Observer, and Command, connecting each directly to the SOLID principle it implements. Milestone: build a small integrated application using all three together (Lab 3).

**Week 4 — Distinguishing structurally similar patterns**: Strategy versus State, Factory Method versus Abstract Factory, Decorator versus Proxy, Facade versus Adapter. Milestone: correctly classify a set of given design problems by which specific pattern (if any) genuinely fits, with justification.

**Week 5 — Recognizing over-application and applying judgment**: identifying "pattern fever" in existing code, and recognizing when a language's first-class functions already provide a pattern's core benefit. Milestone: refactor a deliberately conditional-heavy codebase using the appropriate pattern, demonstrating zero-modification extensibility (Lab 4).

**Week 6 — Consolidation across OOP, SOLID, and Design Patterns**: reviewing the full progression from OOP fundamentals through disciplined principles to proven, catalogued solutions. Milestone: review a real or provided codebase, identifying at least three design patterns in active use and explaining which SOLID principle(s) each directly implements.

This completes the Computer Science category's core object-oriented design learning path: **OOP** → **SOLID Principles** → **Design Patterns**.
`,

  "official-docs": `
- **"Design Patterns: Elements of Reusable Object-Oriented Software" — the Gang of Four (Gamma, Helm, Johnson, Vlissides)** — the canonical, foundational catalog and the primary authoritative reference for all 23 original patterns.
- **Refactoring.guru's design patterns catalog** (refactoring.guru/design-patterns) — an excellent, widely-used, visually-illustrated modern reference covering every Gang of Four pattern with clear examples across multiple languages.
- **Christopher Alexander's "A Pattern Language"** — the original architectural source of the "pattern" concept itself, for those interested in the foundational cross-disciplinary origin.
`,

  books: `
- **"Design Patterns: Elements of Reusable Object-Oriented Software" — the Gang of Four** — the definitive, foundational text, essential reading for genuine depth on all 23 patterns.
- **"Head First Design Patterns" — Freeman and Robson** — a widely-recommended, highly accessible, visually-oriented introduction, excellent for building intuition before tackling the Gang of Four's more formal text.
- **"Patterns of Enterprise Application Architecture" — Martin Fowler** — extends pattern cataloging specifically to enterprise application concerns (data access patterns, domain logic patterns), a natural next step after the core Gang of Four catalog.
- **"Clean Architecture" — Robert C. Martin** — connects patterns to architectural-scale application, directly building on this page's Advanced Concepts.
`,

  blogs: `
- **Refactoring.guru's extensive blog content** — accessible, well-illustrated explanations of every pattern with real-world context.
- **Martin Fowler's website (martinfowler.com)** — extensive writing connecting patterns to broader architectural and refactoring concerns.
- **Various "pattern fever" / over-engineering critical blog posts** across the software engineering community, providing important balance and real-world nuance on judicious application.
`,

  "research-papers": `
Design patterns, as an industry/practitioner-derived catalog rather than pure academic research, have limited dedicated peer-reviewed literature specifically; the most relevant sources:

- **Beck, K. and Cunningham, W. — the original 1987 OOPSLA paper applying Alexander's patterns to Smalltalk UI design** — the first application of "pattern" thinking to software specifically.
- **Alexander, C. — "A Pattern Language: Towns, Buildings, Construction"** (1977) — the foundational, cross-disciplinary origin of the pattern concept itself.
- See the **SOLID Principles** skill's own research references for the closely-related foundational principles many patterns directly implement.
`,

  videos: `
- **Various "Design Patterns Explained" course series** (freeCodeCamp and similar accessible platforms) covering all 23 Gang of Four patterns with practical examples.
- **Refactoring.guru's own video content** accompanying its written pattern catalog.
- **Conference talks specifically discussing "pattern fever" and pragmatic pattern application** — providing important real-world balance beyond introductory material.
`,

  "github-repos": `
- **Various "design-patterns-for-humans" and similar accessible example repositories** across many languages, illustrating each pattern with clear, practical examples.
- **iluwatar/java-design-patterns** — an extensive, widely-referenced repository of design pattern implementations with detailed explanations.
- Well-designed open-source framework codebases (Django's, PyTorch's own source) for studying genuine, production-grade pattern application directly.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Creational pattern application**: design and implement a Builder for an object with at least five optional configuration parameters, demonstrating readable method chaining.
2. **Structural pattern application**: implement an Adapter wrapping a deliberately incompatible third-party-style interface into your application's expected interface.
3. **Behavioral pattern application**: implement a Strategy-based system supporting at least three interchangeable algorithms, then add a fourth without modifying any existing code.
4. **Pattern distinction**: given a set of design problem descriptions, correctly identify which specific pattern (Strategy versus State, Factory Method versus Abstract Factory) genuinely fits each, with justification.
5. **Refactoring practice**: given a conditional-heavy piece of code, refactor it using the appropriate pattern and demonstrate zero-modification extensibility by adding a new variant.
6. **External practice sets**: Refactoring.guru's own practice exercises for structured, guided practice across the full Gang of Four catalog.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Creational["Creational Patterns"]
        Factory["Factory Method"]
        AbstractFactory["Abstract Factory"]
        Builder["Builder"]
        Singleton["Singleton"]
    end
    subgraph Structural["Structural Patterns"]
        Adapter["Adapter"]
        Decorator["Decorator"]
        Facade["Facade"]
        Proxy["Proxy"]
    end
    subgraph Behavioral["Behavioral Patterns"]
        Strategy["Strategy"]
        Observer["Observer"]
        Command["Command"]
        State["State"]
    end
    subgraph SOLIDConnection["Direct SOLID Connections"]
        OCP["Open/Closed Principle"]
        DIP["Dependency Inversion Principle"]
    end
    Strategy --> OCP
    Decorator --> OCP
    Factory --> DIP
    Adapter --> DIP
    AbstractFactory --> Factory
    State -.structurally similar.-> Strategy
    Proxy -.structurally similar.-> Decorator
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Design Patterns))
    Foundations
      Overview
      History Alexander Gang of Four
      Why it exists
      Problem it solves
    Creational
      Factory Method
      Abstract Factory
      Builder
      Singleton
    Structural
      Adapter
      Decorator
      Facade
      Proxy
    Behavioral
      Strategy
      Observer
      Command
      State
    Distinguishing Similar Patterns
      Strategy versus State
      Factory Method versus Abstract Factory
      Decorator versus Proxy
      Facade versus Adapter
    SOLID Connections
      Strategy implements OCP
      Factory Adapter support DIP
    Judgment
      Recognizing pattern fever
      First class functions alternative
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default designPatterns;
