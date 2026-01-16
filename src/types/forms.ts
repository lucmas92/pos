/**
 * Tipi per form e validazione
 */

/**
 * Form login
 */
export interface LoginForm {
  email: string
  password: string
}

/**
 * Form prodotto
 */
export interface ProductForm {
  name: string
  description: string
  category_id: string
  price: number | string
  quantity_available: number | string
  is_active: boolean
  is_kit: boolean
  image_url: string
  display_order: number | string
}

/**
 * Form categoria
 */
export interface CategoryForm {
  name: string
  display_order: number | string
  is_active: boolean
}

/**
 * Form variante
 */
export interface VariantForm {
  product_id: string
  name: string
  price_modifier: number | string
  is_active: boolean
}

/**
 * Form checkout
 */
export interface CheckoutForm {
  guest_name: string
  covers: number | string
  notes: string
}

/**
 * Errori validazione form
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>

/**
 * Stato form generico
 */
export interface FormState<T> {
  values: T
  errors: FormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

/**
 * Risultato validazione campo
 */
export interface FieldValidation {
  valid: boolean
  error?: string
}

/**
 * Regole validazione
 */
export type ValidationRule<T = any> = (value: T) => FieldValidation

/**
 * Schema validazione form
 */
export type ValidationSchema<T> = Partial<Record<keyof T, ValidationRule[]>>
