
import { openDB } from 'idb'
const name="observations"

const indexDBPromise= function() {
  return openDB(name+"DB", 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore(name, { keyPath: "id" });
    }
  });
}

const saveIndexedDB=function(objects) {
  console.log("saving objects",objects)
  let indexDbPromise = indexDBPromise();

  return indexDbPromise.then(response => {

    let indexdb = response;
    let transaction = indexdb.transaction(name, "readwrite");
    let objectStore = transaction.objectStore(name);
    objects.forEach(object => {
      objectStore.put(object);
      console.log("saved",object)
    });
})
}

const getAllRecords= function(objects){
  return indexDBPromise().then(response =>{
    console.log('response is',response);
  return response.getAll(name)
  }
)
}

const deleteIndexedDB=function(id) {
  let indexDbPromise = indexDBPromise();

  indexDbPromise.then(function(response) {
    let indexdb = response;
    let transaction = indexdb.transaction(name, "readwrite");
    let objectStore = transaction.objectStore(name);
    objectStore.delete(id);
  });
}

const clearAllData= function(){
  let indexDbPromise = indexDBPromise();

  indexDbPromise.then(function(response) {
    let indexdb = response;
    let transaction = indexdb.transaction(name, "readwrite");
    let objectStore = transaction.deleteObjectStore(name);

  });
}
export default {
    indexDBPromise,
    saveIndexedDB,
    deleteIndexedDB,
    clearAllData,
    getAllRecords
  }
  