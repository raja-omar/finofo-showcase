import { useEffect, useRef, useState } from "react"

const clips = [
  {
    title: "Before",
    note: "Closes",
    noteClass: "text-coral",
    source: "finofo.com",
    src: "/demo/before.mp4",
    label:
      "Live finofo.com. The pointer opens Features, moves left past the card, and the menu closes.",
  },
  {
    title: "After",
    note: "Stays open",
    noteClass: "text-mint",
    source: "From the locally running site",
    src: "/demo/after.mp4",
    label:
      "From the locally running site. The same pointer path leaves the Features menu open.",
  },
] as const

const source = { width: 1440, height: 900 }
const focus = { x: 40, y: 0, width: 1000, height: 640 }

const focusStyle = {
  width: `${(source.width / focus.width) * 100}%`,
  height: `${(source.height / focus.height) * 100}%`,
  left: `${(-focus.x / focus.width) * 100}%`,
  top: `${(-focus.y / focus.height) * 100}%`,
}

export function MenuDemo() {
  const beforeRef = useRef<HTMLVideoElement>(null)
  const afterRef = useRef<HTMLVideoElement>(null)
  const [manual, setManual] = useState(false)

  useEffect(() => {
    const before = beforeRef.current
    const after = afterRef.current
    if (!before || !after) {
      return
    }

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (motion.matches) {
      setManual(true)
      before.pause()
      after.pause()
      return
    }

    before.muted = true
    after.muted = true

    const playTogether = () => {
      before.currentTime = 0
      after.currentTime = 0
      void before.play().catch(() => setManual(true))
      void after.play().catch(() => setManual(true))
    }

    let started = false
    const onReady = () => {
      if (started || before.readyState < 2 || after.readyState < 2) {
        return
      }
      started = true
      playTogether()
    }

    before.addEventListener("canplay", onReady)
    after.addEventListener("canplay", onReady)
    before.addEventListener("ended", playTogether)
    onReady()

    const timer = window.setInterval(() => {
      if (before.paused || after.paused) {
        return
      }
      if (Math.abs(before.currentTime - after.currentTime) > 0.15) {
        after.currentTime = before.currentTime
      }
    }, 500)

    return () => {
      window.clearInterval(timer)
      before.removeEventListener("canplay", onReady)
      after.removeEventListener("canplay", onReady)
      before.removeEventListener("ended", playTogether)
    }
  }, [])

  const refs = [beforeRef, afterRef]

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        {clips.map((clip, index) => (
          <figure
            key={clip.src}
            className="rounded-2xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-4"
          >
            <div className="flex items-start justify-between gap-3 px-1">
              <div>
                <h3 className="font-heading text-[15px] font-medium text-white">
                  {clip.title}
                </h3>
                <p className="mt-0.5 text-[13px] leading-5 text-copy">
                  {clip.source}
                </p>
              </div>
              <p className={`text-right text-xs font-medium ${clip.noteClass}`}>
                {clip.note}
              </p>
            </div>
            <div
              className="relative mt-3 overflow-hidden rounded-xl bg-black"
              style={{ aspectRatio: `${focus.width} / ${focus.height}` }}
            >
              <video
                ref={refs[index]}
                className={
                  manual
                    ? "absolute inset-0 h-full w-full object-contain"
                    : "absolute max-w-none object-fill"
                }
                style={manual ? undefined : focusStyle}
                src={clip.src}
                muted
                playsInline
                preload="auto"
                controls={manual}
                aria-label={clip.label}
              />
            </div>
          </figure>
        ))}
      </div>
    </div>
  )
}
