# multi-brand

Compile one template under multiple brands.

```bash
npm install
npm start
```

Brands are registered with `defineBrand` and selected per request by name (`brand: "acme"`).
The same template + params yields a composition themed per brand.
