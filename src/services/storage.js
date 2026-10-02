import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

async function shrink(file, max = 1600) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob || file;
  } catch { return file; }
}
export async function uploadImage(file, folder) {
  const blob = await shrink(file);
  const r = ref(storage, `uploads/${folder}/${Date.now()}.jpg`);
  await uploadBytes(r, blob, { contentType: blob.type || 'image/jpeg' });
  return getDownloadURL(r);
}
export async function removeImage(url) {
  if (!url || !url.includes('firebasestorage')) return;
  try { await deleteObject(ref(storage, url)); } catch (e) { console.warn('image delete', e.code); }
}
