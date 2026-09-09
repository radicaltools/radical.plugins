# radical.plugins

Portable plugins for radical.tools.

## radical-diagram

`radical-diagram` creates and validates `.radical` C4 architecture diagrams.
It is packaged for three coding-agent plugin systems:

- Claude Code: `providers/claude-code/radical-diagram`
- GitHub Copilot CLI: `providers/copilot/radical-diagram`
- Codex: `plugins/radical-diagram`

The source of truth is `source/radical-diagram`. Run `node
scripts/build-packages.mjs` after changing it; the generated packages are
committed so a marketplace can install them directly.

## Local validation

```bash
node scripts/build-packages.mjs
node scripts/test-packages.mjs
```

The tests validate each manifest, verify generated files match the canonical
source, and exercise the bundled `.radical` validator on valid and invalid
fixtures.

## Install

Use the marketplace matching your coding agent:

```text
# Claude Code
/plugin marketplace add radicaltools/radical.plugins
/plugin install radical-diagram@radical-plugins

# GitHub Copilot CLI
copilot plugin marketplace add radicaltools/radical.plugins
copilot plugin install radical-diagram@radical-plugins

# Codex
codex plugin marketplace add radicaltools/radical.plugins
codex plugin add radical-diagram@radical-plugins
```

Codex reads its repository-local catalog from `.agents/plugins/marketplace.json`.
Start a new Codex session after installation.
