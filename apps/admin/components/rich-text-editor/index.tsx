"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import MenuBar from "./menu-bar"
import TextAlign from "@tiptap/extension-text-align"
import { useCallback, useEffect, useState } from "react"
import { Placeholder } from "@tiptap/extensions"
import { cn } from "@bs42/ui/lib/utils"

interface RichTextEditorProps {
  onChange: (data: string | null) => void
  value: string
  id: string
  disabled?: boolean
  placeholder?: string
}

const RichTextEditor = ({ onChange, value, id, disabled = false, placeholder }: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false)

  // Safely parse content
  const getContent = useCallback((val: string) => {
    if (!val) return ""
    try {
      return JSON.parse(val)
    } catch {
      // If it's not valid JSON, treat it as plain text
      return val
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
      },
    },
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) {
        onChange(null)
        return
      }
      const json = editor.getJSON()
      onChange(JSON.stringify(json))
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    content: getContent(value),
  })

  // Update editor content when value prop changes (e.g., form reset)
  useEffect(() => {
    if (!editor) return

    const currentContent = JSON.stringify(editor.getJSON())
    const newContent = value ? JSON.stringify(getContent(value)) : JSON.stringify({ type: "doc", content: [] })

    // Only update if content actually changed to avoid unnecessary re-renders
    if (currentContent !== newContent) {
      editor.commands.setContent(getContent(value))
    }
  }, [value, editor, getContent])

  // Update editable state when disabled prop changes
  // useEffect(() => {
  // 	if (!editor) return
  // 	editor.setEditable(!disabled)
  // }, [disabled, editor])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  // Handle label click to focus editor
  const handleFocus = useCallback(() => {
    if (editor && !disabled) {
      editor.commands.focus()
    }
  }, [editor, disabled])

  // Expose focus method via imperative handle if needed
  useEffect(() => {
    const element = document.getElementById(id)
    if (element) {
      // Store the focus handler on the element for the label to use
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(element as any).focusEditor = handleFocus
    }
  }, [id, handleFocus])

  return (
    <div
      id={id}
      className={cn(
        "w-full overflow-hidden rounded-md border transition-colors dark:bg-input/30",
        isFocused && "border-ring ring-[3px] ring-ring/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={handleFocus}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
export default RichTextEditor
