# Security Policy

## Supported versions

AI Studio is in **alpha** (`0.1.0-alpha.x`). Security fixes are applied to the latest published alpha.

| Version | Supported |
|---|---|
| `0.1.0-alpha.x` (latest) | ✅ |
| older prereleases | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately through GitHub's [private vulnerability reporting](https://github.com/shanair77/shanairai-ai-studio/security/advisories/new) (Security → Advisories → *Report a vulnerability*).

Please include:

- a description of the vulnerability and its impact,
- steps to reproduce or a proof of concept,
- the affected version(s).

You can expect an initial acknowledgement within a few business days. Once a fix is available, we will coordinate a release and disclosure.

## Scope

This project compiles declarative requests into Remotion compositions. Of particular interest:

- untrusted-input handling in `processRequest` (`./inspect`),
- anything that could turn a malformed request into an unclassified crash rather than a structured report.
