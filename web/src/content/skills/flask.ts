import type { SkillContent } from "../types";

/**
 * Flask — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const flask: SkillContent = {
  overview: `
Flask is a minimal, unopinionated Python web framework — a "microframework" by explicit design, providing routing, request/response handling, and templating, and deliberately leaving the choice of ORM, authentication system, and project structure entirely to the developer. Where Django ships a complete, integrated stack, Flask ships a small core (built on the Werkzeug WSGI toolkit and Jinja2 templating) and trusts you to compose the rest from whichever libraries fit your project — a philosophy captured by its own tagline, "micro" not because it's limited, but because it doesn't decide these things for you.

For an AI engineer, Flask is frequently the fastest path to wrapping a model in a small, controllable web service — a quick internal API around a trained model for a demo, a lightweight webhook receiver, or a small dashboard where a full Django stack would be more machinery than the task needs. Flask's minimal footprint and near-zero learning curve for "just get an endpoint running" make it a common choice for prototypes and small services that later either stay small forever or get intentionally rebuilt on a more structured framework once requirements grow.

Key characteristics: a tiny core API (a handful of decorators and objects cover most day-to-day usage), an extension ecosystem (Flask-SQLAlchemy, Flask-Login, Flask-RESTful) that lets you add exactly the pieces you need, the Jinja2 templating engine (also used standalone elsewhere in the Python ecosystem), and — historically — a synchronous, WSGI-based request model, though modern Flask (2.0+) supports async view functions directly.
`,

  history: `
Flask was created by **Armin Ronacher** as an April Fools' joke in 2010 — a tongue-in-cheek "framework" built on his own Werkzeug WSGI toolkit and Jinja2 templating engine — that developers immediately took seriously and began using in real projects.

| Year | Milestone |
|------|-----------|
| 2010 | Armin Ronacher releases Flask, originally as a joke built atop his existing Werkzeug and Jinja2 libraries |
| 2010–2011 | Rapid real-world adoption despite its origin, driven by the appeal of a genuinely minimal, unopinionated Python web framework |
| 2012 | Flask 0.9 — the extension ecosystem (Flask-SQLAlchemy, Flask-Login, Flask-WTF) matures significantly |
| 2015 | Flask reaches version 1.0 development after years of 0.x releases, reflecting its slow-and-steady stabilization philosophy |
| 2018 | **Flask 1.0** finally released — years after the project's real-world maturity, a deliberate reflection of the maintainers' conservatism about API stability |
| 2020 | **Flask 2.0** — native async view function support (async def routes), a significant modernization |
| 2022 | Flask 2.2 — further async and typing improvements |
| 2023 | Flask 2.3/3.0 — dropping Python 2 compatibility code entirely, cleaner internals |
| 2024–2025 | Continued incremental releases; Flask's Pallets Projects organization (which also stewards Jinja2, Werkzeug, and Click) continues maintaining the ecosystem as a cohesive whole |

Flask's unusually long pre-1.0 period (eight years) is itself notable — the maintainers prioritized API stability and backward compatibility so strongly that they were reluctant to declare "1.0" until they were confident the public API had truly settled, a conservative approach that built significant developer trust over the framework's lifetime.
`,

  "why-it-exists": `
Flask exists because of a reaction against a specific pattern: **"batteries-included" frameworks like Django make architectural decisions (ORM choice, project layout, admin interface) that not every project wants or needs**, and a genuinely minimal alternative — one that provides just routing, requests, and templating, and gets entirely out of the way otherwise — was missing from the Python ecosystem at the time.

The prior landscape (before Flask) offered:

1. **Django**: complete and productive, but opinionated — you get its ORM, its templating, its project structure, whether or not they're the best fit for your specific project.
2. **Bare WSGI**: maximal flexibility, but you're writing request parsing, routing, and response construction from scratch for every project — too low-level for daily productivity.

Flask's insight was that a thin, well-designed layer directly on top of WSGI (via Werkzeug) — providing just enough (routing decorators, a request object, a response object, Jinja2 templating) to be immediately productive — could serve projects that didn't want or need a full framework's opinions, while still being small enough to fully understand end to end, a genuine rarity in web frameworks generally.
`,

  "problem-it-solves": `
Flask solves the **"I want Python web development's productivity without a framework's opinions about my ORM, project structure, or admin interface"** problem.

Concretely, Flask provides, and nothing more by default:

- **Routing**: mapping URL patterns to Python functions via simple decorators.
- **Request/response handling**: a global request object scoped correctly per-request even under concurrency, and simple ways to construct responses (JSON, HTML, redirects, custom status codes).
- **Templating**: Jinja2, a powerful, auto-escaping template engine, available out of the box for server-rendered HTML.
- **An extension mechanism**: a well-defined pattern (Flask-SQLAlchemy, Flask-Login, Flask-Migrate, and hundreds more) for adding exactly the additional capabilities a specific project needs, without every project carrying capabilities it doesn't use.

What Flask deliberately does **not** solve: it does not include an ORM, an admin interface, a built-in authentication system, or a prescribed project layout — all of these are left to the developer's choice of extensions and conventions, which is precisely the point, but does mean two different Flask codebases can look structurally very different from each other, unlike Django's more uniform project layout. Flask also historically lacked native async support (added only in Flask 2.0), and even with it, Flask's ecosystem and internals remain fundamentally synchronous-first, unlike FastAPI's async-native design.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Build a Flask application with routes, request handling, and Jinja2 templates.
2. Structure a non-trivial Flask project using the application factory pattern and Blueprints, avoiding the "everything in one file" trap.
3. Integrate Flask-SQLAlchemy for database access and Flask-Migrate for schema migrations.
4. Build a JSON API with Flask, including proper error handling and status codes.
5. Add authentication with Flask-Login or a token-based scheme, and understand Flask's session mechanism.
6. Apply Flask's configuration patterns correctly across development, testing, and production environments.
7. Test Flask applications using its test client and pytest.
8. Deploy a Flask application in production behind Gunicorn and a reverse proxy.
9. Explain the tradeoffs between Flask, Django, and FastAPI well enough to justify a framework choice in an interview or a real project decision.
`,

  prerequisites: `
- **Required**: solid **Python** fundamentals — functions, decorators, classes, context managers; Flask's API leans heavily on Python's own idioms rather than a framework-specific abstraction layer (see the **Python** skill).
- **Helpful**: basic **SQL** if you plan to use Flask-SQLAlchemy for database access.
- **Helpful**: the **REST** architectural style if building a JSON API rather than server-rendered HTML.
- **Helpful**: familiarity with **Django** provides a useful contrast — much of understanding Flask well is understanding what it deliberately does NOT do for you compared to a batteries-included framework.

Dependency links: **Python** → this page → **PostgreSQL**/**Redis** for the storage layer you'll choose yourself → **Docker**/**CI-CD** for deployment → **FastAPI** as a natural next comparison for async-first API work.
`,

  "beginner-concepts": `
### Your first Flask application

~~~python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello, Flask!"

@app.route("/greet/<name>")
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    app.run(debug=True)
~~~

The entire application above is a complete, runnable Flask app in under ten lines — @app.route is a decorator that registers a URL pattern and binds it to the function beneath it; <name> in the path captures a segment and passes it as a function argument.

### The request object and query parameters

~~~python
from flask import request

@app.route("/search")
def search():
    query = request.args.get("q", "")           # query string parameter, e.g. ?q=python
    return f"Searching for: {query}"

@app.route("/submit", methods=["POST"])
def submit():
    name = request.form.get("name")               # form-encoded POST body
    data = request.get_json()                       # JSON POST body
    return {"received": name}
~~~

request is a global-looking object that Flask correctly scopes to the current request under the hood (via a mechanism called context locals) — even though it looks like a plain module-level global, each concurrent request sees only its own request data, not another request's.

### Returning different response types

~~~python
from flask import jsonify, redirect, url_for

@app.route("/api/status")
def status():
    return jsonify({"status": "ok"}), 200          # JSON response with an explicit status code

@app.route("/old-page")
def old_page():
    return redirect(url_for("index"))               # url_for builds a URL from the view function's name
~~~

url_for generates a URL from a view function's name rather than hardcoding the path string — if the route's path changes later, every url_for reference updates automatically, avoiding broken hardcoded links scattered through templates and redirects.

### Templates with Jinja2

~~~html
<!-- templates/greet.html -->
<h1>Hello, {{ name }}!</h1>
{% if items %}
  <ul>
  {% for item in items %}
    <li>{{ item }}</li>
  {% endfor %}
  </ul>
{% endif %}
~~~

~~~python
from flask import render_template

@app.route("/greet-page/<name>")
def greet_page(name):
    return render_template("greet.html", name=name, items=["a", "b", "c"])
