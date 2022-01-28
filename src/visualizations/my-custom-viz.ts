import { Looker, VisualizationDefinition } from '../common/types';
import { handleErrors } from '../common/utils';
import * as anichart from 'anichart';

declare var looker: Looker;

interface WhateverNameYouWantVisualization extends VisualizationDefinition {
    elementRef?: HTMLDivElement,
}

const vis: WhateverNameYouWantVisualization = {
    id: 'some id', // id/label not required, but nice for testing and keeping manifests in sync
    label: 'Some Name',
    options: {
        speed: {
            type: 'number',
            label: 'Speed',
            display: 'range',
            default: 10,
            max: 30,
            min: 1,
            step: 1

        }
    },
    // Set up the initial state of the visualization
    create(element, config) {
        this.elementRef = element;
    },
    // Render in response to the data or settings changing
    update(data, element, config, queryResponse) {
        const ctrler = document.getElementById("anichart-ctrl")
        if(ctrler !== null){
            ctrler.remove()
        }
        element.innerHTML = ""
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
        const values_len = Object.keys(data[0]).length
        const date_key = Object.keys(data[0]).filter(s=>s.endsWith("_date"))[0]
        const value_key = Object.keys(data[0]).filter(s=>s!==date_key && !s.endsWith("_date"))[0]
        let label_key = ""
        let image_url_key = ""
        if (values_len >= 3) {
            label_key = Object.keys(data[0]).filter(s=>s!==date_key && !s.endsWith("_date"))[1]
        }
        if (values_len >= 4) {
            image_url_key = Object.keys(data[0]).filter(s=>s!==date_key && !s.endsWith("_date"))[2]
        }

        const date_len = data.length
        const imagetags = {}
        const unpivotted_data_dates = {}
        let all_dates = []
        for(let line of data){
            const date = line[date_key]["value"]
            for(let elem_key in line[value_key]){
                const id = label_key===""?elem_key:line[label_key][elem_key]["value"]
                const value = line[value_key][elem_key]["value"]
                if (value !== null){
                    unpivotted_data.push({
                        id, date, value
                    })
                    if (! (id in unpivotted_data_dates)) unpivotted_data_dates[id] = []
                    unpivotted_data_dates[id].push(date)
                    all_dates.push(date)
                }
                if (image_url_key !== "" && line[image_url_key][elem_key]["value"] !== null)
                {
                    imagetags[id] = line[image_url_key][elem_key]["value"]
                }
            }
        }

        // fill 0
        all_dates = Array.from(new Set(all_dates)).sort();
        for(let k of Object.keys(unpivotted_data_dates)){
            let k_dates = unpivotted_data_dates[k].sort()
            let k_dates_min_idx = all_dates.indexOf(k_dates[0])
            let k_dates_max_idx = all_dates.indexOf(k_dates[k_dates.length - 1])
            for(let k_dates_idx = k_dates_min_idx + 1; k_dates_idx < k_dates_max_idx - 1; k_dates_idx++) {
                if (!(k_dates.includes(all_dates[k_dates_idx]))) {
                    unpivotted_data.push({
                        id: k, date: all_dates[k_dates_idx], value: 0
                    })
                }
            }
        }

        anichart.recourse.data.set("data", unpivotted_data)
        console.log(imagetags)
        for (let imagetag_key in imagetags){
            anichart.recourse.loadImage(
                imagetags[imagetag_key],
                imagetag_key
            );
        }
        
        console.log(unpivotted_data)
        
        if (errors) { // errors === true means no errors
            const canvas = document.createElement("canvas")
            canvas.width = element.clientWidth
            canvas.height = element.clientHeight
            let stage = new anichart.Stage(canvas);
            element.appendChild(canvas)
            stage.options.fps = 30;
            stage.options.sec = date_len * (10/config["speed"]) + 4;
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
