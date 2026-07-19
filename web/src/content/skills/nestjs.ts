import type { SkillContent } from "../types";

/**
 * NestJS — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const nestjs: SkillContent = {
  overview: `
NestJS is an opinionated, TypeScript-first Node.js framework that brings Angular-inspired architecture — modules, dependency injection, decorators — to backend development, explicitly filling the structural gap Express deliberately leaves open. Where Express gives you routing and middleware and trusts you to invent your own conventions for everything else, NestJS provides a full, batteries-included architecture out of the box: a module system for organizing features, a dependency injection container managing object lifetimes and wiring, and a rich ecosystem of first-party integrations (TypeORM, Mongoose, GraphQL, WebSockets, microservices) that all follow the same consistent patterns.

For an AI engineer, NestJS is increasingly the framework of choice for teams building substantial, long-lived TypeScript backends — the kind of project where Express's "figure out your own structure" freedom becomes a liability at scale, with ten different developers inventing ten different conventions. NestJS's dependency injection and modular architecture make it particularly well suited for AI-application backends that need to cleanly swap or mock external AI service integrations (an LLM provider, a vector database client) for testing, and its built-in support for microservices and message-queue patterns fits naturally with the event-driven architectures common in production AI systems.

Key characteristics: built ON TOP OF Express (by default) or Fastify (as an alternative, performance-focused adapter) rather than replacing Node's HTTP handling from scratch; a dependency injection container directly inspired by Angular's, using TypeScript decorators (@Injectable, @Controller, @Module) as the primary way to declare application structure; a strong opinion about layering (controllers, providers/services, modules) enforced by the framework itself, not just team convention; and first-class TypeScript support throughout, with the framework's own APIs designed around TypeScript's type system rather than TypeScript being an optional addition.
`,

  history: `
NestJS was created by **Kamil Myśliwiec**, motivated by the observation that the Node.js/Express ecosystem, despite its popularity, lacked a genuinely structured, batteries-included architectural framework comparable to Angular on the frontend or Spring Boot in the Java ecosystem.

| Year | Milestone |
|------|-----------|
| 2017 | Kamil Myśliwiec releases the first version of NestJS, explicitly inspired by Angular's architecture (modules, dependency injection, decorators) applied to backend Node.js development |
| 2018 | NestJS 5 — GraphQL support added as a first-class integration alongside REST |
| 2019 | NestJS 6 — microservices support significantly expanded (gRPC, Kafka, RabbitMQ, NATS transports), positioning Nest explicitly for distributed-systems architectures |
| 2020 | NestJS 7 — CLI improvements, standalone applications support, further GraphQL (code-first approach) maturation |
| 2021 | NestJS 8 — continued Fastify adapter maturation as a genuine, near-first-class alternative to the default Express adapter |
| 2022 | NestJS begins gaining significant enterprise adoption momentum, increasingly cited alongside Spring Boot as "the structured choice" in its respective language ecosystem |
| 2023 | NestJS 10 — improved TypeScript support, continued adapter and testing improvements |
| 2024–2025 | Continued releases maturing standalone/hybrid application support, WebSockets, and the CLI's code generation capabilities; growing adoption specifically among teams scaling past Express's unopinionated structure |

NestJS's growth trajectory closely mirrors a recurring pattern in software ecosystems: a minimal, unopinionated tool (Express, matching Flask's role in Python) becomes dominant first, and a more structured, opinionated framework (NestJS, matching Django's or Spring Boot's role) emerges later specifically to serve teams that have grown past what the minimal tool's freedom comfortably supports at scale.
`,

  "why-it-exists": `
NestJS exists because of a gap its creator identified directly: **Express's radical unopinionatedness, while excellent for small services and maximum flexibility, left large, long-lived Node.js/TypeScript codebases without any framework-enforced structure**, meaning every team invented its own conventions for dependency injection, module boundaries, and testing patterns — inconsistently, and often without the benefit of genuine compile-time type safety throughout.

The prior landscape (Node.js backends before NestJS) offered:

1. **Express with hand-rolled structure**: works, but "routes/controllers/services" layering is pure team convention, unenforced by the framework, and dependency injection (if attempted at all) is typically a hand-rolled, ad-hoc pattern rather than a genuine, battle-tested container.
2. **Porting patterns from other ecosystems manually**: teams familiar with Spring Boot or Angular would sometimes hand-build similar dependency-injection patterns on top of Express themselves, redundant effort repeated across many separate companies.

NestJS's insight was to take Angular's already-proven frontend architecture (modules, dependency injection via decorators, a clear separation of concerns) and apply the SAME ideas to the backend, built on top of Express or Fastify rather than reinventing HTTP handling — giving TypeScript-first teams a framework that feels architecturally familiar if they already know Angular, enforces genuine structure via the framework itself (not just team discipline), and provides first-party, consistently-patterned integrations for nearly every common backend need (databases, GraphQL, microservices, WebSockets) rather than leaving every integration choice entirely to individual team conventions.
`,

  "problem-it-solves": `
NestJS solves the **"Express provides no structure, and every team reinvents architecture inconsistently at scale"** problem for TypeScript-first Node.js backends.

Concretely, NestJS provides:

- **A genuine dependency injection container**: classes declare their dependencies via constructor parameters with TypeScript decorators, and Nest's IoC container resolves and injects them automatically — directly analogous to Spring Boot's dependency injection, but for the Node.js/TypeScript ecosystem.
- **Enforced modular architecture**: @Module decorators group related controllers and providers into cohesive, independently testable units, with explicit imports/exports controlling what's shared across module boundaries.
- **Consistent, first-party integrations**: TypeORM/Mongoose/Prisma for databases, Passport for authentication, class-validator for request validation, and Swagger/OpenAPI generation, all following the same decorator-based patterns rather than each being a separately-conventioned Express middleware addition.
- **A framework-level testing story**: Nest's testing module (@nestjs/testing) makes creating an isolated testing module with mocked dependencies straightforward and consistent across the whole application.
- **Built-in support for multiple transport layers**: REST, GraphQL, WebSockets, and microservices (gRPC, Kafka, RabbitMQ, NATS) all follow the same underlying controller/provider patterns, letting a team reuse architectural knowledge across very different communication styles.

What NestJS deliberately does **not** solve: it does not eliminate Node.js's underlying single-threaded, event-loop concurrency model — the same event-loop-blocking risks and worker_threads/clustering solutions from the **Node.js** skill apply identically inside a NestJS application; it does not provide its own HTTP server implementation from scratch — it sits ON TOP OF Express or Fastify, inheriting (and abstracting over) whichever adapter you choose; and its opinionated structure, decorator-heavy style, and steeper initial learning curve (compared to Express) are a genuine tradeoff, not free — small projects or teams unfamiliar with dependency injection concepts may find NestJS's ceremony excessive relative to the problem size.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain NestJS's module/controller/provider architecture and how its dependency injection container resolves and wires dependencies.
2. Build a NestJS REST API with controllers, services, and DTOs, using class-validator for request validation.
3. Integrate a database layer (TypeORM or Prisma) following NestJS's provider patterns, including repository injection.
4. Use NestJS's Guards, Interceptors, and Pipes correctly, understanding the request-processing pipeline they compose into.
5. Implement authentication and authorization using Passport strategies and Guards.
6. Structure a NestJS application into feature modules with clear boundaries, avoiding circular dependency issues.
7. Test NestJS applications using its dedicated testing module, mocking dependencies cleanly via the DI container.
8. Explain when NestJS's additional structure and ceremony is worth the tradeoff versus a simpler framework like Express.
9. Deploy a NestJS application in production, understanding it inherits Node.js's underlying concurrency model and constraints.
`,

  prerequisites: `
- **Required**: solid **TypeScript** fundamentals — interfaces, decorators, generics, classes; NestJS's entire API is designed around TypeScript's type system and is genuinely painful to use well without it (see the **TypeScript** skill).
- **Required**: the **Node.js** skill's concurrency model (event loop, blocking the event loop, worker_threads) — NestJS inherits all of it unchanged underneath its abstractions.
- **Very helpful**: the **Express** skill — NestJS runs on top of Express by default, and understanding what's underneath demystifies a great deal of Nest's own request-handling behavior.
- **Helpful**: familiarity with Angular or Spring Boot's dependency injection concepts makes NestJS's architecture click noticeably faster, though this page explains it from scratch.

Dependency links: **TypeScript** and **Node.js** → **Express** → this page → **PostgreSQL**/**MongoDB** for the database layer → **Docker**/**Kubernetes** for deployment → **Kafka**/**RabbitMQ** for NestJS's microservices transport support.
`,

  "beginner-concepts": `
### Your first NestJS application

~~~typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// app.module.ts
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
~~~

NestFactory.create(AppModule) bootstraps the entire application from a single root module — under the hood, NestJS creates an Express (or Fastify) instance and wires it together with the dependency injection container described by your module structure.

### Controllers — handling HTTP requests

~~~typescript
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("greetings")
export class AppController {
  constructor(private readonly appService: AppService) {}   // constructor injection, automatic

  @Get(":name")
  greet(@Param("name") name: string): string {
    return this.appService.greet(name);
  }

  @Post()
  create(@Body() body: { message: string }) {
    return { received: body.message };
  }
}
~~~

@Controller("greetings") marks the class as handling requests under /greetings; @Get/@Post map HTTP methods to methods, with @Param/@Body decorators extracting exactly the request data each method needs — a more declarative style than Express's req.params/req.body direct access.

