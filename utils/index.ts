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