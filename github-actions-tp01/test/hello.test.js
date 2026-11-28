import { test } from "node:test";
import assert from "node:assert/strict";
import { salutation } from "../src/hello.js";

test("salue un prenom", () => {
  assert.equal(salutation("Ahmed"), "Bonjour Ahmed !");
});
