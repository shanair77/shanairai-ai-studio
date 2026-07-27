# api-server

Validate untrusted request JSON with the React-free `./inspect` entry, then compile it —
the edge-validate → compile pattern, in one process for clarity. Built on [Hono](https://hono.dev).

```bash
npm install
npm run smoke      # in-process test (no port)
npm start          # serves http://localhost:8787
```

```bash
curl -s localhost:8787/compile -H 'content-type: application/json' \
  -d '{"id":"v1","template":"promo","params":{"title":"Hello"}}'
```

`processRequest` (from `@shanairai/ai-studio/inspect`) rejects malformed input with a 400;
`compile` returns the composition metadata or a 422 with the report.
