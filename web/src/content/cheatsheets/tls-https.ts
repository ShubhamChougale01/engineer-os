import type { CheatSheetData } from "./types";

const tlsHttps: CheatSheetData = {
  title: "The Ultimate TLS and HTTPS Cheat Sheet",
  subtitle: "Handshake · certificates · PKI · mTLS · common misconfigurations · production toolbelt",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "TLS", desc: "Transport Layer Security — encrypts and authenticates a connection over TCP", code: "HTTPS = HTTP running inside a TLS tunnel" },
        { term: "HTTPS", desc: "HTTP over TLS — same protocol, encrypted and integrity-checked transport", code: "https://example.com  # port 443 by default" },
        { term: "Handshake", desc: "The negotiation phase that establishes a shared symmetric session key", code: "Asymmetric crypto bootstraps a symmetric key,\nthen bulk data uses fast symmetric encryption" },
        { term: "TLS 1.3 (1-RTT)", desc: "Modern handshake — one round trip, fewer negotiable (weak) options than 1.2", code: "Client and server agree on cipher +\nexchange keys in a single round trip" },
        { term: "TLS 1.2 (2-RTT, legacy)", desc: "Older handshake, slower, more negotiable legacy cipher suites (attack surface)", code: "Still supported for compatibility;\nprefer 1.3-only where you control both ends" },
        { term: "Cipher suite", desc: "The specific combination of key exchange, bulk cipher, and MAC algorithm in use", code: "TLS_AES_128_GCM_SHA256  # TLS 1.3 example" },
        { term: "Forward secrecy", desc: "Session keys can't be recovered even if the server's long-term private key later leaks", code: "Ephemeral Diffie-Hellman (ECDHE)\nis what provides this property" },
      ],
    },
    {
      title: "Certificates & PKI",
      color: "blue",
      rows: [
        { term: "X.509 certificate", desc: "The standard format binding a public key to an identity (domain)", code: "Contains: subject, issuer, public key,\nvalidity period, Subject Alternative Names" },
        { term: "Chain of trust", desc: "Root CA -> Intermediate CA -> leaf/server cert, each signing the next", code: "Browser trusts root CAs pre-installed in its store\nand validates the signature chain down to your cert" },
        { term: "Root CA", desc: "Self-signed, pre-trusted by operating systems and browsers", code: "Kept offline, used only to sign intermediates\nin a well-run CA" },
        { term: "Intermediate CA", desc: "Signs leaf certificates; insulates the root from daily exposure", code: "Compromise here is serious but revocable\nwithout revoking trust in the root" },
        { term: "SAN (Subject Alternative Name)", desc: "Lists every hostname a certificate is valid for", code: "SAN: example.com, www.example.com, api.example.com" },
        { term: "Let's Encrypt / ACME", desc: "Free, automated certificate issuance and renewal protocol", code: "certbot certonly --standalone -d example.com" },
        { term: "SNI (Server Name Indication)", desc: "Lets one IP host multiple HTTPS sites with different certs", code: "Client sends the target hostname\nin the clear before the cert is chosen" },
      ],
    },
    {
      title: "Production Patterns",
      color: "emerald",
      rows: [
        { term: "TLS termination at the load balancer", desc: "LB/reverse proxy decrypts TLS; internal traffic may be plaintext or re-encrypted", code: "nginx/ALB terminates TLS,\nforwards to app on internal network" },
        { term: "mTLS (mutual TLS)", desc: "Both client and server present certificates — strong service-to-service auth", code: "Common in service mesh / zero-trust\ninternal microservice architectures" },
        { term: "HSTS", desc: "Tells browsers to never use plain HTTP again for this domain, even if a user types http://", code: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload" },
        { term: "Redirect HTTP to HTTPS", desc: "Necessary but not sufficient — HSTS closes the gap on the very first request", code: "return redirect(url.replace('http://', 'https://'), 301)" },
        { term: "TLS 1.3-only servers", desc: "Reduces attack surface by dropping legacy negotiable weak cipher suites", code: "nginx: ssl_protocols TLSv1.3;" },
        { term: "Certificate auto-renewal", desc: "Let's Encrypt certs expire in 90 days by design — automate renewal, don't rely on manual ops", code: "certbot renew --quiet  # via cron/systemd timer" },
        { term: "OCSP stapling", desc: "Server proactively provides revocation status, avoiding a client round-trip to the CA", code: "nginx: ssl_stapling on;" },
      ],
    },
    {
      title: "Validation & Misconfigurations",
      color: "amber",
      rows: [
        { term: "Expired certificate", desc: "The most common self-inflicted outage in TLS-enabled production systems", code: "Monitor cert expiry with alerting,\nnot just calendar reminders" },
        { term: "Missing intermediate cert", desc: "Works in some browsers (cached intermediate) but fails in others/mobile/curl", code: "Serve the FULL chain, not just the leaf cert" },
        { term: "Weak/legacy cipher suites enabled", desc: "Compatibility settings left on long after they're needed", code: "Disable TLS 1.0/1.1 and RC4/3DES\nunless a specific legacy client requires them" },
        { term: "Mixed content warning", desc: "An HTTPS page loading an HTTP sub-resource — browsers block or warn", code: "Ensure every asset URL (img, script, css)\nuses https:// or protocol-relative //" },
        { term: "Self-signed cert in production", desc: "Fine for internal/dev; browsers will hard-warn public users", code: "Use Let's Encrypt or an internal CA\nfor anything user-facing" },
        { term: "Certificate pinning tradeoffs", desc: "Strong protection against rogue CAs, but breaks on legitimate cert rotation if mismanaged", code: "Pin the CA/intermediate, not the leaf,\nor use a rotation-aware pinning strategy" },
        { term: "SNI-based routing misconfig", desc: "Wrong cert served for a hostname when SNI mapping is misconfigured on the LB", code: "Verify each SNI-selected cert with\nopenssl s_client -connect host:443 -servername host" },
      ],
    },
    {
      title: "Real Incidents (Lessons)",
      color: "rose",
      rows: [
        { term: "Heartbleed (OpenSSL, 2014)", desc: "Buffer over-read leaked server memory including private keys — patch and rotate keys fast", code: "Lesson: keep TLS libraries patched;\nassume key compromise, rotate after major CVEs" },
        { term: "POODLE (SSLv3, 2014)", desc: "Padding oracle forced protocol downgrade to a broken cipher mode", code: "Lesson: disable SSLv3/legacy protocols entirely,\ndon't just deprioritize them" },
        { term: "DigiNotar (2011)", desc: "CA compromise led to fraudulent certificates being trusted globally", code: "Lesson: CA trust is a single point of failure;\ncertificate transparency logs now help detect this" },
        { term: "Certificate Transparency (CT) logs", desc: "Public, append-only logs of issued certs — detect mis-issuance quickly", code: "Monitor CT logs for certs issued\nfor your domains you didn't request" },
        { term: "BEAST / CRIME / logjam", desc: "A family of protocol/cipher-downgrade attacks against older TLS versions", code: "Lesson: retire deprecated protocol versions\nproactively, not reactively" },
        { term: "Downgrade attacks generally", desc: "Attacker forces a weaker protocol/cipher than both parties actually support", code: "TLS_FALLBACK_SCSV and TLS 1.3-only\npolicies close most downgrade paths" },
        { term: "Post-quantum migration (forward-looking)", desc: "Hybrid classical+post-quantum key exchange is being rolled out ahead of quantum threats", code: "Watch for X25519+Kyber hybrid\nkey exchange support in TLS libraries" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "openssl s_client", desc: "Manually inspect a server's TLS handshake and certificate chain", code: "openssl s_client -connect example.com:443 -servername example.com" },
        { term: "certbot", desc: "The standard ACME client for Let's Encrypt issuance and renewal", code: "certbot --nginx -d example.com" },
        { term: "SSL Labs test", desc: "Third-party grading of a server's TLS configuration", code: "https://www.ssllabs.com/ssltest/" },
        { term: "testssl.sh", desc: "CLI tool for auditing cipher suites, protocol versions, and known vulnerabilities", code: "./testssl.sh example.com:443" },
        { term: "mkcert", desc: "Locally-trusted development certificates without browser warnings", code: "mkcert localhost 127.0.0.1" },
        { term: "Cert expiry monitoring", desc: "Alert well before expiry, not on the day of", code: "Prometheus blackbox_exporter probe_ssl_earliest_cert_expiry" },
        { term: "OWASP reference", desc: "See the OWASP Top 10 skill — A02:2021-Cryptographic Failures", code: "Cross-reference: Encryption, Hashing,\nSecrets Management, Networking skills" },
      ],
    },
  ],
};

export default tlsHttps;
