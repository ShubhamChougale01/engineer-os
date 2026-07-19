import type { CheatSheetData } from "./types";

const typescript: CheatSheetData = {
  title: "The Ultimate TypeScript Cheat Sheet",
  subtitle: "Type system core · generics · narrowing · production toolbelt",
  sections: [
    {
      title: "Basic Types",
      color: "violet",
      rows: [
        { term: "Primitives", desc: "Explicit or inferred", code: "let s: string = 'hi';\nlet n: number = 42;\nlet b: boolean = true;\nlet inferred = 'hi'; // no annotation needed" },
        { term: "Arrays & tuples", desc: "Homogeneous list vs fixed shape", code: "const xs: number[] = [1, 2, 3];\nconst pt: [number, number] = [3, 4];" },
        { term: "Object shape", desc: "interface for extendable contracts", code: "interface User {\n  id: number;\n  name: string;\n  email?: string; // optional\n}" },
        { term: "type alias", desc: "Unions, tuples, computed shapes", code: "type Point = { x: number; y: number };\ntype ID = string | number;" },
        { term: "Union & literal types", desc: "Exact allowed values, checked", code: "type Status = 'pending' | 'active' | 'done';\nlet id: string | number;" },
        { term: "any vs unknown", desc: "any disables checks; unknown forces narrowing", code: "let danger: any;      // avoid\nlet safe: unknown;    // must narrow first" },
        { term: "null / undefined", desc: "Distinct types under strictNullChecks", code: "let x: string | null = null;\nlet y: string | undefined;" },
        { term: "void / never", desc: "No return value / never returns at all", code: "function log(): void { console.log('hi'); }\nfunction fail(): never { throw new Error(); }" },
      ],
    },
    {
      title: "Narrowing & Guards",
      color: "blue",
      rows: [
        { term: "typeof narrowing", desc: "Split primitive unions", code: "function f(v: string | number) {\n  if (typeof v === 'string') v.length;\n  else v.toFixed(2);\n}" },
        { term: "instanceof narrowing", desc: "Split class instance unions", code: "if (err instanceof ApiError) handle(err);\nelse throw err;" },
        { term: "in narrowing", desc: "Check property existence", code: "if ('breed' in animal) animal.breed;" },
        { term: "Custom type guard", desc: "A function that narrows for you", code: "function isUser(x: unknown): x is User {\n  return typeof x === 'object' && x !== null && 'id' in x;\n}" },
        { term: "Discriminated union", desc: "Tag field enables exhaustive narrowing", code: "type Shape =\n  | { kind: 'circle'; r: number }\n  | { kind: 'square'; side: number };" },
        { term: "Exhaustiveness check", desc: "Compile error if a case is missed", code: "function assertNever(x: never): never {\n  throw new Error('unhandled');\n}" },
        { term: "Non-null assertion", desc: "value! — a promise, NOT a check; use sparingly", code: "const el = document.getElementById('x')!;" },
        { term: "Optional chaining / nullish", desc: "Safe access and defaults", code: "user?.address?.city;\nconst port = cfg.port ?? 3000;" },
      ],
    },
    {
      title: "Generics & Utility Types",
      color: "emerald",
      rows: [
        { term: "Generic function", desc: "One function, many types", code: "function first<T>(xs: T[]): T | undefined {\n  return xs[0];\n}" },
        { term: "Generic constraint", desc: "Limit T to shapes with a member", code: "function len<T extends { length: number }>(x: T) {\n  return x.length;\n}" },
        { term: "Generic interface", desc: "Parameterized object shape", code: "interface Box<T> { value: T }\nconst b: Box<number> = { value: 42 };" },
        { term: "Partial / Required", desc: "All optional / all required", code: "type P = Partial<User>;\ntype R = Required<User>;" },
        { term: "Pick / Omit", desc: "Select or exclude keys", code: "type Preview = Pick<User, 'id' | 'name'>;\ntype NoEmail = Omit<User, 'email'>;" },
        { term: "Readonly / Record", desc: "Immutable shape / dictionary type", code: "type RU = Readonly<User>;\ntype ById = Record<string, User>;" },
        { term: "ReturnType / Parameters", desc: "Extract a function's types", code: "type R2 = ReturnType<typeof getUser>;\ntype P2 = Parameters<typeof getUser>;" },
        { term: "keyof / typeof", desc: "Type-level introspection", code: "type Keys = keyof User;      // 'id' | 'name' | 'email'\nconst cfg = { port: 3000 };\ntype Cfg = typeof cfg;" },
      ],
    },
    {
      title: "Advanced Types",
      color: "amber",
      rows: [
        { term: "Conditional type", desc: "Type-level if/else", code: "type IsString<T> = T extends string ? true : false;" },
        { term: "infer keyword", desc: "Extract a type from within another", code: "type ElementType<T> = T extends (infer U)[] ? U : never;" },
        { term: "Mapped type", desc: "Transform every property uniformly", code: "type Nullable<T> = { [K in keyof T]: T[K] | null };" },
        { term: "Template literal type", desc: "String-shaped types, computed by the compiler", code: "type EventName = 'click' | 'hover';\n// type Handler = on + Capitalize<EventName>\n// yields 'onClick' | 'onHover'" },
        { term: "Branded type", desc: "Simulate nominal typing in a structural system", code: "type UserId = string & { readonly brand: 'UserId' };" },
        { term: "as const", desc: "Widen-block a literal for precise inference", code: "const dirs = ['up', 'down'] as const;\n// type is readonly ['up', 'down'], not string[]" },
        { term: "Satisfies operator", desc: "Check shape WITHOUT widening the inferred type", code: "const config = { port: 3000 } satisfies Config;" },
        { term: "Declaration merging", desc: "Extend an existing interface (e.g. Express Request)", code: "declare global {\n  namespace Express { interface Request { userId?: string } }\n}" },
      ],
    },
    {
      title: "Functions, Classes & Modules",
      color: "rose",
      rows: [
        { term: "Function types", desc: "Params, defaults, optional, rest", code: "function f(a: number, b = 2, ...rest: number[]): number {\n  return a + b;\n}" },
        { term: "Overloads", desc: "Multiple call signatures, one implementation", code: "function get(id: number): User;\nfunction get(email: string): User;\nfunction get(x: number | string): User { ... }" },
        { term: "Class with access modifiers", desc: "public/private/protected + readonly", code: "class Account {\n  private balance = 0;\n  readonly id: string;\n  constructor(id: string) { this.id = id; }\n}" },
        { term: "Implements & extends", desc: "Contracts and inheritance", code: "interface Payable { pay(amount: number): void }\nclass Invoice implements Payable { pay(a: number) {} }" },
        { term: "Abstract class", desc: "Shared base, cannot be instantiated", code: "abstract class Shape {\n  abstract area(): number;\n}" },
        { term: "Type-only import", desc: "Fully erased — zero runtime cost", code: "import type { User } from './types';\nexport type { User };" },
        { term: "Module exports", desc: "Named and default", code: "export function add(a: number, b: number) { return a + b; }\nexport default class Calculator {}" },
        { term: "Enum alternative", desc: "Prefer a union of literals over enum", code: "type Role = 'admin' | 'editor' | 'viewer'; // usually simpler than enum" },
      ],
    },
    {
      title: "Runtime Validation & Async",
      color: "cyan",
      rows: [
        { term: "The type-erasure trap", desc: "Types check nothing at runtime", code: "async function getUser(): Promise<User> {\n  const r = await fetch('/user');\n  return r.json(); // NOT verified!\n}" },
        { term: "Zod schema", desc: "One schema, static type AND runtime check", code: "const UserSchema = z.object({ id: z.number(), name: z.string() });\ntype User = z.infer<typeof UserSchema>;" },
        { term: "Parse untrusted input", desc: "Throws on mismatch — a real check", code: "function handle(body: unknown): User {\n  return UserSchema.parse(body);\n}" },
        { term: "Async/await typing", desc: "Promise<T> return types", code: "async function fetchUser(id: number): Promise<User> {\n  return (await fetch('/users/' + id)).json();\n}" },
        { term: "Type-safe event emitter", desc: "Mapped type ties event name to arg types", code: "type Events = { login: [userId: string] };\nclass Emitter<E extends Record<string, unknown[]>> {}" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "violet",
      rows: [
        { term: "tsconfig essentials", desc: "Non-negotiable strictness flags", code: "\"strict\": true,\n\"noUncheckedIndexedAccess\": true,\n\"skipLibCheck\": true,\n\"isolatedModules\": true" },
        { term: "Type-check only", desc: "The authoritative CI gate", code: "tsc --noEmit --pretty" },
        { term: "Fast dev transpile", desc: "esbuild/swc — no type-check, instant", code: "esbuild src/index.ts --bundle --outfile=dist/index.js" },
        { term: "Testing (vitest)", desc: "Plain asserts, type-aware", code: "import { describe, it, expect } from 'vitest';\nit('adds', () => expect(add(2, 2)).toBe(4));" },
        { term: "Source maps", desc: "Debug the ORIGINAL .ts, not the emitted .js", code: "\"sourceMap\": true // in tsconfig.json" },
        { term: "Missing types for a dep", desc: "Install or stub the declarations", code: "npm install --save-dev @types/some-pkg" },
        { term: "Diagnose slow builds", desc: "Find the phase or file that's slow", code: "tsc --extendedDiagnostics\ntsc --generateTrace ./trace" },
        { term: "Native type stripping", desc: "Node 22+: run .ts directly (no type-check)", code: "node --experimental-strip-types src/index.ts" },
      ],
    },
  ],
};

export default typescript;
