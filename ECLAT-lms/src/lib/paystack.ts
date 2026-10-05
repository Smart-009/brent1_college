import { INSTITUTION_CONFIG } from '@/config/institution'

export interface PaystackPaymentOptions {
  email: string
  amount: number // in major units (e.g., 60 USD or 7500 KES)
  currency?: string // 'KES' or 'USD'
  studentName: string
  admissionNumber?: string
  purpose?: string
  invoiceId?: string
  onSuccess: (reference: string) => void
  onClose?: () => void
}

/**
 * Dynamically loads the official Paystack inline script if not already present.
 */
export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      resolve(true)
      return
    }

    const existingScript = document.getElementById('paystack-inline-js')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.id = 'paystack-inline-js'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Initiates an official Paystack popup checkout.
 * Handles conversion to minor units (cents/kobo) and currency selection.
 */
export async function initializePaystackCheckout(options: PaystackPaymentOptions): Promise<void> {
  const isLoaded = await loadPaystackScript()
  if (!isLoaded || typeof window === 'undefined' || !(window as any).PaystackPop) {
    alert('Unable to load Paystack payment gateway. Please check your internet connection and try again.')
    return
  }

  const publicKey = INSTITUTION_CONFIG.paystack?.publicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  if (!publicKey) {
    alert('Paystack Public Key is not configured. Please contact the administrator.')
    return
  }

  const currency = options.currency || INSTITUTION_CONFIG.paystack?.currency || 'KES'
  
  // If currency is KES and amount is in USD (e.g. 60 USD), approximate conversion or use direct amount
  let chargedAmount = options.amount
  if (currency === 'KES' && options.amount < 500) {
    // Treat small amount (e.g., 60) as USD and convert to KES (~130 KES per USD)
    chargedAmount = Math.round(options.amount * 130)
  }

  // Paystack expects amount in minor units (e.g. cents / kobo: multiply by 100)
  const minorAmount = Math.round(chargedAmount * 100)

  const paymentRef = `ECLAT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

  const paystackHandler = (window as any).PaystackPop.setup({
    key: publicKey,
    email: options.email,
    amount: minorAmount,
    currency: currency,
    ref: paymentRef,
    metadata: {
      custom_fields: [
        {
          display_name: 'Student Name',
          variable_name: 'student_name',
          value: options.studentName,
        },
        {
          display_name: 'Admission Number',
          variable_name: 'admission_number',
          value: options.admissionNumber || 'N/A',
        },
        {
          display_name: 'Payment Purpose',
          variable_name: 'payment_purpose',
          value: options.purpose || 'School Fees Tuition',
        },
        {
          display_name: 'Invoice Reference',
          variable_name: 'invoice_id',
          value: options.invoiceId || 'N/A',
        },
      ],
    },
    callback: (response: { reference: string; status?: string }) => {
      options.onSuccess(response.reference)
    },
    onClose: () => {
      if (options.onClose) {
        options.onClose()
      }
    },
  })

  paystackHandler.openIframe()
}
