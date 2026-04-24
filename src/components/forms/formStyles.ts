/**
 * formStyles.ts
 *
 * Shared Tailwind class strings for all node forms.
 * Single source of truth — change here to restyle all forms.
 */

/** Full-width dark text input */
export const inputCls =
  'w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm ' +
  'placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'focus:border-indigo-500 transition-colors duration-150';

/** Textarea variant — same as input but height is controlled by rows */
export const textareaCls = inputCls + ' resize-none leading-relaxed';

/** Select / dropdown */
export const selectCls =
  'w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ' +
  'transition-colors duration-150 cursor-pointer';

/** Field label — sits above the input */
export const labelCls =
  'block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

/** Vertical stack with consistent field spacing */
export const sectionCls = 'flex flex-col gap-4';
