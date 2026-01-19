import { ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatDate } from '@/utils/date.ts'
export function useExport() {
  const ordersStore = useOrdersStore()
  const exporting = ref(false)

  /**
   * Converte un array di oggetti in una stringa CSV
   */
  function convertToCSV(data: any[], headers: string[]) {
    const headerRow = headers.join(',') + '\n'

    const rows = data
      .map((row) => {
        return headers
          .map((header) => {
            const value = row[header]
            // Gestione stringhe con virgole o a capo
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            // Formatta numeri con 2 decimali se necessario
            if (typeof value === 'number' && !Number.isInteger(value)) {
              return value.toFixed(2)
            }
            return value
          })
          .join(',')
      })
      .join('\n')

    return headerRow + rows
  }

  /**
   * Scarica il file CSV
   */
  function downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Esporta il report completo degli ordini (Dettaglio)
   */
  async function exportOrdersReport() {
    try {
      exporting.value = true
      const orders = ordersStore.orders

      if (orders.length === 0) {
        alert('Nessun dato da esportare')
        return
      }

      const flatData = orders.map((order) => {
        const itemsSummary =
          order.items
            ?.map(
              (i) => `${i.quantity}x ${i.product?.name} ${i.variant ? `(${i.variant.name})` : ''}`,
            )
            .join('; ') || ''

        return {
          'Numero Ordine': order.order_number,
          Data: formatDate(order.created_at, true),
          Ospite: order.guest_name || 'Anonimo',
          Coperti: order.covers,
          Totale: order.total_amount,
          Stato: order.status,
          Note: order.notes || '',
          Articoli: itemsSummary,
        }
      })

      const headers = [
        'Numero Ordine',
        'Data',
        'Ospite',
        'Coperti',
        'Totale',
        'Stato',
        'Note',
        'Articoli',
      ]
      const csv = convertToCSV(flatData, headers)
      const filename = `report_ordini_${new Date().toISOString().split('T')[0]}.csv`

      downloadCSV(csv, filename)
    } catch (e) {
      console.error('Export error:', e)
      alert("Errore durante l'esportazione")
    } finally {
      exporting.value = false
    }
  }

  /**
   * Esporta il report finanziario (Aggregato per giorno)
   */
  async function exportFinancialReport() {
    try {
      exporting.value = true
      const orders = ordersStore.orders.filter((o) => o.status !== 'cancelled')

      if (orders.length === 0) {
        alert('Nessun dato finanziario disponibile')
        return
      }

      // Raggruppa per data
      const dailyStats = new Map<
        string,
        {
          date: string
          orders_count: number
          covers: number
          revenue: number
        }
      >()

      orders.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString('it-IT')
        const existing = dailyStats.get(date)

        if (existing) {
          existing.orders_count++
          existing.covers += order.covers
          existing.revenue += order.total_amount
        } else {
          dailyStats.set(date, {
            date,
            orders_count: 1,
            covers: order.covers,
            revenue: order.total_amount,
          })
        }
      })

      const flatData = Array.from(dailyStats.values()).map((stat) => ({
        Data: stat.date,
        'Numero Ordini': stat.orders_count,
        'Totale Coperti': stat.covers,
        'Incasso Totale': stat.revenue,
        'Scontrino Medio': stat.revenue / stat.orders_count,
        'Media per Coperto': stat.revenue / stat.covers,
      }))

      const headers = [
        'Data',
        'Numero Ordini',
        'Totale Coperti',
        'Incasso Totale',
        'Scontrino Medio',
        'Media per Coperto',
      ]
      const csv = convertToCSV(flatData, headers)
      const filename = `report_finanziario_${new Date().toISOString().split('T')[0]}.csv`

      downloadCSV(csv, filename)
    } catch (e) {
      console.error('Export error:', e)
      alert("Errore durante l'esportazione")
    } finally {
      exporting.value = false
    }
  }

  /**
   * Esporta il report vendite per prodotto
   */
  async function exportProductSales() {
    try {
      exporting.value = true
      const orders = ordersStore.orders.filter((o) => o.status !== 'cancelled')

      if (orders.length === 0) {
        alert('Nessun dato di vendita disponibile')
        return
      }

      const productStats = new Map<
        string,
        {
          name: string
          category: string
          quantity: number
          revenue: number
        }
      >()

      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const key = item.product_id
          const existing = productStats.get(key)
          const revenue = item.unit_price * item.quantity

          if (existing) {
            existing.quantity += item.quantity
            existing.revenue += revenue
          } else {
            productStats.set(key, {
              name: item.product?.name || 'Sconosciuto',
              category: item.product?.category?.name || 'N/A',
              quantity: item.quantity,
              revenue: revenue,
            })
          }
        })
      })

      const flatData = Array.from(productStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .map((stat) => ({
          Prodotto: stat.name,
          Categoria: stat.category,
          'Quantità Venduta': stat.quantity,
          'Incasso Generato': stat.revenue,
          'Prezzo Medio': stat.revenue / stat.quantity,
        }))

      const headers = [
        'Prodotto',
        'Categoria',
        'Quantità Venduta',
        'Incasso Generato',
        'Prezzo Medio',
      ]
      const csv = convertToCSV(flatData, headers)
      const filename = `report_prodotti_${new Date().toISOString().split('T')[0]}.csv`

      downloadCSV(csv, filename)
    } catch (e) {
      console.error('Export error:', e)
      alert("Errore durante l'esportazione")
    } finally {
      exporting.value = false
    }
  }

  return {
    exporting,
    exportOrdersReport,
    exportFinancialReport,
    exportProductSales,
  }
}
