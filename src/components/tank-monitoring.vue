<template>
  <div>
    <div id="tankInfo" v-if="tanks">
      <h2>Tank Info</h2>
      <div id="tankContents" v-if="tanks.length > 0">
        <a v-on:click="showTankInfo(tank.id)" v-for="tank in tanks" v-bind:key="tank.id">
          <div class="tank" v-bind:class="tank.classname">
            <div class="tank-name">
              {{ tank.name }}
            </div>
            <table>
              <tr>
                <td v-if="tank.beer_name">{{ tank.beer_name }}</td>
                <td v-if="tank.pressure">{{ tank.pressure }} psi</td>
                <td v-else>{{ tank.status }}</td>
              </tr>
              <tr>
                <td v-if="tank.batch_name">{{ tank.batch_name }}</td>
                <td v-if="tank.temperature">{{ tank.temperature }}ºF</td>
              </tr>
            </table>

            <div v-if="tank.action_name && tank.action_name !== 'No Action'" class="tank-action">
              {{ tank.action_name }}
            </div>
          </div>
        </a>
      </div>
      <div v-else class="text-center">
        No tanks exist yet
      </div>
      <bulk-entry v-bind:tanks="tanks" />
    </div>
    <div v-else class="center">
      <loader></loader>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import router from '@/router';
import loader from './loader.vue';
import BulkEntry from '@/components/bulk-entry.vue';
import Cookie from 'js-cookie';
import moment from 'moment';
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
} from '@/types/index';

interface ITank {
  action_name?: string;
  action_id?: number | string;
  batch_name?: any;
  pressure?: number;
  temperature?: number;
  recipe_id?: number;
  beer_name?: string;
  id?: number;
  name?: string;
  status?: string;
  classname?: string;
}

interface ITankMonitoringState {
  tanks?: ITank[];
  file?: any;
  goal_time?: string;
}

export default Vue.extend({
  name: 'tank-monitoring',
  components: {
    loader,
    BulkEntry,
  },
  data(): ITankMonitoringState {
    return {
      tanks: undefined,
      goal_time: undefined,
    };
  },
  async beforeMount() {
    if (!Cookie.getJSON('loggedIn')) {
      router.push('/');
    }

    this.file = null;

    try {
      const response = await this.$http.get(`${process.env.VUE_APP_API}/tanks/monitoring/`);
      this.tanks = response.data as ITank[];
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error(err);
    }
  },
  methods: {
    showTankInfo(tankID: any) {
      // send us over to the tank info page and set the id on the url
      // to be the tankID that we clicked on.
      router.push({ name: 'tank-info', params: { tankID } });
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

#tankInfo {
  grid-area: info;

  h2 {
    text-align: center;
  }

  #tankContents {
    display: grid;
    justify-content: center;
    grid-gap: 10px;
    color: white;
    font-weight: 300;
    margin: 5px;
    grid-auto-rows: minmax(128px, max-content);

    +greater-than(desktop) {
      grid-template-columns: repeat(4, 250px);
    }

    +between(laptop, desktop) {
      grid-template-columns: repeat(4, 220px);
    }

    +less-than(laptop) {
      grid-template-columns: repeat(3, 200px);
    }

    +less-than(tablet) {
      grid-template-columns: repeat(2, 200px);
    }

    +less-than(mobile) {
      grid-template-columns: repeat(1, 250px);
    }

    a {
      text-decoration: none;
      color: white;
    }

    .tank {
      background: Teal;
      width: 100%;
      height: 100%;
      min-height 128px;

      table {
        width: 100%;
        padding-left: 5px;
        padding-right: 7px;

        td:nth-child(2) {
          text-align: right;
        }

        td {
          padding: 3px;
        }
      }

      .tank-name {
        padding: 8px;
        font-size: 20px;
      }

      .tank-action {
        padding-left: 10px;
        padding-right: 10px;
        margin-top: 10px;
        margin-bottom: 8px;
        text-align: center;
      }
    }

    .primary-fermentation {
      background: White;
      color: Black;
      border: 1px solid Black;
    }

    .primary-adjunct-add {
      background: rgb(255, 255, 255);
      color: Black;
      border: 1px solid Black;
    }

    .free-rise {
      background: rgb(247, 203, 175);
      color: Black;
    }

    .cap {
      background: rgb(255, 253, 56);
      color: Black;
    }

    .adjunct-add  {
      background: rgb(148, 206, 88);
      color: Black;
    }

    .exception {
      background: Red;
      color: White;
    }

    .wait-for-diacetyl {
      background: rgb(253, 191, 45);
      color: Black;
    }

    .crashed {
      background: rgb(29, 177, 237);
      color: Black;
    }

    .yeast-pull {
      background: rgb(127, 95, 17);
      color: rgb(253, 251, 55);
    }

    .no-action {
      background: Teal
      color: White
    }

    .broken {
      background: Red;
    }

    .busy {
      background: #c9c200;
    }
  }
}
</style>
