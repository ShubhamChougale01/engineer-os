import type { SkillContent } from "../types";

/**
 * OOP — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const oop: SkillContent = {
  overview: `
Object-Oriented Programming (OOP) is a programming paradigm organizing software around **objects** — bundles of data (attributes/state) and the behavior (methods) that operates on that data — rather than around a sequence of standalone functions operating on separate data structures. OOP's four pillars (encapsulation, abstraction, inheritance, and polymorphism) provide a vocabulary and set of techniques for modeling complex real-world domains and managing complexity in large codebases, directly underlying the class-based design used across virtually every backend framework, ORM, and API library covered elsewhere on this platform.

For an AI engineer, OOP fluency is essential for reading and contributing to the overwhelming majority of production codebases — Django's models, FastAPI's dependency injection classes, PyTorch's nn.Module-based neural network definitions, and LangChain's chain/agent abstractions are all fundamentally object-oriented designs. Understanding OOP deeply also directly sets up the **SOLID Principles** and **Design Patterns** skills (covered alongside this one), which formalize HOW to apply OOP well, versus merely using classes syntactically without genuine structural benefit.

Key characteristics: **encapsulation**, bundling data and the methods that operate on it together, hiding internal implementation details behind a well-defined public interface; **abstraction**, exposing only the essential features of an object while hiding unnecessary complexity; **inheritance**, letting a class derive shared structure and behavior from a parent class, expressing "is-a" relationships; and **polymorphism**, letting different classes be used interchangeably through a shared interface, with each providing its own specific behavior for the same method call.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1962–1967 | **Simula** (developed by Ole-Johan Dahl and Kristen Nygaard in Norway) introduces the foundational concepts of classes and objects, originally to model discrete-event simulations, establishing OOP's conceptual origin |
| 1972 | **Smalltalk** (developed at Xerox PARC by Alan Kay and others) becomes the first language built around OOP as its CENTRAL, pervasive paradigm (rather than an add-on feature), coining the term "object-oriented programming" itself |
| 1979–1983 | **Bjarne Stroustrup** develops **C with Classes**, later renamed **C++**, bringing OOP to a systems-programming audience by adding classes atop the widely-used C language |
| 1995 | **Java** is released by Sun Microsystems, deliberately designed as a purely object-oriented language (with only primitive types as an exception) — becoming enormously influential in popularizing OOP as the dominant enterprise programming paradigm through the following decades |
| 1995 | The **"Gang of Four" Design Patterns book** (covered in its own skill) is published, cataloging proven, reusable OOP solutions to recurring design problems, cementing OOP's central role in software engineering education and practice |
| 2000s | **Python** and other multi-paradigm languages gain popularity while supporting OOP as one of several available styles, rather than enforcing it as the only approach — reflecting a broader industry recognition that OOP, while powerful, isn't universally the best fit for every problem |
| 2010s–2020s | Continued healthy coexistence of OOP with functional programming influences (even within traditionally OOP-centric languages), and ongoing industry debate about OOP's appropriate scope versus its historical over-application |

OOP's historical trajectory — from a niche simulation-modeling technique (Simula) to the dominant enterprise paradigm (Java's rise) to a widely-used but no longer universally-dogmatic approach (modern multi-paradigm languages) — reflects a broader, healthy maturation: OOP is now understood as a genuinely powerful tool for specific kinds of problems (modeling stateful entities with complex behavior) rather than a mandatory approach for all software.
`,

  "why-it-exists": `
OOP exists because, as software systems grew larger and more complex through the 1960s-70s, the previously dominant procedural programming style (a global sequence of functions operating on shared, often globally-accessible data) became genuinely difficult to reason about and maintain at scale — any function could modify any piece of shared state, making it extremely hard to predict a program's behavior or safely change one part without unexpectedly breaking another.

Simula's original creators, Dahl and Nygaard, were specifically trying to model discrete-event simulations (systems with many independent, interacting entities, each with its own state and behavior — ships in a harbor simulation, in Simula's original motivating example) — procedural programming's global-function, global-data model was a poor conceptual fit for this kind of problem, where the natural unit of thought is "an individual entity with its own state and behavior," not "a sequence of operations on shared data."

OOP's core insight — bundling data and the behavior that operates on it together into a single unit (an object), and hiding that object's internal state behind a controlled interface (encapsulation) — directly addresses procedural programming's core weakness: by preventing arbitrary external code from directly manipulating an object's internal state, and instead forcing interaction through well-defined methods, OOP makes it dramatically easier to reason about how a piece of state can actually change, since the possible causes are limited to that object's own methods rather than "anywhere in the entire program."
`,

  "problem-it-solves": `
OOP solves the **"how do we model complex systems made of many interacting, stateful entities, in a way that keeps each entity's internal complexity contained and prevents uncontrolled, hard-to-trace interactions between different parts of a large codebase"** problem.

Concretely, OOP provides:

- **Encapsulation**, bundling an object's data with the methods that operate on it, and restricting direct external access to internal state — this means a bug affecting a specific piece of data can only originate from that object's own methods, not from arbitrary code anywhere in the program, dramatically narrowing the search space when debugging.
- **Abstraction**, letting client code interact with an object through a simplified, well-defined interface without needing to understand (or be affected by changes to) its internal implementation — a genuinely valuable separation that lets internal implementations evolve without breaking external code that depends only on the stable interface.
- **Inheritance**, letting related classes share common structure and behavior, avoiding duplicated code across classes that are conceptually variations of the same underlying concept.
- **Polymorphism**, letting code work with objects of different concrete types through a shared interface, without needing to know which specific type it's dealing with at compile time — enabling flexible, extensible designs where new types can be added without modifying existing code that consumes them through the shared interface.
- **A natural mapping to many real-world domains**: modeling a user, an order, a bank account, or a game character as an object with its own state and behavior often maps intuitively onto how humans already conceptualize these entities.

What OOP does **not** solve, or solves with a real tradeoff: OOP can be genuinely over-applied, wrapping simple, stateless data transformations in unnecessary class ceremony where a plain function would be simpler and clearer (a real, historically common critique, particularly of certain enterprise Java codebases); deep inheritance hierarchies can become genuinely brittle and hard to reason about, motivating the "composition over inheritance" principle covered in Best Practices; and OOP doesn't inherently prevent poor design — the **SOLID Principles** and **Design Patterns** skills exist specifically because using classes syntactically doesn't automatically produce a well-structured, maintainable design.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain and correctly apply the four pillars of OOP: encapsulation, abstraction, inheritance, and polymorphism.
2. Design classes with appropriate encapsulation, exposing a clean public interface while hiding implementation details.
3. Use inheritance appropriately to model genuine "is-a" relationships, recognizing when composition is the better fit instead.
4. Implement and reason about polymorphism, including method overriding and duck typing.
5. Distinguish between class-level and instance-level attributes/methods, and use static/class methods appropriately.
6. Recognize and avoid common OOP anti-patterns: deep, brittle inheritance hierarchies, and unnecessary class ceremony around simple data transformations.
7. Explain the difference between composition and inheritance, and correctly apply "favor composition over inheritance."
8. Read and reason about object-oriented codebases built on frameworks like Django, PyTorch, or FastAPI.
9. Answer senior-level interview questions on OOP design tradeoffs and their relationship to SOLID principles and design patterns.
`,

  prerequisites: `
- **Required**: basic programming fundamentals in any language (variables, functions, control flow).
- **Very helpful**: the **Data Structures** skill, since classes are commonly used to encapsulate and manage the structures covered there.
- **Helpful**: familiarity with at least one OOP-supporting language (**Python**, **Java**, or similar) for concrete syntax context, though this page's concepts are language-agnostic.

Dependency links: **Data Structures**/**Algorithms** → this page → **SOLID Principles** → **Design Patterns**, the natural progression from OOP fundamentals to disciplined, well-structured object-oriented design.
`,

  "beginner-concepts": `
### Classes and objects

~~~python
class Dog:
    def __init__(self, name, breed):
        self.name = name       -- instance attribute
        self.breed = breed

    def bark(self):             -- instance method
        return self.name + " says Woof!"

rex = Dog("Rex", "Labrador")   -- rex is an INSTANCE (object) of the Dog CLASS
print(rex.bark())               -- "Rex says Woof!"
~~~

A class is a blueprint defining what data (attributes) and behavior (methods) its instances will have; an object (or instance) is a specific, concrete realization of that blueprint — many different Dog objects can exist, each with its own name and breed, but all sharing the same bark() behavior defined once in the class.

### Encapsulation basics

~~~python
class BankAccount:
    def __init__(self, initial_balance):
        self._balance = initial_balance   -- convention: leading underscore signals "internal"

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._balance += amount

    def get_balance(self):
        return self._balance
~~~

