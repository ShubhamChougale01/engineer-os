import type { SkillContent } from "../types";

/**
 * SOLID Principles — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const solid: SkillContent = {
  overview: `
SOLID is an acronym for five object-oriented design principles — Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion — first articulated and popularized by Robert C. Martin ("Uncle Bob") to formalize HOW to apply the OOP concepts covered in the **OOP** skill well, rather than merely using classes and inheritance syntactically without genuine structural benefit. Where OOP provides the vocabulary (encapsulation, inheritance, polymorphism), SOLID provides the disciplined design judgment for using that vocabulary to produce maintainable, extensible, testable software rather than a tangled, fragile mess of interdependent classes.

For an AI engineer, SOLID principles directly explain WHY well-regarded production codebases (Django's app structure, FastAPI's dependency injection system, well-designed ML pipeline abstractions) are organized the way they are, and provide a concrete, actionable framework for reviewing and improving your own object-oriented code. Every one of the five principles addresses a specific, recurring failure mode that emerges naturally as object-oriented codebases grow — SOLID isn't abstract theory but a distillation of decades of accumulated, hard-won production experience with what goes wrong when these principles are violated.

Key characteristics: **Single Responsibility Principle**, a class should have exactly one reason to change; **Open/Closed Principle**, software entities should be open for extension but closed for modification; **Liskov Substitution Principle**, subtypes must be substitutable for their base types without breaking correctness; **Interface Segregation Principle**, clients shouldn't be forced to depend on interfaces they don't use; and **Dependency Inversion Principle**, high-level modules shouldn't depend on low-level modules — both should depend on abstractions.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1988 | **Barbara Liskov** introduces what becomes known as the Liskov Substitution Principle in a keynote address, formalizing a precise condition for correct subtyping behavior |
| 1994 | **Bertrand Meyer** formalizes the **Open/Closed Principle** in his book "Object-Oriented Software Construction," building on ideas that had circulated informally in the object-oriented community |
| 1990s–2000s | **Robert C. Martin ("Uncle Bob")** writes and consolidates a series of articles on object-oriented design principles, drawing together the Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles as a coherent set |
| 2000 | Martin's writings on these principles are compiled and widely circulated, though the specific **"SOLID" acronym** itself is generally credited to **Michael Feathers**, who coined it shortly after, to give the five principles a memorable, teachable name |
| 2002–2003 | Martin's book **"Agile Software Development, Principles, Patterns, and Practices"** presents the principles together in a widely-read, influential form, cementing SOLID's place in mainstream software engineering education |
| 2000s–2010s | SOLID becomes a standard part of software engineering curricula and technical interview preparation, alongside the **Design Patterns** skill's own Gang of Four catalog, both frequently taught together as complementary disciplines |
| 2010s–2020s | Continued, ongoing industry discussion and refinement of how to apply SOLID pragmatically — recognizing that dogmatic, over-applied SOLID (excessive abstraction layers "just in case") can itself become an anti-pattern, alongside the principles' genuine, well-established value when applied judiciously |

SOLID's history reflects a genuinely bottom-up, practice-derived discipline — rather than being designed top-down by a single committee, each principle emerged independently from different practitioners' observations about specific, recurring OOP failure modes, later consolidated by Martin into the coherent, memorable framework taught today.
`,

  "why-it-exists": `
SOLID exists because simply knowing OOP's mechanics (classes, inheritance, polymorphism, covered in the **OOP** skill) does not automatically produce good design — countless real production codebases used classes and inheritance syntactically while still becoming genuinely difficult to maintain, extend, or test, because the RELATIONSHIPS between classes were poorly structured even when each individual class's internal mechanics were technically correct.

Each SOLID principle emerged specifically to address an observed, recurring failure pattern in real object-oriented systems. Robert Martin and others working on large, evolving codebases repeatedly observed the same specific problems: classes that grew to handle too many unrelated responsibilities, becoming a tangled mess where a change for one reason risked breaking unrelated functionality (motivating Single Responsibility); code that required modifying existing, working, tested classes every time a new variant of behavior was needed, risking breaking that existing behavior (motivating Open/Closed); subclasses that violated the behavioral expectations their parent class established, causing subtle bugs when used polymorphically (motivating Liskov Substitution); bloated interfaces forcing implementing classes to provide methods they had no genuine need for (motivating Interface Segregation); and high-level business logic tightly coupled directly to low-level implementation details, making both hard to change or test independently (motivating Dependency Inversion).

SOLID's genuine value is that it distills these hard-won, independently-discovered lessons into five memorable, actionable principles — rather than every engineer needing to independently rediscover (often the hard way, through painful production maintenance experience) why these specific patterns cause problems, SOLID provides a shared vocabulary and set of concrete design heuristics for avoiding them proactively.
`,

  "problem-it-solves": `
SOLID solves the **"how do we structure object-oriented code so that it remains maintainable, extensible, and testable as it grows in size and complexity, avoiding the specific, well-documented failure modes that emerge from poorly-structured class relationships"** problem.

Concretely, the five principles provide:

- **Single Responsibility Principle**: keeping each class focused on one cohesive responsibility means a change motivated by one business reason doesn't risk unexpectedly breaking unrelated functionality bundled into the same class.
- **Open/Closed Principle**: designing classes so new behavior can be added via NEW code (new subclasses, new implementations) rather than MODIFYING existing, already-tested code, reduces the risk of introducing regressions into working functionality.
- **Liskov Substitution Principle**: ensuring subtypes genuinely honor their parent type's behavioral contract means polymorphic code (working through a general interface) can trust that ANY conforming subtype will behave correctly, without needing type-specific special-casing.
- **Interface Segregation Principle**: designing small, focused interfaces (rather than broad, "kitchen sink" interfaces) means implementing classes only need to provide methods genuinely relevant to them, avoiding forced, meaningless implementations of irrelevant methods.
- **Dependency Inversion Principle**: depending on abstractions rather than concrete implementations means high-level business logic can be tested and evolved independently of low-level implementation details (a specific database, a specific external API), and those low-level details can be swapped without touching high-level code.

What SOLID does **not** solve, or solves with a real tradeoff: applying every principle maximally and universally can itself become an anti-pattern — excessive abstraction layers, interfaces created "just in case" for hypothetical future flexibility that never materializes, and over-engineered dependency injection for genuinely simple code all represent SOLID being applied dogmatically rather than judiciously; the principles are heuristics for managing GENUINE complexity, not a checklist to maximize regardless of whether a specific piece of code actually needs that flexibility.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain each of the five SOLID principles precisely, with a concrete example of both a violation and a corrected design.
2. Identify Single Responsibility Principle violations in existing code and refactor to separate concerns appropriately.
3. Apply the Open/Closed Principle to design extensible systems where new behavior doesn't require modifying existing, tested code.
4. Recognize Liskov Substitution Principle violations, including subtle ones involving preconditions/postconditions and exception behavior.
5. Design focused, cohesive interfaces following Interface Segregation, avoiding bloated "kitchen sink" contracts.
6. Apply Dependency Inversion to decouple high-level business logic from low-level implementation details, enabling testability.
7. Recognize when SOLID is being over-applied (unnecessary abstraction, premature flexibility) versus genuinely warranted.
8. Connect SOLID principles to specific design patterns that directly implement them (Strategy, Factory, and others covered in the **Design Patterns** skill).
9. Answer senior-level interview questions on SOLID principle application, tradeoffs, and appropriate judgment.
`,

  prerequisites: `
- **Required**: the **OOP** skill (covered immediately before this one in this category) — SOLID formalizes disciplined application of OOP's core concepts, and doesn't make sense without that foundation.
- **Helpful**: some exposure to a real, moderately-sized codebase, since SOLID's value becomes most apparent when reasoning about how a design holds up as complexity grows, not just for small, isolated examples.

Dependency links: **OOP** → this page → **Design Patterns**, the natural progression from OOP fundamentals through disciplined principles to a catalog of proven, reusable solutions built directly on these principles.
`,

  "beginner-concepts": `
### Single Responsibility Principle (SRP)

~~~python
# WRONG — this class has multiple, unrelated reasons to change:
# report FORMATTING logic and email SENDING logic are bundled together
class ReportManager:
    def generate_report(self, data):
        return "Report: " + str(data)
    def send_email(self, report, recipient):
        -- email sending logic here
        pass

# RIGHT — separate classes, each with ONE reason to change
class ReportGenerator:
    def generate_report(self, data):
        return "Report: " + str(data)

class EmailSender:
    def send_email(self, content, recipient):
        -- email sending logic here
        pass
~~~

"A class should have only one reason to change" — ReportGenerator changes only if report formatting requirements change; EmailSender changes only if email sending mechanics change; bundling both together meant EITHER kind of change risked touching (and potentially breaking) the other's functionality.

### Open/Closed Principle (OCP)

~~~python
# WRONG — adding a new discount type requires MODIFYING this
# existing, already-tested function every single time
def calculate_discount(customer_type, amount):
    if customer_type == "regular":
        return amount * 0.05
    elif customer_type == "premium":
        return amount * 0.10
    -- adding "vip" requires editing this function again

# RIGHT — open for EXTENSION (add a new class), closed for
# MODIFICATION (existing classes never need to change)
class DiscountStrategy:
    def calculate(self, amount):
        raise NotImplementedError

class RegularDiscount(DiscountStrategy):
    def calculate(self, amount):
        return amount * 0.05

class VIPDiscount(DiscountStrategy):    -- ADDING this requires NO changes elsewhere
    def calculate(self, amount):
        return amount * 0.15
~~~

"Software entities should be open for extension but closed for modification" — a new discount type is added by writing a NEW class, without touching any existing, already-working code.

### Liskov Substitution Principle (LSP) — the classic square/rectangle problem

~~~python
class Rectangle:
    def __init__(self, width, height):
        self.width, self.height = width, height
    def area(self):
        return self.width * self.height

# WRONG — Square inherits from Rectangle, but VIOLATES the
# expected behavior: setting width also unexpectedly changes height
class Square(Rectangle):
    def set_width(self, width):
        self.width = self.height = width   -- surprising side effect!
    def set_height(self, height):
        self.width = self.height = height

def test_rectangle_area(rect):
    rect.set_width(4)
    rect.set_height(5)
    assert rect.area() == 20   -- FAILS for a Square, since both got set to 5!
~~~

Even though "a Square is-a Rectangle" seems geometrically true, Square VIOLATES Liskov Substitution because it changes Rectangle's expected behavior (setting width shouldn't affect height) — code written against the Rectangle interface can't safely substitute a Square without breaking.

### Interface Segregation Principle (ISP)

~~~python
# WRONG — a bloated interface forces EVERY implementer to provide
# methods it might not actually need
class Worker:
    def work(self):
        raise NotImplementedError
    def eat(self):
        raise NotImplementedError

class RobotWorker(Worker):
    def work(self):
        return "Working"
    def eat(self):
        raise NotImplementedError("Robots don't eat!")   -- forced, meaningless implementation

# RIGHT — smaller, focused interfaces
class Workable:
    def work(self):
        raise NotImplementedError

class Eatable:
    def eat(self):
        raise NotImplementedError

class RobotWorker(Workable):   -- only implements what it genuinely needs
    def work(self):
        return "Working"
~~~

"Clients shouldn't be forced to depend on interfaces they don't use" — splitting a bloated interface into smaller, focused ones lets each class implement only what's genuinely relevant to it.

### Dependency Inversion Principle (DIP)

~~~python
# WRONG — high-level OrderProcessor directly depends on a
# LOW-LEVEL, concrete email implementation
class OrderProcessor:
    def __init__(self):
        self.emailer = SMTPEmailer()   -- tightly coupled to ONE specific implementation
    def process(self, order):
        self.emailer.send(order.customer_email, "Order confirmed")

# RIGHT — depend on an ABSTRACTION, not a concrete implementation
class OrderProcessor:
    def __init__(self, notifier):   -- accepts ANY object implementing the Notifier interface
        self.notifier = notifier
    def process(self, order):
        self.notifier.send(order.customer_email, "Order confirmed")
~~~

"High-level modules shouldn't depend on low-level modules; both should depend on abstractions" — OrderProcessor now works with ANY notifier implementation (email, SMS, push notification) without needing to change, and can be tested with a fake notifier instead of a real email service.
`,

  "intermediate-concepts": `
### SRP in practice: identifying "reasons to change"

~~~
A class violates SRP if you can identify MULTIPLE distinct groups
of stakeholders or business reasons that could each independently
require changing it -- e.g., a class that both validates business
rules AND formats data for a specific UI has two separate reasons
to change (business rule updates, and UI formatting updates),
even if it currently seems like "related" functionality.
~~~

The practical test for SRP isn't "does this feel like one thing" but "how many DIFFERENT reasons/stakeholders could require a change here" — if the answer is more than one, consider splitting the responsibility.

### OCP applied through polymorphism and configuration

~~~python
# A payment processing system extensible without modification
class PaymentProcessor:
    def __init__(self, payment_methods):
        self.payment_methods = {m.name: m for m in payment_methods}

    def process(self, method_name, amount):
        return self.payment_methods[method_name].charge(amount)

-- adding CryptoPayment later requires ZERO changes to PaymentProcessor
processor = PaymentProcessor([CreditCardPayment(), PayPalPayment(), CryptoPayment()])
~~~

OCP is most commonly achieved through polymorphism (a shared interface with multiple implementations) combined with dependency injection (the specific implementations are provided/configured externally, not hardcoded inside the class that uses them).

### LSP's precise formal conditions

~~~
For a subtype to be safely substitutable for its base type:
├── Preconditions cannot be STRENGTHENED in the subtype
│    (the subtype can't demand MORE from callers than the base type did)
├── Postconditions cannot be WEAKENED in the subtype
│    (the subtype must still guarantee at least what the base type promised)
└── The subtype must preserve any invariants the base type established
~~~

The Square/Rectangle example violates this because Square's set_width() has a side effect (also changing height) that Rectangle callers wouldn't expect — this is a postcondition/invariant violation, not merely a "philosophical" is-a mismatch.

### ISP and role-based interface design

~~~python
# A printer that ONLY prints shouldn't be forced to implement scan()
class Printable:
    def print_document(self, doc):
        raise NotImplementedError

class Scannable:
    def scan_document(self):
        raise NotImplementedError

class SimplePrinter(Printable):        -- implements only what it can do
    def print_document(self, doc):
        return "Printing: " + doc

class MultiFunctionPrinter(Printable, Scannable):   -- implements BOTH, genuinely capable of both
    def print_document(self, doc):
        return "Printing: " + doc
    def scan_document(self):
        return "Scanning document"
~~~

Designing interfaces around genuine, cohesive ROLES (Printable, Scannable) rather than around a specific class's full capability set lets classes compose exactly the capabilities they genuinely have, avoiding forced, meaningless method implementations.

### DIP and dependency injection

~~~python
# The abstraction (interface) both high-level and low-level code depend on
class Notifier:
    def send(self, recipient, message):
        raise NotImplementedError

# Low-level implementations depend on the SAME abstraction
class EmailNotifier(Notifier):
    def send(self, recipient, message):
        -- actual email sending logic
        pass

class SMSNotifier(Notifier):
    def send(self, recipient, message):
        -- actual SMS sending logic
        pass

# High-level code depends ONLY on the abstraction, never a concrete implementation
class OrderProcessor:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier
~~~

Dependency injection (passing dependencies in from outside, rather than a class constructing its own dependencies internally) is the standard mechanical technique for achieving Dependency Inversion in practice.
`,

  "advanced-concepts": `
### The relationship between SOLID and design patterns

~~~
Strategy pattern      -> directly implements OCP (new algorithms
                          via new classes, not modifying existing ones)
Factory pattern        -> supports DIP (client code depends on an
                          abstract product interface, not concrete
                          construction details)
Adapter pattern         -> can help satisfy LSP retroactively (wrapping
                          an incompatible class to conform to an
                          expected interface)
Decorator pattern        -> directly implements OCP (adding behavior
                          by wrapping, not modifying, existing classes)
~~~

Recognizing that specific design patterns (covered in depth in the **Design Patterns** skill) are, in many cases, concrete, named implementations of SOLID principles applied to specific recurring problem shapes is a genuinely valuable connection — SOLID provides the underlying WHY, design patterns provide the specific, proven HOW for common cases.

### Recognizing SOLID over-application

~~~
Signs of dogmatic, over-applied SOLID:
├── An interface with only ONE ever-implemented concrete class,
│    created "for future flexibility" that never materializes
├── Dependency injection frameworks configuring simple,
│    stateless utility classes that never genuinely vary
├── Deeply layered abstractions where a simple direct call
│    would be equally maintainable and much easier to trace
└── SRP taken to an extreme, splitting genuinely cohesive
     logic into many tiny classes that must always change together anyway
~~~

A senior engineer applies SOLID JUDICIOUSLY — the principles exist to manage GENUINE complexity and anticipated variation, not to be maximized universally regardless of whether a specific piece of code actually needs that flexibility; premature abstraction "just in case" is a real, well-recognized anti-pattern in its own right.

### LSP and exception behavior

~~~python
class FileReader:
    def read(self, path):
        -- may raise FileNotFoundError
        pass

# WRONG — a subclass that raises a DIFFERENT, unexpected exception
# type violates LSP, since callers written against FileReader's
# documented exception behavior won't correctly catch this new type
class NetworkFileReader(FileReader):
    def read(self, path):
        -- raises ConnectionError instead -- callers expecting
        -- FileNotFoundError specifically won't catch this correctly
        pass
~~~

LSP violations aren't limited to method signatures and return values — a subtype that changes the EXCEPTION behavior callers can expect (raising unexpected exception types, or failing to raise expected ones) also breaks safe substitutability, a subtler but genuinely important violation class.

### DIP at the architectural level: hexagonal/clean architecture

~~~mermaid
flowchart TB
    Domain["Core business logic\n(depends on NOTHING external)"]
    Ports["Abstract interfaces (ports)\ndefined BY the domain"]
    Adapters["Concrete adapters\n(database, external APIs, UI)"]
    Domain --> Ports
    Adapters -.implements.-> Ports
~~~

At an architectural scale, Dependency Inversion underlies "hexagonal architecture" (also called "ports and adapters") and "clean architecture" — the core business logic defines abstract interfaces it needs (ports), and all external, low-level concerns (databases, APIs, UI frameworks) implement those interfaces as adapters, meaning the core business logic depends on NOTHING external and can be tested, understood, and evolved in complete isolation.
`,

  "internal-working": `
What happens architecturally when Dependency Inversion is correctly applied, tracing how a high-level component avoids depending on low-level details:

~~~mermaid
flowchart TB
    subgraph Traditional["WITHOUT Dependency Inversion"]
        HighLevelA["OrderProcessor\n(high-level)"] --> LowLevelA["SMTPEmailer\n(low-level, CONCRETE)"]
    end
    subgraph Inverted["WITH Dependency Inversion"]
        HighLevelB["OrderProcessor\n(high-level)"] --> AbstractionB["Notifier interface\n(ABSTRACTION)"]
        LowLevelB1["SMTPEmailer"] -.implements.-> AbstractionB
        LowLevelB2["SMSGateway"] -.implements.-> AbstractionB
    end
~~~

1. **Without inversion, the dependency arrow points DOWNWARD** directly from high-level business logic to a specific, concrete low-level implementation — changing the low-level implementation (switching email providers) risks requiring changes to the high-level code too, and testing the high-level code requires a real (or heavily mocked) instance of the concrete low-level class.
2. **With inversion, BOTH high-level and low-level code depend on a shared ABSTRACTION** — the dependency arrow from high-level code now points to an interface it defines its own needs against, while low-level implementations point (implement) toward that SAME interface from the other direction.
3. **This "inversion" is precisely what lets the low-level implementation be swapped freely** (a different email provider, a different notification channel entirely) without touching the high-level code at all, since the high-level code was never coupled to any SPECIFIC low-level detail in the first place — only to the interface.

**Why this matters**: understanding this specific structural inversion (not just "use interfaces sometimes") is what lets you correctly recognize genuine Dependency Inversion opportunities versus superficial interface usage that doesn't actually decouple anything meaningful.
`,

  architecture: `
A senior engineer applies SOLID principles as a REVIEW LENS for existing and proposed designs, recognizing specific violation patterns and judging when applying a principle is genuinely warranted versus when it would be dogmatic over-engineering.

### The SOLID review checklist

~~~mermaid
flowchart TB
    Class["A class or module\nunder review"] --> SRP{"Does this have MORE\nthan one reason to change?"}
    SRP -->|Yes| SplitSRP["Consider splitting responsibilities"]
    SRP -->|No| OCP{"Would adding new behavior\nrequire MODIFYING this\nexisting, tested code?"}
    OCP -->|Yes, frequently| ApplyOCP["Consider a polymorphic,\nextensible design"]
    OCP -->|No, or rarely| LSP{"Do all subtypes genuinely\nhonor the base type's\nbehavioral contract?"}
    LSP -->|No| FixLSP["Fix the substitutability violation,\nor reconsider the inheritance relationship"]
    LSP -->|Yes| ISP{"Does this interface force\nimplementers to provide\nmethods they don't need?"}
    ISP -->|Yes| SplitISP["Split into smaller,\nrole-based interfaces"]
    ISP -->|No| DIP{"Does high-level logic\ndepend directly on a\nCONCRETE low-level detail?"}
    DIP -->|Yes| ApplyDIP["Introduce an abstraction\nboth sides depend on"]
~~~

This review checklist — walking through each principle as a specific, targeted question rather than a vague "is this good design" — is the single most valuable practical application of SOLID for code review and design discussions.

### Judging when SOLID application is genuinely warranted

~~~mermaid
flowchart LR
    Complexity["Is there GENUINE, anticipated\nvariation or complexity here\n(multiple real implementations,\nfrequent change, real testing need)?"]
    Complexity -->|Yes| ApplyPrinciple["Apply the relevant SOLID\nprinciple deliberately"]
    Complexity -->|No, this is simple\nand stable| KeepSimple["Keep it simple -- premature\nabstraction adds cost without benefit"]
~~~

A senior engineer doesn't apply SOLID principles reflexively to every piece of code — the judgment of WHEN a principle's flexibility genuinely pays for its added structure (versus when it's premature, speculative over-engineering) is itself a core, senior-level skill this page emphasizes throughout.

### SOLID at the architectural scale: hexagonal architecture

~~~mermaid
flowchart TB
    subgraph Core["Application Core"]
        BusinessLogic["Business Logic\n(depends on nothing external)"]
        Ports["Ports (abstract interfaces)"]
    end
    subgraph External["External Concerns"]
        DB["Database Adapter"]
        API["External API Adapter"]
        UI["UI/Web Adapter"]
    end
    BusinessLogic --> Ports
    DB -.implements.-> Ports
    API -.implements.-> Ports
    UI -.implements.-> Ports
~~~

Dependency Inversion, applied consistently at an architectural scale, produces "hexagonal" or "clean" architecture — the business logic core remains entirely independent of any specific database, external API, or UI framework, letting each be swapped, tested in isolation, or evolved independently.
`,

  "data-flow": `
Tracing how Dependency Inversion enables testing high-level business logic in complete isolation from real external dependencies:

~~~mermaid
sequenceDiagram
    participant Test as Test code
    participant Processor as OrderProcessor (high-level)
    participant FakeNotifier as FakeNotifier (test double)
    participant RealNotifier as EmailNotifier (production)

    Note over Test,RealNotifier: In tests: inject a FAKE implementation
    Test->>Processor: OrderProcessor(FakeNotifier())
    Test->>Processor: process(order)
    Processor->>FakeNotifier: notifier.send(...)
    FakeNotifier-->>Processor: records the call, no real email sent
    Processor-->>Test: result -- test asserts against the FAKE's recorded calls

    Note over Test,RealNotifier: In production: inject the REAL implementation
    Note over Processor: The SAME OrderProcessor code, unchanged,\nnow uses a real EmailNotifier instead
~~~

The critical detail: OrderProcessor's code is IDENTICAL in both scenarios — it depends only on the abstract Notifier interface, entirely unaware of and unaffected by whether it's actually talking to a fast, no-side-effect test double or a real email service — this is precisely what makes Dependency Inversion such a powerful enabler of fast, reliable, isolated unit testing for high-level business logic.
`,

  "production-usage": `
### Applying SRP and DIP together in a production service layer

~~~python
class Notifier:
    def send(self, recipient, message):
        raise NotImplementedError

class OrderRepository:
    def save(self, order):
        raise NotImplementedError

class OrderService:   -- ONE responsibility: order processing business logic
    def __init__(self, repository: OrderRepository, notifier: Notifier):
        self.repository = repository
        self.notifier = notifier

    def place_order(self, order):
        self.repository.save(order)
        self.notifier.send(order.customer_email, "Order placed successfully")
~~~

OrderService has a single, clear responsibility (order processing logic) and depends only on abstractions (OrderRepository, Notifier) — it can be tested with fake implementations of both, and either concrete implementation can be swapped (a different database, a different notification channel) without touching OrderService at all.

### Non-negotiables for production SOLID application

1. **Apply SRP genuinely, not dogmatically** — split responsibilities when there are truly multiple, independent reasons to change, not reflexively for every class.
2. **Use dependency injection for genuinely varying or test-critical dependencies**, not for every trivial internal collaborator.
3. **Verify LSP explicitly for any inheritance relationship**, particularly checking preconditions, postconditions, and exception behavior, not just superficial "is-a" plausibility.
4. **Design interfaces around cohesive roles**, avoiding both overly broad "kitchen sink" interfaces and excessive fragmentation into meaningless single-method interfaces.
5. **Recognize and resist over-application** — not every class needs an interface, and not every dependency needs to be injected.

### Common production patterns

- **Layered/hexagonal architecture**, applying Dependency Inversion consistently to isolate business logic from infrastructure concerns.
- **Strategy pattern implementations** (covered in the **Design Patterns** skill), directly satisfying Open/Closed for interchangeable algorithms/behaviors.
- **Repository pattern**, directly satisfying Dependency Inversion for data access, letting the underlying storage mechanism vary independently of business logic.
`,

  "industry-examples": `
- **Django's app/model structure**: encourages SRP-aligned organization, with models, views, and serializers each handling distinct concerns rather than being bundled together.
- **FastAPI's dependency injection system**: a direct, first-class framework implementation of Dependency Inversion, letting route handlers depend on abstract dependencies (a database session, an authenticated user) rather than concrete construction details.
- **Spring Boot's (covered in its own skill) extensive use of dependency injection**: a foundational, pervasive application of DIP throughout the entire framework's design philosophy.
- **Well-designed ML pipeline frameworks**: often apply Strategy-pattern-style OCP for interchangeable preprocessing steps, model implementations, or evaluation metrics, letting new components be added without modifying existing pipeline orchestration code.
- **Plugin architectures broadly** (browser extensions, IDE plugins): a direct, large-scale application of Open/Closed and Interface Segregation, letting third parties extend a system without modifying its core code.
`,

  "best-practices": `
1. **Apply the SOLID review checklist deliberately** during code review, walking through each principle as a specific, targeted question.
2. **Prioritize SRP and DIP as the most consistently high-value principles** to apply broadly, given their direct impact on testability and change isolation.
3. **Verify LSP explicitly for inheritance relationships**, checking preconditions, postconditions, invariants, and exception behavior, not just superficial is-a plausibility.
4. **Design interfaces around cohesive roles**, avoiding both bloated "kitchen sink" interfaces and excessive fragmentation.
5. **Use dependency injection for genuinely varying or test-critical dependencies**, resisting the urge to inject every trivial internal collaborator.
6. **Recognize and resist SOLID over-application** — premature abstraction "just in case" is a genuine anti-pattern, not a virtue.
7. **Connect SOLID principles to concrete design patterns** where applicable (Strategy for OCP, Repository/Factory for DIP), rather than reinventing ad-hoc solutions.
8. **Apply SOLID as a REVIEW lens for existing code**, not just as an upfront design mandate — recognizing violations in code you're modifying is often more valuable than perfect upfront design.
9. **Judge each principle's application against GENUINE anticipated complexity/variation**, not universally regardless of whether a specific piece of code actually needs that flexibility.
10. **Teach and discuss SOLID violations concretely** (with real examples from your own codebase) rather than only abstractly, since concrete examples make the principles' practical value much clearer to a team.
`,

  "anti-patterns": `
### SRP taken to a dogmatic extreme

~~~python
# WRONG — splitting genuinely cohesive logic into so many tiny
# classes that they must ALWAYS change together anyway, adding
# indirection without genuine independence
class OrderAmountCalculator: ...
class OrderTaxCalculator: ...
class OrderDiscountCalculator: ...
class OrderTotalAggregator: ...
-- four classes for what might genuinely be ONE cohesive
-- "calculate order total" responsibility

# RIGHT — a single class IS appropriate when the sub-steps are
# genuinely cohesive and always change together
class OrderTotalCalculator:
    def calculate(self, order):
        subtotal = self._calculate_amount(order)
        tax = self._calculate_tax(subtotal)
        discount = self._calculate_discount(order, subtotal)
        return subtotal + tax - discount
~~~

SRP's "one reason to change" is about genuinely INDEPENDENT reasons/stakeholders, not about minimizing the number of methods in a class — over-splitting cohesive logic into many tiny classes that always change together in lockstep doesn't achieve SRP's actual goal, it just adds indirection.

### Interfaces created "just in case" with only one implementation ever

~~~python
# WRONG — an interface created speculatively for "future flexibility"
# that never materializes, adding indirection with no genuine benefit
class PaymentProcessorInterface:
    def process(self, amount):
        raise NotImplementedError

class OnlyEverPaymentProcessor(PaymentProcessorInterface):   -- the ONLY implementation, ever
    def process(self, amount):
        ...
~~~

If a system has genuinely had only one concrete implementation for years with no realistic prospect of a second, the interface layer is providing speculative flexibility at a real ongoing cost (extra indirection, harder-to-trace code) without a corresponding realized benefit — this is a genuine, common form of SOLID over-application.

### Other production-grade anti-patterns

- **Violating LSP silently** by having a subclass throw unexpected exceptions or change side-effect behavior in ways callers written against the base type don't expect.
- **Bloated "kitchen sink" interfaces** forcing every implementer to provide methods irrelevant to their specific case.
- **Tight coupling to concrete implementations** in high-level business logic, making both hard to test and hard to change independently.
- **Applying dependency injection frameworks to every trivial internal collaborator**, adding configuration complexity disproportionate to any genuine variability need.
- **Treating SOLID as a rigid checklist to maximize** rather than a set of judgment-requiring heuristics applied where genuine complexity/variation warrants them.
`,

  performance: `
### Rule zero: SOLID is a design/maintainability discipline, not a performance optimization technique

Applying SOLID principles rarely has a meaningfully negative (or positive) direct performance impact in most application code — the concern is almost always code maintainability and testability, not runtime speed.

### The performance hierarchy (apply in order)

1. **Don't sacrifice SOLID principles for premature performance optimization** in typical business logic, where the actual bottleneck is rarely the small overhead of an extra abstraction layer or polymorphic dispatch.
2. **Consider abstraction overhead specifically in genuinely performance-critical hot paths**, where an extra layer of indirection (a virtual method call through an interface) might matter, though this is rarely the case in most application-level code.
3. **Profile before removing abstractions for performance reasons**, since intuition about "interfaces are slow" is frequently wrong or irrelevant relative to the actual bottleneck.

### Micro-level facts worth knowing

- Dependency injection's runtime overhead (resolving which concrete implementation to use) is typically negligible relative to actual business logic execution time, particularly for anything involving I/O (database calls, network requests) that dominates real-world latency anyway.
- Polymorphic dispatch through an interface has a small, measurable overhead in compiled languages, but this is rarely the genuine bottleneck outside truly performance-critical, tight inner loops.
`,

  scalability: `
SOLID's "scalability" concern is fundamentally about CODEBASE scalability — how well a design holds up as a system grows in size, complexity, and number of contributors — directly complementing the **OOP** skill's own treatment of this same theme.

### Why SOLID matters more as codebases grow

~~~mermaid
flowchart LR
    SmallCodebase["Small codebase,\nfew contributors"] --> LowStakes["SOLID violations have\nlimited, easily-traced impact"]
    LargeCodebase["Large codebase,\nmany contributors"] --> HighStakes["SOLID violations compound --\ntangled dependencies, fragile\nchanges, hard-to-test code"]
~~~

The genuine, practical value of applying SOLID principles becomes dramatically more apparent as a codebase and team grow — the same tangled, tightly-coupled design that's merely annoying in a small, single-developer project can become genuinely crippling in a large, multi-team codebase.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Classes handling too many unrelated responsibilities, causing frequent unrelated breakage | Apply SRP, splitting into cohesive, independently-changeable classes |
| Adding new behavior requires modifying many existing, tested classes | Apply OCP, designing for extension via new classes rather than modification |
| High-level logic tightly coupled to specific low-level implementations, hard to test/change | Apply DIP, introducing abstractions both sides depend on |
| Bloated interfaces forcing meaningless implementations | Apply ISP, splitting into smaller, role-based interfaces |
| Subtle bugs from polymorphic code that doesn't actually work correctly for all subtypes | Apply LSP, verifying genuine behavioral substitutability |
`,

  security: `
### SOLID's indirect security benefits through testability and isolation

~~~
Well-applied Dependency Inversion means security-critical business
logic (authorization checks, for instance) can be tested in
COMPLETE isolation from real external dependencies, using fast,
deterministic fake implementations -- making it dramatically easier
to write COMPREHENSIVE tests covering edge cases and adversarial
scenarios that would be impractical or slow to test against real
external systems.
~~~

SOLID principles don't directly address security vulnerabilities, but well-applied Dependency Inversion and Single Responsibility indirectly support security by making security-critical logic (authentication, authorization) genuinely testable in isolation, and by keeping such logic in a focused, auditable location rather than scattered across many classes with unrelated responsibilities.

### Essential SOLID-related security practices

1. **Isolate security-critical logic (authorization, input validation) into focused, single-responsibility classes**, making it easier to audit and test comprehensively.
2. **Apply Dependency Inversion for security-critical dependencies** (an authorization service, an authentication provider), enabling thorough testing with fake implementations covering adversarial scenarios.
3. **Verify LSP for any security-relevant class hierarchy**, since a subtype silently weakening a security invariant (a subclass that skips a validation check the parent performed) is a genuinely severe class of bug.

See the **OWASP Top 10** skill for the broader web application security context this connects to.
`,

  testing: `
### Testing high-level logic via Dependency Inversion (fake implementations)

~~~python
class FakeNotifier(Notifier):
    def __init__(self):
        self.sent_messages = []
    def send(self, recipient, message):
        self.sent_messages.append((recipient, message))

def test_order_service_sends_confirmation():
    fake_notifier = FakeNotifier()
    service = OrderService(FakeOrderRepository(), fake_notifier)
    service.place_order(Order(customer_email="test@example.com"))
    assert fake_notifier.sent_messages == [("test@example.com", "Order placed successfully")]
~~~

### Testing LSP compliance explicitly

~~~python
def verify_lsp_compliance(base_class, subclasses, test_scenarios):
    -- run the SAME behavioral test suite against every subclass,
    -- verifying each one honors the base class's expected contract
    for subclass in subclasses:
        for scenario in test_scenarios:
            instance = subclass(**scenario["init_args"])
            result = instance.method_under_test(**scenario["method_args"])
            assert result == scenario["expected"], subclass.__name__ + " violates LSP"
~~~

### The senior testing doctrine

- Test high-level business logic against fake/test-double implementations of injected dependencies, enabling fast, deterministic, isolated unit tests.
- Run the SAME behavioral contract test suite against every subclass in an inheritance hierarchy, explicitly verifying LSP compliance rather than assuming it.
- Test that new implementations (added to satisfy OCP) integrate correctly through the shared interface, without needing changes to existing consuming code.
- Test interface implementations don't have unused, forced "not implemented" methods, a signal of ISP violation.
`,

  debugging: `
### The toolbox, in escalation order

1. **Identify which SOLID principle a given bug or maintenance pain relates to** — is this bug hard to fix because of tangled responsibilities (SRP), because fixing it requires modifying widely-depended-upon code (OCP), or because a subtype behaves unexpectedly when substituted (LSP)?
2. **Trace the actual dependency direction** for a component that's hard to test, checking whether high-level logic is tightly coupled to a concrete low-level implementation (a DIP violation).
3. **Check for LSP violations explicitly** when polymorphic code produces unexpected behavior for a specific subtype, verifying preconditions/postconditions/exceptions match the base type's contract.
4. **Look for "not implemented" or no-op method implementations** as a signal of an ISP violation (an interface too broad for what a specific class genuinely needs).

### Debugging common SOLID-related symptoms

- "This class is impossible to unit test without a real database/external service" — likely a DIP violation; introduce an abstraction and inject a fake implementation.
- "Fixing this bug for one case broke an unrelated feature" — likely an SRP violation; the class was handling multiple unrelated responsibilities.
- "Adding a new type of X requires editing five existing files" — likely an OCP violation; consider a polymorphic, extensible design instead.
- "This subclass works differently than expected when used polymorphically" — likely an LSP violation; check preconditions, postconditions, and exception behavior against the base type's contract.
`,

  monitoring: `
### Key signals to track

- **Code churn/change coupling metrics**: files that frequently change together across unrelated features often signal an SRP violation worth investigating.
- **Test suite speed and reliability**: a slow, flaky test suite requiring real external dependencies often signals a DIP violation, since properly-inverted dependencies enable fast, isolated testing.
- **Interface implementation "not implemented" method frequency**: a static analysis signal of potential ISP violations.

### Tools

Code coupling/change-frequency analysis tools (identifying files that change together, a proxy for SRP violations); static analysis tools flagging classes with unusually high numbers of public methods or dependencies (a proxy for SRP/ISP concerns); test suite execution time trends (a proxy for DIP application quality).

### Alerting priorities

For SOLID application, "monitoring" is less about runtime alerting and more about ONGOING CODE REVIEW discipline and periodic architectural review, catching principle violations and their accumulating maintenance cost before they compound significantly.
`,

  deployment: `
### SOLID as a code review and architectural review practice

~~~
A team's code review checklist explicitly including SOLID-specific
questions (does this new class have a single, clear responsibility?
does this change require modifying existing, tested code
unnecessarily? does this new subclass genuinely honor its parent's
contract?) directly operationalizes SOLID as an ongoing team practice,
not just individual developer knowledge.
~~~

### CI/CD pipeline considerations

Static analysis tools checking for common SOLID violation signals (excessive class size/method count for SRP, high coupling metrics for DIP) as part of CI can catch principle violations before they compound into genuine maintainability problems. See the **CI/CD** skill for the general pipeline depth this builds on.
`,

  "production-checklist": `
Before SOLID-relevant production code ships:

- [ ] Each class has a single, clear, genuinely cohesive responsibility (not multiple independent reasons to change)
- [ ] New behavior can typically be added via new classes/implementations, not by modifying existing, tested code
- [ ] Any inheritance relationship has been explicitly verified for LSP compliance (preconditions, postconditions, exception behavior)
- [ ] Interfaces are focused and role-based, not bloated "kitchen sink" contracts forcing irrelevant implementations
- [ ] High-level business logic depends on abstractions, not directly on concrete low-level implementation details
- [ ] Dependency injection is used deliberately for genuinely varying/test-critical dependencies, not applied indiscriminately
- [ ] No interfaces exist with only one implementation and no realistic prospect of a second (a signal of over-application)
- [ ] Tests exercise high-level logic against fake/test-double implementations, not always real external dependencies
- [ ] Code review explicitly considers SOLID principles as a specific review lens, not just general "code quality"
`,

  "common-mistakes": `
1. **Taking SRP to a dogmatic extreme**, splitting genuinely cohesive logic into many tiny classes that always change together anyway.
2. **Creating interfaces "just in case" with only ever one implementation**, adding indirection without genuine benefit.
3. **Violating LSP silently** through unexpected exception behavior or side effects in subclasses, not just superficial method signature mismatches.
4. **Designing bloated "kitchen sink" interfaces** forcing implementers to provide irrelevant methods.
5. **Tightly coupling high-level business logic to concrete low-level implementations**, making both hard to test and change independently.
6. **Applying dependency injection frameworks to every trivial internal collaborator**, adding disproportionate configuration complexity.
7. **Treating SOLID as a rigid checklist to maximize** rather than judgment-requiring heuristics applied where genuine complexity warrants them.
8. **Not verifying LSP explicitly**, assuming an inheritance relationship is safe based on superficial "is-a" plausibility alone.
9. **Confusing SRP's "one reason to change" with "minimize methods per class"**, which are genuinely different goals.
10. **Not connecting SOLID principles to concrete design patterns**, reinventing ad-hoc solutions to problems the **Design Patterns** skill already catalogs proven approaches for.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| A bug fix for one feature breaks an unrelated feature | SRP violation — a class handling multiple, unrelated responsibilities | Split the class into cohesive, independently-changeable responsibilities |
| Adding a new variant requires editing many existing files | OCP violation — behavior implemented via conditional branching rather than polymorphism | Refactor to a polymorphic, extensible design (new classes, not modified existing code) |
| A subclass behaves unexpectedly when used polymorphically | LSP violation — the subclass doesn't honor the base type's behavioral contract | Verify preconditions/postconditions/exceptions match; reconsider the inheritance relationship if they genuinely can't |
| A class has many "not implemented" or no-op methods | ISP violation — an interface too broad for what this class genuinely needs | Split the interface into smaller, role-based contracts |
| Unit tests require a real database/external service to run | DIP violation — high-level logic directly coupled to a concrete low-level implementation | Introduce an abstraction, inject a fake/test-double implementation for testing |
| Code review reveals speculative interfaces with only one implementation | Premature abstraction, SOLID over-application | Simplify by removing the unnecessary interface layer until genuine variation actually exists |
`,

  faqs: `
**What does each letter in SOLID stand for?**
Single Responsibility (a class should have one reason to change), Open/Closed (open for extension, closed for modification), Liskov Substitution (subtypes must be safely substitutable for their base types), Interface Segregation (clients shouldn't depend on interfaces they don't use), and Dependency Inversion (depend on abstractions, not concrete implementations).

**Is applying every SOLID principle always the right choice?**
No — applying SOLID dogmatically (creating interfaces "just in case," splitting cohesive logic into unnecessarily many tiny classes) is itself a recognized anti-pattern; the principles are judgment-requiring heuristics for managing genuine, anticipated complexity, not a checklist to maximize regardless of whether a specific piece of code actually needs that flexibility.

**How do I know if a class violates the Single Responsibility Principle?**
Ask whether there are MULTIPLE, genuinely INDEPENDENT reasons/stakeholders that could each require changing this class — if formatting logic and business rule logic, for instance, could each change for entirely unrelated reasons but live in the same class, that's an SRP violation worth splitting.

**What's a concrete example of a Liskov Substitution Principle violation?**
The classic "Square inherits from Rectangle" example — even though a square is geometrically a special rectangle, if Square's setters have surprising side effects (setting width also changes height) that Rectangle's callers don't expect, code written against the Rectangle interface breaks when a Square is substituted, violating LSP despite the intuitive "is-a" relationship.

**How does Dependency Inversion actually help with testing?**
By having high-level business logic depend only on an ABSTRACTION (an interface) rather than a concrete low-level implementation, tests can inject a fast, deterministic FAKE implementation of that interface instead of a real, slow, or hard-to-control external dependency (a real database, a real email service), enabling fast, reliable, isolated unit tests.

**How do SOLID principles relate to design patterns?**
Directly — many well-known design patterns (covered in the **Design Patterns** skill) are, in effect, specific, proven, named implementations of SOLID principles applied to recurring problem shapes: the Strategy pattern directly implements OCP, the Factory pattern and Repository pattern directly support DIP, and so on.
`,

  "interview-questions": `
### Junior level

1. **What does the Single Responsibility Principle state?**
   Model answer: a class should have only one reason to change — it should have a single, cohesive responsibility, not multiple unrelated ones bundled together.

2. **What does the Open/Closed Principle state?**
   Model answer: software entities should be open for extension (new behavior can be added) but closed for modification (existing, tested code shouldn't need to change to add that new behavior).

3. **What is the Liskov Substitution Principle, in simple terms?**
   Model answer: subtypes must be usable in place of their base type without breaking the correctness of code written against the base type — a subclass shouldn't violate the behavioral expectations its parent class established.

4. **What does the Interface Segregation Principle recommend?**
   Model answer: clients shouldn't be forced to depend on (or implement) interface methods they don't actually use — prefer smaller, focused, role-based interfaces over broad, "kitchen sink" ones.

5. **What is Dependency Inversion, at a high level?**
   Model answer: high-level modules shouldn't depend directly on low-level modules; both should depend on a shared abstraction — this decouples business logic from specific implementation details.

### Senior level

6. **Give a concrete example of a Liskov Substitution Principle violation that isn't obvious from method signatures alone.**
   Model answer: a subclass that changes exception behavior (raising a different, unexpected exception type than the base class's documented behavior) or introduces a surprising side effect (like the classic Square-inheriting-from-Rectangle example, where setting width also unexpectedly changes height) violates LSP even though the method signatures themselves might look identical — LSP violations require examining actual behavioral contracts (preconditions, postconditions, invariants, exceptions), not just method signatures.

7. **How does Dependency Inversion specifically enable fast, isolated unit testing of business logic?**
   Model answer: when high-level business logic depends only on an abstract interface (rather than a concrete, low-level implementation like a real database or email service), tests can inject a fast, deterministic fake/test-double implementation of that same interface — the business logic code is completely unaware of and unaffected by whether it's talking to the real implementation or a test double, enabling isolated tests that don't require slow or unreliable real external dependencies.

8. **When is applying SOLID principles an anti-pattern rather than good practice?**
   Model answer: when applied dogmatically without genuine anticipated complexity or variation to justify it — creating an interface for a class that has had, and will realistically continue to have, only ONE implementation adds indirection without benefit; splitting genuinely cohesive logic (that always changes together) into many artificially separate classes just to "follow SRP" adds ceremony without achieving SRP's actual goal of isolating independent reasons to change.

9. **Explain how the Strategy design pattern directly implements the Open/Closed Principle.**
   Model answer: the Strategy pattern defines a common interface for a family of interchangeable algorithms/behaviors (e.g., different payment methods), with each concrete strategy implemented as a separate class; adding a new strategy means writing a new class implementing the shared interface, requiring ZERO modification to the existing code that uses strategies polymorphically — directly satisfying OCP's "open for extension, closed for modification."

10. **How would you identify a Single Responsibility Principle violation in an existing, unfamiliar codebase?**
    Model answer: look for classes with a large number of unrelated public methods, or classes that appear in the change history of many unrelated feature commits/pull requests (change-coupling analysis) — if a single class's change history shows it being modified for entirely unrelated reasons (a UI formatting tweak, then separately a business rule change, then separately a database schema adjustment), that's a strong signal it's handling multiple, independent responsibilities that should likely be separated.

11. **What is the practical difference between the Liskov Substitution Principle and simply having an inheritance relationship that "makes sense" conceptually?**
    Model answer: a conceptual "is-a" relationship (a Square is-a Rectangle, geometrically) doesn't guarantee LSP compliance — LSP requires that the subtype genuinely preserve the base type's BEHAVIORAL contract (preconditions can't be strengthened, postconditions/invariants can't be weakened, exception behavior must remain consistent with what callers expect); a relationship can be conceptually valid while still violating LSP if the subtype's actual runtime behavior surprises code written against the base type's established contract.

12. **Design a logging system that satisfies Open/Closed and Dependency Inversion simultaneously.**
    Model answer: define an abstract Logger interface with a log(message) method; implement concrete loggers (ConsoleLogger, FileLogger, RemoteLogger) each satisfying this interface; have application code depend only on the abstract Logger interface (injected via dependency injection), never a concrete logger directly — this satisfies Dependency Inversion (application code depends on the abstraction, not a concrete implementation) and Open/Closed simultaneously (adding a new logging destination, like a CloudLogger, requires writing only a new class, with zero modification to any existing application code that logs messages).
`,

  "coding-questions": `
### 1. Refactor a Single Responsibility Principle violation

~~~python
# BEFORE — a class with multiple, unrelated responsibilities
class UserManager:
    def create_user(self, data):
        -- validation, database save, AND email sending, all bundled together
        if not data.get("email"):
            raise ValueError("Email required")
        -- save to database
        -- send welcome email
        pass

# AFTER — separated, cohesive responsibilities
class UserValidator:
    def validate(self, data):
        if not data.get("email"):
            raise ValueError("Email required")

class UserRepository:
    def save(self, user):
        pass  -- database save logic

class WelcomeEmailSender:
    def send(self, user):
        pass  -- email sending logic

class UserService:
    def __init__(self, validator, repository, email_sender):
        self.validator, self.repository, self.email_sender = validator, repository, email_sender
    def create_user(self, data):
        self.validator.validate(data)
        user = self.repository.save(data)
        self.email_sender.send(user)
        return user
# Follow-up: why does UserService itself still have a single,
# cohesive responsibility (ORCHESTRATING the user creation workflow)
# even though it depends on three other classes, rather than this
# being itself an SRP violation?
~~~

### 2. Fix a Liskov Substitution Principle violation

~~~python
# BEFORE — violates LSP: Ostrich can't actually fly, but inherits fly()
class Bird:
    def fly(self):
        return "Flying"

class Ostrich(Bird):
    def fly(self):
        raise NotImplementedError("Ostriches can't fly!")   -- breaks callers expecting fly() to work

# AFTER — restructure the hierarchy around genuine shared behavior
class Bird:
    def move(self):
        raise NotImplementedError

class FlyingBird(Bird):
    def move(self):
        return "Flying"

class Ostrich(Bird):
    def move(self):
        return "Running"   -- genuinely honors the Bird contract, no broken expectations
# Follow-up: why does restructuring around "move" (a behavior EVERY
# bird genuinely has, even if implemented differently) rather than
# "fly" (a behavior NOT every bird has) fix the LSP violation, and
# what general lesson does this illustrate about designing base
# class contracts?
~~~

### 3. Apply Dependency Inversion to make a class testable

~~~python
# BEFORE — tightly coupled to a concrete, real database implementation
class ReportGenerator:
    def __init__(self):
        self.db = PostgresConnection()   -- hardcoded, concrete dependency
    def generate(self):
        data = self.db.query("SELECT * FROM sales")
        return format_report(data)

# AFTER — depends on an abstraction, injected from outside
class DataSource:
    def query(self, sql):
        raise NotImplementedError

class ReportGenerator:
    def __init__(self, data_source: DataSource):
        self.data_source = data_source
    def generate(self):
        data = self.data_source.query("SELECT * FROM sales")
        return format_report(data)

class FakeDataSource(DataSource):
    def query(self, sql):
        return [{"amount": 100}, {"amount": 200}]   -- deterministic test data
# Follow-up: why does this refactoring make ReportGenerator testable
# WITHOUT requiring a real PostgreSQL database to be running during
# tests, and why is that specifically valuable for test suite speed
# and reliability?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Identify and fix an SRP violation
Given a deliberately over-bundled class (handling validation, persistence, and notification together), refactor it into separate, cohesive classes following SRP. Deliverable: before/after code with a written explanation of the specific "reasons to change" that were separated. Skills exercised: SRP identification and refactoring.

### Lab 2 (Intermediate): Design an OCP-compliant discount/pricing system
Design a pricing/discount system where new discount types can be added by writing a new class, with zero modification to existing, tested pricing logic — then verify this by actually adding a new discount type and confirming no existing code changed. Deliverable: a working extensible system with a demonstrated extension. Skills exercised: OCP application via polymorphism.

### Lab 3 (Advanced): Detect and fix an LSP violation
Given a deliberately LSP-violating class hierarchy (e.g., the classic Square/Rectangle or Ostrich/Bird examples), write a test suite that detects the violation, then refactor the hierarchy to genuinely satisfy LSP. Deliverable: a failing test demonstrating the violation, followed by a passing test after the fix. Skills exercised: LSP verification and hierarchy redesign.

### Lab 4 (Production): Apply Dependency Inversion to make a class fully unit-testable
Given a class tightly coupled to a real external dependency (a database, an HTTP client), refactor it to depend on an abstraction, write a fake test-double implementation, and demonstrate a fast, isolated unit test suite that requires no real external service. Deliverable: a refactored, fully-testable class with a passing test suite requiring zero real external dependencies. Skills exercised: DIP application, test-double design.
`,

  "real-projects": `
### 1. A notification system supporting multiple channels
Engineering requirements: an abstract Notifier interface with concrete implementations (email, SMS, push notification, Slack), with high-level business logic depending only on the abstraction — directly applying OCP (new channels added without modifying existing code) and DIP (business logic decoupled from specific notification mechanics) together.

### 2. A refactoring initiative for a legacy, tightly-coupled codebase
Engineering requirements: systematically identifying SRP violations (classes with too many responsibilities) and DIP violations (business logic tightly coupled to concrete database/API clients) in an existing codebase, and incrementally refactoring toward better separation, measured by improved test suite speed/reliability and reduced change-coupling between unrelated features.

### 3. A plugin architecture for a data processing pipeline
Engineering requirements: an abstract PipelineStage interface (satisfying Interface Segregation with focused, role-appropriate methods) letting new processing steps be added as independent, testable classes, with the overall pipeline orchestration depending only on the abstract interface — directly applying OCP, ISP, and DIP together in a genuinely extensible architecture.
`,

  "case-studies": `
### The Square/Rectangle problem's enduring pedagogical value
The classic Square-inheriting-from-Rectangle example, despite being a small, seemingly academic illustration, has remained one of the most widely-taught, effective ways to demonstrate that a conceptually valid "is-a" relationship doesn't guarantee behavioral substitutability — it continues appearing in software engineering courses and interviews decades after Liskov's original formulation, precisely because it concretely illustrates a subtlety (behavioral contracts matter, not just conceptual hierarchy) that's easy to state abstractly but much more memorable through a specific, concrete counter-example. Lesson: a small, well-chosen concrete example can teach a subtle principle more effectively and durably than an abstract definition alone.

### Uncle Bob's consolidation of independently-discovered principles into "SOLID"
The five SOLID principles were largely discovered and articulated independently by different practitioners (Liskov's substitution principle, Meyer's Open/Closed principle) before Robert Martin consolidated them into a coherent, jointly-taught framework, with Michael Feathers later coining the memorable "SOLID" acronym — illustrating how genuinely valuable engineering wisdom can emerge independently from multiple practitioners' real experience, and how consolidating and naming such wisdom coherently (giving it a memorable acronym) can dramatically increase its adoption and teachability, even without changing the underlying substance. Lesson: the PRESENTATION and memorability of genuinely valuable engineering knowledge matters significantly for its actual industry-wide adoption, beyond the knowledge's inherent correctness alone.

### The industry's ongoing correction against SOLID over-application
Following widespread SOLID adoption in the 2000s-2010s, a notable, healthy industry counter-discussion emerged specifically warning against dogmatic over-application — excessive interfaces for hypothetical future flexibility, over-engineered dependency injection frameworks for simple code — illustrating a recurring pattern where a genuinely valuable principle, once widely adopted, requires a subsequent corrective wave of "apply this judiciously, not universally" guidance to avoid becoming its own anti-pattern. Lesson: even genuinely well-established, valuable engineering principles benefit from periodic, honest reassessment of whether they're being applied where they genuinely add value, rather than mechanically everywhere.
`,

  comparisons: `
| Principle | What It Prevents | Typical Fix |
|-----------|-------------------|--------------|
| Single Responsibility | A class breaking for unrelated reasons, tangled maintenance | Split into cohesive, independently-changeable classes |
| Open/Closed | Modifying existing, tested code every time new behavior is needed | Polymorphism: new behavior via new classes, not modified existing ones |
| Liskov Substitution | Subtly broken polymorphic code when a subtype doesn't honor its contract | Verify/fix preconditions, postconditions, exception behavior; reconsider the hierarchy if needed |
| Interface Segregation | Classes forced to implement irrelevant methods | Split into smaller, role-based interfaces |
| Dependency Inversion | High-level logic tightly coupled to low-level details, hard to test/change | Depend on shared abstractions; inject concrete implementations from outside |

**How seniors choose**: apply SRP and DIP as the most consistently high-value, broadly-applicable principles; apply OCP specifically where genuine, anticipated variation exists (not speculatively); verify LSP explicitly for any inheritance relationship rather than assuming it; apply ISP when an interface genuinely serves multiple, distinct client roles with different needs — judging each principle's application against genuine complexity, never applying any of them dogmatically by default.
`,

  "related-technologies": `
- **OOP** — the foundational paradigm SOLID formalizes disciplined application of; covered immediately before this skill.
- **Design Patterns** — a catalog of proven, reusable solutions, many of which directly implement specific SOLID principles (Strategy for OCP, Factory/Repository for DIP); covered immediately after this skill.
- **FastAPI**/**Spring Boot** — production frameworks whose dependency injection systems are direct, pervasive applications of the Dependency Inversion Principle.
- **Django** — its app/model/view structure encourages SRP-aligned organization.

