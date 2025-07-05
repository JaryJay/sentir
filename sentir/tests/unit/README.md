# Unit Tests

This directory contains unit tests for the sentir project.

## Structure

- `change.test.ts` - Tests for the change logic functions in `@extension/shared/lib/logic/change.ts`

## Running Tests

To run the unit tests:

```bash
# From the sentir directory
pnpm -F @extension/shared test
```

## Test Coverage

The `change.test.ts` file provides comprehensive test coverage for:

### `smartApplyChanges` function

- Handles undefined text changes
- Filters and updates completions when text changes
- Handles noop completions correctly
- Filters out completions when text structure changes
- Handles edge cases like empty text and completions at text boundaries

### `smartMergeCompletionsIntoUpdatedOverlayable` function

- Returns new overlayable when timestamp is older
- Merges completions when text has changed
- Handles cases when text has not changed
- Concatenates existing completions from new overlayable

### Edge Cases

- Empty text handling
- Completions at the beginning and end of text
- Replace completions that span entire text

## Test Infrastructure

- Uses **Vitest** as the test runner
- Tests are located in `sentir/tests/unit/`
- Vitest configuration is in `sentir/packages/shared/vitest.config.ts`
- Tests import from `@extension/shared` package

## Adding New Tests

To add new unit tests:

1. Create a new `.test.ts` file in `sentir/tests/unit/`
2. Import the functions you want to test from `@extension/shared`
3. Write your tests using Vitest's `describe`, `it`, and `expect` functions
4. Run tests with `pnpm -F @extension/shared test`
