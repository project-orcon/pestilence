<template>
  <v-container>
    <v-row align="start">
      <v-col cols="12" 
        ><span  class="headline font-weight-bold white--text green" style="padding:15px;padding-right:100px">Records</span><v-btn
        class="float-right"
        outlined
          color="white"
          style="height:48px"
          @click="$router.push('/create')"
          >
          <v-icon left>note_add</v-icon>Add new record</v-btn
        >
      </v-col>
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header><div><v-icon left >filter_list</v-icon>Filters</div></v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="green"></v-divider>
              <v-container fluid>
                <v-row>
                  <v-col cols="12" md="4">
                    <SwitchFilter
                      label="Filter by Month"
                      :select-options="monthsGroup()"
                      @change="filter()"
                      :def="defaultMonth"
                      v-model="monthSelect"
                    ></SwitchFilter>
                  </v-col>

                  <v-col cols="12" md="4">
                    <SwitchFilter
                      label="Filter by Location"
                      :select-options="groups"
                      @change="filter()"
                      v-model="gpsSelect"
                    ></SwitchFilter>
                  </v-col>
                  <v-col cols="12" md="4">
                    <SwitchFilter
                      label="Filter by Category"
                      :select-options="categoryGroups"
                      @change="filter()"
                      v-model="categorySelect"
                    ></SwitchFilter>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12" md="4" v-for="item in paginated" :key="item.id">
        <v-card >
          <v-img :src="item.image" />
          <div class="text-right ma-2 subtitle-1S grey--text">
            {{ new Date(item.timestamp).toDateString() }}
          </div>
          <v-card-text class="subtitle-1">
            <div class="upper title mt-5 indigo--text">Category</div>
            <v-chip
              label
              :class="item.category + ' mt-3'"
              style="width:100%;text-align:center"
              >{{ item.category }}</v-chip
            >
            <div class="upper title mt-5 indigo--text">Location</div>
            <v-text-field disabled :value="item.location"></v-text-field>
            <div class="upper title mt-5 indigo--text">Notes</div>
            <v-textarea disabled :value="item.notes"></v-textarea>
            <v-chip label v-if="item.group">{{ item.group }}</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-pagination v-model="page" :length="pages" color="green" ></v-pagination>
  </v-container>
</template>
<script>
import { App } from "@/firebase.js";
import "firebase/storage";
export const Storage = App.storage();
export const DB = App.firestore();

const clusterMaker = require("clusters");

import SwitchFilter from "@/components/Filter.vue";
import IDB from "@/indexDbService.js";