Learning path: **OOP** → this page → **Design Patterns**, completing the natural progression from OOP fundamentals through disciplined principles to proven, catalogued solutions.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- SOLID remains a standard, widely-taught part of software engineering education and technical interview preparation, alongside continued healthy industry discussion of judicious versus dogmatic application.
- Continued emphasis on "apply SOLID where genuine complexity warrants it, not universally" as mature, mainstream guidance, correcting earlier tendencies toward over-application.
- Growing use of lighter-weight dependency injection approaches (simple constructor injection, rather than heavy DI frameworks) for applying Dependency Inversion without disproportionate configuration ceremony, particularly in dynamically-typed languages like Python.
`,

  "future-roadmap": `
Where SOLID is heading, and what's worth betting career time on:

- **Continued relevance as a foundational design discipline**, likely remaining a standard part of software engineering education and practice for the foreseeable future, given its practical, hard-won origins.
- **Continued refinement of "judicious application" guidance**, correcting earlier over-application tendencies with a more mature, complexity-justified approach to each principle.
- **Growing integration with automated tooling** (static analysis flagging potential SRP/ISP violations, coupling metrics) making SOLID violations more visible and actionable during code review.
- **What to bet on**: deeply understanding WHY each principle exists (the specific failure mode it prevents) rather than memorizing the acronym alone — this judgment transfers directly to recognizing genuine violations in any codebase and knowing when a principle's application is warranted versus premature, a far more durable skill than rote recitation of the five names.
`,

  "cheat-sheet": `
