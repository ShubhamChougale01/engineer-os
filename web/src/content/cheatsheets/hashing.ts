import type { CheatSheetData } from "./types";

const hashing: CheatSheetData = {
  title: "The Ultimate Hashing Cheat Sheet",
  subtitle: "Digests · password hashing · salts/peppers · HMAC · production toolbelt",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "Cryptographic hash function", desc: "Deterministic, fixed-size output; one-way (pre-image resistant); collision-resistant", code: "sha256(\"hello\") -> always the same 64-hex-char digest" },
        { term: "Avalanche effect", desc: "A tiny input change flips roughly half the output bits", code: "sha256(\"hello\")  != sha256(\"Hello\")\n# completely different digests" },
        { term: "Pre-image resistance", desc: "Given a digest, it's computationally infeasible to find an input producing it", code: "Can't reverse a hash back to its input\n(unlike encryption, which is reversible with a key)" },
        { term: "Collision resistance", desc: "Computationally infeasible to find two different inputs with the same digest", code: "MD5 and SHA-1: broken (collisions found)\nSHA-256/SHA-3: currently collision-resistant" },
        { term: "Digest", desc: "The fixed-length output of a hash function, regardless of input length", code: "SHA-256 digest is always 256 bits / 32 bytes" },
        { term: "Encryption vs hashing", desc: "Encryption is reversible with a key; hashing is one-way by design — see the Encryption skill", code: "Encrypt: plaintext <-> ciphertext (with key)\nHash: input -> digest (no way back)" },
        { term: "Checksum / integrity check", desc: "Using a hash to detect accidental corruption, not necessarily attacker tampering", code: "sha256sum file.iso\n# compare against publisher's published digest" },
      ],
    },
    {
      title: "General-Purpose Hashes",
      color: "blue",
      rows: [
        { term: "SHA-256", desc: "Widely used, fast, secure general-purpose hash — SHA-2 family", code: "import hashlib\nhashlib.sha256(b\"data\").hexdigest()" },
        { term: "SHA-3", desc: "Newer family with a different internal construction (Keccak sponge), not just a patch of SHA-2", code: "hashlib.sha3_256(b\"data\").hexdigest()" },
        { term: "MD5 (broken, do not use)", desc: "Collision attacks are practical; still seen in legacy checksums only", code: "Never for passwords, signatures,\nor anything security-relevant" },
        { term: "SHA-1 (broken, do not use)", desc: "Practical collision demonstrated (SHAttered attack); deprecated everywhere", code: "Migrate any remaining SHA-1 usage\nto SHA-256 or better" },
        { term: "Merkle tree", desc: "Tree of hashes enabling efficient, verifiable proofs over large datasets", code: "Git commit graph, blockchain blocks,\nand certificate transparency all use this" },
        { term: "Fast is a feature here, a bug for passwords", desc: "General-purpose hashes are optimized for speed, which is exactly wrong for passwords", code: "GPUs compute billions of SHA-256\nhashes per second -- brute force is trivial" },
        { term: "Digital signatures", desc: "Sign a hash of the data, not the data itself, for efficiency", code: "signature = sign(private_key, sha256(document))" },
      ],
    },
    {
      title: "Password Hashing (Slow By Design)",
      color: "emerald",
      rows: [
        { term: "bcrypt", desc: "Widely deployed, battle-tested; cost factor tunes work exponentially", code: "import bcrypt\nbcrypt.hashpw(pw.encode(), bcrypt.gensalt(rounds=12))" },
        { term: "bcrypt.checkpw", desc: "Verifies without needing to store the salt separately — it's embedded in the hash", code: "bcrypt.checkpw(pw.encode(), stored_hash)" },
        { term: "Cost factor / work factor", desc: "Controls how slow hashing is — raise it as hardware gets faster", code: "bcrypt.gensalt(rounds=12)  # ~250ms per hash\n# this platform's own backend uses rounds=12" },
        { term: "scrypt", desc: "Memory-hard, resists cheap GPU/ASIC parallelization better than bcrypt", code: "hashlib.scrypt(pw, salt=salt, n=2**14, r=8, p=1)" },
        { term: "Argon2 (modern winner)", desc: "Won the Password Hashing Competition; tunable for memory, time, and parallelism", code: "from argon2 import PasswordHasher\nPasswordHasher().hash(password)" },
        { term: "Why not SHA-256 for passwords", desc: "Too fast — billions of guesses per second on commodity GPUs", code: "bcrypt: ~4 hashes/sec per core at cost 12\nSHA-256: billions/sec on a GPU" },
        { term: "Rehash-on-login upgrade", desc: "Detect an old/weak hash at login and transparently re-hash with current parameters", code: "if needs_rehash(stored_hash):\n    stored_hash = hash_password(password)" },
      ],
    },
    {
      title: "Salts, Peppers & HMAC",
      color: "amber",
      rows: [
        { term: "Salt", desc: "Random per-user value mixed into the hash to defeat precomputed rainbow tables", code: "bcrypt/Argon2 generate and embed the salt\nautomatically -- you rarely handle it manually" },
        { term: "Rainbow table", desc: "Precomputed hash-to-plaintext lookup table, defeated by per-user salting", code: "Without salt: one table cracks every user\nWith salt: attacker must crack each user separately" },
        { term: "Pepper", desc: "A secret application-wide value (not stored with the hash) added as an extra layer", code: "hash_input = password + PEPPER  # PEPPER from secrets manager\n# see the Secrets Management skill" },
        { term: "HMAC", desc: "Keyed-hash message authentication — proves both integrity AND authenticity", code: "import hmac, hashlib\nhmac.new(secret_key, message, hashlib.sha256).hexdigest()" },
        { term: "HMAC use: webhook verification", desc: "Verify a payload really came from the claimed sender (e.g. Stripe, GitHub webhooks)", code: "expected = hmac.new(WEBHOOK_SECRET, body,\n  hashlib.sha256).hexdigest()" },
        { term: "HMAC use: JWT HS256", desc: "Symmetric JWT signing is HMAC-SHA256 under the hood — see the JWT skill", code: "signature = HMAC-SHA256(header + '.' + payload, secret)" },
        { term: "Constant-time comparison", desc: "Prevents timing attacks when comparing secrets or MACs", code: "hmac.compare_digest(got, expected)\n# NOT: got == expected" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "MD5/SHA1 for passwords", desc: "The single most common legacy security debt found in audits", code: "Migrate immediately to bcrypt/Argon2\nForce password reset if unavoidable" },
        { term: "Hand-rolled salting", desc: "Manually concatenating salt+password and using a fast hash reintroduces the speed problem", code: "# STILL WRONG:\nsha256(salt + password)  # fast hash, still brute-forceable" },
        { term: "== for secret comparison", desc: "Non-constant-time compare leaks timing information about how many bytes matched", code: "if computed_hmac == provided_hmac:  # timing side-channel\n# use hmac.compare_digest instead" },
        { term: "Storing the pepper with the data", desc: "Defeats its entire purpose — pepper must live in a separate secrets store", code: "PEPPER = os.environ['APP_PEPPER']\n# never in the same DB as password hashes" },
        { term: "Truncating bcrypt input silently", desc: "bcrypt only reads the first 72 bytes — validate length, don't silently truncate", code: "password: str = Field(min_length=8, max_length=72)" },
        { term: "Base64 mistaken for hashing/encryption", desc: "Base64 is reversible encoding, not security in any sense", code: "base64.b64decode(base64.b64encode(x)) == x\n# trivially reversible, zero security" },
        { term: "Low bcrypt/Argon2 cost factor", desc: "Defeats the purpose of a slow hash — re-tune as hardware improves", code: "Benchmark target: ~200-500ms per hash\non your actual production hardware" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Python bcrypt / passlib / argon2-cffi", desc: "Standard libraries for password hashing in Python services", code: "pip install bcrypt argon2-cffi" },
        { term: "Node bcrypt / argon2", desc: "Equivalent libraries in the Node ecosystem", code: "npm install bcrypt argon2" },
        { term: "hashlib (stdlib)", desc: "Python's built-in module for general-purpose digests and HMAC", code: "import hashlib, hmac" },
        { term: "sha256sum / shasum CLI", desc: "Quick file-integrity verification from the command line", code: "sha256sum release.tar.gz" },
        { term: "Password strength meters", desc: "zxcvbn-style estimators for UX guidance — not a substitute for slow hashing", code: "npm install zxcvbn" },
        { term: "Secret scanning in CI", desc: "Catch hardcoded pepper/HMAC keys before they reach a repo", code: "See the Secrets Management skill\nfor git-secrets / truffleHog" },
        { term: "OWASP reference", desc: "Password Storage Cheat Sheet and A02:2021-Cryptographic Failures", code: "Cross-reference: Encryption, TLS & HTTPS,\nOWASP Top 10 skills" },
      ],
    },
  ],
};

export default hashing;
