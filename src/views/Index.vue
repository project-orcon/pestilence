<template>
  <v-container>
    <v-row align="start">
      <v-col cols="12"
        ><div
          class="headline font-weight-bold white--text"
          style="padding:15px;background-color:rgba(0,0,0,0.14)"
        >
          Records
        </div>
      </v-col>
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header
              ><div>
                <v-icon left>filter_list</v-icon>Filter
              </div></v-expansion-panel-header
            >
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
      <v-col cols="12"
        ><v-btn
          class="float-right"
          :block="$vuetify.breakpoint.xsOnly"
          outlined
          color="white"
          style="height:48px;background-color:rgba(0,0,0,0.14)"
          @click="$router.push('/create')"
        >
          <v-icon left>note_add</v-icon>Add new record</v-btn
        >
      </v-col>

      <v-col cols="12" md="4" v-for="item in paginated" :key="item.id">
        <v-card style="max-width:300px;margin:0 auto">
          <v-img :src="item.url" height="250" eager>
            <div style="text-align:right;margin-right:8px;margin-top:8px">
              <v-chip
                label
                :class="item.category"
                style="min-width:120px;opacity:0.85"
              >
                <v-icon left color="white">mdi-label</v-icon
                >{{ item.category }}</v-chip
              >
            </div>
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="green lighten-4"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <div class="text-right ma-2 caption grey--text">
            {{ new Date(item.timestamp).toDateString() }}
          </div>
          <v-card-text class="subtitle-1" style="margin-top:-15px">
            <div class="upper subtitle-2  indigo--text">Location</div>
            <v-text-field
              readonly
              :value="item.location"
              style="margin-top:-10px"
            ></v-text-field>
            <div class="upper subtitle-2 indigo--text">Notes</div>
            <v-textarea
              readonly
              :value="item.notes"
              style="margin-top:-10px"
              rows="3"
            ></v-textarea>
            <v-chip label v-if="item.group">{{ item.group }}</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-pagination
      v-model="page"
      :length="pages"
      color="rgba(0,0,0,0.14)"
      style="margin-top:50px;"
    ></v-pagination>
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
        //set filtered as pagination is based on filtered items
        return this.observations;
      })
      .then(obs => IDB.saveIndexedDB(obs))
      .then(
        //load all the data that has been stored locally in indexeddb
      ()=> { return IDB.getAllRecords();}
      )
      .then(x => {
        this.observations = x.map(y => this.addLocalImageURL(y));
        this.filtered = this.observations;
      })
      .catch(e => {
        console.log("error",e)
        console.log("Not ONLINE");
        IDB.getAllRecords().then(x => {
            this.observations = x.map(y => this.addLocalImageURL(y)
            );
            this.filtered = this.observations;
        });
      });
  },
  methods: {
    addLocalImageURL(y) {
      if (y.url == null) {
        if (y.file instanceof Blob) {
          let reader = new FileReader();
          reader.addEventListener(
            "load",
            function() {
              y.url = reader.result;
            },
            false
          );

          let imgURL = reader.readAsDataURL(y.file);
        }
      }
      return y;
    },
    checkIfOnline() {
      return DB.collection("items").get({ source: "server" });
    },
    monthsGroup: function() {
      return this.months.map(x => {
        return { text: x.name, value: x.name };
      });
    },
    clusterize(items, numClusters) {
      //test sort into 2 clusters
      clusterMaker.k(numClusters);

      //number of iterations (higher number gives more time to converge), defaults to 1000
      clusterMaker.iterations(750);

      //data from which to identify clusters, defaults to []

      clusterMaker.data(
        items.map(x => [
          parseFloat(x.location.split(",")[0]),
          parseFloat(x.location.split(",")[1])
        ])
      );
      console.log("clyserte are", clusterMaker.clusters());
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
      console.log("items are", items);
      let clusters = this.clusterize(items, numClusters);
      let locationFiltered = [];

      clusters.forEach((x, index) => {
        let uniquePoints = [];

        //remove duplicate points
        let dict = {};
        x.points.forEach(point => {
          if (!dict[point[0] + point[1]]) {
            dict[point[0] + point[1]] = true;
            uniquePoints.push(point);
          }
        });
        console.log("uniquepoints are", uniquePoints);

        uniquePoints.forEach(point => {
          let coords = point[0] + "," + point[1];
          console.log("looking at", coords);
          let values = items.filter(z => {
            if (
              z.location.split(",")[0] == point[0] &&
              z.location.split(",")[1] == point[1]
            ) {
              console.log("passed at", coords);
              return true;
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

      if (this.categorySelect != null) {
        filtered = filtered.filter(x => x.category === this.categorySelect);
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

      this.filtered = filtered;
      this.page = 1;
      console.log("filtered is ", filtered);

      return filtered;
    }
  },
  computed: {
    pages: function() {
      //calculate whether to add 1 or not to items/pages
      let b = this.filtered.length % this.itemsPerPage == 0 ? 0 : 1;
      let plength = this.filtered.length / this.itemsPerPage + b;
      return parseInt(plength);
    },
    paginated: function() {
      let startIndex = (this.page - 1) * this.itemsPerPage;
      console.log(startIndex);
      let endIndex = startIndex + this.itemsPerPage;
      console.log(endIndex);
      return this.filtered.slice(startIndex, endIndex);
    }
  },
  data: () => ({
    page: 1,
    itemsPerPage: 6,
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
