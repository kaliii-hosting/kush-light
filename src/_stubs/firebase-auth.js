// Stubbed for kush-light template
const noop = () => {}
const empty = () => Promise.resolve({ user: null })
export function getAuth() { return { currentUser: null, onAuthStateChanged: () => () => {} } }
export const onAuthStateChanged = (auth, cb) => { if (cb) cb(null); return () => {} }
export const signInWithEmailAndPassword = empty
export const createUserWithEmailAndPassword = empty
export const signInWithPopup = empty
export const signInWithRedirect = empty
export const getRedirectResult = () => Promise.resolve(null)
export const signOut = () => Promise.resolve()
export const sendPasswordResetEmail = () => Promise.resolve()
export const updateProfile = () => Promise.resolve()
export const updatePassword = () => Promise.resolve()
export const updateEmail = () => Promise.resolve()
export const deleteUser = () => Promise.resolve()
export const reauthenticateWithCredential = () => Promise.resolve()
export class GoogleAuthProvider { static credential() { return {} } }
export class EmailAuthProvider { static credential() { return {} } }
export const setPersistence = () => Promise.resolve()
export const browserSessionPersistence = 'session'
export const browserLocalPersistence = 'local'
export const inMemoryPersistence = 'none'
export const indexedDBLocalPersistence = 'indexeddb'
export const connectAuthEmulator = noop
export const sendEmailVerification = () => Promise.resolve()
export const verifyPasswordResetCode = () => Promise.resolve('')
export const confirmPasswordReset = () => Promise.resolve()
export const linkWithCredential = empty
export const unlink = () => Promise.resolve({})
export const fetchSignInMethodsForEmail = () => Promise.resolve([])
export const isSignInWithEmailLink = () => false
export const signInWithEmailLink = empty
export const sendSignInLinkToEmail = () => Promise.resolve()
export class FacebookAuthProvider { static credential() { return {} } }
export class GithubAuthProvider { static credential() { return {} } }
export class TwitterAuthProvider { static credential() { return {} } }
export default { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, sendPasswordResetEmail, updateProfile, updatePassword, updateEmail, deleteUser, reauthenticateWithCredential, GoogleAuthProvider, EmailAuthProvider, setPersistence, browserSessionPersistence, browserLocalPersistence }
