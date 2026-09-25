import { describe, expect, it } from 'vitest'
import { de } from '../src/core'
import { formatErrorMessage } from '../src/core/messages'
import { parseDuration, type ParseFailure } from '../src/core/parse'

describe('formatErrorMessage', () => {
  it('returns localized texts', () => {
    expect(formatErrorMessage('empty')).toBe('Please enter a duration.')
    expect(formatErrorMessage('empty', { locale: de })).toBe('Bitte gib eine Dauer ein.')
  })

  it('fills in formatted bounds (in seconds) for out_of_range', () => {
    expect(formatErrorMessage('out_of_range', { min: 1800, max: 28800 })).toBe('Must be between 30min and 8h.')
    expect(formatErrorMessage('out_of_range', { min: 1800 })).toBe('Must be at least 30min.')
    expect(formatErrorMessage('out_of_range', { max: 5400, locale: de })).toBe('Darf höchstens 1h 30min sein.')
  })

  it('fills in the token and suggestion', () => {
    expect(formatErrorMessage(parseDuration('2 huors') as ParseFailure)).toBe('Unknown unit "huors". Did you mean "hours"?')
    expect(formatErrorMessage(parseDuration('2 parsecs') as ParseFailure)).toBe(
      'Unknown unit "parsecs". Use minutes, hours, days or weeks.',
    )
  })

  it('uses overrides, including placeholders, and applies base-key overrides to variants', () => {
    expect(formatErrorMessage('out_of_range', { max: 3600, overrides: { out_of_range: 'Max {max}!' } })).toBe('Max 1h!')
    expect(formatErrorMessage('empty', { overrides: { missing_unit: 'x' } })).toBe('Please enter a duration.')
    const typo = parseDuration('2 huors') as ParseFailure
    expect(formatErrorMessage(typo, { overrides: { unknown_unit: '?{token}' } })).toBe('?huors')
  })
})
