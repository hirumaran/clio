import { create } from "zustand"
import type { Notification, BorrowRequest, Conversation, Message } from "@/types"
import { mockNotifications, mockBorrowRequests, mockConversations, mockMessages } from "@/data/mock-data"

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Notifications
  notifications: Notification[]
  unreadNotificationCount: number
  
  // Borrowing
  borrowRequests: BorrowRequest[]
  
  // Messages
  conversations: Conversation[]
  messages: Record<string, Message[]>
  unreadMessageCount: number
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Notification actions
  fetchNotifications: () => Promise<void>
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  
  // Borrowing actions
  fetchBorrowRequests: () => Promise<void>
  updateBorrowRequest: (id: string, status: BorrowRequest["status"], response?: string) => void
  
  // Message actions
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string) => void
  markConversationRead: (conversationId: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifications: [],
  unreadNotificationCount: 0,
  borrowRequests: [],
  conversations: [],
  messages: {},
  unreadMessageCount: 0,

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
  },

  // Notification actions
  fetchNotifications: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const notifications = mockNotifications
    const unreadNotificationCount = notifications.filter((n) => !n.read).length
    set({ notifications, unreadNotificationCount })
  },

  markNotificationRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      const unreadNotificationCount = notifications.filter((n) => !n.read).length
      return { notifications, unreadNotificationCount }
    })
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    }))
  },

  // Borrowing actions
  fetchBorrowRequests: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    set({ borrowRequests: mockBorrowRequests })
  },

  updateBorrowRequest: (id, status, response) => {
    set((state) => ({
      borrowRequests: state.borrowRequests.map((r) =>
        r.id === id
          ? { ...r, status, ownerResponse: response }
          : r
      ),
    }))
  },

  // Message actions
  fetchConversations: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const conversations = mockConversations
    const unreadMessageCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
    set({ conversations, unreadMessageCount })
  },

  fetchMessages: async (conversationId) => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const conversationMessages = mockMessages.filter(
      (m) => m.conversationId === conversationId
    )
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: conversationMessages.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        ),
      },
    }))
  },

  sendMessage: (conversationId, content) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: "user-1", // Current user
      content,
      sentAt: new Date().toISOString(),
      read: true,
    }
    
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), newMessage],
      },
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: newMessage, updatedAt: newMessage.sentAt }
          : c
      ),
    }))
  },

  markConversationRead: (conversationId) => {
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
      const unreadMessageCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
      return { conversations, unreadMessageCount }
    })
  },
}))