export default {
  components: {
    SwitchFilter
  },
  mounted() {
    this.defaultMonth = this.currentMonth();
    let vueInstance = this;

    this.checkIfOnline()
      .then(
        DB.collection("items")
          .orderBy("timestamp", "desc")
          .get()
      )
      .then(querySnapshot => {
        this.observations = querySnapshot.docs.map(doc => doc.data());
        // do something with documents

        Promise.all(
          this.observations.map(x => Storage.ref(x.image).getDownloadURL())
        ).then(result => {
          result.forEach((y, index) => (this.observations[index].image = y));
        });

        //save data to indexedDB

        return this.observations;
      })
      .then(obs => IDB.saveIndexedDB(obs))
      .catch(e => {
        console.log("Not ONLINE");
        IDB.indexDBPromise().then(response => {
          let indexdb = response;
          let transaction = indexdb.transaction("observations", "readwrite");
          let estimateStore = transaction.objectStore("observations");
          indexdb.getAll("observations").then(x => {
            this.observations = x;
          });
        });
      });
  },
  methods: {
    checkIfOnline() {
      return DB.collection("items").get({ source: "server" });
    },
    monthsGroup: function() {
      return this.months.map(x => {
        return { text: x.name, value: x.name };
      });
    },
    clusterize(numClusters) {
      //test sort into 2 clusters
      clusterMaker.k(numClusters);

      //number of iterations (higher number gives more time to converge), defaults to 1000
      clusterMaker.iterations(750);

      //data from which to identify clusters, defaults to []

      clusterMaker.data(
        this.observations.map(x => [
          parseFloat(x.location.split(",")[0]),
          parseFloat(x.location.split(",")[1])
        ])
      );

      return clusterMaker.clusters();
    },
    convertMonth(num) {
      if (num) {
        return this.months[num].name;
      }
    },
    currentMonth() {
      return this.months[new Date().getMonth()].name;
    },
    currentMonthIndex() {
      return new Date().getMonth();
    },

    filterByLocation(items, numClusters) {
      let clusters = this.clusterize(numClusters);
      let locationFiltered = [];
      let SeenLocations = {};

      clusters.forEach((x, index) => {
        x.points.forEach(point => {
          let coords = point[0] + "," + point[1];
          let values = items.filter(z => {
            if (!SeenLocations[coords]) {
              if (z.location === coords) {
                SeenLocations[coords] = true;
                return true;
              }
            }
            return false;
          });
          console.log("values are", values);
          values = values.map(y => {
            y["group"] = "Location Group " + (index + 1);
            return y;
          });
          locationFiltered = locationFiltered.concat(values);
        });
      });

      return locationFiltered;
    },
    filter() {
      //get current month and filter based on data

      //filter according to which filters are current switched on and the values of the filters.
      let filtered;
      filtered = this.observations;

      if (this.monthSelect != null) {
        filtered = filtered.filter(
          x =>
            this.convertMonth(new Date(x.timestamp).getMonth()) ===
            this.monthSelect
        );
      }

      if (this.gpsSelect != null) {
        filtered = this.filterByLocation(filtered, this.gpsSelect);
      } else {
        //clear any added location groups groups
        filtered.map(x => {
          x.group = null;
          return x;
        });
      }

      if (this.categorySelect != null) {
        filtered = filtered.filter(x => x.category === this.categorySelect);
      }

      this.filtered = filtered;
      console.log("filtered is ", filtered);

      //reset pagination values
      this.pages = parseInt(filtered.length / this.itemsPerPage) + 1;
      this.page = 1;
      return filtered;
    }
  },
  computed: {
    paginated: function() {
      let startIndex = (this.page - 1) * this.itemsPerPage;
      console.log(startIndex);
      let endIndex = startIndex + this.itemsPerPage;
      console.log(endIndex);
      return this.filter().slice(startIndex, endIndex);
    }
  },
  data: () => ({
    page: 1,
    pages: 1,
    itemsPerPage: 10,
    groups: [
      { text: "3 Location Groups", value: 3 },
      { text: "6 Location Groups", value: 6 },
      { text: " 9 Location Groups", value: 9 },
      { text: "12 Location Groups", value: 12 }
    ],
    categoryGroups: [
      { text: "Pest", value: "Pest" },
      { text: "Weed", value: "Weed" },
      { text: "Disease", value: "Disease" }
    ],
    categorySelect: null,
    gpsSelect: null,
    filtered: [],
    showPanel: false,
    gpsSwitch: false,
    monthSwitch: false,
    monthSelect: null,
    defaultMonth: "",
    storage: Storage,
    observations: [],
    months: [
      {
        abbreviation: "Jan",
        name: "January"
      },
      {
        abbreviation: "Feb",
        name: "February"
      },
      {
        abbreviation: "Mar",
        name: "March"
      },
      {
        abbreviation: "Apr",
        name: "April"
      },
      {
        abbreviation: "May",
        name: "May"
      },
      {
        abbreviation: "Jun",
        name: "June"
      },
      {
        abbreviation: "Jul",
        name: "July"
      },
      {
        abbreviation: "Aug",
        name: "August"
      },
      {
        abbreviation: "Sep",
        name: "September"
      },
      {
        abbreviation: "Oct",
        name: "October"
      },
      {
        abbreviation: "Nov",
        name: "November"
      },
      {
        abbreviation: "Dec",
        name: "December"
      }
    ]
  })
};
</script>
<style>
.upper {
  text-transform: uppercase;
}

.Weed {
  background-color: green !important;
  color: white !important;
}
.Disease {
  background-color: purple !important;
  color: white !important;
}
.Pest {
  background-color: red !important;
  color: white !important;
}
</style>
