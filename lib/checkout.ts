import type { CheckoutData, Product, VariantCombination } from '@/types/product'

/** Adds a small, deterministic amount to the price so transfers stay unique. */
export function getUniqueCodeAmount(uniqueCode: string): number {
  const first = String(uniqueCode || '').trim().charAt(0)
  if (!first) return 0
  return first.charCodeAt(0)
}

export function generateUniqueCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function getVariantLabel(
  combination: VariantCombination | null,
  product: Product
): string {
  if (!combination?.options) return ''

  return Object.entries(combination.options)
    .map(([attributeId, optionId]) => {
      const attribute = product.variantAttributes?.find((item) => item.id === attributeId)
      const option = product.attributeOptions?.find((item) => item.id === optionId)
      return attribute && option ? `${attribute.name}: ${option.name}` : ''
    })
    .filter(Boolean)
    .join(', ')
}

export function getEffectivePrice(
  product: Product,
  combination: VariantCombination | null
): number {
  const price = combination?.price ?? product.price
  return Number.isFinite(price) ? price : 0
}

export function buildCheckoutData(
  product: Product,
  combination: VariantCombination | null,
  buyerName: string,
  buyerPhone: string
): CheckoutData {
  const uniqueCode = generateUniqueCode()
  const uniqueCodeAmount = getUniqueCodeAmount(uniqueCode)
  const basePrice = getEffectivePrice(product, combination)

  return {
    productId: product.id,
    productName: product.name,
    productDuration: product.duration,
    originalPrice: basePrice,
    uniqueCode,
    uniqueCodeAmount,
    finalPrice: basePrice + uniqueCodeAmount,
    buyerName: buyerName.trim(),
    buyerPhone: buyerPhone.trim(),
    combinationId: combination?.id,
    variantName: getVariantLabel(combination, product),
  }
}
