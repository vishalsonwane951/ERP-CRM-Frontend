import { api } from '../api/index.js';

export const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
export const MAX_MB = 10;

/** The S3 upload flow in one call: ask for a link, PUT the file straight to S3, confirm. Returns the saved document. */
export async function uploadDocument({ category, file, employeeId }) {
  const slot = await api.documents.uploadUrl({ employeeId, category, filename: file.name, contentType: file.type });
  const put = await fetch(slot.uploadUrl, { method: 'PUT', headers: slot.headers, body: file });
  if (!put.ok) throw new Error('The upload to storage failed. Try again.');
  return api.documents.confirm({ documentId: slot.documentId, employeeId, category, filename: file.name, key: slot.key });
}
