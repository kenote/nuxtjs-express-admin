<template>
  <page class="__nuxt-error-page">
    <div class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48"><path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" /></svg>

      <div class="title">{{ message }}</div>
      <p v-if="statusCode === 404" class="description">
        <nuxt-link class="error-link" to="/">Back to the home page</nuxt-link>
      </p>
      <p v-else-if="statusCode === 403" class="description">
        This page is forbidden and you may not have access
      </p>
      <p class="description" v-else>An error occurred while rendering the page. Check developer tools console for details.</p>

    </div>
  </page>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Vue, Provide } from 'vue-property-decorator'

@Component({
  name: 'error-page'
})
export default class  extends Vue {

  @Prop({ default: 404 }) statusCode: number
  @Prop({ default: 'This page could not be found' }) message: string

  head () {
    return {
      title: this.$props.message,
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.__nuxt-error-page {
  padding: 0;
  background: #F7F8FB;
  color: #47494E;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: sans-serif;
  font-weight: 100 !important;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  position: static;
  height: 100%;

  .error {
    max-width: 450px;
  }
  .title {
    font-size: 1.5rem;
    margin-top: 15px;
    color: #47494E;
    margin-bottom: 8px;
  }
  .description {
    color: #7F828B;
    line-height: 21px;
    margin-bottom: 10px;
  }
  a {
    color: #7F828B !important;
    text-decoration: none;
  }
  .logo {
    position: fixed;
    left: 12px;
    bottom: 12px;
  }
}
</style>