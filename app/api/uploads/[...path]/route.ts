import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/app/uploads'

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = path.join(UPLOAD_DIR, ...params.path)

  // Segurança: impedir path traversal
  const resolved = path.resolve(filePath)
  const base = path.resolve(UPLOAD_DIR)
  if (!resolved.startsWith(base)) {
    return new NextResponse('Proibido', { status: 403 })
  }

  try {
    const buffer = await readFile(resolved)
    const ext = path.extname(resolved).toLowerCase().slice(1)
    const contentType =
      ext === 'png' ? 'image/png' :
      ext === 'gif' ? 'image/gif' :
      ext === 'webp' ? 'image/webp' :
      'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Não encontrado', { status: 404 })
  }
}
