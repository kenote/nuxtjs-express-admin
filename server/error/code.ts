// ------------------------------------
// Error Code
// ------------------------------------
import { CodeTypes } from '../types/error/code'

export default <CodeTypes> {
  ERROR_STATUS_NULL                : 0,

  ERROR_AUTH_FLAG_ACCESS           : 1001,
  ERROR_AUTH_FLAG_OPERATE          : 1002,
  ERROR_BYLOND_LEVEL_OPERATE       : 1003,
  ERROR_VALID_IDMARK_NOTEXIST      : 1004,
  ERROR_AUTH_OPERATE_GROUP_NULL    : 1005,

  ERROR_UPLOAD_FILE_MIMETYPE       : 1101,
  ERROR_UPLOAD_FILESIZE_LARGEMAX   : 1102,
  ERROR_UPLOAD_NOT_FILE            : 1103,

  ERROR_LOGINVALID_FAIL            : 1201,
  ERROR_FINDUSER_NOTEXIST          : 1202,

  ERROR_VALID_USERNAME_REQUIRED    : 1401,
  ERROR_VALID_USERNAME_FORMAT      : 1402,
  ERROR_VALID_USERNAME_UNIQUE      : 1403,
  ERROR_VALID_PASSWORD_REQUIRED    : 1404,
  ERROR_VALID_PASSWORD_FORMAT      : 1405,
  ERROR_VALID_EMAIL_REQUIRED       : 1406,
  ERROR_VALID_EMAIL_FORMAT         : 1407,
  ERROR_VALID_EMAIL_UNIQUE         : 1408,
  ERROR_VALID_MOBILE_REQUIRED      : 1409,
  ERROR_VALID_MOBILE_FORMAT        : 1410,
  ERROR_VALID_MOBILE_UNIQUE        : 1411,
  ERROR_VALID_CHOOSEONE_MORE       : 1412,
  ERROR_VALID_TICKET_REQUIRED      : 1413,
  ERROR_VALID_TICKET_NULL          : 1414,
  ERROR_VALID_TICKET_TYPE          : 1415,
  ERROR_VALID_TICKET_USED          : 1416,
  ERROR_VALID_TICKET_EXPIRED       : 1417,

  ERROR_VERIFY_EMAIL_TIMEOUT       : 1418,
  ERROR_VERIFY_EMAIL_FAILED        : 1419,
  ERROR_VERIFY_MOBILE_TIMEOUT      : 1420,
  ERROR_VERIFY_MOBILE_FAILED       : 1421,
  ERROR_VERIFY_TOKEN_VERIFIED      : 1422,
  ERROR_SEND_MAILPHONE_STEP        : 1423,
  ERROR_VERIFY_CODE_REQUIRED       : 1424,
  ERROR_VERIFY_CODE_TIMEOUT        : 1425,
  ERROR_VERIFY_CODE_FAILED         : 1426,
  ERROR_VERIFY_ID_REQUIRED         : 1427,
  ERROR_VERIFY_ID_TIMEOUT          : 1428,
  ERROR_VERIFY_ID_FAILED           : 1429,
}

