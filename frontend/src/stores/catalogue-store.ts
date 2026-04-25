import { create } from "zustand"
import type { Resource, CatalogueFilters, ResourceCategory, ResourceCondition, ResourceStatus } from "@/types"
import { mockResources } from "@/data/mock-data"

interface CatalogueState {
  resources: Resource[]
  filteredResources: Resource[]
  selectedResource: Resource | null
  filters: CatalogueFilters
  isLoading: boolean
  
  // Actions
  setFilters: (filters: Partial<CatalogueFilters>) => void
  resetFilters: () => void
  setSelectedResource: (resource: Resource | null) => void
  fetchResources: () => Promise<void>
  searchResources: (query: string) => void
  toggleCategory: (category: ResourceCategory) => void
  toggleCondition: (condition: ResourceCondition) => void
  toggleStatus: (status: ResourceStatus) => void
}

const defaultFilters: CatalogueFilters = {
  search: "",
  categories: [],
  conditions: [],
  status: [],
  sortBy: "newest",
}

function applyFilters(resources: Resource[], filters: CatalogueFilters): Resource[] {
  let result = [...resources]
  
  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.tags.some((t) => t.toLowerCase().includes(searchLower))
    )
  }
  
  // Category filter
  if (filters.categories.length > 0) {
    result = result.filter((r) => filters.categories.includes(r.category))
  }
  
  // Condition filter
  if (filters.conditions.length > 0) {
    result = result.filter((r) => filters.conditions.includes(r.condition))
  }
  
  // Status filter
  if (filters.status.length > 0) {
    result = result.filter((r) => filters.status.includes(r.status))
  }
  
  // Sorting
  switch (filters.sortBy) {
    case "newest":
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case "popular":
      result.sort((a, b) => b.borrowCount - a.borrowCount)
      break
    case "rating":
      result.sort((a, b) => b.rating - a.rating)
      break
    case "alphabetical":
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  return result
}

export const useCatalogueStore = create<CatalogueState>((set, get) => ({
  resources: [],
  filteredResources: [],
  selectedResource: null,
  filters: defaultFilters,
  isLoading: false,

  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters }
    const filteredResources = applyFilters(get().resources, filters)
    set({ filters, filteredResources })
  },

  resetFilters: () => {
    const filteredResources = applyFilters(get().resources, defaultFilters)
    set({ filters: defaultFilters, filteredResources })
  },

  setSelectedResource: (resource) => {
    set({ selectedResource: resource })
  },

  fetchResources: async () => {
    set({ isLoading: true })
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const resources = mockResources
    const filteredResources = applyFilters(resources, get().filters)
    
    set({ resources, filteredResources, isLoading: false })
  },

  searchResources: (query) => {
    const filters = { ...get().filters, search: query }
    const filteredResources = applyFilters(get().resources, filters)
    set({ filters, filteredResources })
  },

  toggleCategory: (category) => {
    const currentCategories = get().filters.categories
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category]
    get().setFilters({ categories: newCategories })
  },

  toggleCondition: (condition) => {
    const currentConditions = get().filters.conditions
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c) => c !== condition)
      : [...currentConditions, condition]
    get().setFilters({ conditions: newConditions })
  },

  toggleStatus: (status) => {
    const currentStatus = get().filters.status
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter((s) => s !== status)
      : [...currentStatus, status]
    get().setFilters({ status: newStatus })
  },
}))
