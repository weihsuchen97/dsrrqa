export interface TodoItem {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  createdAt: string // ISO string for JSON serialization

  // Generic external issue tracker fields (not bound to any specific system)
  externalKey?: string       // e.g. "PROJ-123", "BUG-456"
  externalStatus?: string    // e.g. "In Progress", "Resolved"
  externalAssignee?: string
  externalSource?: string    // e.g. "Jira", "GitHub Issues", "Azure DevOps"
  externalUrl?: string       // deep link to the issue
}
