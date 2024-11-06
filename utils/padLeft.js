function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
//or as a Number prototype method:
Number.prototype.padLeft = function (n,str){
    return Array(n-String(this).length+1).join(str||'0')+this;
}
// //examples
// console.log(padLeft(1,5));       //=> '00023'
// console.log((23).padLeft(5));     //=> '00023'
// console.log((23).padLeft(5,' ')); //=> '   23'
// console.log(padLeft(23,5,'>>'));  //=> '>>>>>>23'

module.exports = padLeft