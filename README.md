# Sentir

Cursor-like autocompletion for every web page.

This repository is a **monorepo** that contains 4 related projects:

- `sentir` is the browser extension
- `sentir-api` is the backend
- `sentir-common` contains common Zod schemas, types, and utils. Both `sentir` and `sentir-api` depend on it
- `sentir-playground` is a SvelteKit site with some basic input elements for testing `sentir`.

Everything is written in TypeScript.

We use `bun` as our package manager for all 4 projects.

# Setup instructions

## MacOS/Linux

Run `bash ./i.sh` to install dependencies and link `sentir-common`.

## Windows

Run `i.bat` to install dependencies and link `sentir-common`.

# Running

Run `sentir-api` using

```sh
bun dev
```

Run `sentir` using

```sh
bun dev
```

See [the `sentir` README](./sentir/README.md) for more details.
