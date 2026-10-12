// Two decimals the Dutch way: a decimal comma and a point for thousands (1.234,50)
const toDecimals = (value: string | number): string =>
  parseFloat(String(value)).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const toEuro = (value: string | number): string => `${parseFloat(String(value)).toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}`;
export const toMMYear = (value: string | number): string => `${toDecimals(value)} mm/jaar`;
export const toMeters = (value: string | number): string => `${toDecimals(value)} m`;
export const toSquareM = (value: string | number): string => `${toDecimals(value)} m²`;
export const toNAP = (value: string | number): string => `${toDecimals(value)} m t.o.v. NAP`;
export const toMaaiveld = (value: string | number): string => `${toDecimals(value)} m beneden maaiveldniveau`;
export const toMM = (value: string | number): string => `${toDecimals(value)} mm`;
export const toScale = (value: string | number): string => `1:${parseFloat(String(value)).toFixed(0)}`;

// example input format: 2022-05-11T15:09:24.289848Z
// desired output dd-mm-jjjj
export const toFormattedDate = (value: string | number): string => {
  try {
    const str = String(value)
    if (str === '') return str;

    return new Date(str).toLocaleDateString("nl-NL", {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  } catch {
    return String(value);
  }
};

// 2022-05-11T15:09:24.289848Z => 2022
export const toYear = (value: string | number): string => String(value).substring(0, 4);
