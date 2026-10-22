import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { plainText, type RichText as RichTextValue } from './types';
import { leafBase, renderLeaf, type LeafRenderer } from './parts';
import { RichTextView } from './RichText';

export interface CodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The code (plain text; marks are ignored). */
  text?: RichTextValue;
  /** Language label shown on hover (e.g. "JavaScript"). */
  language?: string;
  caption?: RichTextValue;
  renderLeaf?: LeafRenderer;
  onLanguageClick?: () => void;
}

/**
 * Code block. Measured (code-block): block padding 8; card radius 10, bg gray-bg-primary-translucent-a,
 * padding 24 22 plus 12 0 inside; mono 85% (13.6px) / 1.5 (20.4px), tab-size 2, text-primary.
 * Hover shows the language button (top-left) and Copy (top-right), 12px text-secondary.
 */
export const Code = forwardRef<HTMLDivElement, CodeProps>(function Code(
  { text, language = 'JavaScript', caption, renderLeaf: rl, onLanguageClick, className, ...props }, ref,
) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(plainText(text)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div ref={ref} className={cn('w-full p-2', className)} {...props}>
      <div className="flex">
        <div role="figure" className="group/code relative w-full min-w-0 grow rounded-n-xl text-start">
          <div className="rounded-n-xl bg-n-gray-bg-primary-translucent-a">
            <div className="absolute start-2 top-1.5 z-[1] flex opacity-0 transition-opacity duration-150 group-hover/code:opacity-100" contentEditable={false}>
              <button type="button" onClick={onLanguageClick} className="flex h-5 cursor-pointer items-center gap-0.5 rounded-n-sm px-1.5 text-[12px] leading-[1.2] text-n-text-secondary hover:bg-n-button-hover-bg-a">
                {language}
                <Icon name="arrowChevronSingleDownSmall" size={12} />
              </button>
            </div>
            <div className="absolute end-2 top-1.5 z-[1] flex opacity-0 transition-opacity duration-150 group-hover/code:opacity-100" contentEditable={false}>
              <button type="button" onClick={copy} className="flex h-5 cursor-pointer items-center gap-1 rounded-n-sm px-1.5 text-[12px] leading-[1.2] text-n-text-secondary hover:bg-n-button-hover-bg-a">
                <Icon name={copied ? 'checkmarkSmall' : 'duplicate'} size={14} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="px-[22px] py-6">
              <div className="flex py-3">
                {renderLeaf(
                  { text: text?.map((s) => ({ text: s.text })), renderLeaf: rl },
                  {
                    className: cn(leafBase, 'min-h-[1em] min-w-0 shrink grow break-all font-mono text-[85%] leading-[1.5] text-n-text-primary [tab-size:2]'),
                    placeholder: ' ',
                  },
                )}
              </div>
            </div>
          </div>
          {caption && caption.length > 0 && (
            <div className="px-0.5 pb-1.5 pt-1.5 text-[14px] leading-[1.4] text-n-text-secondary"><RichTextView value={caption} /></div>
          )}
        </div>
      </div>
    </div>
  );
});
