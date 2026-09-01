// ============================================================
// Centralized Institutional & Platform Configuration
// Single source of truth driven by environment variables
// ============================================================

export interface InstitutionConfig {
  name: string
  shortName: string
  tagline: string
  description: string
  websiteUrl: string
  portalUrl: string
  domain: string
  
  contact: {
    phone: string
    phoneRaw: string
    phoneFormatted: string
    whatsappNumber: string
    email: string
    admissionsEmail: string
  }

  bank: {
    name: string
    accountNumber: string
    paybillNumber: string
    accountName: string
    branch: string
  }

  pricing: {
    currencySymbol: string
    currencyCode: string
    defaultTuitionFee: number
  }

  auth: {
    adminDefaultPassword?: string
    internalEmailDomain: string
  }
}

export const INSTITUTION_CONFIG: InstitutionConfig = {
  name: (import.meta.env.VITE_INSTITUTION_NAME as string) || 'Éclat Institute',
  shortName: (import.meta.env.VITE_INSTITUTION_SHORT_NAME as string) || 'Éclat Institute',
  tagline: (import.meta.env.VITE_INSTITUTION_TAGLINE as string) || '100% Online Global Academy',
  description:
    (import.meta.env.VITE_INSTITUTION_DESC as string) ||
    'Accredited 100% Online Global Academy for Technology, Software Engineering, Data Science, and Modern Languages.',
  websiteUrl: (import.meta.env.VITE_WEBSITE_URL as string) || 'https://eclat.institute',
  portalUrl: (import.meta.env.VITE_PORTAL_URL as string) || 'https://eclat.institute/login',
  domain: (import.meta.env.VITE_INSTITUTION_DOMAIN as string) || 'eclat.institute',

  contact: {
    phone: (import.meta.env.VITE_INSTITUTION_PHONE as string) || '+254 740 027 346',
    phoneRaw: (import.meta.env.VITE_INSTITUTION_PHONE_RAW as string) || '254740027346',
    phoneFormatted: (import.meta.env.VITE_INSTITUTION_PHONE as string) || '+254 740 027 346',
    whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '254740027346',
    email: (import.meta.env.VITE_INSTITUTION_EMAIL as string) || 'admissions@eclat.institute',
    admissionsEmail: (import.meta.env.VITE_ADMISSIONS_EMAIL as string) || 'admissions@eclat.institute',
  },

  bank: {
    name: (import.meta.env.VITE_BANK_NAME as string) || 'KCB Bank',
    accountNumber: (import.meta.env.VITE_BANK_ACCOUNT as string) || '1344329268',
    paybillNumber: (import.meta.env.VITE_PAYBILL_NUMBER as string) || '522522',
    accountName: (import.meta.env.VITE_BANK_ACCOUNT_NAME as string) || 'Éclat Institute',
    branch: (import.meta.env.VITE_BANK_BRANCH as string) || 'Nairobi Central',
  },

  pricing: {
    currencySymbol: (import.meta.env.VITE_CURRENCY_SYMBOL as string) || '$',
    currencyCode: (import.meta.env.VITE_CURRENCY_CODE as string) || 'USD',
    defaultTuitionFee: Number(import.meta.env.VITE_DEFAULT_TUITION_FEE) || 60,
  },

  auth: {
    adminDefaultPassword: (import.meta.env.VITE_ADMIN_PASSWORD as string) || (import.meta.env.ADMIN_PASSWORD as string) || 'Eclat@2026#!',
    internalEmailDomain: (import.meta.env.VITE_INTERNAL_EMAIL_DOMAIN as string) || 'eclatinstitute.internal',
  },
}

/**
 * Helper to construct WhatsApp inquiry link
 */
export function getWhatsAppInquiryUrl(message?: string): string {
  const defaultMsg = `Hello ${INSTITUTION_CONFIG.name} Admissions! I would like to inquire about online courses and upcoming intakes.`
  const text = encodeURIComponent(message || defaultMsg)
  return `https://wa.me/${INSTITUTION_CONFIG.contact.whatsappNumber}?text=${text}`
}

/**
 * Helper to format Paybill text
 */
export function getPaybillSummary(): string {
  return `Paybill: ${INSTITUTION_CONFIG.bank.paybillNumber} • Acc: ${INSTITUTION_CONFIG.bank.accountNumber}`
}
