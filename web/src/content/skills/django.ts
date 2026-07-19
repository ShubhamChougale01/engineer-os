import type { SkillContent } from "../types";

/**
 * Django — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const django: SkillContent = {
  overview: `
Django is a high-level, batteries-included Python web framework built around one core promise: get a secure, production-capable web application running fast, without stitching together a dozen separate libraries yourself. Created at a newspaper (Lawrence Journal-World) where reporters needed features shipped in days, Django's "batteries included" philosophy means an ORM, an admin interface, authentication, form handling, templating, caching, and a migrations system all ship in the box, pre-integrated and opinionated about how they fit together.

For an AI engineer, Django shows up as the backend of choice whenever a project needs a real, secured, multi-user web application FAST — an internal tool for reviewing model outputs, a dataset-labeling platform, a customer-facing dashboard around an AI feature, or an admin panel for managing prompts and feature flags. Django's built-in admin (a full CRUD interface auto-generated from your data models) is frequently the fastest way in any language to get a working internal tool in front of non-engineers on day one — a capability few other frameworks, in any language, replicate out of the box.

Key characteristics: the Model-View-Template (MVT) architecture, a genuinely excellent ORM with a migrations system that manages schema evolution safely, class-based and function-based views, a mature and heavily audited security posture (CSRF protection, SQL-injection-safe queries, and XSS-escaping templates all on by default), and a philosophy of "convention over configuration" that trades some flexibility for a well-trodden, well-documented path from a blank project to a deployed application.
`,

  history: `
Django was created by **Adrian Holovaty** and **Simon Willison** at the Lawrence Journal-World newspaper in Lawrence, Kansas, where the team needed to build and ship database-driven news sites on tight newsroom deadlines — the framework's speed-of-development focus traces directly to that origin.

| Year | Milestone |
|------|-----------|
| 2003 | Development begins internally at World Online (the newspaper's web division) |
| 2005 | Django is **open-sourced**, named after jazz guitarist Django Reinhardt |
| 2006 | The Django Software Foundation begins forming to steward the project independently of any single company |
| 2008 | Django 1.0 — the first stable release with a real backward-compatibility promise |
| 2012 | Django Software Foundation formally established |
| 2015 | Django 1.8 — multiple template engine support, a significant ORM/ query refactor |
| 2017 | Django 1.11 — the last release supporting Python 2; the ecosystem's Python 3 migration completes around this release |
| 2019 | Django 2.2 (LTS) and Django 3.0 — async view support begins landing |
| 2020 | Django 3.1 — full async views, middleware, and tests supported |
| 2022 | Django 4.1/4.2 — further async ORM support, redis cache backend built in |
| 2023–2024 | Django 5.0/5.1 — facet filters in admin, simplified form field rendering, continued async ORM maturation |
| 2025+ | Continued incremental LTS releases (Django follows a predictable ~8-month release cadence with periodic LTS versions) |

Django's steady, conservative release cadence and long-term-support (LTS) versions are a deliberate contrast to more rapidly-churning frameworks — large institutions (universities, newspapers, government) picked Django specifically because of this stability promise, and that user base has kept the project's backward-compatibility discipline strong for two decades.
`,

  "why-it-exists": `
Django exists because of a very specific, very common problem newsroom and startup developers faced in the early 2000s: **every web application needs the same dozen things (a database layer, an admin interface, user authentication, form validation, URL routing) but each project was reinventing them from scratch**, badly, and often insecurely.

The prior landscape offered two unsatisfying paths:

1. **Roll your own** on top of a bare framework or no framework at all — fast to start, but every project reimplemented (and re-broke) authentication, SQL escaping, CSRF protection, and admin tooling independently, with wildly inconsistent security quality.
2. **Heavyweight enterprise frameworks** (in Java, for example) — genuinely complete, but with enormous ceremony and configuration overhead that made "ship a feature by Friday" newsroom deadlines unrealistic.

Django's insight was that a framework could be BOTH fast to start with AND secure and complete by default, if the framework's authors made the hard architectural decisions once (how models map to database tables, how requests route to views, how templates escape output) and shipped all of it pre-integrated. The auto-generated admin interface in particular solved a problem almost every real application has — "someone non-technical needs to edit this data" — that most frameworks left entirely to the application developer to build from scratch, every single time.
`,

  "problem-it-solves": `
Django solves the **"stop reinventing the same web-application plumbing, badly, every project"** problem for Python web development.

Concretely, Django removes:

- **Insecure-by-default data access**: the ORM parameterizes every query automatically, making SQL injection via the ORM layer structurally difficult rather than a matter of developer discipline (see the **SQL Injection** skill).
- **Manual CSRF and XSS protection**: CSRF tokens are required on state-changing forms by default, and the template engine auto-escapes output — both security-critical defaults many frameworks leave opt-in.
- **Reimplementing authentication from scratch**: a full user model, password hashing, session management, and permission system ship in the box.
- **Building an admin UI from scratch**: django.contrib.admin auto-generates a working CRUD interface from your models — often the single fastest way to get a usable internal tool live, in any language.
- **Manual, error-prone schema migrations**: Django's migrations framework tracks model changes and generates safe, reversible database migration files automatically.

What Django deliberately does **not** solve: it is not the fastest possible option for a tiny JSON API (its full MVT stack, ORM, and middleware carry real overhead versus a minimal framework like Flask or FastAPI for that narrow use case), it is not async-native from the ground up the way FastAPI is (async support was retrofitted onto a synchronous core starting in Django 3.0), and it deliberately does not solve for microservices with dozens of tiny independent services — Django's architecture assumes a reasonably substantial, cohesive application, not a swarm of nano-services.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Django's Model-View-Template (MVT) architecture and trace a request through URL routing, a view, the ORM, and template rendering.
2. Design Django models with appropriate fields, relationships (ForeignKey, ManyToMany), and Meta options, and generate/apply migrations correctly.
3. Write both function-based and class-based views, and know when each is the better tool.
4. Use Django's ORM effectively: querysets, select_related/prefetch_related for the N+1 problem, aggregation, and raw SQL as an escape hatch.
5. Configure Django's authentication, permissions, and admin interface for a real application.
6. Build and secure a REST API layer using Django REST Framework, including serializers and viewsets.
7. Apply Django's built-in security features correctly (CSRF, XSS escaping, clickjacking protection) and know their limits.
8. Test Django applications with its built-in test client and pytest-django, and structure settings for multiple environments.
9. Deploy a Django application in production behind Gunicorn/uWSGI and a reverse proxy, with static/media files handled correctly.
10. Answer senior-level interview questions on the ORM's query generation, migrations, middleware ordering, and Django's request/response cycle internals.
`,

  prerequisites: `
- **Required**: solid **Python** fundamentals — functions, classes, decorators, list comprehensions; Django is Python through and through, and this page assumes that comfort level (see the **Python** skill).
- **Required**: basic **SQL** and relational database concepts (tables, foreign keys, joins) — the ORM abstracts SQL but you must understand what it's abstracting to use it well or debug it when it misbehaves.
- **Helpful**: exposure to the **REST** architectural style if you plan to build APIs with Django REST Framework.
- **Helpful**: basic HTML/CSS if you'll use Django's template engine for server-rendered pages rather than a pure API backend.

Dependency links: **Python** → this page → **PostgreSQL** (Django's most common and best-supported production database) → **Docker**/**CI-CD** for deployment → **Django REST Framework** patterns feed directly into general **REST** API design practice.
`,

  "beginner-concepts": `
### Project and app structure

~~~bash
django-admin startproject myproject
cd myproject
python manage.py startapp blog
~~~

A Django **project** is the overall configuration container (settings, root URL config); an **app** is a self-contained, reusable unit of functionality (models, views, templates for one feature area). A project typically contains several apps — this separation is Django's answer to "how do I keep a growing codebase organized."

### Models — Python classes that become database tables

~~~python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    published_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    def __str__(self):
        return self.title
~~~

Each model field maps to a database column with an appropriate type and constraints; ForeignKey models a one-to-many relationship (many Posts, one User), and on_delete=models.CASCADE tells Django what to do to Posts when their author is deleted — deleting them too, in this case.

### Migrations — versioned, generated schema changes

~~~bash
python manage.py makemigrations   # generates a migration file describing the model change
python manage.py migrate          # applies pending migrations to the actual database
~~~

Migrations are Django's answer to "how do I evolve my database schema safely as models change over time, across every developer's machine and every environment" — each migration file is a small, reviewable Python file, checked into version control alongside the model change it corresponds to.

### Views — the logic that handles a request

~~~python
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from .models import Post

def post_list(request):
    posts = Post.objects.all().order_by("-published_at")
    return render(request, "blog/post_list.html", {"posts": posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, "blog/post_detail.html", {"post": post})
~~~

A view is a Python function (or, as shown later, a class) that takes an HttpRequest and returns an HttpResponse — render() is a shortcut that loads a template, fills it with the given context dictionary, and returns the rendered HTML as a response.

### URL routing

~~~python
# blog/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.post_list, name="post_list"),
    path("<int:pk>/", views.post_detail, name="post_detail"),
]
~~~

