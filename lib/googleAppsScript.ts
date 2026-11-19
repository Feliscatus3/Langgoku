import 'server-only'

import { appsScriptGet, appsScriptPost } from './appsScriptClient'
import type { AppsScriptResponse } from './appsScriptClient'

export type { AppsScriptResponse } from './appsScriptClient'

export interface BuyerPayload {
  name: string
  phone: string
  product: string
  duration: string
  startDate: string
  endDate: string
  variantId?: string
  variantName?: string
}

export async function getBuyersFromSheet(): Promise<AppsScriptResponse> {
  return appsScriptGet('getBuyers', {}, { revalidate: 0 })
}

export async function getBuyerFromSheet(id: string): Promise<AppsScriptResponse> {
  return appsScriptGet('getBuyer', { id }, { revalidate: 0 })
}

export async function addBuyerToSheet(buyer: BuyerPayload): Promise<AppsScriptResponse> {
  return appsScriptPost({ action: 'addBuyer', ...buyer })
}

export async function updateBuyerInSheet(
  buyer: BuyerPayload & { id: string }
): Promise<AppsScriptResponse> {
  return appsScriptPost({ action: 'updateBuyer', ...buyer })
}

export async function deleteBuyerFromSheet(id: string): Promise<AppsScriptResponse> {
  return appsScriptPost({ action: 'deleteBuyer', id })
}
