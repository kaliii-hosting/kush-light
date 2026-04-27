// Stubbed for kush-light template
const empty = () => Promise.resolve([])
export default {
  buildClient: () => ({
    product: { fetchAll: empty, fetchByHandle: () => Promise.resolve(null), fetch: () => Promise.resolve(null), fetchQuery: empty },
    collection: { fetchAll: empty, fetchAllWithProducts: empty, fetchByHandle: () => Promise.resolve(null) },
    checkout: { create: () => Promise.resolve({ id: 'stub', webUrl: '' }), addLineItems: () => Promise.resolve({}), removeLineItems: () => Promise.resolve({}), updateLineItems: () => Promise.resolve({}) },
  }),
}
