# Navbar dropdown behavior issue
_Exported on 10/24/2026 at 22:58:20 MDT from Cursor (3.26.13)_

---

**User**

<timestamp>Saturday, Oct 24, 2026, 10:10 PM (UTC-6)</timestamp>

Features is the first dropdown in the top navbar. It closes when I move off it to the left, and stays open when I move right. Solutions, Resources, and Company stay open either way.

I think the hover box is the difference. Compare the handlers and the DOM on those four menus and tell me if that's right. Don't edit anything. If the code isn't enough, say what to measure in the browser.

---

**Cursor**

I'll inspect the navbar dropdown implementation and compare how each menu handles hover and layout, so we can check whether the Features menu really closes only when the pointer leaves to the left.

The site is a downloaded Webflow export, so the navbar lives in the HTML and shared CSS. I'll pull the Features menu markup and the hover rules that differ from the other dropdowns.

The Features menu uses a different grid and wrapper than Solutions. Next I’ll compare those layout rules and the Webflow hover hit area, which is what would make one side close and the other stay open.

The left/right difference is real, and it comes from layout, not from a different hover handler. Features is the only menu whose visible panel sits flush with the left edge of a wider, invisible hit area.

## Event handling is the same

Features, Solutions, Resources, and Company are the same Webflow dropdown. Each root is:

`data-hover="true"` `data-delay="0"` `class="mega-menu-dropdown w-dropdown"`

The dropdown module in `site/assets/js/webflow.achunk.82cb8999f66b8d07.js` does this for every one of them:

- `mouseenter` on `.w-dropdown-toggle` opens the menu.
- `mouseleave` on the whole `.w-dropdown` closes it.
- With `data-delay="0"`, that close is immediate.

`mouseleave` fires only after the pointer leaves the dropdown and every descendant. There is no Features-only listener, and no script in the page that treats one menu differently.

## The hit area is wider than the visible panel

`.mega-menu-dropdown` is `position: static`, which overrides Webflow’s `.w-dropdown { position: relative }`. The open list is absolutely positioned, so it is positioned against an ancestor, not against the “Features” label.

```css
.dropdown-list.w--open {
  background-color: var(--transparent);
  padding-left: 0;
  padding-right: 0;
  left: 0;
  right: 0;
}
```

`left: 0; right: 0` stretches that list across its containing block. That block is the centered navbar column: `.container` is `position: relative` with `margin-left/right: auto`, and `.container.navbar-container` caps it at `max-width: 1000px`. `.nav-menu-container` also has `backdrop-filter: blur(10px)`, which makes that pill the containing block in browsers that honor it. Either way, the open list is about the width of the navbar, transparent, and still a child of the dropdown, so it keeps the menu open.

The visible card is a child of that list, and it is narrower than the list.

## Features is the only card with no left inset

| Menu | Wrapper classes | Desktop box |
|---|---|---|
| Features | `mega-menu-wrapper resources` | `width: 898px`, no offset |
| Solutions, Resources, Company | `mega-menu-wrapper resources small` | `width: 550px; position: relative; left: 138px` |

Features is a normal block at the left edge of the stretched list. On a desktop navbar about 1000px wide, that leaves on the order of 100px of transparent list to the right of the card, and none to the left. Moving left leaves every descendant immediately, so `mouseleave` closes it. Moving right is still over `.dropdown-list`, so it stays open.

The other menus use the same full-width list, but `.small` shifts the visible card 138px to the right. The transparent list remains on both sides of that card, so a short move either way still counts as inside the dropdown.

The shell around each menu is the same: toggle, then `nav.dropdown-list`, then the wrapper. The only structural difference is that Features uses the three-column `.mega-menu-grid` and does not have the `small` class.

Below 991px this geometry goes away. The open list becomes `position: static`, and `.mega-menu-wrapper.resources` becomes `width: auto`. This is a desktop hover issue.

## What still needs a browser check

Code inspection fixes the mechanism, not the exact pixel bounds. In DevTools, with the menu open, compare `getBoundingClientRect()` for `.dropdown-list.w--open` and `.mega-menu-wrapper`:

- Features: the list’s left edge should match the card’s left edge, and the list should extend past the card on the right only.
- Solutions: the card should start about 138px to the right of the list’s left edge, with list area on both sides.
- `document.elementsFromPoint()` just to the left of the Features card should hit something outside `.mega-menu-dropdown`. Just to the right, it should hit the dropdown list.
- The list’s right edge should line up with the navbar container, not the viewport. The “stays open” region on the right should end at that edge, roughly 100px past the card. If you can travel across the rest of the page and it stays open, the list is positioned against `.navbar` (`position: fixed; width: 100%`) instead, and that measurement would supersede the 1000px estimate.

---

**User**

<timestamp>Saturday, Oct 24, 2026, 10:22 PM (UTC-6)</timestamp>

Match Features to the other menus. Smallest change. Leave the card where it is, leave the close behavior alone, and don't touch mobile or the Webflow script. One scoped CSS rule is fine if this is just the hit area.

Check left, right, and switching menus in the browser. Say what you changed and what I should still try by hand.

---

**Cursor**

The Features menu is the only one whose visible panel sits on the left edge of a wider hover area. I’ll measure that gap in the browser, then add a scoped desktop CSS bridge so moving left behaves like the other menus without shifting the layout.

The Features card is flush with the left edge of a full-width invisible hover strip, while the other menus are inset 138px. I’ll add that same left target on desktop only, without moving the card.

The Features menu now stays open for the same leftward movement as the other navbar menus, and it still closes once the pointer leaves that area.

The visible Features card was already sitting on the left edge of the navbar’s invisible hover strip, so any move left left the dropdown immediately. Solutions, Resources, and Company inset their cards by 138px, which leaves that strip under the pointer on the left. On desktop, Features now has an invisible hover target of that same 138px to the left of the card. The card itself stays at 898px and does not move. The target is capped to the space beside the navbar so it does not widen the page. Below 992px the rule does not apply, and the mobile menu is unchanged. Webflow’s hover script is unchanged: `data-delay="0"` still closes the menu as soon as the pointer leaves the dropdown, and opening another menu still closes the previous one.

The shared stylesheet is `site/assets/css/finofo-2025-site.webflow.shared.ab2185d81.min.css`. Its integrity hash was updated on the local pages so the browser will load the edited file.

Checked at a 1440px-wide viewport on http://127.0.0.1:8090/ (port 8080 was already in use):

- The Features card is still 898px wide and in the same place.
- 12px and 100px to the left of the card still count as Features. 150px to the left does not, so the menu closes.
- Just to the right of the card still counts as Features. Past the navbar strip, it closes.
- A link inside the card still receives the pointer.
- Moving from Features to Solutions, Resources, and Company leaves only the new menu open.
- At 768px there is no extra target, and the open list is back in normal flow.

Worth a quick look by hand: widths from 992px to about 1276px, where the left buffer shrinks to the page gutter, and a hard refresh if a tab still has the old stylesheet.

