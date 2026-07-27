# AI Studio — Examples

Each folder is a standalone project that consumes the **published** `@shanairai/ai-studio`
package (no workspace or source imports). Install and run any of them independently:

```bash
cd examples/<name>
npm install
npm start
```

| Example | Demonstrates |
|---|---|
| [quickstart](./quickstart) | `defineTemplate` → `createCompiler` → `compile` (matches the root README) |
| [api-server](./api-server) | React-free `./inspect` transport validation + compile, via Hono |
| [custom-scenes](./custom-scenes) | Authoring + registering a custom `defineScene` |
| [multi-brand](./multi-brand) | One template compiled under multiple `defineBrand`s |
| [ai-agent](./ai-agent) | `describe()` → generate a request → `compile()` → inspect the report |

Every example uses only the public SDK surface (`.` and `./inspect`).
