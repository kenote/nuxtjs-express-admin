<template>
  <h1>Hello world</h1>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    layout?: string | Function,
    middleware?: string | string[]
  }
}

@Component({
  layout: 'default'
})
export default class  extends Vue {

}

</script>

<style lang="scss">

</style>
