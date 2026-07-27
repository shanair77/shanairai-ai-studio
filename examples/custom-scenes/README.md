# custom-scenes

Author a custom scene component, register it, and use it in a template.

```bash
npm install
npm start
```

`defineScene` binds a React component into a typed scene definition. Passing it to
`createCompiler({ scenes: { badge } })` extends the built-in scenes (matching keys override).
