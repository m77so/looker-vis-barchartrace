import { Looker, VisualizationDefinition } from '../common/types';
import { handleErrors } from '../common/utils';
import './my-custom-viz.scss'
import * as anichart from 'anichart';

declare var looker: Looker;

interface WhateverNameYouWantVisualization extends VisualizationDefinition {
    elementRef?: HTMLDivElement,
}

const vis: WhateverNameYouWantVisualization = {
    id: 'some id', // id/label not required, but nice for testing and keeping manifests in sync
    label: 'Some Name',
    options: {
        title: {
            type: 'string',
            label: 'Title',
            display: 'text',
            default: 'Default Text'
        }
    },
    // Set up the initial state of the visualization
    create(element, config) {
        this.elementRef = element;
    },
    // Render in response to the data or settings changing
    update(data, element, config, queryResponse) {
        console.log( 'data', data );
        console.log( 'element', element );
        console.log( 'config', config );
        console.log( 'queryResponse', queryResponse );
        const errors = handleErrors(this, queryResponse, {
            // min_pivots: 0,
            // max_pivots: 0,
            // min_dimensions: 1,
            // max_dimensions: 1,
            // min_measures: 1,
            // max_measures: 1
        });
        const unpivotted_data = []
        const date_key = Object.keys(data[0]).filter(s=>s.endsWith("date_date"))[0]
        const value_key = Object.keys(data[0]).filter(s=>s!==date_key && !s.endsWith("date_date"))[0]
        for(let line of data){
            const date = line[date_key]["value"]
            for(let elem_key in line[value_key]){
                const id = elem_key
                const value = line[value_key][elem_key]["value"]
                if (value !== null){
                    unpivotted_data.push({
                        id, date, value
                    })
                }
            }
        }
        anichart.recourse.data.set("data", unpivotted_data)
        console.log(unpivotted_data)
        if (errors) { // errors === true means no errors
            element.innerHTML = 'Hello Looker!';
            let stage = new anichart.Stage();
            stage.options.fps = 30;
            stage.options.sec = 15;
            // Create a chart that loads data named "data" by default
            let chart = new anichart.BarChart();
            // Mount the chart
            stage.addChild(chart);
            new anichart.Controller(stage).render();
            stage.play()
        }
    }
};

looker.plugins.visualizations.add(vis);
