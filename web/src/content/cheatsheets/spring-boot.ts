import type { CheatSheetData } from "./types";

const springBoot: CheatSheetData = {
  title: "The Ultimate Spring Boot Cheat Sheet",
  subtitle: "Dependency injection · Spring Data JPA · Security · production toolbelt",
  sections: [
    {
      title: "Core & Dependency Injection",
      color: "violet",
      rows: [
        { term: "Entrypoint", desc: "Bootstraps the IoC container and embedded server", code: "@SpringBootApplication\npublic class MyApp {\n  public static void main(String[] a) { SpringApplication.run(MyApp.class, a); }\n}" },
        { term: "Constructor injection", desc: "Preferred: explicit, immutable, testable without Spring", code: "@Service\nclass PostService {\n  private final PostRepository repo;\n  public PostService(PostRepository repo) { this.repo = repo; }\n}" },
        { term: "Stereotypes", desc: "@Component base; @Service/@Repository add semantic meaning", code: "@Repository class PostRepo { }\n@Service class PostService { }" },
        { term: "@SpringBootApplication", desc: "Bundles 3 annotations into one", code: "// = @Configuration + @EnableAutoConfiguration + @ComponentScan" },
        { term: "Debug auto-configuration", desc: "Prints exactly which conditions passed/failed", code: "debug=true  # in application.properties" },
      ],
    },
    {
      title: "REST Controllers",
      color: "blue",
      rows: [
        { term: "Controller basics", desc: "Return value auto-serialized to JSON via Jackson", code: "@RestController\n@RequestMapping('/api/posts')\nclass PostController {\n  @GetMapping('/{id}')\n  Post get(@PathVariable Long id) { ... }\n}" },
        { term: "Request body", desc: "Deserialized from JSON, validated with @Valid", code: "@PostMapping\nPost create(@RequestBody @Valid Post p) { ... }" },
        { term: "Pagination", desc: "Auto-bound from ?page=0&size=20&sort=field,desc", code: "Page<Post> list(Pageable pageable) {\n  return repo.findAll(pageable);\n}" },
        { term: "Global exception handling", desc: "Centralized error-to-HTTP-response mapping", code: "@ControllerAdvice\nclass Handler {\n  @ExceptionHandler(NotFoundEx.class)\n  ResponseEntity<String> handle(NotFoundEx e) { ... }\n}" },
      ],
    },
    {
      title: "Spring Data JPA",
      color: "emerald",
      rows: [
        { term: "Entity", desc: "Class maps directly to a database table", code: "@Entity\nclass Post {\n  @Id @GeneratedValue Long id;\n  String title;\n}" },
        { term: "Repository", desc: "Full CRUD with ZERO implementation code", code: "interface PostRepository extends JpaRepository<Post, Long> {}" },
        { term: "Fix N+1 (JOIN FETCH)", desc: "Eager-load a lazy relationship in one query", code: "@Query('SELECT p FROM Post p JOIN FETCH p.author')\nList<Post> findAllWithAuthor();" },
        { term: "Transactions", desc: "Rolls back on UNCHECKED exceptions by default", code: "@Transactional\npublic void placeOrder() { ... }" },
        { term: "Optimistic locking", desc: "Prevents lost updates under concurrent writes", code: "@Version\nprivate Long version;" },
        { term: "Migrations", desc: "Never ddl-auto=update in production", code: "spring.jpa.hibernate.ddl-auto=validate\n# Flyway/Liquibase manage the real schema" },
      ],
    },
    {
      title: "Security",
      color: "amber",
      rows: [
        { term: "Stateless JWT API", desc: "The standard modern REST API auth pattern", code: "http.csrf(c -> c.disable())\n  .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))\n  .oauth2ResourceServer(o -> o.jwt(withDefaults()));" },
        { term: "Method-level authorization", desc: "Implemented via AOP proxying underneath", code: "@PreAuthorize('hasRole(\\'ADMIN\\')')\npublic void deletePost(Long id) { ... }" },
        { term: "Password hashing", desc: "Never store or compare plaintext passwords", code: "new BCryptPasswordEncoder().encode(rawPassword);" },
        { term: "Object-level auth gap", desc: "@PreAuthorize checks general permission, not the specific object", code: "// Must verify separately: does this user own THIS post?" },
      ],
    },
    {
      title: "Advanced Concepts",
      color: "rose",
      rows: [
        { term: "AOP", desc: "Powers @Transactional, security, caching via proxies", code: "@Aspect @Component\nclass LoggingAspect {\n  @Around('execution(* com.example.service.*.*(..))')\n  Object log(ProceedingJoinPoint pjp) { ... }\n}" },
        { term: "Spring MVC vs WebFlux", desc: "Blocking thread-per-request vs. reactive non-blocking", code: "Mono<Post> get(Long id) { ... }   // WebFlux\nFlux<Post> all() { ... }" },
        { term: "Virtual threads (Java 21+)", desc: "Scale blocking MVC without rewriting to WebFlux", code: "spring.threads.virtual.enabled=true" },
        { term: "GraalVM native image", desc: "Trades build complexity for near-instant startup", code: "./mvnw -Pnative native:compile" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Actuator", desc: "Health, metrics, Prometheus export with minimal code", code: "management.endpoints.web.exposure.include=health,metrics,prometheus" },
        { term: "Run the app", desc: "Single executable JAR, embedded server, no external deploy", code: "java -jar app.jar --spring.profiles.active=prod" },
        { term: "Connection pool", desc: "HikariCP — size deliberately, don't leave defaults unexamined", code: "spring.datasource.hikari.maximum-pool-size=20" },
        { term: "Testing levels", desc: "Unit (fastest) < slice (@DataJpaTest) < full (@SpringBootTest, slowest)", code: "@DataJpaTest\nclass PostRepositoryTest { @Autowired PostRepository repo; }" },
        { term: "Graceful shutdown", desc: "Drains in-flight requests before the JVM exits", code: "server.shutdown=graceful" },
      ],
    },
  ],
};

export default springBoot;
