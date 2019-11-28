<template>
  <div id="camera">
    <v-container>
      <v-row>
        <v-col cols="12" v-show="!showCamera" style="text-align:center">
          <video
            id="player"
            controls
            autoplay
            v-show="showVideo"
            class="camera"
          ></video>
          <!-- default video player aspect ratio is 4:3 -->
          <canvas
            id="canvas"
            class="camera"
            v-show="showCanvas"
            width="80vw"
            height="60vw"
          ></canvas>
          <div style="text-align:center" v-show="showVideo">
            <v-btn fab large color="red" id="capture" style="margin-top:-200px">
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" v-show="showFilePicker" >
          <v-file-input
            label="Add image"
            accept="image/*"
            capture="environment"
            :value="value"
            @change="updateValue($event)"

          ></v-file-input>
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

export const DB = App.firestore();

export const Storage = App.storage();

export default {
  mounted() {
    //check if can access media devices, if not display file picker.
    const supported = "mediaDevices" in navigator;
    console.log("supported is", supported);

    if (!supported) {
      this.showFilePicker = true;
      return;
    }

    const constraints = {
      video: true
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        navigator.permissions.query({ name: "camera" }).then(permissionObj => {
          console.log(permissionObj.state);
          if (permissionObj.state === "granted") {
            //if camera permission has previously been granted then display video,
            //else put default cameraview on screen.

            this.setUpCamera();
          } else {
            this.showFilePicker = true;
          }
        });
      })
      .catch(error => {
        //error thrown if can't access camera, despite mediaServices being supported
        this.showFilePicker = true;
      });
  },
  methods: {
      updateValue: function (value) {
        console.log("value is",value)
        this.$emit('input', value)
      },
    turnCameraOn() {
      this.setUpCamera();
    },
    save() {
      var dateNow = Date.now();
      DB.collection("items").add({
        timestamp: dateNow,
        category: this.category,
        image: this.currentPictureData.name,
        location: this.location,
        notes: this.notes
      });
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
          this.onUpload();
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
  props: {
   value: {
        type: Array
      },

  },
  data: () => ({
    files:[],
    showFilePicker: false,
    picture: {},
    currentPictureData: {},
    showVideoError: false,
    showCamera: true,
    showVideo: true,
    showCanvas: false
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
