<template>
  <div>
    <h4 class="text-center">Input Alcolyzer Data</h4>
    <form class="dataEntry" @submit.prevent="submit">
      <div class="col-3 inputGroup">
        <input type="file" placeholder="Upload From CSV" @change="readAlcolyzerData" />
      </div>
      <div class="col-3 inputGroup">
        <datepicker placeholder="Date: Last Batch" v-model="goal_time"></datepicker>
      </div>
      <button class="col-3">Submit</button>
    </form>
    <h5 class="text-center">{{ update_text }}</h5>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import router from '@/router';
import loader from './loader.vue';

import Cookie from 'js-cookie';
import moment from 'moment';
import Datepicker from 'vuejs-datepicker';
import { orderBy } from 'natural-orderby';

import {
  Action,
  Batch,
  Recipe,
  Tank,
  Task,
  Version,
  BrewhopsCookie,
  BatchUpdateOrCreate,
  KeyAccessor,
} from '@/types/index';
import { HttpResponse } from 'vue-resource/types/vue_resource';

// tslint:disable: max-func-body-length no-any

interface ITank {
  action?: string;
  action_id?: number | string;
  batch?: any;
  pressure?: number;
  temperature?: number;
  recipe_id?: number;
  airplane_code?: string;
  id?: number;
  name?: string;
  status?: string;
}

// tslint:disable:no-any no-console
interface IDataEntryState extends KeyAccessor {
  pH: string;
  ABV: string;
  SG: string;
  id: string;
  temp: string;
  time: string;
  update?: any;
}

interface IBulkEntryState {
  update_text: string;
  file?: any;
  goal_time?: string | number;
}

export default Vue.extend({
  name: 'bulk-entry',
  props: ['tanks'],
  components: {
    loader,
    Datepicker,
  },
  data(): IBulkEntryState {
    return {
      update_text: '',
      goal_time: undefined,
      // contents of a square is tankName, pressure, recipeName, temperature, batchNumber, Status
    };
  },
  methods: {
    async readAlcolyzerData(event: any) {
      event.preventDefault();
      const file = event.target.files[0];

      if (
        file.type !== 'text/csv' &&
        file.type !== 'text/plain' &&
        file.type !== 'application/vnd.ms-excel'
      ) {
        alert('File type not supported');
      } else {
        this.file = file;
      }
    },
    async updateTanks(readings: IDataEntryState[]) {
      const cookie: BrewhopsCookie = Cookie.getJSON('loggedIn');

      if (!this.tanks) { return; }

      const condition = (tank: Tank) =>
        readings.filter((r) => r.id === tank.name.slice(1) && tank.status !== 'available')[0];

      const batchesToUpdate = this.tanks
        .filter((tank: any) => condition(tank))
        .map((tank: any) => {
          const reading = condition(tank);
          return { tank, batch: tank.batch, reading };
        });

      const values = await Promise.all(
        batchesToUpdate.map(({ batch, reading }: any) =>
          (async () => {
            const requestObject: BatchUpdateOrCreate = {
              recipe_id: Number(batch.recipe_id),
              tank_id: Number(batch.tank_id),
              batch_id: Number(batch.id),
              volume: Number(batch.volume),
              bright: Number(batch.bright),
              generation: Number(batch.generation),
              name: batch.name,
              ph: Number(reading.pH),
              abv: Number(reading.ABV),
              pressure: Number(0),
              temperature: Number(reading.temp),
              sg: Number(reading.SG),
              measured_on: moment(this.goal_time).toISOString(),
              update_user: Number(cookie.id),
            };
            return await this.$http.post(
              `${process.env.VUE_APP_API}/batches/update/`,
              requestObject,
            );
          })(),
        ),
      );

      if (values) {
        const success = <string>values.reduce((sum, val, i) => {
          return `${sum}${batchesToUpdate[i].tank.name}, `;
        }, '');
        this.update_text = `tanks updated: ${success.slice(0, -2)}`;
      } else {
        this.update_text = 'updates failed';
      }
    },

    // tslint:disable-next-line:max-func-body-length
    async submit(event: any) {
      let readings: IDataEntryState[] = [];
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result) {
          let strs = (reader.result as string).split('\n');

          // Map of property key to possible columns
          const columnDict: KeyAccessor = {
            pH: ['pH'],
            ABV: ['Alcohol (% v/v)'],
            SG: ['Apparent Specific Gravity'],
            id: ['Sample Name'],
            temp: ['Temperature'],
            time: ['Date']
          };

          // Produces an object that maps possible columns to object property key
          const propertyLookup = Object.keys(columnDict)
            .map((key) =>
              columnDict[key].map((e: any) => {
                return { key: e, value: key };
              })
            )
            .reduce((map, objArr) => {
              return objArr.reduce((map: any, obj: any) => {
                map[obj.key] = obj.value;
                return map;
              }, map);
            }, {});

          // Map headers to property values
          const headers = strs[4]
            .split(',')
            .map((e) => (e in propertyLookup ? propertyLookup[e] : undefined));

          const parsedReadings = strs.slice(5).map((entry: string) => {
            const emptyLine: IDataEntryState = {
              pH: '',
              ABV: '',
              SG: '',
              id: '',
              temp: '',
              time: ''
            };

            const line = entry
              .split(',')
              .reduce((line: IDataEntryState, value: string, idx: number) => {
                if (headers[idx]) {
                  line[headers[idx]] = value;
                }
                return line;
              }, emptyLine);

            line.time = moment(line.time).format('MM/DD/YYYY');
            return line;
          });

          // if date picker is filled use it, otherwise most recent time
          const lastTime = Math.max.apply(
            Math,
            parsedReadings.map((o: any) => {
              return o.time;
            }),
          );
          this.goal_time = this.goal_time ? moment(this.goal_time).format('MM/DD/YYYY') : lastTime;

          // Set the readings
          readings = parsedReadings.filter((entry) => entry.time === this.goal_time);
        }

        if (readings.length !== 0) { this.updateTanks(readings); }
      };

      if (this.file) { reader.readAsText(this.file); }
      else { alert('No file specifed'); }
    },
  },
});
</script>

<style lang="stylus" scoped>
@import '../styles/breakpoints';

.center
  display flex
  width 100vw
  height 90vh
  justify-content center
  align-items center

.text-center
  text-align center

.dataEntry {
  padding 15px
  grid-area entry
  display flex
  justify-content center
  align-items center
}
</style>
