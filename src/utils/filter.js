
const filterInplace = (list, fn) => {
  let i, j = 0
  for (i = 0; i < list.length; ++i) {
    if (fn(list[i])) list[j++] = list[i]
  }
  list.length = j
}

module.exports = {
  filterInplace
}
