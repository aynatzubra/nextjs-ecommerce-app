import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM

if (!apiKey) {
  throw new Error('Missing RESEND_API_KEY')
}

if (!from) {
  throw new Error('Missing EMAIL_FROM')
}
export const resend = new Resend(apiKey)