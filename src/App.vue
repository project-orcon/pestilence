<template>
<div id="app">
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Pestilence</span>
        <span class="font-weight-light"></span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

    </v-app-bar>
       <v-content>
      <v-container fluid>
        <v-fade-transition mode="out-in">
          <router-view></router-view>
        </v-fade-transition>
      </v-container>
    </v-content>  

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
