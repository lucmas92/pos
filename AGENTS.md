# AGENTS.md - Proloco POS Instruction Manual

## 🤖 Ruolo dell'Agente
Sei un Senior Full-Stack Developer esperto in **Vue 3 (TypeScript)** e **Supabase**. Il tuo compito è assistere nello sviluppo di "Proloco POS", garantendo coerenza tra frontend e backend e rispettando l'architettura a composables.
## 🎨 UI/UX Guideline (Modern UI)
Quando generi o modifichi componenti o viste, segui sempre questi principi:
- **Design System:** Usa una palette coerente (es. Slate/Gray per i neutri, Indigo o Violet per le azioni primarie).
- **Spaziature:** Usa ampi margini e padding (`p-6`, `space-y-4`) per dare respiro agli elementi. Evita interfacce affollate.
- **Micro-interazioni:** Aggiungi transizioni fluide (`transition-all duration-300`) su hover e stati attivi.
- **Componenti Moderni:**
    - Usa `backdrop-blur-md` per sidebar o modali sopraelevate.
    - Applica `rounded-2xl` o `rounded-3xl` per un look moderno e morbido.
    - Usa ombreggiature leggere e diffuse (`shadow-sm` o `shadow-xl` per i layer superiori).
- **Stato dei dati:** Gestisci sempre visivamente gli stati di `Loading` (tramite skeleton o lo spinner esistente) ed `Empty State`.
- **Feedback:** Ogni azione (es. aggiunta al carrello) deve avere un feedback visivo immediato.
---

## 🏗️ Stack Tecnologico
- **Frontend:** Vue 3 (Composition API, `<script setup>`), TypeScript.
- **Styling:** Tailwind CSS.
- **State:** Pinia Store.
- **Backend:** Supabase (PostgreSQL + Realtime).
- **Routing:** Vue Router con Layout dinamici (`DefaultLayout`, `GuestLayout`, `ManagerLayout`).
---

## 🗄️ Struttura Database (Supabase)

### Tabelle

#### `categories`
Categorie dei prodotti (Primi, Secondi, Bevande, etc.)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_order ON categories(display_order);
```

#### `products`
Prodotti del menu (singoli o kit)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
  is_active BOOLEAN DEFAULT true,
  is_kit BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_available ON products(quantity_available);
CREATE INDEX idx_products_kit ON products(is_kit);
```

#### `product_variants`
Varianti di prodotto (es: Birra Piccola/Media/Grande)

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_variants_product ON product_variants(product_id);
```

#### `kit_items`
Prodotti inclusi nei kit (es: Menu completo = Primo + Contorno + Acqua)

```sql
CREATE TABLE kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  included_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_kit_items_kit ON kit_items(kit_product_id);
CREATE INDEX idx_kit_items_product ON kit_items(included_product_id);

-- Constraint: un kit non può includere se stesso
ALTER TABLE kit_items ADD CONSTRAINT check_no_self_reference 
  CHECK (kit_product_id != included_product_id);
```

#### `orders`
Ordini ricevuti dagli ospiti

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER NOT NULL UNIQUE,
  guest_name TEXT,
  covers INTEGER NOT NULL CHECK (covers > 0 AND covers <= 100),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sequence per order_number
CREATE SEQUENCE order_number_seq START WITH 1;

-- Indexes
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_guest ON orders(guest_name);

-- Trigger per auto-incremento order_number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();
```

#### `order_items`
Righe degli ordini (prodotti ordinati)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);
```

### Trigger per updated_at

```sql
-- Funzione generica per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger a tutte le tabelle con updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS)

```sql
-- Abilita RLS su tutte le tabelle
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy per area ospiti (lettura pubblica)
CREATE POLICY "Public read access on categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access on products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access on variants" ON product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access on kit_items" ON kit_items
  FOR SELECT USING (true);

-- Policy per ordini (ospiti possono creare e leggere i propri)
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read own orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Public can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read order items" ON order_items
  FOR SELECT USING (true);

-- Policy per manager (full access quando autenticati)
CREATE POLICY "Manager full access on categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Manager full access on products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Manager full access on variants" ON product_variants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Manager full access on kit_items" ON kit_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Manager full access on orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Manager full access on order_items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');
```

### Relazioni

```
categories (1) ──→ (N) products
products (1) ──→ (N) product_variants
products (1) ──→ (N) kit_items (as kit_product_id)
products (1) ──→ (N) kit_items (as included_product_id)
products (1) ──→ (N) order_items
product_variants (1) ──→ (N) order_items
orders (1) ──→ (N) order_items
```

### Dati di Esempio (Seeding)

Vedi `database/seed.sql` per:
- 5 categorie (Primi, Secondi, Contorni, Bevande, Dolci)
- ~25 prodotti di esempio
- 2 menu kit (Primo Completo, Secondo Completo)
- Varianti per Birra (Piccola/Grande) e Gelato (Coppetta Piccola/Grande)
- 4 ordini di esempio

---

## 🗺️ Mappa del Progetto

### 1. Area Guest (Pubblica)
- **Layout:** `GuestLayout`.
- **Viste:** `MenuView`, `CheckoutView`, `OrderSuccessView`.
- **Componenti chiave:** `CategoryTabs`, `ProductCard`, `CartButton`, `CartSidebar`, `CartItem`, `LoadingSpinner`, `EmptyState`, `NotFoundView`.

### 2. Area Manager (Protetta)
- **Layout:** `ManagerLayout` (Sidebar responsive, menu manager, logout).
- **Viste:** - `LoginView`: Accesso con Auth Guard.
    - `DashboardView`: Statistiche rapide e `DatabaseSeeder`.
    - `ProductsView`: Gestione catalogo (filtri, lista, form).
    - `OrdersView`: Monitoraggio ordini con filtri avanzati.
    - `StatsView`: Revenue per categoria, top prodotti, analisi oraria.

---

## 🔩 Logica di Business (Composables)
Utilizza esclusivamente i composables esistenti per la manipolazione dei dati:

- **`useOrders`:** Gestisce il ciclo di vita dell'ordine (`create`, `update`, `cancel`) e le analisi (`totalRevenue`, `getTopProducts`, `getOrdersByHour`). Supporta il Realtime.
- **`useCart`:** Gestisce lo stato del carrello lato client.
- **`useProducts` / `useCategories`:** Recupero e gestione del catalogo.
- **`useAuth`:** Gestione sessione e guardie di navigazione.

---

## 🛠️ Utility & Seeding
Per il testing e il popolamento del database, fai riferimento a:
- `seed.sql`: Script SQL per insert massive.
- `seedDatabase.ts`: Funzioni `seedDatabase`, `clearDatabase`, `resetDatabase`.
- `DatabaseSeeder.vue`: Interfaccia UI per il controllo dei dati.

---

## 📏 Regole d'Oro (Rules)
1. **Tipizzazione:** Ogni risposta deve utilizzare i tipi TypeScript definiti per le tabelle Supabase.
2. **Layout:** Rispetta la separazione tra Guest e Manager Layout.
3. **Statistiche:** Per nuovi grafici o metriche, estendi `useOrders` mantenendo la logica centralizzata.
4. **UI:** Usa Tailwind per la responsività, specialmente nella sidebar del Manager.
5. **Realtime:** Assicurati che le liste ordini siano sempre aggiornate tramite le sottoscrizioni di Supabase gestite nei composables.

---

## 📝 Note per l'IA
Quando generi codice, agisci come se conoscessi già la struttura dei file sopra elencati. Non reinventare logiche di filtraggio se sono già presenti in `useOrders`.