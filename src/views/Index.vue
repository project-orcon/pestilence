<template >
  <v-container>
    <v-row>
      <v-expansion-panels flat>
        <v-expansion-panel>
          <v-expansion-panel-header>Filters</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-divider></v-divider>
            <v-container fluid>
              <v-row align-content="top">
                <v-col cols="12" class="subtitle-2">
                  <v-switch v-model="monthSwitch" @change="filter()" label="Filter by Month"></v-switch>
                  <v-select
                    outlined
                    v-show="monthSwitch"
                    menu-props="auto"
                    v-model="selected"
                    :items="months.map(x => x.name)"
                    @change="filter()"
                  ></v-select>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row>
                <v-col cols="12" class="subtitle-2">
                  <v-switch v-model="gpsSwitch" @change="filter()" label="Filter by location"></v-switch>
                  <v-select
                    outlined
                    v-show="gpsSwitch"
                    menu-props="auto"
                    v-model="gpsSelect"
                    :items="groups"
                    @change="filter()"
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-col cols="12" md="4" v-for="item in paginated" :key="item.image">
        <v-card outlined>
          <v-img :src="item.image" />
          <v-card-text class="subtitle-1">
            <div class="upper title mt-5 indigo--text">Category</div>
            <v-chip
              label
              :class="item.category+' mt-3'"
              style="width:100%;text-align:center"
            >{{item.category}}</v-chip>
            <div class="upper title mt-5 indigo--text">Location</div>
            <v-text-field disabled :value="item.location"></v-text-field>
            <div class="upper title mt-5 indigo--text">Notes</div>
            <v-textarea disabled :value="item.notes"></v-textarea>
            <v-chip label v-if="item.group">{{item.group}}</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
       <v-pagination
      v-model="page"
      :length="pages"
    ></v-pagination>
  </v-container>
</template>
<script>
import { App } from "@/firebase.js";
import "firebase/storage";
export const Storage = App.storage();
export const DB = App.firestore();

const clusterMaker = require("clusters");

export default {
  mounted() {
    this.selected = this.currentMonth();
    let vueInstance = this;
    DB.collection("items")
      .get()
      .then(querySnapshot => {
        this.observations = querySnapshot.docs.map(doc => doc.data());
        // do something with documents

        Promise.all(
          this.observations.map(x => Storage.ref(x.image).getDownloadURL())
        ).then(result => {
          result.forEach((y, index) => (this.observations[index].image = y));
        });

        this.filter();
      });
  },
  methods: {
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

      if (this.monthSwitch === true) {
        filtered = this.observations.filter(
          x =>
            this.convertMonth(new Date(x.timestamp).getMonth()) ===
            this.selected
        );
      } else {
        filtered = this.observations;
      }

      if (this.gpsSwitch === true) {
        filtered = this.filterByLocation(filtered, this.gpsSelect);
      }
      else {
          filtered.map(x => {x.group= null; return x;})
      }

      this.filtered = filtered;
      console.log("filtered is ", filtered);

      //reset pagination values
        this.pages =parseInt(filtered.length/this.itemsPerPage)+1;
        this.page=1;
      return filtered;
    }
  },
  computed: {
      paginated: function(){
          let startIndex=(this.page-1)*this.itemsPerPage;
          console.log(startIndex)
          let endIndex=startIndex + this.itemsPerPage;
          console.log(endIndex)
          return this.filtered.slice(startIndex,endIndex)
      }
  },
  data: () => ({
      page:1,
      pages:1,
      itemsPerPage:3,
    groups: [
      { text: "3 Location Groups", value: 3 },
      { text: "6 Location Groups", value: 6 },
      { text: " 9 Location Groups", value: 9 },
      { text: "12 Location Groups", value: 12 }
    ],
    gpsSelect: 3,
    filtered: [],
    showPanel: false,
    gpsSwitch: false,
    monthSwitch: false,
    selected: "",
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