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
    <v-footer dark class="mt-5 text-center"><a href="https://www.bedson.xyz" style="color:white;font-size:12px;text-decoration:none">A bedson xyz sample app</a></v-footer>
  </v-app>
  </div>
</template>

<script>


export default {
  name: 'App',
  components: {
  
  },
  mounted(){
return this.fingerprinting().then(()=> {console.log("APP VUEfingerprint is",this.$store.getters.fingerprint)});
  },
  methods: {
setFingerprint(components) {
      console.log("hash is", components); // an array of components: {key: ..., value: ...}
      let values = components.map(function(component) {
        return component.value;
      });
      this.$store.commit("setFingerprint",Fingerprint2.x64hash128(values.join(""), 31));
      //this.estimates = this.estimates.where("user", "==", this.fingerprint);
    },
    fingerprinting() {
      const returnPromise = new Promise((resolve, reject) => {
        const Fingerprint2 = window.Fingerprint2;
        let vueInstance = this;
        if (window.requestIdleCallback) {
          requestIdleCallback(() => {
            Fingerprint2.get(function(components) {
              vueInstance.setFingerprint(components);
              resolve();
            });
          });
        } else {
          setTimeout(function() {
            Fingerprint2.get(function(components) {
              vueInstance.setFingerprint(components);
              resolve();
            });
          }, 500);
        }
      });

      return returnPromise;
    },
  },
  data: () => ({
    //
  }),
};
</script>

<style>
#app{
  background-image: linear-gradient(to bottom right, #81C784, 
#26A69A);
}

.heading-font {
font-family: sans-serif;font-weight:400; font-style:normal;


font-size:30px !important;
}


</style>
