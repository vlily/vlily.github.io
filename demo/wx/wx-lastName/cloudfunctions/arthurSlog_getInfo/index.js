// 云函数入口文件
const cloud = require('wx-server-sdk')

// 使用云函数前一定要初始化
cloud.init()

// 云函数入口函数
// 导出函数（服务），供前端访问，函数名为arthurSlog_getInfo
exports.main = async (event, context) => {
  // 返回给客户端的数据（就是res）
  return event.userInfo
}