URL patterns map a path (with typed captured segments like <int:pk>) to the view function that should handle it — Django resolves the incoming request's path against these patterns, top to bottom, using the first match.

### Templates — Django's templating language

~~~html
{% for post in posts %}
  <h2><a href="{% url 'post_detail' post.pk %}">{{ post.title }}</a></h2>
  <p>{{ post.body|truncatewords:30 }}</p>
{% endfor %}
~~~

Django's template language auto-escapes all variable output by default — {{ post.title }} is HTML-escaped automatically, closing off the most common XSS injection vector without the developer having to remember to do it.

Common beginner trap: querying inside a loop (the "N plus one" query problem) — covered fully in Intermediate Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### The ORM and the N+1 query problem

~~~python
# BAD: one query for all posts, then one MORE query per post to fetch its author — N+1 queries
posts = Post.objects.all()
for post in posts:
    print(post.author.username)   # each access hits the database again

# GOOD: select_related does a SQL JOIN upfront — exactly one query total
posts = Post.objects.select_related("author").all()
for post in posts:
    print(post.author.username)   # no additional query — author was already fetched
~~~

select_related follows ForeignKey/OneToOne relationships via a SQL JOIN in the original query; prefetch_related does the equivalent for ManyToMany and reverse ForeignKey relationships via a separate, batched query — both exist specifically to eliminate the N+1 pattern, one of the most common and most damaging Django performance bugs in real applications.

### Class-based views (CBVs)

~~~python
from django.views.generic import ListView, DetailView

class PostListView(ListView):
    model = Post
    template_name = "blog/post_list.html"
    context_object_name = "posts"
    ordering = ["-published_at"]

class PostDetailView(DetailView):
    model = Post
    template_name = "blog/post_detail.html"
~~~

Class-based generic views (ListView, DetailView, CreateView, UpdateView, DeleteView) encapsulate common CRUD patterns so you write a few class attributes instead of a full function body — a real productivity win for boilerplate-heavy CRUD, at the cost of "where does this behavior actually live" being less obvious than a plain function until you're familiar with the class hierarchy Django built.

### Forms and validation

~~~python
from django import forms

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["title", "body"]

    def clean_title(self):
        title = self.cleaned_data["title"]
        if len(title) < 5:
            raise forms.ValidationError("Title must be at least 5 characters.")
        return title
~~~

ModelForm generates form fields directly from a model's fields, including matching validation (max_length, required-ness); custom clean_<fieldname> methods add field-specific validation logic beyond what the model alone expresses.

### The admin interface

~~~python
# blog/admin.py
from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "published_at"]
    list_filter = ["author"]
    search_fields = ["title", "body"]
~~~

Registering a model with a few list_display/list_filter/search_fields attributes gets you a fully working, searchable, filterable CRUD admin page — often the fastest path in ANY web framework, in any language, to a usable internal tool for non-engineers to manage data.

### Middleware

~~~python
# settings.py
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]
~~~

Middleware are functions that wrap every request/response, executed in the order listed for the request path and in REVERSE order for the response path — this ordering matters: SessionMiddleware must run before AuthenticationMiddleware because auth depends on the session being available.

### Django REST Framework basics

~~~python
from rest_framework import serializers, viewsets

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "body", "published_at", "author"]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
~~~

Django REST Framework (DRF), the de facto standard for building APIs on Django, layers serializers (converting models to/from JSON, with validation) and viewsets (generic CRUD endpoint logic) on top of Django's ORM and views — see the **REST** skill for the general architectural style DRF implements.
`,

  "advanced-concepts": `
### QuerySet laziness and evaluation

~~~python
qs = Post.objects.filter(author__username="ada")   # NO query has run yet — QuerySets are lazy
qs = qs.exclude(title__startswith="Draft")           # still no query — building up the SQL
posts = list(qs)                                      # THIS triggers the actual database query
~~~

QuerySets are lazy and chainable — each filter/exclude/order_by call returns a new QuerySet describing more of the eventual SQL query, and no database hit occurs until the QuerySet is actually evaluated (iterated, sliced, cast to list, or passed to len()). Understanding this is essential for both correctness (accidentally evaluating a QuerySet multiple times re-runs the query) and performance (chain filters freely without worrying about intermediate query cost).

### Custom managers and querysets

~~~python
class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status="published")

class Post(models.Model):
    status = models.CharField(max_length=20, default="draft")
    objects = models.Manager()          # the default manager
    published = PublishedManager()       # a custom manager, e.g. Post.published.all()
~~~

Custom managers encapsulate common query logic (like "only published posts") as reusable, named entry points, keeping repeated filter logic out of every view that needs it.

### Signals

~~~python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Post)
def notify_subscribers(sender, instance, created, **kwargs):
    if created:
        send_notification_email(instance)
~~~

Signals let decoupled code react to model events (post_save, pre_delete, etc.) without the model itself knowing about the reacting code — powerful for decoupling, but a well-known source of "where is this side effect actually happening" debugging pain in large codebases; use sparingly and document heavily.

### Transactions and atomicity

~~~python
from django.db import transaction

@transaction.atomic
def transfer_funds(from_account, to_account, amount):
    from_account.balance -= amount
    from_account.save()
    to_account.balance += amount
    to_account.save()
    # if ANY exception occurs before this function returns, BOTH saves roll back together
~~~

transaction.atomic wraps a block in a single database transaction — either every write inside succeeds, or none of them are committed, essential for multi-step operations (like a funds transfer) that must never leave the database in a half-updated state.

### Custom middleware

~~~python
class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        response["X-Response-Time"] = f"{time.monotonic() - start:.3f}"
        return response
~~~

Custom middleware follows this same shape: a callable class wrapping get_response, doing work before calling it (on the way in) and after (on the way out) — the exact mechanism Django's own built-in middleware (session, auth, CSRF) is built from.

### Async views (Django 3.1+)

~~~python
import asyncio
from django.http import JsonResponse

async def async_view(request):
    await asyncio.sleep(1)   # simulates an awaited I/O operation
    return JsonResponse({"status": "done"})
~~~

Django supports async def views, middleware, and (increasingly, since 4.1+) async ORM methods (acreate, aget, etc.), but the framework's core request-handling machinery was originally synchronous — mixing sync and async code incorrectly (calling a sync-only ORM method inside an async view without sync_to_async) is a common source of confusing runtime errors; verify what's genuinely async-safe in your Django version before assuming full end-to-end async support.

### select_for_update and race conditions

~~~python
from django.db import transaction

with transaction.atomic():
    account = Account.objects.select_for_update().get(pk=account_id)
    account.balance -= amount
    account.save()
~~~

select_for_update() acquires a row-level database lock for the duration of the transaction, preventing two concurrent requests from both reading the same stale balance and both writing an incorrect result — essential for correctness under real concurrent load, and a classic senior-interview topic.
`,

  "internal-working": `
What actually happens inside Django from an incoming HTTP request to the returned response:

~~~mermaid
flowchart LR
    A["WSGI/ASGI server\n(Gunicorn/Daphne)"] --> B["Middleware chain\n(request phase, top to bottom)"]
    B --> C["URL resolver\nmatches path to a view"]
    C --> D["View function/class\nruns business logic"]
    D --> E["ORM queries\n(if any) hit the database"]
    D --> F["Template rendering\n(if an HTML response)"]
    F --> G["Middleware chain\n(response phase, bottom to top)"]
    E --> G
    G --> A
~~~

1. **WSGI/ASGI entrypoint**: the application server (Gunicorn for sync, Daphne/Uvicorn for async) receives the raw HTTP request and hands it to Django's request-handling machinery.
2. **Middleware (request phase)**: each configured middleware's __call__ runs in the order listed in MIDDLEWARE, potentially short-circuiting (returning a response early, e.g. for an auth failure) before the view is ever reached.
3. **URL resolution**: Django's URL resolver walks the configured urlpatterns, matching the request path against each pattern in order, and extracts any captured path parameters.
4. **View execution**: the matched view function or class-based view's dispatch() method runs, typically querying the ORM and/or rendering a template.
5. **ORM query execution**: QuerySets are evaluated lazily, generating and executing SQL against the configured database only when actually needed.
6. **Response construction and middleware (response phase)**: the view's returned HttpResponse passes back UP through the same middleware stack in REVERSE order, letting each middleware modify headers or the body (adding security headers, compressing content, etc.) before it reaches the client.

**Why migrations are two steps (makemigrations then migrate)**: separating "detect model changes and generate a migration file" from "apply that file to the database" lets migrations be reviewed in code review like any other code change, and lets the same migration file be applied consistently across every developer's machine, CI, staging, and production — a deliberate design choice to make schema evolution as safe and reviewable as application code itself.
`,

  architecture: `
