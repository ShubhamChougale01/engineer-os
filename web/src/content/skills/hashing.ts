import type { SkillContent } from "../types";

/**
 * Hashing — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const hashing: SkillContent = {
  overview: `
Hashing is the process of taking an input of any size and deterministically producing a fixed-size output — a "digest" or "hash" — using a one-way mathematical function. It is one of the most quietly load-bearing ideas in all of computing: it underlies password storage, file integrity checks, digital signatures, version control, blockchains, database indexing, deduplication, load balancing, and caching.

For an AI/backend engineer, hashing sits at the intersection of two very different worlds that are constantly confused: **general-purpose hashing** (fast, for integrity and lookups — SHA-256, SHA-3, MD5) and **password hashing** (deliberately slow, for secret storage — bcrypt, scrypt, Argon2). Using the wrong one is one of the most common, most catastrophic mistakes in application security, and it is entirely preventable once the distinction is internalized.

A cryptographic hash function has four defining properties: it is **deterministic** (same input always gives the same output), produces a **fixed-size output** regardless of input size (SHA-256 always outputs 256 bits, whether you hash one byte or one terabyte), is **pre-image resistant** (one-way: given a hash, you cannot feasibly recover the input), and is **collision-resistant** (it is computationally infeasible to find two different inputs that produce the same output). A fifth property, the **avalanche effect**, falls out of good hash design: changing a single input bit should flip roughly half of the output bits, with no discernible pattern.

Hashing is distinct from **encryption** (see the Encryption skill) in one crucial way: encryption is two-way (ciphertext can be decrypted back to plaintext with the right key), hashing is one-way by design (there is no "unhash" operation). This platform's own backend demonstrates the correct real-world split: passwords are hashed with bcrypt (see api/app/core/security.py — hash_password and verify_password, cost factor 12) so they can never be recovered even if the database leaks, while JWTs (see the JWT skill) are signed — not encrypted — using HMAC, which is a keyed hash construction covered later in this page.
`,

  history: `
Hashing as a concept predates cryptography — hash tables for O(1) lookup were used in compilers and databases from the 1950s onward, built on simple, fast, non-cryptographic functions. Cryptographic hashing — where the one-way and collision-resistance properties actually matter against an adversary — is a younger, more turbulent history, largely written by a sequence of once-trusted algorithms being broken.

| Year | Milestone |
|------|-----------|
| 1979 | Merkle-Damgard construction concepts emerge from Ralph Merkle's PhD work — the backbone of MD5, SHA-1, and SHA-2 |
| 1991 | MD5 published by Ron Rivest — 128-bit digest, extremely fast, widely adopted |
| 1993 | SHA-0 published by NSA/NIST; withdrawn shortly after due to an undisclosed flaw |
| 1995 | SHA-1 published (160-bit) — fixes SHA-0's flaw; becomes the internet's default hash for over a decade |
| 1996 | Bruce Schneier and Niels Provos design bcrypt for OpenBSD, based on the Blowfish cipher, specifically to be slow for password storage |
| 2004–2005 | Xiaoyun Wang and collaborators publish practical collision attacks on MD5, then theoretical attacks on SHA-1 |
| 2008 | scrypt designed by Colin Percival, adding memory-hardness so GPU/ASIC cracking farms stop having a cost advantage |
| 2012 | Keccak wins NIST's public SHA-3 competition, held precisely because SHA-2's Merkle-Damgard family shared structural DNA with the broken SHA-1 |
| 2013–2015 | The Password Hashing Competition (PHC), an open, public contest (deliberately modeled on the SHA-3 process) to find the best modern password hash |
| 2015 | Argon2 wins the PHC; SHA-3 (Keccak) is formally standardized as FIPS 202 |
| 2017 | Google and CWI Amsterdam publish "SHAttered" — the first practical SHA-1 collision, produced two different PDFs with identical SHA-1 hashes |
| 2020s | Git migrates its default hash from SHA-1 toward SHA-256; Argon2id becomes the OWASP-recommended default for new systems |

The recurring lesson across this table: cryptographic hash functions do not fail gracefully. MD5 and SHA-1 were both "fine" for a decade, then suddenly were not, once cryptanalysis and hardware caught up. This is why senior engineers pin hash algorithm choices to public, actively-vetted standards (SHA-2/SHA-3, bcrypt/Argon2) rather than inventing anything custom — see the Common Mistakes and Anti-Patterns sections.
`,

  "why-it-exists": `
Before cryptographic hashing, two separate problems had no clean solution:

1. **"Did this data change?"** Verifying that a file, message, or software package is exactly what the sender intended — byte for byte — without transmitting the whole original alongside it every time for comparison. Checksums like CRC32 existed, but they were designed to catch *accidental* corruption (a scratched disk, a flipped bit on a wire), not deliberate tampering by an adversary who can craft a corrupted file with the same checksum.

2. **"How do you store a secret so that even you, the server, can't read it back?"** Early systems stored passwords in plaintext or with reversible encryption. Every database breach became a mass password-and-identity breach, because whoever stole the database could immediately read every user's password.

Cryptographic hashing solves both by removing the ability to invert the function. A general-purpose cryptographic hash (SHA-256) gives you tamper-evidence: an adversary cannot quietly modify data and have it still match the original hash, because doing so requires finding a collision, which is computationally infeasible. A password-hashing-specific function (bcrypt, Argon2) additionally makes the *forward* direction expensive, so that even the one-way property doesn't help an attacker who is willing to brute-force guesses against a stolen hash.

The two needs — fast integrity verification vs. deliberately slow secret storage — are why the field split into two families of algorithms that must never be swapped, a distinction this page treats as the single most important idea in the whole skill.
`,

  "problem-it-solves": `
Concrete pains hashing removes:

- **Data integrity without full comparison.** Instead of re-downloading or re-transmitting an entire file to check it arrived correctly, you compare a 32/64-byte digest. Package managers, CDNs, and software installers all use this (a published SHA-256 checksum next to a download link).
- **Tamper evidence in supply chains.** Git commit hashes, Docker image digests, and code-signing certificates all rely on the fact that changing even one bit of the content produces a wildly different hash — so any tampering is immediately detectable.
- **Storing secrets without being able to leak them.** Password hashing means a stolen database (an eventual certainty at scale) does not directly hand out plaintext passwords — the attacker must run a computationally expensive cracking process per password, and the platform can make that process deliberately, tunably slow.
- **Fast equality and deduplication at scale.** Comparing two 4KB hashes is far cheaper than comparing two 4GB files; deduplication systems, content-addressable storage (Git objects, IPFS), and Merkle trees (blockchains, certificate transparency logs) all lean on hashing for this.
- **Building compact data structures.** Hash tables, Bloom filters, consistent-hashing ring for load balancers, and sharding schemes all use fast (non-cryptographic or cryptographic) hash functions to map arbitrary keys to fixed-size buckets in O(1).

What hashing deliberately does **NOT** solve:

- **Confidentiality of the original data.** Hashing a password lets you *verify* it, not recover it — if you need to get the original value back (e.g., to email a user their credit card number), you need encryption, not hashing. See the Encryption skill for that two-way primitive.
- **Authentication of the sender by itself.** A plain hash proves data hasn't changed, but anyone can compute a hash of anything — it doesn't prove *who* produced it. That requires a keyed construction (HMAC, covered below) or a digital signature (asymmetric crypto, see Encryption).
- **Protection against a determined, well-resourced attacker guessing a weak password.** Even the best password hash (Argon2) only slows down cracking — it cannot save a genuinely weak, common password from being found in a rainbow table or a dictionary attack in seconds. Hashing buys you time and cost-per-guess, not invulnerability; strong password policies and MFA are still required layers.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, precisely, the four defining properties of a cryptographic hash function (determinism, fixed-size output, pre-image resistance, collision resistance) and demonstrate the avalanche effect with a real example.
2. Correctly choose between general-purpose hashes (SHA-256, SHA-3) and password-hashing algorithms (bcrypt, Argon2) for a given use case, and explain why using the wrong family is a critical vulnerability.
3. Implement password hashing and verification in Python using bcrypt, matching the pattern used by this platform's own backend (cost factor, salting, safe comparison).
4. Explain why salts defeat rainbow tables, and why modern password hashers (bcrypt/Argon2) handle salting internally rather than requiring you to manage it.
5. Explain what a pepper is, how it differs from a salt, and where it should be stored.
6. Explain HMAC as a distinct, keyed construction from plain hashing, and identify real production uses (webhook signature verification, JWT HS256).
7. Implement a timing-attack-safe comparison for verifying secrets (tokens, HMAC signatures, API keys) and explain why naive == comparison is a vulnerability.
8. Trace how a Merkle tree, a Git commit, and a blockchain block each use hashing to create tamper-evident structures.
9. Identify and fix the classic hashing mistakes: MD5/SHA-1 for passwords, rolling your own salting scheme, fast hashes for secrets, non-constant-time comparisons.
10. Debug and reason about hash-related production incidents: broken password migrations, hash collisions in caches, and slow bcrypt rounds under load.
`,

  prerequisites: `
- **Required**: basic programming literacy (this page uses Python, matching the rest of the platform); comfort with hexadecimal/binary representations of bytes is helpful but explained from scratch.
- **Helpful**: the **Encryption** skill — hashing is constantly confused with encryption, and understanding the two-way vs. one-way distinction there makes this page click faster. Read that skill's "symmetric vs asymmetric" framing first if you haven't.
- **Helpful**: the **OAuth 2.0 / OIDC** and **JWT** skills — both rely on hashing (HMAC for JWT HS256 signing, and hashing for comparing tokens/refresh secrets safely) and are natural companions once this page is done.
- **For production sections**: basic familiarity with a web backend (any framework) helps ground the bcrypt/Argon2 examples, but the code is self-contained.

Dependency links on this platform: **Hashing** pairs directly with **Encryption**, **TLS & HTTPS**, **Secrets Management**, **OAuth 2.0 / OIDC**, and **JWT** — together they form the core cryptography literacy every backend and AI engineer needs. See **SQL Injection**, **XSS**, **CSRF**, and **OWASP Top 10** for how hashing failures show up as concrete, exploitable vulnerabilities.
`,

  "beginner-concepts": `
### What a hash function actually does

A hash function takes an input of *any* size (a single character, a password, a 10GB video file) and produces an output of a *fixed* size (for SHA-256, always 256 bits — 32 bytes, usually shown as 64 hex characters). This is true no matter what you put in.

~~~python
import hashlib

# Hashing a tiny string
h1 = hashlib.sha256(b"hi").hexdigest()
print(h1)
# 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa
print(len(h1))  # 64 hex chars = 32 bytes = 256 bits, ALWAYS

# Hashing a much bigger input — SAME fixed output size
h2 = hashlib.sha256(b"hi" * 1_000_000).hexdigest()
print(len(h2))  # still 64
~~~

### Determinism

The same input always produces the same output, every time, on every machine, forever. This is what makes hashing useful for integrity checks — two people can hash the same file independently and compare digests without ever needing to share the file itself.

~~~python
import hashlib

assert hashlib.sha256(b"password123").hexdigest() == hashlib.sha256(b"password123").hexdigest()
# True — deterministic. No randomness is involved in a plain hash function.
~~~

### One-way (pre-image resistance)

Given a hash output, there is no way to "run it backward" to recover the original input — you can only search (try candidate inputs and see if they match). This is the property that makes it safe (in principle) to store a hash instead of the original secret.

~~~python
import hashlib

secret_hash = hashlib.sha256(b"correct horse battery staple").hexdigest()
# There is no sha256_decode(secret_hash) function. It does not exist.
# The only way to find the input is to guess inputs and hash them until one matches.
~~~

### The avalanche effect — a worked example

A well-designed hash function turns a tiny input change into a massive, unpredictable output change. Flip a single character and roughly half the output bits flip, with no visible pattern connecting the two.

~~~python
import hashlib

def to_bits(hex_digest: str) -> str:
    """Render a hex digest as a binary string for bit-level comparison."""
    return bin(int(hex_digest, 16))[2:].zfill(len(hex_digest) * 4)

h_a = hashlib.sha256(b"Hello World").hexdigest()
h_b = hashlib.sha256(b"Hello World!").hexdigest()   # only added "!"

print("Hash A:", h_a)
# a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146
print("Hash B:", h_b)
# 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069

bits_a, bits_b = to_bits(h_a), to_bits(h_b)
flipped = sum(1 for x, y in zip(bits_a, bits_b) if x != y)
print(f"{flipped}/{len(bits_a)} bits flipped ({flipped/len(bits_a):.1%})")
# Typically close to 128/256 (~50%) — a single added character
# scrambles roughly half the output, with no discernible relationship
# between "Hello World" and "Hello World!" in the digests above.
~~~

This is the property that makes hashes useless for "fuzzy" or "close enough" comparison — a near-identical input produces a completely unrelated output, by design. If you need similarity detection (e.g., "is this image roughly the same as that one"), you need perceptual hashing (pHash), a different tool entirely, not a cryptographic hash.

### Hex digests vs raw bytes

hashlib functions can give you either the raw bytes (.digest()) or a human-readable hex string (.hexdigest()). Production code almost always uses hex (or base64) for storage and transmission, since raw bytes can contain unprintable characters.

~~~python
import hashlib

h = hashlib.sha256(b"data")
print(h.digest())     # b'\\x3a\\xf9...\\x  raw bytes, not printable safely
print(h.hexdigest())  # '3af9...'  safe to print, log, store in a text column
~~~

### Checking file integrity — the classic first use case

~~~python
import hashlib

def sha256_of_file(path: str, chunk_size: int = 65536) -> str:
    """Hash a file in chunks so multi-GB files never load fully into memory."""
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()

# Compare against a published checksum before trusting a downloaded file
downloaded_hash = sha256_of_file("installer.exe")
published_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
if downloaded_hash != published_hash:
    raise ValueError("Checksum mismatch — file may be corrupted or tampered with")
~~~
`,

  "intermediate-concepts": `
### General-purpose hash families and when to use each

~~~python
import hashlib

data = b"the quick brown fox"

print(hashlib.md5(data).hexdigest())      # 128-bit — BROKEN, integrity/legacy only, never security
print(hashlib.sha1(data).hexdigest())     # 160-bit — BROKEN for collision resistance, legacy only
print(hashlib.sha256(data).hexdigest())   # 256-bit — SHA-2 family, today's safe default
print(hashlib.sha3_256(data).hexdigest()) # 256-bit — SHA-3 (Keccak), structurally different from SHA-2
print(hashlib.blake2b(data).hexdigest())  # modern, very fast, cryptographically strong
~~~

Use SHA-256 (or SHA-3-256, or BLAKE2) for: file checksums, integrity verification, Merkle tree leaves, digital signature digests, deduplication keys, cache keys, content-addressable storage. Never reach for MD5 or SHA-1 in anything security-relevant — they remain fine for non-adversarial checksums (e.g., detecting accidental corruption in a low-stakes cache key) but that is the ONLY acceptable remaining use.

### Merkle trees — hashing at scale

A Merkle tree hashes data in pairs, recursively, until a single "root hash" represents the entire dataset. Changing any single leaf changes every hash above it up to the root — this is how Git verifies repository integrity and how blockchains verify large transaction sets without re-checking every transaction individually.

~~~python
import hashlib

def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def merkle_root(leaves: list[bytes]) -> bytes:
    """Build a Merkle root from leaf data (simplified — no odd-node duplication edge case handling)."""
    layer = [sha256(leaf) for leaf in leaves]
    while len(layer) > 1:
        if len(layer) % 2 == 1:
            layer.append(layer[-1])  # duplicate the last node if odd count
        layer = [sha256(layer[i] + layer[i + 1]) for i in range(0, len(layer), 2)]
    return layer[0]

transactions = [b"alice pays bob 5", b"bob pays carol 2", b"carol pays dave 1", b"dave pays eve 3"]
root = merkle_root(transactions)
print(root.hex())
# A single root hash now represents all 4 transactions.
# Change ANY one transaction and this root changes completely (avalanche effect, propagated).
~~~

Git uses a similar principle: every commit hash is derived from the hash of its tree (file contents + structure), its parent commit's hash, author/committer metadata, and the commit message. That's why a Git commit hash changes if you amend the message, rebase, or change a single byte in any tracked file — the hash IS the content's fingerprint, recursively.

### Why fast general-purpose hashes are WRONG for passwords

SHA-256 is designed to be **fast** — that's exactly right for hashing gigabytes of file data, and exactly wrong for hashing passwords. A modern GPU can compute billions of SHA-256 hashes per second; an ASIC (purpose-built chip) can do orders of magnitude more. If you store sha256(password) in your database and it leaks, an attacker with consumer hardware can try every password in a breach corpus (rockyou.txt has 14 million real passwords) against every stolen hash in seconds to minutes.

~~~python
# NEVER DO THIS — fast hash for password storage
import hashlib
password_hash = hashlib.sha256(b"hunter2").hexdigest()  # WRONG — crackable at billions/sec

# The fix is not a different fast hash — it's a DIFFERENT CATEGORY of algorithm
# designed to be slow, memory-hard, and tunable: bcrypt, scrypt, or Argon2.
~~~

### Password hashing algorithms: bcrypt, scrypt, Argon2

These algorithms are deliberately, tunably **slow** — the opposite design goal of SHA-256 — specifically to make brute-force and dictionary attacks expensive even at massive scale.

- **bcrypt** (1999, Schneier/Provos): based on the Blowfish cipher's key schedule; has a **cost factor** (commonly called "rounds") that exponentially increases the work required — cost 12 means 2^12 = 4,096 internal iterations. Doubling the cost factor roughly doubles the time to hash AND the time to crack. Widely deployed, battle-tested, this platform's own choice.
- **scrypt** (2009, Colin Percival): adds **memory-hardness** — it deliberately requires large amounts of RAM per hash attempt, which makes ASICs and GPUs (which are cheap on compute but relatively expensive to add RAM to at scale) much less of an advantage over a legitimate server doing one hash at a time.
- **Argon2** (2015, winner of the Password Hashing Competition): the modern default. Comes in three variants — Argon2d (maximizes resistance to GPU cracking, but side-channel vulnerable), Argon2i (side-channel resistant, slightly weaker against GPU attacks), and **Argon2id** (hybrid, OWASP's current recommendation for nearly all cases). Tunable across three dimensions: time cost, memory cost, and parallelism.

### Worked example — bcrypt in Python, matching this platform's backend

This mirrors api/app/core/security.py on this platform exactly: hash_password and verify_password, cost factor 12.

~~~python
import bcrypt

def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt at cost factor 12.

    bcrypt.gensalt(rounds=12) generates a fresh random salt AND encodes the
    cost factor into the same string — both travel together in the output,
    so verify_password never needs the salt passed in separately.
    """
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash.

    bcrypt.checkpw performs a constant-time comparison internally, and
    extracts the salt/cost factor from the stored hash string itself.
    """
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        # Malformed hash (e.g. corrupted DB value) — fail closed, not open
        return False

stored = hash_password("correct horse battery staple")
print(stored)
# $2b$12$3k9F2q1z... (algorithm id, cost, salt, and hash all in ONE string)

assert verify_password("correct horse battery staple", stored) is True
assert verify_password("wrong guess", stored) is False
~~~

Two production notes baked into the real code: bcrypt silently ignores any password bytes beyond 72 — the platform enforces a sane max length at the schema/validation layer instead of allowing silent truncation to create a false sense of security; and verify_password fails closed (returns False) on a malformed stored hash rather than raising an unhandled exception that could crash a login endpoint.

### Salts — why every password hash needs one

A salt is random data mixed into the input before hashing, unique per password, so that two users with the identical password ("password123") get completely different stored hashes. This defeats **rainbow tables** — precomputed lookup tables mapping common password hashes back to their plaintexts — because the attacker would need a separate rainbow table per possible salt value, which is computationally infeasible at scale.

The critical operational detail: bcrypt and Argon2 **generate and manage the salt internally** — bcrypt.gensalt() creates a fresh random salt and bakes it directly into the returned hash string, and checkpw/verify extracts it automatically. You should almost never manually generate, store in a separate column, or manage a salt by hand for password hashing — doing so is a common source of self-inflicted bugs (see Anti-Patterns).

### Peppers — an additional secret layer

A pepper is similar to a salt, but it is a single secret value shared across ALL passwords in the system (not unique per password), stored separately from the database — typically in an environment variable, KMS, or vault (see the Secrets Management skill) rather than alongside the hash. The idea: even if the entire password hash database leaks, the attacker still cannot crack anything without also obtaining the pepper from the separate, more tightly-guarded secret store. Peppers are commonly applied by HMAC-ing the password with the pepper as the key, before passing the result into bcrypt/Argon2:

~~~python
import hmac
import hashlib
import bcrypt

PEPPER = b"a-secret-value-from-a-vault-not-the-database"  # never stored with the hash

def hash_password_with_pepper(plain: str) -> str:
    peppered = hmac.new(PEPPER, plain.encode("utf-8"), hashlib.sha256).digest()
    return bcrypt.hashpw(peppered, bcrypt.gensalt(rounds=12)).decode("utf-8")
~~~

Peppers add defense-in-depth against a database-only breach but add operational complexity (pepper rotation is hard — you can't easily "re-pepper" without users re-entering passwords); most applications get most of the benefit from a strong Argon2id/bcrypt configuration alone and add a pepper only when threat modeling specifically calls for it.
`,

  "advanced-concepts": `
### HMAC — keyed-hash message authentication, a distinct primitive from plain hashing

A plain hash (sha256(message)) proves integrity but not authenticity — anyone can compute a hash of anything, including an attacker who intercepts and modifies a message in transit, then recomputes a matching hash. **HMAC** (Hash-based Message Authentication Code) fixes this by mixing in a **secret key**, so only someone who knows the key can produce a valid tag:

~~~python
import hmac
import hashlib

SECRET_KEY = b"shared-secret-known-only-to-sender-and-receiver"

def sign(message: bytes) -> str:
    return hmac.new(SECRET_KEY, message, hashlib.sha256).hexdigest()

def verify(message: bytes, signature: str) -> bool:
    expected = sign(message)
    # hmac.compare_digest is CONSTANT-TIME — see the dedicated subsection below.
    return hmac.compare_digest(expected, signature)

payload = b'{"event": "payment.succeeded", "amount": 4999}'
tag = sign(payload)
assert verify(payload, tag) is True
assert verify(payload, "0" * 64) is False
~~~

HMAC is NOT "hash the message with the key appended" — naively concatenating a secret with a message before hashing (sha256(key + message)) is vulnerable to a **length-extension attack** against Merkle-Damgard hashes (MD5, SHA-1, SHA-2): an attacker who knows hash(key + message) can compute hash(key + message + attacker_data) WITHOUT knowing the key, for certain hash constructions. HMAC's specific double-hashing structure (with inner and outer padding — the "ipad"/"opad" construction from RFC 2104) is specifically designed to be immune to this. Never hand-roll a keyed hash; always use hmac.new() or an equivalent, vetted HMAC implementation.

Real production uses of HMAC:

- **Webhook signature verification.** Stripe, GitHub, Slack, and virtually every webhook provider sign the request body with a shared secret and send the HMAC as a header (e.g. Stripe-Signature). Your endpoint recomputes the HMAC over the raw request body and compares — this proves the webhook actually came from the provider and wasn't forged or tampered with in transit.
- **JWT HS256 signing.** A JWT signed with HS256 is literally HMAC-SHA256 over the header+payload, using a shared secret. See the JWT skill for the full token structure; the security of an HS256 JWT is entirely the security of HMAC plus keeping that shared secret safe (see Secrets Management). This is also why HS256 requires the same secret on every service that verifies tokens, in contrast to RS256's asymmetric public/private split (see OAuth 2.0 / OIDC).
- **API request signing** (AWS SigV4, and many internal service-to-service auth schemes) — each request is HMAC-signed with a shared or derived key so the receiving service can verify the caller holds a valid credential without transmitting the credential itself on every call.

### Timing-attack-safe comparison

Comparing two secrets (a password hash, an HMAC tag, an API key, a session token) with a naive == in most languages short-circuits on the first mismatched byte — meaning the comparison takes measurably less time the earlier a mismatch occurs. Over many network requests, an attacker can use these microsecond timing differences to guess a secret one byte at a time.

~~~python
import hmac

# VULNERABLE — Python's == on strings/bytes is NOT constant time
def verify_token_bad(provided: str, expected: str) -> bool:
    return provided == expected   # timing side-channel: leaks how many leading bytes match

# SAFE — constant-time comparison regardless of where (or if) the mismatch occurs
def verify_token_safe(provided: str, expected: str) -> bool:
    return hmac.compare_digest(provided, expected)
~~~

This matters specifically for comparing: HMAC/webhook signatures, session tokens, API keys, and CSRF tokens (see the CSRF skill). It does NOT apply to bcrypt/Argon2 password verification directly, because bcrypt.checkpw and Argon2's verify functions already perform constant-time comparison internally as part of the library — you should never need to manually diff a password hash byte-by-byte.

### Why bcrypt has a maximum password length

bcrypt's underlying Blowfish-based key schedule only processes the first 72 bytes of input — any bytes beyond that are silently ignored. This means "a 200-character password" and "the first 72 bytes of that password" hash identically in bcrypt, which is rarely what a naive implementer expects. Production systems should either enforce a sane maximum password length at the input-validation layer (as this platform does) or pre-hash the password with SHA-256 before passing it to bcrypt (a common workaround, though it introduces its own subtlety: you're now composing two primitives and must reason about both).

### Cost factor tuning and its tradeoffs

bcrypt's cost factor is exponential: cost 12 is roughly twice as slow as cost 11, four times as slow as cost 10. This creates a genuine capacity-planning decision:

| Cost factor | Approx. hash time (modern server CPU) | Use case |
|-------------|----------------------------------------|----------|
| 10 | ~65ms | Minimum acceptable for most 2020s+ systems |
| 12 | ~250ms | Common production default (this platform's choice) |
| 14 | ~1s | High-security systems, low login-rate tolerance |

The number should be tuned to the slowest acceptable login latency your product tolerates, re-measured on your actual production hardware, and increased over time as hardware gets faster — OWASP recommends periodically re-benchmarking and bumping the cost factor as CPUs improve, migrating existing hashes lazily (re-hash on next successful login) rather than forcing a mass password reset.

### Argon2's three tunable dimensions

Unlike bcrypt's single cost-factor knob, Argon2 exposes time cost (iterations), memory cost (KiB of RAM required per hash), and parallelism (threads) independently — letting you deliberately make an attacker's optimal hardware (a GPU/ASIC farm optimized for compute-per-dollar) far less cost-effective by forcing every single hash attempt to also allocate real memory, which GPUs are comparatively starved for versus a general-purpose server.

### Collisions in practice: birthday bound

For an n-bit hash, a naive brute-force pre-image search costs about 2^n operations, but finding ANY collision (two arbitrary inputs with the same hash, not a specific target) only costs about 2^(n/2) operations due to the birthday paradox. This is why SHA-256 (n=256, birthday bound 2^128) remains comfortably secure, while MD5 (n=128, birthday bound 2^64 — now trivially reachable) and SHA-1 (n=160, birthday bound 2^80, and structurally weaker attacks reaching well below that) are both broken for collision resistance in practice, as demonstrated publicly by the 2017 "SHAttered" attack against SHA-1.
`,

  "internal-working": `
Under the hood, SHA-256 (like most classic hash functions) processes input through a **Merkle-Damgard construction**: the message is padded to a multiple of the block size, split into fixed-size blocks, and fed one block at a time through a **compression function** that mixes the block into a running internal state.

~~~mermaid
flowchart LR
    A["Input message\n(any length)"] --> B["Padding\n(append 1-bit, zeros, length)"]
    B --> C["Split into 512-bit blocks"]
    C --> D1["Block 1"] --> E["Compression function\n(mixes block into state)"]
    C --> D2["Block 2"] --> E
    C --> D3["Block N"] --> E
    Init["Initial hash state\n(fixed constants, 8 x 32-bit words)"] --> E
    E -->|"state after block 1"| E
    E -->|"state after block N-1"| E
    E --> F["Final internal state"]
    F --> G["Output: 256-bit digest"]
~~~

Step by step for SHA-256:

1. **Padding**: the message is padded with a single 1-bit, then zero bits, then a 64-bit encoding of the original message length, so the total length is a multiple of 512 bits. This padding is essential to collision resistance — without it, appending zero bytes to a message could produce colliding hashes.
2. **Initialization**: SHA-256 starts with 8 fixed 32-bit constants (derived from the fractional parts of the square roots of the first 8 primes — chosen this way specifically so nobody can claim the constants were secretly backdoored, a property called "nothing up my sleeve").
3. **Compression, block by block**: each 512-bit block goes through 64 rounds of bitwise operations (rotations, XORs, modular additions) mixing the block's bits into the running state, using 64 more nothing-up-my-sleeve constants (cube roots of primes).
4. **Chaining**: the output state after block 1 becomes the input state for block 2, and so on — this is exactly why a single bit change anywhere in the message cascades: it perturbs the state before every subsequent block's compression, and each compression round itself has strong bit-mixing (the avalanche effect at the algorithm-design level).
5. **Final output**: after the last block, the internal state (256 bits) IS the digest.

SHA-3 (Keccak) uses a structurally different design called a **sponge construction** instead of Merkle-Damgard — data is "absorbed" into a large internal state (1600 bits) in blocks, then the digest is "squeezed" out. NIST specifically wanted a structurally different backup design in case a future attack broke the entire Merkle-Damgard family (as had just happened to MD5/SHA-1) — SHA-3's sponge construction shares no structural weaknesses with SHA-2, so a break of one family doesn't imply a break of the other.

bcrypt's internal working is different again: it repeatedly runs a modified Blowfish key setup (EksBlowfish) 2^cost times over the password and salt, deliberately making the setup itself — not just the final hash — the expensive part, and it's specifically resistant to being sped up on GPUs because Blowfish's key schedule requires unpredictable, data-dependent memory lookups that don't parallelize as cleanly as SHA-256's fixed, predictable operations do.
`,

  architecture: `
Thinking about hashing architecturally means separating it by **where in a system's boundary the hash operation happens**, and matching the right primitive to each boundary.

~~~mermaid
flowchart TB
    subgraph Client["Client / Edge"]
        Upload["File upload"]
        Login["Login form"]
    end
    subgraph API["API layer"]
        Auth["Auth service\n(hash_password / verify_password)"]
        Webhook["Webhook receiver\n(HMAC verify)"]
        Integrity["Upload integrity check\n(SHA-256 checksum)"]
    end
    subgraph Data["Data layer"]
        DB[("Users table\npassword_hash column ONLY\n(never plaintext)")]
        Cache[("Cache / dedup store\nkeyed by SHA-256 of content")]
        Vault[("Secrets vault\npepper, HMAC keys, JWT secret")]
    end
    Login --> Auth
    Auth <--> DB
    Auth -.reads pepper key.-> Vault
    Upload --> Integrity
    Integrity --> Cache
    Webhook -.reads HMAC secret.-> Vault
~~~

Application-layout guidance for a production service:

- **A dedicated security/crypto module** (this platform's api/app/core/security.py is the reference example) is the ONLY place hash_password, verify_password, HMAC signing, and token generation live. No other module should call hashlib.sha256 or bcrypt directly — funnel everything through one audited surface, so an algorithm upgrade (bcrypt → Argon2id, cost 12 → cost 13) is a one-file change.
- **Password hashes live in their own column**, never alongside other user data in a cache or log-friendly table, and are excluded from any API response serialization at the schema layer (Pydantic response models should not even have a field capable of holding it).
- **Pepper and HMAC keys live in a secrets vault or environment-injected secret**, never in the same database as the data they protect — see the Secrets Management skill for the vault architecture this implies.
- **Integrity-hash usage** (file checksums, cache keys, dedup keys) is architecturally a completely separate concern from password hashing and should use a separate, clearly-named utility (checksum_of(), not anything resembling hash_password) to prevent an engineer from accidentally reaching for the wrong one under deadline pressure.
`,

  "data-flow": `
Two representative flows: verifying a login (password hashing) and verifying an inbound webhook (HMAC).

~~~mermaid
sequenceDiagram
    participant U as User
    participant API as Auth API
    participant Sec as security.py
    participant DB as Users table

    U->>API: POST /login {email, password}
    API->>DB: SELECT password_hash WHERE email=?
    DB-->>API: stored bcrypt hash ($2b$12$...)
    API->>Sec: verify_password(password, stored hash)
    Sec->>Sec: bcrypt.checkpw() — extracts salt+cost\nfrom stored hash, recomputes, compares\n(constant-time internally)
    Sec-->>API: True / False
    alt password correct
        API->>Sec: create_access_token(user_id)
        Sec->>Sec: HMAC-SHA256 sign header+payload (JWT HS256)
        Sec-->>API: signed JWT
        API-->>U: 200 OK + JWT
    else password incorrect
        API-->>U: 401 Unauthorized
    end
~~~

~~~mermaid
sequenceDiagram
    participant Provider as Webhook Provider (e.g. Stripe)
    participant API as Webhook Endpoint
    participant Vault as Secrets store

    Provider->>Provider: HMAC-SHA256(shared_secret, raw_body)
    Provider->>API: POST /webhook + header X-Signature: <hmac tag>
    API->>Vault: fetch shared_secret
    Vault-->>API: shared_secret
    API->>API: recompute HMAC-SHA256(shared_secret, raw_body received)
    API->>API: hmac.compare_digest(computed, header value)
    alt signatures match
        API->>API: process event (idempotently, by event id)
        API-->>Provider: 200 OK
    else signatures differ
        API-->>Provider: 400 Bad Request (reject — possible forgery)
    end
~~~

The two diagrams share a structural lesson: in both, the raw secret (password, shared HMAC key) never leaves its origin — only a derived proof (a hash comparison result, a signature match) crosses the boundary. That is the entire point of hashing as a security primitive: prove knowledge or integrity without transmitting or storing the thing itself.
`,

  "production-usage": `
### Choosing and configuring a password hasher

Production teams standardize on ONE password hashing library, wrapped behind an internal module (never called ad hoc), with the algorithm and cost factor set as a reviewed constant:

~~~python
# api/app/core/security.py (this platform's actual pattern)
import bcrypt

BCRYPT_ROUNDS = 12  # tuned to ~250ms on production hardware; reviewed periodically

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False
~~~

Teams choosing Argon2 typically use the argon2-cffi library (Python) or an equivalent vetted implementation in other languages — never a hand-rolled Argon2 — and store the algorithm identifier as part of the hash string itself (both bcrypt and Argon2 hash strings self-describe their algorithm and parameters, e.g. $2b$12$... or $argon2id$v=19$...), which is what makes lazy migration between algorithms possible.

### Config and operational defaults

- **Cost factor as a reviewed, documented constant**, not a magic number — re-benchmarked on real production hardware whenever infrastructure changes, and bumped over time as CPUs get faster (a cost factor "safe" in 2018 is weaker relative to attacker hardware in 2026).
- **Rate limiting and account lockout** on login endpoints as a complementary control — password hashing slows down offline cracking of a stolen database, but does nothing against a live, unthrottled online guessing attack against your login form; that is a separate control (see the OWASP Top 10 skill).
- **Lazy rehashing on login**: when you raise the cost factor or switch algorithms, don't force a mass password reset — verify against the OLD hash on the user's next successful login, then immediately re-hash with the new parameters and update the stored value.
- **Never log passwords or password hashes** — even hashes are sensitive enough to exclude from application logs, since a leaked hash is still a target for offline cracking.
- **HMAC keys and JWT secrets managed as rotatable secrets** (see Secrets Management) — generated with cryptographically secure randomness (Python's secrets module, never random), sized appropriately (32+ bytes for HMAC-SHA256 keys), and rotated on a schedule or on suspected compromise.
`,

  "industry-examples": `
- **This platform's own backend** stores user passwords with bcrypt at cost factor 12 (see api/app/core/security.py) and signs JWTs with HMAC-SHA256 (HS256) using a server-side secret — a textbook example of correctly separating one-way password storage from keyed message authentication for tokens.
- **GitHub, Stripe, Slack, and most SaaS webhook providers** sign every outbound webhook payload with HMAC (typically HMAC-SHA256) using a per-integration shared secret, requiring receivers to verify the signature before trusting the payload — the standard defense against webhook spoofing.
- **Git** (and by extension GitHub, GitLab) identifies every commit, tree, and blob by its SHA-1 hash historically, and is actively migrating toward SHA-256 as the object-naming hash following the 2017 practical SHA-1 collision demonstration — a real-world case of a hash algorithm's security assumptions expiring mid-deployment and requiring an ecosystem-wide migration.
- **Let's Encrypt / Certificate Transparency logs** use Merkle trees (hash trees) so that anyone can cryptographically verify a certificate was included in a public log without downloading the entire log — the same structural idea as the Merkle tree example in Intermediate Concepts, at internet scale.
- **Bitcoin and Ethereum** use SHA-256 (Bitcoin) and Keccak (Ethereum, a SHA-3 variant) respectively for block hashing and Merkle trees of transactions — the "proof of work" mining process is literally a brute-force search for an input that produces a hash meeting a difficulty target, directly exploiting the fact that hash outputs are unpredictable (avalanche effect) so there's no shortcut but trial and error.
- **Password managers (1Password, Bitwarden)** derive an encryption key from your master password using Argon2 (or PBKDF2 historically), specifically so that even 1Password's own servers, which never see your master password, could not feasibly brute-force it from what little metadata is stored.
`,

  "best-practices": `
1. **Never use a general-purpose fast hash (MD5, SHA-1, SHA-256, SHA-3) for password storage.** Use bcrypt, scrypt, or Argon2id — this single rule prevents the most common critical hashing vulnerability in real applications.
2. **Prefer Argon2id for new systems**; bcrypt remains an entirely acceptable, battle-tested choice where Argon2 tooling isn't already in place — don't churn a working, correctly-configured bcrypt setup just to chase novelty.
3. **Let the password-hashing library manage the salt.** bcrypt.gensalt() and Argon2's equivalents generate and embed a fresh random salt per password automatically — do not build your own salt-storage scheme.
4. **Tune the cost factor to real production hardware**, not a default copied from a tutorial — benchmark for an acceptable login latency (commonly 100–300ms) and re-benchmark periodically as hardware improves.
5. **Use hmac.compare_digest (or your language's equivalent) for ANY secret comparison** — tokens, HMAC tags, API keys, CSRF tokens — never a plain == on secret values.
6. **Use HMAC, not a plain hash, whenever you need to prove the sender knows a secret** — webhook verification, signed URLs, request signing. A plain hash proves integrity only; HMAC proves both integrity and authenticity.
7. **Never store or transmit plaintext passwords, even temporarily** — not in logs, not in analytics events, not in error messages, not in a "temporary" debug column.
8. **Enforce a maximum password length at the validation layer** (matching bcrypt's 72-byte limit if using bcrypt) rather than allowing silent truncation to create a false sense of extra security from long passwords.
9. **Rehash lazily on successful login** when upgrading cost factors or algorithms — never force a mass password reset for an internal parameter change.
10. **Rotate HMAC/JWT signing secrets on a schedule and on suspected compromise**, using a secrets manager (see Secrets Management) rather than hardcoded config.
11. **Use SHA-256/SHA-3/BLAKE2 (never MD5/SHA-1) for anything adversarial** — integrity checks on user-supplied or externally-sourced data, digital signature digests, Merkle tree construction.
12. **Rate-limit and lock out login endpoints** as a complementary control to password hashing — hashing protects a stolen database; rate limiting protects a live login form, and you need both.
`,

  "anti-patterns": `
### Using a fast hash for passwords

~~~python
# WRONG — SHA-256 is fast; billions of guesses/sec on a GPU
import hashlib
password_hash = hashlib.sha256(password.encode()).hexdigest()

# RIGHT — bcrypt/Argon2 are deliberately slow and tunable
import bcrypt
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
~~~

### Rolling your own salting scheme

~~~python
# WRONG — manual salt handling, invented concatenation order, fast hash underneath
import hashlib, os
salt = os.urandom(16)
password_hash = hashlib.sha256(salt + password.encode()).hexdigest()
# Now you must ALSO store salt separately, get the concatenation order right
# every time, and you still used a fast hash — none of the actual problem is solved.

# RIGHT — let bcrypt manage salting entirely; salt travels inside the hash string
import bcrypt
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
~~~

### Naive (non-constant-time) secret comparison

~~~python
# WRONG — vulnerable to a timing side-channel attack
def verify_signature_bad(provided: str, expected: str) -> bool:
    return provided == expected

# RIGHT — constant-time comparison
import hmac
def verify_signature_good(provided: str, expected: str) -> bool:
    return hmac.compare_digest(provided, expected)
~~~

### Plain hash instead of HMAC for authenticated messages

~~~python
# WRONG — anyone can compute sha256(message), including a forger who alters
# the message and recomputes; this proves nothing about the sender.
import hashlib
tag = hashlib.sha256(message).hexdigest()

# WRONG variant — naive key-prepending is vulnerable to length-extension attacks
tag = hashlib.sha256(secret_key + message).hexdigest()

# RIGHT — HMAC is specifically designed to resist length-extension and
# requires knowledge of the secret key to produce a valid tag
import hmac, hashlib
tag = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
~~~

### Other classic hashing anti-patterns

- **Truncating a hash "to save space"** — truncating SHA-256 down to, say, 64 bits throws away most of its collision resistance; if you need a shorter identifier, use a hash actually designed for that output size, not a truncated stronger one, unless you've specifically verified the security margin.
- **Comparing hashes with different encodings** (hex vs base64 vs raw bytes) leading to false mismatches that get "fixed" by weakening the comparison logic instead of normalizing the encoding.
- **Hashing without considering Unicode normalization** — the same visual password typed on different keyboards/input methods can produce different byte sequences before hashing if not normalized (NFC/NFKC) consistently, silently locking out legitimate users.
- **Assuming "hashed" means "safe to log or display"** — a password hash is still a sensitive credential-adjacent value; treat it with the same handling discipline as the plaintext for logging/access-control purposes.
`,

  performance: `
### Measure before tuning

~~~bash
python -m timeit -s "import bcrypt" "bcrypt.hashpw(b'password', bcrypt.gensalt(rounds=12))"
# Gives real wall-clock cost on YOUR hardware — never trust a tutorial's number
~~~

For general-purpose hashing, hashlib operations are effectively free at typical payload sizes (microseconds), so performance work there is almost entirely about I/O (streaming large files in chunks, see Beginner Concepts) rather than the hash computation itself.

### The password-hashing performance tension

Password hashing performance is a deliberate TRADEOFF, not something to naively optimize — the entire point is that it costs real CPU time. The ordered decision process:

1. **Set cost/parameters for an acceptable USER-FACING latency first** (e.g., "login must complete in under 300ms at p99 under load"), not for raw throughput.
2. **Benchmark on actual production hardware**, not a developer laptop — cloud CPU performance varies significantly by instance type and can be shared/throttled (CPU steal) under load.
3. **Account for concurrent login load**: bcrypt/Argon2 work is CPU-bound and synchronous — a spike of simultaneous logins (e.g., after a mass password reset email) can saturate CPU and cause cascading latency; consider a queue or rate limit for bulk-verification workflows.
4. **In async frameworks (FastAPI), run bcrypt/Argon2 calls in a thread pool** (e.g., via run_in_executor or an async-aware wrapper), never directly inside an async def — a 250ms bcrypt call executed synchronously inside a coroutine blocks the entire event loop for every other in-flight request (see the Python skill's async section for why this matters).
5. **For Argon2, tune memory cost deliberately** — this is the parameter most responsible for GPU/ASIC resistance; don't reduce it purely to improve server-side throughput without understanding you're trading away the exact protection Argon2 exists to provide.

### General-purpose hash performance numbers (order of magnitude, modern CPU, single core)

| Algorithm | Approx. throughput | Note |
|-----------|--------------------|------|
| MD5 | ~500 MB/s | Fast, but never use for security |
| SHA-1 | ~450 MB/s | Fast, but never use for security |
| SHA-256 | ~250 MB/s (much faster with hardware SHA extensions) | Today's safe general-purpose default |
| SHA-3-256 | ~100–150 MB/s | Slower than SHA-2 in software; structurally different |
| BLAKE2b | ~600+ MB/s | Faster than SHA-2 while remaining cryptographically strong |
| bcrypt (cost 12) | ~4 hashes/sec/core | Deliberately slow — this IS the security property |
`,

  scalability: `
### General-purpose hashing scales trivially

Checksum/integrity hashing is stateless, embarrassingly parallel, and CPU-cheap — it scales horizontally with zero coordination: every server, worker, or client can independently compute the same hash for the same input and always agree, with no synchronization needed. This property is exactly why hashing underlies distributed systems techniques like consistent hashing (for sharding/load balancing) and content-addressable storage — no central coordinator is needed to agree on where data "should" live; the hash IS the address.

### Password hashing scales differently — it's an intentional bottleneck

~~~mermaid
flowchart LR
    LB["Load balancer"] --> A1["Auth service instance 1"]
    LB --> A2["Auth service instance 2"]
    LB --> A3["Auth service instance N"]
    A1 & A2 & A3 -->|"CPU-bound bcrypt/Argon2\n(no shared state needed)"| CPU["Per-instance CPU"]
    A1 & A2 & A3 --> DB[("Shared user DB")]
~~~

Because password hashing is deliberately CPU-expensive per operation, it scales the same way any CPU-bound workload does: more cores/instances behind a load balancer, with no shared state required between them (each verify_password call is independent). The bottleneck table below is the practical planning tool.

| Bottleneck | Answer |
|------------|--------|
| Login endpoint CPU saturation under load spike | Horizontal scaling (more auth service replicas); rate-limit bulk operations that trigger many verifications at once |
| bcrypt/Argon2 blocking an async event loop | Offload to a thread pool / worker process; never run synchronously inline in an async handler |
| Mass password migration (algorithm/cost change) | Lazy rehash-on-login, never a synchronous bulk rehash of the whole user table |
| Webhook signature verification at high throughput | HMAC is cheap (microseconds) — this is never actually a bottleneck; if it appears to be, look elsewhere (network, DB) |
| Merkle tree recomputation over huge datasets | Incremental/partial tree updates (only rehash the changed branch path to the root) rather than full rebuilds |
`,

  security: `
### The core hashing-specific attack surface

- **Using a fast general-purpose hash for password storage** is, by a wide margin, the most common and most severe hashing-related vulnerability found in real audits (OWASP Top 10's "Cryptographic Failures" category, formerly "Sensitive Data Exposure"). See Common Mistakes for the concrete fix pattern.
- **Rainbow table attacks** against unsalted (or improperly salted) password hashes — precomputed tables mapping common passwords to their hash outputs, defeated entirely by a proper per-password salt (see Intermediate Concepts).
- **Timing attacks against naive secret comparison** — see Advanced Concepts' constant-time comparison subsection; applies to HMAC tags, tokens, and API keys, not typically to bcrypt/Argon2 verification (which handle this internally).
- **Length-extension attacks** against naive key+message concatenation with Merkle-Damgard hashes (MD5, SHA-1, SHA-2) — the exact reason HMAC exists as a distinct, purpose-built construction rather than "just hash the secret with the message."
- **Hash collisions used to bypass integrity checks** — historically exploited against MD5 (rogue certificate authority certificates) and SHA-1 (the 2017 SHAttered attack produced two different PDFs with identical SHA-1 hashes); the practical defense is simply never depending on MD5/SHA-1 for anything adversarial.
- **GPU/ASIC-accelerated offline cracking** against a stolen password hash database — mitigated by cost-factor tuning (bcrypt) or memory-hardness (scrypt/Argon2), not eliminated; strong, unique passwords and MFA remain necessary complementary layers.

### How hashing relates to other security skills on this platform

- **Encryption**: the critical, constantly-confused distinction is that encryption is two-way (recoverable with a key) and hashing is one-way (never recoverable) — see that skill's symmetric/asymmetric coverage for the complementary primitive. Use encryption when you need the original value back; use hashing when you only ever need to verify, never retrieve.
- **TLS & HTTPS**: TLS handshakes use hashing (as part of HMAC and key derivation functions like HKDF) to build session keys and verify handshake integrity — hashing is a building block inside TLS, not a replacement for it.
- **Secrets Management**: HMAC keys, JWT signing secrets, and peppers are all secrets that must be generated, stored, and rotated using the practices in that skill — hashing algorithms are only as secure as the keys feeding into HMAC constructions.
- **OAuth 2.0 / OIDC and JWT**: JWT HS256 signing is HMAC under the hood; OAuth refresh tokens and authorization codes are frequently compared using constant-time comparison and sometimes stored hashed (not encrypted) server-side, following the same "never store the recoverable secret if you only need to verify it" logic as password hashing.
- **SQL Injection, XSS, CSRF, OWASP Top 10**: hashing failures (weak password storage, missing webhook signature verification) are concrete, exploitable instances of the broader "Cryptographic Failures" and "Identification and Authentication Failures" categories in the OWASP Top 10 — this page is the primitives-level depth behind those higher-level vulnerability classes.
`,

  testing: `
**pytest** is the standard tool (matching the rest of this platform); hashing logic is unusually easy to test rigorously because it's pure and deterministic (for general-purpose hashes) or has a clear contract (for password hashing).

~~~python
# tests/test_security.py
import pytest
from app.core.security import hash_password, verify_password

def test_hash_password_is_not_plaintext():
    hashed = hash_password("correct horse battery staple")
    assert hashed != "correct horse battery staple"
    assert hashed.startswith("$2b$")   # bcrypt algorithm identifier

def test_verify_password_accepts_correct_password():
    hashed = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", hashed) is True

def test_verify_password_rejects_wrong_password():
    hashed = hash_password("correct horse battery staple")
    assert verify_password("wrong guess", hashed) is False

def test_same_password_produces_different_hashes():
    """Different random salts each call — this is CORRECT behavior, not a bug."""
    h1 = hash_password("same-password")
    h2 = hash_password("same-password")
    assert h1 != h2                                  # different salts
    assert verify_password("same-password", h1) is True
    assert verify_password("same-password", h2) is True

def test_verify_password_handles_malformed_hash_gracefully():
    """Must fail closed, never raise, on a corrupted stored value."""
    assert verify_password("anything", "not-a-real-bcrypt-hash") is False
~~~

### Testing HMAC and constant-time comparison

~~~python
import hmac
import hashlib

def sign(message: bytes, key: bytes) -> str:
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def test_hmac_signature_verifies_correctly():
    key = b"test-secret-key"
    message = b'{"event": "test"}'
    tag = sign(message, key)
    assert hmac.compare_digest(sign(message, key), tag)

def test_hmac_rejects_tampered_message():
    key = b"test-secret-key"
    tag = sign(b'{"amount": 100}', key)
    assert not hmac.compare_digest(sign(b'{"amount": 999}', key), tag)
~~~

### The senior testing doctrine for hashing code

- Never assert on an EXACT hash output in tests unless you're specifically testing a known-answer vector (a published test vector from the algorithm's spec) — bcrypt/Argon2 outputs are salted and intentionally non-reproducible byte-for-byte.
- Test the CONTRACT (verify returns True for correct input, False for incorrect, and fails closed on malformed data), not the internal mechanism.
- Include a specific test proving two hashes of the identical input differ (salting is working) AND both still verify correctly — this catches an entire class of "someone disabled salting to make tests deterministic" regressions.
- For HMAC/webhook verification code, explicitly test the tampered-message-is-rejected path — this is the actual security property, and it's easy to accidentally only test the happy path.
- Never run production-cost-factor bcrypt (cost 12+) in a large unit test suite without care — hundreds of tests each taking 250ms adds minutes to a CI run; consider a lower cost factor specifically for test environments, configured explicitly, never silently.
`,

  debugging: `
### The toolbox, in escalation order

1. **Confirm which category of hash you're looking at.** A stored value starting with $2a$/$2b$/$2y$ is bcrypt; $argon2id$ is Argon2; a bare 32-hex-char string is likely MD5; a bare 64-hex-char string is likely SHA-256. Misidentifying the algorithm is the first debugging mistake to rule out.

~~~python
stored = "$2b$12$3k9F2q1zAbCdEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEFGHI"
print(stored.split("$"))
# ['', '2b', '12', '3k9F2q1zAbCdEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEFGHI']
#        ^algo ^cost  ^22-char salt + 31-char hash, base64-like encoding
~~~

2. **"Login always fails after a migration"** — almost always a double-encoding or truncation bug: check whether the password was accidentally hashed twice (hash of a hash), whether encoding (str vs bytes, utf-8 vs latin-1) differs between hash_password and verify_password, or whether a migration script truncated the stored hash column width (bcrypt hashes are exactly 60 characters — a VARCHAR(50) column silently truncates and breaks every login).

3. **"Same password, different hash — is verify_password broken?"** — no; this is CORRECT bcrypt/Argon2 behavior due to per-call random salting. If you need to confirm two hashes represent the same password, you must call verify_password(candidate, stored) — you can never compare two stored hashes directly for equality of underlying password.

4. **"Webhook signature verification always fails"** — check, in order: are you signing the RAW request body bytes (not a re-serialized/re-parsed JSON, which can reorder keys or change whitespace and produce a different byte sequence)? Is the secret key correctly loaded (common bug: trailing newline from a .env file or secrets manager)? Is the comparison using the same encoding (hex vs base64) as the provider's header format?

5. **"Hash-based cache keys aren't deduplicating as expected"** — check whether you're hashing the raw bytes consistently (e.g., dict/JSON key ordering can change the byte sequence even for "the same" logical data) — hash the canonical/serialized form, not an object whose serialization order isn't guaranteed.

6. **timeit / manual benchmarking** for "logins are slow" — isolate whether the cost is bcrypt itself (expected, tunable) versus an accidental N+1 query or synchronous call blocking elsewhere in the request path; don't assume bcrypt is the culprit without measuring.
`,

  monitoring: `
### What to measure

- **Login endpoint latency (p50/p95/p99)** specifically isolating the hash-verification step — bcrypt/Argon2 cost is a deliberate, expected contributor to this latency; a sudden increase unrelated to a cost-factor change signals a different problem (CPU contention, noisy neighbor).
- **Failed login rate and pattern** — a spike in failed logins from a narrow set of source IPs against many different accounts (credential stuffing) or many attempts against one account (brute force) — both should trigger rate limiting/lockout, and both are detectable independent of the hashing algorithm itself.
- **Webhook signature verification failure rate** — a non-zero baseline is expected (misconfigured secrets, provider key rotation not yet applied on your side); a sudden spike may indicate a forged-webhook attempt or a broken deployment with a stale secret.
- **Password rehash rate**, if implementing lazy migration — track how many users have been upgraded to the new cost factor/algorithm over time to know when migration is effectively complete.

~~~python
import time
import structlog
from prometheus_client import Histogram, Counter

log = structlog.get_logger()

LOGIN_LATENCY = Histogram("auth_login_seconds", "Login handler latency")
LOGIN_FAILURES = Counter("auth_login_failures_total", "Failed login attempts", ["reason"])
WEBHOOK_SIG_FAILURES = Counter("webhook_signature_failures_total", "Rejected webhook signatures", ["provider"])

def login(email: str, password: str) -> bool:
    start = time.perf_counter()
    try:
        user = get_user(email)
        if user is None:
            LOGIN_FAILURES.labels(reason="no_such_user").inc()
            return False
        ok = verify_password(password, user.password_hash)
        if not ok:
            LOGIN_FAILURES.labels(reason="bad_password").inc()
        return ok
    finally:
        LOGIN_LATENCY.observe(time.perf_counter() - start)
        log.info("login_attempt", email=email, elapsed_ms=(time.perf_counter() - start) * 1000)
~~~

### Python-specific things to watch

- **Never log the password or the full hash value** in structured logs — log only metadata (email, timing, outcome), matching this platform's own security.py comment that plaintext passwords are never stored or logged.
- **Alert on a sustained increase in login p99** — it can indicate a cost-factor misconfiguration deployed accidentally, or genuine CPU exhaustion from unthrottled login attempts.
- **Alert on webhook signature failure spikes** distinctly from normal application errors — this is a security-relevant signal, not just a bug, and should route to the same channel as other auth anomalies.
`,

  deployment: `
### Dependency and environment setup

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
# bcrypt ships a compiled C extension — installing in the build stage keeps
# the final image free of build toolchains
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
# JWT_SECRET and PEPPER are injected at runtime, never baked into the image
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: bcrypt's compiled C extension is resolved and cached in the build stage so the runtime image doesn't need a compiler toolchain (smaller attack surface, smaller image); secrets (JWT signing key, pepper) are deliberately absent from the image and injected via environment variables or a mounted secret at deploy time (see Secrets Management) so rotating a secret never requires rebuilding or redeploying the image; non-root user limits blast radius if the container is ever compromised.

### Rollout considerations specific to hashing changes

- **Changing the password hashing algorithm or cost factor is a rolling, backward-compatible change**, never a big-bang cutover: verify_password must be able to recognize and verify OLD-format hashes (check the algorithm prefix) while hash_password (used only for new passwords and lazy rehashes) writes the NEW format.
- **Rotating an HMAC/JWT signing secret requires a grace period**: accept tokens signed by both the old and new secret for a window (dual-secret verification) so in-flight sessions aren't abruptly invalidated the moment the new secret deploys.
- **Never deploy a lowered cost factor "to fix slow logins"** without a documented security review — that is trading away the exact protection bcrypt/Argon2 exists to provide; fix the actual bottleneck (scale out, offload to a thread pool) instead.
`,

  "production-checklist": `
Before a service handling passwords or signed payloads takes real traffic:

- [ ] Passwords are hashed with bcrypt (cost >= 10, commonly 12) or Argon2id — never a general-purpose hash (MD5/SHA-1/SHA-256) or plaintext
- [ ] Salting is handled entirely by the hashing library — no manually-managed salt column or concatenation logic
- [ ] verify_password fails closed (returns False) on malformed/corrupted stored hashes rather than raising an unhandled exception
- [ ] Password hash column is excluded from every API response schema and from application logs
- [ ] Maximum password length is enforced at the validation layer (matching bcrypt's 72-byte limit, if applicable)
- [ ] Cost factor/parameters are benchmarked against real production hardware for an acceptable login latency
- [ ] bcrypt/Argon2 calls in async services run in a thread pool, never synchronously inline in an async handler
- [ ] Rate limiting / lockout is implemented on login endpoints as a complementary control to password hashing
- [ ] All secret/token/signature comparisons use a constant-time function (hmac.compare_digest or equivalent), never ==
- [ ] Webhook and inter-service signatures use HMAC (not a plain hash), verified against the RAW received body bytes
- [ ] HMAC/JWT signing secrets are stored in a secrets vault, never hardcoded or committed, and are rotatable with a grace period
- [ ] A pepper (if used) is stored separately from the password hash database, in a vault or environment-injected secret
- [ ] A lazy rehash-on-login path exists for migrating cost factors or algorithms without forcing a mass reset
- [ ] Monitoring covers login latency (p95/p99), failed-login rate/pattern, and webhook signature failure rate
- [ ] Dependency scanning covers the bcrypt/Argon2/cryptography library versions in CI for known CVEs
`,

  "common-mistakes": `
1. **Using SHA-256 (or MD5/SHA-1) to hash passwords.** Why it happens: SHA-256 is the first hash function most engineers learn, and hashlib.sha256(password) "looks secure" because it produces an unreadable digest — but it's fast, which is precisely wrong for password storage.
2. **Manually implementing a salt with a fast hash instead of using bcrypt/Argon2.** Why it happens: engineers correctly learn "salts are needed" but stop there, not realizing the SLOWNESS of the algorithm is the actually load-bearing property, and salting a fast hash still leaves it brute-forceable at billions of guesses/sec.
3. **Comparing secrets (tokens, HMAC tags) with ==.** Why it happens: == is the natural, invisible default in every language; the timing side-channel it introduces is not something you'll ever notice locally — it only matters against a remote, patient attacker measuring response times.
4. **Using a plain hash instead of HMAC for "signing" a message.** Why it happens: sha256(secret + message) looks like it should work and passes casual testing, but is vulnerable to length-extension attacks against Merkle-Damgard hashes and provides weaker guarantees than the purpose-built HMAC construction.
5. **Truncating stored hash columns (VARCHAR too short).** Why it happens: nobody checks the exact required length (bcrypt = 60 chars, Argon2 strings are longer and variable) until a migration silently truncates existing hashes and locks out every user.
6. **Forcing a mass password reset when upgrading the hashing algorithm.** Why it happens: it seems like the "safe" thing to do, but it's usually unnecessary — a lazy rehash-on-next-login strategy achieves the same end state without the support burden and user friction of an emergency reset.
7. **Assuming "hashed" is equivalent to "safe to log or expose."** Why it happens: the one-way property genuinely does protect against casual exposure, but a leaked hash is still a real attack surface for offline cracking — it deserves the same access-control discipline as the plaintext.
8. **Not rate-limiting the login endpoint because "passwords are hashed anyway."** Why it happens: conflating two DIFFERENT defenses — password hashing protects a STOLEN database from offline cracking; rate limiting protects a LIVE endpoint from online guessing. You need both; one does not substitute for the other.
9. **Running bcrypt/Argon2 synchronously inside an async request handler.** Why it happens: it "just works" in local testing with low concurrency, then silently stalls every other in-flight request in production under real login volume, because the CPU-bound call blocks the single-threaded event loop.
10. **Hand-rolling a "custom" hashing scheme "to be extra secure."** Why it happens: engineers sometimes believe obscurity adds security; in reality, publicly-vetted algorithms (bcrypt, Argon2, SHA-256/3) have survived years of attempted cryptanalysis by the entire security research community — a private invention has survived zero.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| ValueError: Invalid salt | Stored hash is truncated, corrupted, or from a different algorithm than expected | Check column width (bcrypt needs 60 chars); verify migration didn't truncate; fail closed instead of crashing |
| Login always fails after "migration" | Password hashed twice, or encoding mismatch (utf-8 vs latin-1) between write and verify paths | Compare a known test password end-to-end through both hash_password and verify_password; check for double-hashing |
| verify_password returns False for a password you just set | Comparing two stored hashes directly instead of calling verify_password(candidate, stored) | Never compare hash strings for equality across different salt values — always re-verify against the plaintext candidate |
| bcrypt.hashpw raises on passwords with certain characters | Passing a str instead of bytes, or wrong encoding | Always .encode("utf-8") before passing to bcrypt; decode the result the same way |
| Webhook signature never matches | Verifying against re-serialized JSON instead of the raw received body bytes | Capture and hash/HMAC the exact raw request body, before any JSON parsing |
| RuntimeWarning / latency spike under login load | Synchronous bcrypt call blocking an async event loop | Offload to a thread pool (run_in_executor) instead of calling inline in async def |
| MemoryError during Argon2 hashing at scale | Memory-cost parameter set too high for available server RAM under concurrent load | Right-size memory_cost against real concurrent-login capacity planning, not just theoretical max security |
| Two "identical" JSON payloads hash differently | Non-canonical serialization (key order, whitespace) changes the byte sequence before hashing | Hash a canonical serialization (sorted keys, fixed separators) if comparing logical equivalence of structured data |
| hmac.compare_digest raises TypeError | Mixing str and bytes arguments | Ensure both arguments are the same type (both str or both bytes) before comparing |
`,

  faqs: `
**Q: Can a hash be "decrypted" or reversed?**
No — that is the entire point of a one-way function. What people usually mean is "cracked": an attacker with the hash guesses candidate inputs, hashes each one, and checks for a match. Password hashing algorithms exist specifically to make that guessing process slow and expensive per attempt.

**Q: Is SHA-256 secure, or is it "broken" like MD5 and SHA-1?**
SHA-256 (part of the SHA-2 family) remains secure and is today's safe general-purpose default — it has NOT been broken for collision resistance the way MD5 and SHA-1 have. The confusion arises because SHA-256 is still the WRONG choice specifically for password storage, for an entirely separate reason: it's too fast, not because it's cryptographically weak.

**Q: Why can't I just use SHA-256 twice, or with a long random salt, for passwords?**
Because the fundamental problem — speed — is unchanged. Hashing twice (sha256(sha256(x))) or adding a salt doesn't slow down a GPU/ASIC meaningfully; the attacker just computes the same fast function twice per guess. Only algorithms specifically designed with tunable, expensive internal work (bcrypt, scrypt, Argon2) solve this.

**Q: What's the actual difference between hashing and encryption?**
Encryption is two-way and requires a key to reverse (ciphertext → plaintext); hashing is one-way by design and has no reverse operation at all. If you ever find yourself needing to "get the original value back," you need encryption, not hashing — see the Encryption skill.

**Q: Should I use bcrypt or Argon2 for a new project?**
Argon2id is the modern, competition-vetted recommendation (OWASP's current default guidance) and is the right default for greenfield systems. bcrypt remains a completely reasonable, battle-tested choice, especially if it's already in place and correctly configured — there's no urgency to migrate a correctly-configured bcrypt system purely for novelty.

**Q: Do I need to manually add a salt when using bcrypt or Argon2?**
No — both generate and embed a fresh random salt automatically as part of hashpw/hash. Manually managing a salt on top of these libraries is unnecessary and a common source of bugs.

**Q: Why does my webhook signature verification keep failing even though the secret is correct?**
The single most common cause is verifying against a re-serialized/re-parsed version of the JSON body instead of the exact raw bytes received — HMAC operates over exact bytes, and re-serialization can silently reorder keys or change whitespace.

**Q: Is it safe to log a password hash for debugging?**
Treat it with the same caution as the plaintext. A leaked hash is still a legitimate target for offline cracking, and routine logging defeats the purpose of restricting where the value lives.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What are the defining properties of a cryptographic hash function?* Deterministic, fixed-size output regardless of input size, pre-image resistant (one-way), and collision-resistant. A strong answer also mentions the avalanche effect as an emergent design goal.
2. *Why shouldn't you use SHA-256 to hash passwords?* SHA-256 is fast (billions of hashes/sec achievable on a GPU), so a stolen hash database becomes crackable at massive scale; password hashing needs a deliberately SLOW algorithm (bcrypt/scrypt/Argon2), not a faster or "more secure-sounding" fast hash.
3. *What is a salt, and what does it defend against?* Random data unique per password, mixed in before hashing, so identical passwords produce different stored hashes — defeats precomputed rainbow table attacks. Follow-up: bcrypt/Argon2 manage this internally; you rarely implement it by hand.
4. *What's the difference between hashing and encryption?* Hashing is one-way (no reverse function); encryption is two-way (reversible with the correct key). Use hashing when you only ever need to verify a value; use encryption when you need to recover the original.
5. *What does hexdigest() vs digest() give you in Python's hashlib?* digest() returns raw bytes; hexdigest() returns a human-readable hex string representation of those same bytes — used for storage/display since raw bytes may be unprintable.

**Senior:**

6. *Explain HMAC and why it's different from hashing a message with a prepended secret.* HMAC is a specific, standardized keyed construction (inner/outer padding per RFC 2104) designed to resist length-extension attacks that a naive sha256(secret + message) is vulnerable to against Merkle-Damgard hash functions. Strong answers mention the ipad/opad structure and name a real use (webhook verification, JWT HS256).
7. *Walk through the birthday bound and why it matters for choosing a hash's output size.* Finding ANY collision costs roughly 2^(n/2) work for an n-bit hash, not 2^n — this is why 128-bit hashes (MD5) are now practically breakable for collisions and why 256-bit hashes maintain a 2^128 security margin, comfortably infeasible.
8. *How would you migrate a password hashing algorithm or cost factor in production without a mass reset?* Store the algorithm/params inside the hash string (as bcrypt/Argon2 already do); verify_password checks the OLD format on login; on success, transparently rehash with new parameters and update storage ("lazy migration"); new signups always use the new format.
9. *Why is bcrypt resistant to GPU acceleration in a way SHA-256 is not?* bcrypt's Blowfish-derived key schedule requires data-dependent, unpredictable memory access patterns that don't parallelize as cleanly across the thousands of simple cores on a GPU, unlike SHA-256's fixed, highly parallelizable arithmetic operations; scrypt/Argon2 push this further with explicit memory-hardness.
10. *Design a system for verifying inbound webhooks are authentic.* Shared secret provisioned per integration (stored in a vault); provider computes HMAC-SHA256 over the raw request body and sends it in a header; receiver recomputes over the exact raw bytes and compares with a constant-time function; reject on mismatch; consider replay protection (timestamp + nonce) as a complementary control.
11. *What happens if two different files produce the same SHA-256 hash — should you worry?* In practice, no — no SHA-256 collision has ever been found or is expected to be found within any realistic timeframe given its 128-bit birthday-bound security margin; this is categorically different from MD5/SHA-1, where practical collisions have been publicly demonstrated.
12. *How do you securely compare two secret values in your language of choice, and why does it matter?* Use a constant-time comparison function (hmac.compare_digest in Python); naive == short-circuits on the first differing byte, leaking timing information an attacker can use to recover a secret byte-by-byte over many network requests.
`,

  "coding-questions": `
### 1. Implement a minimal, correct password hashing wrapper (tests bcrypt fluency + error handling)

~~~python
import bcrypt

class PasswordHasher:
    """Thin, testable wrapper around bcrypt with a configurable cost factor."""

    def __init__(self, rounds: int = 12):
        if not (4 <= rounds <= 16):
            raise ValueError("bcrypt rounds must be between 4 and 16")
        self.rounds = rounds

    def hash(self, plain: str) -> str:
        if not plain:
            raise ValueError("password must not be empty")
        return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=self.rounds)).decode("utf-8")

    def verify(self, plain: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
        except (ValueError, TypeError):
            return False   # fail closed on malformed input, never raise to the caller

hasher = PasswordHasher(rounds=12)
h = hasher.hash("correct horse battery staple")
assert hasher.verify("correct horse battery staple", h) is True
assert hasher.verify("wrong", h) is False
~~~

Complexity: O(2^rounds) per hash/verify call by design — this is a feature, not a bug, to discuss explicitly in an interview. Follow-ups: add lazy rehash-on-verify support that returns whether the caller should re-persist a new hash; add support for recognizing and verifying legacy hash formats during a migration.

### 2. Build and verify a Merkle tree, and prove membership with a Merkle proof (tests recursive hashing + tree thinking)

~~~python
import hashlib

def h(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def build_layers(leaves: list[bytes]) -> list[list[bytes]]:
    layer = [h(leaf) for leaf in leaves]
    layers = [layer]
    while len(layer) > 1:
        if len(layer) % 2 == 1:
            layer = layer + [layer[-1]]
        layer = [h(layer[i] + layer[i + 1]) for i in range(0, len(layer), 2)]
        layers.append(layer)
    return layers

def merkle_proof(layers: list[list[bytes]], index: int) -> list[bytes]:
    """Return the sibling hashes needed to recompute the root from one leaf."""
    proof = []
    for layer in layers[:-1]:
        sibling_index = index ^ 1  # XOR with 1 flips to the paired sibling
        if sibling_index < len(layer):
            proof.append(layer[sibling_index])
        index //= 2
    return proof

def verify_proof(leaf: bytes, index: int, proof: list[bytes], root: bytes) -> bool:
    current = h(leaf)
    for sibling in proof:
        current = h(current + sibling) if index % 2 == 0 else h(sibling + current)
        index //= 2
    return current == root

leaves = [b"tx1", b"tx2", b"tx3", b"tx4"]
layers = build_layers(leaves)
root = layers[-1][0]
proof = merkle_proof(layers, index=2)   # prove "tx3" is in the tree
assert verify_proof(b"tx3", 2, proof, root) is True
assert verify_proof(b"forged-tx", 2, proof, root) is False
~~~

Complexity: O(n) to build, O(log n) proof size and verification. Follow-ups: handle the odd-leaf-count duplication edge case rigorously (this simplified version has a known subtlety used in some real attacks if not handled carefully); discuss how this generalizes to Certificate Transparency and Git.

### 3. Implement a safe webhook signature verifier (tests HMAC + constant-time comparison)

~~~python
import hmac
import hashlib

def verify_webhook(raw_body: bytes, provided_signature: str, secret: bytes) -> bool:
    """Verify an inbound webhook's HMAC-SHA256 signature against the raw body.

    Must operate on the EXACT raw bytes received (never re-serialized JSON)
    and use a constant-time comparison to avoid a timing side-channel.
    """
    if not provided_signature:
        return False
    expected = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, provided_signature)

secret = b"webhook-shared-secret"
body = b'{"event":"payment.succeeded","amount":4999}'
signature = hmac.new(secret, body, hashlib.sha256).hexdigest()

assert verify_webhook(body, signature, secret) is True
assert verify_webhook(body, "0" * 64, secret) is False
assert verify_webhook(body[:-1], signature, secret) is False   # tampered body
~~~

Complexity: O(n) in message length for the HMAC computation; comparison is constant-time regardless of where a mismatch occurs. Follow-ups: add replay protection (timestamp + nonce, reject signatures older than N minutes); discuss what happens during secret rotation (accept both old and new secret during a grace window).
`,

  "hands-on-labs": `
### Lab 1 — Hash exploration CLI (beginner, ~1h)
Build a CLI tool that takes a string or file path and prints its MD5, SHA-1, SHA-256, and SHA-3-256 digests side by side, plus a demonstration of the avalanche effect (hash the input, then hash it again with one character changed, and report the percentage of output bits that flipped). Skills: hashlib fluency, bit manipulation, the avalanche effect made concrete.

### Lab 2 — Build a password hashing service and prove the salt is working (intermediate, ~2h)
Implement hash_password/verify_password with bcrypt, matching this platform's pattern. Write tests proving: (a) identical passwords produce different stored hashes, (b) both still verify correctly, (c) verify_password fails closed on a malformed hash, (d) a benchmark script measuring hash time at cost factors 10/12/14 on your actual machine. Skills: the entire password-hashing section, viscerally.

### Lab 3 — Webhook receiver with HMAC verification (advanced, ~3h)
Build a small FastAPI endpoint that accepts a webhook, verifies an HMAC-SHA256 signature header against the raw body using a constant-time comparison, rejects tampered or unsigned requests with 400, and processes valid events idempotently (dedup by event id). Write a companion "sender" script that correctly signs requests, and a test that proves a tampered body is rejected. Skills: HMAC, constant-time comparison, idempotency, a real inter-service security pattern.

### Lab 4 — Merkle tree with membership proofs, instrumented and deployed (production, ~3h)
Take Coding Question 2's Merkle tree implementation, wrap it in a small FastAPI service (POST /commit with a list of items returns a root hash and stores the tree; GET /proof/{index} returns a Merkle proof; POST /verify checks a leaf+proof against a stored root), add structured logging and basic metrics, and containerize it with Docker. Load test with many concurrent commits. Skills: applying an internals concept (Merkle trees) as a real, deployable service — the same primitive behind Git and blockchains.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate hashing competence to employers:

1. **Auth service with defense-in-depth password storage** — A small but complete authentication service: bcrypt (or Argon2id) password hashing with a tunable cost factor, lazy rehash-on-login migration support, rate-limited login endpoint, HMAC-SHA256-signed JWTs with a documented secret-rotation grace-period design, and a full pytest suite covering the malformed-hash and tampered-token edge cases. Demonstrates: the complete, correct application of this entire page in one deployable service.

2. **Content-addressable file store** — A service that stores uploaded files keyed by their SHA-256 hash (deduplicating identical content automatically), verifies integrity on retrieval, and exposes a Merkle-tree-backed "prove this file was part of this uploaded batch" endpoint with a verifiable proof. Demonstrates: general-purpose hashing for integrity and deduplication, Merkle tree construction and proofs, a Git/IPFS-style architecture in miniature.

3. **Webhook relay and verifier** — A service that receives webhooks from multiple providers (each with a different secret and signature header format), verifies each using the correct HMAC scheme and constant-time comparison, normalizes them into an internal event format, and forwards them on with the relay's OWN HMAC signature so downstream consumers can trust the relay. Demonstrates: HMAC as a keyed primitive applied twice in one system (inbound verification, outbound signing), secret management across multiple providers.

Each project: full type hints, a pytest suite specifically exercising the security-relevant edge cases (tampering, malformed input, timing-safe comparison), a README documenting the threat model and why each hashing choice was made, and a Docker deployment. The THREAT MODEL documentation is what separates a hashing-competent portfolio project from a toy one.
`,

  "case-studies": `
### LinkedIn 2012: unsalted SHA-1 password breach
LinkedIn's 2012 breach exposed roughly 6.5 million password hashes stored as unsalted SHA-1 — a fast, unsalted general-purpose hash used for password storage. Because SHA-1 is fast and no salt was used, attackers cracked a very large majority of the hashes within days using precomputed tables and GPU brute force, and the same dataset resurfaced and was further cracked in a larger 2016 re-disclosure. Lesson: this is the canonical real-world instance of the exact mistake this page centers on — a fast, unsalted, general-purpose hash used where a slow, salted, password-specific one was required.

### The 2017 SHAttered attack on SHA-1
Google and CWI Amsterdam publicly demonstrated the first practical SHA-1 collision: two different PDF files with identical SHA-1 hashes. This wasn't a theoretical academic result — it directly forced Git, browsers (certificate validation), and countless systems that had trusted SHA-1 for integrity to accelerate migration plans that had been "someday" items for years. Lesson: a hash algorithm's security is not static — cryptanalysis and hardware both improve over time, and "it's always been fine" is not evidence it remains safe; pin choices to actively-maintained, publicly-reviewed standards and track deprecation timelines.

### The Password Hashing Competition and the rise of Argon2 (2013–2015)
Facing a landscape of ad hoc, sometimes weak password hashing choices across the industry, an open academic and industry competition (modeled explicitly on NIST's successful SHA-3 competition) invited public submission and cryptanalysis of candidate password-hashing schemes over two years, culminating in Argon2 winning. Lesson: the strongest available cryptographic primitives in this space were produced by open, adversarial public review, not private invention — directly reinforcing why "roll your own" hashing schemes are a common mistake covered earlier in this page.

### Stripe and the webhook signature standard
Stripe (and subsequently most major SaaS webhook providers) standardized on HMAC-SHA256 signatures over the raw request body, with a documented tolerance window against replay via a timestamp embedded in the signed payload. This became a de facto industry pattern precisely because it composably solves both authenticity (only Stripe knows the shared secret) and integrity (any tampering invalidates the signature) with one well-understood primitive. Lesson: HMAC, correctly applied over raw bytes with constant-time comparison, is the standard, boring, correct answer to "how do I prove this webhook is real" — and boring, standard answers are exactly what you want in security-critical code.
`,

  comparisons: `
| Dimension | SHA-256 / SHA-3 | MD5 / SHA-1 | bcrypt | scrypt | Argon2id |
|-----------|------------------|--------------|--------|--------|----------|
| Design goal | Fast, general-purpose integrity | Fast, general-purpose (legacy) | Deliberately slow, password-specific | Slow + memory-hard | Slow + memory-hard + parallelism-tunable |
| Collision resistance | Strong (no known practical attack) | BROKEN (MD5 trivially; SHA-1 practically, 2017) | N/A (not designed for this use) | N/A | N/A |
| Correct use today | Checksums, integrity, Merkle trees, signatures | Legacy-only, non-adversarial checksums | Password storage | Password storage, KDF | Password storage, KDF (modern default) |
| GPU/ASIC resistance | None (not the design goal) | None | Moderate (data-dependent memory access) | Strong (explicit memory-hardness) | Strong (tunable memory-hardness) |
| Tunability | None — speed is fixed by design | None | One knob: cost factor (rounds) | Three knobs: N, r, p | Three knobs: time, memory, parallelism |
| Maturity / adoption | Universal, decades of scrutiny | Universal but deprecated for security | ~25 years in production, extremely battle-tested | ~15 years, widely used | Newest (2015), but PHC-winner and OWASP default |

**How seniors choose**: for integrity/checksums/signatures/Merkle structures, SHA-256 (or SHA-3/BLAKE2 where extra speed or a structurally different design is wanted) is the default, full stop — MD5/SHA-1 only survive in strictly non-adversarial legacy contexts. For password/secret storage, Argon2id is the default for new systems; bcrypt is an entirely acceptable, lower-friction choice where it's already deployed correctly or where Argon2 tooling isn't yet mature in the target language/ecosystem. scrypt sits between the two historically and remains a reasonable choice, particularly in systems (like some cryptocurrency wallets) that adopted it early. The one choice that is never correct: a fast general-purpose hash for password/secret storage, regardless of which specific one.
`,

  "related-technologies": `
- **Encryption** — the two-way counterpart to hashing's one-way property; understand both to know which one a given problem actually calls for. Study this platform's Encryption skill next if you haven't.
- **TLS & HTTPS** — uses hashing (via HMAC and HKDF key derivation) internally during the handshake and for session integrity; hashing is a building block, not a substitute, for transport security.
- **Secrets Management** — governs how HMAC keys, JWT signing secrets, and peppers are generated, stored, and rotated; hashing algorithms are only as strong as the key material feeding into them.
- **OAuth 2.0 / OIDC** — token comparisons (refresh tokens, authorization codes) often rely on constant-time comparison and hashed server-side storage, echoing password-hashing patterns for a different kind of secret.
- **JWT** — HS256-signed JWTs are literally HMAC-SHA256 in a standardized envelope; this page's HMAC section is the primitive-level depth behind that skill.
- **SQL Injection, XSS, CSRF, OWASP Top 10** — hashing failures (weak password storage, missing signature verification) are concrete instances of the broader vulnerability classes covered in those skills.
- **Git / version control** (general CS knowledge, not a dedicated platform skill) — every commit, tree, and blob is content-addressed by a hash, the most visible everyday application of hashing for most engineers.
- **Blockchain fundamentals** (general CS knowledge) — proof-of-work mining and Merkle-tree transaction batching are both direct, large-scale applications of the properties covered in this page.

On this platform, the natural next pages: **Encryption** → **TLS & HTTPS** → **Secrets Management** → **OAuth 2.0 / OIDC** → **JWT**, each building directly on the primitives introduced here.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check NIST and OWASP publications for anything newer.

- **Argon2id remains OWASP's recommended default** for new password-hashing implementations, with bcrypt listed as an acceptable, still-secure alternative where already in use; OWASP's Password Storage Cheat Sheet is the actively-maintained reference for current parameter recommendations.
- **Git's migration from SHA-1 to SHA-256** for object hashing continues gradually across the ecosystem (support has existed as an opt-in repository format for several years); most existing repositories still default to SHA-1 for compatibility, but new tooling increasingly supports SHA-256 repositories.
- **SHA-3/Keccak adoption remains a "backup standard"** in practice — SHA-2 (SHA-256) remains the overwhelmingly dominant general-purpose choice in new systems, with SHA-3 used where a structurally independent design is specifically desired (e.g., some blockchain ecosystems use Keccak variants).
- **Post-quantum considerations**: hash functions themselves are considered comparatively quantum-resistant relative to asymmetric cryptography (Grover's algorithm only roughly halves the effective security bits, addressed by using longer hash outputs like SHA-384/512 for long-term security margins) — this is a much smaller quantum concern than the one facing RSA/ECC asymmetric encryption (see the Encryption skill for that larger migration story).
- **Passkeys/WebAuthn adoption** is reducing reliance on password hashing altogether for user-facing authentication at major platforms, though password hashing remains essential for the very large base of systems still using password-based auth, and for any secret comparison logic underneath newer auth schemes.

Always verify current OWASP/NIST guidance directly before setting a production cost factor or algorithm choice — these recommendations shift as hardware and cryptanalysis advance.
`,

  "future-roadmap": `
Where hashing-adjacent practice is heading, and what's worth beting career time on:

1. **Argon2id consolidates as the default**, with bcrypt persisting as a still-acceptable legacy choice rather than being actively deprecated — expect most new-system tutorials, frameworks, and default library configurations to converge on Argon2id over the next several years.
2. **Passkeys and WebAuthn reduce (but do not eliminate) password hashing's footprint** in user-facing authentication — understanding WHEN a system still needs password hashing (legacy support, fallback flows, service accounts, admin tooling) remains a durable skill even as passwordless auth grows.
3. **Post-quantum readiness for hash-based constructions** is a comparatively low-urgency item relative to asymmetric cryptography, but hash-based signature schemes (like SPHINCS+) are gaining attention specifically because they're considered quantum-resistant by design — worth being aware of if you work near cryptographic protocol design, even if not immediately actionable for most application engineers.
4. **Git's SHA-256 transition** will likely continue slowly; understanding content-addressable storage and Merkle structures generalizes well beyond Git itself (it's the same idea behind many distributed and blockchain systems), making it worth understanding deeply rather than as Git-specific trivia.
5. **Supply-chain integrity verification** (signed packages, SBOM hashing, container image digests) is an area of active growth as software supply-chain attacks increase — the underlying primitive is exactly the integrity hashing covered in this page, applied at the ecosystem/tooling level.

For your career: the durable bet is understanding the PROPERTIES and the correct-primitive-per-use-case decision (this page's core theme) rather than memorizing any single algorithm's current status — algorithms get deprecated (MD5, SHA-1) or promoted (Argon2) over a career, but "match the primitive's design goal to your actual threat model" never goes stale.
`,

  "cheat-sheet": `
~~~python
import hashlib, hmac, bcrypt

# --- General-purpose hashing (fast, for integrity — NEVER for passwords) ---
hashlib.sha256(b"data").hexdigest()      # 256-bit, today's safe default
hashlib.sha3_256(b"data").hexdigest()    # SHA-3 (Keccak), structurally different
hashlib.blake2b(b"data").hexdigest()     # fast, modern, cryptographically strong
hashlib.md5(b"data").hexdigest()         # BROKEN — legacy checksums only, never security
hashlib.sha1(b"data").hexdigest()        # BROKEN — legacy checksums only, never security

# --- Streaming a large file (constant memory) ---
h = hashlib.sha256()
with open("bigfile.bin", "rb") as f:
    while chunk := f.read(65536):
        h.update(chunk)
digest = h.hexdigest()

# --- Password hashing (slow by design — this platform's exact pattern) ---
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False

# --- HMAC: keyed hash for authenticity (webhooks, JWT HS256) ---
def sign(message: bytes, key: bytes) -> str:
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def verify_signature(message: bytes, key: bytes, provided: str) -> bool:
    return hmac.compare_digest(sign(message, key), provided)   # constant-time!

# --- NEVER do these ---
# password_hash = hashlib.sha256(password.encode()).hexdigest()   # fast hash for password: WRONG
# if provided_sig == expected_sig: ...                            # naive compare: timing attack
# tag = hashlib.sha256(secret + message).hexdigest()               # length-extension vulnerable

# --- Rule of thumb ---
# Integrity / checksums / signatures / Merkle trees  -> SHA-256 / SHA-3 / BLAKE2
# Password / secret storage                          -> bcrypt / scrypt / Argon2id
# Proving sender knows a shared secret                -> HMAC (never plain hash)
# Comparing any secret value                          -> hmac.compare_digest (never ==)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Four defining properties of a cryptographic hash function | Deterministic, fixed-size output, pre-image resistant (one-way), collision-resistant |
| What is the avalanche effect? | A tiny input change (one bit/char) flips roughly half the output bits, unpredictably |
| Why is SHA-256 wrong for password storage? | It's fast — billions of guesses/sec on a GPU makes a stolen hash database crackable at scale |
| What makes bcrypt/Argon2 different from SHA-256? | They are deliberately SLOW and tunable (cost factor / time-memory-parallelism), the opposite design goal |
| What does a salt defend against? | Rainbow tables — precomputed hash-to-password lookup tables; salt makes every password's hash unique |
| Do you need to manually manage salts with bcrypt/Argon2? | No — both generate and embed the salt automatically inside the returned hash string |
| What is a pepper? | A single secret shared across all passwords, stored separately (vault), not in the password database |
| What is HMAC, and how does it differ from a plain hash? | A keyed hash construction proving the sender knows a secret key; a plain hash only proves data integrity, not authenticity |
| Why not just do sha256(secret + message) instead of HMAC? | Vulnerable to length-extension attacks against Merkle-Damgard hashes; HMAC's ipad/opad structure specifically prevents this |
| Why use hmac.compare_digest instead of ==? | == short-circuits on the first mismatched byte, leaking timing information exploitable in a remote timing attack |
| What is the birbirthday bound, and why does it matter? | Finding ANY collision costs ~2^(n/2), not 2^n, for an n-bit hash — why MD5 (128-bit) and SHA-1 (160-bit) are now breakable and SHA-256 (256-bit) is not |
| Encryption vs hashing — the core distinction | Encryption is two-way (reversible with a key); hashing is one-way (no reverse operation exists) |
| How does a Merkle tree work? | Leaves are hashed, then hashed in pairs recursively up to a single root; any leaf change propagates and changes the root |
| What does bcrypt's 72-byte limit mean in practice? | Bytes beyond 72 are silently ignored — enforce a sane max password length at validation instead of relying on extra length |
| What should you do when raising a password hash's cost factor? | Lazily rehash on next successful login — never force a mass password reset |
`,

  mcqs: `
**1. Which property means "you cannot recover the original input from a hash output"?**

A) Determinism  B) Collision resistance  C) Pre-image resistance  D) Avalanche effect

**Answer: C** — pre-image resistance is specifically the one-way property; collision resistance is about two DIFFERENT inputs colliding, not recovering a specific input.

**2. Why is hashlib.sha256(password) the wrong way to store passwords?**

A) SHA-256 produces too short an output  B) SHA-256 is fast, making offline brute-force cheap at scale  C) SHA-256 doesn't support salts  D) SHA-256 is deprecated

A hint: SHA-256 does support being combined with a salt, and is not deprecated — it remains an excellent GENERAL-PURPOSE hash.

**Answer: B** — speed, not deprecation or salt support, is the actual problem; the fix is a deliberately slow algorithm (bcrypt/Argon2), not a salted-but-still-fast one.

**3. What does hmac.compare_digest protect against, that == does not?**

A) Length-extension attacks  B) Rainbow table attacks  C) Timing side-channel attacks  D) Hash collisions

**Answer: C** — == short-circuits on the first mismatch, leaking timing information; compare_digest runs in constant time regardless of where (or if) a mismatch occurs.

**4. Two users have the identical password. Using bcrypt correctly, what should you expect?**

A) Identical stored hashes, since the password is identical  B) Different stored hashes, because each call generates a fresh random salt  C) An error, since bcrypt rejects duplicate passwords  D) Only the first hash is stored, the second is rejected

**Answer: B** — this is correct, intended bcrypt behavior; both hashes still verify correctly against the same plaintext password.

**5. Which is the modern, competition-vetted, OWASP-recommended default for NEW password-hashing systems?**

A) MD5 with a salt  B) SHA-256 with a pepper  C) Argon2id  D) plain bcrypt with cost factor 4

**Answer: C** — Argon2id won the Password Hashing Competition and is OWASP's current default recommendation; bcrypt remains acceptable but Argon2id is the modern first choice for greenfield systems. (Cost factor 4 for bcrypt would also be far too low regardless.)

**6. An attacker forges a webhook payload and recomputes sha256(secret + payload) hoping it matches. What construction specifically defends against this being exploitable via length-extension?**

A) A longer secret key  B) HMAC  C) Base64 encoding the payload first  D) Using SHA-3 instead of SHA-2

**Answer: B** — HMAC's ipad/opad double-hashing structure is specifically designed to resist length-extension attacks that naive secret-prepending is vulnerable to against Merkle-Damgard hash functions; a longer key or switching to SHA-3 (which isn't Merkle-Damgard, incidentally also resistant, but is not the standard/expected fix here) doesn't address the actual construction flaw the way HMAC does.
`,

  "revision-notes": `
**Core properties in 4 lines:** A cryptographic hash is deterministic (same input, same output, always), produces a fixed-size output regardless of input size, is pre-image resistant (one-way — no "unhash" function exists), and is collision-resistant (infeasible to find two inputs with the same output). The avalanche effect — a one-bit input change flips roughly half the output bits — is the visible signature of a well-designed hash.

**The single most important distinction on this page:** general-purpose hashes (SHA-256, SHA-3, BLAKE2) are designed to be FAST, which is exactly right for integrity/checksums/Merkle trees/signatures, and exactly WRONG for password storage — where GPU/ASIC speed turns a stolen hash database into a fast-cracking target. Password hashing algorithms (bcrypt, scrypt, Argon2id) are designed to be deliberately SLOW and, in scrypt/Argon2's case, memory-hard, specifically to make brute-force expensive per guess. bcrypt and Argon2 manage salting internally — you should rarely, if ever, implement your own salt logic.

**Keyed constructions:** HMAC is a distinct primitive from plain hashing — it proves the sender knows a secret key, not just that data is unchanged, and is specifically resistant to length-extension attacks that naive secret+message hashing is vulnerable to. HMAC underlies webhook signature verification and JWT HS256 signing. Any comparison of a secret value (HMAC tag, token, API key) must use a constant-time function like hmac.compare_digest, never a plain ==, to avoid a timing side-channel.

**Real-world structures:** Merkle trees hash data in pairs recursively to a single root, so any leaf change propagates and changes the root — this underlies Git commit integrity, Certificate Transparency logs, and blockchain transaction batching. A pepper is a single secret shared across all passwords, stored separately from the hash database (in a vault), adding defense-in-depth beyond per-password salting.

**Production discipline:** funnel all hashing/HMAC through one audited module (as this platform's api/app/core/security.py does); tune cost factors against real hardware for acceptable login latency; offload bcrypt/Argon2 calls to a thread pool in async services; migrate algorithms lazily on next login rather than forcing a mass reset; rate-limit login endpoints as a complementary control, since password hashing protects a stolen database, not a live guessing attack.
`,

  "learning-roadmap": `
A realistic path to hashing fluency (adjust pace to your background):

**Week 1 — Foundations.** Beginner Concepts + Lab 1 (hash exploration CLI). Read the avalanche-effect worked example until you can reproduce it from memory. Milestone: explain determinism, fixed-size output, one-way-ness, and collision resistance to someone else without notes.

**Week 2 — The password-hashing split.** Intermediate Concepts: why fast hashes are wrong for passwords, bcrypt/scrypt/Argon2, salts and peppers. Lab 2 (build and test a bcrypt-based password service). Milestone: implement hash_password/verify_password matching this platform's own security.py pattern from memory.

**Week 3 — Keyed constructions and safe comparison.** Advanced Concepts: HMAC, length-extension attacks, constant-time comparison. Lab 3 (webhook receiver with HMAC verification). Milestone: explain WHY sha256(secret + message) is wrong and HMAC is right, with the length-extension attack as evidence.

**Week 4 — Internals, structures, and production.** Internal Working, Architecture, Data Flow; skim Merkle trees in Intermediate Concepts again with fresh eyes. Lab 4 (Merkle tree service). Milestone: trace, from memory, what happens end to end during a login (hash comparison) and a webhook verification (HMAC comparison).

**Week 5 — Interview polish + first real project.** Interview/Coding Questions sections; start Real Project 1 (auth service with defense-in-depth password storage). Milestone: answer the birthday-bound, HMAC-vs-plain-hash, and lazy-migration questions out loud, unprompted.

Then continue to **Encryption** on this platform to complete the one-way/two-way picture, followed by **TLS & HTTPS**, **Secrets Management**, **OAuth 2.0 / OIDC**, and **JWT** — every one of those pages leans directly on the primitives built here.
`,

  "official-docs": `
- [Python hashlib documentation](https://docs.python.org/3/library/hashlib.html) — the standard library's general-purpose hashing interface (SHA-2, SHA-3, BLAKE2, and legacy MD5/SHA-1).
- [Python hmac documentation](https://docs.python.org/3/library/hmac.html) — HMAC implementation and the crucial compare_digest constant-time comparison function.
- [PyPI: bcrypt](https://pypi.org/project/bcrypt/) — the Python bcrypt bindings used by this platform's own backend.
- [PyPI: argon2-cffi](https://pypi.org/project/argon2-cffi/) — the standard Python bindings for Argon2.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — the actively-maintained, authoritative source for current algorithm and parameter recommendations; check this before setting a production cost factor.
- [NIST FIPS 180-4](https://csrc.nist.gov/publications/detail/fips/180/4/final) (SHA-2) and [FIPS 202](https://csrc.nist.gov/publications/detail/fips/202/final) (SHA-3) — the formal standards documents.
- [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104) — the original HMAC specification.
`,

  books: `
- **Serious Cryptography, 2nd ed.** — Jean-Philippe Aumasson. The single best modern, practitioner-friendly deep dive into hash functions, HMAC, and password hashing, written by an Argon2/BLAKE2 co-designer.
- **Cryptography Engineering** — Ferguson, Schneier, Kohno. The classic, rigorous treatment of applied cryptography design decisions, including why constructions like HMAC exist the way they do.
- **The Web Application Hacker's Handbook, 2nd ed.** — Stuttard & Pinto. Grounds hashing failures (weak password storage, forgeable signatures) in real, exploitable application-security scenarios — the attacker's-eye view that complements this page's defender's-eye view.
- **Real-World Cryptography** — David Wong. Approachable, current coverage of hash functions, MACs, and password hashing aimed at working engineers rather than cryptographers.
- **Applied Cryptography, 2nd ed.** — Bruce Schneier. Older but historically foundational — Schneier co-designed bcrypt, and this book is where much of the field's vocabulary originates.
`,

  blogs: `
- **OWASP Cheat Sheet Series** (cheatsheetseries.owasp.org) — the Password Storage and Cryptographic Storage cheat sheets are the highest-signal, most actively maintained practical guidance available.
- **Troy Hunt's blog** (troyhunt.com) — the operator of Have I Been Pwned writes extensively and concretely about real-world password hashing failures from actual breaches.
- **Latacora's "Cryptographic Right Answers"** — a widely-cited, opinionated, no-nonsense guide to which primitive to use for which job, including hashing and password storage.
- **Filippo Valsorda's blog** (filippo.io) — a Go/cryptography maintainer writing clear, technically deep posts on cryptographic primitives and their real-world pitfalls.
- **Cloudflare blog** (blog.cloudflare.com) — frequently covers hashing and cryptography at internet scale (TLS internals, certificate transparency Merkle logs).
`,

  "research-papers": `
- **"HMAC: Keyed-Hashing for Message Authentication"** (Bellare, Canetti, Krawczyk — the basis of RFC 2104, 1996) — the original paper defining HMAC and proving its security properties relative to plain hashing.
- **"Argon2: the memory-hard function for password hashing and other applications"** (Biryukov, Dinu, Khovratovich — the Password Hashing Competition winning submission, 2015) — the primary source for Argon2's design rationale.
- **"A Future-Adaptable Password Scheme"** (Provos & Mazières, 1999) — the original bcrypt paper, explaining the EksBlowfish-based design and the cost-factor mechanism.
- **"Stronger Key Derivation via Sequential Memory-Hard Functions"** (Percival, 2009) — the scrypt paper, introducing memory-hardness as a defense against ASIC/GPU acceleration.
- **"Finding Collisions in the Full SHA-1"** (Wang, Yin, Yu, 2005) and the later **"The first collision for full SHA-1"** ("SHAttered", Stevens et al., 2017) — the theoretical break and its eventual practical demonstration.
- This topic is well-served by foundational papers rather than being thin — if you read only two, read the HMAC paper and the Argon2 paper; together they cover the two families (keyed authentication, password hashing) this page treats as most important.
`,

  videos: `
- **Computerphile — "Hashing Algorithms and Security"** and related Computerphile hashing videos — accessible, visual explanations of hash function properties for building initial intuition.
- **"Passwords and Password Storage" talks from OWASP AppSec conferences** (search OWASP's YouTube channel) — practitioner-level talks specifically on bcrypt/Argon2 adoption in real systems.
- **Jean-Philippe Aumasson's cryptography conference talks** (search his name at various security conferences) — the Serious Cryptography author explaining hash function and password-hashing design decisions directly.
- **Ben Eater / low-level cryptography explainer channels** — useful for visualizing the block-by-block compression-function mechanics behind SHA-2's Merkle-Damgard construction.
- **DEF CON / Black Hat talks on password cracking** (search "GPU password cracking DEF CON") — seeing real cracking rig throughput against fast vs. slow hashes makes the core lesson of this page viscerally concrete.
`,

  "github-repos": `
- [pyca/bcrypt](https://github.com/pyca/bcrypt) — the Python bcrypt bindings used directly by this platform's backend; read the README for the exact API contract.
- [P-H-C/phc-winner-argon2](https://github.com/P-H-C/phc-winner-argon2) — the reference Argon2 implementation from the Password Hashing Competition itself.
- [pyca/cryptography](https://github.com/pyca/cryptography) — the broader Python cryptography library (HMAC, hashes, and much more), used alongside bcrypt in most real Python backends.
- [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) — the source repository for the Password Storage and Cryptographic Storage cheat sheets referenced throughout this page.
- [openssl/openssl](https://github.com/openssl/openssl) — the reference implementation underlying most languages' hash/HMAC primitives at the C level; browsing crypto/sha and crypto/hmac is educational even without deep C fluency.
- [git/git](https://github.com/git/git) — see how commit/tree/blob hashing is implemented in a system every engineer already uses daily; the SHA-256 transition work is a live example of a hash-algorithm migration.
- [satwikkansal/wtfpython](https://github.com/satwikkansal/wtfpython)-style "gotchas" repos for the language you use — useful for finding real, surprising bugs around encoding/hashing edge cases (string vs bytes, Unicode normalization) referenced in Anti-Patterns.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Property fluency*: write a script proving all four hash properties on SHA-256 — determinism (hash twice, compare), fixed output size (hash inputs from 1 byte to 100MB, confirm constant digest length), one-wayness (attempt and fail to reverse a hash of a known short input by brute force over a small space, to feel the cost curve), avalanche effect (the worked example from Beginner Concepts, generalized to 100 random one-character changes and averaged).
2. *Password hashing*: implement hash_password/verify_password with bcrypt; then benchmark cost factors 8 through 14 on your own machine and produce a table of hash time vs. cost factor; then implement lazy rehash-on-login migration logic.
3. *HMAC*: implement a webhook signer and verifier; then deliberately implement the naive sha256(secret + message) alternative and write a test (or research writeup) demonstrating conceptually why it's vulnerable to length extension, even if you don't fully implement the attack.
4. *Constant-time comparison*: write both a naive == comparison function and a hmac.compare_digest version; use timeit to attempt to measure a timing difference on deliberately crafted "almost right" vs "very wrong" guesses against the naive version, and discuss why this is hard to observe locally but real over a network.
5. *Merkle trees*: implement the tree, membership proofs, and verification from Coding Question 2; extend it to support efficient updates (rehashing only the path from a changed leaf to the root, not the whole tree).
6. *Migration engineering*: design (in writing, or in code with a fake DB) a full lazy-migration plan for moving a user table from SHA-256(password) — the WRONG legacy state — to bcrypt, without forcing a mass reset. This is a realistic, high-value senior-engineer exercise.

External sets: OWASP's Password Storage Cheat Sheet has worked recommendations to implement against; CryptoHack (cryptohack.org) has hands-on, gamified cryptography challenges including hash-function-focused ones; Cryptopals (cryptopals.com) has a dedicated set on hash length-extension attacks that directly deepens the HMAC section of this page.
`,

  "architecture-diagram": `
The reference architecture for hashing usage across a production backend — the shape this platform's own auth and webhook handling follows:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> LB["Load balancer / API gateway"]
    LB --> API1["Auth + API service\n(bcrypt hash_password/verify_password)"]
    LB --> Hook["Webhook receiver\n(HMAC-SHA256 verify, constant-time compare)"]
    API1 --> DB[("Users table\npassword_hash column only")]
    API1 -->|"HMAC-SHA256 sign"| JWT["Issued JWT (HS256)"]
    Hook -.reads shared secret.-> Vault[("Secrets vault\nHMAC keys, pepper, JWT secret")]
    API1 -.reads pepper/JWT secret.-> Vault
    API1 --> Upload["Upload/integrity service\n(SHA-256 checksum)"]
    Upload --> Store[("Content-addressable store\nkeyed by SHA-256 of content")]
    subgraph Observability
        Metrics["login latency, failed-login rate,\nwebhook signature failure rate"]
    end
    API1 -.metrics.-> Observability
    Hook -.metrics.-> Observability
~~~

Every box maps directly to a section of this page: the auth service is Intermediate/Advanced Concepts and Production Usage; the webhook receiver is the HMAC subsection of Advanced Concepts and Data Flow's second diagram; the content-addressable store is Intermediate Concepts' Merkle-tree and general-purpose-hashing coverage; the vault is the Secrets Management skill's territory, referenced throughout Security.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Hashing))
    Core properties
      Deterministic
      Fixed-size output
      Pre-image resistant
      Collision resistant
      Avalanche effect
    General-purpose hashes
      MD5 (broken)
      SHA-1 (broken)
      SHA-256 / SHA-2
      SHA-3 / Keccak
      BLAKE2
      Uses: checksums, integrity, Merkle trees, signatures
    Password hashing
      Why fast hashes are wrong
      bcrypt (cost factor)
      scrypt (memory-hard)
      Argon2 / Argon2id
      Salts
      Peppers
    Keyed constructions
      HMAC
      Length-extension attacks
      JWT HS256
      Webhook signing
    Safe comparison
      Constant-time compare
      Timing attacks
    Structures
      Merkle trees
      Git commit hashes
      Blockchain
      Certificate Transparency
    Production
      security.py pattern
      Lazy migration
      Cost-factor tuning
      Rate limiting + hashing together
    Related skills
      Encryption
      TLS and HTTPS
      Secrets Management
      OAuth 2.0 / OIDC
      JWT
~~~
`,
};

export default hashing;