~~~python
# ---- S: Single Responsibility -- ONE reason to change ----
# WRONG: ReportManager does formatting AND email sending
# RIGHT: ReportGenerator + EmailSender, separate classes

# ---- O: Open/Closed -- extend via NEW code, don't modify EXISTING code ----
class DiscountStrategy:
    def calculate(self, amount): raise NotImplementedError
class VIPDiscount(DiscountStrategy):   # ADD this -- touch nothing else
    def calculate(self, amount): return amount * 0.15
~~~

~~~python
# ---- L: Liskov Substitution -- subtypes must be SAFELY substitutable ----
# The classic trap: Square(Rectangle) with linked width/height setters
# BREAKS callers that expect Rectangle's independent width/height behavior.
# Check: preconditions can't be STRENGTHENED, postconditions/invariants
# can't be WEAKENED, exception behavior must stay consistent.

# ---- I: Interface Segregation -- don't force irrelevant methods ----
# WRONG: one bloated Worker interface with work() AND eat()
# RIGHT: separate Workable and Eatable -- implement only what applies

# ---- D: Dependency Inversion -- depend on ABSTRACTIONS, not concretions ----
class Notifier:
    def send(self, to, msg): raise NotImplementedError
class OrderProcessor:
    def __init__(self, notifier: Notifier):   # injected, not hardcoded
        self.notifier = notifier