~~~

Jinja2 (also usable entirely outside Flask) auto-escapes all variable output by default, the same XSS-safe-by-default behavior seen in Django's template engine.

Common beginner trap: putting an entire application's routes, models, and logic in one app.py file — fine for a five-minute demo, painful past a few hundred lines, covered in Architecture.
`,

  "intermediate-concepts": `
### The application factory pattern

~~~python
# app/__init__.py
from flask import Flask

def create_app(config_object="config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
~~~

Rather than a single module-level app = Flask(__name__), the application factory wraps app creation in a function — essential for testing (each test can create a fresh app instance with test-specific config) and for supporting multiple configurations (development, testing, production) cleanly.

### Blueprints — Flask's modularity mechanism

~~~python
# app/routes.py
from flask import Blueprint

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return "Hello from a blueprint!"

@main_bp.route("/about")
def about():
    return "About page"
~~~

A Blueprint groups related routes (and templates, static files) into a reusable, registerable unit — Flask's answer to Django's "apps," letting a larger Flask project split logically without every route living in one giant file.

### Flask-SQLAlchemy for database access

~~~python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    def __repr__(self):
        return f"<Post {self.title}>"

# In the app factory:
# db.init_app(app)
~~~

Flask-SQLAlchemy wraps SQLAlchemy (a powerful, standalone Python ORM used across many frameworks, not just Flask) with Flask-specific conveniences — session management tied to the request lifecycle, and a slightly simplified declarative model syntax.

### Error handling

~~~python
from flask import jsonify

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "internal server error"}), 500
~~~

errorhandler registers a function to run whenever a specific HTTP error status (or exception type) occurs anywhere in the application, letting you return consistent, well-formatted error responses (especially important for a JSON API) instead of Flask's default HTML error pages.

### Sessions and Flask-Login

~~~python
from flask_login import LoginManager, login_user, login_required, current_user

login_manager = LoginManager()

@app.route("/dashboard")
@login_required
def dashboard():
    return f"Welcome, {current_user.username}"
~~~

Flask's built-in session mechanism stores signed (not encrypted, by default) session data in a client-side cookie; Flask-Login is the standard extension layering user authentication state (current_user, @login_required) on top of that session mechanism.

### Configuration management

~~~python
class Config:
    SECRET_KEY = "override-in-subclass"

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev.db"

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    SECRET_KEY = os.environ["SECRET_KEY"]
~~~

A class-based config hierarchy, selected via app.config.from_object at app-creation time, is the idiomatic Flask way to manage environment-specific settings — deliberately more manual than Django's settings modules, in keeping with Flask's "you decide the pattern" philosophy.
`,

  "advanced-concepts": `
### Application and request context internals

~~~python
from flask import current_app, g

@app.route("/config-check")
def config_check():
    return current_app.config["SOME_SETTING"]   # current_app is a context-local proxy

@app.before_request
def load_user():
    g.user = get_current_user_from_session()     # g is a per-request scratch space
~~~

Flask's request and current_app "globals" are actually context-local proxies backed by Werkzeug's context stack — under concurrent requests (even across threads or greenlets), each request sees its own isolated context, implemented via Python's contextvars (in modern Flask/Werkzeug) rather than true global state; understanding this distinction matters when debugging "why does this variable have the wrong value" issues under concurrency.

### Application-level hooks

~~~python
@app.before_request
def before():
    g.start_time = time.monotonic()

@app.after_request
def after(response):
    elapsed = time.monotonic() - g.start_time
    response.headers["X-Response-Time"] = f"{elapsed:.3f}"
    return response

@app.teardown_appcontext
def teardown(exception=None):
    db_session.remove()   # guaranteed to run even if the request raised an exception
~~~

before_request/after_request/teardown_appcontext are Flask's equivalent of Django's middleware — hooks that run around every request; teardown_appcontext specifically is guaranteed to run even when an exception occurred, making it the right place for cleanup (like closing a database session) that must always happen.

### Async views (Flask 2.0+)

~~~python
@app.route("/async-endpoint")
async def async_endpoint():
    result = await some_async_operation()
    return jsonify(result)
~~~

Flask 2.0+ supports async def view functions directly (requires the asgiref-backed adapter Flask installs automatically when async support is used), but Flask's underlying WSGI server model is still fundamentally synchronous — each async view is run to completion via an event loop created per-request, which is NOT the same as a genuinely async-native server handling many concurrent requests on one event loop the way FastAPI/Starlette does; for heavy async concurrency needs, FastAPI remains the more natural choice.

### Custom CLI commands

~~~python
import click

@app.cli.command("seed-db")
def seed_db():
    db.session.add(Post(title="First post"))
    db.session.commit()
    click.echo("Database seeded.")
~~~

Flask integrates Click (also from the same Pallets Projects family) for custom management commands, run via flask seed-db — Flask's lighter-weight equivalent of Django's manage.py custom commands.

### Application factories and testing

~~~python
import pytest
from app import create_app, db

@pytest.fixture
def app():
    app = create_app("config.TestingConfig")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_index(client):
    response = client.get("/")
    assert response.status_code == 200
~~~

The application factory pattern's real payoff shows here: each test gets a fresh, isolated app instance with test-specific configuration (typically an in-memory SQLite database), rather than tests fighting over shared global state.

### Extension design pattern

~~~python
class MyExtension:
    def __init__(self, app=None):
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.extensions["my_extension"] = self
        # register hooks, config defaults, etc.
~~~

Nearly every Flask extension (Flask-SQLAlchemy, Flask-Login, Flask-Migrate) follows this exact init_app(app) pattern specifically so extensions work correctly with the application factory pattern — an extension instance can be created once at import time and bound to a specific app instance later, supporting multiple app instances (as needed for testing) cleanly.
`,

  "internal-working": `
What happens inside Flask from an incoming WSGI request to the returned response:

~~~mermaid
flowchart LR
    A["WSGI server\n(Gunicorn)"] --> B["Werkzeug\n(routing, request/response objects)"]
    B --> C["Flask app.before_request hooks"]
    C --> D["Matched view function\n(business logic)"]
    D --> E["Jinja2 template rendering\n(if HTML) or jsonify (if JSON)"]
    E --> F["app.after_request hooks"]
    F --> G["teardown_appcontext\n(always runs, even on exception)"]
    G --> A
~~~

1. **WSGI entrypoint**: Gunicorn (or another WSGI server) receives the raw HTTP request and calls Flask's WSGI application callable.
2. **Werkzeug routing**: Flask delegates URL matching to Werkzeug's routing system, which maps the request path to the registered view function and extracts any captured path parameters.
3. **before_request hooks**: any @app.before_request functions run, in registration order, before the view itself.
4. **View function execution**: the matched view runs, typically querying the database (via Flask-SQLAlchemy or similar) and/or rendering a template.
5. **after_request hooks**: functions registered with @app.after_request run, able to modify the response (add headers, log timing) before it's sent.
6. **teardown_appcontext**: guaranteed to run regardless of whether the request succeeded or raised an exception — the correct place for cleanup like closing a database session.

