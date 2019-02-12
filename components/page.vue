<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'

@Component({
  name: 'page',
  mounted () {
    this.$nextTick(() => {
      this['$nuxt'].$loading.start()
      setTimeout(() => this['$nuxt'].$loading.finish(), 300)
    })
  }
})
export default class  extends Vue {}
</script>