~~~

~~~
# ---- Review checklist (walk through in order) ----
# 1. More than one reason to change? -> split (SRP)
# 2. New behavior needs modifying existing code? -> polymorphism (OCP)
# 3. Do subtypes genuinely honor the base contract? -> verify (LSP)
# 4. Interface forcing irrelevant methods? -> split (ISP)
# 5. High-level logic coupled to a concrete low-level detail? -> abstract it (DIP)

# ---- THE #1 anti-pattern: dogmatic over-application ----
# An interface with only ONE implementation, ever, "just in case" = wasted indirection
# Splitting cohesive logic into 5 tiny classes that always change together = wasted ceremony
# Apply SOLID where GENUINE complexity/variation warrants it -- not universally

# ---- Design pattern connections ----
# Strategy pattern  -> implements OCP directly
# Factory/Repository -> support DIP directly
# Decorator pattern  -> implements OCP (add behavior by wrapping, not modifying)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| S -- Single Responsibility? | A class should have only ONE reason to change. |
| O -- Open/Closed? | Open for EXTENSION (new classes), closed for MODIFICATION (existing tested code). |
| L -- Liskov Substitution? | Subtypes must be safely substitutable for their base type without breaking correctness. |
| I -- Interface Segregation? | Clients shouldn't be forced to depend on interface methods they don't use. |
| D -- Dependency Inversion? | High-level AND low-level modules should both depend on shared ABSTRACTIONS. |
| Classic LSP violation example? | Square inheriting from Rectangle -- linked setters break callers' expectations. |
| How does DIP enable fast testing? | High-level code depends on an interface -- inject a fake implementation instead of a real dependency. |
| What pattern directly implements OCP? | Strategy pattern -- new algorithms via new classes, zero changes to existing code. |
| #1 SOLID anti-pattern? | Dogmatic over-application -- interfaces "just in case" with only ever one implementation. |
| SRP's real test? | Multiple INDEPENDENT reasons/stakeholders to change -- not "minimize methods per class." |
| LSP checks beyond method signatures? | Preconditions, postconditions, invariants, AND exception behavior. |
| SOLID's relationship to OOP? | SOLID formalizes HOW to apply OOP well -- classes/inheritance alone don't guarantee good design. |
`,

  mcqs: `
