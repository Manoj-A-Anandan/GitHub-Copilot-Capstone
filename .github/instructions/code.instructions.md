---
applyTo: "src/**,scripts/**"
---

# Code instructions

- Implement exactly what `docs/architecture.md` and the current task in `docs/impl-plan.md` specify. Component names in code match component names in the architecture.
- Small functions, one responsibility, self-explanatory names. Prefer clear code over comments; comment only the non-obvious *why*.
- No duplicated logic: if the same behaviour appears twice, extract a shared function.
- For absent data in output documents, use the literal `Not Found` when the approved requirements call for a missing-data marker. Follow more specific approved missing-data behavior, and do not introduce lookup or `Not Found` behavior that the approved scope excludes. Never raise on absent fields or emit `None`/`null`/empty string where a required output value is missing.
- Handle explicitly: API errors/timeouts/rate limits (bounded retries with backoff), missing files, empty repositories/inputs, malformed data. Fail with a clear, secret-free message and a non-zero exit code for fatal errors.
- Configuration comes from environment variables or CLI args; no hard-coded paths, URLs with credentials, or tokens.
- Public functions have type hints/annotations (where the language supports them) and a one-line docstring.
- Log through a single logger; never log secrets or full request headers.
- Prefer the standard library; any new dependency must be pinned and justified.
- Keep each commit's worth of change tied to one task ID.
