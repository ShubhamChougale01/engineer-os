import type { CheatSheetData } from "./types";

const django: CheatSheetData = {
  title: "The Ultimate Django Cheat Sheet",
  subtitle: "MVT architecture · ORM & migrations · admin · DRF · production toolbelt",
  sections: [
    {
      title: "Project & Models",
      color: "violet",
      rows: [
        { term: "Create project & app", desc: "The two-level structure: project config, app feature", code: "django-admin startproject myproject\npython manage.py startapp blog" },
        { term: "Model definition", desc: "Python class maps directly to a database table", code: "class Post(models.Model):\n  title = models.CharField(max_length=200)\n  author = models.ForeignKey('auth.User', on_delete=models.CASCADE)" },
        { term: "Migrations", desc: "Two steps: generate the file, then apply it", code: "python manage.py makemigrations\npython manage.py migrate" },
        { term: "Model methods", desc: "Business logic belongs here, not in views", code: "def __str__(self):\n  return self.title" },
        { term: "Meta options", desc: "Ordering, constraints, indexes without extra fields", code: "class Meta:\n  ordering = ['-published_at']\n  indexes = [models.Index(fields=['author'])]" },
      ],
    },
    {
      title: "Views & URLs",
      color: "blue",
      rows: [
        { term: "Function-based view", desc: "Plain function: request in, response out", code: "def post_list(request):\n  posts = Post.objects.all()\n  return render(request, 'blog/post_list.html', {'posts': posts})" },
        { term: "Class-based generic view", desc: "Less boilerplate for standard CRUD patterns", code: "class PostListView(ListView):\n  model = Post\n  context_object_name = 'posts'" },
        { term: "URL routing", desc: "Typed captured segments in the path", code: "urlpatterns = [\n  path('<int:pk>/', views.post_detail, name='post_detail'),\n]" },
        { term: "get_object_or_404", desc: "Standard shortcut for 'fetch or 404'", code: "post = get_object_or_404(Post, pk=pk)" },
        { term: "Template tags", desc: "Auto-escaped by default — a real XSS defense", code: "{{ post.title }}\n{% url 'post_detail' post.pk %}\n{% for p in posts %} ... {% endfor %}" },
      ],
    },
    {
      title: "ORM & the N+1 Problem",
      color: "emerald",
      rows: [
        { term: "QuerySet laziness", desc: "No query runs until the QuerySet is evaluated", code: "qs = Post.objects.filter(author=u)  # no query yet\nlist(qs)                              # NOW it queries" },
        { term: "select_related", desc: "SQL JOIN — for ForeignKey / OneToOne", code: "Post.objects.select_related('author').all()" },
        { term: "prefetch_related", desc: "Separate batched query — for M2M / reverse FK", code: "Post.objects.prefetch_related('tags').all()" },
        { term: "Aggregation", desc: "Count, Sum, Avg computed in the database", code: "from django.db.models import Count\nPost.objects.annotate(n=Count('comments'))" },
        { term: "bulk_create", desc: "One query for many objects instead of one per object", code: "Post.objects.bulk_create([Post(title=t) for t in titles])" },
        { term: "transaction.atomic", desc: "All writes succeed together or none commit", code: "with transaction.atomic():\n  a.save(); b.save()" },
        { term: "select_for_update", desc: "Row-level lock to prevent race conditions", code: "Account.objects.select_for_update().get(pk=id)" },
      ],
    },
    {
      title: "Admin & Forms",
      color: "amber",
      rows: [
        { term: "Register a model", desc: "Instant CRUD UI from a model definition", code: "@admin.register(Post)\nclass PostAdmin(admin.ModelAdmin):\n  list_display = ['title', 'author']" },
        { term: "ModelForm", desc: "Form fields generated directly from a model", code: "class PostForm(forms.ModelForm):\n  class Meta:\n    model = Post\n    fields = ['title', 'body']" },
        { term: "Custom field validation", desc: "clean_<fieldname> methods run automatically", code: "def clean_title(self):\n  t = self.cleaned_data['title']\n  if len(t) < 5: raise forms.ValidationError('too short')\n  return t" },
        { term: "Middleware shape", desc: "Wraps every request/response; order matters", code: "class TimingMiddleware:\n  def __init__(self, get_response): self.get_response = get_response\n  def __call__(self, request):\n    resp = self.get_response(request)\n    return resp" },
      ],
    },
    {
      title: "Django REST Framework",
      color: "rose",
      rows: [
        { term: "Serializer", desc: "Model to/from JSON, with validation", code: "class PostSerializer(serializers.ModelSerializer):\n  class Meta:\n    model = Post\n    fields = ['id', 'title', 'author']" },
        { term: "ViewSet", desc: "Generic CRUD endpoint logic in a few lines", code: "class PostViewSet(viewsets.ModelViewSet):\n  queryset = Post.objects.all()\n  serializer_class = PostSerializer" },
        { term: "Object-level permission", desc: "Checked automatically on retrieve/update/destroy", code: "class IsOwner(permissions.BasePermission):\n  def has_object_permission(self, req, view, obj):\n    return obj.author_id == req.user.id" },
        { term: "Router", desc: "Wires viewsets to URLs automatically", code: "router = DefaultRouter()\nrouter.register('posts', PostViewSet)" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Deployment check", desc: "Catches common misconfigurations automatically", code: "python manage.py check --deploy" },
        { term: "Never in production", desc: "DEBUG leaks stack traces, settings, and SQL", code: "DEBUG = False  # always, in production" },
        { term: "Serve via Gunicorn", desc: "Never manage.py runserver in production", code: "gunicorn myproject.wsgi:application --workers 4" },
        { term: "Static files", desc: "Collected at build time, served by nginx/CDN", code: "python manage.py collectstatic --noinput" },
        { term: "Debug Toolbar", desc: "Shows query count and timing per request (dev only)", code: "pip install django-debug-toolbar" },
        { term: "Testing", desc: "TestCase wraps each test in a rolled-back transaction", code: "class PostTests(TestCase):\n  def test_list(self):\n    r = self.client.get(reverse('post_list'))\n    self.assertEqual(r.status_code, 200)" },
      ],
    },
  ],
};

export default django;
