// Stubbed for kush-light template
const noopQuery = {}
const emptySnap = { empty: true, docs: [], forEach: () => {}, size: 0 }
export function getFirestore() { return {} }
export function collection() { return noopQuery }
export function doc() { return noopQuery }
export function query() { return noopQuery }
export function where() { return noopQuery }
export function orderBy() { return noopQuery }
export function limit() { return noopQuery }
export function startAfter() { return noopQuery }
export function endBefore() { return noopQuery }
export function getDoc() { return Promise.resolve({ exists: () => false, data: () => null, id: 'stub' }) }
export function getDocs() { return Promise.resolve(emptySnap) }
export function setDoc() { return Promise.resolve() }
export function addDoc() { return Promise.resolve({ id: 'stub' }) }
export function updateDoc() { return Promise.resolve() }
export function deleteDoc() { return Promise.resolve() }
export function onSnapshot(_q, cb) { if (typeof cb === 'function') cb(emptySnap); return () => {} }
export class Timestamp { static now() { return { toDate: () => new Date(), seconds: 0, nanoseconds: 0 } } static fromDate(d) { return { toDate: () => d } } }
export const serverTimestamp = () => new Date()
export const FieldValue = { serverTimestamp: () => new Date(), arrayUnion: () => [], arrayRemove: () => [], increment: () => 0, delete: () => null }
export default {}
