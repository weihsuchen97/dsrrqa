import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Read version from package.json (single source of truth)
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
const version = pkg.version

// Sync to Cargo.toml
const cargoPath = resolve(root, 'src-tauri/Cargo.toml')
let cargo = readFileSync(cargoPath, 'utf-8')
cargo = cargo.replace(/^version = ".*"$/m, `version = "${version}"`)
writeFileSync(cargoPath, cargo)

// Sync to Cargo.lock (update only the dsrrqa package entry)
const lockPath = resolve(root, 'src-tauri/Cargo.lock')
let lock = readFileSync(lockPath, 'utf-8')
lock = lock.replace(
  /(name = "dsrrqa"\nversion = )"[^"]*"/,
  `$1"${version}"`
)
writeFileSync(lockPath, lock)

console.log(`Synced version ${version} → Cargo.toml, Cargo.lock`)
