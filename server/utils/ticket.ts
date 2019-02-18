import { Filter, asyncFilterData, errorInfo } from 'kenote-validate-helper'
import { trim } from 'lodash'
import { format } from 'util'
import { Ticket, TicketOptions, responseDocument as responseTicketDocument } from '../types/proxys/ticket'
import { __ErrorCode, __ErrorMessage, ErrorInfo } from '../error'
import ticketProxy from '../proxys/ticket'

export async function validTicket (info: Ticket, options: TicketOptions): Promise<any> {
  let filters: Array<Filter> = [
    {
      key: options.key,
      rules: [
        {
          required: true,
          message: format(__ErrorMessage.ERROR_VALID_TICKET_REQUIRED, options.name),
          code: __ErrorCode.ERROR_VALID_TICKET_REQUIRED
        }
      ],
      value: trim(info.cdkey)
    }
  ]
  try {
    let data: {} = await asyncFilterData(filters)
    let ticket: responseTicketDocument =  await ticketProxy.Dao.findOne({ cdkey: data[options.key], type: options.type })
    if (ticket) {
      if (ticket.last_at.getTime() <= Date.now()) {
        let error: errorInfo | {} = ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_EXPIRED, [options.name], true)
        return Promise.reject(error)
      }
      if (ticket.used) {
        let error: errorInfo | {} = ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_USED, [options.name], true)
        return Promise.reject(error)
      }
    }
    else {
      let error: errorInfo | {} = ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_NULL, [options.name], true)
      return Promise.reject(error)
    }
    return Promise.resolve(ticket)
  } catch (error) {
    return Promise.reject(error)
  }
}