#!/usr/bin/env node
/** Build the checked-in provider packages from source/radical-diagram. */
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(repoRoot, 'source', 'radical-diagram')
const sourceSkill = await readFile(path.join(source, 'SKILL.md'), 'utf8')

const packages = [
  {
    id: 'claude-code',
    root: '${CLAUDE_PLUGIN_ROOT}',
    directory: path.join(repoRoot, 'providers', 'claude-code', 'radical-diagram'),
    manifestPath: '.claude-plugin/plugin.json',
    manifest: {
      name: 'radical-diagram',
      description: 'Create and validate .radical C4 architecture diagrams for radical.tools.',
      version: '0.1.0',
      author: { name: 'radical.tools' },
      license: 'MIT',
      homepage: 'https://radical.tools',
      repository: 'https://github.com/radicaltools/radical.plugins',
    },
  },
  {
    id: 'copilot',
    root: '${PLUGIN_ROOT}',
    directory: path.join(repoRoot, 'providers', 'copilot', 'radical-diagram'),
    manifestPath: 'plugin.json',
    manifest: {
      name: 'radical-diagram',
      description: 'Create and validate .radical C4 architecture diagrams for radical.tools.',
      version: '0.1.0',
      author: { name: 'radical.tools' },
      license: 'MIT',
      homepage: 'https://radical.tools',
      repository: 'https://github.com/radicaltools/radical.plugins',
      keywords: ['radical.tools', 'c4', 'architecture', 'diagram'],
      skills: './skills/',
    },
  },
  {
    id: 'codex',
    root: '${PLUGIN_ROOT}',
    directory: path.join(repoRoot, 'plugins', 'radical-diagram'),
    manifestPath: '.codex-plugin/plugin.json',
    manifest: {
      name: 'radical-diagram',
      description: 'Create and validate .radical C4 architecture diagrams for radical.tools.',
      version: '0.1.0',
      author: { name: 'radical.tools', url: 'https://radical.tools' },
      license: 'MIT',
      homepage: 'https://radical.tools',
      repository: 'https://github.com/radicaltools/radical.plugins',
      keywords: ['radical.tools', 'c4', 'architecture', 'diagram'],
      skills: './skills/',
      interface: {
        displayName: 'Radical Diagram',
        shortDescription: 'Create and validate .radical C4 diagrams.',
        longDescription: 'Create and validate .radical C4 architecture diagrams for radical.tools.',
        developerName: 'radical.tools',
        category: 'Development',
        capabilities: ['Write'],
        defaultPrompt: 'Create a C4 architecture diagram for my system.',
      },
    },
  },
]

for (const target of packages) {
  const skillDirectory = path.join(target.directory, 'skills', 'radical-diagram')
  await mkdir(skillDirectory, { recursive: true })
  await cp(path.join(source, 'references'), path.join(skillDirectory, 'references'), {
    recursive: true,
    force: true,
  })
  await cp(path.join(source, 'scripts'), path.join(skillDirectory, 'scripts'), {
    recursive: true,
    force: true,
  })
  await cp(path.join(repoRoot, 'LICENSE'), path.join(target.directory, 'LICENSE'), {
    force: true,
  })
  const skill = sourceSkill.replace(
    'node .claude/skills/radical-diagram/scripts/validate.mjs <file>',
    `node "${target.root}/skills/radical-diagram/scripts/validate.mjs" <file>`,
  )
  await writeFile(path.join(skillDirectory, 'SKILL.md'), skill)
  const manifest = path.join(target.directory, target.manifestPath)
  await mkdir(path.dirname(manifest), { recursive: true })
  await writeFile(manifest, `${JSON.stringify(target.manifest, null, 2)}\n`)
  console.log(`Built ${target.id}: ${path.relative(repoRoot, target.directory)}`)
}
