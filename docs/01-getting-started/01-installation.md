# Installation

This guide covers multiple ways to install and set up Folio CLI in your project.

## Prerequisites

- **Node.js**: Version 16.0 or higher
- **npm**, **yarn**, or **pnpm**: Any modern package manager
- **TypeScript**: Recommended for configuration files (automatically installed as dependency)

## Installation Methods

### Local Installation (Recommended)

Install Folio as a development dependency in your project:

```bash
# Using npm
npm install --save-dev folio-cli

# Using yarn
yarn add --dev folio-cli

# Using pnpm
pnpm add --save-dev folio-cli
```

### Global Installation

Install globally for system-wide access:

```bash
# Using npm
npm install -g folio-cli

# Using yarn
yarn global add folio-cli

# Using pnpm
pnpm add -g folio-cli
```

### npx Usage (No Installation)

Use without installing:

```bash
npx folio-cli init
npx folio-cli new adr "Your first ADR"
```

## Verification

Verify your installation:

```bash
# Check version
folio --version

# Or with npx
npx folio --version

# View help
folio --help
```

## Quick Setup

1. **Navigate to your project root**:
   ```bash
   cd your-project
   ```

2. **Install Folio**:
   ```bash
   npm install --save-dev folio-cli
   ```

3. **Initialize documentation structure**:
   ```bash
   npx folio init
   ```

4. **Add npm scripts** (optional but recommended):
   ```json
   {
     "scripts": {
       "docs:new": "folio new",
       "docs:validate": "folio validate",
       "docs:serve": "folio serve",
       "docs:nav": "folio generate-nav"
     }
   }
   ```

## Next Steps

After installation:

1. **Follow the Quick Start**: [Quick Start Tutorial](./02-quick-start.md)
2. **Configure your project**: [The Folio Config](../02-core-concepts/01-the-folio-config.md)
3. **Explore commands**: [Command Reference](../03-command-reference/init.md)