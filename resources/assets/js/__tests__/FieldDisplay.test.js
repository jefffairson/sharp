import Vue from 'vue';
import * as fieldContainerModule from '../components/form/FieldContainer.vue';

import { MockInjections, mockSFC, unmockSFC } from "./utils";

import FieldDisplay from '../components/form/field-display/FieldDisplay';
import * as conditions from '../components/form/field-display/conditions';

describe('field-display', () => {
    Vue.component('sharp-field-display',FieldDisplay);

    let computeSelectCondition = ()=>{}, computeCondition = ()=>{};


    beforeAll(() => {
        mockSFC(fieldContainerModule);
    });

    afterAll(()=> {
        unmockSFC(fieldContainerModule);
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app">
                <sharp-field-display
                    field-key="title"
                    :context-data="contextData"
                    :context-fields="contextFields"
                    :update-visibility="updateVisibility"
                    config-identifier="title"
                    error-identifier="title"
                >
                </sharp-field-display> 
            </div>
        `;

        computeSelectCondition = conditions.helpers.computeSelectCondition = jest.fn(conditions.helpers.computeSelectCondition);
        computeCondition = conditions.computeCondition = jest.fn(conditions.computeCondition);
    });

    test('can mount field display', async () => {
        await createVm({
            propsData: {
                contextData: {
                    title: null
                },
                contextFields: {
                    title: { type: 'text' }
                }
            }
        });

        expect(document.body.innerHTML).toMatchSnapshot();
    });

    describe('conditional diplay', ()=>{

        test('check', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        check: true
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [{ key:'check', values: true }]
                            }
                        },
                        check: { type: 'check' }
                    }
                }
            });


            expect(vm.$children).toHaveLength(1);
            expect(computeCondition)
                .toHaveBeenCalledWith(vm.contextFields, vm.contextData, vm.contextFields.title.conditionalDisplay);

            Vue.set(vm.contextData,'check',false);
            await Vue.nextTick();

            expect(vm.$children).toHaveLength(0);
        });

        test('multiple select (unique values)', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        select: [ 2, 3 ]
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'select', values: 2 }
                                ]
                            }
                        },
                        select: {
                            type: 'select',
                            multiple: true
                        }
                    }
                }
            });

            expect(computeSelectCondition).toHaveBeenCalledWith({ condValues: 2, fieldValue: [2,3], isSingleSelect: false });
            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData, 'select', [ 3 ]);
            await Vue.nextTick();

            expect(computeSelectCondition).toHaveBeenCalledWith({ condValues: 2, fieldValue: [3], isSingleSelect: false });
            expect(vm.$children).toHaveLength(0);
        });

        test('multiple select (multiple values)', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        select: [ 2, 3 ]
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'select', values: [ 2, 6 ] }
                                ]
                            }
                        },
                        select: {
                            type: 'select',
                            multiple: true
                        }
                    }
                }
            });

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: [2,6], fieldValue: [2,3], isSingleSelect: false });
            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData, 'select', [ 4, 5 ]);
            await Vue.nextTick();


            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: [2,6], fieldValue: [4,5], isSingleSelect: false });
            expect(vm.$children).toHaveLength(0);
        });

        test('single select (unique values)', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        select: 4
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'select', values: 4 }
                                ]
                            }
                        },
                        select: {
                            type: 'select'
                        }
                    }
                }
            });

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: 4, fieldValue: 4, isSingleSelect: true });
            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData, 'select', 5);
            await Vue.nextTick();

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: 4, fieldValue: 5, isSingleSelect: true });
            expect(vm.$children).toHaveLength(0);
        });

        test('single select (multiple values)', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        select: 4
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'select', values: [4, 8] }
                                ]
                            }
                        },
                        select: {
                            type: 'select'
                        }
                    }
                }
            });

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: [4,8], fieldValue: 4, isSingleSelect: true });
            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData, 'select', 3);
            await Vue.nextTick();

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: [4,8], fieldValue: 3, isSingleSelect: true });
            expect(vm.$children).toHaveLength(0);
        });

        test('multiple select (negative)', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        select: [ 4, 6 ]
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'select', values: '!5' }
                                ]
                            }
                        },
                        select: {
                            type: 'select',
                            multiple: true
                        }
                    }
                }
            });

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: '!5', fieldValue: [4,6], isSingleSelect: false });
            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData, 'select', [ 5, 7 ]);
            await Vue.nextTick();

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: '!5', fieldValue: [5,7], isSingleSelect: false });
            expect(vm.$children).toHaveLength(0);
        });

        test('single select (negative)', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        select: 3
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'select', values: '!6' }
                                ]
                            }
                        },
                        select: {
                            type: 'select'
                        }
                    }
                }
            });

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: '!6', fieldValue: 3, isSingleSelect: true });
            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData, 'select', 6);
            await Vue.nextTick();

            expect(computeSelectCondition).toHaveBeenLastCalledWith({ condValues: '!6', fieldValue: 6, isSingleSelect: true });
            expect(vm.$children).toHaveLength(0);
        });

        test('or operator', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        check1: true,
                        check2: true,
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'or',
                                fields: [
                                    { key:'check1', values: true },
                                    { key:'check2', values: true }
                                ]
                            }
                        },
                        check1: { type: 'check' },
                        check2: { type: 'check' }
                    }
                }
            });

            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData,'check1',false);
            await Vue.nextTick();

            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData,'check2',false);
            await Vue.nextTick();

            expect(vm.$children).toHaveLength(0);
        });

        test('and operator', async () => {
            let vm = await createVm({
                propsData: {
                    contextData: {
                        title: null,
                        check1: true,
                        check2: true,
                    },
                    contextFields: {
                        title: {
                            type: 'text',
                            conditionalDisplay: {
                                operator: 'and',
                                fields: [
                                    { key:'check1', values: true },
                                    { key:'check2', values: true }
                                ]
                            }
                        },
                        check1: { type: 'check' },
                        check2: { type: 'check' }
                    }
                }
            });

            expect(vm.$children).toHaveLength(1);

            Vue.set(vm.contextData,'check1',false);
            await Vue.nextTick();
            
            expect(vm.$children).toHaveLength(0);
        });
    });

    test('expose appropriate props', async () => {
        let vm = await createVm({
            propsData: {
                contextData: {
                    title: 'myTitle',
                },
                contextFields: {
                    title: {
                        type: 'text',
                        placeholder: 'Title',
                        label: 'Super title label',
                        helpMessage: 'Super help message'
                    }
                }
            }
        });

        let { $children:[$fieldContainer] } = vm;

        expect($fieldContainer.$options.propsData).toMatchObject({
            fieldKey: 'title',
            fieldType: 'text',
            fieldProps: {
                type: 'text',
                placeholder: 'Title'
            },
            value: 'myTitle',
            label: 'Super title label',
            helpMessage: 'Super help message'
        });
    });

    test('call update visibility', async () => {
        let updateVisibility = jest.fn();
        let vm = await createVm({
            propsData: {
                contextData: {
                    title: 'myTitle',
                    check: true,
                },
                contextFields: {
                    title: {
                        type: 'text',
                        conditionalDisplay: {
                            operator: 'or',
                            fields: [{ key:'check', values: true }]
                        }
                    },
                    check: { type: 'check' }
                }
            },
            methods: {
                updateVisibility
            }
        });

        expect(updateVisibility).toHaveBeenCalledTimes(1);
        expect(updateVisibility).toHaveBeenLastCalledWith('title',true);

        Vue.set(vm.contextData, 'check', false);

        await Vue.nextTick();

        expect(updateVisibility).toHaveBeenCalledTimes(2);
        expect(updateVisibility).toHaveBeenLastCalledWith('title',false);
    })
});

async function createVm(customOptions={}) {

    const vm = new Vue({
        el: '#app',
        mixins: [MockInjections, customOptions],

        props:['contextData', 'contextFields'],
        
        'extends': {
            data:()=>({
                value: null
            }),
            methods:{
                updateVisibility: ()=>{}
            }
        }
    });

    await Vue.nextTick();

    return vm;
}