<template>
  <div class="createRecord">
    <v-container>
      <v-row>
        {{files}}
    <v-col cols="12"> <Camera v-model="files"></Camera></v-col>
        <v-col cols="12" v-show="!showCamera" style="text-align:center">
             
          <video id="player" controls autoplay v-show="showVideo" class="camera"></video>
          <!-- default video player aspect ratio is 4:3 -->
          <canvas id="canvas" class="camera" v-show="showCanvas" width="800px" height="600px"></canvas>
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
        <v-col cols="12">
          <div v-show="pictureError" class="red--text">Please add a picture before saving</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>Add New Record</v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-form ref="form">
            <v-select
              v-model="category"
              :items="categories"
              label="Category"
              :rules="categoryRules"
              required
            ></v-select>
            <v-text-field v-model="location" label="Location" :rules="locationRules" required></v-text-field>
            <div style="text-align:right" class="my-3">
              <v-btn outlined color="grey darken-2" @click="loadGps">Get location from Device</v-btn>
            </div>
            <v-textarea v-model="notes" label="Notes" :rules="notesRules" required></v-textarea>
            <div style="text-align:right">
              <v-btn outlined @click="save()">Save New Record</v-btn>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import { App } from "@/firebase.js";
import "firebase/storage";
import "firebase/firestore";

import Camera from "@/components/Camera.vue"


export const DB = App.firestore();

export const Storage = App.storage();

export default {
  components: {
Camera
  },
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
    validateField() {
      this.$refs.form.validate();
    },
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
    save() {
      if (this.validateField()) {
        if (!this.currentPictureData.name) {
          this.pictureError = true;
        } else {
          this.pictureError = false;
          console.log("Made it here");
          this.onUpload();
           var dateNow=Date.now()
          DB.collection("items").add({
            timestamp: dateNow,
            category: this.category,
            image: this.currentPictureData.name,
            location: this.location,
            notes: this.notes
          });
          console.log("MADE IT TO HERE");
        }
      }

     
    },
    onUpload() {
      this.picture = null;
      const storageRef = Storage.ref(`${this.currentPictureData.name}`).put(
        this.currentPictureData.imageData
      );
      storageRef.on(
        `state_changed`,
        snapshot => {
          this.uploadValue =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        error => {
          console.log(error.message);
        },
        () => {
          this.uploadValue = 100;
          storageRef.snapshot.ref.getDownloadURL().then(url => {
            this.picture = url;
          });
        }
      );
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

        canvas.toBlob(blob => {
          this.currentPictureData.imageData = blob;
          this.currentPictureData.name = Date.now() + ".png";
        });
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
    files:[],
    pictureError: false,
    locationRules: [
      v =>
        /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/.test(
          v
        ) || "GPS Coordinates must be valid"
    ],
    categoryRules: [v => !!v || "Category is required"],
    notesRules: [v => !!v || "Notes are required"],
    picture: "",
    currentPictureData: {},
    showVideoError: false,
    showCamera: true,
    showVideo: true,
    showCanvas: false,
    category: "",
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
