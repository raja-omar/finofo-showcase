import type { ReactNode } from "react"
import { ChevronDown, MousePointer2 } from "lucide-react"

import { transcript, type TranscriptMessage } from "@/content/transcript"

type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; lang: string; code: string }

function parseBlocks(source: string): Block[] {
  const lines = source.split("\n")
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] | null = null

  function flushParagraph() {
    if (paragraph.length === 0) {
      return
    }

    blocks.push({ kind: "p", text: paragraph.join(" ") })
    paragraph = []
  }

  function flushList() {
    if (!list) {
      return
    }

    blocks.push({ kind: "list", items: list })
    list = null
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.startsWith("```")) {
      flushParagraph()
      flushList()
      const lang = line.slice(3).trim()
      const code: string[] = []
      index += 1

      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index])
        index += 1
      }

      blocks.push({ kind: "code", lang, code: code.join("\n") })
      continue
    }

    if (line.startsWith("- ")) {
      flushParagraph()
      list ??= []
      list.push(line.slice(2))
      continue
    }

    if (line.trim() === "") {
      flushParagraph()
      flushList()
      continue
    }

    flushList()
    paragraph.push(line.trim())
  }

  flushParagraph()
  flushList()
  return blocks
}

function isLocalUrl(value: string) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)/.test(value)
}

function RichText({ text }: { text: string }) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0

    if (index > last) {
      nodes.push(text.slice(last, index))
    }

    const raw = match[0]
    key += 1

    if (raw.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-white/8 px-1 py-px font-mono text-[0.86em] break-all text-white"
        >
          {raw.slice(1, -1)}
        </code>
      )
    } else if (raw.startsWith("**")) {
      const inner = raw.slice(2, -2)

      if (isLocalUrl(inner) || !inner.startsWith("http")) {
        nodes.push(
          <strong key={key} className="font-medium text-white">
            {inner}
          </strong>
        )
      } else {
        nodes.push(
          <a
            key={key}
            href={inner}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
          >
            {inner}
          </a>
        )
      }
    } else if (isLocalUrl(raw)) {
      nodes.push(
        <span key={key} className="text-white">
          {raw}
        </span>
      )
    } else {
      nodes.push(
        <a
          key={key}
          href={raw}
          target="_blank"
          rel="noreferrer"
          className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
        >
          {raw}
        </a>
      )
    }

    last = index + raw.length
  }

  if (last < text.length) {
    nodes.push(text.slice(last))
  }

  return nodes
}

function Blocks({ body }: { body: string }) {
  return parseBlocks(body).map((block, index) => {
    if (block.kind === "code") {
      return (
        <pre
          key={index}
          className="overflow-x-auto rounded-lg bg-[#0c0c0c] px-3 py-3 font-mono text-[12.5px] leading-relaxed text-[#d5d8e0] ring-1 ring-white/10"
        >
          {block.lang ? (
            <span className="mb-2 block font-sans text-[11px] text-copy">
              {block.lang}
            </span>
          ) : null}
          <code>{block.code}</code>
        </pre>
      )
    }

    if (block.kind === "list") {
      return (
        <ul key={index} className="list-disc space-y-1.5 pl-5">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )
    }

    return (
      <p key={index}>
        <RichText text={block.text} />
      </p>
    )
  })
}

function UserMessage({ message }: { message: TranscriptMessage }) {
  return (
    <div className="rounded-2xl bg-[#2a2416] px-4 py-3.5 ring-1 ring-gold/45">
      <p className="mb-2 text-[12px] font-medium text-gold">
        Me{message.time ? ` · ${message.time}` : ""}
      </p>
      <div className="space-y-3 text-[15px] leading-relaxed text-white">
        <Blocks body={message.body} />
      </div>
    </div>
  )
}

function CursorMessage({ message }: { message: TranscriptMessage }) {
  const summary = message.summary ?? "Reply"

  return (
    <details className="group rounded-xl bg-black/25 ring-1 ring-white/8">
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-white/90 text-[#111]">
          <MousePointer2 className="size-3 fill-[#111]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-medium text-copy">Cursor</span>
          <span className="mt-0.5 block text-[13.5px] leading-snug text-copy-strong group-open:hidden">
            {summary}
          </span>
        </span>
        <ChevronDown
          className="mt-1 size-4 shrink-0 text-copy transition-transform duration-150 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="space-y-3 border-t border-white/10 px-3 py-3 sm:px-4">
        {message.notes.length > 0 ? (
          <ul className="space-y-1.5 border-l border-white/10 pl-3">
            {message.notes.map((note) => (
              <li key={note} className="text-[13px] leading-relaxed text-copy">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="space-y-3 text-[14.5px] leading-[1.65] text-[#c6c8d0]">
          <Blocks body={message.body} />
        </div>
      </div>
    </details>
  )
}

type Turn = {
  user: TranscriptMessage
  replies: TranscriptMessage[]
}

function turns(): Turn[] {
  const groups: Turn[] = []

  for (const message of transcript) {
    if (message.role === "user") {
      groups.push({ user: message, replies: [] })
      continue
    }

    const current = groups[groups.length - 1]
    if (!current) {
      continue
    }

    current.replies.push(message)
  }

  return groups
}

export function CursorChat() {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="font-heading text-sm font-medium text-white">Cursor</p>
        <div className="flex items-center gap-3">
          <a
            href="/cursor_navbar_dropdown_behavior_issue.md"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-copy underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Transcript
          </a>
          <p className="text-xs text-copy">24 Oct 2026</p>
        </div>
      </div>
      <div className="space-y-8 px-4 py-5 sm:px-5 sm:py-6">
        {turns().map((turn) => (
          <div key={turn.user.time ?? turn.user.body} className="space-y-2.5">
            <UserMessage message={turn.user} />
            {turn.replies.map((message) => (
              <CursorMessage key={message.summary ?? message.body} message={message} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
