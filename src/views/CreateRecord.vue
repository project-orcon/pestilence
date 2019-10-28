<template>
  <div class="createRecord">
    <v-container>
      <v-row>
        <v-col cols="12" v-show="!showCamera" style="text-align:center">
          <video id="player" controls autoplay v-show="showVideo" class="camera"></video>
          <!-- default video player aspect ratio is 4:3 -->
          <canvas id="canvas" class="camera" v-show="showCanvas"></canvas>
          <div style="text-align:center" v-show="showVideo">
            <v-btn fab large color="red" id="capture" style="margin-top:-200px">
              <v-icon>camera</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" class="black white--text default-camera" style v-show="showCamera">
          <div>
            <v-icon size="80" color="white">camera</v-icon>
            <br />
            <br />
            <v-btn
              outlined
              color="white"
              v-show="!showVideoError"
              @click="turnCameraOn()"
            >Turn Camera On</v-btn>
            <div
              v-show="showVideoError"
              class="white--text"
            >Camera access has been blocked, please go into site settings in your browser and set camera access permissions.</div>
          </div>
        </v-col>
        <v-col cols="12"></v-col>
      </v-row>
      <v-row>
        <v-col>Add New Record</v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-form>
            <v-select v-model="select" :items="categories" label="Category" required></v-select>

            <v-text-field v-model="location" label="Location" required></v-text-field>
            <div style="text-align:right" class="my-3">
              <v-btn outlined color="grey darken-2" @click="loadGps">Get location from Device</v-btn>
            </div>
            <v-textarea v-model="notes" label="Notes" required></v-textarea>
            <div style="text-align:right">
              <v-btn outlined>Save New Record</v-btn>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  mounted() {
    navigator.permissions
      .query({ name: "camera" })
      .then(permissionObj => {
        console.log(permissionObj.state);
        if (permissionObj.state === "granted") {
          //if camera permission has previously been granted then display video,
          //else put default cameraview on screen.

          this.setUpCamera();
        } else if (permissionObj.state === "denied") {
          this.showCamera = true;
          this.showVideoError = true;
        } else {
          this.showCamera = true;
        }
      })
      .catch(error => {
        console.log("Got error :", error);
        this.showVideoError = true;
      });
  },
  methods: {
    turnCameraOn() {
      this.setUpCamera();
    },
    loadGps() {
      var startPos;
      var geoSuccess = position => {
        startPos = position;
        this.location =
          startPos.coords.latitude.toFixed(6) +
          "," +
          startPos.coords.longitude.toFixed(6);
      };
      navigator.geolocation.getCurrentPosition(geoSuccess);
    },
    setUpCamera() {
      const player = document.getElementById("player");
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      const captureButton = document.getElementById("capture");

      const constraints = {
        video: true
      };

      captureButton.addEventListener("click", () => {
        // Draw the video frame to the canvas.
        this.showCanvas = true;
        this.showVideo = false;

        context.drawImage(player, 0, 0, canvas.width, canvas.height);
        //stop the video stream
        player.srcObject.getVideoTracks().forEach(track => track.stop());
      });

      // Attach the video stream to the video element and autoplay.
      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        player.srcObject = stream;
      });

      this.showCamera = false;
      this.showVideo = true;
    }
  },
  data: () => ({
    showVideoError: false,
    showCamera: true,
    showVideo: true,
    showCanvas: false,
    categories: ["Weed", "Pest", "Disease"],
    location: "",
    notes: ""
  })
};
</script>
<style scoped>
.camera {
  width: 80vh;
  height: 60vh;
}

.default-camera {
  height: 30vh;
  min-height: 400px;
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
}
</style>
