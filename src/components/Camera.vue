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
            @change="rotateAndUpdateValue($event)"
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
      console.log("media devices are not supported");
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
        console.log("there was an error with the camera", error);
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
    imgToCanvasWithOrientation: function(
      image,
      rawWidth,
      rawHeight,
      orientation
    ) {
      //taken from https://github.com/fris-fruitig/react-firebase-file-uploader/pull/24/files
      let canvas = document.createElement("canvas");
      if (orientation > 4) {
        canvas.width = rawHeight;
        canvas.height = rawWidth;
      } else {
        canvas.width = rawWidth;
        canvas.height = rawHeight;
      }

      if (orientation > 1) {
        console.log("EXIF orientation = " + orientation + ", rotating picture");
      }

      let ctx = canvas.getContext("2d");
      switch (orientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, rawWidth, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, rawHeight);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, rawHeight, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, rawHeight, rawWidth);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, rawWidth);
          break;
      }
      ctx.drawImage(image, 0, 0, rawWidth, rawHeight);
      return canvas;
    },
    getExifOrientation: function(file) {
      //taken from https://github.com/fris-fruitig/react-firebase-file-uploader/pull/24/files
      //will return
      // -2 = not jpeg, -1 = no data, 1..8 = orientations

      return new Promise(function(resolve, reject) {
        // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
        if (file.slice) {
          file = file.slice(0, 131072);
        } else if (file.webkitSlice) {
          file = file.webkitSlice(0, 131072);
        }

        let reader = new FileReader();
        reader.onload = function(e) {
          let view = new DataView(e.target.result);
          if (view.getUint16(0, false) != 0xffd8) {
            return resolve(-2);
          }
          let length = view.byteLength;
          let offset = 2;
          while (offset < length) {
            let marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xffe1) {
              if (view.getUint32((offset += 2), false) != 0x45786966) {
                return resolve(-1);
              }
              let little = view.getUint16((offset += 6), false) == 0x4949;
              offset += view.getUint32(offset + 4, little);
              let tags = view.getUint16(offset, little);
              offset += 2;
              for (let i = 0; i < tags; i++) {
                if (view.getUint16(offset + i * 12, little) == 0x0112) {
                  return resolve(view.getUint16(offset + i * 12 + 8, little));
                }
              }
            } else if ((marker & 0xff00) != 0xff00) break;
            else offset += view.getUint16(offset, false);
          }
          return resolve(-1);
        };
        reader.readAsArrayBuffer(file);
      });
    },
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
    rotateAndUpdateValue: function(value) {
      //called when a new file is added.
      //due to images taken from mobile having EXIF data (orientation)
      //images will have to be rotated before they are saved.
      //value is the file

      this.getExifOrientation(value).then(orientation => {
        let fr = new FileReader();
        fr.onload = () => {
          let img = new Image();
          img.onload = () => {
            //image has been loaded by file when get here

            let width = img.width;
            let height = img.height;
            let canvas = this.imgToCanvasWithOrientation(
              img,
              width,
              height,
              orientation
            );

            //convert canvas to file
            canvas.toBlob(blob => {
              let fileName = fr.fileName;
              let file = new File([blob], fileName);
              this.updateValue(file);
            });
          };
          img.src = fr.result;
        };
        fr.readAsDataURL(value);
      });
    },
    setUpCamera() {
      const player = document.getElementById("player");
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      const captureButton = document.getElementById("capture");

      player.addEventListener("loadeddata", x => {
        this.setUpCanvas(player.videoWidth, player.videoHeight);

        captureButton.addEventListener("click", () => {
          // Draw the video frame to the canvass
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

      //need to set these for camera to work with iOS
      player.setAttribute("autoplay", "");
      player.setAttribute("muted", "");
      player.setAttribute("playsinline", "");

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
          ideal: "environment"
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
