/** The 12-column grid from DESIGN.md, in stage pixels. */
export const MARGIN = 120
export const COL = 118
export const GUTTER = 24

/** Left edge of column n (1-based). */
export const colX = (n: number) => MARGIN + (n - 1) * (COL + GUTTER)
/** Width of a span of k columns. */
export const spanW = (k: number) => k * COL + (k - 1) * GUTTER