### Providers and dependency injection

~~~typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  greet(name: string): string {
    return "Hello, " + name + "!";
  }
}
~~~

@Injectable() marks a class as a provider Nest's DI container can manage — notice the controller above simply declares appService: AppService as a constructor parameter, and Nest automatically constructs and injects an AppService instance; nothing manually instantiates it with new AppService().

### Modules — organizing features

~~~typescript
import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],   // makes PostsService available to modules that import this one
})
export class PostsModule {}
~~~

A feature module groups related controllers and providers together; exports controls what's usable by OTHER modules that import this one — Nest's explicit answer to organizing a growing application into clean, independently-reasoned-about units, more structured than Express's Router-based convention.

### DTOs and validation with class-validator

~~~typescript
import { IsString, MinLength } from "class-validator";

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  title: string;
}

// In the controller, with global ValidationPipe enabled:
@Post()
create(@Body() dto: CreatePostDto) {
  return this.postsService.create(dto);
}
~~~

A DTO (Data Transfer Object) class with class-validator decorators, combined with Nest's ValidationPipe, automatically validates incoming request bodies against the declared rules BEFORE the controller method body even runs, rejecting invalid requests with a structured 400 response.

Common beginner trap: circular dependencies between modules that both need each other's providers — covered fully in Advanced Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### The request-processing pipeline: middleware, guards, interceptors, pipes

~~~mermaid
flowchart LR
    A["Middleware\n(Express-style, e.g. logging)"] --> B["Guards\n(authorization: can this request proceed?)"]
    B --> C["Interceptors (before)\n(transform request, add logic before handler)"]
    C --> D["Pipes\n(validate/transform arguments)"]
    D --> E["Route handler\n(controller method)"]
    E --> F["Interceptors (after)\n(transform response)"]
    F --> G["Exception filters\n(if an error occurred)"]
~~~

Each stage has a distinct, well-defined responsibility: Guards decide whether a request is ALLOWED to proceed (authentication/authorization); Pipes validate and transform individual arguments before they reach the handler; Interceptors can run logic both before AND after the handler (logging, caching, response transformation); Exception filters catch and format errors into HTTP responses.

### Guards for authorization

~~~typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return !!request.headers["authorization"];   // simplified — real guards verify a JWT properly
  }
}

@Controller("posts")
@UseGuards(AuthGuard)   // applies to every route in this controller
export class PostsController { }
~~~

Guards implement CanActivate, returning true/false (or a Promise/Observable resolving to one) to decide whether the request is allowed to reach the route handler — applied at the method, controller, or global level.

### Interceptors for cross-cutting logic

~~~typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => console.log("Request took " + (Date.now() - start) + "ms"))
    );
  }
}
~~~

Interceptors wrap around the route handler using RxJS Observables, letting you run logic both BEFORE (transform arguments, start a timer) and AFTER (transform the response, log elapsed time) the handler executes — Nest's equivalent of Express's before/after middleware pairing, but composable and reusable via the DI container.

### Database integration with TypeORM

~~~typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}

// posts.module.ts
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

// posts.service.ts
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ["author"] });
  }
}
~~~

TypeOrmModule.forFeature([Post]) registers the Post repository as an injectable provider within this module, and @InjectRepository(Post) injects it into the service — the exact same dependency-injection pattern used for every other provider, applied consistently to database access.

### Exception filters

~~~typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus();
    response.status(status).json({ statusCode: status, message: exception.message });
  }
}
~~~

Exception filters centralize error-to-HTTP-response translation, Nest's structured equivalent of Express's @app.use((err, req, res, next) => ...) error-handling middleware.

### Configuration with @nestjs/config

~~~typescript
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}

// elsewhere, injected like any provider:
constructor(private configService: ConfigService) {
  const dbUrl = this.configService.get<string>("DATABASE_URL");
}
~~~

@nestjs/config wraps environment variable loading (via dotenv underneath) in the same dependency-injection pattern as everything else in Nest, letting configuration be injected and mocked in tests just like any other provider.
`,

  "advanced-concepts": `
### Custom decorators

~~~typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;   // populated earlier by an auth guard/middleware
  },
);

@Get("profile")
getProfile(@CurrentUser() user: User) {
  return user;
}
~~~

Custom parameter decorators let you extract exactly the data a handler needs (like the authenticated user, populated by an earlier guard) with the same clean, declarative style as Nest's built-in @Param/@Body/@Query decorators.

### Dynamic modules

~~~typescript
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [{ provide: "DB_OPTIONS", useValue: options }, DatabaseService],
      exports: [DatabaseService],
    };
  }
}

// usage: DatabaseModule.forRoot({ url: process.env.DATABASE_URL })
~~~

Dynamic modules (the pattern TypeOrmModule.forRoot()/forFeature() themselves use internally) let a module's configuration be parameterized at import time, rather than being hardcoded — essential for building genuinely reusable, configurable library modules.

### Provider scopes

~~~typescript
import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })   // a NEW instance created per incoming request
export class RequestScopedService { }

@Injectable()   // DEFAULT: a SINGLETON, shared across the entire application lifetime
export class SingletonService { }
~~~

By default, Nest providers are singletons — one instance shared across the entire application; Scope.REQUEST creates a new instance per incoming request (useful for request-specific state, like a request ID), at a real, measurable performance cost since DI resolution happens per-request instead of once at startup — use request scope deliberately, not as a default.

### Microservices support

~~~typescript
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: { client: { brokers: ["localhost:9092"] } },
});
await app.listen();

// message handler, same decorator style as HTTP controllers:
@Controller()
export class OrdersController {
  @MessagePattern("order.created")
  handleOrderCreated(data: any) {
    // process the Kafka message
  }
}
~~~

Nest's microservices support lets the SAME controller/provider/DI architecture handle Kafka, RabbitMQ, gRPC, NATS, or Redis-based message transports instead of (or alongside) HTTP — a genuinely distinctive Nest capability, letting teams reuse architectural knowledge across very different communication protocols.

### Circular dependency resolution

~~~typescript
// When ModuleA needs ModuleB's provider and ModuleB needs ModuleA's provider:
@Module({
  imports: [forwardRef(() => ModuleB)],
})
export class ModuleA {}

@Injectable()
export class ServiceA {
  constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
}
~~~

forwardRef() is Nest's explicit escape hatch for genuine circular dependencies between modules/providers — though a circular dependency is frequently itself a signal the architecture should be refactored (extracting shared logic into a third module both depend on) rather than routinely reached for.

### Testing with @nestjs/testing

~~~typescript
import { Test } from "@nestjs/testing";

describe("PostsService", () => {
  let service: PostsService;
  let mockRepository = { find: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PostsService, { provide: getRepositoryToken(Post), useValue: mockRepository }],
    }).compile();
    service = module.get<PostsService>(PostsService);
  });

  it("findAll calls the repository", async () => {
    await service.findAll();
    expect(mockRepository.find).toHaveBeenCalled();
  });
});
~~~

Test.createTestingModule mirrors real module construction but lets you substitute mocked providers cleanly through the same DI mechanism the real application uses — no manual monkey-patching or module-mocking hacks required.
`,

  "internal-working": `
What happens inside NestJS from application bootstrap to handling an HTTP request:

~~~mermaid
flowchart LR
    A["NestFactory.create(AppModule)"] --> B["Nest scans @Module decorators\nbuilds the dependency graph"]
    B --> C["DI container instantiates providers\nin dependency order"]
    C --> D["Underlying Express/Fastify\ninstance created and configured"]
    D --> E["app.listen() starts the server"]
    E --> F["Incoming request enters\nthe Express/Fastify layer"]
    F --> G["Nest's request pipeline:\nmiddleware -> guards -> interceptors -> pipes -> handler"]
~~~

1. **Module graph construction**: NestFactory.create() reads the root @Module's imports (recursively, for every nested module) to build a complete dependency graph of every provider and controller in the application.
2. **Dependency injection resolution**: Nest's IoC container instantiates every provider in dependency order (a provider needing another provider is constructed AFTER its dependency), automatically injecting each constructor's declared dependencies.
3. **Underlying HTTP adapter setup**: Nest creates and configures an Express (default) or Fastify instance, registering the resolved controllers' routes against it.
4. **Request handling**: an incoming HTTP request flows through Nest's OWN layered pipeline (middleware, guards, interceptors, pipes, the handler, then interceptors/exception filters on the way out) — a considerably richer, more structured pipeline than Express's flat middleware chain, though ultimately still running on top of the same underlying Express/Fastify request-handling machinery.

**Why understanding the underlying adapter matters**: because NestJS runs on top of Express (or Fastify) rather than replacing it, performance characteristics, event-loop-blocking risks, and low-level request/response behavior are IDENTICAL to a plain Express/Fastify application — NestJS's structure is entirely an application-layer abstraction, not a different runtime or execution model, and every Node.js concurrency fact from the **Node.js** skill applies unchanged underneath.
`,

  architecture: `
A senior engineer thinks about NestJS at two levels: **the DI container and module graph** (what Nest actually manages) and **feature-based module organization** (how a real NestJS codebase should be structured, which Nest itself enforces more than Express does).

### The dependency injection container as architecture

~~~mermaid
flowchart TB
    subgraph Root["Root AppModule"]
        subgraph PostsMod["PostsModule"]
            PostsCtrl["PostsController"]
            PostsSvc["PostsService"]
        end
        subgraph UsersMod["UsersModule"]
            UsersCtrl["UsersController"]
            UsersSvc["UsersService"]
        end
        Shared["SharedModule\n(exports: LoggerService)"]
    end
    PostsMod -->|imports| Shared
    UsersMod -->|imports| Shared
    PostsSvc -.->|depends on| UsersSvc
