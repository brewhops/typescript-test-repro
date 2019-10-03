import TankMonitoring from '@/components/tank-monitoring.vue';
import BulkEntry from '@/components/bulk-entry.vue';
import { shallowMount } from '@vue/test-utils';

describe('src/components/tank-monitoring.vue', () => {
  let state: any;
  let wrapper: any;

  beforeAll(() => {
    state = {
      tanks: [{
        action_name: 'Primary Fermentation',
        action_id: 1,
        batch_name: '3748-2856',
        pressure: 12,
        temperature: 32,
        recipe_id: 1,
        beer_name: 'TRI',
        id: 1,
        name: 'tank 1',
        status: 'brewing',
        classname: 'primary-fermentation',
      }],
    };
  });

  beforeEach(() => {
    wrapper = shallowMount(TankMonitoring, {
      mocks: {
        $http: {
          get: (url: string) => Promise.resolve({ data: state.tanks }),
        },
      },
      stubs: {
        BulkEntry,
      },
    });
  });

  it('renders tank monitoring component with active batch', () => {
    expect(wrapper.vm as any).toMatchSnapshot();
  });

  it('renders tank monitoring component without active batch', () => {
    state = {
      tanks: [{
        name: 'tank 1',
        status: 'brewing',
        classname: 'primary-fermentation',
      }],
    };
    expect(wrapper.vm as any).toMatchSnapshot();
  });
});
