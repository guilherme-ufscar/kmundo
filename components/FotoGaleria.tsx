'use client'

import { useState, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from 'lucide-react'

interface Props {
  fotos: string[]
  /** Se fornecido, exibe controles de upload/remoção */
  onFotosChange?: (novasFotos: string[]) => void
  maxFotos?: number
}

const MAX_SIZE_MB = 5

export function FotoGaleria({ fotos, onFotosChange, maxFotos = 10 }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const abrirLightbox = (idx: number) => setLightboxIdx(idx)
  const fecharLightbox = () => setLightboxIdx(null)

  const anterior = useCallback(() => {
    setLightboxIdx((i) => (i !== null ? (i - 1 + fotos.length) % fotos.length : null))
  }, [fotos.length])

  const proximo = useCallback(() => {
    setLightboxIdx((i) => (i !== null ? (i + 1) % fotos.length : null))
  }, [fotos.length])

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!onFotosChange) return
    const files = Array.from(e.target.files ?? [])
    if (fotos.length + files.length > maxFotos) {
      alert(`Máximo de ${maxFotos} fotos por item`)
      return
    }
    const novas: string[] = []
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`"${file.name}" excede ${MAX_SIZE_MB}MB`)
        return
      }
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      novas.push(base64)
    }
    onFotosChange([...fotos, ...novas])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removerFoto(idx: number) {
    if (!onFotosChange) return
    onFotosChange(fotos.filter((_, i) => i !== idx))
  }

  const editavel = !!onFotosChange

  return (
    <>
      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {fotos.map((foto, idx) => (
            <div key={idx} className="relative aspect-square group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              {/* Overlay hover */}
              <div
                className="absolute inset-0 rounded-lg flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.45)' }}
              >
                <button
                  type="button"
                  title="Ampliar"
                  onClick={() => abrirLightbox(idx)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {editavel && (
                  <button
                    type="button"
                    title="Remover"
                    onClick={() => removerFoto(idx)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    style={{ background: 'rgba(239,68,68,0.8)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão de upload */}
      {editavel && fotos.length < maxFotos && (
        <label
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-gray-50"
          style={{ borderColor: '#E5E7EB' }}
        >
          <Camera className="w-5 h-5" style={{ color: '#9CA3AF' }} />
          <span className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            Adicionar fotos ({fotos.length}/{maxFotos}) · máx. {MAX_SIZE_MB}MB cada
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
          />
        </label>
      )}

      {fotos.length === 0 && !editavel && (
        <p className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>Nenhuma foto disponível</p>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={fecharLightbox}
        >
          {/* Fechar */}
          <button
            type="button"
            onClick={fecharLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contador */}
          <span
            className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-medium px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            {lightboxIdx + 1} / {fotos.length}
          </span>

          {/* Seta anterior */}
          {fotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); anterior() }}
              className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Imagem */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[lightboxIdx]}
            alt={`Foto ${lightboxIdx + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-xl select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Seta próxima */}
          {fotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); proximo() }}
              className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