~~~

Every controller and provider lives inside a module's explicit boundary; a module must EXPLICITLY export a provider for other modules (that import it) to use it — this enforced boundary is Nest's structural answer to the "everything is globally accessible" sprawl that can happen in a large, unstructured Express codebase.

### Recommended feature-module project structure

~~~
myapp/
├── src/
│   ├── main.ts                    # bootstrap entrypoint
│   ├── app.module.ts                # root module, imports feature modules
│   ├── posts/
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── dto/
│   │   │   └── create-post.dto.ts
│   │   └── entities/
│   │       └── post.entity.ts
│   ├── users/
│   │   └── ... (same pattern)
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.guard.ts
│   │   └── jwt.strategy.ts
│   └── common/
│       ├── filters/
│       ├── interceptors/
│       └── pipes/
└── test/
~~~

Rules mature NestJS teams follow: one feature module per business domain area, each exporting only what other modules genuinely need; shared, cross-cutting code (guards, interceptors, filters used across many modules) lives in a common/ directory, not duplicated per module; avoid circular module dependencies by extracting genuinely shared logic into its own module both dependents import, rather than reaching for forwardRef() as a first resort.
`,

  "data-flow": `
Tracing one HTTP request end to end — a GET request for a post's detail, protected by authentication:

~~~mermaid
sequenceDiagram
    participant Client
    participant Express as Express/Fastify adapter
    participant Guard as AuthGuard
    participant Interceptor as LoggingInterceptor
    participant Pipe as ValidationPipe
    participant Controller
    participant Service
    participant Repository as TypeORM Repository
    participant DB as PostgreSQL

    Client->>Express: GET /posts/42 (Authorization header)
    Express->>Guard: canActivate() checks the JWT
    Guard-->>Express: true (authorized)
    Express->>Interceptor: intercept() starts a timer
    Interceptor->>Pipe: validate/transform the :id param
    Pipe->>Controller: getPost(id=42)
    Controller->>Service: postsService.findById(42)
    Service->>Repository: postsRepository.findOne({ where: { id: 42 } })
    Repository->>DB: SELECT ... WHERE id = 42
    DB-->>Repository: row data
    Repository-->>Service: Post entity
    Service-->>Controller: Post
    Controller-->>Interceptor: return value
    Interceptor->>Interceptor: logs elapsed time (the "after" phase)
    Interceptor-->>Express: response
    Express-->>Client: 200 OK + JSON
~~~

The most misunderstood part for newcomers: **Guards run BEFORE interceptors and pipes, deciding whether the request is even allowed to proceed at all** — a failed Guard short-circuits the entire pipeline immediately (typically a 403 Forbidden), never reaching interceptors, pipes, or the handler; understanding this exact ordering (middleware, then guards, then interceptors' "before" phase, then pipes, then the handler, then interceptors' "after" phase, then exception filters if needed) is essential for correctly reasoning about where authentication, logging, and validation logic actually executes relative to each other.
`,

  "production-usage": `
### Building and running

~~~bash
npm run build      # compiles TypeScript to JavaScript (dist/)
node dist/main.js
~~~

NestJS applications are TypeScript, compiled to JavaScript before running in production — unlike Express's typical plain-JavaScript-or-ts-node development pattern, a NestJS production deployment always runs the compiled dist/ output, not raw TypeScript source, for both performance and correctness.

### Configuration for production

~~~typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
  validationSchema: Joi.object({ DATABASE_URL: Joi.string().required() }),
});
~~~

Non-negotiables for production:

1. **NODE_ENV=production set explicitly** — the same universal Node.js/Express requirement, since Nest runs on top of one of those adapters.
2. **Validate configuration at startup** (via @nestjs/config's Joi schema validation option) — fail fast on missing/invalid environment variables rather than discovering the gap at runtime.
3. **Choose the Fastify adapter explicitly if raw throughput matters** — Nest defaults to Express, but swapping to the Fastify adapter (@nestjs/platform-fastify) is a well-supported, documented path for teams needing the additional performance headroom Fastify offers over Express.

### Common production stacks

- **REST APIs**: NestJS + TypeORM/Prisma + PostgreSQL, the most common overall combination for structured TypeScript backend teams.
- **Microservices**: NestJS's built-in microservices transports (Kafka, RabbitMQ, gRPC) for event-driven, distributed architectures.
- **GraphQL APIs**: NestJS's code-first GraphQL support (@nestjs/graphql), using the same decorator-based patterns as REST controllers.
`,

  "industry-examples": `
- **Adidas**: has publicly discussed using NestJS for parts of its e-commerce backend infrastructure, citing the structured, TypeScript-first architecture as a fit for a large engineering organization.
- **Roche**: the pharmaceutical company has used NestJS for internal enterprise applications, valuing its enforced structure for long-lived, compliance-relevant systems.
- **Autodesk**: has used NestJS across parts of its backend services, particularly where TypeScript-first structure and testability were priorities.
- **Decathlon**: uses NestJS for backend services within its broader e-commerce and inventory systems.
- **Many mid-to-large TypeScript-centric startups and scale-ups**: NestJS has become a common default specifically for teams that started on Express and found its lack of structure becoming a genuine liability as the codebase and team grew — a very common adoption story rather than a single flagship case.
- **Capgemini and other large consultancies**: have adopted NestJS for client enterprise projects specifically because its Spring-Boot-like structure translates familiar enterprise architectural patterns into the TypeScript/Node.js ecosystem for clients migrating away from or alongside Java stacks.

Pattern to notice: NestJS adoption clusters around **teams and organizations that have outgrown Express's unopinionated freedom** — larger engineering teams, longer-lived codebases, and organizations with existing familiarity with Angular or Spring Boot's architectural style, translated into the Node.js ecosystem.
`,

  "best-practices": `
1. **Organize by feature module, not by technical layer** — a posts/ module containing its own controller, service, and DTOs, rather than a global controllers/ folder mixed across unrelated features.
2. **Export only what other modules genuinely need** from each module — resist making everything globally accessible just to avoid thinking about module boundaries.
3. **Use DTOs with class-validator for every external input**, combined with a globally-registered ValidationPipe, rather than manually validating request bodies in controller logic.
4. **Keep controllers thin** — delegate to services for actual business logic, exactly the same discipline recommended for Express and every other framework on this platform.
5. **Use Guards for authorization decisions, Interceptors for cross-cutting logging/transformation, and Pipes for validation/transformation** — respect each mechanism's intended purpose rather than cramming unrelated logic into whichever one is convenient.
6. **Avoid Scope.REQUEST providers unless genuinely necessary** — the default singleton scope is dramatically cheaper; request scope has a real, measurable per-request DI resolution cost.
7. **Resolve circular dependencies by extracting shared logic into a third module**, reaching for forwardRef() only when a genuine, unavoidable circular relationship exists.
8. **Use @nestjs/testing's Test.createTestingModule for all tests**, substituting mocked providers through the same DI mechanism the real application uses, rather than manual module-mocking hacks.
9. **Validate configuration at startup** with a schema (Joi or class-validator-based), failing fast on missing/invalid environment variables.
10. **Choose the Fastify adapter deliberately when raw throughput genuinely matters**, understanding it's a well-supported swap, not a "second-class" option.
11. **Generate and maintain OpenAPI documentation** via @nestjs/swagger's decorators, kept in sync with your DTOs automatically rather than maintained as separate, driftable documentation.
12. **Remember that NestJS inherits Node's underlying concurrency model unchanged** — event-loop-blocking risks, worker_threads for CPU-bound work, and clustering for multi-core usage all apply identically to a NestJS application as to a plain Express one.
`,

  "anti-patterns": `
### Everything exported from every module

~~~typescript
// WRONG — exporting everything defeats the purpose of module boundaries,
// making the entire application's providers implicitly globally accessible
@Module({
  providers: [PostsService, InternalHelperService, PrivateCacheService],
  exports: [PostsService, InternalHelperService, PrivateCacheService],
})
export class PostsModule {}

// RIGHT — export only what other modules actually need
@Module({
  providers: [PostsService, InternalHelperService, PrivateCacheService],
  exports: [PostsService],
})
export class PostsModule {}
~~~

Over-exporting undermines the entire architectural benefit modules are supposed to provide — if everything is exported from everywhere, you've recreated Express's lack of enforced boundaries while paying NestJS's additional ceremony cost for nothing.

### Reaching for forwardRef() as a first resort

~~~typescript
// A SIGNAL to refactor, not a routine pattern:
@Injectable()
export class ServiceA {
  constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
}

// Often better: extract the shared logic both need into a third, shared module
~~~

A genuine circular dependency between two modules is frequently a sign the architecture's boundaries are drawn incorrectly — extracting the shared concern into its own module both dependents import is usually a healthier fix than routinely reaching for forwardRef().

### Other production-grade anti-patterns

- **Business logic in controllers**: identical anti-pattern to every other framework covered on this platform — controllers should translate HTTP concerns only, delegating actual logic to services.
- **Overusing Scope.REQUEST providers** without a genuine need, incurring real per-request DI resolution overhead for no measurable benefit.
- **Manually validating request bodies in controller code** instead of using DTOs with class-validator and a global ValidationPipe — duplicative and inconsistent across the codebase.
- **Ignoring that NestJS still runs on Express/Fastify underneath**: forgetting that CPU-bound blocking code, unhandled Promise rejections, and every other Node.js-specific risk from the **Node.js** skill apply identically inside a NestJS application.
- **Treating Guards, Interceptors, and Pipes as interchangeable** just because they can technically all run arbitrary logic — respecting their intended, distinct responsibilities keeps the request pipeline's behavior predictable and easy to reason about.
`,

  performance: `
### Rule zero: measure first

NestJS itself adds a small, generally negligible overhead versus plain Express for routing and DI resolution — nearly all real-world NestJS performance issues trace back to the SAME underlying Node.js/database/network concerns covered in the **Node.js** and **Express** skills, not to Nest's own abstractions.

### The performance hierarchy (apply in order)

1. **Fix N+1 database queries** — via TypeORM's relations option or Prisma's include, the exact same universal ORM discipline seen across every framework on this platform.
2. **Never run genuinely CPU-bound synchronous code in a request handler** — identical to plain Express/Node.js; offload to worker_threads or a separate service.
3. **Cache expensive, infrequently-changing data** using Nest's CacheModule (backed by Redis or an in-memory store) rather than recomputing/re-querying per request.
4. **Consider the Fastify adapter** if raw HTTP throughput is a measured, genuine bottleneck — a well-supported, documented swap from the default Express adapter.
5. **Use Scope.REQUEST providers sparingly** — their per-request DI resolution cost is real, if usually small; default (singleton) scope is dramatically cheaper.
6. **Scale horizontally with clustering/multiple instances** — a NestJS process is still fundamentally one Node.js process, using only one CPU core, identical to plain Express.

### Micro-level facts worth knowing

- Nest's dependency injection resolution happens ONCE at application startup for singleton-scoped providers (the default) — the DI container's overhead is a fixed startup cost, not a per-request cost, for the vast majority of providers in a typical application.
- Interceptors built on RxJS Observables have a small overhead versus a plain function call — negligible for nearly all real applications, occasionally worth profiling in an extremely hot path with many stacked interceptors.
- class-validator's decorator-based validation has a real, measurable cost per request for very large or deeply nested DTOs — usually negligible relative to database/network I/O, but worth profiling for endpoints handling unusually large payloads.
`,

  scalability: `
NestJS applications scale exactly the same way plain Express/Node.js applications do — **horizontally**, across multiple processes/instances, since Nest inherits Node's underlying single-threaded-per-process concurrency model unchanged.

### Single-region architecture

~~~mermaid
flowchart LR
    LB["Load balancer"] --> N1["NestJS instance 1\n(one Node process, cluster worker/container replica)"]
    LB --> N2["NestJS instance N"]
    N1 & N2 --> Cache[("Redis\ncache + sessions")]
    N1 & N2 --> DB[("PostgreSQL/MongoDB\nvia TypeORM/Prisma/Mongoose")]
    N1 & N2 --> MQ["Kafka/RabbitMQ\n(NestJS microservices transport)"]
~~~

Because a single NestJS process is still a single Node.js process, the exact same multi-process scaling story as plain Express applies — PM2 cluster mode or multiple container replicas via Kubernetes, with shared state externalized to Redis the moment more than one instance is serving traffic.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| N+1 queries via TypeORM/Prisma | Eager-loading via relations/include, identical to the universal ORM discipline seen across every framework |
| Single process using only one CPU core | Multiple Node processes (cluster mode/container replicas), identical to plain Express/Node.js |
| CPU-bound work blocking the event loop | worker_threads for genuine parallelism, or offload to a separate microservice via Nest's own microservices transport support |
| Excessive Scope.REQUEST provider usage under high concurrency | Reduce to singleton scope wherever request-specific state genuinely isn't required |
| Distributed system coordination at scale | Nest's built-in microservices transports (Kafka, RabbitMQ, gRPC) provide a consistent architectural pattern for splitting into genuinely independent services |
`,

  security: `
### What NestJS provides via its ecosystem

Because NestJS runs on Express (or Fastify) underneath, the SAME security gaps and additions discussed in the **Express** skill apply directly — NestJS itself doesn't automatically add CSRF protection, security headers, or rate limiting any more than plain Express does; these remain explicit additions (helmet, a rate-limiting library) applied via Nest's middleware/module system.

1. **Authentication via Passport**: @nestjs/passport wraps the widely used Passport.js library in Nest's DI-friendly patterns, supporting JWT, OAuth2, and dozens of other strategies consistently.
2. **Authorization via Guards**: the standard, structured mechanism for both role-based and more granular authorization logic, though — identically to Spring Security and Django — object-level authorization (verifying a user is entitled to the SPECIFIC resource requested, not just a permission in general) remains something you must implement explicitly in guard/service logic.
3. **Input validation via class-validator and a global ValidationPipe**: a genuinely strong, consistent default across every DTO in the application once configured, closing off a common source of injection and malformed-input bugs more systematically than Express's opt-in-per-route validation.
4. **helmet, CORS, and rate limiting**: added the same way as in plain Express — via app.use(helmet()) or Nest's equivalent module wrappers (@nestjs/throttler for rate limiting) — still explicit additions, not automatic defaults.

### What remains the application's responsibility

- SQL/NoSQL injection protection is only as strong as the chosen ORM's parameterization (TypeORM/Prisma are safe when used idiomatically; raw, string-concatenated queries reintroduce the risk exactly as in any framework).
- Object-level authorization bugs, business-logic authorization errors, and secrets management remain entirely the application's responsibility, identical to every other framework covered on this platform.

See the **OWASP Top 10**, **JWT**, **OAuth 2.0 / OIDC**, and **Secrets Management** skills for the general depth this builds on, and the **Express** skill for the underlying HTTP-layer security concerns NestJS inherits.
`,

  testing: `
NestJS's dedicated testing module (@nestjs/testing) is one of its most genuinely distinctive advantages over plain Express — building an isolated test module with mocked dependencies uses the exact same DI mechanism as the real application.

~~~typescript
import { Test, TestingModule } from "@nestjs/testing";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

describe("PostsController", () => {
  let controller: PostsController;
  let service: { findAll: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn().mockResolvedValue([{ id: 1, title: "Test" }]) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: service }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it("returns posts from the service", async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, title: "Test" }]);
    expect(service.findAll).toHaveBeenCalled();
  });
});
~~~

### End-to-end testing with supertest

~~~typescript
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

describe("Posts (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/posts (GET)", () => {
    return request(app.getHttpServer()).get("/posts").expect(200);
  });

  afterAll(async () => { await app.close(); });
});
~~~

### The senior testing doctrine

- Unit test controllers and services with mocked dependencies substituted via useValue/useClass in Test.createTestingModule, exactly mirroring how the real application wires providers.
- Use end-to-end tests (with supertest against a real, fully-bootstrapped Nest application) sparingly, for genuine integration coverage across the whole request pipeline.
- Mock external services and databases in unit tests; use Testcontainers or a real, isolated test database for genuine integration tests.
- Nest's CLI scaffolds a working test file alongside every generated controller/service/module by default — a genuinely useful nudge toward consistent test coverage from the start.
`,

  debugging: `
### The toolbox, in escalation order

1. **Nest's own dependency injection error messages** — genuinely helpful and specific: "Nest can't resolve dependencies of the X (?, Y). Please make sure that the argument Z at index N is available" tells you almost exactly what's missing (usually a provider not registered in the current module, or not exported from the module that provides it).
2. **The Node.js inspector** — node --inspect dist/main.js, then attach Chrome DevTools or VS Code's debugger, identical to debugging any Node.js application.
3. **Logging**: Nest's built-in Logger class (injectable, consistent across the application) or a structured logger (pino/winston) via a custom Nest logger adapter.
4. **@nestjs/testing's isolated test modules**: reproducing a bug in a minimal test module with specific mocked dependencies is frequently faster than debugging the fully-bootstrapped application directly.
5. **Verify module import/export chains**: a large share of "why can't Nest find this provider" issues trace directly to a module forgetting to export a provider that another module's imports list expects to receive.

### Debugging common NestJS-specific symptoms

- "Nest can't resolve dependencies" at startup — a provider isn't registered in providers: [...] of the relevant module, or isn't exported from a module it's imported from; the error message names the exact missing dependency and its position.
- "Circular dependency detected" — two modules or providers depend on each other directly; resolve with forwardRef() as a last resort, or refactor the shared logic into a third module both depend on instead.
- A Guard/Interceptor/Pipe not running at all — check it's actually applied (via @UseGuards/@UseInterceptors/@UsePipes at the right scope: method, controller, or globally in main.ts) rather than just defined but never wired up.
- Validation not triggering on a DTO — verify a ValidationPipe is registered globally (app.useGlobalPipes(new ValidationPipe())) or explicitly on the relevant route/parameter.
`,

  monitoring: `
Production NestJS visibility rests on the exact same foundation as plain Express (since Nest runs on top of it), with Nest-specific structuring layered on top via its DI-friendly logging and interceptor patterns.

### Structured logging

~~~typescript
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  async create(dto: CreatePostDto) {
    this.logger.log("Creating post: " + dto.title);
    // ...
  }
}
~~~

Nest's built-in Logger provides consistent, contextual logging out of the box; swapping in a custom logger (pino-based, via @nestjs/pino or a similar adapter) for structured JSON output is a straightforward, well-documented replacement for production log aggregation.

### Application performance monitoring