Encapsulation means controlling access to an object's internal state through methods (deposit, get_balance) rather than letting external code directly manipulate _balance — this lets the class ENFORCE its own invariants (like "deposits must be positive") consistently, no matter where in the codebase a deposit happens.

### Basic inheritance

~~~python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        raise NotImplementedError

class Dog(Animal):        -- Dog IS-A Animal
    def speak(self):
        return self.name + " says Woof!"

class Cat(Animal):        -- Cat IS-A Animal
    def speak(self):
        return self.name + " says Meow!"
~~~

Inheritance lets Dog and Cat share the common structure defined in Animal (the name attribute and constructor) while each providing its own specific implementation of speak() — expressing a genuine "is-a" relationship (a Dog is a kind of Animal).

### Basic polymorphism

~~~python
animals = [Dog("Rex"), Cat("Whiskers")]
for animal in animals:
    print(animal.speak())   -- calls the RIGHT speak() for each object's actual type,
                              -- without the calling code needing to know which type it is
~~~

Polymorphism lets the same code (the for loop calling animal.speak()) work correctly with objects of different concrete types, each responding with its own specific behavior — this is what lets you write code against a general interface (Animal) rather than needing separate code paths for every specific subtype.
`,

  "intermediate-concepts": `
### Abstraction via abstract base classes

~~~python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width, self.height = width, height
    def area(self):
        return self.width * self.height
~~~

An abstract base class defines a contract (area() must be implemented) without providing a complete implementation itself, and cannot be instantiated directly — this forces every concrete subclass to provide its own meaningful implementation, while letting client code depend on the abstract Shape interface rather than any specific concrete shape.

### Class attributes versus instance attributes, and static/class methods

~~~python
class Employee:
    company_name = "Acme Corp"   -- CLASS attribute: shared across ALL instances

    def __init__(self, name):
        self.name = name          -- INSTANCE attribute: unique per instance

    @staticmethod
    def is_valid_name(name):       -- doesn't need self or cls -- a plain utility function
        return len(name) > 0        -- grouped with the class for organizational clarity

    @classmethod
    def from_dict(cls, data):        -- receives the CLASS itself, commonly used for
        return cls(data["name"])      -- alternative constructors
~~~

Class attributes are shared across every instance (changing company_name affects all Employee objects), while instance attributes are unique per object; static methods are utility functions logically grouped with a class but not operating on any specific instance's state; class methods receive the class itself (commonly used for alternative constructors, like building an object from a dictionary or a database row).

### Method overriding and super()

~~~python
class Animal:
    def __init__(self, name):
        self.name = name
    def describe(self):
        return "I am " + self.name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   -- call the PARENT's constructor first
        self.breed = breed
    def describe(self):
        return super().describe() + ", a " + self.breed   -- extend, don't replace entirely
~~~

super() lets a subclass call its parent class's implementation of a method (or constructor), enabling the subclass to EXTEND rather than entirely replace the parent's behavior — a common, important pattern for correctly initializing inherited state.

### Duck typing (particularly relevant in Python)

~~~python
class Duck:
    def make_sound(self):
        return "Quack"

class Person:
    def make_sound(self):
        return "I'm imitating a duck!"

def make_it_quack(thing):
    print(thing.make_sound())   -- works with ANY object that has a make_sound() method,
                                   -- regardless of its actual class or inheritance hierarchy

make_it_quack(Duck())
make_it_quack(Person())
~~~

