# Security Foundation — v0.1.0

- API secrets belong only in backend environment variables / secret stores.
- Frontend uses `VITE_*` only for public configuration; secrets must never be placed there.
- CORS is explicit and configurable.
- Request IDs are emitted for traceability.
- Standardized API errors avoid leaking internal stack traces.
- Production Docker configuration disables debug mode.
- Authentication is intentionally not enabled in Phase 1 because the current shell exposes no user-private server data or write operations. Authentication/authorization must be added before protected cloud notebooks/accounts are introduced.
- Rate limiting is scheduled with externally exposed provider-backed endpoints; the Phase 1 health/capability shell has no third-party quota surface.