A senior engineer thinks about Django at two levels: **MVT architecture** (how a request's responsibilities are divided) and **project layout** (how a real, multi-app Django codebase is organized).

### MVT (Model-View-Template) architecture

~~~mermaid
flowchart TB
    URL["urls.py\n(routes a path to a view)"] --> View["View\n(business logic, orchestrates)"]
    View --> Model["Model / ORM\n(data access, validation)"]
    View --> Template["Template\n(presentation, HTML rendering)"]
    Model --> DB[("Database")]
~~~

Django's MVT is a variant of MVC: the "Model" and "Template" map directly to a traditional MVC's Model and View, while Django's "View" is closer to MVC's Controller — the naming is a common source of confusion for engineers coming from other MVC frameworks, but the separation of concerns is functionally the same.

### Project layout (production Django)

~~~
myproject/
├── manage.py
├── myproject/                # the project package: settings, root URLs
│   ├── settings/
│   │   ├── base.py            # shared settings
│   │   ├── development.py     # DEBUG=True, local DB
│   │   └── production.py      # DEBUG=False, real DB, security headers
│   ├── urls.py                 # root URL config, includes each app's urls
│   └── wsgi.py / asgi.py
├── apps/
│   ├── blog/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py       # if using DRF
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── migrations/
│   │   └── tests/
│   └── accounts/
├── static/
├── templates/
└── requirements/
    ├── base.txt
    ├── development.txt
    └── production.txt
~~~

Rules mature Django teams follow: split settings by environment (never one settings.py branching on environment variables scattered throughout), keep each app focused on one feature area with its own models/views/tests, and prefer "fat models, thin views" — business logic belongs on model methods or a dedicated services module, not sprawling across view functions.
`,

  "data-flow": `
Tracing one HTTP request end to end — a browser requesting a blog post's detail page:

~~~mermaid
sequenceDiagram
    participant Browser
    participant WSGI as Gunicorn (WSGI server)
    participant MW as Middleware chain
    participant URLs as URL resolver
    participant View
    participant ORM
    participant DB as PostgreSQL
    participant Template

    Browser->>WSGI: GET /blog/42/
    WSGI->>MW: HttpRequest
    MW->>MW: SecurityMiddleware, SessionMiddleware,\nAuthenticationMiddleware run in order
    MW->>URLs: resolve path
    URLs->>View: post_detail(request, pk=42)
    View->>ORM: Post.objects.select_related('author').get(pk=42)
    ORM->>DB: SELECT ... JOIN ... WHERE id = 42
    DB-->>ORM: row data
    ORM-->>View: Post instance
    View->>Template: render('post_detail.html', {'post': post})
    Template-->>View: rendered HTML string
    View-->>MW: HttpResponse
    MW->>MW: response middleware runs in REVERSE order
    MW-->>Browser: 200 OK + HTML
~~~

The most misunderstood part for newcomers: **middleware order matters differently for the request phase versus the response phase**. Middleware listed first in MIDDLEWARE runs FIRST on the way in (request) but LAST on the way out (response) — it wraps everything after it, like nested parentheses. This is why SessionMiddleware (which must set up request.session before AuthenticationMiddleware can use it) is listed before AuthenticationMiddleware, and why a middleware adding a security header at the end of the list still ends up as one of the LAST things applied to the outgoing response.
`,

  "production-usage": `
### Settings and environment configuration

~~~python
# settings/production.py
import os

DEBUG = False
ALLOWED_HOSTS = os.environ["ALLOWED_HOSTS"].split(",")
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "CONN_MAX_AGE": 60,   # persistent connections, avoid reconnect overhead per request
    }
}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
~~~

Non-negotiables for production:

1. **DEBUG = False always** — a DEBUG=True Django app leaks full stack traces, settings, and SQL queries to anyone who triggers an error; this is one of the single most common, most severe Django misconfigurations in the wild.
2. **SECRET_KEY from environment, never hardcoded** — used for session signing, password reset tokens, and CSRF; a leaked SECRET_KEY compromises all of these.
3. **ALLOWED_HOSTS set explicitly** — an empty or wildcard ALLOWED_HOSTS with DEBUG=False is rejected by Django itself as unsafe.
4. **A real database (PostgreSQL)**, not SQLite, for anything beyond local development — SQLite does not handle concurrent writes at production scale.

### WSGI/ASGI serving

~~~bash
gunicorn myproject.wsgi:application --workers 4 --bind 0.0.0.0:8000
# or, for async support:
uvicorn myproject.asgi:application --workers 4
~~~

Django's development server (manage.py runserver) is explicitly NOT for production — it's single-threaded, unoptimized, and has no process management; Gunicorn (WSGI, sync) or Daphne/Uvicorn (ASGI, async) sit in front of the application in production, typically behind nginx handling static files and TLS termination.

### Static and media files

collectstatic gathers all app static assets into one directory served by nginx or a CDN in production (Django itself should not serve static files in production); media files (user uploads) are typically stored in S3 or equivalent object storage rather than local disk, which doesn't survive container restarts or scale across multiple app servers.
`,

  "industry-examples": `
- **Instagram**: one of the largest and most cited Django deployments in the world — Instagram's engineering blog has published extensively on scaling Django (and Python generally) to hundreds of millions of users, including their migration to Python 3 and their use of a heavily customized Django/Postgres stack.
- **Disqus**: the widely used comment-hosting platform built its core service on Django, an early and influential proof that Django could handle very high read/write volumes.
- **Mozilla**: multiple Mozilla properties (including parts of the addons.mozilla.org ecosystem) run on Django, valued for its security defaults given Mozilla's security-conscious engineering culture.
- **Pinterest** (early years): started on Django before evolving its architecture at massive scale, a common pattern of "start on Django for speed, later split out performance-critical services."
- **The Washington Post**: Django's newsroom origins (Lawrence Journal-World) continue in spirit — multiple news organizations use Django specifically for its rapid-development, secure-by-default profile matching editorial deadlines.
- **Eventbrite**: uses Django as a core part of its ticketing platform's backend, citing the ORM and admin's productivity wins for a large, data-model-heavy application.
- **NASA and various government/research institutions**: Django's stability, security track record, and long-term-support releases make it a common choice for institutions with long software lifecycles and strict security review requirements.

Pattern to notice: Django adoption clusters around **content-heavy, data-model-heavy applications where development speed and security defaults matter more than shaving the last millisecond of per-request latency** — exactly the profile of most internal AI tooling, admin dashboards, and content platforms.
`,

  "best-practices": `