Sentry's Node.js/Express integration works identically underneath a NestJS application, since the HTTP handling is the same Express (or Fastify) instance underneath — @sentry/node captures unhandled exceptions and performance data with request context exactly as it would for plain Express.

### Metrics via an interceptor

~~~typescript
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => recordRequestDuration(context.switchToHttp().getRequest().route.path, Date.now() - start))
    );
  }
}
~~~

A global interceptor is a clean, DI-native way to instrument every request with Prometheus metrics (via prom-client), rather than needing separate Express-style middleware bolted on outside Nest's own patterns.

### Node/NestJS-specific signals to watch

- **Event-loop lag**: identical to plain Node.js/Express — the single most important early-warning signal, since Nest inherits the same single-threaded concurrency model unchanged.
- **DI resolution time at startup**: for very large applications with hundreds of providers, startup time (not request-time) can grow meaningfully — worth profiling if cold-start latency matters for your deployment (serverless, aggressive autoscaling).
`,

  deployment: `
### The standard: compiled, containerized, behind a reverse proxy

~~~dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
~~~

Why each choice matters: a multi-stage build separates the TypeScript compilation step (needing devDependencies like the TypeScript compiler) from the runtime image (only needing the compiled dist/ output and production dependencies), keeping the final image smaller; running node dist/main.js directly (not npm run start:dev, which uses ts-node and file-watching, appropriate only for local development) is the correct production entrypoint.

### Multi-core usage in production

Identical to plain Node.js/Express: PM2 cluster mode or multiple container replicas via Kubernetes, since a NestJS process is still one Node.js process using one CPU core.

### Microservices deployment topology

~~~
[NestJS HTTP API] --(Kafka/RabbitMQ)--> [NestJS microservice consumer 1]
                                     --> [NestJS microservice consumer N]
~~~

For NestJS applications using its microservices transport support, each microservice (HTTP-facing and message-consumer-facing) is typically deployed as its own independently-scaled container/pod, communicating via the configured message broker rather than direct HTTP calls between them.

### CI/CD pipeline

Lint (ESLint) → type-check (tsc --noEmit) → test suite (Jest, unit + e2e) → build (npm run build) → build the Docker image → scan → push → rolling deploy across replicas. See the **CI/CD**, **Docker**, and **Kubernetes** skills.
`,

  "production-checklist": `
Before a NestJS application takes real traffic:

- [ ] NODE_ENV=production set explicitly, and the compiled dist/main.js run (not ts-node/dev mode)
- [ ] Configuration validated at startup (Joi schema via @nestjs/config), failing fast on missing/invalid env vars
- [ ] Global ValidationPipe registered, with DTOs and class-validator covering every external input
- [ ] Guards protecting every endpoint requiring authentication/authorization
- [ ] helmet, CORS, and rate limiting (@nestjs/throttler) explicitly configured — none are automatic
- [ ] Module export boundaries reviewed — no unnecessary over-exporting undermining the architecture's purpose
- [ ] N+1 queries audited and fixed via TypeORM relations/Prisma include in hot paths
- [ ] Running under PM2 cluster mode or multiple container replicas, not a single bare process
- [ ] Structured logging configured (custom Logger or pino adapter), shipping to a log aggregation platform
- [ ] Event-loop lag monitored as a first-class metric, identical to plain Node.js
- [ ] Sentry (or equivalent) wired up for error tracking with request context
- [ ] Genuinely CPU-bound work identified and offloaded to worker_threads or a separate microservice
- [ ] Secrets loaded from environment variables/a secret manager, never committed
- [ ] Load test done: known requests/sec ceiling and event-loop-lag behavior under sustained load
- [ ] Runbook: how to roll back a bad deploy
`,

  "common-mistakes": `
1. **Assuming NestJS's structure eliminates Node.js's underlying concurrency risks** — event-loop blocking, unhandled rejections, and every other Node.js-specific concern from the **Node.js** skill apply identically inside a NestJS application.
2. **Over-exporting from every module**, recreating Express's lack of enforced boundaries while paying NestJS's additional ceremony cost for nothing.
3. **Reaching for forwardRef() routinely** instead of treating a genuine circular dependency as a signal to refactor shared logic into a third module.
4. **Not registering a global ValidationPipe**, leaving DTO validation inconsistent or entirely absent across different parts of the application.
5. **Assuming security (CSRF, headers, rate limiting) is automatic** because NestJS "feels" more batteries-included than Express — it inherits the exact same opt-in security posture, since it runs on top of Express/Fastify underneath.
6. **Overusing Scope.REQUEST providers** without a genuine need, incurring real per-request DI resolution overhead the default singleton scope avoids entirely.
7. **Cramming unrelated logic into whichever of Guards/Interceptors/Pipes is most convenient** rather than respecting each mechanism's intended, distinct responsibility.
8. **Running ts-node or dev-mode file-watching in production** instead of compiling to dist/ and running the compiled JavaScript directly.
9. **Ignoring N+1 queries via TypeORM/Prisma**, the same universal ORM discipline gap seen across every framework covered on this platform.
10. **Choosing NestJS for a genuinely tiny service** where its additional structure and ceremony provide little benefit relative to a simpler Express (or Fastify) application — the choice should match the project's actual scale and team size.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Nest can't resolve dependencies of the X (?, ...) | A required provider isn't registered in the current module, or isn't exported from the module providing it | Add the provider to the relevant module's providers array, and/or export it from the module it's defined in |
| Circular dependency detected | Two modules or providers depend on each other directly | Use forwardRef() as a last resort, or refactor shared logic into a third module both depend on |
| A DTO's validation rules aren't enforced | No global ValidationPipe registered, or the DTO's decorators are missing/incorrect | Add app.useGlobalPipes(new ValidationPipe()) in main.ts; verify class-validator decorators on the DTO |
| Cannot GET /some-path (404) | Controller/module not imported into the application, or an incorrect @Controller path prefix | Verify the feature module is imported into AppModule (or a module AppModule imports) |
| UnauthorizedException never thrown despite a bad token | A Guard isn't actually applied to the route (missing @UseGuards), or the guard's logic has a bug | Verify @UseGuards is present at the correct scope (method/controller/global) |
| TypeORM: QueryFailedError | A raw or generated SQL query violates a constraint, or a relation isn't loaded correctly | Check the specific database error message; verify relations: [...] or the entity's relationship decorators |
| Jest tests fail with "Nest can't resolve dependencies" | A test module didn't provide a mock for every dependency the class under test requires | Add a provider entry (useValue/useClass) for every constructor dependency in Test.createTestingModule |
`,

  faqs: `
**Is NestJS "too heavy" for a small project?**
For a genuinely small service (a handful of endpoints, one developer), NestJS's dependency injection ceremony and module structure can feel like overhead relative to a simple Express app. The tradeoff pays off specifically as team size, codebase longevity, and architectural complexity grow — matching the project's actual scale to the framework's ceremony is the real decision, not "NestJS is always better/worse."

**NestJS or Express for a new TypeScript project?**
Choose NestJS if you want enforced architecture, a genuine dependency injection container, and consistent, first-party patterns across REST/GraphQL/microservices/WebSockets, especially for a larger team or longer-lived codebase. Choose Express if you want maximum flexibility and minimal ceremony, accepting that your team will need to establish and enforce its own conventions — see the **Express** skill for the direct comparison.

**Does NestJS replace Express?**
No — it runs ON TOP OF Express (by default) or Fastify (as an alternative adapter), adding architecture and structure as an application-layer abstraction, not replacing Node's underlying HTTP handling or concurrency model.

**Is NestJS's dependency injection the same as Angular's?**
Directly inspired by it and conceptually very similar (decorator-based, constructor injection, a hierarchical module/injector system), though NestJS's implementation and specific APIs are its own, tailored to backend rather than frontend concerns.

**Does NestJS eliminate Node.js's single-threaded concurrency limitations?**
No — NestJS is an application-layer framework, not a different runtime; every Node.js concurrency fact (event-loop blocking, the need for worker_threads/clustering) from the **Node.js** skill applies completely unchanged inside a NestJS application.

**Express or Fastify as NestJS's underlying adapter?**
Express is the default and has the largest middleware ecosystem; Fastify offers measurably better raw throughput and is a well-supported, documented alternative (@nestjs/platform-fastify) worth choosing when performance is a genuine, measured priority over Express's larger ecosystem.
`,

  "interview-questions": `
### Junior level

1. **What is dependency injection in the context of NestJS?**
   Model answer: A class declares its dependencies as constructor parameters; Nest's IoC container automatically constructs and provides those dependencies, rather than the class instantiating them itself — the same concept as Spring Boot's dependency injection, applied to TypeScript/Node.js.

2. **What is the difference between a Controller and a Provider (Service) in NestJS?**
   Model answer: A Controller (@Controller) handles incoming HTTP requests and routes them to the appropriate logic; a Provider (@Injectable, often a Service) contains the actual business logic and is injected into controllers (or other providers) that need it.

3. **What does a Module do in NestJS?**
   Model answer: @Module groups related controllers and providers into a cohesive unit, with an explicit exports array controlling what's usable by other modules that import it — Nest's enforced answer to organizing a growing application.

4. **What is a DTO, and why use class-validator with it?**
   Model answer: A Data Transfer Object defines the expected shape of incoming request data; class-validator decorators on its properties, combined with a ValidationPipe, automatically validate incoming requests against those rules before the controller method runs.

5. **What is the order of NestJS's request pipeline?**
   Model answer: Middleware, then Guards (authorization), then Interceptors' "before" phase, then Pipes (validation/transformation), then the route handler, then Interceptors' "after" phase, then Exception filters if an error occurred.

