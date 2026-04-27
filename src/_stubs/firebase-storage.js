// Stubbed for kush-light template
const noopRef = {
  put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
  putString: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
  getDownloadURL: () => Promise.resolve(''),
  delete: () => Promise.resolve(),
  child: () => noopRef,
  listAll: () => Promise.resolve({ items: [], prefixes: [] }),
}
export function getStorage() { return {} }
export function ref() { return noopRef }
export function uploadBytes() { return Promise.resolve({ ref: noopRef }) }
export function uploadBytesResumable() { return { on: () => {}, snapshot: { ref: noopRef } } }
export function uploadString() { return Promise.resolve({ ref: noopRef }) }
export function getDownloadURL() { return Promise.resolve('') }
export function deleteObject() { return Promise.resolve() }
export function listAll() { return Promise.resolve({ items: [], prefixes: [] }) }
export default {}
