
/**
 * https://api.pdok.nl/bzk/locatieserver/search/v3_1/ui/#/
 */
export interface IPDOKSuggestion {
  type: string,
  weergavenaam: string,
  adrestype: string,
  id: string, 
  score: number
}