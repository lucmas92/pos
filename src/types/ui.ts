/**
 * Tipi per componenti UI
 */

import type { NotificationType, ViewMode } from './enums'

/**
 * Props bottone
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

/**
 * Notifica toast
 */
export interface ToastNotification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  action?: ToastAction
}

/**
 * Azione toast
 */
export interface ToastAction {
  label: string
  onClick: () => void
}

/**
 * Props modale
 */
export interface ModalProps {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnClickOutside?: boolean
  showFooter?: boolean
}

/**
 * Props tabella
 */
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => any
}

/**
 * Props card
 */
export interface CardProps {
  title?: string
  subtitle?: string
  footer?: string
  hoverable?: boolean
  clickable?: boolean
  bordered?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * Opzione select/dropdown
 */
export interface SelectOption<T = any> {
  value: T
  label: string
  disabled?: boolean
  icon?: string
  description?: string
}

/**
 * Props badge
 */
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  outlined?: boolean
}

/**
 * Tab
 */
export interface Tab {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  badge?: number
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

/**
 * Menu item
 */
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  badge?: number
  children?: MenuItem[]
  disabled?: boolean
}

/**
 * Preferenze UI utente
 */
export interface UiPreferences {
  viewMode: ViewMode
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  language: 'it' | 'en'
}

/**
 * Stato caricamento
 */
export interface LoadingState {
  isLoading: boolean
  message?: string
}

/**
 * Stato vuoto
 */
export interface EmptyState {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}
