// Stubbed for kush-light template
const noop = () => Promise.resolve({ data: null, error: null })
const queryStub = {
  select: () => queryStub, insert: () => queryStub, update: () => queryStub,
  upsert: () => queryStub, delete: () => queryStub,
  eq: () => queryStub, neq: () => queryStub, gt: () => queryStub, lt: () => queryStub,
  gte: () => queryStub, lte: () => queryStub, like: () => queryStub, ilike: () => queryStub,
  in: () => queryStub, contains: () => queryStub, order: () => queryStub,
  limit: () => queryStub, range: () => queryStub, single: () => queryStub, maybeSingle: () => queryStub,
  then: (onFulfilled) => Promise.resolve({ data: null, error: null }).then(onFulfilled),
}
export const createClient = () => ({
  from: () => queryStub,
  auth: { signIn: noop, signUp: noop, signOut: noop, getUser: () => Promise.resolve({ data: { user: null } }) },
  storage: { from: () => ({ upload: noop, download: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }), list: () => Promise.resolve({ data: [] }) }) },
  rpc: noop,
  channel: () => ({ on: () => ({}), subscribe: () => ({}) }),
})
export default { createClient }
