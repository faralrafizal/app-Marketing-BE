const formateDateSlot = (date) => {
    console.log(date,"djsijdsiojdiosjd")
    let day = date.getDate()
    console.log(day,"asao")
    const months = [
        'JANUARY', 'FEBRUARY',
        'MARCH', 'APRIL',
        'MAY', 'JUNE',
        'JULY', 'AUGUST',
        'SEPTEMBER', 'OCTOBER',
        'NOVEMBER', 'DECEMBER'
    ]
    let month = months[date.getMonth()]
    console.log(month,"bulan.....")
    let year = date.getFullYear()
    console.log(year,"tahun.....")
    return `${day} ${month} ${year}`

}
module.exports = formateDateSlot;