/**
 * StoryInput.tsx
 *
 * Large story/synopsis textarea with character count and file upload dropzone.
 *
 * Usage:
 *   <StoryInput
 *     value={story}
 *     onChange={setStory}
 *     maxLength={5000}
 *   />
 */

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface StoryInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function StoryInput({
  value,
  onChange,
  placeholder = '请输入您的故事大纲或剧本内容...',
  maxLength = 5000,
}: StoryInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFileRead(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const separator = value.trim() ? '\n\n' : '';
        onChange(value + separator + text);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.pdf'))) {
      handleFileRead(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  const isOverLimit = value.length > maxLength;

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={10}
          aria-label="故事大纲"
          className={`w-full bg-white border rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none leading-relaxed ${
            isOverLimit
              ? 'border-status-failed focus:border-status-failed'
              : 'border-bdr focus:border-accent'
          }`}
          style={{ minHeight: '200px' }}
        />
        {/* Character count */}
        <span
          className={`absolute bottom-3 right-3 text-xs select-none ${
            isOverLimit ? 'text-status-failed' : 'text-txt-muted'
          }`}
        >
          {value.length}/{maxLength}
        </span>
      </div>

      {/* File upload dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="上传剧本文件"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          dragging
            ? 'border-accent bg-accent-light/60'
            : 'border-bdr hover:border-accent/50 hover:bg-accent-light/40'
        }`}
      >
        <UploadCloud
          className={`w-6 h-6 ${dragging ? 'text-accent' : 'text-txt-muted'}`}
          aria-hidden="true"
        />
        <p className="text-sm text-txt-secondary text-center">
          或拖拽上传剧本文件{' '}
          <span className="text-txt-muted">(.txt, .pdf)</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