**Why request/current_app "look like globals" but aren't**: Flask uses Werkzeug's LocalProxy mechanism (backed by Python's contextvars in modern versions) to make request, current_app, session, and g appear as simple module-level names while actually resolving to the CURRENT request/application context under the hood — this is what makes Flask's terse, decorator-based API possible without every view function needing an explicit request parameter threaded through every call, while still being safe under concurrent requests.
`,

  architecture: `
A senior engineer thinks about Flask at two levels: **what Flask itself provides** (a thin layer, deliberately) and **how a real Flask project should be structured**, since Flask itself prescribes no particular layout.

### What's actually in the box

~~~mermaid
flowchart TB
    subgraph Flask["Flask core"]
        Werkzeug["Werkzeug\n(WSGI toolkit: routing, request/response)"]
        Jinja["Jinja2\n(templating)"]
        Click["Click\n(CLI commands)"]
    end
    subgraph Extensions["Your choice of extensions"]
        ORM["Flask-SQLAlchemy\n(or none / raw SQL / another ORM)"]
        Auth["Flask-Login\n(or a custom/JWT scheme)"]
        Migrations["Flask-Migrate\n(Alembic wrapper)"]
    end
    Flask --> Extensions
~~~

Unlike Django, Flask's core provides ONLY the top box — everything in "Your choice of extensions" is an explicit decision the project makes, which is Flask's central tradeoff: more decisions for you to make, more precise control over exactly what's included.

### Recommended project layout (the application factory pattern)

~~~
myapp/
├── app/
│   ├── __init__.py            # create_app() factory
│   ├── models.py                # SQLAlchemy models
│   ├── extensions.py            # db, login_manager instances (created here, init'd in factory)
│   ├── main/
│   │   ├── routes.py             # a Blueprint
│   │   └── templates/main/
│   ├── api/
│   │   └── routes.py             # a separate Blueprint for JSON API routes
│   └── templates/
├── config.py                    # environment-specific config classes
├── migrations/                   # Flask-Migrate/Alembic migration files
├── tests/
└── wsgi.py                       # production entrypoint: from app import create_app
~~~

Rules mature Flask teams follow: always use the application factory pattern once a project grows past a quick script, split routes into Blueprints by feature area (mirroring Django's "apps" concept, achieved by convention rather than framework enforcement), and keep extension instances created at module level but initialized inside the factory via init_app(app) — the pattern every well-behaved Flask extension expects.
`,

  "data-flow": `
Tracing one HTTP request end to end — a JSON API request to fetch a post:

~~~mermaid
sequenceDiagram
    participant Client
    participant Gunicorn
    participant Werkzeug
    participant Flask as Flask app
    participant View
    participant DB as Flask-SQLAlchemy / PostgreSQL

    Client->>Gunicorn: GET /api/posts/42
    Gunicorn->>Werkzeug: WSGI environ
    Werkzeug->>Flask: match route, build request context
    Flask->>Flask: run before_request hooks
    Flask->>View: get_post(id=42)
    View->>DB: Post.query.get(42)
    DB-->>View: Post object
    View-->>Flask: jsonify(post.to_dict()), 200
    Flask->>Flask: run after_request hooks
    Flask->>Flask: teardown_appcontext (always)
    Flask-->>Gunicorn: HTTP response
    Gunicorn-->>Client: 200 OK + JSON
~~~

The most misunderstood part for newcomers: **the request object is not a parameter you pass around — it's imported directly** (from flask import request) and works correctly inside any view function because Flask/Werkzeug push a new request context onto a stack for each incoming request, and pop it off when the request completes; this is convenient but means request is only valid to access WITHIN an active request context (calling it from a background thread or a Celery task without explicitly pushing an app/request context raises a RuntimeError, a common early Flask gotcha).
`,

  "production-usage": `
### WSGI serving

~~~bash
pip install gunicorn
gunicorn "app:create_app()" --workers 4 --bind 0.0.0.0:8000
~~~

app.run(debug=True) (Flask's built-in development server) is explicitly not for production — like Django's runserver, it's single-threaded by default, unoptimized, and lacks process management; Gunicorn (or uWSGI) serves production Flask traffic, typically behind nginx.

### Configuration for production

~~~python
class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ["SECRET_KEY"]
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
~~~

Non-negotiables for production:

1. **DEBUG = False** — Flask's debug mode enables the interactive debugger, which can execute arbitrary Python code from a browser if left on in production — a genuinely severe vulnerability, not just an information leak.
2. **SECRET_KEY from environment** — signs session cookies and CSRF tokens (via Flask-WTF); a leaked or hardcoded key compromises both.
3. **A real production database**, connected via Flask-SQLAlchemy's connection pooling settings tuned appropriately for expected concurrency.

### Common production stacks

- **Small APIs/services**: Flask + Flask-SQLAlchemy + Gunicorn, often the entire stack for a focused internal tool or a model-serving wrapper.
- **Server-rendered applications**: Flask + Jinja2 + Flask-Login + Flask-WTF for forms, a lighter-weight alternative to Django when a full admin/ORM stack isn't needed.
- **Testing**: pytest with the application factory pattern, as shown in Advanced Concepts, is the standard modern approach.
`,

  "industry-examples": `
- **Netflix**: uses Flask for various internal tools and some API services, valued for its lightweight footprint when a full framework's overhead isn't warranted for a specific internal service.
- **Airbnb**: has used Flask for parts of its internal tooling and service layer, particularly where a small, focused service didn't need Django's full stack.
- **Reddit** (historically): portions of Reddit's infrastructure have used Flask-adjacent lightweight Python web tooling, reflecting the broader industry pattern of using minimal frameworks for focused services.
- **Uber**: has used Flask for microservices within its broader polyglot architecture, chosen specifically for services where a lean, easily-understood framework fit better than a heavier alternative.
- **Pinterest**: portions of Pinterest's service layer have used Flask for smaller, focused internal APIs.
- **Lyft**: uses Flask for select internal services, a common pattern among companies with a primarily Python-based backend that mixes Flask for lightweight services with a heavier framework (or FastAPI) for others.
- **Many ML model-serving wrappers industry-wide**: Flask is an extremely common choice specifically for "wrap this trained model in a small HTTP endpoint for a demo or internal tool" — its minimal footprint matches that narrow, well-defined task well.

Pattern to notice: Flask adoption clusters around **small, focused services and internal tools where a full framework's opinions (ORM, admin, project structure) would be more machinery than the task needs** — precisely the profile of most quick AI-model-serving wrappers and internal demos.
`,

  "best-practices": `
1. **Use the application factory pattern from the start of any project expected to grow past a quick script** — retrofitting it later, after tests and imports assume a module-level app instance, is more painful than starting with it.
2. **Split routes into Blueprints by feature area** as soon as a project has more than one clear feature area — don't let app.py become an unbounded file.
3. **Never leave DEBUG=True in production** — Flask's debugger can execute arbitrary code from a browser if reachable in production, a critical vulnerability, not just a leak.
4. **Load SECRET_KEY and all environment-specific config from environment variables**, never hardcoded in a committed config class.
5. **Use Flask-SQLAlchemy's session correctly** — don't manually manage sessions per request; let the extension's request-scoped session lifecycle handle it, and call teardown_appcontext for any custom cleanup.
6. **Return consistent, structured error responses for a JSON API** via @app.errorhandler, rather than letting Flask's default HTML error pages leak through to API clients.
7. **Choose extensions deliberately, not by default** — Flask's whole value proposition is not carrying capabilities you don't use; audit dependencies periodically.
8. **Use Flask-Migrate (Alembic) for schema changes**, not manual, un-tracked database changes, exactly for the same reasons Django's migrations exist.
9. **Test with the application factory + test client pattern**, giving each test a fresh, isolated app/database rather than fighting shared global state.
10. **Don't access request/current_app outside an active request/application context** (e.g., in a background thread) without explicitly pushing one — a common source of confusing RuntimeErrors.
11. **Prefer explicit JSON responses (jsonify) with explicit status codes** for API endpoints, rather than relying on Flask's default 200 for anything that returns without an explicit code.
12. **Run gunicorn with an appropriate worker count and timeout** tuned to your workload — Flask itself has no opinion here, unlike frameworks that ship default deployment guidance.
`,

  "anti-patterns": `
### Everything in one giant app.py file

~~~python
# WRONG — routes, models, config, and business logic all crammed into one file,
# with a module-level app = Flask(__name__) that's imported everywhere,
# making tests fight over shared global state
app = Flask(__name__)
db = SQLAlchemy(app)
# ... 800 more lines ...

# RIGHT — application factory + Blueprints, as shown in Architecture
def create_app(config_object):
    app = Flask(__name__)
    app.config.from_object(config_object)
    db.init_app(app)
    from .main import main_bp
    app.register_blueprint(main_bp)
    return app
~~~

The single most common Flask anti-pattern in real codebases: starting with the tutorial's one-file style and never migrating to the application factory pattern as the project grows — by the time it hurts, refactoring is a much bigger job than starting correctly.

### Other production-grade anti-patterns

- **Accessing request/g/current_app outside an active context** (e.g., in a background thread spawned from a view without pushing an app context) — raises a RuntimeError that's confusing without understanding Flask's context-local mechanism.
- **Storing large or sensitive data directly in the session cookie**: Flask's default session is signed but NOT encrypted — anyone can read (though not tamper with) the cookie's contents; never store secrets or large payloads there.
- **Forgetting to close database sessions**, relying on process exit to clean up instead of teardown_appcontext — leaks connections under sustained load.
- **Using Flask's development server or debug mode in any environment reachable by the public internet** — the interactive debugger is a remote-code-execution vector if exposed.
- **Mixing synchronous blocking I/O inside an async view function** — negates the benefit of using async in the first place and can behave unexpectedly given Flask's per-request event loop model.
- **Over-relying on global mutable state for things that should be request-scoped** — a classic footgun made worse by Flask's context-local "globals" looking deceptively like ordinary module-level variables.
`,

  performance: `
### Rule zero: measure first

~~~bash
pip install flask-debugtoolbar   # request timing, query count, and template rendering time in development
~~~

Flask has no built-in performance instrumentation — reach for Flask-DebugToolbar in development, and an APM tool (Sentry, New Relic) in production, rather than guessing.

### The performance hierarchy (apply in order)

1. **Fix N+1 database queries** — the same core problem as Django, addressed with SQLAlchemy's joinedload/selectinload options rather than Django's select_related/prefetch_related, but the identical underlying issue.
2. **Cache expensive, infrequently-changing data** with Flask-Caching (backed by Redis or Memcached) rather than recomputing on every request.
3. **Use an appropriate Gunicorn worker model** — sync workers for CPU-light, I/O-bound workloads; gevent/eventlet workers for high-concurrency I/O-bound workloads that don't need true async; or move to an ASGI server if genuinely async-heavy.
4. **Paginate large query results** rather than returning unbounded datasets from an API endpoint.
5. **Move slow, non-blocking work to a background task queue** (Celery, RQ) — the same principle as Django, since Flask has no built-in equivalent of its own.
6. **Profile with py-spy or cProfile** for CPU-bound view logic once query and caching optimizations are exhausted.

### Micro-level facts worth knowing

- Jinja2 template compilation is cached automatically after first render — the "compile template to Python bytecode" cost is paid once, not per request, in production (assuming templates aren't set to auto-reload, which should be off in production).
- SQLAlchemy's session identity map means fetching the same row twice within one request returns the same Python object, not a fresh query — useful to know when reasoning about whether a given access will hit the database again.
- Flask's context-local lookups (request, g) have a small but real per-access overhead versus a plain function parameter — negligible for nearly all real applications, occasionally worth knowing in an extremely hot loop.
`,

  scalability: `
Flask scales the same way any WSGI application does — **horizontally**, behind a load balancer, with the specific bottleneck depending entirely on what extensions and backing services the project chose (since Flask itself prescribes none).

### Single-region architecture

~~~mermaid
flowchart LR
    LB["Load balancer"] --> W1["Gunicorn worker pool\n(Flask app 1)"]
    LB --> W2["Gunicorn worker pool\n(Flask app N)"]
    W1 & W2 --> Cache[("Redis\ncache + sessions, if used")]
    W1 & W2 --> DB[("Chosen database\nvia Flask-SQLAlchemy or raw driver")]
    W1 & W2 --> Queue["Celery/RQ workers\n(background tasks, if used)"]
~~~

Because Flask itself makes no assumptions about state, scaling horizontally is straightforward as long as the application avoids in-process state that isn't safe across multiple worker processes (the same discipline any stateless web service needs) — sessions and caches should live in Redis, not in-process memory, the moment there's more than one Gunicorn worker or app instance.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| N+1 queries via SQLAlchemy | joinedload/selectinload eager loading, exactly analogous to Django's select_related/prefetch_related |
| In-process session/cache breaking multi-worker deployments | Move to Redis-backed sessions (Flask-Session) and Flask-Caching with a Redis backend |
| Slow synchronous requests blocking Gunicorn workers | Move slow work to Celery/RQ; increase worker count; consider gevent/eventlet workers for I/O-bound concurrency |
| A project's extension choices themselves becoming a bottleneck | Because Flask made you choose each piece, swapping one (e.g., a slower ORM pattern) is more isolated than in a monolithic framework |
`,

  security: `
### What Flask does NOT provide by default (unlike Django)

Flask's minimalism means several security-critical defaults Django ships automatically are NOT present unless you add them explicitly:

1. **CSRF protection**: not built in — Flask-WTF's CSRFProtect extension must be added explicitly for form-based CSRF tokens (see the **CSRF** skill).
2. **SQL injection protection**: only as strong as your chosen data-access layer — SQLAlchemy's ORM parameterizes queries safely, but raw SQL string concatenation (via any driver) reintroduces the risk exactly as in any language (see the **SQL Injection** skill).
3. **An admin interface with its own access control**: doesn't exist at all — any admin-style tooling is something you build and secure yourself.
4. **A built-in user/permission model**: Flask-Login handles session-based authentication state but not authorization/permissions out of the box — that logic is the application's responsibility, typically via a separate library or custom code.

### What Flask does provide

- **Signed session cookies**: Flask's default session mechanism cryptographically signs (not encrypts) cookie data using SECRET_KEY, preventing tampering (a modified cookie fails signature verification) but not preventing reading the (non-sensitive) contents.
- **Jinja2's auto-escaping**: the same XSS-safe-by-default template behavior as Django, on by default for .html templates.

### The core security discipline for Flask specifically

Because so much security-relevant behavior is opt-in via extensions, a Flask security review must explicitly verify: is CSRFProtect actually installed and applied to state-changing routes? Is DEBUG confirmed False in production (Flask's debugger is remote-code-execution-capable if exposed)? Is the database access layer using parameterized queries throughout, including any raw SQL? Is SECRET_KEY genuinely secret and rotated appropriately? None of these are automatic the way they are in Django — see the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Flask provides a test client built directly into the Flask application object, working naturally with pytest and the application factory pattern.

~~~python
import pytest
from app import create_app, db

@pytest.fixture
def app():
    app = create_app("config.TestingConfig")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_index_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200

def test_create_post_json(client):
    response = client.post("/api/posts", json={"title": "Test post"})
    assert response.status_code == 201
    assert response.get_json()["title"] == "Test post"
~~~

### Testing with a request/application context

~~~python
def test_something_needing_context(app):
    with app.test_request_context("/some-path"):
        # request, g, session are all valid here, even without a real HTTP call
        assert request.path == "/some-path"
~~~

app.test_request_context() pushes a real request context without making an actual HTTP request — useful for unit-testing code that depends on Flask's context-locals directly.

### The senior testing doctrine

- Use the application factory to give each test run a fresh app instance with a TestingConfig (typically an in-memory SQLite database for speed, unless the project relies on database-specific SQL features that SQLite doesn't support identically).
- Test JSON API endpoints through the test client, asserting both status codes and response body structure.
- Mock external services and any slow I/O — tests should never make real network calls.
- Run the suite in CI on every PR; since Flask has no built-in migrations check, add an explicit CI step verifying Flask-Migrate's migration files are current if the project uses them.
`,

  debugging: `
### The toolbox, in escalation order

1. **Flask's interactive debugger** (development only, DEBUG=True) — on an unhandled exception, shows a full traceback IN THE BROWSER with an interactive Python console at each stack frame; extraordinarily useful locally, and exactly why it must never be reachable in production.
2. **Flask-DebugToolbar** — adds request timing, SQL query count, and template rendering cost panels to the debug page.
3. **print(query) on a SQLAlchemy query object** or enabling SQLAlchemy's echo=True config — shows the exact generated SQL, the same debugging technique as Django's queryset.query.
4. **pdb/ipdb** — standard Python debugging works identically inside any Flask view.
5. **Logging** — Flask integrates with Python's standard logging module (app.logger); configure handlers and levels appropriately per environment.
6. **flask routes** (a built-in CLI command) — lists every registered route, endpoint name, and allowed methods, useful for debugging "why isn't this URL matching."

### Debugging common Flask-specific symptoms

- "RuntimeError: Working outside of application context" — code accessed current_app, g, or the database outside an active app/request context (e.g., in a background thread); push an explicit app context (with app.app_context():) or request context as needed.
- "Working outside of request context" — same idea, specifically for request/session; common when calling view-only helper functions from a CLI command or a Celery task.
- Session data not persisting between requests — check SECRET_KEY is set and consistent across app restarts/processes (a session signed with one key can't be verified with another), and check cookie domain/path settings.
`,

  monitoring: `
Production Flask visibility rests on the same three pillars as any web framework, assembled from your own choice of tools since Flask itself provides no built-in observability layer.

### Structured logging

~~~python
import logging

app.logger.setLevel(logging.INFO)

@app.route("/api/orders", methods=["POST"])
def create_order():
    app.logger.info("order created", extra={"order_id": order.id, "user_id": current_user.id})
~~~

Configure Flask's logger (built on Python's standard logging) with a JSON formatter for structured, queryable logs in production, exactly as recommended for Django.

### Application performance monitoring

Sentry's Flask integration (sentry-sdk[flask]) is the most common choice for error tracking and basic performance monitoring, auto-instrumenting views and (with the SQLAlchemy integration enabled) database queries.

### Metrics

prometheus_flask_exporter exposes request counts, latencies, and status-code breakdowns in Prometheus format — the same RED metrics (Rate, Errors, Duration) pattern recommended across every framework in this platform; see the **Prometheus** skill.

### Flask-specific signals to watch

- **Gunicorn worker restarts and timeouts** — a rising restart rate often indicates requests exceeding the configured timeout, worth correlating with slow endpoint logs.
- **SQLAlchemy connection pool exhaustion** — visible as connection-wait errors under load; tune pool_size and max_overflow appropriately for expected concurrency.
- **Session/cache backend health** (Redis, if used) — since Flask centralizes none of this, monitor whatever backing services the project chose directly.
`,

  deployment: `
### The standard: Gunicorn behind nginx, containerized

~~~dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_ENV=production
EXPOSE 8000
CMD ["gunicorn", "wsgi:app", "--workers", "4", "--bind", "0.0.0.0:8000", "--timeout", "30"]
~~~

Why each choice matters: wsgi.py typically contains app = create_app("config.ProductionConfig") — a stable, explicit entrypoint Gunicorn imports; --timeout 30 sets an explicit worker timeout so a single stuck request doesn't hang a worker indefinitely; the number of workers is tuned to available CPU cores and expected concurrency, same principle as Django's Gunicorn configuration.

### nginx in front

Identical role to any WSGI Python framework: nginx terminates TLS, serves any static files directly, and proxies dynamic requests to Gunicorn — Flask has no built-in static file optimization for production the way it does for convenient local development (app.static_folder).

### Migrations in the deploy pipeline (Flask-Migrate)

~~~bash
flask db upgrade   # apply pending Alembic migrations, analogous to Django's migrate
~~~

Run as an explicit, coordinated pre-deploy step for the same reasons discussed in the Django page — avoiding multiple instances racing to apply the same migration during a rolling deployment.

### CI/CD pipeline

Lint (ruff/flake8) → test suite (pytest) → migrations-current check (if using Flask-Migrate) → build the Docker image → scan → push → run migrations → rolling deploy. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before a Flask application takes real traffic:

- [ ] DEBUG = False and FLASK_ENV set appropriately — Flask's debugger must never be reachable in production
- [ ] SECRET_KEY loaded from environment/secret store, never hardcoded
- [ ] CSRFProtect (Flask-WTF) enabled for any form-based, cookie-authenticated state-changing endpoint
- [ ] Session cookies configured with SESSION_COOKIE_SECURE and SESSION_COOKIE_HTTPONLY
- [ ] Database access confirmed parameterized throughout, including any raw SQL
- [ ] Gunicorn (not the Flask dev server) running behind nginx, with an explicit worker timeout
- [ ] Flask-Migrate migrations applied as an explicit, coordinated deploy step
- [ ] Structured logging configured, shipping to a log aggregation platform
- [ ] Sentry (or equivalent) wired up for error tracking with request context
- [ ] Sessions/caching backed by Redis, not in-process memory, if running multiple workers/instances
- [ ] Slow, non-blocking work (emails, heavy computation) moved to Celery/RQ
- [ ] Database connection pool sized appropriately for expected concurrency
- [ ] Load test done: known requests/sec ceiling for critical endpoints
- [ ] Runbook: how to roll back a bad deploy and a bad migration
`,

  "common-mistakes": `
1. **Starting with a single-file app.py and never migrating to the application factory pattern** as the project grows, making testing and multi-environment config painful later.
2. **Leaving DEBUG=True (or FLASK_ENV=development) in production** — Flask's interactive debugger is remote-code-execution-capable if reachable by an attacker, more severe than Django's equivalent information-leak risk.
3. **Assuming CSRF protection exists by default** — unlike Django, Flask requires Flask-WTF's CSRFProtect to be added explicitly; forgetting it leaves state-changing forms vulnerable.
4. **Accessing request/g/current_app from outside an active context** (background threads, Celery tasks) without explicitly pushing one, causing confusing RuntimeErrors.
5. **Not eager-loading related SQLAlchemy objects**, hitting the same N+1 query problem as Django's ORM, just via joinedload/selectinload instead of select_related/prefetch_related.
6. **Storing sensitive data in the session cookie**, forgetting that Flask's default session is signed but not encrypted — anyone can read (not tamper with) its contents.
7. **Choosing extensions inconsistently across a team** without documenting the decision — since Flask prescribes nothing, undocumented extension choices make onboarding new team members to the specific project's stack harder than a more opinionated framework would.
8. **Running the Flask development server in any production-adjacent environment** — it's single-threaded and unoptimized by default, exactly like Django's runserver.
9. **Not versioning or reviewing Flask-Migrate's generated migration files** before applying them, same risk profile as an unreviewed Django migration.
10. **Assuming Flask's async support means genuinely concurrent async handling** the way FastAPI provides — Flask 2.0+'s async views run via a per-request event loop, not a shared, always-on async runtime.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| RuntimeError: Working outside of application context | Accessed current_app/db outside an active app context (e.g., background thread) | Push an explicit context: with app.app_context(): ... |
| RuntimeError: Working outside of request context | Accessed request/session outside an active request context | Same fix, scoped to test_request_context or an actual request |
| 404 Not Found for a route you defined | Trailing-slash mismatch, wrong HTTP method, or Blueprint not registered | Check methods=[...] on the route, and confirm register_blueprint was called |
| TemplateNotFound | Template file missing from the expected templates/ directory relative to the app/Blueprint | Verify template_folder setting and Blueprint-specific template paths |
| sqlalchemy.exc.OperationalError | Database not migrated, or connection details wrong for the current environment | Run flask db upgrade; verify SQLALCHEMY_DATABASE_URI for the active config |
| 400 Bad Request on request.get_json() | Request body isn't valid JSON, or Content-Type header isn't application/json | Ensure the client sends Content-Type: application/json with a valid JSON body |
| SECRET_KEY not set warnings/errors | Config class didn't set SECRET_KEY, or environment variable is missing | Set SECRET_KEY explicitly per environment, from a secret store in production |
`,

  faqs: `
**Is Flask "too minimal" for a real production application?**
No — many substantial production systems run on Flask successfully; "minimal" describes what Flask includes by default, not a ceiling on what you can build. The tradeoff is that YOU choose and integrate the ORM, auth, and structure, rather than getting them pre-decided.

**Flask or Django for a new project?**
Choose Django if the application is data-model-heavy, benefits from an admin interface, or the team values a well-trodden, opinionated path. Choose Flask if you want precise control over which pieces (ORM, auth scheme, project layout) to include, or the application is small and focused enough that Django's full stack would be more machinery than needed.

**Flask or FastAPI for a new API?**
FastAPI is increasingly preferred for pure JSON APIs today, specifically for native async support, automatic request validation via type hints, and automatic OpenAPI documentation — all things Flask either lacks or only partially supports via extensions. Flask remains a strong choice when the team already has deep Flask expertise, needs server-rendered HTML via Jinja2 alongside API routes, or the async performance ceiling genuinely doesn't matter for the workload.

**Does Flask have an ORM?**
Not built in — Flask-SQLAlchemy is the overwhelmingly standard choice, wrapping the framework-agnostic SQLAlchemy library with Flask-specific request-lifecycle conveniences.

**Is Flask's session data secure?**
It's signed (tamper-evident) using SECRET_KEY by default, but NOT encrypted — never store sensitive data directly in the session cookie; keep the session to a small user/session identifier and look up sensitive data server-side.

**How does Flask handle concurrency?**
Flask itself is a thin layer over WSGI and doesn't dictate concurrency — that's determined by your WSGI server (Gunicorn's worker model: sync, gevent, eventlet, or an ASGI server if using Flask's async support), giving you more explicit control than a framework with an opinionated built-in server, at the cost of needing to understand and choose that model yourself.
`,

  "interview-questions": `
### Junior level

1. **What is the core philosophy difference between Flask and Django?**
   Model answer: Django is "batteries included" — an ORM, admin, and auth system ship pre-integrated; Flask is a minimal "microframework" providing only routing, request/response handling, and templating, leaving the rest to the developer's choice of extensions.

2. **What does @app.route do?**
   Model answer: It's a decorator that registers a URL pattern and binds it to the decorated view function, so Flask calls that function when a matching request arrives.

3. **How do you access query string parameters and JSON body data in a Flask view?**
   Model answer: request.args.get("key") for query string parameters; request.get_json() for a JSON request body; request.form.get("key") for form-encoded POST data.

4. **What is Jinja2 and what does it auto-escape?**
   Model answer: Flask's default templating engine; it auto-escapes all variable output by default (e.g., {{ value }}), closing off the most common XSS injection vector unless a template explicitly opts out.

5. **What does url_for do and why use it instead of hardcoding paths?**
   Model answer: It generates a URL from a view function's registered name, so if the route's path string changes later, every reference generated via url_for updates automatically instead of breaking.

### Senior level

6. **What is the application factory pattern and why does it matter?**
   Model answer: Wrapping app creation in a create_app() function rather than a module-level app = Flask(__name__) instance, essential for testing (each test gets a fresh, isolated app with test-specific config) and for supporting multiple environment configurations cleanly.

7. **Explain what request and current_app actually are internally.**
   Model answer: They are context-local proxies (backed by Werkzeug's context stack, implemented via Python's contextvars in modern versions) that resolve to the CURRENT request/application context — they look like plain globals but are correctly isolated per-request even under concurrency, and only valid within an active request/application context.

8. **How does Flask's async support (2.0+) actually work, and how does it differ from FastAPI?**
   Model answer: Flask 2.0+ allows async def view functions, run to completion via a per-request event loop; this is NOT the same as a genuinely async-native server (like FastAPI/Starlette on Uvicorn) handling many concurrent requests on one shared event loop — Flask's async support improves ergonomics for calling async libraries but doesn't fundamentally change Flask's synchronous-first concurrency model.

9. **Why doesn't Flask include CSRF protection by default, unlike Django, and what do you add to get it?**
   Model answer: Consistent with Flask's minimal-core philosophy — CSRF protection is provided by the Flask-WTF extension's CSRFProtect, an explicit opt-in rather than an automatic default, meaning a Flask security review must specifically verify it was actually added.

10. **How would you structure a growing Flask project to avoid the "one giant app.py" problem?**
    Model answer: Adopt the application factory pattern and split routes into Blueprints by feature area, mirroring the separation Django's "apps" provide by convention rather than framework enforcement.

11. **What's the difference between before_request/after_request and teardown_appcontext?**
    Model answer: before_request/after_request run around a normally-completing request; teardown_appcontext is guaranteed to run even if the request raised an exception, making it the correct place for cleanup (like closing a database session) that must always happen regardless of success or failure.

12. **When would you choose Flask over FastAPI for a new API service?**
    Model answer: When the team already has deep Flask/Jinja2 expertise, the service mixes server-rendered pages with API routes, or genuinely doesn't need FastAPI's async concurrency or automatic OpenAPI generation enough to justify the switch — otherwise FastAPI's native async and validation model is increasingly the default choice for pure new APIs.
`,

  "coding-questions": `
### 1. Build a paginated JSON API endpoint with Flask-SQLAlchemy

~~~python
from flask import request, jsonify

@app.route("/api/posts")
def list_posts():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    pagination = Post.query.order_by(Post.published_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "items": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    })
# Time: one indexed query per page; error_out=False returns an empty page instead of a 404
# for an out-of-range page number.
# Follow-up: how would you add cursor-based pagination instead, and why might that be
# preferable for a feed that's actively being written to concurrently?
~~~

### 2. Implement a rate-limited endpoint using Flask-Limiter

~~~python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day"])

@app.route("/api/expensive-operation")
@limiter.limit("5 per minute")
def expensive_operation():
    return jsonify({"result": run_expensive_computation()})
# Follow-up: what happens under a distributed, multi-instance deployment with the default
# in-memory limiter storage, and how would you fix it (hint: a shared Redis storage backend)?
~~~

### 3. Write a custom error handler that returns consistent JSON errors across the whole API

~~~python
from werkzeug.exceptions import HTTPException
from flask import jsonify

@app.errorhandler(HTTPException)
def handle_http_exception(e):
    return jsonify({"error": e.name, "message": e.description}), e.code

@app.errorhandler(Exception)
def handle_unexpected_exception(e):
    app.logger.exception("unhandled exception")
    return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred"}), 500
# The two-tier handler catches known HTTP exceptions (404, 400, etc.) with their real
# status/message, and anything else falls through to a generic 500 without leaking
# internal exception details to the client.
# Follow-up: how would you differentiate this behavior between development (show details)
# and production (hide details), using app.debug or a config flag?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a to-do list web app
Routes for listing, creating, and completing to-do items, Jinja2 templates for the UI, and in-memory or SQLite storage via Flask-SQLAlchemy. Deliverable: a working CRUD to-do app. Skills exercised: routing, templates, Flask-SQLAlchemy basics.

### Lab 2 (Intermediate): Refactor to the application factory pattern with Blueprints
Take Lab 1 and restructure it into an application factory, splitting routes into at least two Blueprints, and add a pytest suite using the factory pattern. Deliverable: a tested, properly structured Flask project. Skills exercised: application factory, Blueprints, testing.

### Lab 3 (Advanced): Add authentication and a JSON API layer
Add Flask-Login for session-based auth, Flask-WTF's CSRFProtect for the HTML forms, and a parallel JSON API (with token-based auth instead of session cookies) exposing the same to-do data. Deliverable: a dual HTML+API application with both auth schemes working correctly. Skills exercised: Flask-Login, CSRF, API design, authentication schemes.

### Lab 4 (Production): Deploy behind Gunicorn + nginx with full observability
Containerize the app, configure production settings, add Flask-Migrate for schema management, wire up Sentry and structured logging, and deploy behind nginx. Deliverable: a production-checklist-compliant deployment with a load test showing p95/p99 latency. Skills exercised: deployment, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A lightweight model-serving wrapper for a demo
Engineering requirements: a Flask API wrapping a trained ML model (loaded once at startup, not per-request), input validation, a health check endpoint, rate limiting, and a Dockerfile — the exact "quick, controllable service around a model" use case Flask excels at.

### 2. An internal admin dashboard without Django's full stack
Engineering requirements: Flask + Jinja2 server-rendered pages, Flask-Login for staff authentication, Flask-SQLAlchemy against an existing database (perhaps one owned by another service), and role-based view access — demonstrating Flask's fit for a focused internal tool where a full Django admin isn't the right shape (e.g., the underlying data model doesn't map cleanly to Django's ORM conventions).

### 3. A webhook receiver and event-forwarding service
Engineering requirements: Flask endpoints receiving webhooks from multiple third-party services, signature verification per provider, idempotent processing (handling duplicate webhook deliveries safely), and forwarding validated events to a message queue (Kafka/RabbitMQ) for downstream processing. Demonstrates Flask's strength as a lean, focused service at a system's edge.
`,

  "case-studies": `
### Flask's origin as an April Fools' joke that became real infrastructure
Armin Ronacher's original release of Flask as a joke, quickly adopted seriously by the Python community, is a genuinely useful case study in software design: the framework succeeded not because of marketing but because its minimal, well-composed core (built on already-solid Werkzeug and Jinja2 libraries) solved a real, felt gap left by heavier frameworks. Lesson: a small, honest, well-integrated tool can outcompete a bigger one when it matches what a real segment of users actually needs.

### Flask's unusually long pre-1.0 period
Flask didn't reach version 1.0 until 2018, eight years after its initial release, despite being in widespread production use for most of that time — the maintainers deliberately prioritized API stability over a symbolic version number. Lesson: a framework's version number is not the same signal as its production-readiness; Flask's conservative, backward-compatibility-focused culture built durable developer trust independent of its slow formal versioning.

### Netflix and Uber's use of Flask alongside heavier frameworks
Companies with primarily Python-based, polyglot service architectures (Netflix, Uber, Lyft, among others) commonly use Flask specifically for smaller, focused services within a broader system that also includes Django applications and/or FastAPI services elsewhere. Lesson: framework choice at large companies is rarely "pick one for everything" — it's choosing the right-sized tool per service, and Flask's minimalism is frequently the right fit for the smaller, more focused pieces of a larger system.

### The extension ecosystem's init_app pattern as emergent standardization
Even though Flask itself prescribes no structure, its extension ecosystem (Flask-SQLAlchemy, Flask-Login, Flask-Migrate, and hundreds more) converged independently on the same init_app(app) initialization pattern specifically to support the application factory pattern correctly. Lesson: a minimal framework can still produce strong, consistent conventions across its ecosystem when a real technical need (supporting multiple app instances cleanly) drives independent projects toward the same solution.
`,

  comparisons: `
| Aspect | Flask | Django | FastAPI | Express (Node.js) |
|--------|-------|--------|---------|--------------------|
| Philosophy | Minimal, unopinionated, build up | Batteries included, opinionated | Modern async API-first | Minimal, unopinionated |
| ORM | Not included (Flask-SQLAlchemy typical) | Built in, mature | Not included (SQLAlchemy typical) | Not included (Prisma/Sequelize typical) |
| Admin interface | None built in | Built in, auto-generated | None built in | None built in |
| Async support | Added in 2.0, per-request event loop | Retrofitted since 3.0/3.1 | Native, async-first | Native (event loop) |
| Auto API docs | Via Flask-RESTX or similar | Via Django REST Framework + drf-spectacular | Built in (OpenAPI/Swagger automatic) | Via separate tooling |
| CSRF protection | Opt-in via Flask-WTF | Built in by default | Not applicable in the same way (typically token-auth APIs) | Opt-in via middleware |
| Best fit | Small services, prototypes, mixed HTML+API apps | Data-model-heavy apps, internal tools, content platforms | Async-first APIs, ML model serving | JS-native APIs, real-time apps |

**How seniors choose**: reach for Flask when you want Python and full control over exactly which pieces (ORM, auth, structure) to include, especially for a small or mixed HTML+API service; reach for Django when the application has a rich data model or benefits from an admin interface fast; reach for FastAPI when building a lean, async-native pure API, especially one serving an ML model where automatic validation and OpenAPI docs matter; reach for Express when the surrounding team/ecosystem is JavaScript/Node.js-centric.
`,

  "related-technologies": `
- **Python** — the language Flask is built in; see the **Python** skill.
- **Werkzeug** and **Jinja2** — the two libraries Flask is built directly on top of, both usable standalone outside Flask entirely.
- **SQLAlchemy** (via Flask-SQLAlchemy) — the standard, framework-agnostic ORM most Flask projects use for database access.
- **Celery** and **RQ** — the standard background task queue choices paired with Flask, since Flask has no built-in equivalent.
- **Redis** — the typical cache, session, and Celery broker backend for production Flask deployments.
- **Django** and **FastAPI** — the two most common alternative Python web framework choices, each trading Flask's minimalism for a different point on the completeness/opinionatedness spectrum.
- **Docker** and **CI/CD** — how Flask applications are packaged and shipped in modern production environments.

Learning path: **Python** → this page → **PostgreSQL**/**Redis** for whichever storage layer you choose → **Docker**/**CI-CD** for deployment → **Django** or **FastAPI** for a contrasting, more opinionated Python web framework perspective.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Flask 3.x** is the current major line, having dropped legacy Python 2 compatibility code entirely and continued refining async view support and typing throughout the Pallets Projects ecosystem (Flask, Werkzeug, Jinja2, Click).
- Async support (introduced in Flask 2.0) continues to mature, but Flask's fundamental request model remains synchronous-first at its core — verify current-version specifics before assuming parity with a genuinely async-native framework for high-concurrency workloads.
- The extension ecosystem continues to be actively maintained (Flask-SQLAlchemy, Flask-Login, Flask-Migrate, Flask-WTF), though individual extension release cadences vary independently of Flask's own core releases — verify a specific extension's compatibility with your Flask version before upgrading either.
- Given Flask's historically conservative, slow-changing API, check the official Flask changelog for the specific version you're deploying, but expect fewer breaking changes between versions than more rapidly-evolving frameworks.
`,

  "future-roadmap": `
Where Flask is heading, and what's worth betting career time on:

- **Continued async ergonomics improvements** — while Flask's core request model likely remains synchronous-first for the foreseeable future, expect continued refinement of how cleanly async code integrates with Flask's existing APIs.
- **The Pallets Projects ecosystem's continued cohesion** — Flask, Werkzeug, Jinja2, and Click are maintained together as a family, and that cohesive stewardship (rather than fragmented, independently-evolving pieces) is likely to continue being Flask's quiet strength.
- **Flask's continued role as the "small, controllable service" choice** even as FastAPI captures more new greenfield async API projects — Flask's simplicity, maturity, and enormous existing codebase footprint mean it remains a safe, well-understood choice for a large share of real-world Python web services for years to come.
- **What to bet on**: deep fluency in the application factory pattern, Blueprints, and SQLAlchemy (which pays off in Flask, Django, and standalone contexts alike) rather than any single Flask-specific feature — these fundamentals transfer broadly across the Python web ecosystem.
`,

  "cheat-sheet": `
~~~python
# ---- Minimal app ----
from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

@app.route("/greet/<name>")
def greet(name):
    return f"Hello, {name}!"

# ---- Request data ----
request.args.get("q")        # query string
request.get_json()            # JSON body
request.form.get("field")      # form-encoded body

# ---- Application factory ----
def create_app(config_object):
    app = Flask(__name__)
    app.config.from_object(config_object)
    db.init_app(app)
    from .main import main_bp
    app.register_blueprint(main_bp)
    return app

# ---- Blueprint ----
main_bp = Blueprint("main", __name__)
@main_bp.route("/")
def index(): return "Hello"

# ---- Flask-SQLAlchemy model ----
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))

# ---- Error handling ----
@app.errorhandler(404)
def not_found(e): return jsonify({"error": "not found"}), 404

# ---- Hooks ----
@app.before_request
def before(): g.start = time.monotonic()

@app.teardown_appcontext
def teardown(exc=None): db_session.remove()

# ---- Production ----
# gunicorn "app:create_app()" --workers 4 --timeout 30
# flask db upgrade
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Flask's core philosophy? | Minimal "microframework" — routing, requests, templating only; you choose the rest. |
| What does @app.route do? | Registers a URL pattern and binds it to the decorated view function. |
| What is the application factory pattern? | Wrapping app creation in create_app() for testability and multi-environment config. |
| What is a Blueprint? | A reusable, registerable group of related routes — Flask's modularity mechanism. |
| Is CSRF protection built in? | No — requires Flask-WTF's CSRFProtect added explicitly, unlike Django. |
| Are request/current_app real globals? | No — context-local proxies, correctly scoped per request even under concurrency. |
| What does teardown_appcontext guarantee? | Runs even if the request raised an exception — the right place for cleanup. |
| Is Flask's session cookie encrypted? | No — signed (tamper-evident) only; never store sensitive data in it. |
| What's Flask's default ORM? | None built in — Flask-SQLAlchemy is the standard choice. |
| How does Flask 2.0+ async differ from FastAPI? | Runs async views via a per-request event loop, not a shared async-native runtime. |
| What must never be true in production? | DEBUG=True — Flask's debugger can execute arbitrary code if exposed. |
| What serves production traffic instead of app.run()? | Gunicorn (or uWSGI), behind nginx. |
| What tool manages Flask schema migrations? | Flask-Migrate, an Alembic wrapper, analogous to Django's migrations. |
| What's Flask's answer to Django's select_related? | SQLAlchemy's joinedload/selectinload for eager loading. |
| Why did Flask take 8 years to reach 1.0? | Deliberate conservatism about API stability, not a signal of production-readiness. |
`,

  mcqs: `
1. What does Flask provide that Django does NOT ship by default in this comparison?
   A) Routing  B) Templating  C) Full freedom over ORM/auth/structure choice  D) Request handling
   **Answer: C** — Flask's minimalism means you choose these; Django ships them pre-integrated.

