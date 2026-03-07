import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft } from 'lucide-react';
import { Button } from './ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Enter description...', minHeight = '200px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const formatButton = (command: string, icon: React.ReactNode, label: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        executeCommand(command);
      }}
      className="h-8 w-8 p-0 hover:bg-[#FAF4EC]"
      title={label}
    >
      {icon}
    </Button>
  );

  return (
    <div className={`border rounded-lg ${isFocused ? 'ring-2 ring-[#6B7F39] border-[#6B7F39]' : 'border-gray-300'}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-wrap">
        {formatButton('bold', <Bold className="w-4 h-4" />, 'Bold (Ctrl+B)')}
        {formatButton('italic', <Italic className="w-4 h-4" />, 'Italic (Ctrl+I)')}
        {formatButton('underline', <Underline className="w-4 h-4" />, 'Underline (Ctrl+U)')}
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {formatButton('insertUnorderedList', <List className="w-4 h-4" />, 'Bullet List')}
        {formatButton('insertOrderedList', <ListOrdered className="w-4 h-4" />, 'Numbered List')}
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {formatButton('justifyLeft', <AlignLeft className="w-4 h-4" />, 'Align Left')}
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            executeCommand('removeFormat');
          }}
          className="h-8 px-2 text-xs hover:bg-[#FAF4EC]"
          title="Clear Formatting"
        >
          Clear Format
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-3 outline-none overflow-y-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] li {
          margin-bottom: 0.25rem;
        }
        [contenteditable] p {
          margin-bottom: 0.5rem;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
