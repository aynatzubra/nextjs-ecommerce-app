export const rateLimitKeys = {
  credentialsEmail: (email: string) =>
    `credentials:email:${email}`,
  
  credentialsIp: (ip: string) => `credentials:ip:${ip}`,
  
  registerIp: (ip: string) => `register:ip:${ip}`,
  
  verifyIp: (ip: string) => `verify:ip:${ip}`,
  
  resendIp: (ip: string) => `resend:ip:${ip}`,
  
  resendEmail: (email: string) => `resend:email:${email}`,
}