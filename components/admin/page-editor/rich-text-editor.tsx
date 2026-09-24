"use client";

/**
 * RichTextEditor — the WYSIWYG input for every CMS HTML field
 * (ADR-004 Decision 6 upgrade: admins format visually, never write HTML).
 * The raw-HTML disclosure was removed (user decision 2026-09-24) — the
 * toolbar is the only editing surface.
 *
 * Storage is unchanged — the editor produces the same HTML the API validates
 * and the public renderer styles:
 *   p, h3/h4, ul/ol/li, strong, em, a (https/relative), img (uploaded), br.
 * Anything outside that set is stripped by TipTap on paste/input.
 *
 * Uncontrolled by design: the editor owns the caret. External value changes
 * are applied only when they differ from the editor's own HTML (language
 * switches, record swaps), so typing never causes cursor jumps.
 */

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Link2,
  ImagePlus,
  RemoveFormatting,
} from "lucide-react";
import { uploadImageFile } from "@/components/admin/page-editor/image-list-field";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-classz-700 transition-colors ${
        active ? "bg-classz-700 text-white" : "hover:bg-classz-100"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

type RichTextEditorProps = {
  /** HTML value (controlled from outside, e.g. per-language variant). */
  value: string;
  onChange: (html: string) => void;
  /** Height hint for the editing surface. */
  minHeight?: number;
};

export function RichTextEditor({
  value,
  onChange,
  minHeight = 180,
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
        // Code blocks/blocks we don't style publicly stay out of the toolbar;
        // they remain valid if pasted from existing content.
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  // Apply external value changes (language switch, record swap) only when
  // they actually differ from what the editor shows.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") === current) return;
    editor.commands.setContent(value || "", false);
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className="min-h-[180px] rounded-lg border border-classz-100 bg-white"
        style={{ minHeight }}
      />
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt(
      "Link URL (https://… or /path)",
      previous ?? "https://",
    );
    if (input === null) return;
    const url = input.trim();
    if (!url || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|\/|mailto:)/i.test(url)) {
      window.alert(
        "Links must start with https://, http://, mailto: or be a site path starting with /",
      );
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const onFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-classz-100 bg-white focus-within:ring-2 focus-within:ring-classz-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChosen}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-classz-100 px-1.5 py-1">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Sub-heading"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
        >
          <Heading4 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Insert image"
          disabled={uploading}
          onClick={insertImage}
        >
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
        <span className="ml-auto pr-1 text-[11px] text-classz-600">
          {uploading ? "Uploading image…" : `${editor.getText().length} chars`}
        </span>
      </div>

      {/* Editing surface */}
      <EditorContent
        editor={editor}
        className="[&_.tiptap]:px-3 [&_.tiptap]:py-3 [&_.tiptap]:text-[15px] [&_.tiptap]:leading-relaxed [&_.tiptap]:text-classz-700 [&_.tiptap]:focus:outline-none [&_.tiptap_ul]:list-disc [&_.tiptap_ol]:list-decimal [&_.tiptap_li]:ml-5 [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h4]:text-base [&_.tiptap_a]:text-[#00A3A0] [&_.tiptap_a]:underline [&_.tiptap_img]:max-w-full [&_.tiptap_img]:rounded-xl"
        style={{ minHeight }}
      />
    </div>
  );
}
