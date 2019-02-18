import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods } from 'kenote-express-helper'
import { IResponse } from '../../types/resuful'

import { responseDocument as responseTicketDocument } from '../../types/proxys/ticket'
import { validTicket } from '../../utils/ticket'
import { CustomError } from '../../error'


export default class Account extends RouterMethods {

  /**
   * 验证邀请码
   * @param cdkey <UUID4> 邀请码
   */
  @Router({ method: 'post', path: '/account/invitation' })
  public async invitation (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { cdkey } = req.body
    try {
      let data: responseTicketDocument = await validTicket({ cdkey }, { name: '邀请码', type: 'register', key: 'cdkey' })
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}