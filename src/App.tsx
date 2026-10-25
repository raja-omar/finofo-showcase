import { CursorChat } from "@/components/cursor-chat"
import { MenuDemo } from "@/components/menu-demo"

export default function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="mx-auto max-w-[1000px] px-4 pt-12 pb-20 md:px-6 md:pt-16">
        <div className="max-w-[36rem]">
          <h1 className="font-heading text-3xl leading-tight font-bold text-white sm:text-4xl">
            A bug I found on finofo.com
          </h1>
          <div className="mt-4 space-y-3 text-[17px] leading-relaxed text-copy-strong">
            <p>
              This page is a little bit of frontend work, a bug I fixed, and a
              small pitch for junior SWE positions, as I missed the
              applications.
            </p>
            <p>
              I used Cursor to download the frontend source first and made the
              fix on that copy.
            </p>
            <p>
              The bug is on Features, the first dropdown in the top
              navbar. Move the cursor off that panel to the left and it
              closes. Move off to the right and it stays open. Solutions,
              Resources, and Company stay open either way.
            </p>
            <p>
              I matched those other menus. A clear bar behind each card is
              wider than the card, so the menu stays open a short distance
              past it. The Features card sits on the left edge of that bar, so
              there is nothing to hover on the left. I added that missing area
              and left the card where it was. I did not make the other menus
              close sooner.
            </p>
          </div>
        </div>

        <section
          id="bug"
          aria-labelledby="bug-title"
          className="mt-10"
        >
          <h2 id="bug-title" className="sr-only">
            The bug
          </h2>
          <MenuDemo />
          <div className="mt-10 max-w-[36rem]">
            <h2 className="font-heading text-2xl leading-tight font-bold text-white">
              Why the right side stayed open
            </h2>
            <div className="mt-3 space-y-3 text-base leading-7 text-copy-strong">
              <p>
                Every menu uses the same hover. The label opens it. Leaving
                the dropdown, including anything inside it, closes it at once.
                The open list is a clear bar stretched across the navbar pill,
                and the dark card is a narrower child of that bar.
              </p>
              <p>
                At a 1440px window the pill is 1000px wide. The list is
                positioned against that pill, because its backdrop blur makes
                it the containing block. The Features card is 898px and starts
                on the pill’s left edge: no spare bar on the left, about 100px
                on the right. The other cards are 550px and shifted 138px
                right, so the bar hangs about 138px off the left and about
                310px off the right.
              </p>
            </div>
          </div>
        </section>

        <section id="fix" className="mt-16 max-w-[36rem]">
          <h2 className="font-heading text-2xl leading-tight font-bold text-white">
            What changed
          </h2>
          <div className="mt-3 space-y-3 text-base leading-7 text-copy-strong">
            <p>
              From 992px up, Features gets an empty box 138px wide, placed
              just to the left of the card. It belongs to the dropdown, so the
              pointer can sit there without the menu closing. The width stops
              at the gutter beside the navbar, so the page does not grow
              sideways. The box also covers the existing 10px gap above the
              card. The clear bar on the right stays. Below 992px this rule
              does not apply.
            </p>
            <p>
              The rule is in the shared stylesheet. Its integrity hash was
              updated on the local pages so the browser loads the edited file.
              At 1440px, 100px left of the card still counts as Features and
              150px does not. A link in the card still receives the pointer.
              Moving to another label leaves only that menu open. At 768px
              there is no extra target.
            </p>
          </div>
        </section>

        <section id="chat" className="mt-16">
          <div className="max-w-[36rem]">
            <h2 className="font-heading text-2xl leading-tight font-bold text-white">
              The Cursor session
            </h2>
            <p className="mt-3 text-base leading-7 text-copy-strong">
              Below is the transcript of the Cursor session used to fix the
              bug. The export is the{" "}
              <a
                href="/cursor_navbar_dropdown_behavior_issue.md"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
              >
                Cursor transcript
              </a>
              .
            </p>
          </div>
          <div className="mt-6 max-w-[42rem]">
            <CursorChat />
          </div>
        </section>

        <footer className="mt-16 max-w-[36rem] border-t border-white/10 pt-8">
          <p className="text-sm leading-relaxed text-copy">
            24 Oct 2026. A local fix on a copy of the public site.
          </p>
        </footer>
      </main>
    </div>
  )
}
