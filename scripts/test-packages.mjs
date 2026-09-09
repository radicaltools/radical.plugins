#!/usr/bin/env node
/** Validate package structure and the generated radical-diagram assets. */
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(repoRoot, 'source', 'radical-diagram')
const license = await readFile(path.join(repoRoot, 'LICENSE'), 'utf8')
const targets = [
  ['Claude Code', 'providers/claude-code/radical-diagram', '.claude-plugin/plugin.json'],
  ['GitHub Copilot CLI', 'providers/copilot/radical-diagram', 'plugin.json'],
  ['Codex', 'plugins/radical-diagram', '.codex-plugin/plugin.json'],
]
const canonicalSkill = await readFile(path.join(source, 'SKILL.md'), 'utf8')
const canonicalReference = await readFile(path.join(source, 'references/radical-file-format.md'), 'utf8')
const canonicalValidator = await readFile(path.join(source, 'scripts/validate.mjs'), 'utf8')

for (const [provider, relativeDir, manifestRelativePath] of targets) {
  const directory = path.join(repoRoot, relativeDir)
  const manifest = JSON.parse(await readFile(path.join(directory, manifestRelativePath), 'utf8'))
  assert.equal(manifest.name, 'radical-diagram', `${provider}: plugin name`)
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/, `${provider}: semver version`)
  assert.ok(manifest.description, `${provider}: description`)
  assert.equal(await readFile(path.join(directory, 'LICENSE'), 'utf8'), license, `${provider}: license sync`)
  const skill = await readFile(path.join(directory, 'skills/radical-diagram/SKILL.md'), 'utf8')
  assert.equal(skill, canonicalSkill, `${provider}: skill sync`)
  assert.equal(await readFile(path.join(directory, 'skills/radical-diagram/references/radical-file-format.md'), 'utf8'), canonicalReference, `${provider}: reference sync`)
  assert.equal(await readFile(path.join(directory, 'skills/radical-diagram/scripts/validate.mjs'), 'utf8'), canonicalValidator, `${provider}: validator sync`)
}

const fixtureDir = await mkdtemp(path.join(os.tmpdir(), 'radical-diagram-'))
try {
  const valid = path.join(fixtureDir, 'valid.radical')
  const invalid = path.join(fixtureDir, 'invalid.radical')
  await writeFile(valid, JSON.stringify({
    nodes: [{ id: 'shop', type: 'system', label: 'Shop', x: 0, y: 0, width: 360, height: 260, collapsed: false }],
    relations: [],
  }))
  await writeFile(invalid, JSON.stringify({ nodes: [], relations: [{ id: 'bad', sourceId: 'missing', targetId: 'also-missing' }] }))
  const validator = path.join(source, 'scripts/validate.mjs')
  assert.equal(spawnSync(process.execPath, [validator, valid], { encoding: 'utf8' }).status, 0, 'valid fixture must pass')
  assert.notEqual(spawnSync(process.execPath, [validator, invalid], { encoding: 'utf8' }).status, 0, 'invalid fixture must fail')
} finally {
  await rm(fixtureDir, { recursive: true, force: true })
}

console.log('All provider packages passed static validation.')
