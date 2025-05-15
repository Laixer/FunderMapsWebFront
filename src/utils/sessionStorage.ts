export const getItemsStartingWith = (str: string) => {
  return Object.keys(sessionStorage)
    .filter(key => key.startsWith(str))
    .reduce((acc: { [key: string]: string }, key: string) => {
      const val = sessionStorage.getItem(key)
      if (val) acc[key] = val
      return acc
    }, {})
}