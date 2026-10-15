import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Eye,
  RemoveFormatting,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { MediaPickerModal } from './MediaPickerModal';
import { injectTocIds, slugify } from '@/admin/lib/utils';
import type { MediaDoc } from '@/admin/types/media';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  minHeight?: string;
  className?: string;
  id?: string;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Nhập nội dung bài viết...',
  error,
  minHeight = '300px',
  className = '',
  id,
}: RichTextEditorProps) {
  // Chế độ: 'visual' (WYSIWYG) hoặc 'code' (HTML source)
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Đồng bộ nội dung từ value prop vào contentEditable khi ở chế độ visual
  useEffect(() => {
    if (mode === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, mode]);

  // Xử lý cập nhật nội dung từ ContentEditable ra ngoài kèm injectTocIds
  const handleContentUpdate = useCallback(() => {
    if (editorRef.current) {
      const rawHtml = editorRef.current.innerHTML;
      // Tự động gắn id chuẩn SEO cho mọi thẻ H2
      const { html: processedHtml } = injectTocIds(rawHtml);
      onChange(processedHtml);
    }
  }, [onChange]);

  // Thực thi lệnh định dạng
  const execCommand = (command: string, arg: string | undefined = undefined) => {
    if (mode !== 'visual') return;
    editorRef.current?.focus();
    if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      document.execCommand(command, false, arg);
    }
    handleContentUpdate();
  };

  // Định dạng thẻ H2 kèm tự sinh id cho TOC
  const handleInsertH2 = () => {
    if (mode !== 'visual') return;
    editorRef.current?.focus();
    const selection = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
    const selectedText = selection ? selection.toString().trim() : '';

    if (selectedText) {
      const id = slugify(selectedText);
      const h2Html = `<h2 id="${id}">${selectedText}</h2>`;
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('insertHTML', false, h2Html);
      } else if (editorRef.current) {
        editorRef.current.innerHTML += h2Html;
      }
    } else {
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (editorRef.current) {
        editorRef.current.innerHTML += '<h2 id="tieu-de-2">Tiêu đề 2</h2>';
      }
    }
    handleContentUpdate();
  };

  // Định dạng thẻ H3
  const handleInsertH3 = () => {
    execCommand('formatBlock', '<h3>');
  };

  // Định dạng đoạn văn
  const handleInsertParagraph = () => {
    execCommand('formatBlock', '<p>');
  };

  // Chèn liên kết
  const handleConfirmLink = () => {
    if (linkUrl.trim()) {
      execCommand('createLink', linkUrl.trim());
    }
    setIsLinkPromptOpen(false);
    setLinkUrl('');
  };

  // Chèn ảnh từ MediaPickerModal
  const handleSelectMedia = (media: MediaDoc) => {
    const imgUrl = media.sizes?.hero?.url || media.sizes?.card?.url || media.url || '';
    const altText = media.alt || '';
    const captionText = media.caption ? `<figcaption class="text-xs text-center text-slate-400 mt-1">${media.caption}</figcaption>` : '';

    const figureHtml = `
      <figure class="my-4 text-center">
        <img src="${imgUrl}" alt="${altText}" class="rounded-xl mx-auto max-w-full h-auto shadow-md" loading="lazy" />
        ${captionText}
      </figure>
    `;

    if (mode === 'visual') {
      editorRef.current?.focus();
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('insertHTML', false, figureHtml);
      } else if (editorRef.current) {
        editorRef.current.innerHTML += figureHtml;
      }
      handleContentUpdate();
    } else {
      // Code mode: chèn vào textarea
      const current = value || '';
      const { html } = injectTocIds(`${current}\n${figureHtml}`);
      onChange(html);
    }
    setIsMediaPickerOpen(false);
  };

  // Xóa định dạng
  const handleClearFormat = () => {
    execCommand('removeFormat');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Chuyển đổi chế độ */}
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
              mode === 'visual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="mode-visual-btn"
          >
            <Eye className="w-3.5 h-3.5" />
            Trực quan
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
              mode === 'code'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="mode-code-btn"
          >
            <Code className="w-3.5 h-3.5" />
            Mã HTML
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div
        className={`rounded-2xl border bg-white overflow-hidden transition ${
          error ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 focus-within:border-blue-500'
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            disabled={mode === 'code'}
            title="In đậm (Bold)"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-bold-btn"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            disabled={mode === 'code'}
            title="In nghiêng (Italic)"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-italic-btn"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1" />

          {/* Heading buttons */}
          <button
            type="button"
            onClick={handleInsertH2}
            disabled={mode === 'code'}
            title="Tiêu đề 2 (H2 - Mục lục TOC)"
            className="px-2 py-1 rounded-lg text-xs font-bold hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
            data-testid="toolbar-h2-btn"
          >
            <Heading2 className="w-4 h-4" />
            <span>H2</span>
          </button>
          <button
            type="button"
            onClick={handleInsertH3}
            disabled={mode === 'code'}
            title="Tiêu đề 3 (H3)"
            className="px-2 py-1 rounded-lg text-xs font-bold hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
            data-testid="toolbar-h3-btn"
          >
            <Heading3 className="w-4 h-4" />
            <span>H3</span>
          </button>
          <button
            type="button"
            onClick={handleInsertParagraph}
            disabled={mode === 'code'}
            title="Đoạn văn bình thường"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-p-btn"
          >
            <Pilcrow className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            disabled={mode === 'code'}
            title="Danh sách không thứ tự (ul)"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-ul-btn"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            disabled={mode === 'code'}
            title="Danh sách có thứ tự (ol)"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-ol-btn"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            disabled={mode === 'code'}
            title="Khối trích dẫn (Blockquote)"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-quote-btn"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1" />

          {/* Link & Media */}
          <button
            type="button"
            onClick={() => setIsLinkPromptOpen(true)}
            disabled={mode === 'code'}
            title="Chèn liên kết"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
            data-testid="toolbar-link-btn"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMediaPickerOpen(true)}
            title="Chèn ảnh từ thư viện Media"
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer flex items-center gap-1.5 border border-blue-200"
            data-testid="toolbar-image-btn"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Chèn ảnh</span>
          </button>

          <button
            type="button"
            onClick={handleClearFormat}
            disabled={mode === 'code'}
            title="Xóa định dạng"
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer ml-auto"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Modal nhập link nhanh */}
        {isLinkPromptOpen && (
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 animate-in fade-in">
            <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="url"
              placeholder="Nhập đường dẫn URL (https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-900 outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmLink();
                } else if (e.key === 'Escape') {
                  setIsLinkPromptOpen(false);
                }
              }}
              data-testid="link-url-input"
            />
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={handleConfirmLink}
              className="text-xs h-7"
              data-testid="confirm-link-btn"
            >
              Chèn
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setIsLinkPromptOpen(false)}
              className="text-xs h-7"
            >
              Hủy
            </Button>
          </div>
        )}

        {/* Body Editor Area */}
        {mode === 'visual' ? (
          <div
            id={id}
            ref={editorRef}
            contentEditable
            onInput={handleContentUpdate}
            onBlur={handleContentUpdate}
            className="p-4 text-slate-800 text-sm focus:outline-none overflow-y-auto max-w-none space-y-2"
            style={{ minHeight }}
            data-placeholder={placeholder}
            data-testid="rich-editor-visual"
          />
        ) : (
          <textarea
            id={id}
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => {
              const { html } = injectTocIds(e.target.value);
              onChange(html);
            }}
            placeholder="Nhập mã nguồn HTML..."
            className="w-full p-4 bg-slate-50 text-slate-900 font-mono text-xs focus:outline-none resize-y border-none"
            style={{ minHeight }}
            data-testid="rich-editor-code"
          />
        )}
      </div>

      {/* Lỗi hiển thị */}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Tích hợp MediaPickerModal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        title="Chọn ảnh chèn vào bài viết"
      />
    </div>
  );
}

export default RichTextEditor;