### Senior level

6. **Explain the distinct responsibilities of Guards, Interceptors, and Pipes, and why NestJS separates them.**
   Model answer: Guards decide whether a request is ALLOWED to proceed (authorization) and run first; Pipes validate/transform individual arguments before the handler; Interceptors wrap the handler entirely (via RxJS Observables), running logic both before and after, useful for logging, caching, and response transformation — separating these gives each a clear, single responsibility rather than one catch-all middleware mechanism.

7. **Does NestJS change Node.js's underlying concurrency model?**
   Model answer: No — NestJS is an application-layer framework built on top of Express or Fastify; it inherits Node's single-threaded event loop unchanged, meaning event-loop-blocking risks, the need for worker_threads for CPU-bound work, and multi-process scaling for multi-core usage all apply identically to a NestJS application as to plain Express.

8. **How would you resolve a circular dependency between two NestJS modules?**
   Model answer: Ideally by refactoring the shared logic both modules need into a third, shared module they both import, removing the circularity entirely; forwardRef() is Nest's explicit escape hatch for genuinely unavoidable circular relationships, but should be a last resort, not a routine pattern.

9. **What is provider scope, and when would you use Scope.REQUEST instead of the default?**
   Model answer: By default, providers are singletons — one instance shared across the application's entire lifetime, resolved once at startup. Scope.REQUEST creates a new instance per incoming request, useful for genuinely request-specific state (like a request-scoped correlation ID), at a real, measurable per-request DI resolution cost that should be incurred deliberately, not by default.

10. **How does NestJS's testing module make unit testing easier than a hand-rolled Express setup?**
    Model answer: Test.createTestingModule mirrors the real application's module construction but lets you substitute mocked providers (via useValue/useClass) through the exact same dependency injection mechanism the real application uses, avoiding manual monkey-patching or ad-hoc module mocking that a hand-structured Express application would require.

11. **How would you decide between NestJS and Express for a new project?**
    Model answer: Consider team size, expected codebase longevity, and how much the team values enforced structure versus maximum flexibility — NestJS's dependency injection, module boundaries, and consistent ecosystem patterns pay off more as these factors grow, while a small, short-lived, or highly flexible project may find Express's minimalism a better fit.

12. **What security behavior does NestJS provide automatically, given it's more structured than Express?**
    Model answer: None automatically beyond what Express itself provides — NestJS runs on top of Express/Fastify and inherits the same opt-in security posture; CSRF handling, security headers (helmet), rate limiting, and input validation (via class-validator/ValidationPipe, though NestJS makes this notably more consistent to apply) all require explicit configuration, just organized through Nest's own module/decorator patterns rather than Express's raw middleware.
`,

  "coding-questions": `
### 1. Implement a custom Guard checking a role-based permission

~~~typescript
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const Roles = (...roles: string[]) => SetMetadata("roles", roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!requiredRoles) return true;
    const request = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => request.user?.roles?.includes(role));
  }
}

@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Roles("admin")
  @Get("dashboard")
  getDashboard() { ... }
}
// Follow-up: how would you write a unit test for RolesGuard using a mocked ExecutionContext,
// verifying both the allowed and denied cases?
~~~

### 2. Implement a global interceptor for consistent API response formatting

~~~typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T; timestamp: string }> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T; timestamp: string }> {
    return next.handle().pipe(
      map((data) => ({ data, timestamp: new Date().toISOString() }))
    );
  }
}
// app.useGlobalInterceptors(new TransformInterceptor());
// Every controller's return value is now wrapped consistently: { data: ..., timestamp: ... }
// Follow-up: how would you EXCLUDE a specific endpoint (e.g., a file download) from this
// global transformation?
~~~

### 3. Implement a paginated endpoint with TypeORM

~~~typescript
@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private repo: Repository<Post>) {}

  async findPaginated(page: number, limit: number) {
    const [items, total] = await this.repo.findAndCount({
      relations: ["author"],
      order: { publishedAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, pages: Math.ceil(total / limit) };
  }
}

@Get()
list(@Query("page") page = 1, @Query("limit") limit = 20) {
  return this.postsService.findPaginated(+page, +limit);
}
// relations: ['author'] eager-loads the relationship in the same query, avoiding N+1.
// Follow-up: at what page-depth does OFFSET-based pagination (skip/take) become
// noticeably slow on a large table, and how would you switch to cursor-based pagination?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a REST API for a blog
A PostsModule and UsersModule, each with a controller, service, and DTOs, using class-validator for input validation. Deliverable: a working, validated CRUD API. Skills exercised: modules, controllers, providers, DTOs.

### Lab 2 (Intermediate): Add TypeORM integration and authentication
Integrate TypeORM with PostgreSQL, add Passport-based JWT authentication with a Guard protecting write endpoints, and a custom parameter decorator for the current user. Deliverable: an authenticated, database-backed API. Skills exercised: TypeORM, Guards, Passport, custom decorators.

### Lab 3 (Advanced): Add interceptors, exception filters, and testing
Add a global logging interceptor, a global exception filter for consistent error responses, and a full unit + e2e test suite using @nestjs/testing. Deliverable: a well-tested, consistently-structured API. Skills exercised: interceptors, exception filters, testing module.

### Lab 4 (Production): Deploy with microservices and full observability
Split the application into an HTTP-facing API and a Kafka-consuming microservice (e.g., for sending notification emails asynchronously), containerize both, and wire up structured logging and Prometheus metrics. Deliverable: a production-checklist-compliant, event-driven deployment. Skills exercised: microservices transport, deployment, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A structured backend for an enterprise AI feature rollout
Engineering requirements: a NestJS application managing feature flags, user permissions, and audit logging for a company rolling out AI features incrementally, with Guards enforcing role-based access, a clean module boundary between the feature-flag domain and the audit-logging domain, and comprehensive test coverage via @nestjs/testing. Demonstrates NestJS's fit for structured, compliance-relevant enterprise backend work.

### 2. An event-driven order-processing microservices system
Engineering requirements: an HTTP-facing NestJS API accepting orders, publishing events to Kafka, and a separate NestJS microservice consumer processing those events (inventory updates, notification sending), using Nest's built-in microservices transport support throughout. Demonstrates Nest's distinctive strength for consistent architecture across both HTTP and message-broker-based services.

### 3. A GraphQL API gateway aggregating multiple backend services
Engineering requirements: a NestJS application using @nestjs/graphql's code-first approach to expose a unified GraphQL schema aggregating data from several underlying REST/gRPC services, with DataLoader-based batching to avoid N+1 problems at the GraphQL resolver level specifically. Demonstrates Nest's first-class GraphQL integration alongside its REST/microservices support.
`,

  "case-studies": `
### NestJS's Angular-inspired architecture bet
Kamil Myśliwiec's decision to explicitly model NestJS's architecture on Angular's (rather than inventing an entirely novel pattern, or more closely mirroring plain Express) gave the framework immediate architectural credibility and familiarity for the substantial population of developers already comfortable with Angular's dependency injection and module system. Lesson: borrowing a well-proven architectural pattern from an adjacent, successful ecosystem can accelerate a new framework's adoption more than inventing something entirely original, especially when targeting developers already fluent in the borrowed pattern.

### The recurring "minimal framework, then structured framework" pattern
NestJS's emergence years after Express's dominance closely mirrors Django's later emergence relative to earlier, less-structured Python web tooling, and Spring Boot's relationship to raw servlet-based Java development — a recurring industry pattern where a minimal, flexible tool becomes ecosystem-dominant first, and a more structured, opinionated framework emerges specifically to serve the subset of users who've outgrown that flexibility's costs at scale. Lesson: "more structure" and "less structure" are not competing philosophies where one simply wins — they serve genuinely different points on the team-size/codebase-longevity spectrum, and healthy ecosystems tend to develop both.

### Enterprise adoption via consultancies
Large consultancies (Capgemini and similar firms) adopting NestJS specifically for client projects migrating from or alongside Java/Spring Boot stacks illustrates how a framework's ARCHITECTURAL FAMILIARITY (not just its technical merits) can drive adoption — teams and organizations with existing Spring Boot experience find NestJS's similar shape (modules, DI, decorators) genuinely lowers the learning curve for a language/runtime switch, independent of any head-to-head technical comparison between the two frameworks.

### NestJS's microservices support as a differentiator
Nest's early and sustained investment in first-class microservices transport support (Kafka, RabbitMQ, gRPC, NATS, all using the same controller/provider patterns as HTTP) has been a genuine differentiator versus Express, where equivalent event-driven architecture requires assembling separate, inconsistent libraries by hand. Lesson: a framework's decision to invest deeply in ONE particular architectural style (here, consistent patterns across radically different transport mechanisms) can become a durable competitive advantage for the specific class of teams building distributed, event-driven systems.
`,

  comparisons: `
| Aspect | NestJS | Express | Spring Boot | Django |
|--------|--------|---------|--------------|--------|
| Philosophy | Opinionated, structured, Angular-inspired | Minimal, unopinionated | Opinionated, auto-configuring | Batteries included |
| Dependency injection | Built in, foundational | None built in | Built in, foundational | None built in |
| Language | TypeScript (or JavaScript) | JavaScript/TypeScript | Java (or Kotlin) | Python |
| Underlying HTTP layer | Built on Express or Fastify | Is the HTTP layer itself | Built on Servlet API (embedded Tomcat) | Built on WSGI/ASGI |
| Microservices support | Built in (Kafka, RabbitMQ, gRPC, NATS) | Via separate libraries | Via Spring Cloud | Via separate libraries/Celery |
| Concurrency model | Node's single-threaded event loop (unchanged) | Node's single-threaded event loop | JVM threads (or virtual threads/WebFlux) | Process/thread-based (WSGI) or async (ASGI) |
| Best fit | Larger TypeScript teams, structured backends, microservices | Small-to-medium APIs, maximum control | Enterprise JVM shops, complex business domains | Data-model-heavy apps, internal tools |

**How seniors choose**: reach for NestJS when the team is TypeScript-centric, the codebase/team is large enough to benefit from enforced architecture, or the project needs consistent patterns across REST/GraphQL/microservices; reach for Express when maximum flexibility and minimal ceremony matter more, especially for smaller projects; reach for Spring Boot when the organization has an existing deep JVM investment; reach for Django when the team is Python-centric and values a similarly batteries-included, opinionated framework in that ecosystem.
`,

  "related-technologies": `
- **TypeScript** — the language NestJS is built around and requires deep fluency in; see the **TypeScript** skill.
- **Node.js** — the runtime NestJS sits on top of; every Node.js concurrency fact applies unchanged; see the **Node.js** skill.
- **Express** — NestJS's default underlying HTTP adapter; understanding it directly demystifies much of Nest's own request handling; see the **Express** skill.
- **TypeORM** and **Prisma** — the most common ORM choices integrated via NestJS's provider/module patterns.
- **Kafka** and **RabbitMQ** — the standard message-broker choices for NestJS's built-in microservices transport support.
- **PostgreSQL** and **MongoDB** — the most common production database choices paired with NestJS.
- **Docker** and **Kubernetes** — how NestJS applications are packaged, deployed, and orchestrated in modern production environments.

Learning path: **TypeScript** and **Node.js** → **Express** → this page → **PostgreSQL**/**MongoDB** for the storage layer → **Kafka**/**RabbitMQ** for microservices patterns → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **NestJS 10.x** is the current major line, with continued improvements to TypeScript support, the CLI's code-generation capabilities, and the Fastify adapter's feature parity with the default Express adapter.
- The **microservices transport ecosystem** (Kafka, RabbitMQ, gRPC, NATS, Redis) continues to mature, with NestJS's own team actively maintaining first-party support rather than leaving it entirely to community packages.
- Given NestJS's dependence on Node.js and TypeScript's own evolving feature sets underneath it, verify current compatibility between your NestJS version, Node.js LTS version, and TypeScript version before a major upgrade — the three evolve on independent, though generally compatible, release cadences.
- The broader "structured Node.js framework" space continues to see competition and evolution (alternative approaches, Fastify's own growing plugin ecosystem); NestJS nonetheless remains the dominant choice for teams specifically wanting Angular/Spring-Boot-style structure in the Node.js ecosystem.
`,

  "future-roadmap": `
Where NestJS is heading, and what's worth betting career time on:

- **Continued microservices and event-driven architecture investment** — Nest's team has consistently prioritized this differentiator, and it's likely to remain a key area of continued feature development and adoption growth.
- **Fastify adapter reaching full feature parity** with the default Express adapter — worth tracking for teams where raw HTTP throughput is a genuine, measured priority.
- **Continued TypeScript ecosystem alignment** — as TypeScript itself evolves (stricter type-checking modes, new language features), expect NestJS's own APIs to continue leveraging these improvements for better developer ergonomics and compile-time safety.
- **What to bet on**: deep fluency in dependency injection concepts (which transfer directly to Spring Boot, Angular, and other DI-based frameworks), the Guards/Interceptors/Pipes request-pipeline model, and Node.js's underlying concurrency model that NestJS never actually replaces — these fundamentals remain valuable regardless of which specific new NestJS feature lands next.
`,

  "cheat-sheet": `
~~~typescript
// ---- Bootstrap ----
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// ---- Module ----
@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],   // only what other modules genuinely need
})
export class PostsModule {}

