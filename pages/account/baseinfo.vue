<template>
  <page>

  </page>
</template>
<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'

@Component({
  layout: 'console',
  middleware: ['authenticated'],
})
export default class  extends Vue {

}
</script>