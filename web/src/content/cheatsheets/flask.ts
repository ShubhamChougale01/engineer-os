import type { CheatSheetData } from "./types";

const flask: CheatSheetData = {
  title: "The Ultimate Flask Cheat Sheet",
  subtitle: "Routing & context · app factory & Blueprints · SQLAlchemy · production toolbelt",
  sections: [
    {
      title: "Core Routing & Requests",
      color: "violet",
      rows: [
        { term: "Minimal app", desc: "A complete, runnable Flask app in a few lines", code: "app = Flask(__name__)\n@app.route('/')\ndef index(): return 'Hello!'" },
        { term: "Path parameters", desc: "Captured segments passed as function arguments", code: "@app.route('/greet/<name>')\ndef greet(name): return f'Hello, {name}!'" },
        { term: "Query string", desc: "request.args for GET parameters", code: "request.args.get('q', '')" },
        { term: "JSON / form body", desc: "Two ways to read a POST body", code: "request.get_json()\nrequest.form.get('field')" },
        { term: "Response helpers", desc: "JSON with explicit status, and named-route redirects", code: "return jsonify({'ok': True}), 200\nreturn redirect(url_for('index'))" },
        { term: "Jinja2 templates", desc: "Auto-escaped by default — a real XSS defense", code: "return render_template('page.html', name=name)" },
      ],
    },
    {
      title: "App Factory & Blueprints",
      color: "blue",
      rows: [
        { term: "Application factory", desc: "Essential for testing and multi-environment config", code: "def create_app(config_object):\n  app = Flask(__name__)\n  app.config.from_object(config_object)\n  return app" },
        { term: "Blueprint", desc: "Flask's modularity mechanism — groups related routes", code: "main_bp = Blueprint('main', __name__)\n@main_bp.route('/')\ndef index(): return 'hi'" },
        { term: "Register a blueprint", desc: "Wires the blueprint's routes into the app", code: "app.register_blueprint(main_bp)" },
        { term: "Config classes", desc: "One class per environment, selected at creation time", code: "class ProductionConfig(Config):\n  DEBUG = False\n  SECRET_KEY = os.environ['SECRET_KEY']" },
        { term: "Extension init_app pattern", desc: "Every well-behaved extension follows this shape", code: "db = SQLAlchemy()\n# later, in create_app():\ndb.init_app(app)" },
      ],
    },
    {
      title: "Context Locals & Hooks",
      color: "emerald",
      rows: [
        { term: "request / current_app / g", desc: "Context-local proxies, NOT true globals", code: "current_app.config['SOME_SETTING']\ng.user = load_user()" },
        { term: "before_request", desc: "Runs before every view, in registration order", code: "@app.before_request\ndef before(): g.start = time.monotonic()" },
        { term: "after_request", desc: "Can modify the outgoing response", code: "@app.after_request\ndef after(resp):\n  resp.headers['X-Time'] = '...'\n  return resp" },
        { term: "teardown_appcontext", desc: "Guaranteed to run even if the request raised", code: "@app.teardown_appcontext\ndef teardown(exc=None): db_session.remove()" },
        { term: "Error handlers", desc: "Consistent JSON errors instead of default HTML pages", code: "@app.errorhandler(404)\ndef not_found(e): return jsonify({'error': 'not found'}), 404" },
      ],
    },
    {
      title: "Flask-SQLAlchemy",
      color: "amber",
      rows: [
        { term: "Model", desc: "Class maps directly to a database table", code: "class Post(db.Model):\n  id = db.Column(db.Integer, primary_key=True)\n  title = db.Column(db.String(200))" },
        { term: "Query", desc: "The standard SQLAlchemy query API", code: "Post.query.filter_by(title='x').first()\nPost.query.get(id)" },
        { term: "Eager loading (fix N+1)", desc: "joinedload / selectinload — Flask's select_related equivalent", code: "Post.query.options(joinedload(Post.author)).all()" },
        { term: "Migrations (Flask-Migrate)", desc: "Alembic wrapper, analogous to Django's migrate", code: "flask db migrate -m 'add title'\nflask db upgrade" },
        { term: "Pagination", desc: "Never return an unbounded queryset from an API", code: "Post.query.paginate(page=1, per_page=20, error_out=False)" },
      ],
    },
    {
      title: "Auth & Security",
      color: "rose",
      rows: [
        { term: "Flask-Login", desc: "Session-based auth state, layered on Flask's sessions", code: "@login_required\ndef dashboard(): return f'Hi {current_user.username}'" },
        { term: "CSRF protection", desc: "NOT built in — must add Flask-WTF explicitly", code: "from flask_wtf import CSRFProtect\nCSRFProtect(app)" },
        { term: "Session cookie", desc: "Signed (tamper-evident) but NOT encrypted", code: "SESSION_COOKIE_SECURE = True\nSESSION_COOKIE_HTTPONLY = True" },
        { term: "SECRET_KEY", desc: "Signs sessions and CSRF tokens — never hardcode", code: "SECRET_KEY = os.environ['SECRET_KEY']" },
        { term: "Never in production", desc: "The debugger can execute arbitrary code if exposed", code: "DEBUG = False  # always, in production" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Serve via Gunicorn", desc: "Never app.run() in production", code: "gunicorn 'app:create_app()' --workers 4 --timeout 30" },
        { term: "Testing", desc: "Fresh app + client per test via the factory pattern", code: "def test_index(client):\n  r = client.get('/')\n  assert r.status_code == 200" },
        { term: "Test request context", desc: "For unit-testing context-dependent code without a real request", code: "with app.test_request_context('/path'):\n  assert request.path == '/path'" },
        { term: "CLI commands", desc: "Flask integrates Click for custom management commands", code: "@app.cli.command('seed-db')\ndef seed_db(): ..." },
        { term: "Debug Toolbar", desc: "Query count and timing per request (dev only)", code: "pip install flask-debugtoolbar" },
        { term: "List routes", desc: "Debug why a URL isn't matching", code: "flask routes" },
      ],
    },
  ],
};

export default flask;
