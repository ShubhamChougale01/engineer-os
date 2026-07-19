import type { SkillContent } from "../types";

/**
 * Encryption — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const encryption: SkillContent = {
  overview: `
Encryption is the process of transforming readable data (plaintext) into an unreadable form (ciphertext) using a mathematical algorithm and a secret key, such that only someone holding the correct key can reverse the transformation and recover the original data. It is the single most important tool for confidentiality in computing: it is what stops a stolen laptop, a leaked database dump, or a wiretapped network connection from handing an attacker your data in usable form.

For an AI engineer, encryption shows up constantly and in ways that are easy to get subtly wrong: encrypting API keys and model weights at rest, terminating and re-establishing TLS between microservices that ship prompts and completions, storing user conversation history so that even a database breach doesn't leak it, and building retrieval-augmented systems where sensitive documents must remain encrypted until the exact moment a permitted query needs them. Getting this wrong is not an abstract risk — mis-implemented encryption (weak modes, hardcoded keys, reused nonces) is treated as a critical finding in every serious security review and is a frequent root cause of real breaches.

The most important mental model to internalize on day one: encryption is reversible. Give me the ciphertext and the right key, and I get back the exact original plaintext, byte for byte. This is fundamentally different from hashing, which is one-way by design — see the **Hashing** skill for the full contrast, because confusing the two (e.g., "encrypting" passwords instead of hashing them) is one of the most common and most damaging mistakes in the industry, and one of the most common interview trick questions.

Key characteristics of modern encryption: it comes in two families — symmetric (one shared secret key, fast, used for bulk data) and asymmetric/public-key (a mathematically linked key pair, slower, used for key exchange and signatures); real systems almost always combine both (hybrid encryption); and modern encryption is not just "make it unreadable" — it also must be authenticated, meaning the recipient can detect if the ciphertext was tampered with in transit. An encryption scheme without authentication is considered broken by default in 2026.
`,

  history: `
Encryption predates computers by millennia — the Caesar cipher (simple letter-shifting) protected Roman military communications, and cryptography remained largely an art of clever substitution and transposition until the 20th century turned it into a science built on hard mathematical problems.

| Year | Milestone |
|------|-----------|
| ~50 BCE | Caesar cipher — simple substitution, used for military messages |
| 1553 | Vigenere cipher — polyalphabetic substitution, resisted simple frequency analysis for centuries |
| 1918–1945 | Enigma machine — German electromechanical rotor cipher; broken by Polish and then British codebreakers (Turing, Bletchley Park), arguably shortening WWII |
| 1949 | Claude Shannon publishes "Communication Theory of Secrecy Systems" — the mathematical foundation of modern cryptography (confusion, diffusion, perfect secrecy) |
| 1976 | Diffie and Hellman publish "New Directions in Cryptography" — introduces public-key cryptography and the Diffie-Hellman key exchange, solving the key-distribution problem for the first time |
| 1977 | Data Encryption Standard (DES) adopted as a US federal standard — the first widely deployed symmetric block cipher; also 1977: Rivest, Shamir, and Adleman publish RSA, the first practical public-key cryptosystem |
| 1990s | DES's 56-bit key becomes crackable by brute force; Triple DES (3DES) used as a stopgap |
| 1997–2000 | NIST runs an open, international competition for a DES successor |
| 2001 | Rijndael (designed by Belgian cryptographers Joan Daemen and Vincent Rijmen) wins and is standardized as the Advanced Encryption Standard (AES), NIST FIPS 197 |
| 2007 | NIST standardizes Galois/Counter Mode (GCM) in SP 800-38D — AES-GCM becomes the modern default for authenticated symmetric encryption |
| 2008 | ChaCha20 stream cipher published (Daniel J. Bernstein); later paired with Poly1305 as an AEAD alternative to AES-GCM, especially strong on devices without AES hardware acceleration |
| 2013+ | Signal Protocol (Moxie Marlinspike, Trevor Perrin) combines X3DH key agreement and the Double Ratchet to give messaging apps forward secrecy and post-compromise security |
| 2018 | TLS 1.3 (RFC 8446) finalized — drops legacy ciphers, mandates AEAD modes (AES-GCM, ChaCha20-Poly1305), removes RSA key exchange in favor of ephemeral Diffie-Hellman |
| 2024 | NIST finalizes the first post-quantum cryptography standards: FIPS 203 (ML-KEM, based on CRYSTALS-Kyber) for key exchange and FIPS 204/205 (ML-DSA, SLH-DSA) for signatures, beginning the industry's migration away from RSA/ECC for long-lived secrets |

The throughline: cryptography moved from "clever secrets about the algorithm" to Kerckhoffs's principle — the algorithm should be public and scrutinized by the whole world; only the key stays secret. Every algorithm on this page (AES, RSA, ECC) is public, standardized, and has survived decades of attempted attacks. That public scrutiny is precisely why you should never invent your own — see Common Mistakes.
`,

  "why-it-exists": `
Before modern encryption, protecting data in a computer system meant relying entirely on **access control**: firewalls, file permissions, physical security of the machine room. That model has one fatal weakness — it only works as long as the perimeter holds. The moment a disk is stolen, a backup tape is lost, a network is tapped, or a database is exfiltrated, the data itself is handed to the attacker in fully readable form. Access control protects the door; it does nothing once someone is inside or the box has physically left the building.

Encryption exists to make the data defend itself, independent of where it ends up. A properly encrypted database dump is worthless to a thief without the key. A properly encrypted network packet is meaningless to anyone tapping the wire. This is the core shift: from "trust the perimeter" to "trust the math," which is a strictly stronger guarantee because it holds even when the perimeter fails — and perimeters always eventually fail.

The second gap encryption fills, specifically through public-key cryptography, is the **key distribution problem**: if two parties who have never met need to establish a shared secret over a network that an adversary can observe, how do they do it without the adversary learning the secret too? Before 1976 this had no good general answer — you needed a pre-shared secret delivered out of band (a courier, a physical meeting). Diffie-Hellman and RSA solved this mathematically, which is why every HTTPS connection you make to a server you've never contacted before can still establish a private channel in milliseconds. This is covered in depth in Hybrid Encryption below and in the **TLS & HTTPS** skill.
`,

  "problem-it-solves": `
Encryption concretely removes these pains:

- **Data breach blast radius**: if attackers exfiltrate an encrypted database or backup, they get ciphertext, not customer data — provided the encryption keys were not also compromised (which is why key management, not the cipher, is usually the real weak point; see the **Secrets Management** skill).
- **Network eavesdropping**: without encryption, anyone on the same Wi-Fi, a compromised router, or an ISP can read every request and response in plaintext. TLS (built on the primitives in this page) makes this practically impossible for a passive attacker.
- **Insider and physical theft risk**: full-disk encryption (BitLocker, FileVault, LUKS) means a stolen laptop or a decommissioned hard drive that wasn't wiped correctly still doesn't leak data.
- **Regulatory and contractual requirements**: HIPAA, PCI-DSS, GDPR, and SOC 2 all mandate encryption of sensitive data at rest and in transit as a baseline control; a breach without encryption in place often carries far larger legal and financial consequences than the same breach with it.
- **Trust between parties who've never met**: hybrid encryption (below) lets a browser and a server that have zero prior relationship establish a secure channel in one handshake.

What encryption deliberately does **not** solve:

- **Integrity of the wrong key**: encryption protects confidentiality; if the key itself is stolen, weakly generated, or hardcoded in source control, encryption provides zero protection — the ciphertext becomes trivially reversible. Key management is arguably harder than the cryptography itself.
- **Availability**: encryption does nothing against denial-of-service, and in fact adds a new failure mode — lose the key and you've permanently destroyed your own data (this is what ransomware weaponizes).
- **Authentication of identity by itself**: knowing a message was encrypted with some key doesn't tell you WHO holds that key unless it's tied to a certificate/PKI system (see TLS & HTTPS) or a signature scheme.
- **Protecting data while it's being actively computed on**: traditional encryption only protects data at rest and in transit; data must be decrypted to be processed, which is exactly the gap that confidential computing (encryption-in-use) is emerging to close — see Advanced Concepts.
- **Password storage**: encryption is the wrong tool for passwords entirely — you want one-way hashing (see the **Hashing** skill), because a reversible scheme means anyone with the key (including an insider or a future breach of the key) can recover every user's password in plaintext.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between symmetric and asymmetric encryption, and explain precisely why real systems use both together (hybrid encryption).
2. Explain why ECB mode is broken and identify it from ciphertext patterns (the "ECB penguin" argument) without needing to see the plaintext.
3. Use AES-GCM correctly in Python: generate a proper key, generate a unique nonce per encryption, and verify the authentication tag before trusting any decrypted output.
4. Explain what "authenticated encryption" (AEAD) means and why unauthenticated encryption is considered insecure by modern standards.
5. Explain envelope encryption and why every major cloud KMS (AWS KMS, GCP Cloud KMS, Azure Key Vault) is built around it.
6. State clearly, without hesitation, the difference between encryption (reversible, needs a key), hashing (one-way, no key to recover original), and encoding (reversible, no key at all — e.g., Base64 is not encryption).
7. Identify at least five classic encryption implementation mistakes (rolling your own crypto, ECB mode, hardcoded keys, reused IVs/nonces, missing authentication) and explain the concrete exploit each one enables.
8. Describe the difference between encryption at rest, in transit, and in use, and name the technology associated with each.
9. Explain the key-distribution problem and how asymmetric cryptography (and Diffie-Hellman specifically) solves it.
10. Answer senior-level interview questions on AES modes, RSA vs ECC tradeoffs, and how TLS combines both families of cryptography.
`,

  prerequisites: `
- **Required**: basic programming literacy (any language) and comfort with the idea of a function that transforms input to output. Nothing else — this page starts from zero cryptography background.
- **Helpful**: basic Python (see the **Python** skill) since all worked code examples use the Python "cryptography" library, the industry-standard, well-audited choice.
- **Helpful**: basic number theory intuition (what a prime number is, what "hard to reverse" means computationally) makes RSA and elliptic-curve sections click faster, but is not required — the page explains the concepts, not the underlying number theory proofs.
- **Strongly recommended pairing**: the **Hashing** skill (the critical reversible-vs-one-way distinction), the **TLS & HTTPS** skill (encryption's most important real-world application), and the **Secrets Management** skill (where the keys that make encryption meaningful actually have to live).

Dependency links on this platform: **Hashing** and **Encryption** are siblings that should be read close together → **TLS & HTTPS** builds directly on both → **Secrets Management** covers what happens to the keys → **OWASP Top 10** ties all of Security together at the application-risk level.
`,

  "beginner-concepts": `
### The core idea: plaintext, key, ciphertext

Every encryption scheme has three ingredients: plaintext (the original readable data), a key (a secret value only authorized parties know), and an algorithm (public, standardized, scrutinized by the world) that combines them into ciphertext. Decryption runs the inverse algorithm with the same (or a mathematically related) key to recover the plaintext exactly.

~~~python
from cryptography.fernet import Fernet

# Fernet is a high-level, hard-to-misuse symmetric encryption recipe built
# on AES-128 in CBC mode plus HMAC for authentication. Great starting point.
key = Fernet.generate_key()          # 32 random bytes, base64-encoded
box = Fernet(key)

token = box.encrypt(b"transfer $500 to account 1234")
print(token)                          # unreadable, authenticated ciphertext

plaintext = box.decrypt(token)        # raises if key is wrong OR token was tampered with
print(plaintext)                      # b"transfer $500 to account 1234"
~~~

The single most important beginner fact: **without the key, the ciphertext is (by design) computationally useless**. There is no "master password" or algorithmic trick to reverse it — the security rests entirely on the key staying secret and the algorithm being sound.

### Symmetric encryption: one key, both directions

Symmetric encryption uses the SAME key to encrypt and decrypt. It is fast (built for bulk data — files, database columns, network payloads) but requires both parties to already share that secret key safely. AES (Advanced Encryption Standard) is the near-universal choice: a block cipher that encrypts data 16 bytes (128 bits) at a time, with keys of 128, 192, or 256 bits.

~~~python
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

key = AESGCM.generate_key(bit_length=256)   # 256-bit symmetric key
aesgcm = AESGCM(key)
nonce = os.urandom(12)                      # 96-bit nonce — MUST be unique per key

ciphertext = aesgcm.encrypt(nonce, b"secret payload", associated_data=None)
recovered = aesgcm.decrypt(nonce, ciphertext, associated_data=None)
assert recovered == b"secret payload"
~~~

### Why ECB mode is broken — the "ECB penguin"

A block cipher like AES only tells you how to scramble ONE 16-byte block. A "mode of operation" tells you how to chain many blocks together for a real message. Electronic Codebook (ECB) mode is the naive approach: split the plaintext into blocks and encrypt each one independently with the same key.

The fatal flaw: **identical plaintext blocks always produce identical ciphertext blocks**. If your input has repeating structure — like the flat color regions of a bitmap image — ECB preserves that structure in the ciphertext. The famous demonstration: take a bitmap image of a penguin (a well-known logo/character used in cryptography teaching materials), encrypt the raw pixel data with AES in ECB mode, and view the resulting ciphertext bytes as an image. You still clearly see the penguin's outline — the "encrypted" image is visibly recognizable — because same-colored regions (identical blocks) map to identical ciphertext blocks in the same positions. Meanwhile, the SAME image encrypted with a proper mode (CBC or GCM) looks like uniform random noise. This single image is the most effective one-picture argument in all of applied cryptography for why mode of operation matters as much as the cipher itself.

Rule to memorize: never use ECB mode, for anything, ever. Always use an authenticated mode — AES-GCM is the default recommendation in 2026.

### Encoding is not encryption

A very common beginner (and surprisingly common professional) mistake: treating Base64 as a security measure. Base64 is a reversible ENCODING — it turns binary data into printable text so it survives being pasted into JSON, URLs, or email. It uses NO key. Anyone, including an attacker, can decode Base64 instantly with zero secret knowledge.

~~~python
import base64

secret = b"my password is hunter2"
encoded = base64.b64encode(secret)
print(encoded)                       # looks scrambled...
print(base64.b64decode(encoded))     # ...but reverses with NO key at all — not encryption!
~~~

If you see a system storing "encrypted" data that's just Base64, it is storing plaintext with extra steps. This distinction — encryption (reversible, needs a key) vs encoding (reversible, no key) vs hashing (one-way, see the **Hashing** skill) — is asked constantly in interviews precisely because it is so often confused in real production code.
`,

  "intermediate-concepts": `
### Asymmetric (public-key) encryption

Asymmetric encryption uses a mathematically linked PAIR of keys: a public key (share with anyone) and a private key (never shared). Data encrypted with the public key can only be decrypted with the matching private key — this solves the key-distribution problem from Why It Exists, because you never need to transmit a secret over the network at all; you only ever publish a public key.

~~~python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

message = b"only the private key holder can read this"
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                 algorithm=hashes.SHA256(), label=None),
)

plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                 algorithm=hashes.SHA256(), label=None),
)
assert plaintext == message
~~~

RSA's security rests on the difficulty of factoring the product of two large prime numbers. Its main practical drawback: it is slow and can only encrypt data smaller than the key size (roughly 190 bytes of usable payload for a 2048-bit key with OAEP padding) — which is exactly why RSA is used to encrypt a small symmetric key, never a whole file, in Hybrid Encryption below.

### Elliptic curve cryptography (ECC) — the modern alternative

ECC achieves the same security guarantees as RSA with dramatically smaller keys, because it's based on a different hard problem (the elliptic curve discrete logarithm problem) that is harder per bit than integer factorization. A 256-bit elliptic-curve key gives roughly the security of a 3072-bit RSA key — smaller keys mean faster computation, smaller certificates, and less bandwidth, which is why modern TLS, SSH, and Signal all default to curves like X25519 (key exchange) and Ed25519 (signatures) over classic RSA.

~~~python
from cryptography.hazmat.primitives.asymmetric import x25519

# X25519: elliptic-curve Diffie-Hellman key exchange (used by TLS 1.3, WireGuard, Signal)
alice_private = x25519.X25519PrivateKey.generate()
alice_public = alice_private.public_key()

bob_private = x25519.X25519PrivateKey.generate()
bob_public = bob_private.public_key()

# Both sides independently compute the SAME shared secret without ever sending it
alice_shared = alice_private.exchange(bob_public)
bob_shared = bob_private.exchange(alice_public)
assert alice_shared == bob_shared     # this becomes the symmetric session key
~~~

### Hybrid encryption — how TLS actually works

Nobody encrypts bulk data (a file, an API response, a video stream) with RSA or ECC directly — asymmetric crypto is far too slow for large payloads. Instead, every real system combines both families:

1. Use asymmetric crypto (RSA encryption, or more commonly today, ephemeral Diffie-Hellman / ECDHE key agreement) to establish a shared symmetric key over an untrusted network, without ever transmitting that key in the clear.
2. Switch to fast symmetric encryption (AES-GCM or ChaCha20-Poly1305) for all the actual bulk data using that freshly agreed session key.

This is precisely what happens every time you load an HTTPS page: the TLS handshake performs an ECDHE key exchange (asymmetric) to agree on a session key, then every request and response afterward is encrypted with AES-GCM (symmetric). See the **TLS & HTTPS** skill for the full handshake sequence. "Ephemeral" here matters: a fresh key pair is generated per session, so even if a server's long-term private key is later stolen, past recorded traffic still cannot be decrypted — a property called forward secrecy.

### Fernet — the pragmatic default for application-level encryption

For most application code (encrypting a config value, a database column, a session token), reaching for the low-level AESGCM primitive above is more than you need and easier to misuse (you must manage nonces yourself). The "cryptography" library's Fernet recipe wraps AES-128-CBC + HMAC-SHA256 with sane defaults, versioning, and a built-in timestamp for optional expiry:

~~~python
from cryptography.fernet import Fernet, MultiFernet
import time

key1 = Fernet.generate_key()
key2 = Fernet.generate_key()          # new key, for rotation

# MultiFernet: encrypt with the newest key, decrypt with ANY key in the list
# — this is how you rotate keys without breaking previously-encrypted data
rotator = MultiFernet([Fernet(key2), Fernet(key1)])

token = rotator.encrypt(b"api_key=sk-abc123")
recovered = rotator.decrypt(token)

# ttl enforces "this ciphertext is only valid for N seconds" — useful for
# short-lived tokens like password-reset links
try:
    Fernet(key1).decrypt(token, ttl=60)
except Exception as exc:
    print(f"expired or invalid: {exc}")
~~~
`,

  "advanced-concepts": `
### AEAD internals — what GCM actually does

Galois/Counter Mode (GCM) is an AEAD (Authenticated Encryption with Associated Data) mode: it simultaneously provides confidentiality (via CTR-mode encryption, which turns the AES block cipher into a stream cipher by encrypting a counter and XORing it with plaintext) and integrity/authenticity (via GMAC, a MAC built on Galois-field multiplication). The output is ciphertext PLUS a short authentication tag (typically 16 bytes). On decryption, the tag is recomputed and compared; if it doesn't match, the library must refuse to release ANY plaintext — a tampered ciphertext should fail closed, not leak partial data.

"Associated data" is authenticated but not encrypted — useful for things like a message header or a record's row ID that must not be tampered with but doesn't need to be secret:

~~~python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)
nonce = os.urandom(12)

# associated_data is authenticated (tamper-evident) but stays readable in the clear
ciphertext = aesgcm.encrypt(nonce, b"account balance: 500", associated_data=b"user:1234")

# Decryption fails loudly if EITHER the ciphertext OR the associated_data changed
plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data=b"user:1234")
~~~

### The nonce-reuse catastrophe

In CTR-based modes like GCM, the nonce (number used once) combines with the key to generate a unique keystream per message. Reusing the same (key, nonce) pair for two different messages is catastrophic: XORing the two ciphertexts cancels out the keystream and directly leaks the XOR of the two plaintexts (from which both plaintexts are often fully recoverable via crib-dragging). Worse, in GCM specifically, nonce reuse can leak the authentication subkey, allowing an attacker to forge valid ciphertexts for ANY future message under that key. This is why the golden rule is: never reuse a (key, nonce) pair, ever — either use a cryptographically random 96-bit nonce per message (the standard for GCM) and never encrypt more than about 2^32 messages under one key, or use a strictly incrementing counter that is guaranteed never to repeat for that key's lifetime, but never both a random generator AND a possibility of restart-from-zero.

### Key management fundamentals

- **Generation**: keys must come from a cryptographically secure random number generator (CSPRNG) — Python's "secrets" module or the cryptography library's key-generation functions, never the "random" module, which is predictable and unsuitable for security.
- **Rotation**: keys should be replaced periodically (and immediately after any suspected compromise). Rotation is easy for NEW data (just start encrypting with the new key) but hard for OLD data (everything encrypted under the retiring key must eventually be re-encrypted, or the old key must be retained solely for decryption of legacy data — MultiFernet above is one pattern for this transition).
- **Distribution**: the hardest unsolved problem for pure symmetric systems — how do two parties get the same secret key without an adversary intercepting it? Asymmetric cryptography (Diffie-Hellman, RSA key transport) solves this mathematically, which is precisely why hybrid encryption exists.
- **Storage**: keys must never live in source code, environment variable dumps checked into git, or application logs. See the **Secrets Management** skill for the full treatment of vaults, KMS, and HSMs as the correct home for keys.

### Envelope encryption — how cloud KMS actually works

Directly encrypting terabytes of data with a master key stored in a Hardware Security Module (HSM) is slow (HSM operations are rate-limited and expensive) and makes key rotation require re-encrypting everything. Envelope encryption solves both problems with an extra layer of indirection:

1. Generate a random **Data Encryption Key (DEK)** locally for each object/file/record.
2. Encrypt the actual data with the DEK using fast local AES-GCM.
3. Send the DEK (not the data) to the KMS, where a **Key Encryption Key / master key** — which never leaves the HSM boundary in plaintext — encrypts (wraps) it.
4. Store the ciphertext alongside the encrypted ("wrapped") DEK. Discard the plaintext DEK from memory.
5. To decrypt later: send the wrapped DEK to the KMS, which unwraps it (a single fast HSM call regardless of data size), then use the now-plaintext DEK locally to decrypt the actual data.

This is exactly the pattern behind AWS KMS ("GenerateDataKey" + "Decrypt" API calls), GCP Cloud KMS, and Azure Key Vault. Benefits: the expensive/rate-limited HSM only ever touches small keys, never bulk data; rotating the master key just means re-wrapping the (tiny) DEKs, not re-encrypting all your data; and a compromised application server that has ciphertext plus a wrapped DEK still cannot decrypt anything without also compromising the KMS's access controls.

### Encryption at rest vs in transit vs in use

- **At rest**: data on disk — database files, backups, object storage. Solved with AES (often AES-256 in XTS mode for full-disk encryption, or GCM for application-level column encryption).
- **In transit**: data moving across a network. Solved with TLS, which is hybrid encryption end to end (see the **TLS & HTTPS** skill).
- **In use**: data that has been decrypted and is sitting in RAM to be processed — the classic gap, because CPUs have historically needed plaintext to compute on it, meaning even a fully encrypted-at-rest, encrypted-in-transit system exposes plaintext in memory to a compromised OS, hypervisor, or cloud provider insider. **Confidential computing** closes this gap using hardware-backed Trusted Execution Environments (Intel SGX, AMD SEV, AWS Nitro Enclaves) that keep memory encrypted and isolated even from a privileged host OS, decrypting only inside a sealed, attestable enclave. This is an emerging but increasingly production-relevant area for AI workloads that process highly sensitive data (health records, financial data) where even the cloud provider must not see plaintext.

### Digital signatures — the other half of asymmetric crypto

Where encryption with a public key gives confidentiality, SIGNING with a private key gives authenticity and integrity: anyone with the public key can verify a signature came from the private key holder and that the message wasn't altered, without being able to forge new signatures. RSA and ECDSA/EdDSA (Ed25519) both support signing as well as key exchange — this is the basis of code signing, JWT signature verification, and TLS certificate chains.
`,

  "internal-working": `
Here is what actually happens, step by step, inside a modern authenticated symmetric encryption call (AES-GCM), and inside a hybrid TLS-style handshake:

~~~mermaid
flowchart TB
    A["Plaintext bytes"] --> B["Split into 128-bit (16-byte) blocks"]
    B --> C["AES block cipher encrypts a counter value per block\n(CTR mode: turns block cipher into a keystream generator)"]
    C --> D["Keystream XORed with plaintext blocks -> ciphertext"]
    D --> E["GHASH (Galois field multiplication) over ciphertext\n+ associated data -> authentication tag"]
    E --> F["Output: ciphertext || nonce || 16-byte auth tag"]
    F --> G["On decrypt: recompute tag first"]
    G -->|tag mismatch| H["Reject entirely -- release NO plaintext"]
    G -->|tag matches| I["Decrypt ciphertext with same keystream -> plaintext"]
~~~

Step by step for AES-GCM:

1. **Key + nonce setup**: the 128/256-bit AES key and a 96-bit nonce (unique per message) initialize a counter.
2. **Keystream generation**: AES encrypts the counter value (not the data!) block by block, producing a pseudo-random keystream — this is why GCM is technically a stream cipher construction built from a block cipher.
3. **Encryption**: plaintext is XORed with the keystream, block by block, producing ciphertext of exactly the same length as the plaintext (no padding needed, unlike CBC).
4. **Authentication**: every ciphertext block (and any associated data) is folded into a running GHASH computation over a Galois field, producing a single authentication tag.
5. **Output**: the caller stores ciphertext + nonce + tag together (nonce and tag don't need to be secret, only unique/present).
6. **Decryption reverses the order**: the tag is recomputed from the received ciphertext FIRST; only if it matches is the plaintext ever produced. This "verify then decrypt" ordering is what prevents padding-oracle-style attacks that plagued older unauthenticated modes like plain CBC.

For a hybrid TLS-style handshake, the internal sequence is: client and server perform an ephemeral elliptic-curve Diffie-Hellman exchange (asymmetric), both independently derive the same shared secret, that secret is run through a key-derivation function (HKDF) to produce several symmetric session keys, and all subsequent application data is encrypted with AES-GCM or ChaCha20-Poly1305 using those derived keys. See the **TLS & HTTPS** skill for the full handshake message sequence.
`,

  architecture: `
Two levels matter here: how a single encryption operation is structured internally, and how an application should be architected around encryption as a system-wide concern.

### Cryptographic primitive layering

~~~mermaid
flowchart TB
    subgraph HighLevel["High-level recipes (use these by default)"]
        Fernet["Fernet / MultiFernet\n(AES-128-CBC + HMAC, versioned, hard to misuse)"]
    end
    subgraph LowLevel["Low-level primitives (use when you need control)"]
        AESGCM["AESGCM / ChaCha20Poly1305\n(you manage nonce + key lifecycle yourself)"]
        RSAKey["RSA / X25519 asymmetric keys\n(key exchange + signatures)"]
    end
    subgraph KMSLayer["Key management layer"]
        KMS["Cloud KMS / HSM / Vault\n(master keys never leave here in plaintext)"]
        DEK["Data encryption keys\n(wrapped by KMS, used locally)"]
    end
    Fernet --> AESGCM
    AESGCM --> DEK
    RSAKey --> DEK
    DEK --> KMS
~~~

Rule of thumb for choosing a layer: reach for Fernet/high-level recipes for application data by default; drop to AESGCM/ChaCha20Poly1305 only when you need associated data, streaming, or interop with a specific protocol; and never touch raw block-cipher APIs (ciphers.Cipher directly) unless you are implementing a well-specified protocol from a standard, because that layer has no guardrails against ECB, missing authentication, or nonce reuse.

### Application architecture around encryption

~~~
myservice/
├── src/myservice/
│   ├── crypto/
│   │   ├── envelope.py        # wrap/unwrap DEKs via KMS client, single choke point
│   │   ├── fernet_store.py    # application-level field encryption helper
│   │   └── rotation.py        # key rotation jobs, MultiFernet management
│   ├── kms_client.py           # thin wrapper over AWS KMS / GCP KMS SDK calls
│   ├── models/                 # domain models — encrypted fields typed distinctly
│   └── services/                # business logic calls crypto/ never raw primitives
└── tests/
    └── crypto/                 # dedicated tests: tamper detection, key rotation, nonce uniqueness
~~~

The architectural principle that matters most: **centralize all encryption/decryption behind one small, heavily tested module** (crypto/ above). Nobody else in the codebase should import AESGCM or Fernet directly — they call encrypt_field()/decrypt_field() functions that internally handle key retrieval from the KMS/vault, nonce generation, and versioning. This makes a future migration (rotating algorithms, switching KMS providers, adding post-quantum support later) a change in one place instead of a grep-and-pray across the whole codebase.
`,

  "data-flow": `
Trace one operation end to end: an application encrypting a sensitive field before writing it to a database, using envelope encryption backed by a cloud KMS.

~~~mermaid
sequenceDiagram
    participant App as Application
    participant KMS as Cloud KMS (HSM-backed)
    participant DB as Database

    App->>KMS: GenerateDataKey(master_key_id)
    KMS-->>App: plaintext DEK + KMS-wrapped(encrypted) DEK
    App->>App: AES-GCM encrypt(sensitive_field, DEK, nonce)
    App->>App: discard plaintext DEK from memory
    App->>DB: store ciphertext + nonce + wrapped_DEK
    Note over App,DB: master key never left the KMS boundary

    App->>DB: read ciphertext + nonce + wrapped_DEK (later, on read path)
    App->>KMS: Decrypt(wrapped_DEK)
    KMS-->>App: plaintext DEK (only if IAM policy allows this caller)
    App->>App: AES-GCM decrypt(ciphertext, DEK, nonce) -> verify tag -> plaintext
    App-->>App: return sensitive_field to caller
~~~

The most misunderstood part of this flow: the master key inside the KMS is NEVER exposed to the application in plaintext, ever — only the small, per-record DEK is, and only transiently in memory during the encrypt/decrypt call. This means a full application server compromise that dumps memory or disk still only yields ciphertext and wrapped DEKs unless the attacker can also successfully call the KMS's Decrypt API, which is gated by IAM/access policies and produces an audit log entry every time — a second, independent security boundary beyond the cryptography itself.
`,

  "production-usage": `
### Library and tooling choices

In Python, the "cryptography" package (pyca/cryptography) is the de facto standard — it wraps OpenSSL/BoringSSL, is extensively audited, and exposes both the high-level Fernet recipe and low-level AEAD primitives shown above. Avoid the older, unmaintained "pycrypto" package entirely; use "cryptography" or its higher-level companion "pyOpenSSL" for TLS-specific needs.

~~~bash
uv add cryptography
~~~

### Key management in production

Real production systems never hand-roll key storage. The standard pattern:

1. A **master key** lives in a managed KMS (AWS KMS, GCP Cloud KMS, Azure Key Vault) or a self-hosted vault (HashiCorp Vault with its Transit secrets engine) — see the **Secrets Management** skill for the full comparison.
2. Application code never sees the master key; it only calls the KMS's encrypt/decrypt or generate-data-key APIs over an authenticated, audited channel (IAM roles, service accounts).
3. Data keys are cached briefly in memory (with a TTL) to avoid a KMS round trip per record, using an SDK like the AWS Encryption SDK, which implements envelope encryption and data-key caching out of the box.

### Config and defaults that matter

- Default to AES-256-GCM or ChaCha20-Poly1305 for new symmetric encryption; default to Ed25519/X25519 over RSA for new asymmetric use unless interop constraints require RSA.
- Key rotation policy: rotate master keys on a schedule (commonly annually, or per compliance requirement) and immediately on suspected compromise; most KMS services support automatic rotation for master keys while leaving data re-encryption to the application's discretion (since it only requires re-wrapping DEKs, not re-encrypting bulk data).
- Never log plaintext, keys, nonces used for encryption in application logs — nonces are not secret but logging them alongside ciphertext in a way that could aid correlation attacks is still bad hygiene; keys and plaintext must never appear in logs, period.
`,

  "industry-examples": `
- **Signal / WhatsApp**: the Signal Protocol combines X3DH (an asymmetric key-agreement handshake) with the Double Ratchet algorithm (continuously rotating symmetric keys per message) to give end-to-end encrypted messaging both forward secrecy and post-compromise security — arguably the most rigorously analyzed applied-cryptography system in wide consumer use. WhatsApp licenses the same protocol for over a billion users.
- **Apple**: FileVault (macOS) and iOS data protection use AES-256 (in XTS mode for disk encryption) tied to hardware-backed keys in the Secure Enclave, a dedicated coprocessor that never exposes raw key material to the main CPU — a consumer-grade example of hardware-rooted key management.
- **Google**: encrypts all data at rest across its infrastructure by default (a policy publicized since the early 2010s in response to intercepted-in-transit revelations) and built Tink, an open-source multi-language cryptography library specifically designed to make correct usage the path of least resistance and misuse (like ECB or missing authentication) structurally difficult.
- **AWS**: KMS underpins envelope encryption for S3 server-side encryption, EBS volume encryption, and RDS encryption at rest — the canonical large-scale production implementation of the envelope-encryption pattern described in Advanced Concepts.
- **Cloudflare**: terminates TLS for a huge share of the web's traffic at its edge, doing the hybrid-encryption handshake (ECDHE + AES-GCM/ChaCha20-Poly1305) at massive scale, and has published extensively on optimizing this (post-quantum hybrid key exchange trials, for instance) given its unique vantage point on internet-wide encryption performance.
- **Payment networks (Visa/Mastercard, EMV chip cards)**: use hardware security modules and symmetric/asymmetric hybrid schemes to protect card data end to end, plus tokenization (replacing card numbers with non-sensitive tokens) as a complementary control layered on top of encryption.
`,

  "best-practices": `
1. **Never invent your own cipher or protocol.** Use standardized, publicly reviewed algorithms (AES, RSA, ECC/X25519) through an audited library. Cryptography is one of the few fields where "clever and original" is a red flag, not a compliment.
2. **Default to authenticated encryption (AEAD).** AES-GCM or ChaCha20-Poly1305, never an unauthenticated mode like plain CBC or CTR without a separate MAC.
3. **Never use ECB mode**, for anything, ever — see Beginner Concepts for exactly why.
4. **Generate keys and IVs/nonces with a cryptographically secure random source** (Python's "secrets" module or the crypto library's own generator), never the general-purpose "random" module.
5. **Never reuse a (key, nonce) pair.** A fresh random 96-bit nonce per AES-GCM message is the standard; track and cap the number of messages per key if you must use a deterministic counter.
6. **Centralize encryption behind one internal module** so key retrieval, nonce handling, and algorithm choice live in exactly one place, making future rotation or migration tractable.
7. **Store keys in a KMS or vault, never in source code, environment dumps, or config files committed to git.** See the **Secrets Management** skill.
8. **Use envelope encryption for anything beyond trivial data volumes** — it decouples bulk-data encryption speed from HSM-backed master-key security.
9. **Rotate keys on a schedule and immediately after any suspected compromise;** design your storage format (versioned Fernet tokens, or a stored key-id alongside ciphertext) so rotation doesn't require a flag-day migration.
10. **Verify the authentication tag before trusting any decrypted plaintext** — reject tampered ciphertext outright rather than attempting partial recovery.
11. **Encrypt at rest AND in transit — they protect against different threats** and neither substitutes for the other; a database encrypted at rest still needs TLS between the app and the DB.
12. **Never use encryption where hashing is the correct tool** (passwords, integrity checksums) — see the **Hashing** skill for the decision rule.
`,

  "anti-patterns": `
### Using ECB mode

~~~python
# WRONG: ECB leaks plaintext structure through repeated ciphertext blocks
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
cipher = Cipher(algorithms.AES(key), modes.ECB())     # never do this

# RIGHT: use an authenticated mode
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
aesgcm = AESGCM(key)
ciphertext = aesgcm.encrypt(nonce, plaintext, None)
~~~

### Hardcoding keys in source

~~~python
# WRONG: the key ships in every copy of the source, every git clone, every backup
SECRET_KEY = b"my-super-secret-key-12345678901"

# RIGHT: load from a vault/KMS or environment injected at deploy time, never committed
import os
key = os.environb[b"APP_ENCRYPTION_KEY"]   # populated by the secrets manager at runtime
~~~

### Reusing a nonce

~~~python
# WRONG: same nonce reused across many messages under the same key
FIXED_NONCE = b"000000000000"
for msg in messages:
    aesgcm.encrypt(FIXED_NONCE, msg, None)   # catastrophic — leaks plaintext relationships

# RIGHT: a fresh random nonce every single call
import os
for msg in messages:
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, msg, None)
    store(nonce, ciphertext)                  # nonce travels WITH the ciphertext
~~~

### Rolling your own crypto scheme

~~~python
# WRONG: a homemade XOR "cipher" — trivially breakable, no authentication, no review
def homemade_encrypt(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

# RIGHT: use a standardized, audited library primitive — always
from cryptography.fernet import Fernet
token = Fernet(key).encrypt(data)
~~~

### Other production-grade anti-patterns

- **"Encrypting" passwords instead of hashing them** — reversible storage of passwords means anyone who ever gets the key (a future breach, a rogue insider) recovers every plaintext password at once. Passwords must be hashed with a slow, salted algorithm (bcrypt/argon2/scrypt) — see the **Hashing** skill.
- **Treating Base64/hex encoding as encryption** — it provides zero confidentiality; it is purely a text-safe representation of bytes.
- **Not verifying the authentication tag before using decrypted data** — using ciphertext that "decrypted successfully" from a non-AEAD mode without a separate integrity check opens the door to padding-oracle and bit-flipping attacks.
- **Using the same key for encryption and for signing/authentication** — key separation by purpose is a basic hygiene rule; a key compromised in one context shouldn't compromise an unrelated one.
- **Encrypting a compressed payload without care** — combining compression and encryption of secrets can leak information through ciphertext length (the CRIME/BREACH class of attacks against TLS-compressed traffic is the canonical example).
`,

  performance: `
### Measure first

~~~bash
python -m timeit -s "from cryptography.hazmat.primitives.ciphers.aead import AESGCM; import os; k=AESGCM.generate_key(256); a=AESGCM(k); n=os.urandom(12); d=os.urandom(1_000_000)" "a.encrypt(n, d, None)"
~~~

Benchmark real payload sizes and realistic call patterns (many small records vs few large ones) before optimizing — cryptographic overhead is rarely the actual bottleneck in a typical AI-engineering service; network and database calls usually dominate.

### The performance hierarchy

1. **Use hardware-accelerated AES.** Modern CPUs (x86 with AES-NI, ARM with the Cryptography Extensions) execute AES in dedicated silicon; virtually every mainstream crypto library (including "cryptography"/OpenSSL) uses this automatically — you get roughly an order of magnitude speedup for free versus a software-only AES implementation, with zero code changes required.
2. **Prefer ChaCha20-Poly1305 on hardware without AES acceleration** (older mobile chips, some embedded/edge devices) — it was specifically designed to run fast in software without needing special instructions, and TLS 1.3 clients commonly negotiate it automatically on such hardware.
3. **Batch small encryption operations where possible** — encrypting one large payload has less per-call overhead (key setup, nonce generation, tag computation) than many tiny ones; consider encrypting a whole record instead of every individual field, if your access-pattern allows it.
4. **Cache data keys, don't cache master-key operations.** For envelope encryption, cache the (short-lived) plaintext DEK for a batch of operations rather than calling the KMS per record — the KMS round trip (often tens of milliseconds, and often rate-limited/billed per call) is usually the dominant cost, not the local AES-GCM math.
5. **Avoid RSA for anything but small payloads or infrequent operations** — its per-operation cost is roughly 100-1000x slower than AES-GCM for equivalent data sizes; this is precisely why hybrid encryption exists.
6. **Minimize round trips to the KMS/HSM** — it is almost always the true latency bottleneck in an encryption-heavy production path, not the cipher math itself.
`,

  scalability: `
Encryption workloads scale differently depending on which layer is under load: the local cipher math (cheap and scales linearly with cores/hardware acceleration) versus the KMS/HSM (a shared, rate-limited, often billed-per-call external dependency).

~~~mermaid
flowchart LR
    App1["App instance 1"] -->|GenerateDataKey / Decrypt| KMS[("Cloud KMS\n(rate-limited, HSM-backed)")]
    App2["App instance 2"] --> KMS
    App3["App instance N"] --> KMS
    App1 -.local AES-GCM, no KMS call.-> Data1[("Bulk data encrypt/decrypt\nusing cached DEK")]
~~~

| Bottleneck | Answer |
|------------|--------|
| KMS API call rate limits under high request volume | Data-key caching (AWS Encryption SDK's caching CMM), batch operations, request fewer/larger DEKs instead of one per tiny record |
| CPU cost of encrypting huge payloads | Hardware AES-NI/ARMv8 crypto extensions (usually automatic); stream the encryption over chunks instead of loading the whole file into memory |
| Key rotation at scale (millions of records under an old master key) | Envelope encryption means rotation only re-wraps DEKs (fast), never re-encrypts bulk data (slow) — this is the entire point of the pattern |
| Latency-sensitive paths (e.g. per-request field decryption) | Cache decrypted DEKs briefly in memory with a short TTL; never cache decrypted PLAINTEXT data beyond what's needed |
| Multi-region systems needing the same keys everywhere | Cloud KMS services support multi-region keys (AWS KMS multi-Region keys, GCP KMS location replication) so encryption/decryption can happen close to each region without cross-region latency on every call |

Horizontally, encryption itself scales trivially (every app instance runs its own local AES-GCM independently); the shared, careful-to-scale resource is always the KMS/HSM layer and its access-control/audit-logging path.
`,

  security: `
Encryption is a security control, but it has its own attack surface distinct from "did we encrypt the data":

1. **Key compromise is the real threat model.** Encryption is only as strong as the secrecy of the key; if an attacker gets the key (via a leaked KMS credential, a hardcoded key in source, or a vulnerable secrets store), the strongest cipher in the world provides zero protection. See the **Secrets Management** skill.
2. **Padding oracle attacks** against unauthenticated CBC-mode implementations let an attacker decrypt ciphertext byte-by-byte by observing whether a server returns a "padding error" vs a different error — this is why AEAD modes (which authenticate before releasing any plaintext) are mandatory today.
3. **Nonce/IV reuse** breaks confidentiality and, for GCM specifically, can leak the authentication key entirely, allowing ciphertext forgery — see Advanced Concepts.
4. **Downgrade attacks**: an attacker on the network path tricks two parties into negotiating a weaker, older cipher suite (e.g., forcing TLS down to an export-grade or ECB-based scheme) — modern protocols (TLS 1.3) remove legacy weak options entirely rather than relying on negotiation logic to avoid them.
5. **Side-channel attacks**: timing differences, power consumption, or cache-access patterns during cryptographic operations can leak key bits even when the math is sound — this is why constant-time implementations matter and why you should never write your own crypto primitives (see Anti-Patterns); audited libraries specifically defend against known side channels.
6. **Confusing encryption with hashing for password storage** — passwords must be hashed (bcrypt/argon2), never encrypted, because encryption is reversible and a compromised key recovers every password at once. See the **Hashing** skill for the complete treatment.
7. **Missing encryption in transit between internal services** — "it's just internal traffic" is a common but risky assumption; a compromised internal network segment or a misconfigured proxy can expose plaintext between microservices. See the **TLS & HTTPS** skill for mutual TLS between services.
8. **Encryption without access control is incomplete** — encrypting a database column doesn't prevent a legitimately authenticated but overprivileged user/service from reading it; encryption complements, but does not replace, the access-control and least-privilege guidance in the **OWASP Top 10** skill.

See the **SQL Injection**, **XSS**, and **CSRF** skills for the other classic application-layer attack surfaces this platform covers as siblings to Encryption within the Security category.
`,

  testing: `
Cryptographic code deserves its own dedicated, adversarial test suite — not just happy-path checks.

~~~python
# tests/test_crypto_envelope.py
import os
import pytest
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

def test_roundtrip_recovers_original_plaintext():
    key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    plaintext = b"sensitive record"

    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    assert aesgcm.decrypt(nonce, ciphertext, None) == plaintext

def test_tampered_ciphertext_is_rejected():
    key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = bytearray(aesgcm.encrypt(nonce, b"do not modify me", None))
    ciphertext[0] ^= 0xFF                       # flip one bit — simulate tampering

    with pytest.raises(InvalidTag):
        aesgcm.decrypt(nonce, bytes(ciphertext), None)

def test_wrong_key_fails_to_decrypt():
    key_a = AESGCM.generate_key(bit_length=256)
    key_b = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    ciphertext = AESGCM(key_a).encrypt(nonce, b"payload", None)

    with pytest.raises(InvalidTag):
        AESGCM(key_b).decrypt(nonce, ciphertext, None)

def test_nonces_are_never_repeated_across_many_calls():
    seen = set()
    for _ in range(10_000):
        nonce = os.urandom(12)
        assert nonce not in seen, "nonce collision detected — investigate RNG source"
        seen.add(nonce)
~~~

### The senior testing doctrine for crypto code

- Test that tampering (flipping any bit of ciphertext, tag, or associated data) is ALWAYS rejected — this is the single highest-value test class for AEAD code.
- Test that decryption with the wrong key fails cleanly rather than producing garbage plaintext silently.
- Never assert on the raw ciphertext bytes matching a fixture — ciphertext should differ every run (fresh nonce), so assert on successful roundtrip and rejection behavior instead.
- Include a "known-answer test" against a published test vector (e.g., from NIST's AES-GCM test vectors) at least once, to catch a broken library integration rather than only testing self-consistency.
- Do not attempt to unit-test the cryptographic strength of the algorithm itself — that's the library maintainers' and NIST's job; your tests verify correct USAGE (key/nonce handling, tamper detection, error paths).
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the exact exception type.** The "cryptography" library raises specific exceptions — "InvalidTag" means authentication failed (wrong key, wrong nonce, or tampered data); distinguish this from a generic decode error, which usually means the ciphertext format itself is malformed (wrong encoding, truncated data).
2. **Check the nonce/IV is actually being stored and retrieved correctly** alongside the ciphertext — a shockingly common bug is discarding the nonce after encryption and then being unable to decrypt anything, because GCM/CTR-based decryption is mathematically impossible without the exact original nonce.
3. **Verify key material length and encoding** — Fernet keys must be 32 url-safe base64-encoded bytes; AES keys must be exactly 16/24/32 raw bytes; a common bug is passing a base64-encoded string where raw bytes were expected, or vice versa.
4. **Reproduce with a minimal script**: strip away application layers (ORM, serialization, HTTP) and encrypt/decrypt a fixed short string directly against the crypto library to isolate whether the bug is in your key handling or elsewhere (serialization corrupting binary ciphertext being especially common — always base64 or hex-encode binary ciphertext before putting it in JSON/text fields).
5. **Check for double-encoding or double-decryption bugs** — e.g., ciphertext being decrypted twice by two different layers of a system, or base64-encoded twice without matching decode calls.
6. **Verify key rotation state**: if MultiFernet or a KMS key alias was rotated, confirm the OLD key is still present in the decryption key list for data encrypted before the rotation — this is the most common "suddenly nothing decrypts after a deploy" bug.
7. **For KMS-backed systems, check IAM/access-policy errors first** — a "AccessDeniedException" from the KMS API is often mistaken for a cryptographic bug when it's actually a permissions misconfiguration; check CloudTrail/audit logs for the KMS call before assuming the ciphertext itself is corrupted.
`,

  monitoring: `
### What to instrument

~~~python
import structlog
import time

log = structlog.get_logger()

def encrypt_field(plaintext: bytes, key_id: str) -> bytes:
    start = time.perf_counter()
    try:
        ciphertext = _do_encrypt(plaintext, key_id)
        log.info("field_encrypted", key_id=key_id,
                  latency_ms=(time.perf_counter() - start) * 1000)
        return ciphertext
    except Exception:
        log.error("encryption_failed", key_id=key_id)   # never log plaintext or the key
        raise
~~~

### Metrics that matter

- **KMS call rate and latency** (p50/p95/p99) — this is the operation most likely to become a bottleneck or hit rate limits under load; alert on elevated error rates specifically from the KMS client.
- **Decryption failure rate** (InvalidTag / AccessDenied counts) — a sudden spike often signals either an active tampering attempt, a broken deploy (wrong key version referenced), or an access-policy regression; this metric deserves a real-time alert, not just a dashboard.
- **Key age / time since last rotation** — track this explicitly per key and alert well before any compliance-mandated rotation deadline.
- **Number of distinct nonces observed per key** as a coarse sanity check in systems with extremely high message volume under a single key, to catch nonce-generation bugs (e.g., a broken RNG seed causing repeats) before they become exploitable.

### What NEVER to log

Plaintext, raw key material, and nonces-alongside-ciphertext-in-a-way-that-aids-correlation should never appear in application logs, error messages, or stack traces sent to third-party error trackers (Sentry, etc.) — scrub these fields explicitly at the logging boundary rather than trusting downstream systems to redact them.
`,

  deployment: `
### Provisioning KMS access safely (illustrative)

~~~dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY src/ src/
RUN useradd -m appuser
USER appuser
# No key material baked into the image. The KMS master key ID is a
# non-secret config value (an ARN/resource name); actual crypto
# credentials come from the platform's workload identity (IAM role,
# Kubernetes service account with Workload Identity), never env vars
# containing raw secrets.
ENV KMS_KEY_ID="arn:aws:kms:us-east-1:123456789012:key/abc-123"
CMD ["python", "-m", "myservice"]
~~~

Why each choice matters: no key ever gets baked into the image or passed as a plaintext build argument (both end up cached in image layers and registries); the KMS key ID itself is not secret (it's just a resource identifier — access is controlled by IAM policy, not by hiding the ID); actual authentication to the KMS uses the platform's identity mechanism (cloud IAM roles attached to the compute, not a static access key committed anywhere).

### Deployment-time key handling

- Rotate any key that was ever exposed during an incident immediately, and re-encrypt affected data with the new key as soon as practical — envelope encryption makes this a DEK re-wrap, not a full data re-encryption, if only the master key needs rotating.
- Roll out key rotation gradually: keep the retiring key available for decryption (MultiFernet-style) for a transition window before fully retiring it, to avoid breaking in-flight or older-encrypted data.
- Ensure staging/test environments use entirely separate keys and KMS resources from production — never point a test environment at a production master key "just to test something quickly."
`,

  "production-checklist": `
Before an encryption-dependent feature takes real traffic:

- [ ] Using an authenticated encryption mode (AES-GCM or ChaCha20-Poly1305) — no ECB, no unauthenticated CBC/CTR
- [ ] Keys generated via a CSPRNG, never hardcoded, never committed to source control
- [ ] Keys stored in a KMS/vault, retrieved via workload identity, not static credentials
- [ ] A fresh, cryptographically random nonce generated per encryption call; nonce stored alongside ciphertext
- [ ] Authentication tag verified before any decrypted plaintext is trusted or used
- [ ] Envelope encryption used for anything beyond trivial data volume (data key locally, master key in KMS)
- [ ] Key rotation policy defined and tested (old-key decryption path verified to still work post-rotation)
- [ ] TLS enforced for all network paths carrying sensitive data, including internal service-to-service calls
- [ ] No plaintext, keys, or nonces appear in application logs or error-tracking systems
- [ ] Passwords are hashed (bcrypt/argon2), never encrypted — verified this distinction was actually applied
- [ ] Dedicated tests exist for tamper rejection, wrong-key rejection, and nonce-uniqueness
- [ ] KMS call latency and error-rate metrics instrumented with alerting
- [ ] IAM/access policy for the KMS key follows least privilege — reviewed by someone other than the author
- [ ] Test/staging environments use separate keys from production
- [ ] A documented incident runbook exists for "we suspect a key was compromised" (rotate, re-encrypt, audit access logs)
`,

  "common-mistakes": `
1. **Confusing encryption with hashing.** Encryption is reversible with a key; hashing is one-way. Using encryption for passwords means a single key leak recovers every user's password at once — see the **Hashing** skill for why passwords need the opposite property.
2. **Treating Base64/hex as security.** It's an encoding, not encryption — it has no key and reverses with zero secret knowledge. It's for making binary data text-safe, nothing more.
3. **Using ECB mode** — because it's the "simple" option in many library APIs, developers reach for it without realizing identical plaintext blocks produce identical ciphertext blocks, leaking structure (the "ECB penguin" problem).
4. **Hardcoding or committing keys** — often "just for now during development," which then quietly ships to production or lingers in git history forever, readable by anyone with repo access.
5. **Reusing a nonce/IV** — especially common when a nonce is fixed as a constant "to keep things simple," which silently breaks the security of GCM/CTR-based ciphers.
6. **Rolling your own crypto** — writing a custom XOR cipher or a homemade "obfuscation" scheme because "we don't need real encryption here," which is almost always wrong the moment any actual sensitive data is involved.
7. **Not verifying the authentication tag** — using a mode or a partial implementation that returns "decrypted" data without confirming it wasn't tampered with first, opening the door to padding-oracle-class attacks.
8. **Encrypting at rest but not in transit (or vice versa)** — assuming one covers the other; they defend against entirely different threat models and both are usually required.
9. **Forgetting key rotation entirely** — a key generated once at project inception and never rotated for years, with no tested procedure for what happens when it eventually must be rotated (often discovered only during an actual incident, under pressure).
10. **Assuming encryption alone satisfies compliance/security** — encryption is one control among several (access control, auditing, network segmentation); reviewers and auditors check for the whole picture, not just "is the data encrypted."
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| InvalidTag (cryptography library) | Wrong key, wrong/reused nonce, or tampered ciphertext | Verify key and nonce retrieval logic; check for data corruption in storage/transport |
| InvalidToken (Fernet) | Wrong key, token expired past ttl, or corrupted/truncated token | Confirm the correct key (or MultiFernet key list) is used; check ttl value against actual token age |
| ValueError: Invalid IV size / Invalid key size | Key or nonce/IV is the wrong byte length for the chosen algorithm | AES needs 16/24/32-byte keys; GCM nonce is typically 12 bytes — check generation code, not just usage |
| binascii.Error: Invalid base64-encoded string | Ciphertext was corrupted or truncated during storage/transport (e.g., a string field too short in a DB) | Store binary ciphertext as bytes or base64 in a field sized for the full encoded length; check for accidental double-encoding |
| AccessDeniedException (AWS KMS) | IAM policy doesn't grant the calling role kms:Decrypt / kms:GenerateDataKey on that key | Review the key policy and the caller's IAM role; check CloudTrail for the specific denied action |
| ThrottlingException (KMS rate limit) | Too many direct KMS calls under load | Implement data-key caching (e.g., AWS Encryption SDK's caching CMM) instead of calling KMS per record |
| UnsupportedAlgorithm | Requesting a mode/curve the installed OpenSSL/cryptography build doesn't support | Update the "cryptography" package; verify the underlying OpenSSL version supports the requested primitive |
| Decrypted output is garbage but no exception raised | Using a non-authenticated mode (e.g., raw CTR without a MAC) that doesn't detect tampering or wrong keys | Switch to an AEAD mode (GCM) so failures raise explicitly instead of silently producing wrong plaintext |

The habit that matters: an exception from a crypto library is almost never "the algorithm is broken" — it is almost always a key, nonce, encoding, or access-policy mismatch. Isolate which one with a minimal reproduction before assuming anything deeper is wrong.
`,

  faqs: `
**Q: Is encryption the same as hashing?**
No — this is the single most important distinction on this page. Encryption is reversible: given the ciphertext and the correct key, you get the exact original plaintext back. Hashing is one-way: there is no key, and you cannot recover the original input from a hash by design. Use encryption when you need to get the original data back later (files, messages, database columns); use hashing when you only ever need to verify a match (passwords, integrity checks). See the **Hashing** skill for the full treatment.

**Q: Is Base64 encoding a form of encryption?**
No. Base64 is a reversible text encoding with no key — anyone can decode it instantly. It makes binary data safe to embed in text formats (JSON, URLs); it provides zero confidentiality.

**Q: Why is ECB mode considered broken if AES itself is secure?**
AES the cipher is secure for a single 16-byte block; ECB is the mode that decides how to chain many blocks, and it does so naively — encrypting each block independently means identical plaintext blocks always produce identical ciphertext blocks, leaking structural patterns (the "ECB penguin"). Always use an authenticated mode like GCM instead.

**Q: Should I use RSA or elliptic curve (ECC) for new systems?**
Prefer ECC (X25519 for key exchange, Ed25519 for signatures) for new systems — smaller keys, faster operations, equivalent or better security per bit. Use RSA mainly where you must interoperate with legacy systems that don't support elliptic curves.

**Q: What is envelope encryption and why do cloud providers all use it?**
It's a two-layer scheme: a per-object data key encrypts the actual data, and a master key (held in an HSM-backed KMS) encrypts that data key. It keeps the expensive/rate-limited HSM operations small and fast (only ever touching tiny keys, never bulk data) and makes key rotation cheap (re-wrap the small data key instead of re-encrypting everything).

**Q: How does HTTPS/TLS actually use encryption?**
It's a hybrid scheme: an asymmetric key exchange (ephemeral elliptic-curve Diffie-Hellman in TLS 1.3) establishes a shared symmetric session key without ever transmitting it, and then all the actual data is encrypted with fast symmetric AEAD ciphers (AES-GCM or ChaCha20-Poly1305) using that session key. See the **TLS & HTTPS** skill for the full handshake.

**Q: If my data is encrypted, am I automatically compliant/secure?**
No. Encryption is one control among several. If the key is stored insecurely, if access control around the decrypted data is weak, or if the encryption is implemented incorrectly (ECB, reused nonces, missing authentication), encryption provides little to no real protection. Reviewers and compliance auditors look at the whole system, not a checkbox.

**Q: Will quantum computers break the encryption used today?**
Sufficiently powerful quantum computers would break RSA and classic elliptic-curve cryptography (via Shor's algorithm), though large-scale, cryptographically relevant quantum computers do not exist as of this writing. NIST finalized the first post-quantum cryptography standards in 2024 (ML-KEM, ML-DSA), and forward-looking systems are beginning hybrid classical+post-quantum key exchange. Symmetric ciphers like AES are far less affected (Grover's algorithm only halves the effective key strength, so AES-256 remains comfortably secure).
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between encryption and hashing?* Encryption is reversible with a key; hashing is one-way with no key to recover the original input. Encrypt when you need the original data back; hash when you only need to verify a match (passwords, integrity).
2. *What's the difference between symmetric and asymmetric encryption?* Symmetric uses one shared key for both encrypt and decrypt, is fast, but requires securely sharing that key first. Asymmetric uses a mathematically linked public/private key pair — anyone can encrypt with the public key, only the private key holder decrypts — solving the key-distribution problem, but it's much slower and limited in payload size.
3. *Is Base64 encryption?* No. It's a reversible encoding with no key, used to make binary data text-safe; anyone can decode it with zero secret knowledge.
4. *Why shouldn't you use ECB mode?* Identical plaintext blocks produce identical ciphertext blocks, leaking structural patterns in the data (the classic "ECB penguin" image demonstration). Always use an authenticated mode like GCM instead.
5. *What is a nonce/IV and why does it matter?* A value that must be unique (and for some modes, unpredictable) per encryption operation under a given key, ensuring the same plaintext doesn't produce the same ciphertext twice. Reusing it breaks the cipher's security guarantees.

**Senior:**

6. *Explain hybrid encryption and why TLS uses it.* Asymmetric crypto (via ephemeral Diffie-Hellman) solves key distribution but is too slow for bulk data; symmetric crypto (AES-GCM) is fast but needs a pre-shared key. TLS uses asymmetric key exchange once per session to agree on a symmetric key, then symmetric encryption for all the actual data — getting both security-of-distribution and speed.
7. *What does "authenticated encryption" (AEAD) mean and why does it matter?* The scheme provides both confidentiality (encryption) and integrity/authenticity (a verifiable tag) in one primitive. It matters because unauthenticated ciphertext can be tampered with (bit-flipping, padding-oracle attacks) without detection; AEAD modes reject tampered ciphertext outright before releasing any plaintext.
8. *Explain envelope encryption and why cloud KMS services use it.* A locally generated data key encrypts bulk data; a master key held in an HSM encrypts (wraps) that data key. This keeps expensive/rate-limited HSM operations small (touching only tiny keys, never bulk data) and makes key rotation cheap (re-wrap data keys instead of re-encrypting everything).
9. *What happens if you reuse a nonce with AES-GCM under the same key?* XORing the two resulting ciphertexts cancels the keystream, leaking the XOR of the two plaintexts (often fully recoverable); worse, GCM nonce reuse can leak the authentication subkey, letting an attacker forge valid ciphertexts for that key going forward.
10. *RSA vs elliptic curve — how do you choose for a new system?* ECC (X25519/Ed25519) gives equivalent security with much smaller keys and faster operations — a 256-bit curve key roughly matches a 3072-bit RSA key. Default to ECC for new systems; use RSA mainly for legacy interoperability.
11. *How would you design encryption-at-rest for a multi-tenant SaaS database?* Envelope encryption per tenant (or per sensitive column), each tenant's data key wrapped by a shared or tenant-specific master key in a KMS, access-controlled by IAM so a compromised app credential alone can't decrypt everything, with rotation tested and instrumented, plus TLS for all data in transit to/from the database.
12. *What is confidential computing / encryption-in-use, and why is it emerging now?* It protects data even while actively being computed on, using hardware Trusted Execution Environments (Intel SGX, AMD SEV, AWS Nitro Enclaves) that keep memory encrypted and isolated from a privileged host OS or hypervisor. It closes the last gap left by "at rest + in transit" encryption, relevant for highly sensitive AI workloads (health, financial data) where even the infrastructure provider must not see plaintext.
`,

  "coding-questions": `
### 1. Implement a rotation-safe encrypt/decrypt utility (tests key management understanding)

~~~python
from cryptography.fernet import Fernet, MultiFernet
from typing import List

class RotatingEncryptor:
    """Encrypts with the newest key; decrypts with any key still in the list.
    New keys should be PREPENDED so encryption always uses the latest."""

    def __init__(self, keys: List[bytes]):
        if not keys:
            raise ValueError("at least one key is required")
        self._keys = list(keys)                       # newest key is always keys[0]
        self._fernets = MultiFernet([Fernet(k) for k in self._keys])

    def encrypt(self, plaintext: bytes) -> bytes:
        return self._fernets.encrypt(plaintext)         # always uses keys[0], the newest

    def decrypt(self, token: bytes, ttl_seconds: int | None = None) -> bytes:
        return self._fernets.decrypt(token, ttl=ttl_seconds)  # tries every key in order

    def rotate(self, new_key: bytes) -> "RotatingEncryptor":
        """Prepends new_key so it becomes the encryption default; every
        old key is retained so previously encrypted tokens still decrypt."""
        return RotatingEncryptor([new_key, *self._keys])

# Usage
key_v1 = Fernet.generate_key()
enc = RotatingEncryptor([key_v1])
token_old = enc.encrypt(b"customer email: a@example.com")

key_v2 = Fernet.generate_key()
enc = enc.rotate(key_v2)                                # now encrypts with key_v2
token_new = enc.encrypt(b"customer email: b@example.com")

assert enc.decrypt(token_old) == b"customer email: a@example.com"  # old key still works
assert enc.decrypt(token_new) == b"customer email: b@example.com"
~~~

Complexity: O(n) in the number of candidate keys for decryption (tries each in order), O(1) for encryption. Follow-up: how do you know when it's safe to finally drop a retired key? (Answer: once you've confirmed, via a re-encryption sweep or an expiry policy, that no ciphertext still relies on it.)

### 2. AES-GCM file encryption with streaming and tamper detection (tests AEAD understanding)

~~~python
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def encrypt_bytes(plaintext: bytes, key: bytes, associated_data: bytes = b"") -> bytes:
    """Returns nonce || ciphertext (ciphertext includes the auth tag appended)."""
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)                      # unique per call — never reuse under this key
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)
    return nonce + ciphertext                    # store nonce alongside ciphertext

def decrypt_bytes(blob: bytes, key: bytes, associated_data: bytes = b"") -> bytes:
    nonce, ciphertext = blob[:12], blob[12:]
    aesgcm = AESGCM(key)
    try:
        return aesgcm.decrypt(nonce, ciphertext, associated_data)
    except Exception as exc:
        # Never partially trust output on failure — fail closed with a clear error
        raise ValueError("decryption failed: wrong key or tampered ciphertext") from exc

key = AESGCM.generate_key(bit_length=256)
blob = encrypt_bytes(b"contents of a sensitive file", key, associated_data=b"file:report.csv")
assert decrypt_bytes(blob, key, associated_data=b"file:report.csv") == b"contents of a sensitive file"
~~~

Complexity: O(n) in plaintext size for both directions. Follow-up they'll ask: how do you handle files too large to fit in memory? (Answer: use a chunked AEAD streaming construction with per-chunk nonces derived from a base nonce plus a counter, being careful never to let the counter repeat.)

### 3. Simulate envelope encryption locally (tests the KMS pattern conceptually)

~~~python
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class FakeKMS:
    """Stands in for AWS KMS/GCP KMS locally for tests — never use in production."""
    def __init__(self):
        self._master_key = AESGCM.generate_key(bit_length=256)

    def generate_data_key(self) -> tuple[bytes, bytes]:
        data_key = AESGCM.generate_key(bit_length=256)
        nonce = os.urandom(12)
        wrapped = nonce + AESGCM(self._master_key).encrypt(nonce, data_key, None)
        return data_key, wrapped

    def unwrap_data_key(self, wrapped: bytes) -> bytes:
        nonce, ciphertext = wrapped[:12], wrapped[12:]
        return AESGCM(self._master_key).decrypt(nonce, ciphertext, None)

kms = FakeKMS()
data_key, wrapped_key = kms.generate_data_key()

nonce = os.urandom(12)
ciphertext = AESGCM(data_key).encrypt(nonce, b"row of sensitive data", None)
del data_key                                    # discard plaintext DEK after use

# ... later, on the read path ...
recovered_data_key = kms.unwrap_data_key(wrapped_key)
plaintext = AESGCM(recovered_data_key).decrypt(nonce, ciphertext, None)
assert plaintext == b"row of sensitive data"
~~~

Complexity: O(1) master-key operations per record regardless of data size. Follow-up: why is this better than encrypting every record directly with the master key? (Answer: keeps the expensive/rate-limited HSM operations small, and rotating the master key only requires re-wrapping data keys, not re-encrypting all data.)
`,

  "hands-on-labs": `
### Lab 1 — Fernet secrets encryptor (beginner, ~1h)
Build a small CLI that encrypts and decrypts values from a .env-style file using Fernet, generating and storing the key separately from the encrypted file. Stretch: add a ttl-based expiry for one-time-use tokens. Skills: Fernet basics, key/ciphertext separation discipline.

### Lab 2 — AES-GCM from the ground up, with a tamper demo (intermediate, ~2h)
Implement encrypt/decrypt helpers using the low-level AESGCM primitive, correctly generating a fresh nonce per call. Then deliberately flip a bit in stored ciphertext and demonstrate that decryption raises an InvalidTag error rather than silently returning corrupted data. Deliverable: a short write-up explaining why this fail-closed behavior matters. Skills: AEAD internals, nonce discipline, tamper detection.

### Lab 3 — Build a local envelope-encryption simulator (advanced, ~3h)
Implement a FakeKMS class (like the one in Coding Questions) with generate_data_key and unwrap_data_key methods, then build an EncryptedStore class on top that transparently wraps/unwraps data keys per record. Add a rotate_master_key operation and prove that previously stored records still decrypt correctly after rotation (by re-wrapping their data keys, not re-encrypting their data). Skills: envelope encryption, key rotation mechanics.

### Lab 4 — Production-grade encrypted field service (production, ~4h)
Build a small FastAPI service with an endpoint that accepts sensitive text, encrypts it via envelope encryption (using a real cloud KMS if available, or Lab 3's simulator otherwise), stores ciphertext + wrapped key in a database, and a second endpoint that decrypts and returns it to authorized callers only. Add structured logging (never logging plaintext or keys), metrics for KMS call latency and decryption failure rate, and a Dockerfile with no key material baked in. Skills: the entire production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects, each mapping to skills employers screen for:

1. **Minimal encrypted secrets vault** — A CLI/service that stores named secrets, deriving an encryption key from a master password via a slow key-derivation function (scrypt or Argon2, imported from the cryptography library), encrypting values with AES-GCM, and supporting key rotation. Demonstrates: password-based key derivation, AEAD usage, rotation design — a scoped-down HashiCorp Vault.

2. **Envelope-encrypted file storage service** — A FastAPI service where uploaded files are envelope-encrypted (data key per file, wrapped by a KMS or local master key), stored in object storage or a database, and only decrypted for authorized, audited requests. Demonstrates: the full envelope-encryption production pattern, access control layered on top of encryption, audit logging.

3. **End-to-end encrypted chat demo** — A minimal messaging app using X25519 key exchange per conversation and AES-GCM per message, with a simplified ratcheting scheme (deriving a new message key from the previous one) to approximate forward secrecy. Demonstrates: hybrid encryption in a realistic protocol shape, understanding of the Signal Protocol's core ideas without needing the full Double Ratchet specification.

Each project: full type hints, a dedicated crypto/ test suite (tamper rejection, wrong-key rejection, nonce uniqueness), a documented key-rotation runbook, and a README explaining the threat model addressed and explicitly NOT addressed. The threat-model clarity is what distinguishes a senior-level crypto project from a toy one.
`,

  "case-studies": `
### Adobe's 2013 breach: encryption used where hashing was needed, in ECB mode

Adobe's 2013 breach exposed roughly 150 million user records where passwords had been encrypted with symmetric encryption (reportedly 3DES in ECB mode) rather than hashed. Because ECB preserves patterns, identical passwords produced identical ciphertext, and researchers were able to group accounts with matching passwords together and use password hints stored alongside the data to guess large numbers of them despite never recovering the encryption key. Lesson: this single breach demonstrates BOTH classic mistakes on this page at once — using reversible encryption for passwords instead of one-way hashing (see the **Hashing** skill), and using ECB mode, which leaked exploitable structure even without breaking the underlying cipher.

### Sony PlayStation 3: ECDSA nonce reuse leaks the entire signing key

In 2010, security researchers (the fail0verflow group) demonstrated that Sony's PS3 firmware signing implementation reused the same "random" nonce for every ECDSA signature it generated, instead of generating a fresh one each time. Because ECDSA's security depends on the nonce being unique and secret per signature, reusing it across multiple signed messages allowed straightforward algebra to solve for and fully recover Sony's private signing key — permanently breaking the platform's code-signing security. Lesson: nonce reuse is catastrophic in asymmetric signature schemes exactly as it is in symmetric AEAD modes like GCM — "unique per operation" is not an optional detail, it's the whole security property.

### WEP Wi-Fi encryption: a 24-bit nonce space that was too small

The original WEP (Wired Equivalent Privacy) Wi-Fi security protocol used RC4 with a mere 24-bit initialization vector. On any moderately busy network, IVs began repeating within hours, and published attacks (Fluhrer-Mantin-Shamir, 2001) combined with widely available tools (Aircrack) could recover the WEP key from a modest amount of captured traffic. Lesson: nonce/IV space must be large enough that collisions are astronomically unlikely for the actual traffic volume expected — a 24-bit space was simply too small for real-world Wi-Fi usage, and WEP was fully deprecated in favor of WPA/WPA2 as a direct result.

### Heartbleed (2014): a memory-safety bug, not a cryptography bug, that still broke encryption's guarantees

The Heartbleed vulnerability was a buffer over-read bug in OpenSSL's implementation of the TLS heartbeat extension, allowing attackers to read up to 64KB of server process memory per request — including, in many real cases, the server's private TLS keys, session data, and user credentials. The cryptographic algorithms themselves (AES, RSA) were never broken; the implementation surrounding them had a memory-safety flaw. Lesson: cryptography is only as strong as the code that surrounds it — using a "correct" algorithm doesn't protect you from an implementation bug in the library or protocol code handling the keys and buffers, which is a core reason to rely on widely used, heavily audited libraries and keep them patched rather than vendoring an old copy.
`,

  comparisons: `
| Dimension | AES (symmetric) | RSA (asymmetric) | ECC / X25519-Ed25519 (asymmetric) | ChaCha20-Poly1305 (symmetric) | Base64 (encoding, not encryption) |
|-----------|------------------|-------------------|-------------------------------------|-------------------------------|-------------------------------------|
| Reversible with a key? | Yes | Yes | Yes | Yes | Yes, but no key needed at all |
| Typical use | Bulk data encryption at rest/in transit | Key exchange, signatures, legacy interop | Key exchange, signatures (modern default) | Bulk data, especially on hardware without AES acceleration | Making binary data text-safe (never for confidentiality) |
| Speed for large payloads | Very fast (hardware-accelerated) | Very slow, size-limited | Key agreement is fast; not used for bulk data directly | Very fast, especially in pure software | N/A (not a security mechanism) |
| Key size for comparable security | 256-bit | ~3072–4096-bit (for AES-256-equivalent strength) | ~256–384-bit | 256-bit | N/A |
| Provides authentication built in? | Only in AEAD modes (GCM) | Only via a separate signature scheme | Only via a separate signature scheme (Ed25519) | Yes, Poly1305 provides the MAC | No — provides nothing |
| Quantum vulnerability | Reduced strength only (Grover's algorithm), still safe at 256-bit | Broken by Shor's algorithm on a sufficiently powerful quantum computer | Broken by Shor's algorithm on a sufficiently powerful quantum computer | Reduced strength only, still safe at 256-bit | N/A |

**How seniors choose**: symmetric AEAD (AES-GCM or ChaCha20-Poly1305) for essentially all bulk data by default; asymmetric crypto exclusively for key exchange and signatures, never for bulk data directly; ECC over RSA for any new system without a hard legacy-interop requirement; and Base64/hex are reached for purely as an encoding step, layered around real encryption, never mistaken for it. Compare all of this against the **Hashing** skill's table, since the most common real-world mistake is picking encryption when hashing (one-way, no key to recover) was the actually correct tool — passwords being the canonical example.
`,

  "related-technologies": `
- **Hashing** — the one-way counterpart to encryption; essential to understand the contrast, especially for password storage and integrity checks. Read this pairing together.
- **TLS & HTTPS** — encryption's most important production application; the full hybrid-encryption handshake covered at a protocol level.
- **Secrets Management** — where encryption keys themselves must actually live (vaults, KMS, HSMs) once you accept that key security IS the real security boundary.
- **OWASP Top 10** — situates encryption (and its absence — "Cryptographic Failures" is a top-10 category in its own right) within the broader landscape of application security risks.
- **SQL Injection, XSS, CSRF** — sibling application-security topics; encryption doesn't prevent any of these, and understanding the boundaries of what each control actually protects against is a core security-engineering skill.
- **PKI / Digital Certificates** (covered within TLS & HTTPS) — the trust infrastructure that binds public keys to verified identities, without which asymmetric encryption alone can't prevent man-in-the-middle attacks.
- **Confidential Computing / Trusted Execution Environments** — the emerging "encryption in use" layer (Intel SGX, AMD SEV, AWS Nitro Enclaves) closing the last gap beyond at-rest and in-transit protection.
- **HashiCorp Vault, AWS KMS, GCP Cloud KMS, Azure Key Vault** — the concrete tools implementing the key-management and envelope-encryption patterns described on this page.

On this platform, the natural next pages: **Hashing** → **TLS & HTTPS** → **Secrets Management** → **OWASP Top 10**, forming the complete applied-cryptography and security foundation.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early 2026) — check NIST's Computer Security Resource Center and the pyca/cryptography changelog for anything newer.

- **Post-quantum cryptography standardization (2024)**: NIST finalized its first three post-quantum cryptography standards — FIPS 203 (ML-KEM, based on CRYSTALS-Kyber, for key encapsulation/exchange), FIPS 204 (ML-DSA, based on CRYSTALS-Dilithium, for digital signatures), and FIPS 205 (SLH-DSA, based on SPHINCS+, a conservative hash-based signature scheme). This marks the beginning of a multi-year industry migration for systems protecting long-lived secrets.
- **Hybrid post-quantum key exchange in TLS**: browsers and CDNs (including Cloudflare and Google Chrome) have been rolling out hybrid classical+post-quantum key exchange (combining X25519 with ML-KEM) in TLS 1.3 as a transitional measure, protecting today's traffic against future "harvest now, decrypt later" attacks even before classical algorithms are actually broken.
- **Confidential computing maturing**: cloud providers continue expanding hardware-backed confidential computing offerings (AWS Nitro Enclaves, Azure confidential VMs, Google Confidential Computing) as encryption-in-use becomes a more mainstream requirement for regulated and highly sensitive AI workloads.
- **AES and ECC remain the unchallenged production defaults** for classical symmetric and asymmetric encryption respectively; no practical cryptanalytic break of properly implemented AES-GCM or X25519/Ed25519 is known as of this writing.
- **Ecosystem note**: the Python "cryptography" library continues to be the recommended choice, tracking upstream OpenSSL security fixes closely; always pin and regularly update it in production dependency manifests given how security-critical this dependency is.
`,

  "future-roadmap": `
Where encryption is heading over the next several years:

1. **The post-quantum migration becomes a real, multi-year engineering project.** Systems protecting data that must remain confidential for a decade or more (health records, government/defense data, some financial records) need to start planning hybrid classical+post-quantum key exchange now, given "harvest now, decrypt later" attacks where adversaries record encrypted traffic today to decrypt once quantum computers mature.
2. **Confidential computing (encryption-in-use) moves from niche to mainstream** for AI workloads specifically — as more sensitive data (health, legal, financial) flows through LLM pipelines, hardware-attested enclaves that keep data encrypted even during model inference will become a differentiator and, eventually, an expectation for regulated industries.
3. **Crypto-agility becomes a design requirement, not an afterthought.** Systems architected so that swapping an algorithm (classical to post-quantum, or responding to an unexpected cryptanalytic break) doesn't require a ground-up rewrite will be increasingly valued — this is exactly why this page emphasizes centralizing encryption behind one internal module.
4. **KMS/envelope encryption keeps consolidating as the default pattern**, with cloud providers adding more automation around rotation, multi-region replication, and data-key caching, reducing the amount of custom crypto-adjacent code teams need to write and maintain themselves.
5. **AEAD becomes the assumed baseline everywhere**, with unauthenticated modes increasingly flagged automatically by linters, library deprecations, and compliance scanners rather than relying on developer discipline alone.

For your career: understanding envelope encryption, AEAD correctness (nonce discipline, tamper detection), and the emerging post-quantum transition will separate "knows how to call an encrypt function" from "can be trusted to design a production key-management architecture" over the next five years.
`,

  "cheat-sheet": `
~~~python
# --- The one rule that matters most ---
# Encryption is REVERSIBLE (needs a key). Hashing is ONE-WAY (no key).
# Base64/hex encoding is REVERSIBLE with NO key at all -- not security.

# --- High-level: Fernet (default choice for application data) ---
from cryptography.fernet import Fernet, MultiFernet
key = Fernet.generate_key()
token = Fernet(key).encrypt(b"secret")
plaintext = Fernet(key).decrypt(token)                 # raises if tampered/wrong key
rotator = MultiFernet([Fernet(new_key), Fernet(old_key)])  # rotation-safe decrypt

# --- Low-level: AES-GCM (authenticated symmetric encryption) ---
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
key = AESGCM.generate_key(bit_length=256)
nonce = os.urandom(12)                                  # UNIQUE per message, always
ct = AESGCM(key).encrypt(nonce, b"data", associated_data=None)
pt = AESGCM(key).decrypt(nonce, ct, associated_data=None)  # raises InvalidTag on tamper

# --- Asymmetric: RSA (legacy/interop) and X25519 (modern default) ---
from cryptography.hazmat.primitives.asymmetric import rsa, x25519
rsa_priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
alice_priv = x25519.X25519PrivateKey.generate()
shared_secret = alice_priv.exchange(bob_public_key)     # ECDH key agreement

# --- Envelope encryption (KMS pattern) ---
# 1. data_key, wrapped_key = kms.generate_data_key()
# 2. ciphertext = AESGCM(data_key).encrypt(nonce, data, None); discard data_key
# 3. store ciphertext + nonce + wrapped_key
# 4. later: data_key = kms.decrypt(wrapped_key); AESGCM(data_key).decrypt(...)

# --- Never do this ---
# ECB mode                       -- leaks plaintext structure
# hardcoded keys in source       -- ships to every clone/backup/git history
# reused nonce under same key    -- breaks confidentiality, can leak GCM auth key
# homemade ciphers                -- not reviewed, almost certainly breakable
# encrypting passwords instead of hashing them  -- see the Hashing skill

# --- At rest / in transit / in use ---
# At rest:   AES-256 (disk/db), envelope-encrypted with a KMS master key
# In transit: TLS 1.3 (hybrid ECDHE + AES-GCM/ChaCha20-Poly1305)
# In use:    confidential computing / TEEs (Intel SGX, AMD SEV, AWS Nitro Enclaves)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Is encryption reversible? | Yes -- given the key, the exact plaintext is recovered. This is the core difference from hashing. |
| Is Base64 encryption? | No -- it's a reversible encoding with no key; anyone can decode it without any secret. |
| Why is ECB mode broken? | Identical plaintext blocks always produce identical ciphertext blocks, leaking structural patterns (the "ECB penguin"). |
| What does AEAD mean? | Authenticated Encryption with Associated Data -- provides confidentiality AND a verifiable integrity/authenticity tag in one primitive. |
| What happens if you reuse a nonce in AES-GCM? | Confidentiality breaks (XOR of plaintexts leaks), and it can leak the authentication subkey, enabling ciphertext forgery. |
| Symmetric vs asymmetric encryption? | Symmetric: one shared key, fast, needs secure key distribution. Asymmetric: public/private key pair, slower, solves key distribution. |
| What is hybrid encryption? | Using asymmetric crypto to exchange a symmetric session key, then symmetric crypto for the actual bulk data -- exactly what TLS does. |
| What is envelope encryption? | A data key encrypts the data; a master key (in a KMS/HSM) encrypts the data key -- keeps HSM ops small and rotation cheap. |
| RSA vs ECC key size for equivalent security? | ECC's 256-bit key roughly matches RSA's 3072-4096-bit key -- ECC is smaller and faster. |
| What should you use for password storage -- encryption or hashing? | Hashing (bcrypt/argon2), never encryption -- encryption is reversible, so a key leak recovers every password at once. |
| At rest vs in transit vs in use? | At rest: disk/DB (AES). In transit: network (TLS). In use: memory during processing (confidential computing/TEEs). |
| What's the golden rule for nonces? | Never reuse a (key, nonce) pair -- generate a fresh random nonce per encryption call. |
| Should you write your own encryption algorithm? | No -- always use a standardized, publicly reviewed, audited library implementation (AES, RSA, ECC). |
| What is forward secrecy? | Using ephemeral keys per session so a later leak of long-term keys can't decrypt past recorded traffic. |
| What broke Sony's PS3 signing key? | Reusing the same "random" nonce across every ECDSA signature, allowing full private-key recovery. |
`,

  mcqs: `
**1. Which statement correctly distinguishes encryption from hashing?**

A) Both are reversible with the right key  B) Encryption is reversible with a key; hashing is one-way with no key to recover input  C) Hashing is reversible; encryption is not  D) They are interchangeable for password storage

**Answer: B** -- this is the single most important distinction in applied cryptography; conflating them (e.g. "encrypting" passwords) is a serious, common vulnerability.

**2. Why is Base64 encoding not a form of encryption?**

A) It uses a weak key  B) It only works on text, not binary  C) It requires no key at all and reverses instantly for anyone  D) It's slower than AES

**Answer: C** -- Base64 provides zero confidentiality; it exists purely to make binary data safe inside text formats.

**3. What is the core problem with AES in ECB mode?**

A) It's too slow for production  B) Identical plaintext blocks produce identical ciphertext blocks, leaking structure  C) It requires a 4096-bit key  D) It cannot be implemented in Python

**Answer: B** -- the "ECB penguin" image demonstration shows this directly: the encrypted image still shows a recognizable outline.

**4. In AES-GCM, what happens if the authentication tag doesn't match on decryption?**

A) The library returns the plaintext anyway with a warning  B) The library must reject and return NO plaintext at all  C) Only the first block is discarded  D) The nonce is automatically regenerated

**Answer: B** -- AEAD modes must fail closed; releasing any plaintext on a failed tag check reopens padding-oracle-style vulnerabilities.

**5. Why does TLS use hybrid encryption instead of pure asymmetric or pure symmetric crypto?**

A) Asymmetric crypto is too slow/size-limited for bulk data, so it's used only to establish a symmetric session key, which then handles the fast bulk encryption  B) Symmetric crypto can't be implemented in browsers  C) Regulations require both  D) It provides no advantage; it's purely historical

**Answer: A** -- this is exactly the hybrid encryption pattern: asymmetric for key exchange, symmetric for speed on bulk data.

**6. What is the primary benefit of envelope encryption in a cloud KMS?**

A) It removes the need for any encryption key at all  B) It lets the HSM/master key only ever handle small data keys, keeping rotation cheap and HSM operations fast  C) It makes ciphertext smaller than plaintext  D) It eliminates the need for TLS

**Answer: B** -- the master key never touches bulk data directly; rotating it only requires re-wrapping small data keys, not re-encrypting everything.
`,

  "revision-notes": `
**Core distinction in one line:** Encryption is reversible with a key (get plaintext back); hashing is one-way with no key (verify a match only); encoding (Base64/hex) is reversible with NO key at all and provides zero security. Confusing these, especially encrypting passwords instead of hashing them, is the most common serious mistake in this space.

**Symmetric vs asymmetric in 4 lines:** Symmetric (AES) uses one shared key, is fast, and needs secure key distribution first. Asymmetric (RSA, ECC/X25519) uses a public/private key pair, solves key distribution mathematically, but is slow and size-limited. Hybrid encryption combines both: asymmetric key exchange establishes a symmetric session key, then symmetric crypto (AES-GCM/ChaCha20-Poly1305) handles the actual data -- exactly what TLS does.

**Modes and authentication in 4 lines:** Never use ECB -- identical blocks leak structure (the "ECB penguin"). Always use an authenticated mode (AEAD): AES-GCM or ChaCha20-Poly1305, which produce a verifiable tag alongside the ciphertext. Never reuse a nonce under the same key -- it breaks confidentiality and, in GCM, can leak the authentication key entirely, enabling forgery. Always verify the tag before trusting any decrypted plaintext -- fail closed on mismatch.

**Key management in 4 lines:** Generate keys with a CSPRNG, never hardcode or commit them. Store master keys in a KMS/vault/HSM, never in application code. Envelope encryption (data key encrypts data; master key wraps the data key) keeps HSM operations small and makes rotation cheap. Rotate on a schedule and immediately after any suspected compromise, keeping old keys available for decrypting legacy data during the transition.

**The three states of data in 3 lines:** At rest (disk/DB) -- protect with AES, usually via envelope encryption. In transit (network) -- protect with TLS (hybrid encryption end to end). In use (actively being processed in memory) -- the emerging gap closed by confidential computing / hardware trusted execution environments; all three are needed together, none substitutes for another.
`,

  "learning-roadmap": `
A realistic path to production-ready applied cryptography knowledge:

**Week 1 -- Foundations and the core distinction.** Read Overview through Beginner Concepts. Do the Fernet lab (Lab 1). Milestone: you can explain, without hesitation, why Base64 is not encryption and why encryption is not hashing.

**Week 2 -- Symmetric encryption deeply.** Intermediate and Advanced Concepts on AES modes, AEAD, and nonce discipline. Do Lab 2 (AES-GCM with a tamper demo). Milestone: you can explain the ECB penguin problem and reproduce a tamper-detection failure yourself.

**Week 3 -- Asymmetric encryption and hybrid systems.** Re-read the RSA/ECC/hybrid-encryption sections; work through the X25519 key-exchange code example until it's intuitive. Read the **TLS & HTTPS** skill in parallel to see the pattern applied at protocol scale. Milestone: you can whiteboard a TLS-style hybrid handshake from memory.

**Week 4 -- Key management and envelope encryption.** Internal Working through Architecture sections. Do Lab 3 (local envelope-encryption simulator). Read the **Secrets Management** skill. Milestone: you can explain why cloud KMS services are all built around envelope encryption.

**Week 5 -- Production hardening.** Production Usage through Production Checklist. Do Lab 4 (full production-grade encrypted-field service). Milestone: a containerized, instrumented service with a tested key-rotation path on your GitHub.

**Week 6 -- Interview polish and a real project.** Interview and Coding Questions sections; build one of the Real Projects (recommend the envelope-encrypted file storage service). Milestone: explain AEAD, envelope encryption, hybrid encryption, and the encryption-vs-hashing distinction out loud, unprompted, with a concrete exploit example for each classic mistake.

Then continue to the **Hashing** skill if you haven't already (ideally read alongside this page), then **TLS & HTTPS**, then **Secrets Management** -- together these four complete the applied-cryptography foundation this platform builds toward.
`,

  "official-docs": `
- [pyca/cryptography documentation](https://cryptography.io/) -- the Python library used throughout this page; read the "Fernet" and "hazmat primitives" sections closely.
- [NIST FIPS 197 -- Advanced Encryption Standard (AES)](https://csrc.nist.gov/publications/detail/fips/197/final) -- the official AES specification.
- [NIST SP 800-38D -- Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)](https://csrc.nist.gov/publications/detail/sp/800-38d/final) -- the official GCM specification.
- [NIST Post-Quantum Cryptography project](https://csrc.nist.gov/projects/post-quantum-cryptography) -- FIPS 203/204/205 and ongoing standardization work.
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) -- practical, security-review-oriented guidance that pairs directly with this page's Best Practices and Anti-Patterns sections.
- [RFC 8446 -- TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446) -- the protocol that puts hybrid encryption into practice at internet scale; see the **TLS & HTTPS** skill for a guided walkthrough.
- [libsodium documentation](https://doc.libsodium.org/) -- an alternative, deliberately minimal and misuse-resistant crypto library, useful for comparing API philosophies against pyca/cryptography.
`,

  books: `
- **Serious Cryptography, 2nd ed.** -- Jean-Philippe Aumasson. The best modern, practitioner-focused introduction; covers AES, RSA, ECC, and post-quantum crypto without excessive math.
- **Cryptography Engineering** -- Ferguson, Schneier, and Kohno. The classic "how to actually build systems with cryptography" book, with a strong focus on the implementation mistakes covered in this page's Anti-Patterns section.
- **Real-World Cryptography** -- David Wong. Excellent, very current coverage of AEAD, key exchange, and the protocols (TLS, Signal) that use them in production.
- **Applied Cryptography, 2nd ed.** -- Bruce Schneier. The historically foundational text; dated in some specifics but still valuable for building intuition about attacks and protocol design.
- **Understanding Cryptography** -- Paar and Pelzl. A strong textbook if you want the underlying number theory and math proofs behind AES, RSA, and ECC.
- **The Code Book** -- Simon Singh. An accessible, narrative history of cryptography from the Caesar cipher through modern public-key systems -- an excellent complement to the History section above.
`,

  blogs: `
- **A Few Thoughts on Cryptographic Engineering** (Matthew Green) -- rigorous, readable analysis of real-world cryptographic systems and their flaws, written by a working cryptography researcher.
- **ImperialViolet** (Adam Langley) -- deep technical posts on TLS internals and applied cryptography from a former Google/Chrome security engineer.
- **Filippo Valsorda's blog** (filippo.io) -- clear, practical writing on Go's crypto internals and applied cryptography engineering, much of it directly relevant regardless of language.
- **Troy Hunt's blog** (troyhunt.com) -- breach analysis (including the Adobe case study above) with a strong security-engineering lens.
- **Latacora's blog** -- the widely cited "Cryptographic Right Answers" post is an excellent, opinionated, practitioner-grade quick-reference that pairs well with this page's Best Practices section.
- **Google Security Blog** -- announcements and technical deep dives on Google's cryptography and infrastructure security work, including Tink and post-quantum rollouts.
`,

  "research-papers": `
- **"A Method for Obtaining Digital Signatures and Public-Key Cryptosystems"** -- Rivest, Shamir, and Adleman (1978). The original RSA paper.
- **"New Directions in Cryptography"** -- Diffie and Hellman (1976). Introduces public-key cryptography and the Diffie-Hellman key exchange; arguably the single most consequential paper in this field's history.
- **"The Galois/Counter Mode of Operation (GCM)"** -- McGrew and Viega. The design paper behind AES-GCM, the modern default AEAD mode covered throughout this page.
- **NIST FIPS 197** -- the official AES specification (based on Daemen and Rijmen's Rijndael submission to NIST's competition).
- **NIST FIPS 203, 204, 205 (2024)** -- the finalized post-quantum cryptography standards (ML-KEM, ML-DSA, SLH-DSA); the most consequential recent cryptography standardization event.
- **Claude Shannon, "Communication Theory of Secrecy Systems" (1949)** -- the founding paper of mathematical cryptography, introducing confusion and diffusion, concepts every block cipher (including AES) is built on.

This topic has an unusually rich and directly readable research-paper trail compared to many engineering skills on this platform -- the papers above are genuinely approachable and worth reading in the original rather than only through summaries.
`,

  videos: `
- **Computerphile's cryptography series** (YouTube) -- consistently clear explanations of AES, RSA, Diffie-Hellman, and elliptic curves aimed at working engineers, not just cryptographers.
- **Dan Boneh's "Cryptography I" (Stanford, Coursera)** -- the standard rigorous-but-accessible academic course; his lectures on block ciphers, public-key crypto, and key exchange map directly onto this page's structure.
- **Real World Crypto conference talks** -- an annual conference explicitly focused on cryptography as actually deployed in industry (TLS, Signal, cloud KMS design); talks are freely available and highly relevant to production engineers.
- **"The ECB Penguin" demonstrations** -- search for visual walkthroughs recreating the classic ECB-mode image demonstration; seeing it once makes the concept permanent in a way text alone doesn't.
- **Moxie Marlinspike's talks on the Signal Protocol** -- direct explanations of X3DH and the Double Ratchet from the protocol's original designer, connecting this page's hybrid-encryption concepts to a real, widely deployed system.
`,

  "github-repos": `
- [pyca/cryptography](https://github.com/pyca/cryptography) -- the Python library used throughout this page; browse the hazmat/primitives source to see how AEAD and asymmetric primitives are exposed.
- [openssl/openssl](https://github.com/openssl/openssl) -- the reference implementation underlying most of the world's TLS and symmetric/asymmetric cryptography; also the codebase where Heartbleed occurred, useful context for the Case Studies section.
- [jedisct1/libsodium](https://github.com/jedisct1/libsodium) -- a deliberately small, hard-to-misuse crypto library (based on NaCl); an excellent contrast in API philosophy against lower-level OpenSSL-style libraries.
- [google/tink](https://github.com/google/tink) -- Google's multi-language cryptography library, purpose-built to make correct usage (proper AEAD, key rotation, misuse resistance) the default path.
- [signalapp/libsignal](https://github.com/signalapp/libsignal) -- the reference implementation of the Signal Protocol (X3DH + Double Ratchet); read this after building the end-to-end encrypted chat project in Real Projects.
- [hashicorp/vault](https://github.com/hashicorp/vault) -- a production secrets-management and encryption-as-a-service system implementing the Transit engine's envelope-encryption pattern; see the **Secrets Management** skill for depth.
- [aws/aws-encryption-sdk-python](https://github.com/aws/aws-encryption-sdk-python) -- a real-world reference implementation of envelope encryption with data-key caching, directly extending the patterns in Advanced Concepts and Coding Questions.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Core distinction fluency*: given a mixed list of operations (Base64 encode a string, bcrypt-hash a password, AES-GCM encrypt a file), correctly label each as encoding, hashing, or encryption and justify the choice.
2. *ECB detection*: given several ciphertext samples of the same repetitive image or structured data encrypted under different modes, identify which one used ECB purely by spotting repeated ciphertext block patterns.
3. *AEAD correctness*: implement AES-GCM encrypt/decrypt, then write a test that deliberately corrupts one byte of ciphertext and asserts decryption raises rather than returning garbage silently.
4. *Nonce discipline*: write a function that generates and tracks nonces for a fixed key across many calls, and add an assertion that catches any accidental repeat (simulating the WEP/PS3 class of bugs).
5. *Hybrid encryption from scratch*: implement an X25519 key exchange between two parties, derive a symmetric key from the shared secret (using HKDF), and use it to AES-GCM encrypt a message -- essentially a miniature TLS-style handshake.
6. *Envelope encryption*: implement the FakeKMS pattern from Coding Questions, then add master-key rotation and prove old records still decrypt via data-key re-wrapping without touching the underlying ciphertext.
7. *Key derivation*: derive an encryption key from a user password using scrypt or Argon2 (never a fast general-purpose hash), and explain why a fast hash function would be a critical mistake here.

External practice sets: **cryptopals.com** (the Matasano Crypto Challenges) is the canonical hands-on set for applied cryptography, walking through exactly the classes of bugs covered in this page's Anti-Patterns and Case Studies sections, from breaking ECB to forging authentication. **CryptoHack.org** offers gamified, CTF-style cryptography challenges spanning symmetric and asymmetric crypto for additional structured practice.
`,

  "architecture-diagram": `
The reference architecture for encryption in a production AI-engineering service -- the shape you'll build repeatedly on this platform:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] -->|TLS 1.3: hybrid ECDHE + AES-GCM| LB["Load balancer / API gateway\n(TLS termination)"]
    LB -->|mTLS between services| API1["Service pod 1"]
    LB -->|mTLS between services| API2["Service pod N"]
    API1 & API2 -->|envelope-encrypted columns| PG[("PostgreSQL\nAES-256 at rest")]
    API1 & API2 -->|GenerateDataKey / Decrypt| KMS[("Cloud KMS / HSM\nmaster key never leaves here")]
    API1 & API2 -->|encrypted session data| RD[("Redis\nTLS + encryption at rest")]
    subgraph SecretsLayer["Secrets Management"]
        Vault["Vault / Secrets Manager\napp credentials, KMS access roles"]
    end
    API1 & API2 -.workload identity, no static keys.-> SecretsLayer
    subgraph Observability
        Logs["Structured logs\n(never plaintext/keys)"]
        Metrics["KMS latency, decrypt failure rate"]
    end
    API1 & API2 -.instrumented.-> Observability
~~~

Every box has a dedicated skill page on this platform (TLS & HTTPS for the client-facing edge, Secrets Management for the vault layer, this page for the KMS/envelope-encryption core); this diagram is the map of how they compose into one coherent security architecture.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Encryption))
    Foundations
      Reversible vs one-way -- vs Hashing
      Encoding is not encryption -- Base64
      Plaintext, key, ciphertext
    Symmetric
      AES
      Modes: ECB (broken) vs GCM (AEAD)
      Nonce/IV discipline
      ChaCha20-Poly1305
    Asymmetric
      RSA
      Elliptic curve: X25519, Ed25519
      Diffie-Hellman key exchange
      Digital signatures
    Hybrid encryption
      TLS handshake
      Forward secrecy
      Session keys
    Key management
      Generation: CSPRNG
      Rotation
      Distribution problem
      Envelope encryption -- KMS pattern
    Data states
      At rest
      In transit
      In use -- confidential computing
    Production
      Cloud KMS: AWS/GCP/Azure
      Vault / Secrets Management
      Monitoring: KMS latency, decrypt failures
      Testing: tamper rejection
    Security pitfalls
      Rolling your own crypto
      Hardcoded keys
      Reused nonces
      Missing authentication
    Career
      Interview classics
      Case studies: Adobe, PS3, WEP, Heartbleed
      Post-quantum migration
~~~
`,
};

export default encryption;