2. Is CSRF protection enabled by default in a plain Flask application?
   A) Yes, always on  B) No, requires Flask-WTF's CSRFProtect explicitly  C) Only for JSON APIs  D) Only in debug mode
   **Answer: B** — a key difference from Django's default-on CSRF protection.

3. What is the application factory pattern primarily useful for?
   A) Faster routing  B) Testability and multi-environment configuration  C) Automatic caching  D) Built-in admin UI
   **Answer: B** — each test/environment gets a fresh, independently configured app instance.

4. What is request in a Flask view function?
   A) A parameter passed to every view  B) A context-local proxy resolving to the current request  C) A global dictionary shared across all requests  D) A database session
   **Answer: B** — correctly isolated per request even under concurrency, despite looking like a plain global.

5. Why must Flask's DEBUG mode never be True in production?
   A) It slows down requests  B) The interactive debugger can execute arbitrary code if reachable by an attacker  C) It disables routing  D) It breaks templates
   **Answer: B** — a more severe risk than a simple information leak.

6. What does teardown_appcontext guarantee that after_request does not?
   A) Faster execution  B) It runs even if the request raised an exception  C) It runs before the view  D) It modifies the response body
   **Answer: B** — making it the correct place for cleanup that must always happen.
`,

  "revision-notes": `
