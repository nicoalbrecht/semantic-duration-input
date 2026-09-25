import { describe, expect, it } from 'vitest'
import { formatErrorMessage } from '../src/core/messages'

describe('formatErrorMessage', () => {
  it('returns localized texts', () => {
    expect(formatErrorMessage('empty')).toBe('Please enter a duration.')
    expect(formatErrorMessage('empty', { locale: 'de' })).toBe('Bitte gib eine Dauer ein.')
  })

  it('fills in formatted bounds for out_of_range', () => {
    expect(formatErrorMessage('out_of_range', { min: 30, max: 480 })).toBe('Must be between 30min and 8h.')
    expect(formatErrorMessage('out_of_range', { min: 30 })).toBe('Must be at least 30min.')
    expect(formatErrorMessage('out_of_range', { max: 90, locale: 'de' })).toBe('Darf höchstens 1h 30min sein.')
  })

  it('uses overrides, including placeholders', () => {
    expect(formatErrorMessage('out_of_range', { max: 60, overrides: { out_of_range: 'Max {max}!' } })).toBe('Max 1h!')
    expect(formatErrorMessage('empty', { overrides: { missing_unit: 'x' } })).toBe('Please enter a duration.')
  })
})
