// backend/src/utils/hubspotWebhookUtils.ts
import * as crypto from 'crypto';

export const verifyWebhookSignature = (
  signature: string, // This is the string from the X-HubSpot-Signature header
  rawBody: string,
  secret: string,
  headers: Record<string, string | string[] | undefined> // headers parameter is kept to access X-HubSpot-Signature-Version for logging
): boolean => {
  if (!signature || !rawBody || !secret) {
    console.warn('🚫 Missing signature, raw body, or secret for webhook verification.');
    return false;
  }

  const signatureVersionHeader = headers['x-hubspot-signature-version'];

  let computedSignatureBuffer: Buffer;
  let receivedSignatureBuffer: Buffer;
  let detectedLogicVersion: string;

  // --- V1 Signature Validation Logic ---
  // As confirmed by the user, the header version is always v1.
  // Documentation: Client secret + request body, then SHA-256 hash.
  detectedLogicVersion = 'v1';
  const sourceString = secret + rawBody;
  computedSignatureBuffer = crypto.createHash('sha256').update(sourceString, 'utf8').digest(); // Digest to raw Buffer

  // IMPORTANT DEBUG: Log the raw signature string received from the header
  console.log('--- Raw Signature String Received (from X-HubSpot-Signature header) ---');
  console.log(signature);
  console.log('----------------------------------------------------------------------');

  // Attempt to convert received signature from Base64, as seen in user's previous debug output.
  // We keep the try-catch to handle potential invalid Base64 or non-standard lengths.
  try {
    receivedSignatureBuffer = Buffer.from(signature, 'base64');
    // If after Base64 decoding, it's not 32 bytes, it means the Base64 string wasn't a standard SHA256 hash.
    if (receivedSignatureBuffer.length !== 32) {
      console.warn(`🚫 Received Base64 signature decoded to ${receivedSignatureBuffer.length} bytes (expected 32). Attempting as Hex.`);
      receivedSignatureBuffer = Buffer.from(signature, 'hex'); // Fallback to hex
    }
  } catch (e: unknown) {
    let errorMessage = 'Unknown error';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.warn(`🚫 Error decoding received signature as Base64: ${errorMessage}. Attempting as Hex.`);
    receivedSignatureBuffer = Buffer.from(signature, 'hex'); // Fallback to hex if Base64 conversion fails
  }

  // For debugging, print relevant info (hex/base64 representations of buffers)
  console.log('--- Signature Verification Debug ---');
  console.log(`Header Version: ${signatureVersionHeader || 'N/A'}`);
  console.log(`Detected Logic Version: ${detectedLogicVersion}`);
  console.log(`Computed Buffer (hex): ${computedSignatureBuffer.toString('hex')}`);
  console.log(`Received Buffer (hex): ${receivedSignatureBuffer.toString('hex')}`);
  console.log(`Computed Buffer (base64): ${computedSignatureBuffer.toString('base64')}`);
  console.log(`Received Buffer (base64): ${receivedSignatureBuffer.toString('base64')}`);
  console.log(`Computed Buffer Length: ${computedSignatureBuffer.length}`);
  console.log(`Received Buffer Length: ${receivedSignatureBuffer.length}`);
  console.log('------------------------------------');

  // Use a constant-time comparison on the actual raw hash buffers
  const isSignatureValid = crypto.timingSafeEqual(computedSignatureBuffer, receivedSignatureBuffer);

  if (!isSignatureValid) {
    console.warn('🚫 Webhook signature mismatch. Request denied.');
    return false;
  }

  return true;
};