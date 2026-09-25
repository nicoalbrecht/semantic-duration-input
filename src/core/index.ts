/**
 * `semantic-duration-input/core`: parsing, formatting and validation without Vue or Tailwind.
 * Works in the browser and in Node, e.g. to validate on the server.
 *
 * @module
 */
export { parseDuration, DEFAULT_LOCALES } from './parse'
export type { ParseErrorCode, ParseFailure, ParseOptions, ParseResult } from './parse'
export { formatDuration, DEFAULT_DISPLAY_UNITS } from './format'
export type { FormatOptions, FormatStyle } from './format'
export { formatErrorMessage } from './messages'
export type { ErrorMessageOptions, ErrorMessages } from './messages'
export { defineLocale } from './locale'
export type { DurationLocale, MessageKey } from './locale'
export { en } from './locales/en'
export { de } from './locales/de'
export { UNIT_SECONDS, UNITS_DESC } from './units'
export type { Precision, UnitKey } from './units'
export { fromIso, toIso } from './iso'
export { fromModelValue, resolveAmount, toModelValue } from './value'
export type { CustomValueFormat, DurationAmount, ValueFormat } from './value'
export { durationSchema } from './schema'
export type { DurationSchemaOptions, StandardSchemaResult, StandardSchemaV1 } from './schema'
