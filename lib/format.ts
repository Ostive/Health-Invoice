const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function formatEUR(amount: number) {
    return eurFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export function invoiceTotal(items: { quantity: number; unitPrice: number }[] = []) {
    return items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)
}