// ---- Controller ----
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}   // auto-injected

  @Get(':id')
  getPost(@Param('id') id: string) { return this.postsService.findById(+id); }
}

// ---- Provider ----
@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private repo: Repository<Post>) {}
}

// ---- DTO + validation ----
export class CreatePostDto {
  @IsString() @MinLength(5)
  title: string;
}
// app.useGlobalPipes(new ValidationPipe());

// ---- Request pipeline order ----
// Middleware -> Guards -> Interceptors(before) -> Pipes -> Handler -> Interceptors(after) -> Exception filters

// ---- Guard ----
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean { ... }
}
// @UseGuards(AuthGuard)

// ---- Fixing N+1 (TypeORM) ----
this.repo.find({ relations: ['author'] });

// ---- Testing ----
const module = await Test.createTestingModule({
  providers: [PostsService, { provide: getRepositoryToken(Post), useValue: mockRepo }],
}).compile();

// ---- Production ----
// npm run build && node dist/main.js
// pm2 start dist/main.js -i max
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is NestJS built on top of? | Express by default, or Fastify as an alternative adapter — not a new HTTP engine. |
| What inspired NestJS's architecture? | Angular's module/DI/decorator system, adapted for backend Node.js development. |
| Order of the request pipeline? | Middleware -> Guards -> Interceptors(before) -> Pipes -> Handler -> Interceptors(after) -> Filters. |
| What do Guards decide? | Whether a request is ALLOWED to proceed at all (authorization). |
| What do Pipes do? | Validate/transform individual arguments before the handler runs. |
| What do Interceptors do? | Wrap the handler, running logic both before AND after (via RxJS Observables). |
| Default provider scope? | Singleton — one instance for the app's whole lifetime, resolved once at startup. |
| When to use Scope.REQUEST? | Only for genuine per-request state — it has a real, per-request DI resolution cost. |
| Does NestJS change Node's concurrency model? | No — event-loop blocking, worker_threads, and clustering all apply unchanged. |
| What is forwardRef() for? | Resolving genuine circular dependencies — a last resort, not a routine pattern. |
| What makes @nestjs/testing distinctive? | Mocked providers substitute through the SAME DI mechanism as the real app. |
| What must be exported for another module to use it? | The provider must be listed in the module's exports array. |
| Is security automatic in NestJS? | No — CSRF, headers, rate limiting are opt-in, same as plain Express underneath. |
| Express or Fastify adapter for raw throughput? | Fastify — a well-supported, documented swap when performance is a measured priority. |
`,

  mcqs: `
1. What does NestJS run on top of by default?
   A) A brand-new HTTP engine  B) Express  C) Deno  D) Nginx directly
   **Answer: B** — Fastify is available as an alternative adapter.

2. In NestJS's request pipeline, what runs FIRST among Guards, Interceptors, and Pipes?
   A) Pipes  B) Interceptors  C) Guards  D) They all run simultaneously
   **Answer: C** — Guards decide if the request is even allowed to proceed at all.

3. What is the default scope for a NestJS provider?
   A) Request-scoped  B) Singleton, resolved once at startup  C) Transient, a new instance every injection  D) No default, must be specified
   **Answer: B** — Scope.REQUEST is an explicit opt-in with a real per-request cost.

4. Does NestJS change how Node.js handles CPU-bound blocking code?
   A) Yes, it auto-parallelizes everything  B) No — the same event-loop-blocking risk applies unchanged  C) Yes, via built-in worker pools  D) NestJS has no event loop
   **Answer: B** — NestJS is an application-layer framework, not a different runtime.

5. What must a module do for another module to use one of its providers?
   A) Nothing, everything is global by default  B) Explicitly list the provider in its exports array  C) Use forwardRef()  D) Register it in main.ts
   **Answer: B** — enforced module boundaries are central to Nest's architecture.

6. Is CSRF protection or rate limiting enabled by default in a NestJS application?
   A) Yes, always  B) No — both require explicit middleware/module additions, same as plain Express  C) Only for GraphQL  D) Only in production mode
   **Answer: B** — NestJS inherits Express's opt-in security posture underneath.
`,

  "revision-notes": `
NestJS is an opinionated, TypeScript-first Node.js framework built ON TOP OF Express (by default) or Fastify, bringing Angular-inspired architecture — modules, dependency injection, decorators — to backend development specifically to fill the structural gap Express deliberately leaves open. A class declares its dependencies as constructor parameters, and Nest's IoC container automatically constructs and injects them; @Module decorators group related controllers and providers into cohesive units with explicit export boundaries, Nest's enforced answer to organizing a growing application that Express leaves entirely to team convention.

NestJS's request-processing pipeline has a precise, layered order: middleware, then Guards (deciding whether a request is allowed to proceed at all — authorization), then Interceptors' "before" phase, then Pipes (validating/transforming arguments), then the route handler itself, then Interceptors' "after" phase (built on RxJS Observables, wrapping the handler for logging/caching/response transformation), then Exception filters if an error occurred. Each mechanism has a distinct, intended responsibility, and respecting that separation (rather than cramming unrelated logic into whichever is convenient) keeps the pipeline's behavior predictable.

Critically, NestJS does NOT change Node.js's underlying single-threaded, event-loop concurrency model — every fact from the **Node.js** skill (event-loop blocking from synchronous CPU-bound code, the need for worker_threads for genuine parallelism, multi-process scaling via clustering for multi-core usage) applies completely unchanged inside a NestJS application, since Nest is purely an application-layer architectural abstraction sitting on top of the same Express/Fastify HTTP handling. Similarly, NestJS inherits Express's opt-in security posture entirely — CSRF protection, security headers (helmet), and rate limiting are not automatic, requiring the same explicit additions as plain Express, just organized through Nest's module/decorator patterns.

