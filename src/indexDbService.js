
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

  return indexDbPromise.then((response) => {

    let indexdb = response;
    let transaction = indexdb.transaction(name, "readwrite");
    let objectStore = transaction.objectStore(name);
    objects.forEach(object => {
      objectStore.put(object);
      console.log("saved",object)
    });
})
}

const getAllRecords= function(){
  return indexDBPromise().then(response =>{
    console.log('response is',response);
  return response.getAll(name)
  }
)
}

const getRecord= function(key){
  return indexDBPromise().then((response) =>{
    console.log('response is',response);
    let indexdb = response;
    let transaction = indexdb.transaction(name, "readonly");
    let objectStore = transaction.objectStore(name);
    let request=objectStore.get(key);
    return request;
  }
).then((val)=> {
  console.log("NEED TO SEE WHAT THIS FUNCTION IS RETURNING"+val);
  return val;
});
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

  return indexDbPromise.then(function(response) {
    let indexdb = response;
    let transaction = indexdb.transaction(name, "readwrite");
    let objectStore = transaction.objectStore(name);
    objectStore.clear();

  });
}
export default {
    indexDBPromise,
    getRecord,
    saveIndexedDB,
    deleteIndexedDB,
    clearAllData,
    getAllRecords
  }
  