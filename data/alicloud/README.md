# Alicloud

阿里云服务 接口配置

`aliclound.yml`

```yaml
---
# Aliclound 配置 ######################################################################
######################################################################################

#alicloud:
key           : aliclound
name          : 阿里云服务
# 密钥配置
setting:
  accessKeyId          : <accessKeyId>
  secretAccessKey      : <secretAccessKey>
  endpoint             : https://dysmsapi.aliyuncs.com
  apiVersion           : !!str 2017-05-25
# 短信服务
SMS:
  signName             : <signName>
  templates:
    register           : <SMS_template_code>
    verifyid           : <SMS_template_code>
    password           : <SMS_template_code>
    setinfos           : <SMS_template_code>

```