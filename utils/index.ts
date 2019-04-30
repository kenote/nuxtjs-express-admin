import { Command } from '~/types'

export const parseCommand = (value: string): Command.Value | null => {
  if (!value) return null
  let command: RegExpMatchArray | null = value.match(/^(command|router)\:(\S+)$/)
  if (!command) return null
  return {
    type: <Command.Type> command[1],
    path: command[2]
  }
}


export const getDifferenceDate = async (begin: string, end: string | null, done: (time: number) => void, filter?: string): Promise<void> => {
  if (/(\,|\|)/.test(begin)) {
    let _begin: number[] = begin.split(/\,|\|/).map( (value: string) => new Date(value).getTime())
    for (let k of _begin) {
      await done(k)
    }
    return
  }
  let beginTime: number = new Date(begin).getTime()
  let endTime: number = new Date(end || begin).getTime()
  let dayTime: number = 24 * 60 * 60 * 1000

  for (let k = beginTime; k <= endTime;) {
    let isTrue: boolean = true
    if (filter) {
      let _filter: number[] = filter.split(/\,|\|/).map( (value: string) => new Date(value).getTime())
      isTrue = _filter.indexOf(k) === -1
    }
    isTrue && await done(k)
    k += dayTime
  }
}