'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  RotateCcw,
  RotateCw,
  Save,
} from 'lucide-react'

interface Props {
  initialHtml: string
}

export function TermosEditor({ initialHtml }: Props) {
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[400px] px-1',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href ?? ''
    const url = window.prompt('URL do link:', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL da imagem:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  async function handleSave() {
    if (!editor) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/termos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: editor.getHTML() }),
      })
      if (res.ok) {
        toast.success('Termos salvos com sucesso!')
      } else {
        toast.error('Erro ao salvar os termos')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  if (!editor) return null

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
      style={{
        background: active ? '#FFF1F5' : 'transparent',
        color: active ? '#FF6B9D' : '#374151',
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 p-3 border-b"
        style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}
      >
        {/* History */}
        <ToolBtn title="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <RotateCcw className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <RotateCw className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 mx-1.5" style={{ background: '#E5E7EB' }} />

        {/* Headings */}
        <ToolBtn
          title="Título 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Título 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Título 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 mx-1.5" style={{ background: '#E5E7EB' }} />

        {/* Formatting */}
        <ToolBtn
          title="Negrito"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Itálico"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Sublinhado"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 mx-1.5" style={{ background: '#E5E7EB' }} />

        {/* Lists */}
        <ToolBtn
          title="Lista"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Lista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 mx-1.5" style={{ background: '#E5E7EB' }} />

        {/* Align */}
        <ToolBtn
          title="Alinhar à esquerda"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Centralizar"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Alinhar à direita"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 mx-1.5" style={{ background: '#E5E7EB' }} />

        {/* Divider */}
        <ToolBtn
          title="Linha divisória"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </ToolBtn>

        {/* Link */}
        <ToolBtn title="Inserir link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="w-4 h-4" />
        </ToolBtn>

        {/* Image */}
        <ToolBtn title="Inserir imagem" onClick={addImage}>
          <ImageIcon className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div className="p-6 termos-content">
        <EditorContent editor={editor} />
      </div>

      {/* Save button */}
      <div className="flex justify-end p-4 border-t" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF4D8D)' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Termos'}
        </button>
      </div>
    </div>
  )
}
