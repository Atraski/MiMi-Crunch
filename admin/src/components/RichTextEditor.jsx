import { useEffect, useRef, useState } from 'react'

const VISUAL = 'visual'
const CODE = 'code'

const toolbarButtons = [
  { command: 'undo', label: '⟲', title: 'Undo' },
  { command: 'redo', label: '⟳', title: 'Redo' },
  { type: 'divider' },
  { command: 'bold', label: 'B', title: 'Bold' },
  { command: 'italic', label: 'I', title: 'Italic' },
  { command: 'underline', label: 'U', title: 'Underline' },
  { command: 'strikeThrough', label: 'S', title: 'Strikethrough' },
  { type: 'divider' },
  { command: 'createLink', label: 'Link', title: 'Insert link', prompt: true },
  { type: 'divider' },
  { command: 'insertUnorderedList', label: '• List', title: 'Bullet list' },
  { command: 'insertOrderedList', label: '1. List', title: 'Numbered list' },
  { type: 'divider' },
  { command: 'formatBlock', value: 'h1', label: 'H1', title: 'Heading 1' },
  { command: 'formatBlock', value: 'h2', label: 'H2', title: 'Heading 2' },
  { command: 'formatBlock', value: 'h3', label: 'H3', title: 'Heading 3' },
  { command: 'formatBlock', value: 'p', label: 'Text', title: 'Normal text' },
  { command: 'formatBlock', value: 'blockquote', label: '“”', title: 'Quote' },
  { command: 'formatBlock', value: 'pre', label: '{}', title: 'Code block' },
  { command: 'insertHorizontalRule', label: '—', title: 'Horizontal line' },
  { type: 'divider' },
  { command: 'justifyLeft', label: '≡', title: 'Align left' },
  { command: 'justifyCenter', label: '≡', title: 'Align center' },
  { command: 'justifyRight', label: '≡', title: 'Align right' },
  { type: 'divider' },
  { command: 'indent', label: '→|', title: 'Indent' },
  { command: 'outdent', label: '|←', title: 'Outdent' },
  { type: 'divider' },
  { command: 'removeFormat', label: 'Clear', title: 'Remove formatting' },
]

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null)
  const [activeTab, setActiveTab] = useState(VISUAL)
  const [codeValue, setCodeValue] = useState(() => value ?? '')

  useEffect(() => {
    if (activeTab === VISUAL && editorRef.current) {
      editorRef.current.innerHTML = value ?? ''
    }
  }, [value, activeTab])

  useEffect(() => {
    setCodeValue(value ?? '')
  }, [value])

  const handleInput = () => {
    if (!editorRef.current) return
    onChange?.(editorRef.current.innerHTML)
  }

  const handleCommand = (command, valueArg, prompt) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    if (command === 'createLink' && prompt) {
      const url = window.prompt('Enter URL:', 'https://')
      if (url) document.execCommand(command, false, url)
    } else if (command === 'formatBlock' || command === 'createLink') {
      document.execCommand(command, false, valueArg || '')
    } else {
      document.execCommand(command, false, valueArg || null)
    }
    handleInput()
  }

  const switchToVisual = () => {
    if (activeTab === CODE) {
      const html = codeValue.trim()
      onChange?.(html || '')
    }
    setActiveTab(VISUAL)
  }

  const switchToCode = () => {
    if (activeTab === VISUAL && editorRef.current) {
      setCodeValue(editorRef.current.innerHTML || '')
    }
    setActiveTab(CODE)
  }

  const handleCodeChange = (e) => {
    const v = e.target.value
    setCodeValue(v)
    onChange?.(v)
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex border-b border-stone-200 bg-stone-50">
        <button
          type="button"
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === VISUAL
              ? 'border-b-2 border-stone-900 bg-white text-stone-900'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
          }`}
          onClick={switchToVisual}
        >
          Visual
        </button>
        <button
          type="button"
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === CODE
              ? 'border-b-2 border-stone-900 bg-white text-stone-900'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
          }`}
          onClick={switchToCode}
        >
          Code
        </button>
      </div>

      {activeTab === VISUAL && (
        <>
          <div className="flex flex-wrap gap-0.5 border-b border-stone-200 bg-stone-50/80 px-2 py-1.5 text-xs">
            {toolbarButtons.map((btn, i) =>
              btn.type === 'divider' ? (
                <span key={`div-${i}`} className="mx-0.5 w-px self-stretch bg-stone-300" />
              ) : (
                <button
                  key={`${btn.command}-${btn.label}`}
                  type="button"
                  title={btn.title}
                  className="rounded px-2 py-1 font-semibold text-stone-700 hover:bg-stone-200/80"
                  onClick={() =>
                    handleCommand(btn.command, btn.value, btn.prompt)
                  }
                >
                  {btn.label}
                </button>
              )
            )}
          </div>
          <div
            ref={editorRef}
            className="min-h-[220px] max-h-[420px] overflow-y-auto px-3 py-3 text-sm leading-relaxed text-stone-800 focus:outline-none prose prose-sm max-w-none prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-blockquote:border-l-stone-300 prose-blockquote:italic prose-pre:bg-stone-100 prose-pre:rounded-lg"
            contentEditable
            onInput={handleInput}
            data-placeholder={placeholder}
          />
        </>
      )}

      {activeTab === CODE && (
        <div className="relative">
          <textarea
            className="min-h-[220px] w-full max-h-[420px] resize-y border-0 bg-stone-50/50 p-3 font-mono text-sm leading-relaxed text-stone-800 focus:outline-none focus:ring-0"
            value={codeValue}
            onChange={handleCodeChange}
            placeholder="Add HTML and CSS here. You can use &lt;style&gt;...&lt;/style&gt; for custom styles."
            spellCheck={false}
          />
          <p className="border-t border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-500">
            Edit raw HTML/CSS. Use &lt;style&gt; tags for custom CSS.
          </p>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