"Duck typing" (if it walks like a duck and quacks like a duck, it's treated as a duck) means Python code often relies on an object simply HAVING the expected method/attribute, rather than requiring formal inheritance from a specific base class — a more flexible, less rigid form of polymorphism common in dynamically-typed languages.

### Composition as an alternative to inheritance

~~~python
class Engine:
    def start(self):
        return "Engine starting"

class Car:
    def __init__(self):
        self.engine = Engine()   -- Car HAS-A Engine (composition), not IS-A Engine

    def start(self):
        return self.engine.start()
~~~

Composition models a "has-a" relationship (a Car has an Engine) by including an instance of one class as an attribute of another, rather than inheriting from it — often a more flexible design than inheritance, covered in depth in Advanced Concepts and directly connecting to the **Design Patterns** skill.
`,

  "advanced-concepts": `
### Composition over inheritance

~~~python
# WRONG (inheritance for a non-"is-a" relationship) — a FlyingCar
# inheriting from both Car and Airplane creates a fragile, confusing
# hierarchy, especially if Car and Airplane both define conflicting methods

# RIGHT (composition) — a FlyingCar HAS-A car-like driving behavior
# and HAS-A flying behavior, composed together rather than inherited
class FlyingCar:
    def __init__(self):
        self.driving_behavior = CarDrivingBehavior()
        self.flying_behavior = AirplaneFlyingBehavior()

    def drive(self):
        return self.driving_behavior.drive()

    def fly(self):
        return self.flying_behavior.fly()
~~~

"Favor composition over inheritance" is one of the most important, widely-cited OOP design principles — inheritance creates a tight, often brittle coupling between parent and child classes (changes to a parent can unexpectedly break every subclass), while composition creates a looser, more flexible relationship that's easier to change and reason about independently.

### The fragile base class problem

~~~
If a widely-inherited base class's implementation changes -- even in
a way that seems internal/private -- every subclass that happens to
depend (even accidentally, through inheritance's exposure of internal
details) on the OLD behavior can silently break, without the base
class's author necessarily knowing every subclass that exists.
~~~

Deep or widely-used inheritance hierarchies create a genuine long-term maintenance risk: a base class's author often can't know every subclass that will ever be written, making it hard to change the base class safely without risking unexpected breakage somewhere in a large, evolving codebase — a core motivation for composition's looser coupling.

### Multiple inheritance and the diamond problem

~~~python
class A:
    def method(self):
        return "A"

class B(A):
    def method(self):
        return "B"

class C(A):
    def method(self):
        return "C"

class D(B, C):   -- inherits from BOTH B and C, which both inherit from A
    pass

print(D().method())   -- which method() wins? Resolved by Method Resolution Order (MRO)
~~~

Multiple inheritance (a class inheriting from more than one parent) introduces the "diamond problem" — ambiguity about which parent's implementation should be used when multiple ancestors define the same method — languages handle this differently (Python uses a well-defined Method Resolution Order via C3 linearization; some languages, like Java, avoid the ambiguity entirely by disallowing multiple inheritance of implementation, only allowing multiple interface implementation).

### Interfaces versus abstract classes

~~~
Interface: defines a CONTRACT (what methods must exist) with NO
    implementation at all -- purely specifies behavior a class
    must provide
Abstract class: can define a contract (some abstract methods)
    AND provide some shared, concrete implementation that
    subclasses inherit directly
~~~

The distinction matters for design flexibility: a class can implement MULTIPLE interfaces (satisfying multiple contracts) but typically inherits from only one class (in single-inheritance languages) — favoring interfaces for pure contracts and reserving (single) inheritance for genuine shared implementation is a common, disciplined design approach directly connecting to the **SOLID Principles** skill's own Interface Segregation Principle.

### Encapsulation's role in maintaining invariants

~~~python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        self._celsius = (value - 32) * 5 / 9
~~~

Properties (getter/setter methods that look like plain attribute access syntactically) let a class maintain internal invariants (here, storing temperature in a single canonical unit, celsius) while still presenting a natural, convenient interface (fahrenheit) to external code — a genuinely elegant encapsulation technique available in many modern OOP languages.
`,

  "internal-working": `
What happens internally when calling a method on an object, tracing method resolution and dynamic dispatch:

~~~mermaid
sequenceDiagram
    participant Code as Calling code
    participant Object as An object instance
    participant Class as The object's class
    participant Parent as Parent class (if inherited)

    Code->>Object: animal.speak()
    Object->>Class: look up 'speak' in the object's OWN class first
    alt Method found in the object's own class
        Class-->>Object: use THIS implementation
    else Method NOT found in the object's own class
        Class->>Parent: look up 'speak' in the parent class
        Parent-->>Object: use the PARENT's implementation (inherited)
    end
    Object-->>Code: executes the resolved method, returns the result
~~~

1. **A method call is resolved dynamically at runtime**, not fixed at compile time — the object's ACTUAL class (which might be a subclass) determines which specific method implementation runs, even if the calling code only knows about a more general parent type or interface.
2. **Method resolution follows the inheritance chain**: if a method isn't defined directly on an object's own class, the lookup proceeds up through parent classes until a matching implementation is found (or an error is raised if none exists).
3. **This dynamic dispatch is precisely what enables polymorphism**: the SAME line of calling code (animal.speak()) produces different behavior depending on the actual runtime type of the object, without the calling code needing any conditional logic to check "is this a Dog or a Cat."

**Why this matters**: understanding that polymorphism is fundamentally a RUNTIME method resolution mechanism (not a compile-time trick) explains why you can write code against a general interface (Animal) and have it correctly handle new subclasses (a future Bird class) that didn't even exist when the calling code was originally written — as long as the new subclass correctly implements the expected interface.
`,

  architecture: `
A senior engineer thinks about OOP design across several dimensions: choosing inheritance versus composition deliberately based on the actual relationship being modeled, designing clean, minimal public interfaces that hide implementation freedom, and recognizing when OOP's ceremony is genuinely warranted versus when a simpler approach (plain functions, data classes) would serve better.

### The inheritance-versus-composition decision framework

~~~mermaid
flowchart TB
    Q1{"Is this genuinely an\n'IS-A' relationship\n(a Dog IS an Animal)?"}
    Q1 -->|Yes, and the relationship\nis stable and unlikely to\nneed to change at runtime| Inheritance["Consider inheritance"]
    Q1 -->|No, it's more of a\n'HAS-A' relationship,\nor the relationship might\nneed to vary at runtime| Composition["Use composition instead"]
    Inheritance --> Q2{"Is the inheritance\nhierarchy shallow and\nwidely understood?"}
    Q2 -->|No, it's getting deep\nor hard to reason about| Reconsider["Reconsider -- composition\nmight still be the better fit"]
~~~

This decision framework directly reflects "favor composition over inheritance" as a deliberate, reasoned default rather than an absolute rule — inheritance remains genuinely appropriate for clear, stable "is-a" relationships, but composition's flexibility should be the DEFAULT consideration for anything more nuanced.

### Designing a clean public interface

~~~mermaid
flowchart LR
    PublicInterface["Public interface\n(the ONLY thing client code depends on)"] --> InternalImpl["Internal implementation\n(free to change without\nbreaking clients)"]
~~~

A senior engineer designs classes with a deliberately MINIMAL, well-considered public interface, keeping everything else private/internal — this maximizes future flexibility to change internal implementation details without breaking any code that depends on the class, a direct, practical application of encapsulation and abstraction.

### Recognizing when OOP ceremony isn't warranted

~~~python
# Sometimes a plain function is genuinely simpler and clearer
# than wrapping simple, stateless logic in unnecessary class ceremony
def calculate_tax(amount, rate):
    return amount * rate

# versus an unnecessarily over-engineered class wrapper providing
# no genuine benefit over the plain function above
class TaxCalculator:
    def __init__(self, rate):
        self.rate = rate
    def calculate(self, amount):
        return amount * self.rate
~~~

A senior engineer recognizes that OOP is a TOOL for managing STATE and complex behavior, not a mandatory style for every piece of code — simple, stateless transformations are often genuinely clearer as plain functions, and reflexively wrapping everything in classes is a real, common anti-pattern (sometimes called "object obsession").
`,

  "data-flow": `
Tracing how encapsulation and polymorphism interact in a typical request-handling flow (an e-commerce order processing system):

~~~mermaid
sequenceDiagram
    participant Client as Calling code
    participant Order as Order object
    participant PaymentStrategy as PaymentMethod (interface)
    participant CreditCard as CreditCardPayment (concrete)
    participant PayPal as PayPalPayment (concrete)

    Client->>Order: order.checkout()
    Order->>Order: validate internal state (encapsulated)
    Order->>PaymentStrategy: payment_method.process(amount)
    Note over PaymentStrategy: Order doesn't know or care\nwhich CONCRETE payment type this is
    alt Actual object is CreditCardPayment
        PaymentStrategy->>CreditCard: dispatched at runtime
        CreditCard-->>Order: payment result
    else Actual object is PayPalPayment
        PaymentStrategy->>PayPal: dispatched at runtime
        PayPal-->>Order: payment result
    end
    Order-->>Client: checkout result
~~~

The critical detail: the Order class's checkout() method interacts with payment_method purely through the general PaymentMethod interface, entirely unaware of which specific concrete payment implementation it's actually working with — this is polymorphism providing genuine architectural flexibility, letting new payment methods (a future CryptoPayment class) be added later without modifying Order's code at all, as long as the new class correctly implements the PaymentMethod interface.
`,

  "production-usage": `
### A well-encapsulated, production-style class design

~~~python
class UserAccount:
    def __init__(self, email, password_hash):
        self._email = email
        self._password_hash = password_hash
        self._is_locked = False
        self._failed_login_attempts = 0

    def attempt_login(self, password_hash):
        if self._is_locked:
            raise AccountLockedError()
        if password_hash != self._password_hash:
            self._failed_login_attempts += 1
            if self._failed_login_attempts >= 5:
                self._is_locked = True
            return False
        self._failed_login_attempts = 0
        return True
~~~

This design ENCAPSULATES the account-locking business rule entirely within the class — any code calling attempt_login() automatically benefits from correct lockout behavior, without needing to duplicate that logic, and the internal _failed_login_attempts counter can never be manipulated incorrectly from outside the class.

### Non-negotiables for production OOP code

1. **Design a minimal, deliberate public interface** — expose only what client code genuinely needs, keeping implementation details private.
2. **Favor composition over inheritance** for anything beyond a clear, stable "is-a" relationship.
3. **Use abstract base classes/interfaces** to define contracts that multiple concrete implementations can satisfy, enabling polymorphic, extensible design.
4. **Avoid unnecessary class ceremony** around genuinely simple, stateless logic — a plain function is often clearer.
5. **Keep inheritance hierarchies shallow**, avoiding the fragile base class problem that deep hierarchies introduce over time.

### Common production patterns

- **Strategy pattern** (covered in depth in the **Design Patterns** skill), directly illustrated by the payment method example above — encapsulating interchangeable algorithms/behaviors behind a common interface.
- **Repository pattern**, encapsulating data access logic behind a clean interface, letting the underlying storage mechanism (a specific database, a cache) change without affecting calling code.
- **Value objects/data classes** for simple, immutable data bundles that don't need full encapsulation ceremony, distinct from genuinely stateful, behavior-rich objects.
`,

  "industry-examples": `
- **Django's ORM models**: every database table is represented as a Python class, with encapsulated field validation and query methods — a widely-encountered, production-scale OOP application.
- **PyTorch's nn.Module**: every neural network layer and model is a class inheriting from nn.Module, using inheritance and polymorphism (the forward() method) to compose arbitrarily complex architectures from simpler building blocks.
- **Java's enterprise ecosystem broadly** (Spring Boot, covered in its own skill): built almost entirely around OOP principles, dependency injection of interfaces, and design patterns.
- **Game engines** (Unity, Unreal Engine): model game entities (characters, items, environments) as objects with encapsulated state and behavior, a domain where OOP's original "model interacting entities" motivation applies directly.
- **GUI frameworks broadly**: model UI elements (buttons, windows, forms) as objects with inheritance hierarchies (a Button IS-A Widget) and polymorphic event handling, one of OOP's most naturally-fitting application domains.
`,

  "best-practices": `
1. **Design a minimal, deliberate public interface**, hiding implementation details behind it to preserve future flexibility.
2. **Favor composition over inheritance** by default, reserving inheritance for clear, stable "is-a" relationships.
3. **Keep inheritance hierarchies shallow**, avoiding the fragile base class problem.
4. **Use abstract base classes/interfaces to define contracts**, enabling polymorphic, extensible designs where new implementations don't require modifying existing consuming code.
5. **Don't wrap simple, stateless logic in unnecessary class ceremony** — a plain function is often genuinely clearer.
6. **Use properties/getters-setters to maintain internal invariants** while presenting a natural, convenient interface.
7. **Call super() appropriately** in subclass constructors/methods to correctly extend (rather than silently break) inherited behavior.
8. **Avoid multiple inheritance where possible**, or understand your language's specific method resolution order thoroughly if you do use it.
9. **Design classes around genuine behavioral cohesion** (data and the methods that operate on it truly belonging together), not just convenient grouping.
10. **Document the intended contract of abstract classes/interfaces clearly**, helping future implementers understand exactly what's expected.
`,

  "anti-patterns": `
### Deep, brittle inheritance hierarchies

~~~python
# WRONG — a deep hierarchy where a change to Animal ripples
# unpredictably through many levels of subclasses
class Animal: ...
class Mammal(Animal): ...
class Carnivore(Mammal): ...
class Feline(Carnivore): ...
class BigCat(Feline): ...
class Lion(BigCat): ...   -- five levels deep, fragile and hard to reason about

# RIGHT — flatten the hierarchy and use composition for
# specific behavioral variations
class Animal:
    def __init__(self, diet_behavior, habitat_behavior):
        self.diet_behavior = diet_behavior
        self.habitat_behavior = habitat_behavior
~~~

Deep inheritance hierarchies become genuinely hard to reason about — understanding a single leaf class's full behavior might require reading through five or more parent classes, and a change anywhere in that chain can have unpredictable ripple effects.

### Object obsession: wrapping everything in unnecessary classes

~~~python
# WRONG — unnecessary class ceremony around a simple, stateless
# calculation that would be clearer as a plain function
class DiscountCalculator:
    def __init__(self):
        pass
    def calculate_discount(self, price, percentage):
        return price * (percentage / 100)

# RIGHT — a plain function, genuinely simpler and equally clear
def calculate_discount(price, percentage):
    return price * (percentage / 100)
~~~

Reflexively wrapping simple, stateless transformations in classes with no genuine encapsulation benefit adds ceremony and indirection without improving clarity or maintainability — OOP is a tool for managing state and complex behavior, not a mandatory style for every function.

### Other production-grade anti-patterns

- **Exposing internal state directly** (public attributes with no encapsulation) for objects whose invariants genuinely need protection, defeating encapsulation's core purpose.
- **Using inheritance for code reuse alone**, without a genuine "is-a" relationship, producing confusing, semantically incorrect class hierarchies.
- **Overusing multiple inheritance**, introducing diamond-problem ambiguity and hard-to-reason-about method resolution.
- **Not calling super() in overridden constructors**, silently skipping essential parent class initialization.
- **Designing overly broad interfaces** that force implementing classes to provide methods they don't genuinely need (directly connecting to the **SOLID Principles** skill's Interface Segregation Principle).
`,

  performance: `
