# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@vbyte/buff` - a compact byte manipulation library that extends Uint8Array with additional functionality for converting between different data formats (hex, binary, numbers, strings, etc.) and performing byte operations.

## Development Commands

```bash
# Run tests using tape test framework
npm test
# Equivalent to: npm run script test/tape.ts

# Build the project (TypeScript compilation + Rollup bundling)
npm run build
# Runs: ./scripts/build.sh

# Full release pipeline (test + build)
npm run release
# Runs: npm test | faucet && npm run build

# Run a TypeScript file directly
npm run script <file.ts>
# Uses tsx with test/tsconfig.json

# Run scratch/development scripts
npm run scratch
# Runs: npm run script test/scratch.ts
```

## Architecture

### Core Classes
- **Buff** (`src/class/buff.ts`): Main class extending Uint8Array with conversion methods and utilities
- **Stream** (`src/class/stream.ts`): Stream processor for consuming byte data sequentially

### Library Structure
- **src/lib/**: Core conversion utilities (hex, binary, numbers, strings, random, big integers)
- **src/util/**: Validation and assertion utilities
- **src/types.ts**: Type definitions for Buffable, Bytes, Endian, etc.

### Key Features
- Multiple export paths: main package, `/lib`, `/util` submodules
- Supports both ESM and CommonJS via Rollup bundling
- Path aliases using `@/` prefix pointing to `src/`
- Endianness support throughout the API
- Browser and Node.js compatibility

### Build Process
The custom build script (`scripts/build.sh`) handles:
1. TypeScript compilation
2. Rollup bundling for multiple formats
3. Path alias resolution (replaces `@/` with relative paths)
4. Package.json preparation for distribution

### Testing
Uses tape test framework with tests in `test/src/`:
- `endian.test.ts`: Endianness functionality
- `integrity.test.ts`: Data integrity checks
- `parity.test.ts`: Parity and consistency tests

Main test runner: `test/tape.ts`