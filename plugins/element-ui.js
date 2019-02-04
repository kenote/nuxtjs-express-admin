import Vue from 'vue'
import Element from 'element-ui'
import local from 'element-ui/lib/locale/lang/en'

export default () => {
  Vue.use(Element, { local })
}