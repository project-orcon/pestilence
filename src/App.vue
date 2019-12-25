<template>
<div id="app">
  <v-app>
    <v-app-bar app class="text-center">
      <v-icon large color="green" v-show="$route.path!= '/'" @click="$router.go(-1)">keyboard_backspace</v-icon>
        <v-spacer></v-spacer>
     
<v-toolbar-title class="heading-font green--text font-weight-bold">
scout xyz

      </v-toolbar-title>
         <v-toolbar-side-icon>
  <v-icon color="green" large right>spa</v-icon>
        </v-toolbar-side-icon>
      <v-spacer></v-spacer>

    </v-app-bar>
       <v-content>
      <v-container fluid  style="max-width:1100px;margin:0 auto">
        <v-fade-transition mode="out-in">
          <router-view></router-view>
        </v-fade-transition>
      </v-container>
    </v-content>  
    <v-footer color="green" class="mt-5"><a href="https://www.bedson.xyz" style="color:white;font-size:12px;text-decoration:none">A bedson xyz sample app</a></v-footer>
  </v-app>
  </div>
</template>

<script>


export default {
  name: 'App',
  components: {
  
  },
  data: () => ({
    //
  }),
};
</script>

<style>
#app{
  background-image: linear-gradient(to bottom right, #008000, #66BB6A);
}

.heading-font {
font-family: 'Didact Gothic', sans-serif !important;
font-size:30px !important;
}


</style>