Flask is a minimal, unopinionated Python web framework providing routing, request/response handling, and Jinja2 templating, and deliberately leaving the ORM, authentication scheme, and project structure to the developer's choice of extensions. Its origin as an April Fools' joke that developers took seriously is a genuine lesson in software design: a small, well-composed core built on solid existing libraries (Werkzeug, Jinja2) can outcompete a heavier framework when it matches a real gap — teams that want precise control over exactly which pieces to include, without a batteries-included framework's opinions.

The application factory pattern (wrapping app creation in a create_app() function rather than a module-level instance) and Blueprints (Flask's modularity mechanism, grouping related routes into reusable units) are the two structural practices that separate a Flask project that scales cleanly past a quick prototype from one that becomes an unmanageable single file. Nearly every well-designed Flask extension follows the same init_app(app) pattern specifically to support the application factory correctly, an emergent, ecosystem-wide convention despite Flask itself prescribing no structure.

Flask's request, current_app, session, and g "globals" are actually context-local proxies backed by Werkzeug's context stack (implemented via Python's contextvars in modern versions) — they look like plain module-level variables but resolve correctly to the CURRENT request/application context even under concurrent requests, and are only valid within an active context, a common source of confusing RuntimeErrors when accessed from a background thread or Celery task without explicitly pushing one.

Unlike Django, Flask does NOT provide CSRF protection, an ORM, or an admin interface by default — Flask-WTF's CSRFProtect, Flask-SQLAlchemy, and a hand-built admin (if needed at all) are explicit additions, meaning a Flask security review must specifically verify these were actually added rather than assuming a framework default. Flask's debug mode is a more severe production risk than most frameworks' equivalent: its interactive debugger can execute arbitrary Python code from a browser if left reachable, not just leak information.

Production Flask runs behind Gunicorn (or uWSGI), fronted by nginx, with sessions and caching backed by Redis rather than in-process memory the moment more than one worker or instance is running. Flask's 2.0+ async view support improves ergonomics for calling async libraries but runs each async view via a per-request event loop rather than a shared, always-on async runtime — for genuinely high-concurrency async workloads, FastAPI remains the more natural, purpose-built choice, and understanding this distinction is a common senior-level interview topic.
`,

  "learning-roadmap": `
**Week 1 — Flask fundamentals**: routing, the request object, Jinja2 templates, returning JSON and HTML responses. Milestone: a working multi-page application with at least one form submission handled correctly.

**Week 2 — Structure and the application factory**: refactor into the application factory pattern with Blueprints, add configuration classes per environment. Milestone: a properly structured project that passes a pytest suite using the factory pattern.

**Week 3 — Database access**: Flask-SQLAlchemy models, relationships, Flask-Migrate for schema changes, and fixing a deliberately introduced N+1 query. Milestone: a CRUD application backed by a real database with migrations tracked in version control.

**Week 4 — Authentication and security**: Flask-Login for session-based auth, Flask-WTF's CSRFProtect, and a parallel token-authenticated JSON API. Milestone: both an authenticated HTML flow and a token-authenticated API endpoint working correctly and securely.

**Week 5 — Production practices**: Gunicorn configuration, structured logging, Sentry integration, Celery for background work, Redis-backed caching/sessions. Milestone: add a background task and measure the difference caching makes under load testing.

**Week 6 — Deployment and observability**: Dockerize, deploy behind nginx, run through the full production checklist. Milestone: complete the Lab 4 hands-on project end to end.

Next platform skill once this roadmap is complete: **FastAPI** for a contrasting async-first Python API framework perspective, or **PostgreSQL**/**Redis** for depth on the storage layer this page leaves to your choice.
`,

  "official-docs": `
- **flask.palletsprojects.com** — the official Flask documentation, covering the core API, application context, and testing patterns referenced throughout this page.
- **flask-sqlalchemy.palletsprojects.com** — the official Flask-SQLAlchemy documentation for ORM integration.
- **flask-login.readthedocs.io** — the official Flask-Login documentation for session-based authentication.
- **flask-wtf.readthedocs.io** — the official Flask-WTF documentation, including CSRFProtect setup.
- **jinja.palletsprojects.com** — the official Jinja2 templating documentation, usable standalone or via Flask.
`,

  books: `
- **"Flask Web Development" (2nd ed.) — Miguel Grinberg** — the most widely recommended comprehensive Flask book, building a complete real application (a microblog) across chapters covering nearly every topic in this page.
- **"Explore Flask" — Robert Picard** — a free, well-regarded guide to Flask project structure and best practices, particularly strong on the application factory pattern and Blueprints.
- **"Flask Web Development with Python Tutorial" (various authors' companion materials)** — practical, project-based supplementary material commonly paired with Grinberg's book.
- **"Architecture Patterns with Python" — Cosmicray and Percival** — not Flask-specific, but its domain-driven design patterns apply directly to structuring a growing Flask application's business logic cleanly.
`,

  blogs: `
- **Miguel Grinberg's blog (blog.miguelgrinberg.com)** — the author of the most popular Flask book, consistently publishing deep, practical Flask (and broader Python web) content.
- **Flask's official blog/release notes (via the Pallets Projects GitHub)** — release announcements and migration guidance directly from the maintainers.
- **Real Python's Flask tutorials** — high-quality, example-driven Flask content spanning beginner to advanced topics.
- **TestDriven.io's Flask content** — strong, practical coverage of testing, deployment, and production patterns specifically for Flask.
`,

  "research-papers": `
Flask, as an application framework rather than a research subject, has essentially no dedicated academic literature — the most relevant foundational reading is the same web-architecture material referenced across web frameworks generally:

- **Fielding, R. — "Architectural Styles and the Design of Network-based Software Architectures"** (2000) — the foundational REST dissertation underlying API design principles relevant to any Flask JSON API; see the **REST** skill.
- For the WSGI specification Flask (via Werkzeug) implements, **PEP 3333** (Python's WSGI specification) is the closest thing to a primary source document, defining the exact interface between Python web servers and applications that Flask sits on top of.
- For the ORM design tradeoffs underlying SQLAlchemy (which Flask-SQLAlchemy wraps), see the general "object-relational impedance mismatch" literature referenced in the **Django** skill's Research Papers section — the same tradeoffs apply regardless of which Python framework sits on top of SQLAlchemy.
`,

  videos: `
- **Miguel Grinberg's "Flask Mega-Tutorial" video series** — a long-form, deeply practical walkthrough building a complete application, matching his widely used written tutorial and book.
- **Corey Schafer's Flask tutorial series (YouTube)** — clear, project-based coverage of Flask fundamentals through deployment.
- **PyCon and Flask-specific conference talks** (freely available on YouTube) — periodic deep dives from Flask core contributors and large-scale production users.
- **Pretty Printed's Flask series** — practical, focused tutorials on specific Flask extensions and patterns.
`,

  "github-repos": `
- **pallets/flask** — the framework's own source, small enough to read end to end and genuinely understand.
- **pallets/jinja** — the Jinja2 templating engine's source, usable standalone outside Flask.
- **pallets-eco/flask-sqlalchemy** — the official Flask-SQLAlchemy extension source and documentation.
- **maxcountryman/flask-login** — the standard session-based authentication extension referenced throughout this page.
- **wtforms/flask-wtf** — the CSRF protection and form-handling extension referenced in the Security section.
- **miguelgrinberg/microblog** — the companion repository to the widely used Flask Mega-Tutorial, an excellent real, complete example application to read.
- **pallets-eco/flask-migrate** — the Alembic-based migrations extension referenced in Production Usage and Deployment.
- **pallets/click** — the CLI framework Flask integrates for custom management commands.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Routing and templates**: build a small multi-page site with at least one dynamic route and one Jinja2 template inheriting from a shared base layout.
2. **Application structure**: refactor a single-file Flask app into the application factory pattern with at least two Blueprints.
3. **Database access**: model a small blog (posts, comments, tags) with Flask-SQLAlchemy, deliberately introduce an N+1 query, then fix it with joinedload.
4. **Authentication**: add Flask-Login with both a registration/login flow and a protected API endpoint using a separate token-based scheme.
5. **Testing**: write a full pytest suite for the blog above using the application factory + test client pattern, covering both success and error-response cases.
6. **External practice sets**: Miguel Grinberg's Flask Mega-Tutorial for structured, guided practice building a complete application; TestDriven.io's Flask courses for testing and deployment-focused exercises.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Browser / API client"] -->|HTTPS| Nginx["nginx\n(TLS termination, static files)"]
    Nginx -->|proxy| Gunicorn["Gunicorn\n(WSGI workers)"]
    Gunicorn --> Werkzeug["Werkzeug routing"]
    Werkzeug --> Hooks["before_request hooks"]
    Hooks --> Views["View functions / Blueprints"]
    Views --> ORM["Flask-SQLAlchemy"]
    ORM --> DB[("Chosen database")]
    Views --> Cache[("Redis\ncache + sessions")]
    Views -->|enqueue| Queue["Celery/RQ workers\n(background tasks)"]
    Queue --> DB
    subgraph Observability
        Sentry["Sentry\n(errors + APM)"]
        Logs["Structured logs"]
        Metrics["Prometheus metrics"]
    end
    Views -.-> Sentry
    Views -.-> Logs
    Views -.-> Metrics
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Flask))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core API
      Routing and views
      Request and response objects
      Jinja2 templates
      Context locals
    Structure
      Application factory
      Blueprints
      Configuration classes
      Extension init_app pattern
    Data and Auth
      Flask-SQLAlchemy
      Flask-Migrate
      Flask-Login
      Flask-WTF and CSRF
    Production
      Gunicorn and nginx
      Celery and Redis
      Monitoring Sentry
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default flask;
