export const getItemsStartingWith = (str: string): Record<string, string> => {
  return Object.keys(localStorage)
    .filter(key => key.startsWith(str))
    .reduce((acc: { [key: string]: string }, key: string) => {
      const val = localStorage.getItem(key)
      if (val) acc[key] = val
      return acc
    }, {})
}
