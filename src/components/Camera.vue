<template>
  <div id="camera" :class="!showFilePicker ? 'camera_on' : ''">
    <v-container fluid style="padding:0;">
      <v-row no-gutters>
        <v-col
          cols="12"
          v-show="!showCamera"
          style="text-align:center;"
          no-gutters
          class="black"
        >
          <video
            id="player"
            autoplay
            v-show="showVideo"
            class="camera"
            style="padding:0 !important"
          >
            >
          </video>
          <div style="text-align:center;height:0" v-show="showVideo">
            <v-btn fab color="red" id="capture" class="camera_button_overlay">
              <v-icon color="white">camera</v-icon>
            </v-btn>
          </div>
          <canvas id="canvas" class="camera" v-show="showCanvas"></canvas>
          <div style="text-align:center;height:0" v-show="showCanvas">
            <v-btn
              fab
              color="red"
              class="camera_button_overlay"
              @click="resetCamera"
            >
              <v-icon color="white">sync</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12">
          <v-input
            :rules="rules"
            v-model="value"
            class="ma-2"
            v-show="!showFilePicker"
          ></v-input>
        </v-col>
        <v-col cols="12" v-show="showFilePicker" no_gutters="false">
          <v-file-input
            label="Add image"
            accept="image/*"
            capture="environment"
            :value="value"
            @change="updateValue($event)"
            :rules="rules"
            required
          ></v-file-input>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  mounted() {
    //check if can access media devices, if not display file picker.

    const supported = "mediaDevices" in navigator;
    if (!supported) {
      this.showFilePicker = true;
      console.log("media devices are not supported")
      return;
    }

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(stream => {

        /*
        //navigator.permissions.query currently doesn't work with safari so currently can't use it. 

        navigator.permissions.query({ name: "camera" }).then(permissionObj => {
          if (permissionObj.state === "granted") {
            //if camera permission has previously been granted then display video,
            //else put default cameraview on screen.

            this.setUpCamera();
          } else {
            this.showFilePicker = true;
          }
        });*/

        this.setUpCamera();
      })
      .catch(error => {
        //error thrown if can't access camera, despite mediaServices being supported
        console.log("there was an error with the camera",error);
        this.showFilePicker = true;
      });
  },
  beforeDestoy() {
    //cleanup
    //turn off camera access

    const player = document.getElementById("player");

    //stop the video stream
    player.srcObject.getVideoTracks().forEach(track => track.stop());
  },
  methods: {
    resetCamera() {
      this.updateValue();
      this.showCanvas = false;
      this.showVideo = true;
    },
    setUpCanvas(width, height) {
      //sets canvas height and width (responsively)
      console.log("hfjwfkh", width, height);
      let canvas = document.getElementById("canvas");
      canvas.width = width;
      canvas.height = height;
    },
    updateValue: function(value) {
      this.$emit("input", value);
    },
    setUpCamera() {
      const player = document.getElementById("player");
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      const captureButton = document.getElementById("capture");

      player.addEventListener("loadeddata", x => {
        this.setUpCanvas(player.videoWidth, player.videoHeight);

        captureButton.addEventListener("click", () => {
          // Draw the video frame to the canvas.
          this.showCanvas = true;
          this.showVideo = false;

          context.drawImage(player, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(blob => {
            //convert blob into file.
            let fileName = Date.now() + ".png";
            let file = new File([blob], fileName);
            this.updateValue(file);
          });
        });
      });

      // Attach the video stream to the video element and autoplay.
      navigator.mediaDevices.getUserMedia(this.constraints).then(stream => {
        player.srcObject = stream;
      });

      this.showCamera = false;
      this.showVideo = true;
    }
  },
  props: {
    rules: {
      type: Array
    },
    value: {
      type: File
    }
  },
  data: () => ({
    error: false,
    showFilePicker: false,
    showCamera: true,
    showVideo: true,
    showCanvas: false,
    constraints: {
      video: {
        facingMode: {
          exact: "environment"
        }
      }
    }
  })
};
</script>
<style scoped>
video {
  display: block;
  padding: 0 !important;
  margin: 0 auto !important;
}
.camera {
  width: 100%;
  margin: 0 auto;
}

canvas {
  display: block;
}
.camera_button_overlay {
  margin-top: -120px;
}
</style>