### Rule zero: OOP's design benefits rarely come at a meaningful runtime cost in modern languages

Method dispatch overhead in most modern OOP languages/runtimes is genuinely negligible for the overwhelming majority of applications — performance concerns should rarely drive OOP design decisions except in genuinely performance-critical hot paths.

### The performance hierarchy (apply in order)

1. **Design for clarity and maintainability first**, since OOP's overhead is rarely the actual bottleneck in real systems.
2. **Avoid excessive object creation in genuinely hot loops** if profiling identifies this as a real bottleneck, considering object pooling or value types where the language supports them.
3. **Understand your language's specific dispatch mechanism** (virtual method tables in C++/Java, dynamic attribute lookup in Python) if working in a genuinely performance-critical domain.
4. **Profile before optimizing OOP structure for performance**, since intuition about "classes are slow" is frequently wrong or irrelevant relative to the actual bottleneck.

### Micro-level facts worth knowing

- Polymorphic method dispatch (virtual method calls) has a small, measurable overhead compared to a direct function call in compiled languages, but this is rarely the actual bottleneck in real-world applications.
- Excessive small object allocation can pressure a garbage collector in managed-memory languages, a genuine concern in specifically allocation-heavy hot paths, though rarely a first-order design concern.
- Deep inheritance chains can add minor method-resolution lookup overhead in dynamically-typed languages (Python), though this is typically negligible relative to other application-level costs.
`,

  scalability: `
OOP's "scalability" is less about runtime performance at increasing data volume (a concern more directly addressed by the **Data Structures** and **Algorithms** skills) and more about CODEBASE scalability — how well the design holds up as a system grows in size, complexity, and number of contributors.

### Codebase scalability through clean interfaces

~~~mermaid
flowchart LR
    ManyDevelopers["Many developers,\nlarge codebase"] --> CleanInterfaces["Well-encapsulated classes\nwith minimal public interfaces"]
    CleanInterfaces --> Parallel["Teams can work on different\nclasses independently, with\nconfidence internal changes\nwon't break other teams' code"]
~~~

Well-designed encapsulation and clean interfaces are precisely what let large teams work on different parts of a large codebase in parallel with confidence — as long as a class's PUBLIC interface remains stable, its internal implementation can be freely refactored without coordinating with every other team depending on it.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A codebase becoming hard to reason about as it grows | Cleaner encapsulation, smaller/more focused classes, and the SOLID principles covered in their own skill |
| Deep inheritance hierarchies becoming unmanageable | Refactor toward composition, flattening the hierarchy |
| Teams stepping on each other's changes | Well-defined, stable public interfaces isolating each team's internal implementation freedom |
| Excessive object allocation in a genuine performance hot path | Profile-guided optimization: object pooling, value types, or reducing allocation frequency in that specific path |
`,

  security: `
### Encapsulation as a security-adjacent discipline

~~~
Encapsulation preventing direct external manipulation of internal
state directly supports maintaining SECURITY-RELEVANT invariants --
a BankAccount class enforcing "balance can never go negative" or
"only authenticated methods can modify the balance" through its
public interface is a direct, practical security benefit of
proper encapsulation, not merely a code-organization nicety.
~~~

While OOP itself isn't a security mechanism, well-designed encapsulation directly supports maintaining security-relevant invariants consistently — a class that enforces its own validation and authorization rules internally is far less likely to have those rules accidentally bypassed somewhere in a large codebase than logic scattered across many independent functions with direct access to shared, unprotected data.

### Essential OOP-related security practices

1. **Encapsulate security-relevant validation and authorization logic** within the classes that own the relevant state, rather than trusting every caller to remember to check it independently.
2. **Never expose mutable internal state directly** for objects whose invariants have security implications (authentication state, financial balances, permission flags).
3. **Validate all inputs at the class boundary** (constructors, setters, public methods), not just at a system's outer edge.
4. **Be cautious with deserialization of untrusted data into objects**, a genuine, historically-exploited vulnerability class in several OOP languages (insecure deserialization, covered more broadly in the **OWASP Top 10** skill).

See the **OWASP Top 10** and **Secrets Management** skills for the broader security context this connects to.
`,

  testing: `
### Testing encapsulated class behavior

~~~python
def test_bank_account_rejects_negative_deposit():
    account = BankAccount(initial_balance=100)
    with pytest.raises(ValueError):
        account.deposit(-50)
    assert account.get_balance() == 100   -- balance unchanged after the rejected deposit

def test_bank_account_locks_after_failed_attempts():
    account = UserAccount("user@example.com", "correct_hash")
    for _ in range(5):
        account.attempt_login("wrong_hash")
    with pytest.raises(AccountLockedError):
        account.attempt_login("correct_hash")   -- even the CORRECT password should fail once locked
~~~

### Testing polymorphic behavior

~~~python
def test_all_payment_methods_implement_the_interface_correctly():
    for payment_class in [CreditCardPayment, PayPalPayment]:
        instance = payment_class(...)
        result = instance.process(100)
        assert isinstance(result, PaymentResult)   -- verify the CONTRACT is honored consistently
~~~

### The senior testing doctrine

