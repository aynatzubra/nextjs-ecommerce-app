import { sumCalc } from '@/lib/utils'

describe('Utility Functions', () => {
  it('should correctly sum two numbers', () => {
    const result = sumCalc(5, 10)

    expect(result).toBe(15)
  })

  it('should handle zero input correctly', () => {
    expect(sumCalc(0, 7)).toBe(7)
  })
})
