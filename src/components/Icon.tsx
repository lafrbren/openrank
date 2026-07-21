/**
 * Line icons for the tool chrome.
 *
 * One 16-unit grid, one 1.5 stroke weight, currentColor throughout — so an icon
 * inherits whatever the button it sits in already resolved (muted, commit red,
 * white on the stage overlay). Geometry sits on half-unit coordinates to stay
 * crisp when the grid renders at 14px.
 *
 * Solid shapes (play, pause) use `fill` and no stroke; everything else is drawn.
 */

export type IconName =
  | 'arrow-up'
  | 'arrow-down'
  | 'trash'
  | 'volume'
  | 'volume-off'
  | 'play'
  | 'pause'
  | 'restart'
  | 'shuffle'
  | 'download'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'clear-format'
  | 'erase'
  | 'stroke'
  | 'minus'
  | 'plus'

const paths: Record<IconName, JSX.Element> = {
  'arrow-up': <path d="M8 12.5v-9M4 7.5 8 3.5l4 4" />,
  'arrow-down': <path d="M8 3.5v9M4 8.5l4 4 4-4" />,
  trash: (
    <>
      <path d="M2.5 4.5h11M6.5 4.5V2.5h3v2" />
      <path d="M4 4.5 4.75 13a.5.5 0 0 0 .5.5h5.5a.5.5 0 0 0 .5-.5L12 4.5" />
      <path d="M6.5 7v4M9.5 7v4" />
    </>
  ),
  volume: (
    <>
      <path d="M8.5 2.5 4.5 6H2v4h2.5l4 3.5z" />
      <path d="M11 5.5a4 4 0 0 1 0 5M13 3.5a7 7 0 0 1 0 9" />
    </>
  ),
  'volume-off': (
    <>
      <path d="M8.5 2.5 4.5 6H2v4h2.5l4 3.5z" />
      <path d="m11 6.5 3.5 3.5M14.5 6.5 11 10" />
    </>
  ),
  play: <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" stroke="none" />,
  pause: (
    <path
      d="M4 2.5h2.5v11H4zM9.5 2.5H12v11H9.5z"
      fill="currentColor"
      stroke="none"
    />
  ),
  restart: (
    <>
      <path d="M3 2.5v11" />
      <path d="M13.5 2.5v11L5 8z" fill="currentColor" stroke="none" />
    </>
  ),
  shuffle: (
    <>
      <path d="M2 3.6h2.5c1.2 0 1.9.7 2.6 1.8l2.4 3.7c.7 1.1 1.4 1.8 2.6 1.8H14" />
      <path d="M2 12.4h2.5c1.2 0 1.9-.7 2.6-1.8l.6-.9M9.6 5.6l.5-.8c.7-1.1 1.4-1.8 2.6-1.8H14" />
      <path d="m12.2 1.8 1.8 1.8-1.8 1.8M12.2 8.8l1.8 1.8-1.8 1.8" />
    </>
  ),
  download: (
    <>
      <path d="M8 1.5v8.5M4.5 6.5 8 10l3.5-3.5" />
      <path d="M2.5 12.5v1.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-1.5" />
    </>
  ),
  'align-left': <path d="M2 3.5h12M2 6.75h7.5M2 10h12M2 13.25h7.5" />,
  'align-center': <path d="M2 3.5h12M4.25 6.75h7.5M2 10h12M4.25 13.25h7.5" />,
  'align-right': <path d="M2 3.5h12M6.5 6.75H14M2 10h12M6.5 13.25H14" />,
  'clear-format': <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />,
  erase: (
    <>
      <path d="M14 3.5H6.7a1 1 0 0 0-.75.34l-3.1 3.5a1 1 0 0 0 0 1.32l3.1 3.5a1 1 0 0 0 .75.34H14a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5z" />
      <path d="m8.5 6.25 3.5 3.5M12 6.25l-3.5 3.5" />
    </>
  ),
  minus: <path d="M3.5 8h9" />,
  plus: <path d="M3.5 8h9M8 3.5v9" />,
  /* An outline around a solid core — the shape of a stroked glyph. */
  stroke: (
    <>
      <circle cx="8" cy="8" r="5.25" />
      <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
    </>
  ),
}

export default function Icon({
  name,
  size = 14,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