- Test through a class's PUBLIC interface, not its private internal state directly — this verifies the actual contract client code depends on, and remains valid even if internal implementation is later refactored.
- Test that encapsulated invariants are genuinely enforced (attempting to violate them from outside the class and confirming it's correctly prevented).
- Test polymorphic implementations consistently, verifying every concrete subclass correctly honors its parent interface's contract.
- Test inheritance-based initialization explicitly, verifying super() calls correctly propagate parent-class setup.
`,

  debugging: `
### The toolbox, in escalation order

1. **Trace method resolution explicitly** when polymorphic behavior seems wrong, confirming which specific class's implementation is actually being called at runtime.
2. **Check for missing super() calls** in subclass constructors/methods if inherited state seems incorrectly initialized.
3. **Verify encapsulation is actually being respected** — check whether some code somewhere is bypassing intended encapsulation (directly manipulating supposedly-private state), a common source of "impossible" bugs.
4. **Draw out the actual inheritance/composition structure** for a confusing bug, since a mental model that doesn't match the actual class hierarchy is a common source of debugging confusion.
5. **Use a debugger to inspect an object's actual runtime type**, particularly relevant when working with polymorphic code where the calling code doesn't know the concrete type directly.

### Debugging common OOP-specific symptoms

- "The wrong method implementation seems to be running" — check the object's actual runtime type and the inheritance/method-resolution order, rather than assuming based on the variable's declared/apparent type.
- "An object's state seems to be in an impossible configuration" — check for encapsulation violations, where code somewhere is bypassing intended validation by directly manipulating internal attributes.
- "A subclass's behavior seems to be missing expected parent initialization" — check for a missing super().__init__() call (or equivalent) in the subclass constructor.
- "Multiple inheritance produces unexpected method resolution" — trace through your language's specific method resolution order rules explicitly rather than assuming intuitive left-to-right precedence always applies simply.
`,

  monitoring: `
### Key signals to track

- **Object allocation rate and memory usage**, for genuinely performance-sensitive systems, since excessive object creation can pressure garbage collection.
- **Class-level metrics for genuinely stateful, long-lived objects** (a connection pool's active connection count, a cache object's hit rate), tracked via the class's own instrumentation.

### Tools

Standard language-specific profilers (identifying allocation hot spots, method call frequency) for performance-sensitive OOP code; code quality/complexity analysis tools (measuring inheritance depth, class coupling/cohesion metrics) for tracking codebase health over time.

### Alerting priorities

For most business-logic OOP code, dedicated "monitoring" is less relevant than for infrastructure-level systems — the primary ongoing concern is CODE REVIEW discipline (catching inheritance depth creep, encapsulation violations, and interface bloat) rather than runtime alerting.
`,

  deployment: `
### OOP design as part of a maintainable, deployable codebase

~~~python
# A clean class boundary lets the underlying implementation
# (which database, which caching strategy) change freely without
# affecting any code that depends on this stable public interface
class UserRepository:
    def get_by_id(self, user_id):
        raise NotImplementedError

class PostgresUserRepository(UserRepository):
    def get_by_id(self, user_id):
        ...  -- actual PostgreSQL query logic

class CachedUserRepository(UserRepository):
    def __init__(self, underlying_repo, cache):
        self.underlying_repo = underlying_repo
        self.cache = cache
    def get_by_id(self, user_id):
        ...  -- check cache first, fall back to underlying_repo
~~~

Designing around clean interfaces (here, an abstract UserRepository) lets a deployment swap implementations (adding caching, changing databases) without touching any code that depends on the stable interface — directly connecting to the Repository pattern covered in the **Design Patterns** skill.

### CI/CD pipeline considerations

Static analysis tools checking for inheritance depth, class coupling, and interface bloat as part of CI can catch OOP anti-patterns before they compound into genuine maintainability problems. See the **CI/CD** skill for the general pipeline depth this builds on.
`,

  "production-checklist": `
Before OOP-heavy production code ships:

- [ ] Public interfaces are minimal and deliberate, hiding implementation details appropriately
- [ ] Inheritance used only for genuine, stable "is-a" relationships; composition used elsewhere
- [ ] Inheritance hierarchies kept shallow (generally no more than 2-3 levels deep)
- [ ] Abstract base classes/interfaces used to define contracts enabling polymorphic extensibility
- [ ] No unnecessary class ceremony around genuinely simple, stateless logic
- [ ] super() called correctly in overridden constructors/methods where inherited behavior should be extended
- [ ] Encapsulation genuinely enforced — no external code bypassing intended internal state protection
- [ ] Security-relevant invariants (authentication, financial state) encapsulated and enforced consistently within the owning class
- [ ] Tests verify behavior through the public interface, not private internal state directly
- [ ] Multiple inheritance avoided or, if used, its method resolution order thoroughly understood and documented
`,

  "common-mistakes": `
1. **Using inheritance for code reuse without a genuine "is-a" relationship**, producing confusing, semantically incorrect hierarchies.
2. **Building deep inheritance hierarchies**, creating the fragile base class problem and hard-to-reason-about behavior.
3. **Wrapping simple, stateless logic in unnecessary class ceremony** ("object obsession"), adding indirection without genuine benefit.
4. **Exposing internal state directly** rather than through controlled methods, defeating encapsulation's purpose.
5. **Forgetting to call super()** in overridden constructors, silently skipping essential parent initialization.
6. **Designing overly broad interfaces**, forcing implementing classes to provide methods they don't genuinely need.
7. **Overusing multiple inheritance**, introducing diamond-problem ambiguity.
8. **Not favoring composition over inheritance** by default, reaching for inheritance even for "has-a" relationships.
9. **Testing private implementation details directly** instead of through the public interface, producing brittle tests.
10. **Assuming OOP automatically produces good design** — using classes syntactically without applying the SOLID principles or recognized design patterns that make OOP genuinely effective.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| AttributeError accessing an instance attribute | The attribute wasn't initialized (often a missing super().__init__() call in a subclass) | Verify the constructor chain correctly initializes all expected attributes |
| Wrong method implementation appears to run | Misunderstanding the object's actual runtime type, or incorrect method resolution order assumptions | Explicitly check the object's actual class and trace the inheritance chain |
| TypeError: Can't instantiate abstract class | Attempting to instantiate an abstract base class directly, or a subclass missing a required abstract method implementation | Implement all required abstract methods in the concrete subclass |
| Unexpected shared state across instances | Accidentally using a mutable class attribute (a list or dict) where an instance attribute was intended | Initialize mutable attributes inside __init__, not as class-level attributes |
| Diamond problem ambiguity in multiple inheritance | Multiple parent classes defining the same method, with unclear precedence | Explicitly understand and, if necessary, override to resolve the specific method resolution order |
| Encapsulation silently bypassed elsewhere in the codebase | Code directly manipulating an object's "private" (convention-only, in some languages) internal state | Enforce encapsulation more strictly, or add validation directly in the affected internal attribute's access points |
`,

  faqs: `
**What are the four pillars of OOP?**
Encapsulation (bundling data with the methods that operate on it, controlling access), abstraction (exposing a simplified interface while hiding complexity), inheritance (sharing structure/behavior via "is-a" relationships), and polymorphism (letting different types be used interchangeably through a shared interface).

**When should I use inheritance versus composition?**
Use inheritance for genuine, stable "is-a" relationships (a Dog is an Animal); use composition ("has-a" relationships, like a Car has an Engine) as the default for anything more flexible or where the relationship might need to vary — "favor composition over inheritance" is a widely-cited, well-justified design principle.

**What is duck typing, and how does it relate to polymorphism?**
Duck typing (particularly common in Python) means an object is treated as satisfying an interface simply by HAVING the expected methods/attributes, regardless of formal inheritance — a more flexible, less rigid form of polymorphism than strict interface-based typing in some other languages.

**Why is deep inheritance considered an anti-pattern?**
Deep inheritance hierarchies become genuinely hard to reason about (understanding a single class might require reading through many parent classes) and create the "fragile base class problem" — a change anywhere in a widely-inherited-from class can unexpectedly ripple through and break subclasses the base class's author may not even be aware of.

**Is OOP always the right approach?**
No — OOP is a genuinely powerful tool specifically for modeling stateful entities with complex behavior, but simple, stateless data transformations are often clearer as plain functions; reflexively wrapping everything in classes ("object obsession") is a real, common anti-pattern.

**How does OOP relate to SOLID principles and design patterns?**
Directly — using classes and inheritance syntactically doesn't automatically produce good design; the SOLID principles (covered in their own skill) formalize HOW to apply OOP well, and design patterns (also covered in their own skill) catalog proven, reusable solutions to recurring OOP design problems, both building directly on the fundamentals covered on this page.
`,

  "interview-questions": `
### Junior level

1. **What are the four pillars of object-oriented programming?**
   Model answer: encapsulation, abstraction, inheritance, and polymorphism.

2. **What is the difference between a class and an object?**
   Model answer: a class is a blueprint defining attributes and methods; an object is a specific, concrete instance of that blueprint.

3. **What is encapsulation, and why is it useful?**
   Model answer: bundling data with the methods that operate on it, and restricting direct external access — useful because it lets a class enforce its own invariants consistently and limits where a bug affecting that data could originate.

4. **What is the difference between inheritance and composition?**
   Model answer: inheritance models an "is-a" relationship (a Dog is an Animal), sharing structure/behavior from a parent class; composition models a "has-a" relationship (a Car has an Engine), including an instance of one class as an attribute of another.

5. **What is polymorphism?**
   Model answer: the ability for different classes to be used interchangeably through a shared interface, with each providing its own specific behavior for the same method call.

### Senior level

6. **Explain the "fragile base class problem" and why it motivates favoring composition over inheritance.**
   Model answer: when many subclasses inherit from a widely-used base class, the base class's author often can't know every subclass that depends (even accidentally, through inheritance's exposure of internal details) on specific aspects of its current behavior; changing the base class — even in ways that seem safe — can unexpectedly break subclasses elsewhere in a large codebase, a risk composition avoids by keeping relationships looser and more explicit.

7. **Explain the diamond problem in multiple inheritance and how different languages address it.**
   Model answer: when a class inherits from two parent classes that both inherit from a common ancestor (or both define the same method independently), it becomes ambiguous which parent's implementation should apply; Python resolves this via a well-defined Method Resolution Order (C3 linearization), while languages like Java sidestep the ambiguity by disallowing multiple inheritance of implementation, permitting only multiple interface implementation instead.

8. **Why might a senior engineer choose NOT to use a class for a piece of functionality?**
   Model answer: OOP is specifically valuable for managing stateful, behavior-rich entities; for genuinely simple, stateless data transformations, a plain function is often clearer and avoids unnecessary indirection/ceremony — reflexively wrapping every piece of logic in a class ("object obsession") adds complexity without a corresponding genuine benefit.

9. **How does duck typing differ from traditional interface-based polymorphism, and what tradeoff does it represent?**
   Model answer: duck typing lets an object be treated as satisfying an interface simply by having the expected methods/attributes, without requiring formal inheritance or interface declaration; this offers more flexibility (any object with the right methods works, regardless of its class hierarchy) at the cost of less compile-time/static verification that an object genuinely satisfies the expected contract, a tradeoff more comfortable in dynamically-typed languages like Python than in statically-typed ones.

10. **Design a payment processing system supporting multiple payment methods, using OOP principles appropriately.**
    Model answer: define an abstract PaymentMethod interface/base class with a process(amount) method; implement concrete classes (CreditCardPayment, PayPalPayment) each providing their own process() implementation; have the Order/checkout logic depend only on the abstract PaymentMethod interface, letting new payment methods be added later (a future CryptoPayment class) without modifying the checkout logic at all — directly applying polymorphism and the Open/Closed Principle (covered in the SOLID Principles skill).

11. **Why is exposing an object's internal mutable state directly (public attributes with no controlled access) considered poor encapsulation?**
    Model answer: it removes the class's ability to enforce its own invariants — any external code can set the attribute to an invalid value directly, bypassing whatever validation logic the class's methods would otherwise apply, making bugs harder to trace (since the invalid state could originate from anywhere in the codebase, not just the class's own methods) and making the class's actual guarantees unreliable.

12. **How would you refactor a deep, five-level inheritance hierarchy that's become hard to maintain?**
    Model answer: identify the actual distinct BEHAVIORS being varied across the hierarchy (rather than the nominal "is-a" categories), and extract those behaviors into separate, composable classes/strategies; refactor the original hierarchy to use composition (each concrete class holding instances of the specific behavior objects it needs) rather than inheriting through five levels, flattening the hierarchy and making each behavior independently testable and reusable across different combinations.
`,

  "coding-questions": `
### 1. Design a shape hierarchy using proper abstraction

~~~python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
    @abstractmethod
    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width, self.height = width, height
    def area(self):
        return self.width * self.height
    def perimeter(self):
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14159 * self.radius ** 2
    def perimeter(self):
        return 2 * 3.14159 * self.radius
# Follow-up: why does defining Shape as an ABSTRACT base class
# (rather than a plain base class with default implementations)
# provide a stronger guarantee to code consuming Shape objects
# polymorphically?
~~~

### 2. Implement a class hierarchy demonstrating correct super() usage

~~~python
class Vehicle:
    def __init__(self, make, model):
        self.make, self.model = make, model
    def describe(self):
        return self.make + " " + self.model

class ElectricVehicle(Vehicle):
    def __init__(self, make, model, battery_capacity):
        super().__init__(make, model)   -- correctly initializes inherited attributes
        self.battery_capacity = battery_capacity
    def describe(self):
        return super().describe() + " with a " + str(self.battery_capacity) + " kWh battery"
# Follow-up: what would break if super().__init__(make, model) were
# omitted from ElectricVehicle's constructor, and how would that
# manifest as a runtime error?
~~~

### 3. Implement composition-based behavior for a game character system

~~~python
class AttackBehavior:
    def attack(self):
        raise NotImplementedError

class MeleeAttack(AttackBehavior):
    def attack(self):
        return "Swings a sword!"

class RangedAttack(AttackBehavior):
    def attack(self):
        return "Shoots an arrow!"

class Character:
    def __init__(self, name, attack_behavior):
        self.name = name
        self.attack_behavior = attack_behavior   -- COMPOSED, not inherited

    def perform_attack(self):
        return self.name + ": " + self.attack_behavior.attack()

warrior = Character("Warrior", MeleeAttack())
archer = Character("Archer", RangedAttack())
# Follow-up: why does composing an AttackBehavior (rather than
# having Warrior and Archer inherit from Character with hardcoded
# attack logic) make it easier to create a new character that can
# SWITCH attack styles at runtime, or to add a new attack style
# without modifying the Character class at all?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Design and implement a class hierarchy for a library system
Design classes for Book, Member, and Library, with appropriate encapsulation (a Book's availability status shouldn't be directly settable from outside), and basic methods for checking books in/out. Deliverable: a working class hierarchy with a small test suite. Skills exercised: class design, encapsulation.

### Lab 2 (Intermediate): Refactor an inheritance-heavy design into composition
Given a deliberately over-inherited class hierarchy (e.g., a five-level animal hierarchy modeling diet and habitat via inheritance), refactor it to use composition instead, demonstrating the same behavioral variations with a flatter, more flexible structure. Deliverable: before/after code with a written explanation of the tradeoffs. Skills exercised: composition-over-inheritance refactoring.

### Lab 3 (Advanced): Implement a polymorphic plugin-style system
Design an abstract interface for a "notification sender" (email, SMS, push notification), implement several concrete classes, and write client code that sends notifications through the abstract interface without knowing the concrete type — then add a NEW notification type without modifying any existing code. Deliverable: a working polymorphic system demonstrating extensibility. Skills exercised: abstraction, polymorphism, Open/Closed Principle application.

### Lab 4 (Production): Design a repository pattern with swappable implementations
Implement an abstract Repository interface, a concrete in-memory implementation for testing, and a concrete database-backed implementation for production, verifying that client code depending only on the abstract interface works correctly with either implementation. Deliverable: a working repository pattern implementation with tests against both implementations. Skills exercised: abstraction, dependency inversion, testable design.
`,

  "real-projects": `
### 1. A plugin-based data connector system
Engineering requirements: an abstract DataConnector interface with concrete implementations for different data sources (a database, a REST API, a file system), letting the system support new data sources by adding a new class without modifying any existing connector-consuming code — directly applying polymorphism and the Open/Closed Principle.

### 2. A domain model for an e-commerce order management system
Engineering requirements: well-encapsulated Order, LineItem, and Payment classes enforcing business invariants (an order's total must match its line items, a payment can't exceed the order total) consistently through their public interfaces, with a payment-method abstraction supporting multiple concrete payment implementations.

### 3. A test double/mocking framework for a specific domain
Engineering requirements: abstract interfaces for external dependencies (a payment gateway, an email service) with both production and test-double concrete implementations, letting integration tests substitute predictable test doubles for real external services without changing any application code depending on the abstract interfaces.
`,

  "case-studies": `
### Java's deliberate "everything is an object" design choice
Java's designers deliberately made the language purely object-oriented (with only primitive types as a pragmatic exception), a strong, opinionated design choice that significantly shaped enterprise software development practices for decades, cementing OOP as the dominant paradigm for large-scale business applications through the 1990s-2000s. Lesson: a language's foundational design philosophy can significantly shape an entire industry's default engineering practices for a generation, well beyond the language's own specific technical merits.

### The industry's gradual move away from "OOP as the only true way"
The broad industry shift, particularly visible in Python's and JavaScript's popularity, toward multi-paradigm languages that SUPPORT OOP without mandating it as the only style, reflects a maturing, more nuanced industry understanding: OOP is a genuinely powerful tool for specific problems (stateful, behavior-rich entities) rather than a universally superior approach for all code. Lesson: even genuinely valuable engineering paradigms benefit from being applied judiciously rather than dogmatically — recognizing WHEN a tool fits (and when it doesn't) is a more mature engineering skill than defaulting to one paradigm universally.

### "Favor composition over inheritance" as an industry-wide correction
The widespread adoption of "favor composition over inheritance" as conventional wisdom, following decades of production experience with genuinely brittle, deeply-inherited enterprise codebases (particularly common in 1990s-2000s Java applications), illustrates how accumulated industry experience with a paradigm's failure modes (the fragile base class problem, specifically) can produce a genuinely valuable, widely-adopted corrective principle. Lesson: engineering best practices often emerge from collectively learning from a paradigm's real, repeated failure modes in production, not from purely theoretical analysis alone.
`,

  comparisons: `
| Aspect | Inheritance | Composition |
|--------|-------------|--------------|
| Relationship modeled | "IS-A" | "HAS-A" |
| Coupling | Tighter (subclass depends on parent's internal structure) | Looser (depends only on the composed object's public interface) |
| Flexibility | Fixed at compile time (in most languages) | Can be changed at runtime (swap the composed object) |
| Risk | Fragile base class problem in deep/widely-used hierarchies | Requires slightly more boilerplate (delegating calls) |
| Best fit | Clear, stable "is-a" relationships, shallow hierarchies | Most other cases — the recommended default |

| Aspect | Interface (pure contract) | Abstract Class (partial implementation) |
|--------|----------------------------|--------------------------------------------|
| Implementation provided | None | Some shared, concrete implementation possible |
| Multiple inheritance | Typically yes (a class can implement many interfaces) | Typically no (single inheritance in most languages) |
| Best fit | Defining a pure contract multiple unrelated classes can satisfy | Sharing genuine common implementation among closely-related subclasses |

**How seniors choose**: use inheritance only for clear, stable "is-a" relationships with shallow hierarchies; default to composition for everything else, particularly relationships that might need to vary at runtime; use interfaces for pure contracts spanning otherwise-unrelated classes, and abstract classes when genuine shared implementation exists among closely related subclasses.
`,

  "related-technologies": `
- **SOLID Principles** — the direct, formalized discipline for applying OOP well, covered in its own skill immediately following this one.
- **Design Patterns** — a catalog of proven, reusable OOP solutions to recurring design problems, directly building on the fundamentals covered here.
- **Data Structures**/**Algorithms** — commonly encapsulated and organized within OOP class designs in real codebases.
- **Django**/**Spring Boot** — production frameworks whose ORM models and dependency injection systems are built extensively on the OOP principles covered on this page.
- **PyTorch** — its neural network module system (nn.Module) directly applies inheritance and polymorphism to compose model architectures.

Learning path: **Data Structures**/**Algorithms** → this page → **SOLID Principles** → **Design Patterns**, the natural progression from OOP fundamentals to disciplined, well-structured design.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- OOP remains a foundational, widely-used paradigm across the industry, though continued healthy coexistence with functional programming influences (even within traditionally OOP-centric languages and frameworks) continues.
- Continued industry emphasis on "favor composition over inheritance" and lightweight, focused classes as best practices, reflecting decades of accumulated experience with deep-inheritance anti-patterns.
- Growing use of OOP-adjacent patterns (dataclasses, protocols/structural typing in Python) that provide OOP's organizational benefits with less ceremony for simpler use cases.
- Given how differently specific languages implement OOP details (multiple inheritance handling, interface mechanisms), verify language-specific syntax and semantics against current official documentation for whichever language you're working in.
`,

  "future-roadmap": `
Where OOP is heading, and what's worth betting career time on:

- **Continued relevance as a foundational paradigm**, particularly for modeling genuinely stateful, behavior-rich domains, even as multi-paradigm languages continue blending OOP with functional influences.
- **Continued refinement of "lightweight OOP" patterns** (dataclasses, protocols) providing organizational benefits without full class ceremony for simpler use cases.
- **Growing emphasis on composition-based, interface-driven design** as the mature industry default, with traditional deep-inheritance patterns continuing to fall further out of favor.
- **What to bet on**: deeply understanding the FOUR PILLARS and the composition-versus-inheritance decision framework, rather than memorizing any single language's specific OOP syntax — this transfers directly across languages and directly sets up the **SOLID Principles** and **Design Patterns** skills, a far more durable investment than syntax-level familiarity alone.
`,

  "cheat-sheet": `
~~~python
# ---- The four pillars ----
class Animal:
    def __init__(self, name):
        self.name = name        # instance attribute
    def speak(self):             # ENCAPSULATION: data + behavior bundled
        raise NotImplementedError  # ABSTRACTION: contract without full implementation

class Dog(Animal):                # INHERITANCE: Dog IS-A Animal
    def speak(self):
        return self.name + " says Woof!"   # POLYMORPHISM: each subclass, its own behavior

for animal in [Dog("Rex"), Cat("Tom")]:
    print(animal.speak())    # same call, different behavior per actual type
~~~

~~~python
# ---- Composition: HAS-A, the recommended DEFAULT over inheritance ----
class Engine:
    def start(self): return "Engine starting"

class Car:
    def __init__(self):
        self.engine = Engine()   # Car HAS-A Engine, not IS-A Engine
    def start(self):
        return self.engine.start()

# ---- super(): extend, don't silently skip, parent init ----
class ElectricCar(Car):
    def __init__(self, battery_kwh):
        super().__init__()          # NEVER forget this
        self.battery_kwh = battery_kwh
~~~

~~~
# ---- Decision framework ----
Clear, stable "is-a" relationship, shallow hierarchy -> Inheritance
Everything else (esp. "has-a", or might vary at runtime) -> Composition

# ---- THE fragile base class problem ----
# Deep hierarchies: a base class change ripples unpredictably through
# every subclass its author may not even know exists.
# FIX: favor composition, keep hierarchies shallow (2-3 levels max).

# ---- Anti-pattern: "object obsession" ----
# Wrapping simple, stateless logic in unnecessary classes.
# A plain function is often genuinely clearer -- OOP manages STATE, not everything.

# ---- Interface vs abstract class ----
# Interface: pure contract, NO implementation, a class can satisfy MANY
# Abstract class: SOME shared implementation, typically single inheritance only
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| The four pillars of OOP? | Encapsulation, abstraction, inheritance, polymorphism. |
| Class vs object? | Class = blueprint. Object = a specific instance of that blueprint. |
| Inheritance vs composition -- core distinction? | Inheritance: IS-A. Composition: HAS-A. |
| Which should be the DEFAULT choice? | Composition -- looser coupling, more flexible, avoids the fragile base class problem. |
| What is the fragile base class problem? | A base class change unpredictably breaks subclasses its author may not know exist. |
| What does super() do? | Calls the parent class's implementation -- EXTENDS rather than replaces inherited behavior. |
| What is duck typing? | Treating an object as satisfying an interface just by having the right methods, no formal inheritance needed. |
| Interface vs abstract class? | Interface: pure contract, no implementation. Abstract class: some shared implementation too. |
| What is "object obsession"? | Wrapping simple, stateless logic in unnecessary classes -- a plain function is often clearer. |
| Why does polymorphism enable extensibility? | New types can be added later without modifying code that consumes the shared interface. |
| The diamond problem? | Ambiguity in multiple inheritance when two parents define the same method. |
| How does encapsulation support security? | Enforces invariants (validation, authorization) consistently -- can't be bypassed elsewhere in the codebase. |
`,

  mcqs: `
1. What are the four pillars of object-oriented programming?
   A) Loops, conditionals, functions, variables  B) Encapsulation, abstraction, inheritance, polymorphism  C) Classes, objects, methods, attributes  D) Compilation, execution, debugging, testing
   **Answer: B** — these four concepts form OOP's foundational vocabulary.

2. What relationship does inheritance model, versus composition?
   A) Both model the same relationship  B) Inheritance models "IS-A"; composition models "HAS-A"  C) Inheritance models "HAS-A"; composition models "IS-A"  D) Neither models a relationship
   **Answer: B** — a Dog IS-A Animal (inheritance); a Car HAS-A Engine (composition).

3. Why is "favor composition over inheritance" widely recommended?
   A) Composition is always faster  B) Composition creates looser coupling and avoids the fragile base class problem that deep inheritance hierarchies introduce  C) Inheritance is deprecated  D) Composition uses less memory
   **Answer: B** — inheritance's tight coupling between parent and child classes can cause unpredictable ripple effects when the parent changes.

4. What does polymorphism enable that would otherwise require conditional type-checking?
   A) Faster compilation  B) Code that works correctly with objects of different concrete types through a shared interface, without knowing which type at compile time  C) Automatic memory management  D) Multiple inheritance
   **Answer: B** — this is what lets new subclasses be added later without modifying existing consuming code.

5. What is the "fragile base class problem"?
   A) A class that crashes frequently  B) A widely-inherited base class's changes unpredictably breaking subclasses its author may not know exist  C) A memory leak in inheritance  D) A syntax error in class definitions
   **Answer: B** — a core motivation for favoring composition over deep inheritance hierarchies.

6. What is "object obsession" as an anti-pattern?
   A) Using too many objects in a loop  B) Wrapping simple, stateless logic in unnecessary class ceremony when a plain function would be clearer  C) Creating too few classes  D) Using inheritance too rarely
   **Answer: B** — OOP is a tool for managing state and complex behavior, not a mandatory style for every piece of code.
`,

  "revision-notes": `
Object-Oriented Programming organizes software around OBJECTS — bundles of data (attributes) and the behavior (methods) that operates on that data — built on four pillars: ENCAPSULATION (bundling data with its methods, controlling external access to enforce invariants consistently), ABSTRACTION (exposing a simplified interface while hiding implementation complexity), INHERITANCE (sharing structure/behavior via "is-a" relationships, letting a Dog class derive from an Animal class), and POLYMORPHISM (letting different concrete classes be used interchangeably through a shared interface, with method calls dynamically dispatched to the correct implementation at runtime based on an object's ACTUAL type).

OOP originated with Simula (1960s, for discrete-event simulation) and was popularized as a central paradigm by Smalltalk (1972) and later Java (1995), which deliberately made nearly everything an object. A CLASS is a blueprint; an OBJECT (instance) is a specific, concrete realization of that blueprint — many objects can share the same class definition while holding their own independent instance attribute values. CLASS ATTRIBUTES are shared across all instances, while INSTANCE ATTRIBUTES are unique per object; STATIC METHODS don't operate on instance state, while CLASS METHODS receive the class itself (commonly used for alternative constructors).

The single most important, widely-cited modern OOP design principle is "FAVOR COMPOSITION OVER INHERITANCE": inheritance should be reserved for clear, stable "is-a" relationships with shallow hierarchies, while composition ("has-a" relationships, embedding an instance of one class as an attribute of another) should be the DEFAULT choice for everything else, since inheritance creates tight coupling that produces the "FRAGILE BASE CLASS PROBLEM" — a widely-inherited base class's changes can unpredictably ripple through and break subclasses its author may not even be aware of, a genuine, repeated production pain point that motivated this now-conventional wisdom. Deep inheritance hierarchies (more than 2-3 levels) are a common, well-recognized anti-pattern for exactly this reason.

MULTIPLE INHERITANCE introduces the "diamond problem" — ambiguity about which parent's implementation should apply when multiple ancestors define the same method — resolved via a language-specific Method Resolution Order (Python's C3 linearization) or avoided entirely by disallowing multiple implementation inheritance (Java allows multiple INTERFACE implementation instead). INTERFACES define a pure contract with no implementation (a class can satisfy multiple interfaces); ABSTRACT CLASSES can define a contract AND provide some shared, concrete implementation (typically limited to single inheritance).

DUCK TYPING (especially common in Python) treats an object as satisfying an interface simply by having the expected methods/attributes, without requiring formal inheritance — a more flexible but less statically-verified form of polymorphism than strict interface-based typing. A genuinely important, easily-overlooked anti-pattern is "OBJECT OBSESSION" — reflexively wrapping simple, stateless data transformations in unnecessary class ceremony, when a plain function would be genuinely clearer; OOP is specifically valuable for managing STATE and complex, behavior-rich entities, not a mandatory style for every piece of code.

A senior engineer designs classes with a MINIMAL, deliberate public interface, hiding implementation details behind it — this is precisely what lets internal implementations be refactored freely without breaking client code, and what lets large teams work on different parts of a big codebase in parallel with confidence. Encapsulation also directly supports maintaining SECURITY-RELEVANT invariants consistently (a bank account enforcing "balance never goes negative" through its own methods, rather than trusting every caller to remember to check independently). OOP fundamentals directly set up the **SOLID Principles** skill (formalizing HOW to apply OOP well) and the **Design Patterns** skill (cataloging proven, reusable solutions built on these same foundational concepts) — using classes and inheritance syntactically doesn't automatically produce good design, which is precisely why those two disciplines exist.
`,

  "learning-roadmap": `
**Week 1 — The four pillars and basic class design**: encapsulation, abstraction, inheritance, and polymorphism fundamentals. Milestone: design and implement a small class hierarchy for a real domain (a library system) with appropriate encapsulation (Lab 1).

**Week 2 — Inheritance mechanics**: super(), method overriding, abstract base classes, and the diamond problem. Milestone: implement a class hierarchy correctly using super() for constructor chaining and abstract methods for a shared contract.

**Week 3 — Composition and the inheritance-versus-composition decision**: understanding the fragile base class problem and refactoring inheritance-heavy designs toward composition. Milestone: refactor a deliberately over-inherited hierarchy into a composition-based design (Lab 2).

**Week 4 — Polymorphism and extensible design**: duck typing, interfaces versus abstract classes, and designing for extensibility without modifying existing code. Milestone: build a polymorphic plugin-style system supporting new implementations without changing existing code (Lab 3).

**Week 5 — Production application**: repository-pattern-style abstraction with swappable implementations, and recognizing when OOP ceremony is (and isn't) warranted. Milestone: implement a repository pattern with both a test-double and production implementation (Lab 4).

**Week 6 — Consolidation and connection to SOLID/Design Patterns**: reviewing common anti-patterns (object obsession, deep hierarchies) and previewing how the SOLID principles formalize good OOP practice. Milestone: review and refactor a piece of your own earlier lab code applying everything learned, documenting the specific improvements made.

Next platform skill once this roadmap is complete: **SOLID Principles** for the formalized discipline of applying OOP well, followed by **Design Patterns** for proven, reusable solutions built on these fundamentals.
`,

  "official-docs": `
- **Python's official documentation on classes** (docs.python.org/3/tutorial/classes.html) — the practical, authoritative reference for Python's specific OOP syntax and semantics.
- **The Java Tutorials' "Object-Oriented Programming Concepts" section** (Oracle's official documentation) — a widely-referenced, authoritative introduction to OOP concepts in a statically-typed context.
- **The original Simula and Smalltalk documentation/historical papers** — for those interested in OOP's foundational origins directly.
`,

  books: `
- **"Design Patterns: Elements of Reusable Object-Oriented Software" — the Gang of Four (Gamma, Helm, Johnson, Vlissides)** — the foundational text cataloging proven OOP design solutions, covered in depth in the **Design Patterns** skill.
- **"Head First Object-Oriented Analysis and Design" — Brett McLaughlin, Gary Pollice, David West** — an accessible, visually-oriented introduction to OOP design thinking.
- **"Effective Java" — Joshua Bloch** — a widely-recommended, practically-focused text on disciplined OOP practice in a specific, influential language.
- **"Clean Code" — Robert C. Martin** — covers class design principles broadly applicable across OOP languages, directly connecting to the **SOLID Principles** skill.
`,

  blogs: `
- **Martin Fowler's website (martinfowler.com)** — extensive, widely-referenced writing on OOP design, refactoring, and architectural patterns.
- **Various "composition over inheritance" explainer blog posts** across the software engineering community, covering this page's central design principle in depth.
- **Company engineering blogs** discussing specific production OOP design decisions and lessons learned from refactoring away from deep inheritance.
`,

  "research-papers": `
OOP originated primarily as an industry/language-design innovation rather than academic research; the most relevant historical sources:

- **Dahl, O.-J. and Nygaard, K. — original papers on Simula** (1960s) — the foundational source for OOP's class/object concepts.
- **Kay, A. — writings and talks on Smalltalk's design philosophy** — direct insight from OOP's most influential early popularizer.
- See the **Design Patterns** skill's own research/reference section for the Gang of Four's foundational, highly-cited cataloging work.
`,

  videos: `
- **Various "OOP fundamentals" course series** (freeCodeCamp, and similar accessible platforms) covering the four pillars with practical examples.
- **Conference talks specifically on "composition over inheritance"** (various software engineering conferences) covering this page's central design principle with real-world case studies.
- **Alan Kay's own talks on OOP's original intent** — offering direct historical insight into what OOP was originally meant to solve, often contrasted with how it's commonly (and sometimes poorly) applied today.
`,

  "github-repos": `
- **Various "design-patterns" example repositories** (implementations across many languages) directly building on the OOP fundamentals covered here.
- Language standard library source code (Python's collections.abc module, Java's Collections Framework) for studying genuinely production-grade OOP design directly.
- **Refactoring.guru's repository/website** — extensive, well-illustrated coverage of OOP design patterns and refactoring techniques.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Class design basics**: design a class hierarchy for a given domain (a vehicle rental system) with appropriate encapsulation and a clear, minimal public interface.
2. **Inheritance mechanics**: implement a class hierarchy using abstract base classes, correct super() usage, and method overriding.
3. **Composition refactoring**: given an over-inherited design, refactor it into a composition-based structure, documenting the specific tradeoffs.
4. **Polymorphic extensibility**: design and implement a system where new behavior can be added (a new payment method, a new notification type) without modifying any existing code.
5. **Encapsulation and invariants**: implement a class enforcing a specific business invariant (a state machine with valid/invalid transitions) entirely through its public interface.
6. **External practice sets**: Refactoring.guru's design pattern exercises for structured, guided practice building directly on OOP fundamentals.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Pillars["The Four Pillars"]
        Encapsulation["Encapsulation"]
        Abstraction["Abstraction"]
        Inheritance["Inheritance"]
        Polymorphism["Polymorphism"]
    end
    subgraph Relationships["Relationship Modeling"]
        IsA["IS-A (Inheritance)"]
        HasA["HAS-A (Composition)"]
    end
    subgraph Contracts["Defining Contracts"]
        Interface["Interface (pure contract)"]
        AbstractClass["Abstract Class (partial impl)"]
    end
    subgraph Application["Production Application"]
        RepoPattern["Repository Pattern"]
        StrategyPattern["Strategy Pattern"]
        PluginSystem["Plugin/Extensible Systems"]
    end
    Inheritance --> IsA
    Encapsulation --> HasA
    Abstraction --> Interface
    Abstraction --> AbstractClass
    Polymorphism --> StrategyPattern
    Interface --> RepoPattern
    Polymorphism --> PluginSystem
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OOP))
    Foundations
      Overview
      History Simula Smalltalk Java
      Why it exists
      Problem it solves
    Four Pillars
      Encapsulation
      Abstraction
      Inheritance
      Polymorphism
    Class Mechanics
      Classes and objects
      Class versus instance attributes
      Static and class methods
      Super and method overriding
    Relationships
      Inheritance is a
      Composition has a
      Favor composition
    Contracts
      Interfaces
      Abstract classes
      Duck typing
    Anti Patterns
      Fragile base class problem
      Deep hierarchies
      Object obsession
    Diamond Problem
      Multiple inheritance
      Method resolution order
    Production Connection
      Repository pattern
      Strategy pattern
      Framework examples
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default oop;
