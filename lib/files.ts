import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const uploadDir = process.env.UPLOAD_DIR ?? '/app/uploads'

const allowedTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

export function extensionForMime(type: string) {
  return allowedTypes[type]
}

export async function saveUpload(file: File, folder: string, maxBytes = 50 * 1024 * 1024) {
  if (file.size <= 0 || file.size > maxBytes) throw new Error(`Arquivo invalido ou maior que ${Math.round(maxBytes / 1024 / 1024)} MB`)
  const ext = extensionForMime(file.type)
  if (!ext) throw new Error('Tipo de arquivo nao permitido')
  const safeFolder = folder.split('/').filter(Boolean).join(path.sep)
  const dir = path.join(uploadDir, safeFolder)
  await mkdir(dir, { recursive: true })
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
  return `/uploads/${safeFolder.replaceAll(path.sep, '/')}/${filename}`
}
