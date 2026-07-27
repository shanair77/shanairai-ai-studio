/** In-process smoke test — exercises the endpoint without binding a port. */
import { app } from "./server.js";

const ok = await app.request("/compile", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ id: "v1", template: "promo", params: { title: "Hello" } }),
});
console.log("valid request →", ok.status, await ok.json());

const badTransport = await app.request("/compile", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{ not json",
});
console.log("malformed JSON →", badTransport.status);

const badSemantic = await app.request("/compile", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ id: "v2", template: "promo", params: {} }),
});
console.log("missing required param →", badSemantic.status);
