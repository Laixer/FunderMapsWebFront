export const toEuro = (value: string | number): string => `${parseFloat(String(value)).toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}`;
export const toMMYear = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} mm/jaar`;
export const toMeters = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} m`;
export const toSquareM = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} m2`;
export const toCubicM = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} m3`;
export const toNAP = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} m t.o.v. NAP`;
export const toMaaiveld = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} m beneden maaiveldniveau`;
export const toMM = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} mm`;
export const toKN = (value: string | number): string => `${parseFloat(String(value)).toFixed(2)} kN`;
export const toScale = (value: string | number): string => `1:${parseFloat(String(value)).toFixed(0)}`;

// example input format: 2022-05-11T15:09:24.289848Z
// desired output dd-mm-jjjj
export const toFormattedDate = (value: string): string => {
  try {
    if (value === '') return value;

    return new Date(value).toLocaleDateString("nl-NL", {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  } catch (e) {
    return value;
  }
};

// 2022-05-11T15:09:24.289848Z => 2022
export const toYear = (value: string | number): string => String(value).substring(0, 4);
