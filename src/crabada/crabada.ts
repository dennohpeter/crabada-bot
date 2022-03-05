/**
 * Crabada Wrapper containing major functions to interact with
 * cra
 */
class CrabadaWrapper {
  _baseUrl: string;
  constructor() {
    this._baseUrl = 'https://api.crabada.com/public';
  }
}

export const crabadaWrapper = new CrabadaWrapper();
