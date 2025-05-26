

export const verifyWebhookSignature = (signature: string, body: string, secret: string): boolean => {
  if (!signature || !body || !secret) {
    console.warn('🚫 Missing signature, body, or secret for webhook verification.');
    return false;
  }

  const crypto = require('crypto');
  const computedSignature = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;

  if (computedSignature !== signature) {
    console.warn('🚫 Webhook signature mismatch. Request denied.');
    return false;
  }

  return true;
}
