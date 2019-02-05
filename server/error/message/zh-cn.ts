// ------------------------------------
// Error Message
// ------------------------------------
import { MessageTypes } from '../../types/error/message'

export default  <MessageTypes> {
  ERROR_STATUS_NULL: 'Request Success!',

  ERROR_AUTH_FLAG_ACCESS: '没有访问该页面的权限',
  ERROR_AUTH_FLAG_OPERATE: '没有操作此项的权限',
  ERROR_BYLOND_LEVEL_OPERATE: '无法对比您等级高或平级的用户或组进行操作',
  ERROR_VALID_IDMARK_NOTEXIST: '缺少ID标识',
  ERROR_AUTH_OPERATE_GROUP_NULL: '要操作的用户组不存在',

  ERROR_UPLOAD_FILE_MIMETYPE: '上传文件类型不许可. [%s]',
  ERROR_UPLOAD_FILESIZE_LARGEMAX: '上传文件超过最大值 %s.',
  ERROR_UPLOAD_NOT_FILE: '请选择上传文件!',

  ERROR_LOGINVALID_FAIL: '用户名密码错误',

  ERROR_VALID_USERNAME_REQUIRED: '用户名不能为空',
  ERROR_VALID_USERNAME_FORMAT: '用户名格式错误',
  ERROR_VALID_USERNAME_UNIQUE: '用户名已占用',
  ERROR_VALID_PASSWORD_REQUIRED: '密码不能为空',
  ERROR_VALID_PASSWORD_FORMAT: '密码格式错误',
  ERROR_VALID_EMAIL_REQUIRED: '电子邮箱不能为空',
  ERROR_VALID_EMAIL_FORMAT: '电子邮箱格式错误',
  ERROR_VALID_EMAIL_UNIQUE: '电子邮箱已占用',
  ERROR_VALID_EXCHANGE_REQUIRED: '%s不能为空',
  ERROR_VALID_EXCHANGE_NULL: '该%s不存在',
  ERROR_VALID_EXCHANGE_TYPE: '该%s不能应用于%s',
  ERROR_VALID_EXCHANGE_USED: '该%s已使用',
  ERROR_VALID_EXCHANGE_EXPIRED: '该%s已过期',
  
}