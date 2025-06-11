# Sentir

Cursor-like autocompletion for every web page.

# Demo


https://github.com/user-attachments/assets/cd201e95-1d31-4b30-914d-276166da7dd5


# Development

This repository is a **monorepo** that contains 3 related projects:
- `sentir` is the browser extension
- `sentir-api` is the backend
- `sentir-common` contains common Zod schemas, types, and utils. Both `sentir` and `sentir-api` depend on it

Everything is written in TypeScript.

We use 2 different package managers. For `sentir`, we use `pnpm`. For `sentir-api` and `sentir-common`, we use `bun`.

# Setup instructions

## MacOS/Linux
Run `bash ./i.sh` to install dependencies and link `sentir-common`.

## Windows
Run `i.bat` to install dependencies and link `sentir-common`.

# Running

Run `sentir-api` using
```sh
bun run dev
```

Run `sentir` using
```sh
pnpm dev
```
(This is equivalent to `pnpm run dev`)

See [the `sentir` README](./sentir/README.md) for more details.
