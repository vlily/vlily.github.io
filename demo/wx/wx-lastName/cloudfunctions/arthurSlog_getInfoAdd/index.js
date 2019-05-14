// 云函数入口文件
const cloud = require('wx-server-sdk')

// 服务器端云能力初始化
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
 return {
   sun: event.a + event.b
 }
}