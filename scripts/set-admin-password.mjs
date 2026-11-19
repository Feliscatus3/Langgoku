#!/usr/bin/env node
/**
 * Resets the local admin password in .env.local.
 *
 * Usage:
 *   node scripts/set-admin-password.mjs "PasswordBaru123"
 *   node scripts/set-admin-password.mjs            # generates a random password
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')

if (!existsSync(envPath)) {
  console.error('.env.local tidak ditemukan. Buat dari .env.local.example terlebih dahulu.')
  process.exit(1)
}

const provided = process.argv[2]
const password = provided || randomBytes(9).toString('base64url')

if (password.length < 8) {
  console.error('Password minimal 8 karakter.')
  process.exit(1)
}
if (/[\r\n]/.test(password)) {
  console.error('Password tidak boleh mengandung baris baru.')
  process.exit(1)
}

function encodeValue(value) {
  // Quote values containing characters that dotenv may treat as syntax.
  return /^[A-Za-z0-9._!@%^&*+=:-]+$/.test(value) ? value : JSON.stringify(value)
}

const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)

function setValue(key, value) {
  const index = lines.findIndex((line) => line.startsWith(`${key}=`))
  const entry = `${key}=${encodeValue(value)}`
  if (index >= 0) lines[index] = entry
  else lines.push(entry)
}

setValue('ADMIN_PASSWORD', password)
setValue('ADMIN_SESSION_SECRET', randomBytes(24).toString('hex'))

while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
writeFileSync(envPath, `${lines.join('\r\n')}\r\n`, 'utf8')

const usernameLine = lines.find((line) => line.startsWith('ADMIN_USERNAME=')) || ''
const username = usernameLine.slice('ADMIN_USERNAME='.length).replace(/^"|"$/g, '') || 'adminku'

console.log('Kredensial admin diperbarui di .env.local')
console.log(`Username: ${username}`)
console.log(`Password: ${password}`)
console.log('Restart server: pnpm dev   (atau: pnpm build && pnpm start)')
