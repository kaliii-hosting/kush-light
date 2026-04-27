import { create } from 'zustand'

export const useStore = create((set) => ({
  // Controls
  controlMode: 'orbit', // 'orbit' or 'firstPerson'
  setControlMode: (mode) => set({ controlMode: mode }),
  
  // Pointer lock
  pointerLock: false,
  setPointerLock: (locked) => set({ pointerLock: locked }),
  
  // Movement state
  movement: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },
  setMovement: (key, value) => set((state) => ({
    movement: { ...state.movement, [key]: value }
  })),
  
  // Shopping cart
  cart: [],
  addToCart: (product) => set((state) => ({
    cart: [...state.cart, { ...product, id: Date.now() }]
  })),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(item => item.id !== id)
  })),
  
  // Selected product
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  // UI state
  showCart: false,
  setShowCart: (show) => set({ showCart: show }),
  showProductDetail: false,
  setShowProductDetail: (show) => set({ showProductDetail: show }),
  
  // Video state
  activeVideo: null,
  setActiveVideo: (video) => set({ activeVideo: video }),
}))