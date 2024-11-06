const { io } = require("../middleware/socketApi");


function pushNotif(data) {
    console.log(data)
    let pengirimSocket = io.sockets.sockets[data.sender];
    //data.penerima.forEach((penerimaUserId) => {
    let penerimaSocket = io.sockets.sockets[data.receiver];

    if (data.receiver) {
        io.to(data.receiver).emit(data.header, {
            pengirim: data.sender,
            message: data.message,
            url: data.url,
        });
        result = `pesan telah dikirimkan kepada user : ${data.receiver}`;
    } else {
        result = `pesan gagal dikirimkan kepada user : ${data.receiver}`;
    }
    // });

    return result;
}

module.exports = pushNotif;
