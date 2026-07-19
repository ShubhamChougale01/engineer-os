import type { SkillContent } from "../types";

/**
 * Spring Boot — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const springBoot: SkillContent = {
  overview: `
Spring Boot is an opinionated, convention-over-configuration layer on top of the Spring Framework — the dominant enterprise application framework in the Java ecosystem — designed to eliminate the enormous XML/configuration boilerplate that made classic Spring notoriously heavy to start a new project with. Spring Boot's core idea is "auto-configuration": given the dependencies on your classpath (a web starter, a database driver, a security library), Spring Boot inspects them and configures sensible defaults automatically, letting a genuinely production-grade Spring application start from a single annotated class and a handful of dependency declarations rather than pages of XML wiring.

For an AI engineer, Spring Boot shows up wherever an organization's existing backend infrastructure is Java/JVM-based — banks, insurance companies, large enterprises, and any company whose core services predate the recent Python/Node.js-centric AI tooling boom. Shipping an AI feature into such an organization frequently means either calling out to a Python-based model-serving service FROM a Spring Boot application, or building the AI feature's surrounding business logic (orders, users, permissions) directly in Spring Boot because that is where the rest of the company's data and systems already live.

Key characteristics: dependency injection and inversion of control as the framework's foundational architectural pattern (an object's dependencies are provided TO it, not constructed BY it); auto-configuration that dramatically reduces manual setup for common needs (a web server, a database connection, security); "starters" — curated dependency bundles (spring-boot-starter-web, spring-boot-starter-data-jpa) that pull in a coherent, tested set of compatible libraries with one line; and a mature, heavily used ecosystem (Spring Data, Spring Security, Spring Cloud) covering nearly every enterprise concern out of the box.
`,

  history: `
Spring Framework was created by **Rod Johnson**, emerging directly from his 2002 book critiquing the complexity of early Java EE (then J2EE) development; Spring Boot arrived roughly a decade later as Spring's own answer to configuration complexity that had crept back into the Spring ecosystem itself.

| Year | Milestone |
|------|-----------|
| 2002 | Rod Johnson publishes "Expert One-on-One J2EE Design and Development," critiquing J2EE's complexity and prototyping the ideas that become Spring |
| 2003 | The **Spring Framework** project begins, built around dependency injection as a lighter alternative to heavyweight J2EE EJBs |
| 2004 | Spring 1.0 released |
| 2006 | Spring 2.0 — XML configuration becomes more expressive; annotation-based configuration begins appearing |
| 2009 | **VMware acquires SpringSource** (the company behind Spring), later becoming part of Pivotal |
| 2013 | Spring 4.0 — full Java 8 support; heavy emphasis on annotation-based, XML-free configuration |
| 2014 | **Spring Boot 1.0** released — auto-configuration, starters, and embedded servers (Tomcat/Jetty bundled directly into the application) eliminate most remaining setup boilerplate |
| 2017 | Spring Boot 2.0 — reactive programming support via Spring WebFlux, alongside the traditional Spring MVC stack |
| 2018 | Pivotal (Spring's steward) is acquired by VMware |
| 2022 | **Spring Boot 3.0** — a major jump requiring Java 17+ and migrating the entire ecosystem from the javax.* namespace to jakarta.* (following Java EE's transfer to the Eclipse Foundation as Jakarta EE) |
| 2023–2024 | Spring Boot 3.x — native image support (via GraalVM) matures significantly, targeting faster startup and lower memory for cloud-native and serverless deployments |
| 2025+ | Continued Spring Boot 3.x releases; GraalVM native compilation and virtual threads (from Java 21, adopted directly by Spring's concurrency model) continue maturing |

The javax-to-jakarta namespace migration accompanying Spring Boot 3.0 was one of the most disruptive changes in Spring's history for existing codebases — a stark reminder that even a framework famous for careful backward compatibility occasionally needs a genuinely breaking migration when the underlying platform itself (Java EE's governance move to the Eclipse Foundation) changes.
`,

  "why-it-exists": `
Spring Boot exists because **Spring Framework itself had, over a decade, become exactly the kind of configuration-heavy, hard-to-start ecosystem it was originally created to replace** — setting up even a simple Spring web application required significant XML configuration, manually choosing and wiring compatible library versions, and configuring an external application server to deploy to.

The prior landscape (classic Spring, pre-Boot) offered:

1. **Full manual control via XML/Java configuration**: every bean, every dependency, every server setting explicitly wired — powerful, but a genuinely significant amount of boilerplate before writing any actual business logic.
2. **Deploying to an external application server** (Tomcat, JBoss, WebSphere) as a separate, manually configured piece of infrastructure a WAR file was deployed into — an entire additional operational surface to manage per environment.

Spring Boot's insight was "convention over configuration, but escape-hatched": ship curated "starter" dependency bundles that pull in known-compatible library versions together, use classpath inspection to auto-configure sensible defaults (if a database driver is present, configure a datasource; if Spring Security is present, secure everything by default), and EMBED the application server directly inside the application itself (an executable JAR containing Tomcat, not a WAR deployed to an external one) — collapsing what used to be days of setup into a single annotated main class and a pom.xml/build.gradle dependency list, while still allowing any auto-configured default to be overridden explicitly when a project's needs diverge from the common case.
`,

  "problem-it-solves": `
Spring Boot solves the **"stop re-solving the same configuration and dependency-compatibility problems on every new Spring project"** problem.

Concretely, Spring Boot removes:

- **Manual dependency version management**: starters (spring-boot-starter-web, spring-boot-starter-data-jpa) pull in a coherent, pre-tested set of compatible library versions with one dependency declaration, eliminating the classic "which version of this library works with that version of Spring" investigation.
- **Manual bean/component wiring for common infrastructure**: auto-configuration inspects the classpath and application properties to configure a DataSource, a web server, security defaults, and dozens of other common concerns automatically, only requiring explicit configuration where the defaults don't fit.
- **External application server deployment**: an embedded servlet container (Tomcat by default) is bundled directly into the executable JAR — java -jar myapp.jar starts a fully running web application with no separate application server installation or configuration.
- **Inconsistent project structure across teams**: Spring Initializr (a project generator) and Spring Boot's conventions give nearly every Spring Boot project a recognizably similar shape, easing onboarding across teams and companies.

What Spring Boot deliberately does **not** solve: it does not make Java itself a lightweight, low-ceremony language — verbosity relative to Python or Go remains a real characteristic of the JVM ecosystem generally; it does not eliminate the learning curve of Spring's dependency injection and AOP (aspect-oriented programming) concepts, which remain genuinely non-trivial for engineers new to the framework; and it does not change the JVM's inherent startup-time and memory-footprint characteristics without additional, explicit work (GraalVM native image compilation), which trades those improvements for build complexity and some feature limitations.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain dependency injection and inversion of control precisely enough to reason about how Spring wires an application together.
2. Build a Spring Boot REST API using controllers, services, and repositories, following the standard layered architecture.
3. Use Spring Data JPA effectively for database access, including relationships, custom queries, and the N+1 query problem.
4. Configure Spring Boot applications correctly across environments using application.properties/application.yml and profiles.
5. Apply Spring Security to authenticate and authorize API endpoints, including JWT-based stateless authentication.
6. Explain Spring Boot's auto-configuration mechanism well enough to debug "why did Spring configure this bean this way" issues.
7. Test Spring Boot applications at the unit, slice, and integration levels using Spring's testing support.
8. Deploy a Spring Boot application as a container, understanding the tradeoffs of JVM vs. GraalVM native image deployment.
9. Answer senior-level interview questions on the Spring bean lifecycle, AOP, and Spring Boot's auto-configuration internals.
`,

  prerequisites: `
- **Required**: solid **Java** fundamentals — classes, interfaces, generics, annotations, and the collections framework; Spring Boot is Java (or increasingly, Kotlin) through and through (see the **Java** skill).
- **Required**: basic **SQL** and relational database concepts if using Spring Data JPA, Spring Boot's most common database-access layer.
- **Helpful**: the **REST** architectural style for building APIs.
- **Helpful**: exposure to dependency injection as a concept from any language/framework makes Spring's core idea click faster, though this page explains it from scratch.

Dependency links: **Java** → this page → **PostgreSQL**/**MySQL** for the production database layer → **Docker**/**Kubernetes** for deployment → **REST** and **OAuth 2.0**/**JWT** for the API and security patterns Spring Security implements.
`,

  "beginner-concepts": `
### Your first Spring Boot application

~~~java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}

@RestController
class GreetingController {
    @GetMapping("/greet/{name}")
    public String greet(@org.springframework.web.bind.annotation.PathVariable String name) {
        return "Hello, " + name + "!";
    }
}
~~~

@SpringBootApplication is a composite annotation bundling @Configuration, @EnableAutoConfiguration, and @ComponentScan — running this class starts an embedded web server (Tomcat by default) with auto-configuration inspecting the classpath to wire everything needed for a working web application.

### Dependency injection — Spring's foundational idea

~~~java
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Autowired;

@Repository
class UserRepository {
    public String findNameById(long id) { return "Ada"; }
}

@Service
class GreetingService {
    private final UserRepository userRepository;

    @Autowired   // constructor injection — the recommended, testable style
    public GreetingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String greetUser(long id) {
        return "Hello, " + userRepository.findNameById(id) + "!";
    }
}
~~~

Instead of GreetingService creating its own UserRepository instance (new UserRepository()), Spring CONSTRUCTS the UserRepository and INJECTS it into GreetingService's constructor automatically — this is dependency injection: a class declares what it needs, and a container (Spring's IoC container) provides it, rather than the class constructing its own dependencies directly.

### REST controllers and request mapping

~~~java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        return postService.findById(id);
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return postService.create(post);
    }
}
~~~

@RestController combines @Controller and @ResponseBody, meaning every method's return value is automatically serialized to JSON (via Jackson) and written directly to the HTTP response body, rather than being resolved as a view template name.

### Entities and Spring Data JPA basics

~~~java
import jakarta.persistence.*;

@Entity
class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    // getters and setters
}

import org.springframework.data.jpa.repository.JpaRepository;

interface PostRepository extends JpaRepository<Post, Long> {
    // findAll(), findById(), save(), delete() all provided automatically
}
~~~

