import channel from '~/server/types/channel'

export default class Channel {

  private __channelNavs: Array<channel.MenuItem>

  constructor (channel: channel.NavMenus) {
    this.__channelNavs = initMaps(channel.navs)
  }

  public find (index: string, navs: Array<channel.MenuItem> = this.__channelNavs): channel.MenuItem | undefined {
    let menuItem: channel.MenuItem | undefined
    for (let nav of navs) {
      if (nav.index === index) {
        menuItem = nav
        return menuItem
      }
      else if (nav.children) {
        menuItem = this.find(index, nav.children)
      }
    }
    return menuItem || { index: '-1', name: 'none', maps: [] }
  }

}

function initMaps (navs: Array<channel.MenuItem> = [], maps: any = []): Array<channel.MenuItem> {
  navs.forEach( nav => {
    let { index, name } = nav
    nav.maps = [].concat(maps)
    nav.maps.push({ index, name })
    if (nav.children) {
      return initMaps(nav.children, nav.maps)
    }
  })
  return navs
}

export function getChannelId (channels: Array<channel.NavMenus>, routePath: string): number {
  for (let channel of channels) {
    if (channel.navs) {
        let menuId: number = findChannelId(channel.navs, channel.id, routePath)
        if (menuId > -1) {
          return menuId
        }
    }
  }
  return -1
}

function findChannelId (navs: Array<channel.MenuItem>, id: number, routePath: string): number {
  for (let nav of navs) {
    if (nav.children) {
      let currentMenuItem: channel.MenuItem | undefined = nav.children.find(o => o.index === routePath)
      if (currentMenuItem) {
        return id
      }
      else {
        findChannelId(nav.children, id, routePath)
      }
    }
  }
  return -1
}