const formatDateNotDay = (date) => {
  var month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  var t = new Date(date);
  return t.getDate() + ' ' + month[t.getMonth()] + ' ' + t.getFullYear();
}
module.exports = formatDateNotDay