1. What does the Single Responsibility Principle state?
   A) A class should do as much as possible  B) A class should have only one reason to change  C) A class should have exactly one method  D) A class should never be modified
   **Answer: B** — bundling multiple, unrelated responsibilities into one class means unrelated changes can unexpectedly break each other.

2. What does "open for extension, closed for modification" mean?
   A) Classes should never be extended  B) New behavior should be addable via new code, without modifying existing, tested code  C) All classes must be abstract  D) Modification is always preferred over extension
   **Answer: B** — this is the Open/Closed Principle, typically achieved via polymorphism.

3. Why does the classic Square-inherits-from-Rectangle example violate the Liskov Substitution Principle?
   A) A square is not geometrically a rectangle  B) Square's setters have surprising side effects (linked width/height) that break callers expecting Rectangle's independent behavior  C) Squares can't have an area method  D) Rectangle is an abstract class
   **Answer: B** — LSP requires genuine behavioral substitutability, not just conceptual "is-a" plausibility.

4. What does the Interface Segregation Principle recommend?
   A) All classes should implement one giant interface  B) Clients shouldn't be forced to depend on interface methods they don't use — prefer smaller, focused interfaces  C) Interfaces should never be used  D) Every method needs its own interface
   **Answer: B** — bloated "kitchen sink" interfaces force irrelevant implementations.

