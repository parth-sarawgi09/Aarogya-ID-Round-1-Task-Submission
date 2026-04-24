import { create } from 'zustand'

const useStore = create((set) => ({
  userProfile: null,
  sessionId: null,
  chatHistory: [],
  setUserProfile: (profile) => set({ userProfile: profile }),
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) => set((state) => ({ 
    chatHistory: [...state.chatHistory, message] 
  })),
  clearSession: () => set({ userProfile: null, sessionId: null, chatHistory: [] })
}))

export default useStore