@Entity marks a class as mapping to a database table via JPA (Jakarta Persistence API); extending JpaRepository gives you a full set of CRUD methods with ZERO implementation code — Spring Data generates the implementation at runtime based on the interface's method signatures and naming conventions.

### Configuration via application.properties

~~~
# src/main/resources/application.properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=app_user
spring.jpa.hibernate.ddl-auto=validate
~~~

application.properties (or the YAML equivalent, application.yml) is where Spring Boot's auto-configured defaults are overridden — a database URL here automatically configures a DataSource bean without any Java code required.

Common beginner trap: mismatching JPA's automatic ddl-auto schema generation with a real production migration tool — covered fully in Production Usage and Anti-Patterns.
`,

  "intermediate-concepts": `
### Service layer and transactional boundaries

~~~java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class OrderService {
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    public OrderService(OrderRepository orderRepository, InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional   // both writes succeed together, or both roll back
    public Order placeOrder(Long productId, int quantity) {
        inventoryRepository.decrementStock(productId, quantity);
        return orderRepository.save(new Order(productId, quantity));
    }
}
~~~

@Transactional wraps a method in a database transaction — Spring's declarative transaction management means you annotate the boundary rather than manually managing commit/rollback calls, and any runtime exception thrown inside triggers an automatic rollback by default.

### Spring Data JPA relationships and the N+1 problem

~~~java
@Entity
class Post {
    @ManyToOne(fetch = FetchType.LAZY)   // LAZY: don't load the author until actually accessed
    @JoinColumn(name = "author_id")
    private User author;
}

// BAD: iterating posts and accessing .getAuthor() triggers ONE extra query per post
List<Post> posts = postRepository.findAll();
for (Post p : posts) { System.out.println(p.getAuthor().getName()); }   // N+1 queries

// GOOD: a JOIN FETCH query eager-loads the relationship in one query
@Query("SELECT p FROM Post p JOIN FETCH p.author")
List<Post> findAllWithAuthor();
~~~

JPA's lazy loading (the safer default) defers fetching a related entity until it's actually accessed — convenient, but exactly the same N+1 query trap seen in Django's and Express's ORMs if you iterate and access lazy relationships without an explicit JOIN FETCH or an @EntityGraph annotation.

### Dependency injection styles: constructor vs field injection

~~~java
// PREFERRED: constructor injection — dependencies are final, required at construction,
// and trivially mockable in tests without any Spring context
@Service
class GoodService {
    private final UserRepository repo;
    public GoodService(UserRepository repo) { this.repo = repo; }
}

// DISCOURAGED: field injection — works, but hides required dependencies,
// makes the class harder to instantiate outside a Spring context (e.g. in plain unit tests)
@Service
class DiscouragedService {
    @Autowired
    private UserRepository repo;
}
~~~

Modern Spring guidance strongly prefers constructor injection: dependencies become explicit, immutable (final), and the class can be instantiated directly (new GoodService(mockRepo)) in a plain unit test without needing Spring's test context at all.

### Spring profiles for environment-specific configuration

~~~
# application-dev.properties
spring.datasource.url=jdbc:h2:mem:devdb

# application-prod.properties
spring.datasource.url=jdbc:postgresql://prod-db:5432/mydb
~~~

~~~bash
java -jar myapp.jar --spring.profiles.active=prod
~~~

Profiles let one codebase carry environment-specific configuration files (dev, test, prod), activated at startup, rather than branching logic inside application code itself.

### Exception handling with @ControllerAdvice

~~~java
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@ControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<String> handleNotFound(PostNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
~~~

@ControllerAdvice centralizes exception-to-HTTP-response mapping across every controller in the application, Spring's equivalent of Django's exception middleware or Express's centralized error-handling middleware.

### Spring Boot Actuator

~~~
management.endpoints.web.exposure.include=health,metrics,info
~~~

Actuator (a starter dependency, spring-boot-starter-actuator) exposes production-ready operational endpoints (/actuator/health, /actuator/metrics) automatically once added, giving health checks and metrics with essentially zero code, directly consumed by orchestrators (Kubernetes liveness/readiness probes) and monitoring systems (Prometheus).
`,

  "advanced-concepts": `
### The Spring bean lifecycle

~~~mermaid
flowchart LR
    A["Bean instantiation\n(constructor called)"] --> B["Dependency injection\n(constructor/setter/field)"]
    B --> C["Aware interfaces invoked\n(if implemented)"]
    C --> D["BeanPostProcessor.before\n(pre-initialization hooks)"]
    D --> E["@PostConstruct / afterPropertiesSet\n(initialization)"]
    E --> F["BeanPostProcessor.after"]
    F --> G["Bean ready for use"]
    G --> H["@PreDestroy on shutdown"]
~~~

Understanding this lifecycle matters for correctly using @PostConstruct (run initialization logic after dependency injection completes but before the bean is used) and @PreDestroy (cleanup on application shutdown), and for reasoning about the order BeanPostProcessors (used internally by many Spring features, including AOP proxying) intercept bean creation.

### Aspect-Oriented Programming (AOP)

~~~java
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
class LoggingAspect {
    @Around("execution(* com.example.service.*.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long elapsed = System.currentTimeMillis() - start;
        System.out.println(joinPoint.getSignature() + " took " + elapsed + "ms");
        return result;
    }
}
~~~

AOP lets you inject cross-cutting behavior (logging, transaction management, security checks — @Transactional and Spring Security's method-level security are themselves implemented via AOP internally) around method calls matching a pattern, WITHOUT modifying the target class's code — implemented via runtime proxies (JDK dynamic proxies for interfaces, CGLIB byte-code generation for concrete classes) that Spring generates automatically.

### Auto-configuration internals

~~~java
@Configuration
@ConditionalOnClass(DataSource.class)          // only applies if this class is on the classpath
@ConditionalOnMissingBean(DataSource.class)     // only applies if the app hasn't defined its own
class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
~~~

Spring Boot's auto-configuration classes (hundreds of them, shipped inside spring-boot-autoconfigure) use @Conditional annotations (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty) to decide whether to apply a given piece of default configuration — this is WHY adding a dependency to your classpath can automatically configure new behavior, and why defining your own bean of the same type silently overrides the auto-configured default, no explicit "disable" step required.

### Reactive programming with Spring WebFlux

~~~java
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

@RestController
class ReactivePostController {
    @GetMapping("/posts/{id}")
    public Mono<Post> getPost(@PathVariable Long id) {
        return postRepository.findById(id);   // non-blocking, returns immediately with a Publisher
    }

    @GetMapping("/posts")
    public Flux<Post> allPosts() {
        return postRepository.findAll();        // a stream of zero-to-many items
    }
}
~~~

Spring WebFlux is Spring's fully non-blocking, reactive alternative to the traditional Spring MVC (servlet-based, thread-per-request) stack, built on Project Reactor's Mono (0-or-1 result) and Flux (0-to-many results) types — chosen specifically for very high-concurrency, I/O-bound workloads where the traditional thread-per-request model would need an impractically large thread pool; it requires a genuinely reactive data-access layer (R2DBC rather than JPA) throughout the stack to realize its benefit.

### Virtual threads (Java 21+) as an alternative to reactive programming

~~~
# application.properties
spring.threads.virtual.enabled=true
~~~

Java 21's virtual threads (lightweight, JVM-managed threads, see the **Java** skill) let the traditional, simpler-to-write blocking Spring MVC programming model scale to very high concurrency WITHOUT rewriting to WebFlux's reactive style — increasingly the preferred path for new high-concurrency Spring Boot applications, since it preserves familiar, blocking-style code while gaining much of reactive programming's scalability benefit.

### GraalVM native image compilation

~~~bash
./mvnw -Pnative native:compile
~~~

Ahead-of-time compilation to a native executable (via GraalVM, with Spring Boot 3's first-class support) trades a significantly longer, more constrained build process for dramatically faster startup time and lower memory footprint — directly relevant for serverless/cloud-native deployments where JVM startup latency and idle memory cost matter, at the cost of some reflection-heavy libraries needing explicit configuration to work correctly under native compilation.
`,

  "internal-working": `
What happens inside Spring Boot from application startup to a running, request-serving application:

~~~mermaid
flowchart LR
    A["main() calls\nSpringApplication.run()"] --> B["Spring ApplicationContext\ncreated (the IoC container)"]
    B --> C["Component scanning\ndiscovers @Component/@Service/@Repository/@Controller"]
    C --> D["Auto-configuration classes\napply based on classpath + @Conditional checks"]
    D --> E["Beans instantiated\nand dependency-injected"]
    E --> F["Embedded Tomcat starts\n(if a web starter is present)"]
    F --> G["Application ready\nto serve HTTP requests"]
~~~

1. **SpringApplication.run() bootstraps the application**: it creates the ApplicationContext (Spring's IoC container, responsible for the entire lifecycle of every managed bean).
2. **Component scanning**: Spring scans the package (and sub-packages) of the @SpringBootApplication-annotated class for classes annotated @Component, @Service, @Repository, @Controller (and @RestController), registering them as candidate beans.
3. **Auto-configuration evaluation**: every auto-configuration class shipped in spring-boot-autoconfigure is evaluated against its @Conditional annotations (is a specific class on the classpath? has the application already defined its own bean of this type? does a specific property exist?) — only matching configurations actually apply.
4. **Bean instantiation and dependency injection**: Spring resolves the dependency graph among all registered beans, constructing them in dependency order and injecting each bean's required dependencies (typically via constructor injection).
5. **Embedded server startup**: if a web starter (spring-boot-starter-web or spring-boot-starter-webflux) is present, Spring Boot starts an embedded Tomcat (or Jetty/Undertow/Netty for WebFlux) directly inside the running JVM process — no external application server needed.

**Why auto-configuration order and conditions matter**: because dozens of auto-configuration classes can potentially apply, and many depend on each other (a JPA auto-configuration needs a DataSource to already exist), Spring Boot orders auto-configuration evaluation carefully and uses @AutoConfigureAfter/@AutoConfigureBefore annotations internally — understanding this is essential when debugging "why is Spring configuring X differently than I expected" issues, which almost always trace back to a specific @Conditional check passing or failing based on the exact classpath and properties present.
`,

  architecture: `
A senior engineer thinks about Spring Boot at two levels: **the IoC container and bean graph** (what Spring actually manages at runtime) and **the layered application architecture** (how a real Spring Boot codebase is organized).

### The IoC container as runtime architecture

~~~mermaid
flowchart TB
    subgraph Context["Spring ApplicationContext (the IoC container)"]
        Controllers["@RestController beans\n(HTTP layer)"]
        Services["@Service beans\n(business logic)"]
        Repositories["@Repository beans\n(data access)"]
        Config["@Configuration beans\n(explicit bean definitions)"]
    end
    Controllers --> Services
    Services --> Repositories
    Repositories --> DB[("Database")]
~~~

Every bean's lifecycle — creation, dependency injection, initialization, and destruction — is managed by the ApplicationContext, not by application code directly instantiating classes; this centralization is precisely what makes Spring's cross-cutting features (AOP, transaction management, security) possible without invasive changes to business logic classes.

### Layered project structure (standard Spring Boot conventions)

~~~
myapp/
├── src/main/java/com/example/myapp/
│   ├── MyApplication.java         # @SpringBootApplication entrypoint
│   ├── controller/
│   │   └── PostController.java     # @RestController, HTTP concerns only
│   ├── service/
│   │   └── PostService.java         # @Service, business logic
│   ├── repository/
│   │   └── PostRepository.java      # extends JpaRepository, data access
│   ├── model/ (or entity/)
│   │   └── Post.java                 # @Entity classes
│   ├── dto/
│   │   └── PostResponse.java          # API-facing data transfer objects, separate from entities
│   └── config/
│       └── SecurityConfig.java         # @Configuration classes
├── src/main/resources/
│   ├── application.properties
│   └── application-prod.properties
└── src/test/java/...
~~~

Rules mature Spring Boot teams follow: keep controllers thin (HTTP concerns only — status codes, request/response mapping), push business logic into services, keep entities (JPA-mapped) separate from DTOs (API-facing shapes) so internal schema changes don't automatically break the public API contract, and use @Configuration classes for anything not naturally a @Component/@Service/@Repository.
`,

  "data-flow": `
Tracing one HTTP request end to end — a GET request for a post's detail:

~~~mermaid
sequenceDiagram
    participant Client
    participant Tomcat as Embedded Tomcat
    participant DispatcherServlet
    participant Controller
    participant Service
    participant Repository
    participant DB as PostgreSQL

    Client->>Tomcat: GET /api/posts/42
    Tomcat->>DispatcherServlet: HttpServletRequest
    DispatcherServlet->>DispatcherServlet: resolve handler mapping\n(match path to controller method)
    DispatcherServlet->>Controller: getPost(id=42)
    Controller->>Service: postService.findById(42)
    Service->>Repository: postRepository.findById(42)
    Repository->>DB: SELECT ... WHERE id = 42
    DB-->>Repository: row data
    Repository-->>Service: Optional<Post>
    Service-->>Controller: Post (or throws PostNotFoundException)
    Controller-->>DispatcherServlet: return value (or exception)
    DispatcherServlet->>DispatcherServlet: Jackson serializes to JSON\n(or GlobalExceptionHandler maps the exception)
    DispatcherServlet-->>Tomcat: HttpServletResponse
    Tomcat-->>Client: 200 OK + JSON
~~~

The most misunderstood part for newcomers: **DispatcherServlet is Spring MVC's single front controller** — every incoming request passes through it first, which resolves the correct handler (controller method) via registered HandlerMapping strategies, invokes any configured interceptors/filters, and finally delegates to the matched controller method — understanding that controllers themselves never directly touch the raw servlet request/response (Spring's abstractions sit between them) explains why Spring MVC code looks so different from raw servlet code while still running on the same underlying servlet container.
`,

  "production-usage": `
### Building and running

~~~bash
./mvnw clean package
java -jar target/myapp-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
~~~

The Maven/Gradle build produces a single, executable "fat JAR" containing the application code, all dependencies, AND an embedded Tomcat server — java -jar is genuinely sufficient to run the entire application, no separate application server installation needed.

### Configuration for production

~~~
# application-prod.properties
spring.datasource.url=jdbc:postgresql://prod-db:5432/mydb
spring.datasource.hikari.maximum-pool-size=20
spring.jpa.hibernate.ddl-auto=validate
management.endpoints.web.exposure.include=health,metrics
logging.level.root=INFO
~~~

Non-negotiables for production:

1. **spring.jpa.hibernate.ddl-auto=validate (or none), never update/create-drop** — letting Hibernate auto-generate/alter your production schema is a well-known source of unexpected, uncontrolled schema changes; use a real migration tool (Flyway or Liquibase) instead.
2. **HikariCP connection pool sized deliberately** — Spring Boot's default connection pool (HikariCP) needs its maximum-pool-size tuned to actual expected concurrency and the database's own connection limits.
3. **Actuator endpoints secured appropriately** — /actuator/health is typically safe to expose publicly for health checks, but /actuator/env or /actuator/heapdump can leak sensitive configuration or memory contents if left open.

### Common production stacks

- **Enterprise REST APIs**: Spring Boot + Spring Data JPA + PostgreSQL/Oracle + Spring Security, the most common overall combination in large, established companies.
- **Migrations**: Flyway or Liquibase, run as an explicit step (often via a startup dependency or CI/CD pipeline stage) separate from JPA's own schema-generation feature.
- **Testing**: JUnit 5 with Spring Boot's testing starter, using @SpringBootTest for full-context integration tests and @WebMvcTest/@DataJpaTest for focused "slice" tests.
`,

  "industry-examples": `
- **Netflix**: built extensively on Spring Boot for its microservices architecture, and open-sourced significant Spring Cloud Netflix components (Eureka for service discovery, Hystrix for circuit breaking) that became foundational parts of the broader Spring Cloud ecosystem.
- **Alibaba**: uses Spring Boot/Spring Cloud extensively across its e-commerce platform's microservices, and maintains Spring Cloud Alibaba, an alternative Spring Cloud implementation tailored to its own infrastructure.
- **Many large banks and insurance companies** (a pattern rather than a single named example, given confidentiality norms in finance): Spring Boot is the dominant backend framework choice across the industry for core banking, claims processing, and compliance-critical systems, valued for the JVM's maturity, Spring Security's depth, and the enormous existing base of Java engineering talent.
- **Trivago**: uses Spring Boot for parts of its high-traffic hotel search and comparison backend, citing the ecosystem's maturity and performance under real production load.
- **Intuit**: has publicly discussed using Spring Boot across parts of its backend services supporting products like TurboTax and QuickBooks.
- **Zalando**: one of Europe's largest e-commerce platforms, uses Spring Boot extensively across its microservices architecture and has open-sourced several Spring Boot-adjacent tooling projects.
- **Government and public-sector systems worldwide**: Spring Boot's maturity, security track record, and large talent pool make it a common choice for long-lived, compliance-heavy public infrastructure systems.

Pattern to notice: Spring Boot adoption clusters heavily around **large enterprises, financial services, and organizations with an existing deep JVM investment** — precisely where an AI feature is most likely to need to integrate with existing business logic and data that already lives in a Spring Boot ecosystem.
`,

  "best-practices": `
1. **Prefer constructor injection over field injection** — explicit, immutable dependencies that are trivially testable without a Spring context.
2. **Keep controllers thin** — HTTP concerns only (status codes, request/response mapping); business logic belongs in services, testable independent of the web layer.
3. **Separate JPA entities from API-facing DTOs** — prevents internal schema changes from silently breaking the public API contract, and avoids accidentally serializing lazy-loaded relationships or internal fields.
4. **Never use ddl-auto=update or create-drop in production** — use Flyway or Liquibase for real, reviewable, versioned schema migrations.
5. **Fix N+1 queries with JOIN FETCH or @EntityGraph** — the same universal ORM discipline as Django's select_related and Express's Prisma include, just Spring Data JPA's specific mechanisms.
6. **Use @Transactional deliberately, understanding its propagation and rollback rules** — a runtime (unchecked) exception triggers rollback by default; a checked exception does NOT, a frequent source of confusion.
7. **Use Spring profiles for environment-specific configuration**, never branching logic in application code based on an environment check.
8. **Secure Actuator endpoints appropriately** — expose only what's needed (typically just /health for orchestrator probes) publicly; restrict the rest.
9. **Write tests at the appropriate level**: unit tests for services with mocked dependencies (no Spring context needed), @DataJpaTest for repository-layer slice tests, @SpringBootTest sparingly for genuine full-context integration tests (these are the slowest).
10. **Use Bean Validation (@Valid, @NotNull, @Size) on request DTOs** rather than manual, scattered validation logic in controllers.
11. **Version your REST API deliberately** (URL path versioning or a header-based scheme) rather than making breaking changes to an existing endpoint's contract.
12. **Monitor GC pauses and heap usage explicitly** — the JVM's garbage collector behavior is a real, measurable production concern distinct from application-level performance metrics.
`,

  "anti-patterns": `
### Letting Hibernate auto-manage the production schema

~~~
# WRONG in production — Hibernate silently alters your schema based on entity changes,
# with no review step and real risk of data loss on certain changes
spring.jpa.hibernate.ddl-auto=update

# RIGHT — validate that entities match a schema managed explicitly by Flyway/Liquibase
spring.jpa.hibernate.ddl-auto=validate
~~~

Using ddl-auto=update (or worse, create-drop) in production is one of the most damaging common Spring Boot misconfigurations — schema changes should be explicit, reviewed migration files, not implicitly inferred from whatever your entity classes currently look like.

### Field injection instead of constructor injection

~~~java
// DISCOURAGED
@Service
class OrderService {
    @Autowired
    private PaymentGateway paymentGateway;   // hidden dependency, hard to unit test without Spring
}

// PREFERRED
@Service
class OrderService {
    private final PaymentGateway paymentGateway;
    public OrderService(PaymentGateway paymentGateway) { this.paymentGateway = paymentGateway; }
}
~~~

### Other production-grade anti-patterns

- **The N+1 query problem via unmanaged lazy loading**: iterating entities and accessing lazy relationships without JOIN FETCH/@EntityGraph, invisible with small test data, severe at real production scale — identical to the Django/Express equivalent, just via JPA's mechanisms.
- **Exposing JPA entities directly as API responses**: leaks internal schema details, risks lazy-loading exceptions when Jackson tries to serialize an uninitialized lazy relationship outside a transaction, and couples your public API contract to your database schema.
- **Catching and swallowing exceptions silently in a service method annotated @Transactional**: since Spring's default rollback behavior triggers only on unchecked exceptions escaping the method, a caught-and-logged exception silently prevents an otherwise-intended rollback.
- **Ignoring Actuator's default endpoint exposure in production** without explicitly configuring management.endpoints.web.exposure.include — leaving sensitive operational endpoints unintentionally reachable.
- **Overusing @Autowired field injection in tests** instead of constructing objects directly with mocked dependencies, making unit tests unnecessarily slow by pulling in Spring's test context when a plain JUnit test would do.
- **Ignoring connection pool sizing**, leaving HikariCP's defaults unexamined for a workload whose actual concurrency profile differs meaningfully from the default assumptions.
`,

  performance: `
### Rule zero: measure first

~~~bash
# Actuator's built-in metrics endpoint, scraped by Prometheus in production
curl localhost:8080/actuator/metrics/http.server.requests

# JVM-level profiling
java -jar myapp.jar -XX:+PrintGCDetails   # or use a real profiler: async-profiler, JProfiler, VisualVM
~~~

Never guess at JVM/GC behavior — Actuator's metrics endpoint and dedicated JVM profiling tools give concrete data on where time is actually spent.

### The performance hierarchy (apply in order)

1. **Fix N+1 queries first** — JOIN FETCH or @EntityGraph, exactly the highest-leverage, cheapest fix across every framework covered on this platform.
2. **Tune the HikariCP connection pool** to match actual concurrency and the database's own connection ceiling — an undersized pool creates a bottleneck that looks like a slow database.
3. **Cache expensive, infrequently-changing data** with Spring Cache (@Cacheable, backed by Redis or Caffeine for in-process caching) rather than recomputing or re-querying every request.
4. **Choose the right concurrency model for the workload**: traditional blocking Spring MVC (simplest, now scaling further via Java 21 virtual threads) versus Spring WebFlux (genuinely non-blocking, more complex, needed for extreme I/O-bound concurrency with a fully reactive data layer).
5. **Tune JVM heap and garbage collector settings** for the specific workload — the default GC (G1 in recent JVMs) suits most applications, but very large heaps or extreme latency sensitivity may warrant explicit tuning or an alternative collector (ZGC, Shenandoah).
6. **Consider GraalVM native image compilation** specifically to address JVM startup time and idle memory footprint, particularly relevant for serverless/cloud-native deployments where these costs are paid on every cold start.

### Micro-level facts worth knowing

- Jackson's JSON serialization/deserialization cost is usually negligible relative to database and network I/O, but worth profiling specifically for endpoints handling unusually large or deeply nested payloads.
- Spring's AOP proxying (used for @Transactional, security checks, and caching) has a small per-call overhead versus a direct method call — negligible for nearly all real applications, occasionally worth knowing when reasoning about an extremely hot internal call path.
- The embedded Tomcat's thread pool size (server.tomcat.threads.max) directly bounds traditional Spring MVC's concurrent request-handling capacity — undersized relative to real traffic, it becomes an artificial ceiling independent of any other bottleneck.
`,

  scalability: `
Spring Boot applications scale the same way most JVM web services do — **horizontally**, behind a load balancer, with JVM-specific considerations (heap sizing, GC behavior, startup time) layered on top of the universal web-service scaling story.

### Single-region architecture

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Spring Boot instance 1\n(JVM, embedded Tomcat)"]
    LB --> S2["Spring Boot instance N"]
    S1 & S2 --> Cache[("Redis\ncache + sessions")]
    S1 & S2 --> DB[("PostgreSQL\nprimary + read replicas")]
    S1 & S2 --> MQ["Kafka/RabbitMQ\n(async messaging, if used)"]
~~~

Spring Boot instances are typically stateless (sessions externalized to Redis via Spring Session if needed), so horizontal scaling is the standard pattern — add more instances behind a load balancer, with the database and any shared cache/message broker as the more common eventual bottlenecks.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| N+1 queries at scale | JOIN FETCH/@EntityGraph — nearly always the first, cheapest fix |
| Thread pool exhaustion under high concurrency (traditional Spring MVC) | Increase Tomcat's thread pool cautiously, or adopt Java 21 virtual threads/Spring WebFlux for genuinely high I/O-bound concurrency |
| Slow JVM cold-start time in auto-scaling/serverless environments | GraalVM native image compilation, trading build complexity for dramatically faster startup |
| GC pause spikes under memory pressure | Tune heap size and GC algorithm choice (G1 default, ZGC for very large heaps/low-latency needs); reduce unnecessary object allocation in hot paths |
| Database write contention at large scale | Read replicas for read-heavy load, careful indexing, and message-queue-based async processing (Kafka/RabbitMQ) for non-blocking workflows |
`,

  security: `
### Spring Security's role

Spring Security is the standard, deeply integrated security framework for Spring Boot applications, covering authentication, authorization, and common web vulnerability defenses:

1. **CSRF protection**: enabled by default for session-based (cookie-authenticated) applications; typically disabled explicitly for stateless, token-authenticated REST APIs where CSRF's underlying attack model doesn't apply the same way (see the **CSRF** skill for when this default-disable is actually appropriate).
2. **Authentication**: supports form login, HTTP Basic, OAuth2/OIDC (including acting as a resource server validating JWTs issued by an external identity provider), and fully custom authentication schemes.
3. **Authorization**: method-level security (@PreAuthorize, @Secured) and URL-pattern-based security configuration, both ultimately implemented via Spring's AOP proxying mechanism.
4. **Password storage**: BCryptPasswordEncoder (or Argon2/PBKDF2 variants) is the standard, strongly recommended password-hashing mechanism (see the **Hashing** skill) — never store or compare plaintext passwords.

### What Spring Security does NOT automatically prevent

- **Object-level authorization bugs**: verifying a user is entitled to a permission in general (via @PreAuthorize) is distinct from verifying they're entitled to the SPECIFIC object/resource they're requesting — the latter requires explicit checks in service logic, the same gap seen in Django's equivalent.
- **SQL injection via raw/native queries**: Spring Data JPA's derived query methods and JPQL parameterize safely, but @Query(nativeQuery = true) with string-concatenated user input reintroduces the risk exactly as any raw SQL would (see the **SQL Injection** skill).
- **Business-logic authorization bugs generally**: Spring Security secures the FRAMEWORK-level authentication/authorization surface; application-specific business rules about who can do what to which data remain the application developer's responsibility to implement correctly.

### JWT-based stateless authentication (the common REST API pattern)

~~~java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())                          // appropriate for stateless, token-authenticated APIs
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
    return http.build();
}
~~~

Configuring Spring Security as an OAuth2 resource server validating incoming JWTs (issued by a separate identity provider or your own auth service) is the standard modern pattern for a stateless Spring Boot REST API, avoiding server-side session state entirely — see the **JWT** and **OAuth 2.0 / OIDC** skills for the general protocol depth this builds on.

See the **OWASP Top 10** and **Secrets Management** skills for depth beyond Spring-specifics.
`,

  testing: `
Spring Boot's testing support (via spring-boot-starter-test, bundling JUnit 5, Mockito, and AssertJ) provides several distinct testing levels, each trading test speed against realism.

~~~java
// Unit test: no Spring context at all, fastest, tests business logic in isolation
class OrderServiceTest {
    @Test
    void placeOrderDecrementsInventory() {
        InventoryRepository mockInventory = mock(InventoryRepository.class);
        OrderRepository mockOrders = mock(OrderRepository.class);
        OrderService service = new OrderService(mockOrders, mockInventory);

        service.placeOrder(1L, 5);

        verify(mockInventory).decrementStock(1L, 5);
    }
}

// Slice test: loads only the JPA-related Spring context, real database (often H2 in-memory)
@DataJpaTest
class PostRepositoryTest {
    @Autowired private PostRepository postRepository;

    @Test
    void savesAndRetrievesPost() {
        Post saved = postRepository.save(new Post("Title"));
        assertThat(postRepository.findById(saved.getId())).isPresent();
    }
}

// Full integration test: loads the ENTIRE application context, slowest, most realistic
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PostControllerIntegrationTest {
    @Autowired private TestRestTemplate restTemplate;

    @Test
    void getPostReturns200() {
        ResponseEntity<Post> response = restTemplate.getForEntity("/api/posts/1", Post.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
~~~

### The senior testing doctrine

- Prefer plain unit tests with mocked dependencies (no Spring context) for business logic wherever possible — dramatically faster than any Spring-context-loading test.
- Use @DataJpaTest, @WebMvcTest, and other "slice" test annotations to load only the relevant portion of the Spring context, faster than a full @SpringBootTest.
- Reserve @SpringBootTest for genuine end-to-end integration coverage, sparingly, since it's the slowest test type by a wide margin.
- Use Testcontainers for integration tests needing a real database (PostgreSQL, not just H2's approximation) to catch database-specific SQL behavior differences.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the stack trace fully, starting from the root cause** — Spring's exception wrapping (a common source of confusion) can produce deep cause chains; getCause() repeatedly, or a good IDE's stack trace view, gets to the real originating exception.
2. **Enable debug logging for Spring's own auto-configuration decisions**:

~~~
# application.properties
debug=true
~~~

This prints a full auto-configuration report at startup, showing exactly which auto-configuration classes matched (and why) and which were excluded (and why) — the single most useful tool for "why is Spring configuring this differently than I expected."

3. **Actuator's /actuator/beans and /actuator/conditions endpoints** — inspect the full bean graph and every conditional evaluation Spring made, directly in a running application.
4. **A real debugger (IntelliJ IDEA/Eclipse)** — standard breakpoint-based debugging works identically inside Spring-managed beans as any Java code, though stepping through Spring's own internal AOP proxy machinery can be confusing; set breakpoints in YOUR code, not Spring's internals, for most debugging needs.
5. **Hibernate SQL logging**:

~~~
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
~~~

Shows the exact generated SQL for every JPA query, essential for diagnosing N+1 queries or unexpected query shapes.

### Debugging common Spring Boot-specific symptoms

- "NoSuchBeanDefinitionException" — a required bean wasn't created, usually because a needed dependency isn't on the classpath, or a @Conditional check on an auto-configuration class didn't pass; enable debug=true to see why.
- "LazyInitializationException" — attempting to access a lazy-loaded JPA relationship outside an active transaction/persistence context (commonly when serializing an entity directly as an API response after the transaction has closed); use JOIN FETCH, @EntityGraph, or restructure to use a DTO fetched within the transaction.
- "Circular dependency" errors at startup — two or more beans depend on each other directly; usually resolved by refactoring one dependency out into a third bean, or using constructor injection to surface the cycle earlier (field injection can sometimes mask circular dependencies that break at runtime instead of startup).
`,

  monitoring: `
Production Spring Boot visibility rests heavily on **Spring Boot Actuator**, which provides most of the observability surface with minimal additional code.

### Actuator endpoints

~~~
management.endpoints.web.exposure.include=health,metrics,prometheus,info
management.endpoint.health.show-details=when-authorized
~~~

/actuator/health powers Kubernetes liveness/readiness probes directly; /actuator/metrics exposes JVM, HTTP request, and datasource connection-pool metrics; /actuator/prometheus (with the micrometer-registry-prometheus dependency) exposes all of these in Prometheus's scrape format automatically.

### Structured logging

~~~java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

logger.info("order placed orderId={} userId={}", order.getId(), user.getId());
~~~

SLF4J (with Logback as the default implementation) is Spring Boot's standard logging facade; configuring a JSON encoder (via logstash-logback-encoder or similar) produces structured, queryable logs for production log aggregation.

### Distributed tracing (Micrometer + OpenTelemetry)

Micrometer Tracing (Spring Boot 3's tracing abstraction, with OpenTelemetry or Brave/Zipkin as the underlying implementation) instruments Spring MVC/WebFlux request handling and Spring Data JPA queries automatically, propagating trace context across service boundaries — see the **OpenTelemetry** and **Tracing** skills.

### JVM-specific signals to watch

- **GC pause frequency and duration**: exposed via Actuator's JVM metrics, a rising trend directly predicts increasing request latency and is a Spring Boot/JVM-specific signal without a direct equivalent in non-JVM frameworks.
- **HikariCP connection pool utilization**: exposed via Actuator's datasource metrics, an early warning sign of undersized pooling before it manifests as visible request latency.
- **Heap usage trends over time**: a steadily climbing heap after each GC cycle (rather than returning to baseline) indicates a memory leak worth investigating with a heap dump.
`,

  deployment: `
### The standard: containerized JAR, or GraalVM native image

~~~dockerfile
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY target/myapp-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
~~~

Why each choice matters: eclipse-temurin (a widely trusted, well-maintained OpenJDK distribution) as the base image; a -jre (not -jdk) base for the runtime stage keeps the image smaller since a compiler isn't needed to RUN a compiled JAR; Alpine reduces image size further, though verify glibc-dependent native libraries (if any) work correctly under Alpine's musl libc.

### GraalVM native image alternative

~~~dockerfile
FROM ghcr.io/graalvm/native-image-community:21 AS builder
WORKDIR /app
COPY . .
RUN ./mvnw -Pnative native:compile

FROM debian:bookworm-slim
COPY --from=builder /app/target/myapp /app/myapp
ENTRYPOINT ["/app/myapp"]
~~~

Trades a significantly longer, more resource-intensive build process for a native executable with near-instant startup and dramatically lower idle memory — particularly valuable for serverless/cloud-native deployments where cold-start latency and per-instance memory cost are directly billed or directly impact autoscaling responsiveness.

### Serving topology

- A reverse proxy or cloud load balancer typically terminates TLS and sits in front of the Spring Boot instance(s), which handle plain HTTP internally — the same universal pattern seen across every framework in this platform.
- Health endpoints (/actuator/health/liveness, /actuator/health/readiness) wired directly to Kubernetes probes, a first-class Spring Boot Actuator feature specifically designed for this.
- Graceful shutdown (server.shutdown=graceful) lets in-flight requests complete before the JVM process exits, essential for zero-downtime rolling deployments.

### CI/CD pipeline

Build and test (Maven/Gradle) → static analysis (SpotBugs/Checkstyle) → build the container image (JVM or native) → scan → push → run database migrations (Flyway) → rolling deploy via Kubernetes. See the **CI/CD**, **Docker**, and **Kubernetes** skills.
`,

  "production-checklist": `
Before a Spring Boot application takes real traffic:

- [ ] spring.jpa.hibernate.ddl-auto set to validate or none — never update/create-drop
- [ ] Database schema managed by Flyway or Liquibase migrations, versioned in source control
- [ ] HikariCP connection pool sized appropriately for expected concurrency and database limits
- [ ] Actuator endpoints exposed deliberately (typically just health for public/orchestrator access), sensitive endpoints restricted
- [ ] Spring profiles configured correctly per environment (dev/staging/prod), activated via spring.profiles.active
- [ ] Spring Security configured with appropriate authentication/authorization for every endpoint
- [ ] Structured logging (JSON via Logback) configured, shipping to a log aggregation platform
- [ ] Graceful shutdown enabled (server.shutdown=graceful) for zero-downtime rolling deployments
- [ ] Liveness/readiness probes wired to Actuator's health endpoints in the orchestrator
- [ ] JVM heap size and GC settings deliberately chosen, not left at container-default assumptions
- [ ] N+1 queries audited and fixed via JOIN FETCH/@EntityGraph in hot paths
- [ ] Secrets loaded from environment variables/a secret manager, never committed to application.properties
- [ ] Distributed tracing (Micrometer Tracing/OpenTelemetry) wired up if the system spans multiple services
- [ ] Load test done: known requests/sec ceiling and GC-pause behavior under sustained load
- [ ] Runbook: how to roll back a bad deploy and a bad migration
`,

  "common-mistakes": `
1. **Using ddl-auto=update or create-drop in production**, letting Hibernate silently alter or wipe the production schema instead of using a real, reviewed migration tool.
2. **Field injection instead of constructor injection**, hiding required dependencies and making unit testing without a Spring context harder than necessary.
3. **Not eager-loading JPA relationships correctly**, hitting the same N+1 query problem seen across every ORM covered on this platform.
4. **Exposing JPA entities directly as API response bodies**, leaking schema internals and risking LazyInitializationException when serializing outside an active transaction.
5. **Misunderstanding @Transactional's rollback rules** — assuming ANY exception triggers rollback, when by default only unchecked (runtime) exceptions do, not checked exceptions.
6. **Leaving Actuator's default endpoint exposure unexamined in production**, potentially leaking sensitive operational data via endpoints like /actuator/env or /actuator/heapdump.
7. **Undersizing or never examining the HikariCP connection pool**, creating a bottleneck that presents as slow database performance when it's actually connection queueing.
8. **Assuming Spring Security's method-level authorization checks (@PreAuthorize) cover object-level authorization** — verifying a user CAN perform an action in general is distinct from verifying they're entitled to the SPECIFIC object requested.
9. **Ignoring JVM startup time and memory footprint** in serverless/cloud-native contexts without considering GraalVM native image compilation as a genuine option.
10. **Writing predominantly @SpringBootTest-based integration tests** instead of fast, plain unit tests for business logic, making the test suite unnecessarily slow as the codebase grows.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| NoSuchBeanDefinitionException | A required dependency isn't on the classpath, or a needed bean was never created/registered | Enable debug=true to see the auto-configuration report; verify the relevant starter dependency is present |
| LazyInitializationException | Accessing a lazy JPA relationship outside an active transaction/persistence context | Use JOIN FETCH/@EntityGraph, or fetch needed data within the transactional method as a DTO |
| Circular dependency detected | Two or more beans depend on each other directly | Refactor one dependency into a separate bean, breaking the cycle |
| org.hibernate.LazyInitializationException: could not initialize proxy | Same root cause as above, specifically when Jackson tries to serialize an entity after the transaction closed | Convert to a DTO within the transactional service method before returning |
| Whitelabel Error Page | An unhandled exception with no matching @ExceptionHandler, and no custom error page configured | Add a @ControllerAdvice with appropriate @ExceptionHandler methods for expected exception types |
| Port 8080 already in use | Another process (or a previous run) is already bound to the configured port | Kill the other process, or set a different server.port |
| BeanCreationException wrapping a ConditionEvaluationException | An auto-configuration or explicit bean's @Conditional check failed unexpectedly | Enable debug=true and check the printed condition evaluation report for the specific failing condition |
`,

  faqs: `
**Is Spring Boot too heavyweight compared to a minimal framework like Express or Flask?**
Spring Boot's ecosystem (Spring Data, Spring Security, Actuator) is genuinely comprehensive, and the JVM's startup time/memory footprint are real, measurable differences versus a lightweight scripting-language framework — but for a large, long-lived enterprise application, that comprehensiveness is frequently a net productivity win, not overhead, especially where Java/JVM talent and existing systems already dominate an organization.

**Spring MVC or Spring WebFlux (reactive) for a new project?**
Default to traditional, blocking Spring MVC (now scaling further via Java 21 virtual threads without a rewrite) unless you have a specific, measured need for extremely high I/O-bound concurrency that WebFlux's fully non-blocking model addresses — WebFlux requires a genuinely reactive data-access layer throughout (R2DBC, not JPA) to realize its benefit, a real architectural commitment, not a drop-in swap.

**Do I need XML configuration in modern Spring Boot?**
No — modern Spring Boot is essentially annotation- and Java-configuration-based throughout; XML configuration is a legacy pattern from classic Spring still supported for backward compatibility but not used in new Spring Boot projects.

**How does Spring Boot compare to Django/Express for an AI-adjacent backend?**
Spring Boot is the natural choice specifically when the surrounding organization's existing systems and talent are JVM-centric — an AI feature's supporting business logic (orders, permissions, existing data) frequently already lives there. For a greenfield project with no existing JVM investment, Python (Django/FastAPI) or Node.js (Express/NestJS) are more commonly chosen today, particularly for teams closer to the ML/AI tooling ecosystem itself.

**Is Spring Boot's auto-configuration "magic" a problem for debugging?**
It can feel that way initially, but debug=true and Actuator's /actuator/conditions endpoint make every auto-configuration decision fully inspectable — the "magic" is entirely deterministic and explainable, just not always obvious without knowing where to look.

**What database should I use with Spring Boot?**
PostgreSQL and MySQL are both extremely well-supported via Spring Data JPA; Oracle Database remains common in large enterprises with existing Oracle licensing and DBA expertise; the choice is largely independent of Spring Boot itself, similar to Django's and Express's equivalent flexibility.
`,

  "interview-questions": `
### Junior level

1. **What is dependency injection, and how does Spring implement it?**
   Model answer: A class declares what dependencies it needs (typically via constructor parameters); a container (Spring's IoC/ApplicationContext) constructs and provides those dependencies automatically, rather than the class constructing them itself — decoupling how an object is used from how its dependencies are created.

2. **What does @SpringBootApplication actually do?**
   Model answer: It's a composite annotation combining @Configuration, @EnableAutoConfiguration (triggers Spring Boot's classpath-based auto-configuration), and @ComponentScan (discovers @Component/@Service/@Repository/@Controller classes in the package and sub-packages).

3. **What is the difference between @Component, @Service, and @Repository?**
   Model answer: Functionally nearly identical (all register a Spring-managed bean), but semantically distinct: @Service marks business-logic classes, @Repository marks data-access classes (and additionally translates persistence-layer exceptions into Spring's unified DataAccessException hierarchy), @Component is the generic base annotation both build on.

4. **What does extending JpaRepository give you for free?**
   Model answer: A full set of CRUD methods (findAll, findById, save, delete, and more) with zero implementation code — Spring Data generates the implementation at runtime based on the interface and its generic type parameters.

5. **What does @Transactional do?**
   Model answer: Wraps the annotated method in a database transaction; by default, an unchecked (runtime) exception thrown inside triggers an automatic rollback, while the method completing normally (or a checked exception being thrown, by default) commits.

### Senior level

6. **Explain how Spring Boot's auto-configuration mechanism actually decides what to configure.**
   Model answer: Auto-configuration classes (shipped in spring-boot-autoconfigure) are annotated with @Conditional variants (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty); Spring evaluates each condition against the current classpath, existing bean definitions, and application properties, applying only the configurations whose conditions pass — inspectable via debug=true or Actuator's /actuator/conditions.

7. **What is the N+1 query problem in JPA, and how do you fix it?**
   Model answer: Iterating entities and accessing a lazily-loaded relationship per item triggers one additional query per item; fixed with a JOIN FETCH JPQL query or an @EntityGraph annotation that eager-loads the relationship in the original query instead.

8. **Why is constructor injection preferred over field injection in modern Spring guidance?**
   Model answer: Constructor injection makes dependencies explicit and immutable (final fields), makes required dependencies impossible to forget, and allows the class to be instantiated directly with mocked dependencies in a plain unit test without needing Spring's test context at all — field injection hides these properties.

9. **What's the difference between Spring MVC and Spring WebFlux, and when would you choose each?**
   Model answer: Spring MVC is the traditional, blocking, thread-per-request (servlet-based) model; Spring WebFlux is a fully non-blocking, reactive alternative built on Project Reactor. Choose WebFlux only when you have a measured need for very high I/O-bound concurrency AND are willing to commit to a genuinely reactive data-access layer throughout (R2DBC, not JPA) — otherwise, traditional Spring MVC (increasingly scaled further via Java 21 virtual threads) remains the simpler, more common default.

10. **How does AOP make @Transactional and Spring Security's method-level authorization possible?**
    Model answer: Spring generates a runtime proxy (JDK dynamic proxy for interface-based beans, CGLIB byte-code generation for concrete classes) around the annotated bean; calls to the annotated method are intercepted by this proxy, which wraps the actual method invocation with the cross-cutting behavior (starting/committing/rolling back a transaction, or checking an authorization rule) before delegating to the real method.

11. **Why must ddl-auto never be set to update or create-drop in production, and what should replace it?**
    Model answer: These settings let Hibernate infer and apply schema changes automatically based on current entity definitions, with no review step and real risk of unintended, potentially destructive schema changes at real data volumes; Flyway or Liquibase, run as explicit, versioned, reviewable migration files, is the correct production approach, with ddl-auto set to validate to confirm entities match the actual schema.

12. **How would you diagnose a NoSuchBeanDefinitionException in a Spring Boot application?**
    Model answer: Enable debug=true to print the full auto-configuration evaluation report at startup, showing exactly which conditions passed or failed for every auto-configuration class; check whether the expected dependency/starter is actually present on the classpath, and whether a required property is set correctly for a @ConditionalOnProperty-gated configuration.
`,

  "coding-questions": `
### 1. Implement a paginated, sorted REST endpoint with Spring Data JPA

~~~java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
class PostController {
    private final PostRepository postRepository;
    public PostController(PostRepository postRepository) { this.postRepository = postRepository; }

    @GetMapping
    public Page<Post> listPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }
}
// Spring Data automatically binds ?page=0&size=20&sort=publishedAt,desc from the
// query string into a Pageable object — zero manual parsing required.
// Follow-up: how would you add a custom, indexed query (e.g. filtering by author)
// while still supporting pagination?
~~~

### 2. Implement optimistic locking to prevent lost updates

~~~java
@Entity
class Account {
    @Id private Long id;
    private BigDecimal balance;

    @Version   // JPA optimistic locking: auto-incremented, checked on every update
    private Long version;
}

@Service
class AccountService {
    @Transactional
    public void withdraw(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId).orElseThrow();
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);   // throws OptimisticLockException if version changed concurrently
    }
}
// Follow-up: how does this differ from pessimistic locking (SELECT ... FOR UPDATE),
// and when would you choose one over the other given expected contention levels?
~~~

### 3. Write a custom exception hierarchy with centralized handling

~~~java
class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

@Service
class PostService {
    public Post findById(Long id) {
        return postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post " + id + " not found"));
    }
}

@ControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }
}
// Follow-up: why does this exception, being unchecked, trigger @Transactional's default
// rollback behavior, and how would that differ if it were a checked exception instead?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a REST API for a blog
Entities for Post and Comment, a layered controller/service/repository structure, and Spring Data JPA for persistence against an H2 in-memory database. Deliverable: a working CRUD REST API. Skills exercised: dependency injection, Spring Data JPA, REST controllers.

### Lab 2 (Intermediate): Add Spring Security with JWT authentication
Add a registration/login flow, JWT issuance and validation, and method-level authorization (@PreAuthorize) protecting specific endpoints. Deliverable: a fully authenticated, authorized API. Skills exercised: Spring Security, JWT, AOP-based method security.

### Lab 3 (Advanced): Add Flyway migrations, caching, and fix a deliberate N+1 query
Introduce Flyway for schema management, add Spring Cache (@Cacheable) backed by Redis for an expensive query, and use Hibernate SQL logging to find and fix a deliberately introduced N+1 query. Deliverable: a measurably faster, properly migrated application. Skills exercised: Flyway, caching, JPA performance tuning.

### Lab 4 (Production): Deploy as a container with full observability
Containerize the application (JVM-based first, then experiment with GraalVM native image), wire up Actuator's Prometheus endpoint and structured JSON logging, and deploy with liveness/readiness probes. Deliverable: a production-checklist-compliant deployment with a load test comparing JVM vs. native image startup time. Skills exercised: deployment, monitoring, GraalVM, the full production checklist.
`,

  "real-projects": `
### 1. An internal claims-processing system integrating an AI risk-scoring model
Engineering requirements: a Spring Boot application managing the claims workflow (state machine, approvals, audit trail) that calls out to a separately-hosted Python model-serving endpoint for a risk score, with proper timeout/circuit-breaker handling (Resilience4j) around that external call, and full Spring Security role-based access control for claims adjusters vs. supervisors. Demonstrates the extremely common "Spring Boot business logic calling a Python AI service" integration pattern.

### 2. A multi-tenant SaaS platform with row-level data isolation
Engineering requirements: a shared-schema, tenant-ID-based data isolation strategy enforced via Spring Data JPA's @Where/Hibernate filters or a custom repository layer, Spring Security tenant-aware authorization, and Flyway-managed migrations. Demonstrates production-grade Spring Boot patterns for a genuinely complex, correctness-critical multi-tenancy domain.

### 3. An event-driven order-processing microservice
Engineering requirements: a Spring Boot service consuming and producing Kafka events, with idempotent message processing, a properly designed aggregate/entity model, and comprehensive @DataJpaTest/@SpringBootTest coverage of the event-processing logic. Demonstrates Spring Boot's common role in event-driven microservices architectures, directly relevant to the **Kafka** and **Distributed Systems** skills.
`,

  "case-studies": `
### Netflix's Spring Cloud contributions
Netflix's extensive internal use of Spring Boot for its microservices architecture led directly to open-sourcing Eureka (service discovery) and Hystrix (circuit breaking), both of which became foundational, widely adopted parts of the broader Spring Cloud ecosystem used far beyond Netflix itself. Lesson: a company's internal infrastructure investment, built on a popular open framework, can become genuine industry-wide infrastructure when open-sourced at the right moment.

### The javax-to-jakarta migration's disruption
Spring Boot 3.0's requirement to migrate the entire javax.* namespace to jakarta.* (following Java EE's governance transfer to the Eclipse Foundation) was a genuinely significant, ecosystem-wide breaking change that required every dependent library and application to update in lockstep — a rare instance of Spring's normally careful backward-compatibility discipline giving way to a necessary, coordinated ecosystem-level migration. Lesson: even mature, stability-focused frameworks occasionally require breaking migrations when the platform they sit on undergoes fundamental governance or naming changes beyond the framework's own control.

### Alibaba's Spring Cloud Alibaba
Alibaba's development of Spring Cloud Alibaba (an alternative implementation of Spring Cloud's service-discovery, configuration, and circuit-breaking abstractions, tailored to Alibaba's own infrastructure like Nacos and Sentinel) demonstrates Spring's abstraction layers succeeding at their intended purpose: the same programming model works across genuinely different underlying infrastructure implementations, letting large companies adapt Spring's conventions to their own infrastructure investments rather than being locked into a single vendor's specific tooling.

### GraalVM native image adoption for serverless Spring Boot
Companies deploying Spring Boot applications into serverless/cloud-native, rapidly-scaling environments have increasingly adopted GraalVM native image compilation specifically to address the JVM's traditionally slow cold-start time — a real, measured tradeoff (longer, more complex builds; some reflection-heavy library incompatibilities) accepted in exchange for near-instant startup, directly relevant wherever autoscaling responsiveness or per-invocation billing makes JVM startup latency a genuine cost, not just an inconvenience.
`,

  comparisons: `
| Aspect | Spring Boot | Django | Express/NestJS | FastAPI |
|--------|-------------|--------|------------------|---------|
| Language | Java (or Kotlin) | Python | JavaScript/TypeScript | Python |
| Philosophy | Convention over configuration, auto-configuration | Batteries included, opinionated | Minimal (Express) / structured (NestJS) | Modern async API-first |
| Dependency injection | Built in, foundational (IoC container) | None built in | None (Express) / built in (NestJS) | None built in (uses function parameters) |
| ORM | Spring Data JPA, mature and deeply integrated | Built in, mature | Prisma/TypeORM (choice) | SQLAlchemy (choice) |
| Startup time / memory | Slower JVM startup by default; GraalVM native image addresses this | Fast | Fast | Fast |
| Ecosystem maturity | Extremely mature, especially in enterprise/finance | Very mature | Large (Express) / growing (NestJS) | Rapidly growing |
| Best fit | Large enterprises, existing JVM investment, complex business domains | Data-model-heavy apps, internal tools | JS-native full-stack teams | Async-first APIs, ML model serving |

**How seniors choose**: reach for Spring Boot when the organization has an existing deep JVM investment, the domain involves complex, long-lived business logic benefiting from Spring's mature dependency-injection and transaction-management infrastructure, or strict enterprise compliance/security requirements favor the JVM ecosystem's maturity; reach for Django/FastAPI when the team and surrounding AI/ML tooling ecosystem is Python-centric; reach for Express/NestJS when the team is JavaScript/TypeScript-centric across the full stack.
`,

  "related-technologies": `
- **Java** — the language Spring Boot is built in and requires deep fluency in; see the **Java** skill.
- **PostgreSQL** and **MySQL** — the most common production database choices paired with Spring Data JPA.
- **Spring Security** and **OAuth 2.0 / OIDC**/**JWT** — the standard authentication/authorization stack for Spring Boot APIs.
- **Kafka** and **RabbitMQ** — the standard message-broker choices for event-driven Spring Boot microservices.
- **Docker** and **Kubernetes** — how Spring Boot applications are packaged, deployed, and orchestrated in modern production environments.
- **Redis** — the typical cache and session-store backend for production Spring Boot deployments.
- **REST** — the architectural style most Spring Boot APIs implement.

Learning path: **Java** → this page → **PostgreSQL**/**MySQL** for the production database layer → **Spring Security**/**OAuth 2.0**/**JWT** for authentication → **Kafka**/**RabbitMQ** for event-driven patterns → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Spring Boot 3.x** is the current major line, requiring Java 17+ and the jakarta.* namespace, with continued maturation of GraalVM native image support and Micrometer-based observability (tracing and metrics unified under one abstraction).
- **Virtual threads (Java 21+)** are increasingly the preferred path for scaling traditional, blocking Spring MVC applications to high concurrency without a full rewrite to Spring WebFlux's reactive model — verify current Spring Boot version-specific guidance on enabling and tuning this, since support and recommended defaults have continued evolving.
- GraalVM native image compilation continues to mature but still requires verifying specific library compatibility (particularly reflection-heavy libraries) before committing a production application to it — check the current state of native-image hints/support for your specific dependency set.
- Given Spring's historically strong but not unlimited backward-compatibility discipline (the javax-to-jakarta migration being the notable recent exception), verify the specific Spring Boot version's migration guide before upgrading across a major version boundary.
`,

  "future-roadmap": `
Where Spring Boot is heading, and what's worth betting career time on:

- **Continued virtual threads adoption** — as Java 21+ becomes the baseline across more organizations, expect virtual threads to become the default recommended path for high-concurrency Spring MVC applications, reducing (though not eliminating) the cases where a full WebFlux rewrite is genuinely necessary.
- **Continued GraalVM native image investment** — Spring's own team has invested heavily in first-class native image support since Spring Boot 3.0, and this is likely to keep improving, particularly relevant for cloud-native and serverless deployment patterns.
- **Deeper AI/ML integration tooling** — Spring AI (an emerging project bringing Spring's dependency-injection and abstraction patterns to LLM integration, RAG, and vector database access) is a notable, actively developing area worth tracking for Java-centric teams building AI features directly in their existing Spring Boot stack rather than calling out to a separate Python service.
- **What to bet on**: deep fluency in dependency injection, the bean lifecycle, and Spring Data JPA's query mechanisms (these transfer across nearly any Spring project regardless of which specific new feature lands next), plus growing familiarity with virtual threads and native image compilation as the JVM ecosystem's answer to the startup-time/memory concerns that non-JVM frameworks don't share.
`,

  "cheat-sheet": `
~~~java
// ---- Application entrypoint ----
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) { SpringApplication.run(MyApplication.class, args); }
}

// ---- Dependency injection (constructor style, preferred) ----
@Service
class PostService {
    private final PostRepository repo;
    public PostService(PostRepository repo) { this.repo = repo; }
}

// ---- REST controller ----
@RestController
@RequestMapping("/api/posts")
class PostController {
    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) { return postService.findById(id); }

    @PostMapping
    public Post create(@RequestBody @Valid Post post) { return postService.create(post); }
}

// ---- Entity and repository ----
@Entity
class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
interface PostRepository extends JpaRepository<Post, Long> {}

// ---- Fixing N+1 ----
@Query("SELECT p FROM Post p JOIN FETCH p.author")
List<Post> findAllWithAuthor();

// ---- Transactions ----
@Transactional
public void placeOrder() { ... }   // rolls back on unchecked exceptions by default

// ---- Global exception handling ----
@ControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handle(ResourceNotFoundException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}

// ---- Production ----
// spring.jpa.hibernate.ddl-auto=validate   # never update/create-drop in prod
// management.endpoints.web.exposure.include=health,metrics,prometheus
// java -jar app.jar --spring.profiles.active=prod
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is dependency injection? | A container provides a class's dependencies rather than the class constructing them itself. |
| What does @SpringBootApplication bundle? | @Configuration, @EnableAutoConfiguration, and @ComponentScan. |
| Constructor vs field injection? | Constructor: explicit, immutable, testable without Spring. Field: hidden, harder to test. |
| What does extending JpaRepository give you? | Full CRUD methods with zero implementation code. |
| What does @Transactional roll back on by default? | Unchecked (runtime) exceptions, NOT checked exceptions. |
| How does Spring fix the N+1 query problem? | JOIN FETCH JPQL queries or @EntityGraph, eager-loading in one query. |
| How does Spring Boot decide what to auto-configure? | @Conditional annotations checked against the classpath, existing beans, and properties. |
| What must ddl-auto NEVER be in production? | update or create-drop — use Flyway/Liquibase migrations instead. |
| Spring MVC vs Spring WebFlux? | MVC: blocking, thread-per-request. WebFlux: non-blocking, reactive, needs R2DBC. |
| What implements @Transactional and method security internally? | AOP — a runtime proxy intercepts the annotated method call. |
| What does GraalVM native image trade for faster startup? | Longer, more complex builds and some reflection-library compatibility work. |
| What exposes health/metrics with minimal code? | Spring Boot Actuator. |
| What causes LazyInitializationException? | Accessing a lazy JPA relationship outside an active transaction. |
| What's the debug=true property useful for? | Prints the full auto-configuration evaluation report at startup. |
`,

  mcqs: `
1. What does @SpringBootApplication combine?
   A) Only @Configuration  B) @Configuration, @EnableAutoConfiguration, @ComponentScan  C) Only routing annotations  D) Nothing, it's just a marker
   **Answer: B** — a composite annotation bundling all three.

2. Which dependency injection style is preferred in modern Spring guidance?
   A) Field injection  B) Setter injection  C) Constructor injection  D) No preference
   **Answer: C** — explicit, immutable, and testable without a Spring context.

3. What should ddl-auto be set to in production?
   A) update  B) create-drop  C) validate (with Flyway/Liquibase managing the real schema)  D) create
   **Answer: C** — schema changes should be explicit, reviewed migrations, not auto-inferred.

4. What triggers @Transactional's default rollback behavior?
   A) Any exception  B) Only checked exceptions  C) Only unchecked (runtime) exceptions  D) Nothing automatically
   **Answer: C** — a common source of confusion when a checked exception doesn't roll back as expected.

5. How does Spring Boot decide which auto-configuration classes to apply?
   A) Random order  B) @Conditional checks against the classpath, existing beans, and properties  C) Alphabetical order  D) Manual XML configuration only
   **Answer: B** — inspectable via debug=true or Actuator's /actuator/conditions.

6. What mechanism implements @Transactional and Spring Security's method-level checks internally?
   A) Reflection alone  B) AOP via runtime proxies  C) Bytecode patching at compile time  D) A separate background thread
   **Answer: B** — a JDK dynamic proxy or CGLIB proxy intercepts the method call.
`,

  "revision-notes": `
Spring Boot is an opinionated, auto-configuring layer on top of the Spring Framework, built around dependency injection as its foundational architectural idea: a class declares what it needs via constructor parameters, and Spring's IoC container (ApplicationContext) constructs and provides those dependencies automatically. Auto-configuration inspects the classpath and application properties, using @Conditional annotations to decide which of hundreds of pre-built configuration classes should apply — a fully deterministic, inspectable process (via debug=true or Actuator's /actuator/conditions) despite feeling like "magic" to newcomers.

Spring Data JPA provides full CRUD repository implementations with zero code by extending JpaRepository, but carries the same N+1 query risk seen across every ORM on this platform — iterating entities and accessing lazily-loaded relationships triggers one additional query per item unless fixed with a JOIN FETCH query or an @EntityGraph annotation. @Transactional provides declarative transaction management, rolling back automatically on unchecked (runtime) exceptions by default, a frequent source of confusion when a checked exception unexpectedly does NOT trigger the same rollback.

Constructor injection is strongly preferred over field injection in modern Spring guidance: it makes dependencies explicit and immutable, and lets a class be instantiated directly with mocked dependencies in a plain, fast unit test without loading any Spring context at all. AOP (Aspect-Oriented Programming) — implemented via runtime proxies Spring generates automatically — is the mechanism underneath @Transactional, Spring Security's method-level authorization, and caching, letting cross-cutting behavior wrap method calls without modifying the target class's code.

The single most damaging common production misconfiguration is leaving spring.jpa.hibernate.ddl-auto set to update or create-drop, letting Hibernate silently alter or wipe the production schema based on current entity definitions with no review step — Flyway or Liquibase, run as explicit, versioned migrations, is the correct production approach. Spring Boot Actuator provides most of a production application's observability surface (health checks, metrics, Prometheus export) with minimal additional code, directly consumed by Kubernetes liveness/readiness probes.

Spring MVC (traditional, blocking, thread-per-request) remains the simpler default, increasingly able to scale to high concurrency via Java 21's virtual threads without a rewrite; Spring WebFlux (fully non-blocking, reactive) is reserved for genuinely extreme I/O-bound concurrency needs, requiring a fully reactive data-access layer (R2DBC, not JPA) to realize its benefit. GraalVM native image compilation trades a longer, more constrained build for dramatically faster JVM startup and lower memory footprint, particularly relevant for serverless/cloud-native deployments where cold-start latency is a direct, measured cost.
`,

  "learning-roadmap": `
**Week 1 — Spring Boot fundamentals**: dependency injection, @SpringBootApplication, REST controllers, application.properties configuration. Milestone: a working REST API with at least one controller, service, and repository layer.

**Week 2 — Spring Data JPA depth**: entities, relationships, custom queries, and fixing a deliberately introduced N+1 query using JOIN FETCH/@EntityGraph. Milestone: a CRUD API backed by a real database with correctly eager-loaded relationships.

**Week 3 — Transactions and exception handling**: @Transactional semantics, custom exception hierarchies, @ControllerAdvice for centralized error handling. Milestone: a multi-step write operation correctly wrapped in a transaction, with consistent error responses across the API.

**Week 4 — Spring Security**: JWT-based stateless authentication, method-level authorization (@PreAuthorize), and understanding the object-level authorization gap it doesn't cover. Milestone: a fully authenticated and authorized API.

**Week 5 — Production practices**: Flyway migrations, Actuator, structured logging, HikariCP tuning, and testing at the unit/slice/integration levels. Milestone: a properly migrated, observable application with a layered test suite.

**Week 6 — Deployment and advanced topics**: containerize the app, experiment with GraalVM native image compilation, and run through the full production checklist. Milestone: complete the Lab 4 hands-on project end to end, comparing JVM vs. native image startup time.

Next platform skill once this roadmap is complete: **Kafka** or **RabbitMQ** for event-driven microservices patterns, or **Kubernetes** for orchestrating Spring Boot at scale.
`,

  "official-docs": `
- **spring.io/projects/spring-boot** — the official Spring Boot documentation, including the exhaustive and excellent reference guide covering every auto-configuration behavior.
- **docs.spring.io/spring-framework** — the underlying Spring Framework reference, essential for understanding dependency injection and AOP in depth.
- **spring.io/projects/spring-data-jpa** — the official Spring Data JPA reference for repository query derivation and custom queries.
- **spring.io/projects/spring-security** — the official Spring Security reference for authentication and authorization configuration.
- **docs.spring.io/spring-boot/docs/current/actuator-api/htmlsingle** — the Actuator API reference for every available operational endpoint.
`,

  books: `
- **"Spring Boot in Action" — Craig Walls** — a widely recommended, practical introduction covering the core framework end to end.
- **"Spring Microservices in Action" (2nd ed.) — John Carnell and Illary Huaylupo Sánchez** — focused specifically on building production microservices with Spring Boot and Spring Cloud.
- **"Spring Security in Action" (2nd ed.) — Laurentiu Spilca** — a deep, practical dive into Spring Security specifically, matching this page's Security section in depth.
- **"Effective Java" (3rd ed.) — Joshua Bloch** — not Spring-specific, but essential Java fluency that directly informs writing idiomatic Spring Boot code.
- **"Cloud Native Java" — Josh Long and Kenny Bastani** — covers Spring Boot's role in cloud-native architectures, including Spring Cloud patterns.
`,

  blogs: `
- **The official Spring blog (spring.io/blog)** — release announcements, migration guides, and deep-dive technical posts directly from the Spring team.
- **Baeldung (baeldung.com)** — an extremely comprehensive, widely referenced source of practical Spring Boot tutorials spanning nearly every topic in this page.
- **Josh Long's blog and talks** — a Spring Developer Advocate whose content consistently covers the latest Spring Boot features in depth.
- **Netflix's technology blog** — periodic posts on their Spring Boot/Spring Cloud usage at scale, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
Spring Boot itself, as an application framework, has no dedicated academic literature — the most relevant foundational reading concerns dependency injection and AOP as general software engineering patterns:

- **Fowler, M. — "Inversion of Control Containers and the Dependency Injection pattern"** (2004) — the widely cited essay that named and popularized the dependency injection pattern Spring is built around; essential background reading for understanding WHY Spring's core architecture looks the way it does.
- **Kiczales, G. et al. — "Aspect-Oriented Programming"** (1997, ECOOP) — the foundational academic paper introducing AOP, the paradigm underlying Spring's @Transactional, security, and caching implementations.
- **Rod Johnson's "Expert One-on-One J2EE Design and Development"** (2002) — not a formal research paper, but the direct origin document for Spring Framework's design philosophy, critiquing J2EE's complexity and prototyping the ideas Spring was built from.
`,

  videos: `
- **SpringOne conference talks** (freely available on YouTube) — the primary annual conference for the Spring ecosystem, featuring deep talks directly from the Spring team and large-scale production users.
- **Josh Long's "Spring Tips" video series** — short, focused, consistently updated videos covering specific Spring Boot features in depth.
- **Java Brains' Spring Boot tutorial series (YouTube)** — widely watched, clear, project-based coverage from fundamentals through advanced topics.
- **Baeldung's video content** — practical, tutorial-style videos matching their extensive written content.
- **Amigoscode's Spring Boot series** — approachable, project-based video tutorials covering REST APIs, security, and testing.
`,

  "github-repos": `
- **spring-projects/spring-boot** — the framework's own source, including spring-boot-autoconfigure, an excellent read for understanding auto-configuration internals directly.
- **spring-projects/spring-framework** — the underlying Spring Framework source, for dependency injection and AOP internals.
- **spring-projects/spring-data-jpa** — the Spring Data JPA source and its extensive reference documentation.
- **spring-projects/spring-security** — the Spring Security source, referenced throughout this page's Security section.
- **spring-petclinic/spring-framework-petclinic** — Spring's own canonical sample application, widely used as a teaching reference for idiomatic Spring Boot structure.
- **flyway/flyway** — the standard database migration tool referenced throughout Production Usage and Deployment.
- **testcontainers/testcontainers-java** — the standard library for running real databases in integration tests, referenced in the Testing section.
- **oracle/graal** — the GraalVM project, referenced in Advanced Concepts and Deployment for native image compilation.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Dependency injection and layering**: build a small REST API with a proper controller/service/repository split, then write a unit test for the service using constructor-injected mocks and no Spring context.
2. **Spring Data JPA and the N+1 problem**: model a blog (posts, comments, authors) with JPA relationships, deliberately trigger an N+1 query, then fix it with JOIN FETCH and verify with Hibernate SQL logging.
3. **Transactions**: implement the funds-transfer problem (two accounts, one must debit and one must credit atomically) and write a test proving a simulated failure mid-transaction rolls back both writes.
4. **Spring Security**: add JWT-based authentication and method-level authorization to an existing API, then write a test verifying an unauthorized request is correctly rejected.
5. **Testing at every level**: for one feature, write a plain unit test (mocked dependencies), a @DataJpaTest, and a @SpringBootTest, and compare their execution speed and what each actually verifies.
6. **External practice sets**: the official Spring Boot "Getting Started" guides for structured, guided practice; Baeldung's extensive tutorial library for topic-specific deep dives; Spring's own Pet Clinic sample application as a real, idiomatic codebase to read and extend.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Client / API consumer"] -->|HTTPS| LB["Load balancer / reverse proxy\n(TLS termination)"]
    LB --> S1["Spring Boot instance 1\n(embedded Tomcat, JVM)"]
    LB --> S2["Spring Boot instance N"]
    S1 & S2 --> Sec["Spring Security\n(JWT validation, authorization)"]
    Sec --> Ctrl["@RestController"]
    Ctrl --> Svc["@Service\n(business logic, @Transactional)"]
    Svc --> Repo["Spring Data JPA repositories"]
    Repo --> DB[("PostgreSQL/MySQL\nprimary + read replicas")]
    Svc --> Cache[("Redis\ncache")]
    Svc -->|produce/consume| MQ["Kafka/RabbitMQ"]
    subgraph Observability
        Actuator["Actuator\nhealth + metrics"]
        Tracing["Micrometer Tracing\n(OpenTelemetry)"]
        Logs["Structured logs (Logback)"]
    end
    S1 -.-> Actuator
    S1 -.-> Tracing
    S1 -.-> Logs
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Spring Boot))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Concepts
      Dependency injection
      IoC container
      Auto-configuration
      Bean lifecycle
    Data Access
      Spring Data JPA
      N plus 1 problem
      Transactions
      Flyway migrations
    Web Layer
      REST controllers
      Spring MVC vs WebFlux
      Exception handling
      DispatcherServlet
    Security
      Spring Security
      JWT authentication
      Method-level authorization
      AOP internals
    Production
      Actuator
      GraalVM native image
      Virtual threads
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default springBoot;
