import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = 'Start writing your clinical insight...' 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-sm focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500/50 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <span className="italic">I</span>
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="font-black text-xs">H2</span>
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </MenuButton>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <MenuButton 
          onClick={() => {
            const url = window.prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Add Image"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </MenuButton>
      </div>

      {/* Editor Area */}
      <div className="p-8 min-h-[400px] prose prose-slate max-w-none">
        <EditorContent editor={editor} />
      </div>

      {/* Footer / Stats */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
         <div className="flex gap-4">
            <span>Words: {editor.storage.characterCount?.words?.() || 0}</span>
            <span>Est. Reading Time: {Math.ceil((editor.storage.characterCount?.words?.() || 0) / 200)} min</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>Auto-saved</span>
         </div>
      </div>
    </div>
  );
};
