const formateDateTime = (date) => {
  console.log(date, "djsijdsiojdiosjd")
  let day = date.getDate()
  day = day < 10 ? "0" + day : day
  console.log(day, "asao")

  let month = +date.getMonth() + 1
  month = month < 10 ? "0" + month : month
  console.log(month, "bulan.....")
  let year = date.getFullYear()
  console.log(year, "tahun.....")
  return `${year}-${month}-${day}`

}
module.exports = formateDateTime;