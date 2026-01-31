/**
 * Countries utility tests
 * Tests for country data parsing and filtering
 */

import { getCountries } from '../../utils/countries';

describe('Countries Utility', () => {
  describe('getCountries', () => {
    it('should return an array of countries', () => {
      const countries = getCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should return countries with name and code properties', () => {
      const countries = getCountries();
      countries.forEach((country) => {
        expect(country).toHaveProperty('name');
        expect(country).toHaveProperty('code');
        expect(typeof country.name).toBe('string');
        expect(typeof country.code).toBe('string');
      });
    });

    it('should return countries sorted by name', () => {
      const countries = getCountries();
      const names = countries.map((c) => c.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should contain common countries', () => {
      const countries = getCountries();
      const countryNames = countries.map((c) => c.name);
      expect(countryNames).toContain('United States');
      expect(countryNames).toContain('United Kingdom');
      expect(countryNames).toContain('France');
      expect(countryNames).toContain('Japan');
    });
  });
});
