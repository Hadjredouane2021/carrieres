import { randomBytes, randomInt } from "crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createReference() {
  let value = "FMA26-";
  for (let index = 0; index < 6; index += 1) {
    value += alphabet[randomInt(alphabet.length)];
  }
  return value;
}

export function createToken() {
  return randomBytes(24).toString("hex");
}
