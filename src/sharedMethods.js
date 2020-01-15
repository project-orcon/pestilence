import { App } from "@/firebase.js";
import "firebase/storage";
export const Storage = App.storage();
export const DB = App.firestore();

export default {
  data () {

  },
    methods: {
         checkIfOnline() {
      return DB.collection("items").get({ source: "server" });
    },
    saveFirebase(observation,file) {
      //upload image first if succeeds then upload to database, else display error message.
      return this.onUpload(file)
        .then(imageUrl => {
          var generatedId = DB.collection("userObservations").doc().id;

          observation.id=generatedId;
          observation.url=imageUrl;

          DB.collection("userObservations")
            .doc(generatedId)
            .set(observation);
          //successfully saved ->
        })
        .catch(e => {
          throw e;
        });
    },
    onUpload(file) {
      return new Promise((resolve, reject) => {
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
  }

}

