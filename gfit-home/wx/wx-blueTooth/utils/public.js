var CryptoJS = require('aes.js');  //引用AES源码js
console.log(CryptoJS.enc)
/**
 * 	AES加密（需先加载aes.min.js文件）
 * @param  {[type]} word [description]
 * @return {[type]}      [description]
 */
function Encrypt(word,key) {
  //var srcs = CryptoJS.enc.Utf8.parse(word);
  var srcs = CryptoJS.enc.Hex.parse(word);
  console.log(srcs)
  var key = CryptoJS.enc.Utf8.parse(key);
  // ECB模式不需要偏移量
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  //var encryptedHex = encrypted.ciphertext.toString().toUpperCase();//默认输出十六进制
  var encryptedHex = encrypted.ciphertext.toString();
  return encryptedHex;
}
/**
 * AES解密
 * @param word
 * @returns {*}
 */
function Decrypt(word, key,iv) {
  // var encryptedHexStr = CryptoJS.enc.Base64.parse(word);//解析成base64
  // var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  key = CryptoJS.enc.Utf8.parse(key);//十六位十六进制数作为秘钥
  iv = CryptoJS.enc.Utf8.parse(iv);//十六位十六进制数作为秘钥偏移量
  var decrypt = CryptoJS.AES.decrypt(word, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
  // return decryptedStr
}
//暴露接口
module.exports.Decrypt = Decrypt;
module.exports.Encrypt = Encrypt;