5. How does the Dependency Inversion Principle improve testability?
   A) It removes the need for tests  B) High-level logic depends only on an abstraction, letting tests inject a fast fake implementation instead of a real dependency  C) It makes all code synchronous  D) It requires a specific testing framework
   **Answer: B** — this decoupling is what enables fast, isolated unit tests of business logic.

6. What is a common SOLID over-application anti-pattern?
   A) Never using classes  B) Creating an interface "just in case" for a class that has, and will realistically continue to have, only one implementation  C) Writing too few interfaces  D) Avoiding inheritance entirely
   **Answer: B** — SOLID principles should be applied where genuine anticipated complexity warrants them, not dogmatically everywhere.
`,

  "revision-notes": `
SOLID is an acronym for five object-oriented design principles — formalized primarily by Robert C. Martin, drawing on Barbara Liskov's and Bertrand Meyer's earlier, independently-articulated ideas — that provide disciplined judgment for applying the **OOP** skill's core concepts well, rather than merely using classes and inheritance syntactically. Each principle addresses a specific, recurring failure mode observed repeatedly in real production object-oriented codebases.

SINGLE RESPONSIBILITY PRINCIPLE (SRP): a class should have only ONE reason to change — the practical test is identifying whether MULTIPLE, genuinely independent reasons/stakeholders could each require modifying a given class; if so, split it into cohesive, independently-changeable responsibilities. OPEN/CLOSED PRINCIPLE (OCP): software should be open for EXTENSION (adding new behavior via new classes/implementations) but closed for MODIFICATION (existing, tested code shouldn't need to change) — typically achieved through polymorphism combined with dependency injection, letting new variants (a new discount type, a new payment method) be added without touching existing, working code.

LISKOV SUBSTITUTION PRINCIPLE (LSP): subtypes must be safely substitutable for their base type without breaking correctness — this requires genuine BEHAVIORAL contract preservation (preconditions cannot be strengthened, postconditions/invariants cannot be weakened, exception behavior must remain consistent), not merely a conceptually plausible "is-a" relationship. The classic Square-inheriting-from-Rectangle example illustrates this precisely: even though a square IS geometrically a rectangle, Square's linked width/height setters violate Rectangle callers' reasonable behavioral expectations, breaking LSP despite the intuitively valid inheritance relationship.

INTERFACE SEGREGATION PRINCIPLE (ISP): clients shouldn't be forced to depend on (or implement) interface methods they don't actually use — prefer smaller, focused, role-based interfaces (Workable, Eatable) over broad, "kitchen sink" ones that force irrelevant, meaningless implementations. DEPENDENCY INVERSION PRINCIPLE (DIP): high-level modules shouldn't depend directly on low-level modules — both should depend on a shared ABSTRACTION, with the concrete low-level implementation INJECTED from outside (dependency injection) rather than constructed internally by the high-level class. This is precisely what enables fast, isolated unit testing: high-level business logic depending only on an interface can be tested with a fast, deterministic fake implementation instead of a real, slow, or hard-to-control external dependency (a real database, a real email service).

A genuinely important, senior-level nuance emphasized throughout this page: SOLID principles are JUDGMENT-REQUIRING HEURISTICS for managing genuine, anticipated complexity, NOT a rigid checklist to maximize universally. Common, well-recognized over-application anti-patterns include creating interfaces "just in case" for classes that have (and will realistically continue to have) only one implementation, and splitting genuinely cohesive logic (that always changes together) into artificially many tiny classes just to superficially "follow SRP." A senior engineer applies each principle specifically where genuine variation, testing needs, or independent-change patterns actually justify the added structure, resisting both under-application (tangled, hard-to-test code) and dogmatic over-application (premature, speculative abstraction) with equal discipline.

SOLID principles connect directly to the **Design Patterns** skill: many well-known patterns are, in effect, specific, proven, named implementations of SOLID applied to recurring problem shapes — the Strategy pattern directly implements OCP (interchangeable algorithms via new classes), while the Factory and Repository patterns directly support DIP (client code depending on an abstract interface rather than concrete construction/access details). At an architectural scale, Dependency Inversion consistently applied produces "hexagonal" or "clean" architecture, where core business logic depends on nothing external, with all databases, APIs, and UI frameworks implementing abstract interfaces the business logic itself defines.
`,

  "learning-roadmap": `
**Week 1 — Single Responsibility and Open/Closed**: identifying multiple responsibilities in existing classes, and designing extensible systems via polymorphism. Milestone: refactor a deliberately over-bundled class following SRP (Lab 1).

**Week 2 — Liskov Substitution**: understanding behavioral contracts (preconditions, postconditions, invariants, exceptions) beyond superficial "is-a" relationships. Milestone: detect and fix an LSP violation with an explicit test suite proving the fix (Lab 3).

**Week 3 — Interface Segregation and Dependency Inversion**: designing focused, role-based interfaces, and applying dependency injection for testability. Milestone: refactor a tightly-coupled class to depend on an abstraction, with a fully isolated unit test suite (Lab 4).

**Week 4 — OCP application in depth**: building a genuinely extensible system where new behavior requires zero modification to existing code. Milestone: design and demonstrate an OCP-compliant pricing/discount system (Lab 2).

**Week 5 — Recognizing over-application and applying judgment**: identifying signs of dogmatic SOLID application in existing code, and practicing the judgment of when each principle's flexibility is genuinely warranted. Milestone: review a codebase (real or provided) and document both genuine SOLID violations AND instances of over-application.

**Week 6 — Connecting to Design Patterns**: recognizing which specific design patterns directly implement which SOLID principles, previewing the next skill. Milestone: map at least five design patterns to the specific SOLID principle(s) each one primarily satisfies.

Next platform skill once this roadmap is complete: **Design Patterns**, the natural continuation cataloging proven, reusable solutions built directly on these principles.
`,

  "official-docs": `
- **Robert C. Martin's original articles on the SOLID principles** (available via his "Clean Coder" blog and writings) — the primary, authoritative source for the principles as consolidated and popularized.
- **Barbara Liskov's original 1988 keynote and subsequent formal papers** on data abstraction and subtyping — the foundational source for the Liskov Substitution Principle specifically.
- **Bertrand Meyer's "Object-Oriented Software Construction"** — the original formalization of the Open/Closed Principle.
`,

  books: `
- **"Agile Software Development, Principles, Patterns, and Practices" — Robert C. Martin** — the primary, widely-read source presenting all five SOLID principles together in a coherent, practical form.
- **"Clean Code" — Robert C. Martin** — covers class design principles broadly, directly complementing SOLID with practical coding discipline.
- **"Clean Architecture" — Robert C. Martin** — extends Dependency Inversion to an architectural scale (hexagonal/clean architecture), directly relevant to this page's Advanced Concepts.
- **"Design Patterns: Elements of Reusable Object-Oriented Software" — the Gang of Four** — covers proven patterns, many of which directly implement SOLID principles, covered in depth in the **Design Patterns** skill.
`,

  blogs: `
- **Martin Fowler's website (martinfowler.com)** — extensive, widely-referenced writing on OOP design principles, refactoring, and architectural patterns.
- **Various "SOLID over-application" critical blog posts** across the software engineering community, providing important balance to purely promotional SOLID content.
- **Company engineering blogs** discussing specific SOLID-motivated refactoring efforts and lessons learned from real production codebases.
`,

  "research-papers": `
- **Liskov, B. — "Data Abstraction and Hierarchy"** (1988, keynote address, later formalized in papers with Jeannette Wing) — the foundational source for the Liskov Substitution Principle.
- **Meyer, B. — "Object-Oriented Software Construction"** (1988, book, formalizing Open/Closed) — foundational, though presented as a book rather than a standalone paper.
- See the **Design Patterns** skill's own research references for the Gang of Four's foundational, closely-related cataloging work.
`,

  videos: `
- **Robert C. Martin's ("Uncle Bob") own conference talks on SOLID principles** — direct, widely-viewed presentations from the principles' primary popularizer.
- **Various "SOLID Principles Explained" course series** covering each principle with concrete, practical examples.
- **Conference talks specifically discussing SOLID over-application and pragmatic judgment** — providing important balance and real-world nuance beyond introductory material.
`,

  "github-repos": `
- **Various "SOLID principles examples" repositories** across many languages, illustrating each principle with before/after refactoring examples.
- **Refactoring.guru's repository/website** — extensive, well-illustrated coverage connecting SOLID principles to specific design patterns.
- Well-designed open-source framework codebases (FastAPI's, Django's own source) for studying genuine, production-grade SOLID application directly.
`,

  "practice-problems": `
Ordered by skill focus:

1. **SRP identification**: given a class with multiple bundled responsibilities, identify the distinct "reasons to change" and refactor into separate classes.
2. **OCP application**: design a system where a new variant (a new shape type, a new payment method) can be added via a new class with zero modification to existing code.
3. **LSP verification**: given a class hierarchy, write a shared behavioral test suite and run it against every subclass to explicitly verify LSP compliance.
4. **ISP refactoring**: given a bloated interface forcing irrelevant method implementations, split it into smaller, role-based interfaces.
5. **DIP application**: refactor a class tightly coupled to a concrete external dependency to depend on an abstraction, then write a fully isolated unit test using a fake implementation.
6. **External practice sets**: Refactoring.guru's SOLID-principle-focused exercises for structured, guided practice connecting principles to concrete patterns.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Principles["The Five SOLID Principles"]
        SRP["Single Responsibility\n(one reason to change)"]
        OCP["Open/Closed\n(extend, don't modify)"]
        LSP["Liskov Substitution\n(safe substitutability)"]
        ISP["Interface Segregation\n(focused interfaces)"]
        DIP["Dependency Inversion\n(depend on abstractions)"]
    end
    subgraph Patterns["Related Design Patterns"]
        Strategy["Strategy Pattern"]
        Factory["Factory Pattern"]
        Repository["Repository Pattern"]
        Decorator["Decorator Pattern"]
    end
    subgraph Architecture["Architectural Application"]
        Hexagonal["Hexagonal / Clean Architecture"]
    end
    OCP --> Strategy
    OCP --> Decorator
    DIP --> Factory
    DIP --> Repository
    DIP --> Hexagonal
    SRP --> Hexagonal
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((SOLID Principles))
    Foundations
      Overview
      History Liskov Meyer Martin
      Why it exists
      Problem it solves
    Single Responsibility
      One reason to change
      Identifying stakeholders
    Open Closed
      Extension not modification
      Polymorphism plus injection
    Liskov Substitution
      Behavioral contracts
      Square Rectangle example
      Preconditions postconditions
    Interface Segregation
      Focused role based interfaces
      Avoiding kitchen sink
    Dependency Inversion
      Depend on abstractions
      Dependency injection
      Testability enablement
    Judgment
      Recognizing over application
      When flexibility is warranted
    Design Pattern Connections
      Strategy implements OCP
      Factory Repository support DIP
    Architecture
      Hexagonal clean architecture
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default solid;
