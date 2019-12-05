<template>
  <div id="GPS">
    <v-text-field
      :value="value"
      label="Location"
      :rules="rules"
      @input="$emit('input', $event)"
      required
    ></v-text-field>
    <div style="text-align:right" class="my-3">
      <v-btn outlined color="grey darken-2" @click="loadGps"  :disabled="disableGPS"
        >Get location from Device
         <v-progress-circular
                  style="margin-left:10px"
                  v-show="findingLocation"
                  size="16"
                  width="2"
                  indeterminate
                  color="black"
                ></v-progress-circular>
                </v-btn>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {
    this.checkPermissions();
  },
  methods: {
    checkPermissions() {
      //may not work on safari and edge
      navigator.permissions &&
        navigator.permissions
          .query({ name: "geolocation" })
          .then(PermissionStatus => {
            if (PermissionStatus.state === "denied") {
              this.disableGPS = true;
            }
          });
    },
    loadGps() {
        this.findingLocation=true;
      let startPos;
      let geoSuccess = position => {
        startPos = position;
        let location =
          startPos.coords.latitude.toFixed(6) +
          "," +
          startPos.coords.longitude.toFixed(6);
        this.$emit("input", location);
        this.findingLocation=false;
      };

      let promptDeclined= error => {
          this.disableGPS=true;
          this.findingLocation=false;
      }
      navigator.geolocation.getCurrentPosition(geoSuccess, promptDeclined);
    }
  },
  data: () => ({
    disableGPS: false,
    findingLocation:false
  }),
  props: {
    value: String,
    rules: Array
  }
};
</script>
<style scoped></style>
