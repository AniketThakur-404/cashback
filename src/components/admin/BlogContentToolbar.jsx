import React, { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table,
} from "lucide-react";

const toolbarButtonClass =
  "h-8 w-8 inline-flex items-center justify-center border-r border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white";

const applyFormat = (value, action) => {
  const content = String(value || "");
  const needsNewLine = content && !content.endsWith("\n") ? "\n" : "";
  const append = (snippet) => `${content}${needsNewLine}${snippet}`;

  switch (action) {
    case "h1":
      return append("# Heading 1");
    case "h2":
      return append("## Heading 2");
    case "bold":
      return append("**Bold text**");
    case "italic":
      return append("_Italic text_");
    case "strike":
      return append("~~Strikethrough text~~");
    case "bullet":
      return append("- List item");
    case "number":
      return append("1. List item");
    case "quote":
      return append("> Quote text");
    case "line":
      return append("---");
    case "left":
      return append('<p style="text-align:left">Left aligned text</p>');
    case "center":
      return append('<p style="text-align:center">Centered text</p>');
    case "right":
      return append('<p style="text-align:right">Right aligned text</p>');
    case "table":
      return append("| Heading | Heading |\n| --- | --- |\n| Cell | Cell |");
    default:
      return content;
  }
};

const BlogContentToolbar = ({ value, onChange, textareaRef }) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkTextState, setLinkTextState] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://");
  const [imageAltState, setImageAltState] = useState("");
  const [pendingSelection, setPendingSelection] = useState({ start: 0, end: 0 });

  const handleCancelLink = () => {
    setIsLinkModalOpen(false);
    const textarea = textareaRef?.current;
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(pendingSelection.start, pendingSelection.end);
      }, 0);
    }
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    setIsLinkModalOpen(false);

    const textarea = textareaRef?.current;
    const content = String(value || "");
    const finalUrl = linkUrl.trim() || "https://example.com";
    const finalText = linkTextState.trim() || "Link text";
    const replacement = `[${finalText}](${finalUrl})`;

    let newValue = "";
    let start = content.length;
    let end = content.length;

    if (textarea) {
      start = pendingSelection.start;
      end = pendingSelection.end;
      newValue = content.substring(0, start) + replacement + content.substring(end);
    } else {
      const needsNewLine = content && !content.endsWith("\n") ? "\n" : "";
      newValue = `${content}${needsNewLine}${replacement}`;
      start = newValue.length - replacement.length;
    }

    if (typeof onChange === "function") {
      onChange(newValue);
    }

    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1 + finalText.length);
      }, 0);
    }
  };

  const handleCancelImage = () => {
    setIsImageModalOpen(false);
    const textarea = textareaRef?.current;
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(pendingSelection.start, pendingSelection.end);
      }, 0);
    }
  };

  const handleInsertImage = (e) => {
    e.preventDefault();
    setIsImageModalOpen(false);

    const textarea = textareaRef?.current;
    const content = String(value || "");
    const finalUrl = imageUrl.trim() || "https://example.com/image.jpg";
    const finalAlt = imageAltState.trim() || "Image description";
    const replacement = `![${finalAlt}](${finalUrl})`;

    let newValue = "";
    let start = content.length;
    let end = content.length;

    if (textarea) {
      start = pendingSelection.start;
      end = pendingSelection.end;
      newValue = content.substring(0, start) + replacement + content.substring(end);
    } else {
      const needsNewLine = content && !content.endsWith("\n") ? "\n" : "";
      newValue = `${content}${needsNewLine}${replacement}`;
      start = newValue.length - replacement.length;
    }

    if (typeof onChange === "function") {
      onChange(newValue);
    }

    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
      }, 0);
    }
  };

  const handleClick = (action) => {
    const content = String(value || "");
    const textarea = textareaRef?.current;

    if (action === "link") {
      const start = textarea ? textarea.selectionStart : content.length;
      const end = textarea ? textarea.selectionEnd : content.length;
      const selectedText = textarea ? content.substring(start, end) : "";

      setLinkTextState(selectedText || "");
      setLinkUrl("https://");
      setPendingSelection({ start, end });
      setIsLinkModalOpen(true);
      return;
    }

    if (action === "image") {
      const start = textarea ? textarea.selectionStart : content.length;
      const end = textarea ? textarea.selectionEnd : content.length;
      const selectedText = textarea ? content.substring(start, end) : "";

      setImageAltState(selectedText || "");
      setImageUrl("https://");
      setPendingSelection({ start, end });
      setIsImageModalOpen(true);
      return;
    }

    if (!textarea) {
      if (typeof onChange === "function") {
        onChange(applyFormat(value, action));
      }
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = "";

    switch (action) {
      case "h1":
        replacement = selectedText ? `# ${selectedText}` : "# Heading 1";
        break;
      case "h2":
        replacement = selectedText ? `## ${selectedText}` : "## Heading 2";
        break;
      case "bold":
        replacement = selectedText ? `**${selectedText}**` : "**Bold text**";
        break;
      case "italic":
        replacement = selectedText ? `_${selectedText}_` : "_Italic text_";
        break;
      case "strike":
        replacement = selectedText ? `~~${selectedText}~~` : "~~Strikethrough text~~";
        break;
      case "bullet":
        replacement = selectedText ? `- ${selectedText}` : "- List item";
        break;
      case "number":
        replacement = selectedText ? `1. ${selectedText}` : "1. List item";
        break;
      case "quote":
        replacement = selectedText ? `> ${selectedText}` : "> Quote text";
        break;
      case "line":
        replacement = "\n---\n";
        break;
      case "left":
        replacement = selectedText
          ? `<p style="text-align:left">${selectedText}</p>`
          : '<p style="text-align:left">Left aligned text</p>';
        break;
      case "center":
        replacement = selectedText
          ? `<p style="text-align:center">${selectedText}</p>`
          : '<p style="text-align:center">Centered text</p>';
        break;
      case "right":
        replacement = selectedText
          ? `<p style="text-align:right">${selectedText}</p>`
          : '<p style="text-align:right">Right aligned text</p>';
        break;
      case "table":
        replacement = "\n| Heading | Heading |\n| --- | --- |\n| Cell | Cell |\n";
        break;
      default:
        return;
    }

    const newValue = content.substring(0, start) + replacement + content.substring(end);
    
    if (typeof onChange === "function") {
      onChange(newValue);
    }

    // Set cursor or selection range after React finishes update
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // Highlight the formatted content (excluding the markdown symbols)
        if (action === "h1") {
          textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
        } else if (action === "h2") {
          textarea.setSelectionRange(start + 3, start + 3 + selectedText.length);
        } else if (action === "bold" || action === "strike") {
          textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
        } else if (action === "italic") {
          textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
        } else if (action === "bullet" || action === "quote") {
          textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
        } else if (action === "number") {
          textarea.setSelectionRange(start + 3, start + 3 + selectedText.length);
        } else if (action === "left") {
          textarea.setSelectionRange(start + 27, start + 27 + selectedText.length);
        } else if (action === "center") {
          textarea.setSelectionRange(start + 29, start + 29 + selectedText.length);
        } else if (action === "right") {
          textarea.setSelectionRange(start + 28, start + 28 + selectedText.length);
        } else {
          textarea.setSelectionRange(start, start + replacement.length);
        }
      } else {
        // If there was no selection, select the default placeholder text so they can type immediately
        if (action === "h1") {
          textarea.setSelectionRange(start + 2, start + 11); // "Heading 1"
        } else if (action === "h2") {
          textarea.setSelectionRange(start + 3, start + 12); // "Heading 2"
        } else if (action === "bold") {
          textarea.setSelectionRange(start + 2, start + 11); // "Bold text"
        } else if (action === "italic") {
          textarea.setSelectionRange(start + 1, start + 12); // "Italic text"
        } else if (action === "strike") {
          textarea.setSelectionRange(start + 2, start + 20); // "Strikethrough text"
        } else if (action === "bullet") {
          textarea.setSelectionRange(start + 2, start + 11); // "List item"
        } else if (action === "number") {
          textarea.setSelectionRange(start + 3, start + 12); // "List item"
        } else if (action === "quote") {
          textarea.setSelectionRange(start + 2, start + 12); // "Quote text"
        } else if (action === "left") {
          textarea.setSelectionRange(start + 27, start + 44); // "Left aligned text"
        } else if (action === "center") {
          textarea.setSelectionRange(start + 29, start + 42); // "Centered text"
        } else if (action === "right") {
          textarea.setSelectionRange(start + 28, start + 46); // "Right aligned text"
        } else {
          textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        }
      }
    }, 0);
  };

  const tools = [
    { action: "h1", label: "Heading 1", icon: Heading1 },
    { action: "h2", label: "Heading 2", icon: Heading2 },
    { action: "bold", label: "Bold", icon: Bold },
    { action: "italic", label: "Italic", icon: Italic },
    { action: "strike", label: "Strikethrough", icon: Strikethrough },
    { action: "bullet", label: "Bulleted list", icon: List },
    { action: "number", label: "Numbered list", icon: ListOrdered },
    { action: "quote", label: "Quote", icon: Quote },
    { action: "line", label: "Divider", icon: Minus },
    { action: "left", label: "Align left", icon: AlignLeft },
    { action: "center", label: "Align center", icon: AlignCenter },
    { action: "right", label: "Align right", icon: AlignRight },
    { action: "link", label: "Link", icon: Link },
    { action: "image", label: "Image (with Alt Text)", icon: Image },
    { action: "table", label: "Table", icon: Table },
  ];

  return (
    <>
      <div className="flex flex-wrap overflow-hidden rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-black/20">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.action}
              type="button"
              onClick={() => handleClick(tool.action)}
              className={toolbarButtonClass}
              title={tool.label}
              aria-label={tool.label}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#131317] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleInsertLink} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Link size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insert Link</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add a hyperlink to your blog content</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkTextState}
                  onChange={(e) => setLinkTextState(e.target.value)}
                  placeholder="e.g. Visit our website"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                  autoFocus={!linkTextState}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Link URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                  autoFocus={!!linkTextState}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelLink}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-xs font-semibold text-white shadow-md shadow-[#059669]/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#131317] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleInsertImage} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Image size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insert Image</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add an image with SEO & Accessibility Alt text</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Image ALT Text
                  </label>
                  <span className="text-[9px] text-slate-400">SEO / Accessibility</span>
                </div>
                <input
                  type="text"
                  value={imageAltState}
                  onChange={(e) => setImageAltState(e.target.value)}
                  placeholder="e.g. Loyalty program discount rewards banner"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelImage}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-xs font-semibold text-white shadow-md shadow-[#059669]/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogContentToolbar;
