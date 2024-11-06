const formatDateFullMonth = (date) => {
  var month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  var t = new Date(date);
  const weekday = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  day = weekday[t.getDay()];
  return day + ", " + t.getDate() + ' ' + month[t.getMonth()] + ' ' + t.getFullYear();
}
module.exports = formatDateFullMonth