1. **Fat models, thin views** — business logic belongs on model methods or a dedicated services layer, not sprawling across view functions; this keeps logic testable and reusable across views, management commands, and background tasks.
2. **Always use select_related/prefetch_related when iterating related objects** — the single highest-leverage Django performance practice, preventing the N+1 query problem before it happens.
3. **Never commit DEBUG=True or a hardcoded SECRET_KEY** — load both from environment-specific settings and environment variables respectively.
4. **Use Django's built-in User model or a custom user model set up from the START of a project** — swapping the user model mid-project is a genuinely painful migration; decide upfront even if you don't need custom fields yet.
5. **Write tests using Django's TestCase (which wraps each test in a rolled-back transaction)** rather than hitting a real, persisted test database per test — dramatically faster and cleaner test isolation.
6. **Keep migrations small and one-purpose-per-migration** where practical — easier to review, easier to roll back a single specific change.
7. **Use django-environ or python-decouple (or plain os.environ) for configuration**, never scatter environment-branching logic through a single settings.py.
8. **Version your API separately from your Django app's internal models** if using DRF — serializers, not raw models, should be the API's stable public contract.
9. **Run makemigrations and check the generated file before committing** — auto-generated migrations occasionally need manual adjustment (e.g., data migrations alongside schema migrations).
10. **Use transaction.atomic for any multi-step write that must succeed or fail as a unit** — don't assume Django auto-wraps every view in a transaction (it doesn't, by default, outside ATOMIC_REQUESTS).
11. **Cache expensive, rarely-changing querysets** (with Redis or Django's cache framework) rather than re-querying on every request — see the **Redis** and **Caching (Systems)** skills.
12. **Run manage.py check --deploy before shipping** — Django's own deployment checklist command catches many of the common production misconfigurations listed above automatically.
`,

  "anti-patterns": `
### The N+1 query problem in a template

~~~python
# WRONG — one query for posts, then one query PER POST for its author, inside the template loop
def post_list(request):
    posts = Post.objects.all()
    return render(request, "blog/post_list.html", {"posts": posts})
# template does {{ post.author.username }} for each post — N additional queries

# RIGHT — eager-load the relationship in one JOIN
def post_list(request):
    posts = Post.objects.select_related("author").all()
    return render(request, "blog/post_list.html", {"posts": posts})
~~~

This is the single most common Django performance bug in real applications — invisible in local development with a handful of test rows, and a severe production slowdown at real data volumes; use Django Debug Toolbar in development specifically to catch it before it ships.

### Other production-grade anti-patterns

- **Business logic crammed into views**: views become impossible to reuse (from a management command, a Celery task, a different view) or test in isolation — push logic onto models or a services layer instead.
- **Using .objects.all() and filtering in Python** instead of filtering in the QuerySet: pulls far more data out of the database than needed and does the filtering work in the application process instead of letting the database (which is built for this) do it.
- **Not using get_object_or_404 and instead manually try/except-ing DoesNotExist everywhere** — more verbose and easy to forget the 404 conversion in one spot.
- **Storing secrets or environment-specific values directly in settings.py** rather than reading them from environment variables.
- **Mutable default arguments in model methods or forms** — the same general Python footgun (see the **Python** skill), equally dangerous here.
- **Ignoring makemigrations output and blindly committing whatever was generated** — occasionally Django's auto-detected migration is technically correct but operationally dangerous (e.g., adding a NOT NULL column to a huge table without a default, causing a long table lock) — review generated migrations against your actual table sizes.
- **Using signals for logic that's really just "the next line of this function"** — makes control flow implicit and hard to trace; reserve signals for genuine cross-cutting, decoupled concerns.
`,

  performance: `
### Rule zero: measure first

~~~bash
pip install django-debug-toolbar   # shows query counts, timing, and template rendering cost per request
~~~

Django Debug Toolbar in development immediately surfaces N+1 queries and slow templates that are invisible without instrumentation — install it early, not after a production slowdown.

### The performance hierarchy (apply in order)

1. **Fix N+1 queries first** — select_related/prefetch_related almost always yields the single biggest, cheapest win in a Django application; check the query count on every page before optimizing anything else.
2. **Add database indexes on frequently filtered/ordered fields** — Meta.indexes or db_index=True on a field; verify with EXPLAIN that the database is actually using the index you added.
3. **Cache expensive, infrequently-changing data** — Django's cache framework (backed by Redis or Memcached) for querysets, rendered template fragments, or whole views (cache_page decorator) that don't need to be computed fresh every request.
4. **Use .only()/.defer() to limit fetched columns** when a queryset only needs a few fields from a wide table.
5. **Paginate everything that lists more than a page's worth of data** — never return an unbounded queryset to a template or API response.
6. **Move genuinely slow work to a background task queue** (Celery, Django-Q) — anything that takes more than roughly 100-200ms shouldn't block a request-response cycle.
7. **Profile with django-silk or py-spy** for CPU-bound view logic once query and caching optimizations are exhausted.

### Micro-level facts worth knowing

- QuerySets cache their results after first evaluation within the same QuerySet object — re-iterating the SAME queryset variable doesn't re-query, but creating a new QuerySet (even with identical filters) does.
- bulk_create() and bulk_update() issue one query for many objects instead of one query per object — essential for any loop that creates/updates many rows.
- iterator() on a QuerySet avoids loading the entire result set into memory at once, important for processing very large tables.
`,

  scalability: `
Django scales the same way most web frameworks do — **horizontally**, behind a load balancer, with the database typically becoming the bottleneck before the application tier does.

### Single-region architecture

~~~mermaid
flowchart LR
    LB["Load balancer"] --> W1["Gunicorn worker pool\n(Django app 1)"]
    LB --> W2["Gunicorn worker pool\n(Django app N)"]
    W1 & W2 --> Cache[("Redis\ncache + sessions")]
    W1 & W2 --> DB[("PostgreSQL\nprimary")]
    DB --> Replica[("Read replica(s)")]
    W1 & W2 --> Celery["Celery workers\n(background tasks)"]
~~~

Django application servers are stateless (sessions live in the database or Redis, not in-process) so scaling horizontally is straightforward — add more Gunicorn/app instances behind the load balancer. The database is the more common ceiling: read replicas (routed via Django's database router) handle read-heavy load, and Celery offloads slow, non-request-blocking work (emails, report generation, ML inference calls) to separate worker processes.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| N+1 queries at scale | select_related/prefetch_related; this is nearly always the first fix, not infrastructure |
| Database write contention | Read replicas for reads, careful indexing, occasionally sharding for the largest deployments (Instagram's well-documented path) |
| Slow synchronous requests blocking workers | Move the slow part to Celery; a request should return quickly even if the underlying work takes longer |
| Session/cache store becoming a bottleneck | Redis with appropriate eviction and persistence settings; see the **Redis** skill |
| Admin interface slow on huge tables | Add list_select_related, limit list_display fields, add database indexes on filtered/sorted admin fields |
`,

  security: `
### What Django already protects by default

Django's security defaults are a major reason institutions with strict compliance requirements choose it:

1. **SQL injection**: the ORM parameterizes all query values automatically — writing raw SQL yourself (via .raw() or cursor.execute()) reintroduces the risk if you concatenate untrusted input into the query string (see the **SQL Injection** skill).
2. **XSS**: the template engine auto-escapes all variable output by default; only the explicit {{ value|safe }} filter or mark_safe() opts out — a deliberate "safe by default, unsafe requires an explicit decision" design (see the **XSS** skill).
3. **CSRF**: the CsrfViewMiddleware requires a valid CSRF token on state-changing (POST/PUT/DELETE) requests by default; Django's forms and templates generate this token automatically (see the **CSRF** skill).
4. **Clickjacking**: XFrameOptionsMiddleware sends X-Frame-Options: DENY by default, preventing the site from being embedded in a malicious iframe.
5. **Password storage**: Django hashes passwords with PBKDF2 (or configurable Argon2/bcrypt) by default — never store or compare plaintext passwords (see the **Hashing** skill).

### What Django does NOT automatically prevent

- **Business-logic authorization bugs**: Django's permission system checks WHETHER a user has a permission, not whether the specific object they're accessing is one they should see — object-level authorization (a user editing only their own posts) requires explicit checks in your views or object-level permission libraries (django-guardian).
- **Insecure direct object references**: fetching an object by an ID from the URL without verifying the requesting user is entitled to it is a Django-agnostic bug the framework doesn't prevent for you.
- **Debug-mode information leakage**: DEBUG=True in production is entirely the developer's responsibility to avoid — Django will happily leak stack traces, settings values, and SQL if left on.
- **Third-party package vulnerabilities**: Django's own core is heavily audited, but the vast package ecosystem (pip-installed dependencies) carries the same supply-chain risk as any language's package ecosystem.

### Production security checklist essentials

Run python manage.py check --deploy before every production deployment — it flags SECURE_SSL_REDIRECT, SESSION_COOKIE_SECURE, DEBUG, and several other settings automatically. See the **OWASP Top 10** and **Secrets Management** skills for depth beyond Django specifics.
`,

  testing: `
Django ships a built-in test framework (an extension of Python's unittest) with a test client for simulating requests without a real server.

~~~python
from django.test import TestCase
from django.urls import reverse
from .models import Post

class PostViewTests(TestCase):
    def setUp(self):
        self.post = Post.objects.create(title="Hello Django", body="content")

    def test_post_list_shows_title(self):
        response = self.client.get(reverse("post_list"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Hello Django")

    def test_post_detail_404_for_missing_post(self):
        response = self.client.get(reverse("post_detail", args=[9999]))
        self.assertEqual(response.status_code, 404)
~~~

TestCase wraps each test method in a database transaction that's rolled back afterward — tests run fast and don't leak state between each other, without needing to manually clean up created rows.

### pytest-django

~~~python
import pytest
from myapp.models import Post

@pytest.mark.django_db
def test_post_str_representation():
    post = Post.objects.create(title="Test")
    assert str(post) == "Test"
~~~

pytest-django is the widely preferred alternative to Django's built-in unittest-style runner for teams already using pytest elsewhere — the @pytest.mark.django_db marker opts a test into database access, keeping non-DB tests fast by default.

### The senior testing doctrine

- Test views through the test client (integration-style) for request/response behavior; test model methods and business logic directly (unit-style) for fast, focused coverage.
- Use factory_boy or model_bakery to generate test data instead of hand-writing verbose object-creation boilerplate in every test.
- Mock external services (third-party APIs, email sending) — never let tests make real network calls.
- Run the full suite in CI on every PR, including a migrations check (manage.py makemigrations --check) to catch forgotten migration files.
`,

  debugging: `
### The toolbox, in escalation order

1. **Django Debug Toolbar** (development only) — shows SQL queries executed, their timing, template rendering time, and cache hits/misses per request; the first tool to reach for when a page feels slow or "why did that query run twice."
2. **The Django shell** for interactive exploration:

~~~bash
python manage.py shell
>>> from blog.models import Post
>>> Post.objects.filter(author__username="ada").query   # inspect the actual generated SQL
~~~

3. **print(queryset.query)** — prints the exact SQL Django generated for any QuerySet, essential for understanding why a query is slow or returning unexpected results.
4. **Logging** — configure Django's LOGGING setting to capture request errors, and use the django.db.backends logger (at DEBUG level, in development only) to see every SQL statement executed.
5. **pdb / ipdb** — standard Python debugging (import pdb; pdb.set_trace()), works identically inside a Django view as any Python code.
6. **manage.py check** — Django's built-in system check framework catches many configuration errors (missing migrations, misconfigured settings) before they become runtime bugs.

### Debugging common Django-specific symptoms

- "It works with 10 rows but times out with 100,000" — almost always an N+1 query; check with Debug Toolbar first.
- "TemplateDoesNotExist" — check TEMPLATES['DIRS'] and each app's templates/ directory naming convention (templates/appname/template.html, to avoid cross-app name collisions).
- "django.db.utils.OperationalError" in production but not locally — usually a missing migration (forgot to run migrate) or a database connection/credentials mismatch between environments.
`,

  monitoring: `
Production Django visibility rests on the same three pillars as any web framework (see the Observability category for depth), with Django-specific tooling layered on top.

### Structured logging

~~~python
import logging
logger = logging.getLogger(__name__)

def place_order(request):
    logger.info("order placed", extra={"user_id": request.user.id, "order_id": order.id})
~~~

Configure LOGGING in settings.py with a JSON formatter (via python-json-logger or similar) so logs are structured and queryable in your log aggregation platform, not raw unstructured text.

### Application performance monitoring (APM)

Sentry is the most common choice for Django error tracking and performance monitoring — it auto-instruments views, database queries, and template rendering with minimal setup (sentry-sdk[django]), surfacing slow queries and unhandled exceptions with full request context.

### Metrics

django-prometheus exposes request counts, latencies, and database query metrics in Prometheus format, following the standard RED metrics pattern (Rate, Errors, Duration) any production service should track — see the **Prometheus** skill.

### Django-specific signals to watch

- **Query count per request** (via Debug Toolbar in dev, or custom middleware logging connection.queries in staging) — a rising trend here predicts a production slowdown before users notice one.
- **Slow query log** at the database level (PostgreSQL's log_min_duration_statement) catches queries Django's own tooling might miss, including ones from raw SQL or third-party packages.
- **Celery task queue depth and failure rate**, if background tasks are in use — a growing queue backlog is an early warning of either a stuck task or insufficient worker capacity.
`,

  deployment: `
### The standard: Gunicorn behind nginx, containerized

~~~dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements/production.txt .
RUN pip install --no-cache-dir -r production.txt
COPY . .
RUN python manage.py collectstatic --noinput
ENV DJANGO_SETTINGS_MODULE=myproject.settings.production
EXPOSE 8000
CMD ["gunicorn", "myproject.wsgi:application", "--workers", "4", "--bind", "0.0.0.0:8000"]
~~~

Why each choice matters: collectstatic at build time (not at container start) means static assets are baked into the image and served efficiently by nginx/a CDN, not regenerated on every deploy; --workers 4 is a starting point tuned to available CPU cores (a common rule of thumb is 2 x cores + 1), not a universal constant; the settings module is set via environment variable so the same image can run with different settings.production/settings.staging modules if needed.

### nginx in front

nginx terminates TLS, serves static/media files directly (never proxy static file requests through Gunicorn/Django — a significant, unnecessary performance cost), and proxies dynamic requests to Gunicorn.

### Migrations in the deploy pipeline

~~~bash
python manage.py migrate --noinput   # run BEFORE the new application code starts serving traffic
~~~

Running migrations as a distinct deploy step (not automatically on every container start) prevents multiple app instances from racing to apply the same migration simultaneously during a rolling deployment — coordinate this as a single pre-deploy step, or use a migration lock if your deployment tooling doesn't otherwise guarantee it runs once.

### CI/CD pipeline

Lint (ruff/flake8) → makemigrations --check (catch forgotten migrations) → test suite (pytest-django) → build the Docker image → scan → push → run migrations → rolling deploy. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before a Django application takes real traffic:

- [ ] DEBUG = False, verified via manage.py check --deploy
- [ ] SECRET_KEY loaded from environment/secret store, never hardcoded or committed
- [ ] ALLOWED_HOSTS set explicitly to the real production domain(s)
- [ ] SECURE_SSL_REDIRECT, SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE all True
- [ ] Real production database (PostgreSQL) configured with CONN_MAX_AGE set appropriately
- [ ] Static files collected (collectstatic) and served by nginx/CDN, not Django itself
- [ ] Media/upload storage backed by S3 or equivalent, not local container disk
- [ ] All migrations applied as an explicit, coordinated deploy step
- [ ] Gunicorn/Daphne running behind nginx, not manage.py runserver
- [ ] Structured logging configured, shipping to a log aggregation platform
- [ ] Sentry (or equivalent) wired up for error tracking with request context
- [ ] Django Debug Toolbar confirmed OFF/uninstalled in production
- [ ] Celery (or equivalent) handling any slow, non-blocking background work
- [ ] Database backups verified restorable, not just "backups are running"
- [ ] Load test done: known requests/sec ceiling for the critical paths
- [ ] Runbook: how to roll back a bad deploy and a bad migration
`,

  "common-mistakes": `
1. **Leaving DEBUG=True in production** — leaks full stack traces, settings, and query details to any visitor who triggers an error; the single most damaging common Django misconfiguration.
2. **Not eager-loading related objects**, causing invisible-in-development, severe-in-production N+1 query storms.
3. **Putting all logic in views instead of models/services** — makes logic unreusable from management commands, Celery tasks, or other views, and harder to unit test in isolation.
4. **Forgetting to run/commit migrations**, or generating them but never reviewing what Django actually produced.
5. **Assuming Django auto-wraps every view in a database transaction** — it doesn't, by default; multi-step writes that must succeed or fail together need an explicit transaction.atomic block.
6. **Using the default SQLite database in production** — fine for development, but does not handle concurrent writes at real production scale.
7. **Storing session data or cache in-process** instead of Redis/Memcached, breaking horizontal scaling the moment there's more than one app server.
8. **Not setting up a custom user model at project start** if any customization is ever likely — migrating an in-flight project to a custom user model is a genuinely painful, high-risk migration.
9. **Serving static/media files directly through Django/Gunicorn in production** instead of nginx or a CDN — a real, avoidable performance cost.
10. **Ignoring manage.py check --deploy's output** before shipping — it exists specifically to catch the most common deployment misconfigurations automatically.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| TemplateDoesNotExist | Template file missing, or template directory naming doesn't match app-namespacing convention | Verify TEMPLATES['DIRS'] and put templates under appname/templates/appname/ |
| django.db.utils.OperationalError: no such table | Migrations were never run against this database | Run python manage.py migrate |
| ProgrammingError: relation does not exist | Same as above, PostgreSQL-flavored, or a migration wasn't applied in this environment | Check migration status with showmigrations, then migrate |
| CSRF verification failed | Missing csrf_token in a form, or an AJAX request not sending the CSRF header | Add {% csrf_token %} to forms; set X-CSRFToken header from the cookie for AJAX/fetch requests |
| MultipleObjectsReturned | .get() matched more than one row when exactly one was expected | Use .filter() and handle multiple results explicitly, or add a uniqueness constraint if only one should ever match |
| ImproperlyConfigured | A required setting is missing, or an app isn't in INSTALLED_APPS | Read the specific message — it names the missing setting/app directly |
| IntegrityError | A database constraint (unique, foreign key, not-null) was violated | Validate input before saving, or catch and handle the specific constraint violation |
`,

  faqs: `
**Is Django too "heavy" for a simple API?**
For a small, pure-JSON API with no admin, no templates, and no ORM-heavy data model, Flask or FastAPI often has less overhead and ceremony. Django's value is proportional to how much of its batteries (ORM, admin, auth, migrations) an application actually uses — a data-model-heavy application benefits enormously; a five-endpoint microservice may not need most of it.

**Django REST Framework or a separate framework for APIs?**
If you're already on Django (for the ORM, admin, or an existing app), Django REST Framework is the natural, well-integrated choice. If you're starting a pure API project with no Django-specific needs, FastAPI is frequently preferred today for its native async support and automatic OpenAPI docs — see the **FastAPI** skill for the direct comparison.

**Is Django's ORM as good as writing raw SQL?**
For the vast majority of queries, yes, and it's dramatically safer (automatic parameterization) and more maintainable (Python, not string SQL, refactors and reviews more easily). For genuinely complex analytical queries, .raw() or a direct cursor remains available as an escape hatch — the ORM doesn't lock you out of SQL, it just makes SQL optional for the common case.

**How does Django compare to Ruby on Rails?**
Both are "batteries included," convention-over-configuration frameworks from the same era with a similar philosophy; Rails leans slightly more toward "convention" (less configuration surface), Django slightly more explicit (URLs are configured explicitly rather than convention-derived from controller names) — the choice is often about the surrounding language ecosystem (Python vs Ruby) more than the frameworks themselves.

**Does Django support async fully now?**
Increasingly, yes — async views, middleware, and a growing set of async ORM methods have landed since Django 3.1, but the framework's history as a sync-first framework means some third-party packages and edge cases still assume sync-only usage; verify specific async support for your Django version and dependencies before committing to a fully async architecture.

**What database should I use with Django?**
PostgreSQL is the de facto standard and best-supported choice for production Django — it supports Django's full feature set (including JSONField, array fields, and full-text search) more completely than MySQL or SQLite.
`,

  "interview-questions": `
### Junior level

1. **What is the difference between a Django project and a Django app?**
   Model answer: A project is the overall configuration container (settings, root URL config); an app is a self-contained unit of functionality (models, views, templates for one feature area) that a project includes one or more of.

2. **What do makemigrations and migrate each do?**
   Model answer: makemigrations detects model changes and generates a migration file describing them; migrate applies pending migration files to the actual database schema — kept as two steps so migrations can be reviewed like code before being applied.

3. **How does Django protect against CSRF by default?**
   Model answer: CsrfViewMiddleware requires a valid, per-session CSRF token on state-changing requests; Django's template tags and forms generate this token automatically, and AJAX requests must include it explicitly in a header.

4. **What is the difference between a function-based view and a class-based view?**
   Model answer: A function-based view is a plain Python function taking a request and returning a response; a class-based view encapsulates the same behavior in a class (often a Django generic view like ListView) with methods per HTTP verb, trading some directness for reusable, less-boilerplate CRUD patterns.

5. **What does render() do?**
   Model answer: It loads a template, renders it with the given context dictionary, and wraps the result in an HttpResponse — a shortcut combining template loading, rendering, and response construction.

### Senior level

6. **Explain the N+1 query problem and how Django's ORM addresses it.**
   Model answer: Iterating a queryset and accessing a related object per item triggers one additional query per item; select_related (SQL JOIN, for ForeignKey/OneToOne) and prefetch_related (separate batched query, for ManyToMany/reverse FK) eager-load the related data upfront in a bounded number of queries instead.

7. **How does Django's middleware ordering work for request versus response processing?**
   Model answer: Middleware runs top-to-bottom in MIDDLEWARE order for the incoming request, and bottom-to-top (reverse order) for the outgoing response — each middleware wraps everything listed after it, like nested function calls.

8. **What does transaction.atomic guarantee, and when do you need it explicitly?**
   Model answer: It wraps a block of database operations in a single transaction — either all succeed or none are committed. Django does not wrap every view in a transaction by default (unless ATOMIC_REQUESTS is set), so any multi-step write that must succeed or fail as a unit needs an explicit atomic block.

9. **What's the difference between select_related and prefetch_related, and when would you choose each?**
   Model answer: select_related uses a SQL JOIN and works for ForeignKey/OneToOne (single-valued) relationships; prefetch_related issues a separate query and does the join in Python, required for ManyToMany and reverse ForeignKey (multi-valued) relationships where a single JOIN would multiply rows incorrectly.

10. **How would you scale a Django application whose database has become the bottleneck?**
    Model answer: Add read replicas for read-heavy load (routed via a database router), ensure appropriate indexes exist and are actually used (verify with EXPLAIN), move slow non-blocking work to Celery, and cache expensive, infrequently-changing data in Redis — only reach for sharding at genuinely extreme scale, following patterns like Instagram's published case studies.

11. **What security features does Django provide by default, and what do they NOT cover?**
    Model answer: CSRF protection, XSS-escaping templates, SQL-injection-safe ORM queries, and clickjacking protection (X-Frame-Options) are on by default. They do NOT cover object-level authorization (verifying a user should access a specific object they requested) or business-logic authorization bugs — those remain the application developer's responsibility.

12. **Why might you choose Django over FastAPI for a new project, and vice versa?**
    Model answer: Choose Django when the application is data-model-heavy, needs an admin interface, or benefits from a full batteries-included stack; choose FastAPI when building a lean, async-native API with automatic OpenAPI docs and minimal ORM/admin overhead is the priority — see the **FastAPI** skill for the fuller comparison.
`,

  "coding-questions": `
### 1. Implement a custom queryset method to fetch "trending" posts

~~~python
from django.db import models
from django.utils import timezone
from datetime import timedelta

class PostQuerySet(models.QuerySet):
    def trending(self, days=7):
        cutoff = timezone.now() - timedelta(days=days)
        return self.filter(published_at__gte=cutoff).order_by("-view_count")[:10]

class Post(models.Model):
    # ... fields ...
    objects = PostQuerySet.as_manager()

# Usage: Post.objects.trending()
# Time: one indexed query; ensure published_at and view_count have appropriate indexes
# Follow-up: how would you cache this result, and for how long, given "trending" tolerates some staleness?
~~~

### 2. Write a Django view that safely handles a race condition on a limited-quantity purchase

~~~python
from django.db import transaction
from django.http import JsonResponse
from .models import Ticket

def purchase_ticket(request, event_id):
    with transaction.atomic():
        event = Event.objects.select_for_update().get(pk=event_id)
        if event.tickets_remaining <= 0:
            return JsonResponse({"error": "sold out"}, status=409)
        event.tickets_remaining -= 1
        event.save()
        Ticket.objects.create(event=event, user=request.user)
    return JsonResponse({"status": "purchased"})
# select_for_update() locks the row for the transaction's duration, preventing two
# concurrent requests from both reading tickets_remaining=1 and both succeeding.
# Follow-up: how does this behave under very high contention, and what's an alternative
# (e.g., an atomic F() expression update) that avoids holding a lock at all?
~~~

### 3. Implement a Django REST Framework endpoint with object-level permission

~~~python
from rest_framework import viewsets, permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.author_id == request.user.id

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
# has_object_permission is checked automatically by DRF's generic views (retrieve/update/destroy)
# AFTER the object is fetched, closing the object-level authorization gap Django itself
# leaves to the application (see the Security section above).
# Follow-up: why does DRF check permission at the object level separately from the class
# level (has_permission), and what would go wrong if you only implemented one?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a personal blog
Models for Post and Comment, function-based views for list/detail, Django templates for rendering, and the admin interface registered for both models. Deliverable: a working blog with a usable admin. Skills exercised: MVT, ORM, templates, admin.

### Lab 2 (Intermediate): Add a REST API with Django REST Framework
Layer a DRF API on top of the blog (serializers, viewsets, routers), add token or session authentication, and add pagination. Deliverable: a documented (drf-spectacular or browsable API) REST API. Skills exercised: DRF, authentication, pagination, serialization.

### Lab 3 (Advanced): Add background tasks and caching
Add Celery for sending notification emails asynchronously on new comments, and cache the trending-posts queryset in Redis with a sensible TTL. Deliverable: a load-tested comparison of response times with and without caching. Skills exercised: Celery, Redis caching, performance measurement.

### Lab 4 (Production): Deploy behind Gunicorn + nginx with full observability
Containerize the application, configure production settings, wire up Sentry and structured logging, and deploy behind nginx with static files served correctly. Deliverable: a production-checklist-compliant deployment with a load test showing p95/p99 latency. Skills exercised: deployment, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A dataset-labeling internal tool for an ML team
Engineering requirements: custom user roles (labeler vs reviewer), a Django admin extended with custom actions for bulk-approving labels, an audit trail of every label change (using django-simple-history or custom signals), and a REST API for a separate labeling frontend to consume. Demonstrates the admin's real-world value as a fast internal-tool foundation.

### 2. A multi-tenant SaaS billing and subscription platform
Engineering requirements: per-tenant data isolation (django-tenant-schemas or a shared-schema-with-tenant-FK approach), Stripe webhook handling with idempotency, Celery-driven subscription renewal jobs, and full test coverage of the billing state machine. Demonstrates production Django patterns for a genuinely complex, correctness-critical domain.

### 3. A content moderation queue for user-generated AI prompts
Engineering requirements: a moderation queue model with a status state machine, an admin interface for reviewers with bulk actions and filters, rate-limited API endpoints for prompt submission, and integration with an external content-safety API. Demonstrates Django's strength for internal review workflows directly adjacent to real AI production systems.
`,

  "case-studies": `
### Instagram's Django scaling journey
Instagram's engineering team has published extensively on running Django at massive scale — including sharding PostgreSQL, heavy caching layers, and a full Python 2 to 3 migration performed with zero downtime across a huge, business-critical codebase. Lesson: Django's "start fast, scale deliberately" profile holds up even at some of the largest deployments in the industry, provided the team invests in the database and caching layers as the real scaling bottleneck, not the framework itself.

### Disqus and high-throughput comment infrastructure
Disqus built its widely used, high-write-volume comment platform on Django early in the framework's life, becoming one of the first large-scale proof points that Django could handle serious production load, not just rapid prototyping — an important case study for teams worried Django is "just for MVPs."

### Django's security-response culture
Django's security team has a long, publicly documented track record of responding quickly to CVEs and providing clear upgrade guidance (django-security mailing list, predictable patch releases) — a major factor in institutions with strict security/compliance requirements (universities, government, healthcare-adjacent companies) choosing Django specifically for this operational discipline, not just its technical features.

### The N+1 query lesson, repeated across nearly every team
Almost every team that has scaled a Django application has, at some point, discovered a severe N+1 query problem in production that was invisible in development and testing with small data volumes — this is common enough across the ecosystem to be considered close to a rite of passage, and is precisely why Django Debug Toolbar and select_related/prefetch_related discipline are emphasized so heavily throughout this page.
`,

  comparisons: `
| Aspect | Django | Flask | FastAPI | Express (Node.js) |
|--------|--------|-------|---------|--------------------|
| Philosophy | Batteries included, opinionated | Minimal, unopinionated, build up | Modern async API-first | Minimal, unopinionated |
| ORM | Built in, mature | Not included (SQLAlchemy typical) | Not included (SQLAlchemy typical) | Not included (Prisma/Sequelize typical) |
| Admin interface | Built in, auto-generated | None built in | None built in | None built in |
| Async support | Retrofitted since 3.0/3.1 | Limited, sync-first | Native, async-first | Native (event loop) |
| Auto API docs | Via Django REST Framework + drf-spectacular | Via Flask-RESTX or similar | Built in (OpenAPI/Swagger automatic) | Via separate tooling |
| Best fit | Data-model-heavy apps, internal tools, content platforms | Small services, prototypes, full control | Async-first APIs, ML model serving | JS-native APIs, real-time apps |

**How seniors choose**: reach for Django when the application has a genuinely rich data model, needs an admin interface fast, or the team values a well-trodden, secure-by-default path over maximum flexibility; reach for FastAPI when building a lean, async-native API (especially one serving an ML model) where automatic OpenAPI docs and type-hint-driven validation matter; reach for Flask when you want Django's language (Python) but full control over which pieces (if any) of an ORM/auth/admin stack to include; reach for Express when the team and surrounding ecosystem are already JavaScript/Node.js-centric.
`,

  "related-technologies": `
- **Python** — the language Django is built in and requires fluency in; see the **Python** skill.
- **PostgreSQL** — Django's best-supported, most feature-complete production database backend.
- **Django REST Framework** — the de facto standard API layer on top of Django, implementing the general **REST** architectural style.
- **Celery** — the standard background task queue paired with Django for async work outside the request/response cycle.
- **Redis** — the typical cache and session backend for production Django, and Celery's typical broker.
- **Docker** and **CI/CD** — how Django applications are packaged and shipped in modern production environments.
- **FastAPI** and **Flask** — the two most common alternative Python web framework choices, each trading Django's batteries-included completeness for a different point on the flexibility/speed spectrum.

Learning path: **Python** → this page → **PostgreSQL** for the production database layer → **Django REST Framework** patterns → **Docker**/**CI-CD** for deployment → **FastAPI** for a contrasting async-first perspective on Python web frameworks.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Django 5.x** is the current major line, having added facet filters in the admin, simplified form field template rendering, and continued incremental async ORM support (async versions of more QuerySet methods landing progressively rather than all at once).
- Django's LTS (Long-Term Support) release cadence continues to give conservative institutions a predictable, well-supported upgrade path — verify the current LTS version and its support end date on the official Django download page before planning a long-lived production deployment.
- Async support across the ecosystem remains uneven: Django's core increasingly supports async views/middleware/ORM operations, but many third-party packages (some admin extensions, some auth packages) still assume synchronous usage — verify async compatibility for any specific package before committing to a fully async Django architecture.
- Given Django's steady, incremental release style, check the official Django release notes for the specific version you're deploying rather than assuming feature parity with what's described here.
`,

  "future-roadmap": `
Where Django is heading, and what's worth betting career time on:

- **Continued async maturation** — more of the ORM, more built-in views, and more of the ecosystem becoming async-compatible incrementally; worth tracking if your application has genuinely async-bound workloads (many concurrent slow I/O calls).
- **Django's admin interface continuing to modernize** — recent releases have added facet filtering and improved default styling; the admin remains one of Django's most distinctive, actively invested-in features.
- **Continued emphasis on developer experience and security defaults** — Django's core team has consistently prioritized this over chasing every framework trend, and that conservatism is itself the safer long-term bet for large, long-lived codebases.
- **What to bet on**: deep fluency in the ORM's query generation and the N+1 problem, Django REST Framework for API work, and production deployment discipline (settings management, migrations-as-deploy-step) — these remain valuable regardless of which specific new feature lands in the next release.
`,

  "cheat-sheet": `
~~~python
# ---- Project & app ----
# django-admin startproject myproject
# python manage.py startapp blog

# ---- Models ----
class Post(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey("auth.User", on_delete=models.CASCADE)

# ---- Migrations ----
# python manage.py makemigrations
# python manage.py migrate

# ---- Views ----
def post_list(request):
    posts = Post.objects.select_related("author").all()
    return render(request, "blog/post_list.html", {"posts": posts})

# ---- URLs ----
urlpatterns = [path("<int:pk>/", views.post_detail, name="post_detail")]

# ---- ORM essentials ----
Post.objects.filter(author__username="ada")
Post.objects.select_related("author")       # ForeignKey/OneToOne, one JOIN
Post.objects.prefetch_related("tags")        # ManyToMany/reverse FK, separate query

# ---- Admin ----
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author"]

# ---- Transactions ----
with transaction.atomic():
    account.save()

# ---- Production ----
# gunicorn myproject.wsgi:application --workers 4
# python manage.py check --deploy
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Project vs app? | Project: overall config container. App: self-contained feature-area unit. |
| makemigrations vs migrate? | makemigrations generates a migration file; migrate applies it to the database. |
| select_related vs prefetch_related? | select_related: SQL JOIN, for ForeignKey/OneToOne. prefetch_related: separate query, for M2M/reverse FK. |
| What is the N+1 query problem? | Iterating related objects triggers one extra query per item instead of one JOIN upfront. |
| What does transaction.atomic do? | Wraps a block so all writes succeed together or none are committed. |
| CBV vs FBV? | Class-based views encapsulate common CRUD patterns; function-based views are plainer, more explicit. |
| What does DEBUG=True leak in production? | Full stack traces, settings values, and SQL queries to any visitor triggering an error. |
| How does Django prevent CSRF? | Requires a valid per-session token on state-changing requests, generated automatically by forms/templates. |
| What is select_for_update()? | Acquires a row-level database lock for the transaction's duration, preventing race conditions. |
| What does the admin interface auto-generate? | A working CRUD UI directly from registered models, with list/filter/search configuration. |
| Why use pytest-django over Django's TestCase? | Preferred by teams already on pytest; @pytest.mark.django_db opts a test into DB access explicitly. |
| What database is recommended for production? | PostgreSQL — best feature support (JSONField, arrays, full-text search) among Django's backends. |
| What serves static files in production? | nginx or a CDN, never Django/Gunicorn directly. |
| What command catches common deployment misconfigurations? | python manage.py check --deploy |
| What is a QuerySet's laziness? | No database query runs until the QuerySet is evaluated (iterated, sliced, listed). |
`,

  mcqs: `
1. What happens when you iterate a QuerySet and access a ForeignKey field without select_related?
   A) A compile error  B) One extra query per row (N+1)  C) It's cached automatically, no extra cost  D) The field is null
   **Answer: B** — this is the classic N+1 query problem select_related/prefetch_related solve.

2. What does makemigrations do?
   A) Applies migrations to the database  B) Detects model changes and generates a migration file  C) Deletes all migrations  D) Starts the dev server
   **Answer: B** — migrate is the separate step that actually applies it.

3. Which Django feature auto-escapes template variable output by default?
   A) The ORM  B) Middleware  C) The template engine  D) Admin
   **Answer: C** — closing off the most common XSS vector without developer effort.

4. What does transaction.atomic guarantee?
   A) Faster queries  B) All writes inside succeed together or none are committed  C) Automatic caching  D) CSRF protection
   **Answer: B** — essential for multi-step writes that must not partially apply.

5. Why is DEBUG=True dangerous in production?
   A) It slows down requests  B) It leaks stack traces, settings, and SQL to any visitor triggering an error  C) It disables the admin  D) It breaks migrations
   **Answer: B** — one of the most common and severe Django misconfigurations.

6. What's the difference between select_related and prefetch_related?
   A) No difference  B) select_related is for M2M, prefetch_related for ForeignKey  C) select_related uses a JOIN for single-valued relations, prefetch_related uses a separate query for multi-valued relations  D) prefetch_related is faster in all cases
   **Answer: C** — matching the relationship's cardinality to the correct eager-loading strategy.
`,

  "revision-notes": `
Django is a batteries-included Python web framework built around the Model-View-Template (MVT) architecture: models define data and map to database tables via a mature ORM with a safe, reviewable migrations system; views contain request-handling logic; templates render presentation, auto-escaping output by default. Its defining strength is how much comes pre-integrated and secure by default — CSRF protection, XSS-safe templates, SQL-injection-resistant queries, a full authentication system, and an auto-generated admin interface that is often the fastest path to a usable internal tool in any web framework, in any language.

The single most important performance concept is the N+1 query problem: iterating a queryset and accessing a related object per row triggers one additional database query per row, invisible with small test data and severe at real production scale. select_related (a SQL JOIN, for ForeignKey/OneToOne relationships) and prefetch_related (a separate batched query, for ManyToMany/reverse-ForeignKey relationships) are the fix, and checking query counts with Django Debug Toolbar during development is the practice that prevents this bug from ever reaching production.

QuerySets are lazy — no database query executes until a QuerySet is actually evaluated (iterated, sliced, or cast to a list) — which lets you chain filters freely without worrying about intermediate query cost, but also means re-creating an equivalent QuerySet re-runs the query even if an earlier, already-evaluated one is cached. transaction.atomic wraps multi-step writes so they succeed or fail as a unit — Django does not do this automatically for every view, so any operation with more than one related write needs it explicitly.

Production Django runs behind Gunicorn or Daphne/Uvicorn (for async), fronted by nginx which handles TLS termination and serves static/media files directly — Django itself should never serve static files in production. DEBUG must always be False in production; leaving it True leaks stack traces, settings, and SQL to any visitor who triggers an error, the single most damaging common Django misconfiguration. manage.py check --deploy catches this and several other common production misconfigurations automatically before shipping.

Django REST Framework (DRF) is the de facto standard for building APIs on Django, layering serializers and viewsets on top of the ORM and views. Django's security defaults (CSRF, XSS-escaping, SQL-injection-safe queries) are genuinely strong, but object-level authorization — verifying a user is entitled to the SPECIFIC object they're requesting, not just that they have a permission in general — remains the application developer's responsibility, a common source of real-world authorization bugs the framework itself doesn't prevent.
`,

  "learning-roadmap": `
**Week 1 — MVT fundamentals**: project/app structure, models, migrations, function-based views, URL routing, basic templates. Milestone: a working blog with models, views, and templates rendering real data.

**Week 2 — ORM depth and the admin**: querysets, filtering, select_related/prefetch_related, the admin interface, forms and ModelForms. Milestone: register your models in the admin and fix at least one deliberately introduced N+1 query, verifying the fix with Django Debug Toolbar.

**Week 3 — Authentication and class-based views**: the built-in User model, login/logout/permissions, class-based generic views (ListView, DetailView, CreateView). Milestone: add user authentication and convert at least two views to class-based equivalents.

**Week 4 — Django REST Framework**: serializers, viewsets, routers, authentication for APIs, pagination. Milestone: expose your blog's data as a documented REST API.

**Week 5 — Production practices**: settings-per-environment, transactions, testing (TestCase and pytest-django), Celery for background work, caching with Redis. Milestone: add a background email task and cache an expensive queryset, measuring the difference.

**Week 6 — Deployment and observability**: Dockerize the app, deploy behind Gunicorn + nginx, wire up Sentry and structured logging, run through the full production checklist. Milestone: complete the Lab 4 hands-on project end to end.

Next platform skill once this roadmap is complete: **PostgreSQL** (for the production database layer this page assumes) or **FastAPI** for a contrasting async-first Python web framework perspective.
`,

  "official-docs": `
- **docs.djangoproject.com** — the official Django documentation, widely regarded as some of the best-written framework documentation in the industry; the primary reference for this page's material.
- **Django REST Framework docs (django-rest-framework.org)** — the official DRF reference for serializers, viewsets, and authentication.
- **Django Girls Tutorial** — an excellent, widely recommended zero-to-deployed-blog tutorial for absolute beginners.
- **Two Scoops of Django (book, referenced in Books below) companion site** — best-practices guidance that complements the official docs' reference-style material.
- **Django Security documentation** (docs.djangoproject.com/en/stable/topics/security/) — the authoritative source on exactly what Django protects against by default and what remains the developer's responsibility.
`,

  books: `
- **"Two Scoops of Django" — Daniel and Audrey Roy Greenfeld** — the most widely recommended best-practices book, covering project structure, settings management, and common pitfalls in real production Django codebases.
- **"Django for Beginners" — William S. Vincent** — an accessible, project-based introduction for readers new to Django (and often new to web development generally).
- **"Django for APIs" — William S. Vincent** — a focused, practical introduction to building REST APIs with Django REST Framework.
- **"High Performance Django" — Peter Baumgartner and Yann Malet** — focused specifically on the performance and scaling concerns covered in this page's Performance and Scalability sections.
- **"Test-Driven Development with Python" — Harry Percival** — uses Django as its teaching vehicle for a rigorous TDD workflow, valuable for the Testing section's doctrine in more depth.
`,

  blogs: `
- **Django's official blog (djangoproject.com/weblog)** — release announcements and security advisories directly from the source.
- **Real Python's Django tutorials** — consistently high-quality, example-driven Django content spanning beginner to advanced topics.
- **Simon Willison's blog (simonwillison.net)** — written by one of Django's original creators, frequently covering Django internals, SQL, and web development more broadly.
- **William S. Vincent's blog (wsvincent.com)** — practical, project-based Django content matching the books listed above.
- **The Instagram Engineering blog** — periodic, detailed posts on scaling Django and Python at very large scale, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
Django itself, as an application framework rather than a research subject, has relatively little dedicated academic literature — the closest relevant reading is foundational web-architecture and database-systems material:

- **Fielding, R. — "Architectural Styles and the Design of Network-based Software Architectures"** (2000 doctoral dissertation) — the foundational REST paper underlying the API-design principles Django REST Framework implements; see the **REST** skill for depth.
- Research on **object-relational mapping (ORM) design tradeoffs** more broadly (widely cited industry and academic discussions of the "ORM impedance mismatch" between object models and relational schemas) is the closest thing to foundational literature explaining WHY Django's ORM makes the design choices it does.
- For the database-systems theory underneath the ORM (transactions, isolation levels, indexing), see the foundational reading recommended in the **PostgreSQL** skill — that material is language- and framework-agnostic and directly informs advanced Django ORM usage (select_for_update, transaction isolation).
`,

  videos: `
- **DjangoCon US and DjangoCon Europe talks** (fully recorded, free on YouTube) — the best source of deep, current Django talks from core contributors and large-scale production users.
- **"Django Girls" workshop recordings** — approachable, beginner-focused live-coding sessions.
- **Corey Schafer's Django tutorial series (YouTube)** — widely watched, clear, project-based introduction covering models, views, templates, and authentication.
- **William S. Vincent's Django courses** — practical, project-based video content matching his books.
- **Instagram Engineering's conference talks** on scaling Django — directly relevant to this page's Scalability and Case Studies sections.
`,

  "github-repos": `
- **django/django** — the framework's own source, an excellent read for understanding the ORM, middleware, and request-handling internals directly.
- **encode/django-rest-framework** — the DRF source and its extensive, well-organized example-driven documentation.
- **jazzband/django-debug-toolbar** — the essential development-time query/performance inspection tool referenced throughout this page's Performance and Debugging sections.
- **FactoryBoy/factory_boy** — the standard test-data generation library referenced in the Testing section.
- **jazzband/django-environ** — a widely used library for clean, environment-variable-driven Django settings management.
- **celery/celery** — the standard background task queue paired with Django, referenced in Production Usage and Scalability.
- **django/djangoproject.com** — the source for Django's own official website, itself a real, substantial production Django codebase worth reading.
- **cookiecutter/cookiecutter-django** — a widely used, opinionated production-ready Django project template encoding many of this page's best practices directly into a scaffold.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Models and migrations**: design a normalized schema for a small e-commerce catalog (products, categories, variants), write the models, and generate/review the migrations.
2. **ORM and the N+1 problem**: given a queryset that's deliberately missing select_related/prefetch_related, use Django Debug Toolbar to find and fix every extra query.
3. **Class-based views**: convert a set of function-based CRUD views to their generic class-based equivalents (ListView, DetailView, CreateView, UpdateView, DeleteView).
4. **Django REST Framework**: build a fully paginated, filterable, authenticated API for the e-commerce catalog above.
5. **Concurrency and transactions**: implement the limited-quantity purchase problem (see Coding Questions) and write a test that simulates concurrent requests to verify no overselling occurs.
6. **External practice sets**: the official Django tutorial ("Writing your first Django app") for structured, guided practice; Django Girls' tutorial for an alternate beginner-friendly path; Test-Driven Development with Python's accompanying exercises for TDD practice specifically in a Django context.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Browser / API client"] -->|HTTPS| Nginx["nginx\n(TLS termination, static/media files)"]
    Nginx -->|proxy| Gunicorn["Gunicorn\n(WSGI workers)"]
    Gunicorn --> MW["Middleware\n(security, session, auth, CSRF)"]
    MW --> Views["Views / DRF viewsets"]
    Views --> ORM["Django ORM"]
    ORM --> DB[("PostgreSQL\nprimary + read replicas")]
    Views --> Cache[("Redis\ncache + sessions")]
    Views -->|enqueue| Celery["Celery workers\n(background tasks)"]
    Celery --> DB
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
  root((Django))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    MVT Architecture
      Models and ORM
      Views FBV and CBV
      Templates
      URL routing
    Core Features
      Migrations
      Admin interface
      Forms
      Middleware
      Signals
    ORM Depth
      QuerySet laziness
      N plus 1 problem
      select_related prefetch_related
      Transactions
    APIs
      Django REST Framework
      Serializers and viewsets
      Authentication
    Production
      Settings per environment
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

export default django;
