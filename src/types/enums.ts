/**
 * Enums per l'applicazione
 */

/**
 * Ruoli utente
 */
export enum UserRole {
  MANAGER = 'manager',
  ADMIN = 'admin',
}

/**
 * Stati ordine
 */
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Nomi categorie predefinite
 */
export enum CategoryName {
  PRIMI = 'Primi',
  SECONDI = 'Secondi',
  CONTORNI = 'Contorni',
  BEVANDE = 'Bevande',
  DOLCI = 'Dolci',
}

/**
 * Soglie quantità
 */
export enum StockThreshold {
  OUT_OF_STOCK = 0,
  LOW_STOCK = 10,
  WARNING_STOCK = 20,
}

/**
 * Limiti applicazione
 */
export enum Limits {
  MIN_COVERS = 1,
  MAX_COVERS = 100,
  MIN_PRICE = 0,
  MAX_PRICE = 999.99,
  MIN_QUANTITY = 0,
  MAX_QUANTITY = 9999,
  MAX_ORDER_NOTES_LENGTH = 200,
  MAX_ITEM_NOTES_LENGTH = 100,
  MAX_PRODUCT_NAME_LENGTH = 100,
  MAX_PRODUCT_DESCRIPTION_LENGTH = 500,
  MAX_CATEGORY_NAME_LENGTH = 50,
  MAX_VARIANT_NAME_LENGTH = 50,
  MAX_GUEST_NAME_LENGTH = 100,
}

/**
 * Messaggi di errore comuni
 */
export enum ErrorMessage {
  REQUIRED_FIELD = 'Questo campo è obbligatorio',
  INVALID_EMAIL = 'Indirizzo email non valido',
  INVALID_PASSWORD = 'La password deve contenere almeno 6 caratteri',
  INVALID_PRICE = 'Il prezzo deve essere maggiore di 0',
  INVALID_QUANTITY = 'La quantità deve essere un numero intero positivo',
  INVALID_COVERS = 'Il numero di coperti deve essere tra 1 e 100',
  OUT_OF_STOCK = 'Prodotto non disponibile',
  INSUFFICIENT_STOCK = 'Quantità non disponibile',
  EMPTY_CART = 'Il carrello è vuoto',
  GENERIC_ERROR = 'Si è verificato un errore. Riprova più tardi',
  NETWORK_ERROR = 'Errore di connessione. Verifica la tua connessione internet',
  UNAUTHORIZED = 'Non sei autorizzato ad eseguire questa operazione',
  NOT_FOUND = 'Risorsa non trovata',
}

/**
 * Messaggi di successo comuni
 */
export enum SuccessMessage {
  LOGIN_SUCCESS = 'Accesso effettuato con successo',
  LOGOUT_SUCCESS = 'Disconnesso con successo',
  ORDER_CREATED = 'Ordine creato con successo',
  ORDER_COMPLETED = 'Ordine completato',
  ORDER_CANCELLED = 'Ordine annullato',
  PRODUCT_CREATED = 'Prodotto creato con successo',
  PRODUCT_UPDATED = 'Prodotto aggiornato con successo',
  PRODUCT_DELETED = 'Prodotto eliminato con successo',
  CATEGORY_CREATED = 'Categoria creata con successo',
  CATEGORY_UPDATED = 'Categoria aggiornata con successo',
  CATEGORY_DELETED = 'Categoria eliminata con successo',
  VARIANT_CREATED = 'Variante creata con successo',
  VARIANT_UPDATED = 'Variante aggiornata con successo',
  VARIANT_DELETED = 'Variante eliminata con successo',
  SAVED = 'Salvato con successo',
  COPIED = 'Copiato negli appunti',
}

/**
 * Tipi di notifica
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Intervalli di tempo per statistiche
 */
export enum TimeRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom',
}

/**
 * Opzioni di ordinamento
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Campi per ordinamento prodotti
 */
export enum ProductSortField {
  NAME = 'name',
  PRICE = 'price',
  QUANTITY = 'quantity_available',
  CREATED_AT = 'created_at',
  DISPLAY_ORDER = 'display_order',
}

/**
 * Campi per ordinamento ordini
 */
export enum OrderSortField {
  ORDER_NUMBER = 'order_number',
  CREATED_AT = 'created_at',
  TOTAL_AMOUNT = 'total_amount',
  COVERS = 'covers',
  STATUS = 'status',
}

/**
 * Modalità visualizzazione
 */
export enum ViewMode {
  GRID = 'grid',
  LIST = 'list',
  TABLE = 'table',
}

/**
 * Breakpoints responsive
 */
export enum Breakpoint {
  XS = 0,
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  XXL = 1536,
}
