// Stubbed for kush-light template
import { PLACEHOLDER_FIXTURES } from '@/_stubs/placeholder-data.js'

let _activePath = null

const noopRef = {
  on: () => {}, off: () => {}, once: () => Promise.resolve(makeSnap(_activePath)),
  set: () => Promise.resolve(), update: () => Promise.resolve(), remove: () => Promise.resolve(),
  push: () => ({ key: 'stub', ref: noopRef }),
  child: (p) => { _activePath = (_activePath || '') + '/' + p; return noopRef },
  orderByChild: () => noopRef, orderByKey: () => noopRef, orderByValue: () => noopRef,
  limitToFirst: () => noopRef, limitToLast: () => noopRef,
  startAt: () => noopRef, endAt: () => noopRef, equalTo: () => noopRef,
}

function pickFixture(path) {
  if (!path) return null
  // Strip leading / + take first segment
  const seg = path.replace(/^\/+/, '').split('/')[0]
  return PLACEHOLDER_FIXTURES[seg] ?? null
}

function makeSnap(path) {
  const value = pickFixture(path)
  return {
    val: () => value,
    exists: () => value !== null && value !== undefined,
    forEach: (cb) => { if (Array.isArray(value)) value.forEach((v, i) => cb({ key: String(i), val: () => v })) },
    key: null,
  }
}

export function getDatabase() { return {} }
export function ref(_db, path) { _activePath = path || null; return { ...noopRef, _path: path } }
export function onValue(refObj, cb) {
  const path = (refObj && refObj._path) || _activePath
  if (cb) cb(makeSnap(path))
  return () => {}
}
export function get(refObj) {
  const path = (refObj && refObj._path) || _activePath
  return Promise.resolve(makeSnap(path))
}
export function set() { return Promise.resolve() }
export function update() { return Promise.resolve() }
export function remove() { return Promise.resolve() }
export function push() { return Promise.resolve({ key: 'stub' }) }
export function child(refObj, p) { return { ...noopRef, _path: ((refObj?._path)||'') + '/' + p } }
export function serverTimestamp() { return Date.now() }
export function query(refObj) { return refObj }
export function orderByChild() { return noopRef }
export function orderByKey() { return noopRef }
export function orderByValue() { return noopRef }
export function limitToFirst() { return noopRef }
export function limitToLast() { return noopRef }
export function startAt() { return noopRef }
export function endAt() { return noopRef }
export function equalTo() { return noopRef }
export default {}
