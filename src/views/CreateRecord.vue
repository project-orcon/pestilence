<template>
  <div class="createRecord">
    <v-container fluid style="margin-top:10px;padding: 0 0">
      <v-row>
        <v-col>
          <div
            class="headline font-weight-bold white--text"
            style="margin-top:-12px;;padding:15px;width:100%;background-color:rgba(0,0,0,0.14)"
          >
            Add new record
          </div>
          <v-form ref="form" class="white">
            <v-container>
              <Camera v-model="file" :rules="imageRules"></Camera>
              <v-select
                v-model="category"
                :items="categories"
                label="Category"
                :rules="categoryRules"
                required
              ></v-select>
              <GPS v-model="location" :rules="locationRules"></GPS>
              <v-textarea
                v-model="notes"
                label="Notes"
                :rules="notesRules"
                required
              ></v-textarea>
              <div style="text-align:right;margin-bottom:100px">
                <v-btn outlined @click="save()">
                  Save New Record
                  <v-progress-circular
                    style="margin-left:10px"
                    v-show="currentlySaving"
                    size="16"
                    width="2"
                    indeterminate
                    color="black"
                  ></v-progress-circular
                ></v-btn>
              </div>
            </v-container>
          </v-form>
        </v-col>
      </v-row>
      <div class="text-center ma-2">
        <v-snackbar v-model="error">
          {{ errorMessage }}
          <v-btn color="pink" text @click="error = false">
            Close
          </v-btn>
        </v-snackbar>
      </div>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import { App } from "@/firebase.js";
import "firebase/storage";
import "firebase/firestore";

import Camera from "@/components/Camera.vue";
import GPS from "@/components/GPS.vue";
import IDB from "@/indexDbService.js";
export const DB = App.firestore();

export const Storage = App.storage();

export default {
  components: {
    Camera,
    GPS
  },
  mounted() {
    this.checkIfOnline().then(
      function() {
        console.log("is online yeah");
      },
      function() {
        console.log("is offline yeah");
      }
    );
  },
  methods: {
    validateField() {
      return this.$refs.form.validate();
    },
    turnCameraOn() {
      this.setUpCamera();
    },
    saveOffline: function(){
      //save file and images to indexdb
      //if offline then add id to local storage

      //convert image file to blob.
      console.log("made it to saveOffline");
      let dateNow = Date.now();
      let observation = {
        id: dateNow,
        timestamp: dateNow,
        category: this.category,
        image: this.file.name,
        url: null,
        location: this.location,
        notes: this.notes,
        file: this.file,
        user: this.$store.getters.fingerprint
      };

        return IDB.saveIndexedDB([observation])
        .then(
          () => {
            return this.checkIfOnline();
          }
        )
        .then(
          () => {
            console.log("is online");
          },
          e => {
            console.log("made it to catch", observation.id);

            let currentItems = [];
            let currentStorage=localStorage.getItem("addedOffline");
            if (currentStorage) {
              let parsed=JSON.parse(currentStorage);
              currentItems = currentItems.concat(parsed);
            }

            currentItems.push(observation.id);

            localStorage.setItem(
              "addedOffline",
              JSON.stringify(currentItems)
            );

          let whatever= localStorage.getItem("addedOffline");
            
          }
        );
    },
    checkIfOnline() {
      return DB.collection("items").get({ source: "server" });
    },
    save() {
      if (this.validateField()) {
        this.currentlySaving = true;
        this.checkIfOnline()
          .then(this.saveFirebase)
          .catch(e => {
            console.log("failed to save to firebase", e);
          })
          .then(() => {
            console.log("made it to saveOffline");
            this.saveOffline();
          })
          .then(() => {
            console.log("made it to second then statement");
            this.currentlySaving = false;

            this.$router.push("/");
          })
          .catch(e => {
            console.log("made it to outer catch statement");
            console.log("error", e);

            this.currentlySaving = false;
          });
      }
    },
    saveFirebase: function() {
      //upload image first if succeeds then upload to database, else display error message.
      console.log("made it to saveFirebase");
      return this.onUpload(this.file).then(
        imageUrl => {
          var dateNow = Date.now();
          var generatedId = DB.collection("userObservations").doc().id;

          return DB.collection("userObservations")
            .doc(generatedId)
            .set({
              id: generatedId,
              timestamp: dateNow,
              category: this.category,
              image: this.file.name,
              url: imageUrl,
              location: this.location,
              notes: this.notes,
              user: this.$store.getters.fingerprint
            });
          //successfully saved ->
        },
        e => {
          console.log("maded it to catch in saveFirebase function");
        }
      );
    },
    onUpload(file) {
      return new Promise((resolve, reject) => {
        console.log("made it to onupload");
        const storageRef = Storage.ref(file.name).put(file);
        storageRef.on(
          `state_changed`,
          snapshot => {
            this.uploadValue =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          error => {
            console.log(error.message);
            reject(Error("Could not upload file to firebase storage"));
          },
          () => {
            this.uploadValue = 100;
            storageRef.snapshot.ref.getDownloadURL().then(url => {
              resolve(url);
            });
          }
        );
      });
    }
  },
  data: () => ({
    file: null,
    locationRules: [
      v =>
        /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/.test(
          v
        ) || "GPS Coordinates must be valid"
    ],
    imageRules: [v => !!v || "Image is required"],
    categoryRules: [v => !!v || "Category is required"],
    notesRules: [v => !!v || "Notes are required"],
    showVideoError: false,
    showVideo: true,
    showCanvas: false,
    category: "",
    categories: ["Weed", "Pest", "Disease"],
    location: "",
    notes: "",
    currentlySaving: false
  })
};
</script>
<style scoped>
canvas {
  width: 100%;
}
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
