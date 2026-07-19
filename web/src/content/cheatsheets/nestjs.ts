import type { CheatSheetData } from "./types";

const nestjs: CheatSheetData = {
  title: "The Ultimate NestJS Cheat Sheet",
  subtitle: "Modules & DI · request pipeline · TypeORM · microservices · production toolbelt",
  sections: [
    {
      title: "Core Building Blocks",
      color: "violet",
      rows: [
        { term: "Bootstrap", desc: "Creates the app from the root module", code: "const app = await NestFactory.create(AppModule);\nawait app.listen(3000);" },
        { term: "Module", desc: "Groups controllers/providers; exports what others need", code: "@Module({\n  controllers: [PostsController],\n  providers: [PostsService],\n  exports: [PostsService],\n})" },
        { term: "Controller", desc: "Handles HTTP requests, delegates to a service", code: "@Controller('posts')\nclass PostsController {\n  constructor(private svc: PostsService) {}\n}" },
        { term: "Provider", desc: "Injectable class managed by the DI container", code: "@Injectable()\nclass PostsService { ... }" },
        { term: "Route decorators", desc: "Map HTTP verbs and extract exactly what's needed", code: "@Get(':id') get(@Param('id') id: string) { ... }\n@Post() create(@Body() dto: CreatePostDto) { ... }" },
      ],
    },
    {
      title: "Dependency Injection",
      color: "blue",
      rows: [
        { term: "Constructor injection", desc: "The only pattern used — automatic, no manual wiring", code: "constructor(private readonly svc: PostsService) {}" },
        { term: "Default scope", desc: "Singleton — one instance, resolved once at startup", code: "@Injectable()  // = Scope.DEFAULT" },
        { term: "Request scope", desc: "New instance per request — real per-request cost", code: "@Injectable({ scope: Scope.REQUEST })" },
        { term: "Dynamic module", desc: "Parameterize a module's config at import time", code: "static forRoot(opts): DynamicModule { return { module: X, providers: [...] }; }" },
        { term: "Circular dependency escape hatch", desc: "A last resort, not a routine pattern", code: "@Inject(forwardRef(() => ServiceB))" },
      ],
    },
    {
      title: "Request Pipeline",
      color: "emerald",
      rows: [
        { term: "Pipeline order", desc: "Memorize this — it's the most-asked interview question", code: "Middleware -> Guards -> Interceptors(before) -> Pipes\n  -> Handler -> Interceptors(after) -> Exception filters" },
        { term: "Guard", desc: "Decides if the request is ALLOWED to proceed at all", code: "@Injectable()\nclass AuthGuard implements CanActivate {\n  canActivate(ctx) { ... }\n}" },
        { term: "Pipe", desc: "Validates/transforms arguments before the handler runs", code: "app.useGlobalPipes(new ValidationPipe());" },
        { term: "Interceptor", desc: "Wraps the handler via RxJS — runs before AND after", code: "intercept(ctx, next) {\n  return next.handle().pipe(tap(() => log()));\n}" },
        { term: "Exception filter", desc: "Centralized error-to-HTTP-response mapping", code: "@Catch(HttpException)\nclass Filter implements ExceptionFilter { catch(e, host) { ... } }" },
      ],
    },
    {
      title: "Validation & Data",
      color: "amber",
      rows: [
        { term: "DTO", desc: "Declares the expected shape of incoming data", code: "class CreatePostDto {\n  @IsString() @MinLength(5)\n  title: string;\n}" },
        { term: "TypeORM entity", desc: "Class maps directly to a database table", code: "@Entity()\nclass Post { @PrimaryGeneratedColumn() id: number; }" },
        { term: "Repository injection", desc: "Same DI pattern applied to database access", code: "constructor(@InjectRepository(Post) private repo: Repository<Post>) {}" },
        { term: "Fix N+1", desc: "Eager-load a relationship in the same query", code: "this.repo.find({ relations: ['author'] });" },
      ],
    },
    {
      title: "Auth & Microservices",
      color: "rose",
      rows: [
        { term: "Passport integration", desc: "JWT/OAuth2 strategies via @nestjs/passport", code: "@UseGuards(AuthGuard('jwt'))" },
        { term: "Custom param decorator", desc: "Extract exactly the data a handler needs", code: "export const CurrentUser = createParamDecorator((d, ctx) =>\n  ctx.switchToHttp().getRequest().user);" },
        { term: "Microservice transport", desc: "Same controller/DI patterns for Kafka/RabbitMQ/gRPC", code: "@MessagePattern('order.created')\nhandle(data: any) { ... }" },
        { term: "Security is opt-in", desc: "NOT automatic — inherits Express's posture underneath", code: "app.use(helmet());  app.enableCors({ origin: '...' });" },
      ],
    },
    {
      title: "Testing & Production",
      color: "cyan",
      rows: [
        { term: "Isolated test module", desc: "Mocks substitute through the SAME DI mechanism", code: "await Test.createTestingModule({\n  providers: [Svc, { provide: Repo, useValue: mockRepo }],\n}).compile();" },
        { term: "E2E test", desc: "supertest against a fully bootstrapped app", code: "request(app.getHttpServer()).get('/posts').expect(200);" },
        { term: "Build and run", desc: "Compile first, never run ts-node in production", code: "npm run build\nnode dist/main.js" },
        { term: "Still one Node process", desc: "NestJS doesn't change the underlying concurrency model", code: "pm2 start dist/main.js -i max  // same as plain Express" },
      ],
    },
  ],
};

export default nestjs;
