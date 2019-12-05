<template>
  <div id="Filter">
    <v-row align-content="top">
      <v-col cols="12" class="subtitle-2">
        <v-switch
          v-model="switch1"
          @change="switchChanged()"
          :label="label"
        ></v-switch>
        <v-select
          outlined
          v-show="switch1"
          menu-props="auto"
          :value="value"
          :items="selectOptions"
          @change="$emit('change')"
          @input="$emit('input', $event)"
        ></v-select>
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  methods: {
    switchChanged() {
      //clear value when switch turned off.
      if (this.switch1 == false) {
        this.$emit("input", null);
      } else {
        if (this.def != null) {
          this.$emit("input", this.def);
        } else {
          {
            this.$emit("input", this.selectOptions[0].value);
          }
        }
      }

      this.$emit("change");
    }
  },
  data: () => ({
    switch1: false
  }),
  props: {
    def: String, //default value for select
    value: [String, Number],
    label: String,
    selectOptions: Array
  }
};
</script>
<style scoped></style>