Provider scope defaults to singleton (one instance for the application's entire lifetime, resolved once at startup) — Scope.REQUEST creates a new instance per incoming request for genuinely request-specific state, at a real, measurable per-request dependency-resolution cost that should be incurred deliberately, not by default. Circular dependencies between modules or providers are resolved via forwardRef(), though a genuine circular dependency is frequently itself a signal to refactor shared logic into a third module both dependents import, rather than a routine pattern to reach for.

NestJS's testing module (@nestjs/testing) is one of its most genuinely distinctive advantages: Test.createTestingModule mirrors real module construction but lets mocked providers be substituted through the exact same dependency injection mechanism the real application uses, avoiding manual monkey-patching. NestJS's first-class, consistently-patterned microservices transport support (Kafka, RabbitMQ, gRPC, NATS, all using the same controller/provider architecture as HTTP) is a genuine differentiator versus assembling equivalent event-driven infrastructure by hand on top of plain Express.
`,

  "learning-roadmap": `
**Week 1 — NestJS fundamentals**: modules, controllers, providers, dependency injection, and basic DTOs with class-validator. Milestone: a working REST API with at least two feature modules, each with a controller and service.

**Week 2 — The request pipeline**: Guards for authorization, Pipes for validation, Interceptors for cross-cutting logic, and exception filters for centralized error handling. Milestone: an API with authentication-protected routes, consistent validation, and formatted error responses.

**Week 3 — Database integration**: TypeORM (or Prisma) integration following Nest's provider patterns, fixing a deliberately introduced N+1 query. Milestone: a CRUD API backed by a real database with correctly eager-loaded relationships.

**Week 4 — Testing**: unit tests using @nestjs/testing's mocked providers, and end-to-end tests with supertest against a fully-bootstrapped application. Milestone: a layered test suite covering both unit and integration levels for at least one feature module.

**Week 5 — Advanced architecture**: custom decorators, dynamic modules, provider scopes, and resolving a deliberately introduced circular dependency correctly. Milestone: refactor a circular-dependency scenario into a clean, non-circular module structure.

**Week 6 — Microservices and production**: add a Kafka or RabbitMQ-based microservice alongside the HTTP API, containerize both, and run through the full production checklist. Milestone: complete the Lab 4 hands-on project end to end.

Next platform skill once this roadmap is complete: **Kafka** or **RabbitMQ** in depth for the message-broker patterns Nest's microservices support builds on, or **Kubernetes** for orchestrating a NestJS microservices architecture at scale.
`,

  "official-docs": `
- **docs.nestjs.com** — the official NestJS documentation, exceptionally comprehensive and well-organized, covering every topic in this page in depth with runnable examples.
- **typeorm.io** — the official TypeORM documentation for entity relationships, query building, and migrations.
- **docs.nestjs.com/microservices/basics** — the official microservices transport documentation covering Kafka, RabbitMQ, gRPC, and NATS integration.
- **docs.nestjs.com/security** — the official security documentation covering authentication (Passport integration), authorization (Guards), and common web vulnerability defenses.
- **expressjs.com** — the official Express documentation, essential background given NestJS's default adapter runs on top of it.
`,

  books: `
- **"NestJS: A Progressive Node.js Framework" (official NestJS documentation, book-length)** — the most authoritative, comprehensive source, maintained directly by the NestJS team.
- **"Practical Microservices with NestJS" — various current authors (check for the latest edition)** — focused specifically on Nest's microservices transport capabilities in depth.
- **"Programming TypeScript" — Boris Cherny** — not NestJS-specific, but essential deep TypeScript fluency this page's decorator-heavy, type-driven style assumes.
- **"Dependency Injection Principles, Practices, and Patterns" — Mark Seemann and Steven van Deursen** — not NestJS-specific, but the definitive text on dependency injection as a general pattern, directly informing WHY Nest's architecture is designed the way it is.
`,

  blogs: `
- **The official NestJS blog and Trilon (the company behind NestJS's commercial support) blog** — release announcements and deep technical content directly from the maintaining team.
- **Kamil Myśliwiec's own talks and articles** — NestJS's creator, frequently covering architectural rationale directly.
- **LogRocket's and Snyk's NestJS content** — consistently high-quality, example-driven tutorials spanning beginner to advanced topics.
- **Trilon's engineering blog** — practical, production-focused NestJS content from the team most deeply invested in the framework's continued development.
`,

  "research-papers": `
NestJS, as an application framework, has no dedicated academic literature — the most relevant foundational reading concerns dependency injection as a general pattern, and Node.js's own event-driven architecture underneath it:

- **Fowler, M. — "Inversion of Control Containers and the Dependency Injection pattern"** (2004) — the same foundational essay referenced in the **Spring Boot** skill, directly explaining the pattern NestJS's own DI container implements for the Node.js ecosystem.
- For the event-driven, non-blocking I/O architecture NestJS inherits unchanged from Node.js, see the same foundational reading referenced in the **Node.js** skill's Research Papers section (the C10K problem, the reactor pattern).
- **Angular's own architectural design documents** (widely available via the Angular team's own blog and documentation, though not formal academic papers) are the closest primary source for the specific dependency-injection and module patterns NestJS explicitly borrowed and adapted.
`,

  videos: `
- **Kamil Myśliwiec's talks introducing and explaining NestJS's architecture** (available at various conferences, widely shared on YouTube) — the creator's own explanation of the framework's design rationale.
- **The official NestJS YouTube channel and Trilon's video content** — tutorial series covering fundamentals through advanced microservices topics.
- **Academind's and Traversy Media's NestJS tutorial series** — widely watched, clear, project-based coverage from fundamentals through deployment.
- **Fireship's "NestJS in 100 Seconds" and related rapid-overview content** — useful for a quick conceptual refresher.
- **Conference talks comparing NestJS to Express/Fastify** (various NodeConf/JSConf presentations) — useful for understanding the tradeoffs discussed throughout this page's Comparisons section.
`,

  "github-repos": `
- **nestjs/nest** — the framework's own source, well-organized and genuinely educational to read for understanding the DI container and module system directly.
- **nestjs/typeorm** — the official TypeORM integration module referenced throughout this page's Data Access sections.
- **nestjs/passport** — the official Passport.js integration for authentication strategies.
- **nestjs/microservices** (part of the main nestjs/nest monorepo) — the source for Nest's Kafka/RabbitMQ/gRPC/NATS transport support.
- **typestack/class-validator** — the validation library referenced throughout this page's DTO and Pipes sections.
- **nestjs/awesome-nestjs** — a widely referenced, curated list of NestJS resources, tools, and example projects.
- **nestjs/nest/tree/master/sample** — the official monorepo's own sample applications, an excellent source of real, idiomatic example code covering nearly every feature in this page.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Modules and dependency injection**: build a small application with at least three feature modules, ensuring correct export boundaries and no unnecessary over-exporting.
2. **The request pipeline**: implement a Guard, an Interceptor, and a Pipe for the same application, verifying (with logging) the exact order they execute in relative to each other.
3. **Database integration**: model a blog with TypeORM relationships, deliberately trigger an N+1 query, then fix it using the relations option and verify with query logging.
4. **Testing**: write both a unit test (mocked dependencies via @nestjs/testing) and an end-to-end test (supertest against a real bootstrapped app) for the same feature.
5. **Circular dependencies**: deliberately create a circular dependency between two modules, resolve it first with forwardRef(), then refactor to eliminate it entirely via a shared third module.
6. **External practice sets**: the official NestJS documentation's own first-steps tutorial for structured, guided practice; the nestjs/nest repository's sample applications for real, idiomatic code to read and extend; Practical Microservices with NestJS's exercises for deeper microservices-specific practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Client / API consumer"] -->|HTTPS| LB["Load balancer\n(TLS termination)"]
    LB --> N1["NestJS instance 1\n(Express/Fastify adapter, one Node process)"]
    LB --> N2["NestJS instance N"]
    N1 & N2 --> Guards["Guards\n(authorization)"]
    Guards --> Interceptors["Interceptors\n(logging, transformation)"]
    Interceptors --> Pipes["Pipes\n(validation via class-validator)"]
    Pipes --> Ctrl["Controllers"]
    Ctrl --> Svc["Providers / Services"]
    Svc --> ORM["TypeORM / Prisma"]
    ORM --> DB[("PostgreSQL / MongoDB")]
    Svc --> Cache[("Redis")]
    Svc -->|MessagePattern| MQ["Kafka/RabbitMQ\n(NestJS microservices)"]
    subgraph Observability
        Logger["Nest Logger / pino"]
        Sentry["Sentry / APM"]
        Metrics["Prometheus + event-loop lag"]
    end
    Svc -.-> Logger
    Svc -.-> Sentry
    Svc -.-> Metrics
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((NestJS))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Architecture
      Modules
      Controllers
      Providers and DI
      DTOs and validation
    Request Pipeline
      Middleware
      Guards
      Interceptors
      Pipes
      Exception filters
    Data and Integration
      TypeORM and Prisma
      Passport authentication
      Microservices Kafka RabbitMQ gRPC
      GraphQL support
    Advanced Patterns
      Custom decorators
      Dynamic modules
      Provider scopes
      Circular dependency resolution
    Production
      Underlying Node.js concurrency
      Testing module
      Deployment and clustering
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default nestjs;
