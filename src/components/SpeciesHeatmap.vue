<template>
<!-- Plot heatmap of top species for each sample -->
    <div class="heatmap-chart" v-if="new_chart">
        <zingchart v-if="chartHeight > 0"
            :data="chartConfig"
            :height="chartHeight"
            @complete="chartRendered">
        </zingchart>
    <!-- TO DO: add note (exact wording from Nick) saying same species name may appear more than once due to how data the is processed -->
    </div>
</template>

<script>
import zingchartVue from 'zingchart-vue'
import { log } from 'util';

export default {
    name: "SpeciesHeatmap",
    components: {
		'zingchart': zingchartVue
    },
    props: {
        combined_data: Array, // data from search results
        base_path: String,
    },
    data () {
        return {
            data_series: [],
            species_id2name: {},
            chartHeight: 0,
            new_chart: false
        }
    },
    methods: {
        // emit event to let the Results component know that the heatmap is done rendering
        chartRendered: function () {
            this.$emit("chartRendered",'heatmap')
        }
    },
    computed: {
        // Creates the query string used to get the data to fill the heatmap
        qstring: function () {
            var samples = [... new Set( this.combined_data.map(obj=>obj.sample_id) )]
            var species = [... new Set( this.combined_data.map(obj=>obj.species_id) )]
            var types = [... new Set( this.combined_data.map(obj=>obj.type) )]

            if(samples.length > 0) {
                
                samples = "samples=" + samples.join('&samples=')
                species = "&species=" + species.join('&species=')
                types = "&type=" + types.join('&type=')
                return samples+species+types
            }
            else {
                return ""
            }
        },
        // configure the data & chart configurations
        chartConfig:  function () {
            var xlabels = []
            var ylabels = []
            var data_pts = []
            var allVals = []
            var absMax = 100
            var absMin = 0
            if( this.data_series.length > 0 ) {
                // get species names from the keys of the JSON objects in data_series. ignore the first 4 keys (sample_id, date, site, project)
                // x-axis labels = species names , y-axis labels = samples (string with project, site, date)
                xlabels = Object.keys(this.data_series[0]).slice(4,Object.keys(this.data_series[0]).length)
                xlabels = xlabels.map(el => this.species_id2name[ el.slice(2,el.length) ] )
                ylabels = this.data_series.map(obj => obj.project + ',<br>' + obj.site + ',<br>' + obj.date.toString().slice(0,10))
                // log(ylabels)
                log(ylabels.length)
                // list of data points to plot. Each data point is a JSON object with values: list of counts, & sets legend item to be not visible
                data_pts = this.data_series.map( obj => 
                    new Object( { 
                        values: Object.values(obj).slice(4,Object.values(obj).length), // get the species counts from data_series, ignore first value (sample_id)
                        legendItem: {visible:false},
                    })
                )
                // get minimum and maximum count value of all data point values
                allVals = [].concat.apply([],data_pts.map(obj=>obj.values))
                absMax = Math.max(...allVals)
                absMin = Math.min(...allVals)
            }

            // create color rules to show continuous color scale (blue=lowest count, yellow=highest count)
            var rules = []
            for(var i=absMin; i<=absMax; i++) {
                var cur_rule = `%node-value >= ${i} && %node-value < ${i+1}`
                var normVal = (i-absMin)/(absMax-absMin)
                rules.push({rule: cur_rule, backgroundColor: `rgb(${Math.round(255*normVal)},${Math.round(255*normVal)},${Math.round(255*(1-normVal))})`})
            }
            // log(rules)

            // zingchart configuration object to be returned
            return {
                graphset: [{
                    type: 'piano',
                    title: {
                        text: 'Relative Species Abundance',
                        adjustLayout: true,
                        paddingBottom: '2rem',
                        backgroundColor: 'none',
                        fontColor: '#000000',
                        fontSize: '24px'
                    },
                    legend: {
                        align: 'left',
                        backgroundColor1: 'rgb(0,0,255)',
                        backgroundColor2: 'rgb(255,255,0)',
                        height: '50rem',
                        width: '10rem',
                        borderWidth: 'none',
                        footer: {
                            backgroundColor: 'none',
                            borderColor: 'none',
                            text: `${absMax}%`,
                            fontColor: '#000000',
                            fontSize: '10rem',
                            textAlign: 'center'
                        },
                        header: {
                            backgroundColor: 'none',
                            borderColor: 'none',
                            text: `${absMin}%`,
                            fontColor: '#000000',
                            fontSize: '10rem',
                            textAlign: 'center'
                        },
                        shadow: false,
                        toggleAction: 'none',
                        verticalAlign: 'top',
                    },
                    plot: {
                        tooltip: {
                            text: `Project, Site, Date: %y<br>Species: %k<br>Relative Abundance: %v%`,
                            fontColor: 'white',
                            textAlign: 'left'
                        },
                        aspect: 'none',
                        rules: rules,
                    },
                    plotarea: {
                        margin: 'dynamic',
                        height: Math.max(this.chartHeight - 300,0)
                    },
                    scaleX: {
                        values: xlabels,
                        maxItems: xlabels.length,
                        label: {
                            text:'Species'
                        },
                        guide: {
                            visible: false
                        },
                        item: {
                            borderColor: 'none',
                            fontAngle: -90,
                            maxChars: 30
                        },
                        tooltip: {
                            text: "%v"
                        },
                        itemsOverlap: true,
                        lineWidth: '0px',
                        maxLabels: 100, // show 100 species at most
                        tick: {
                            visible: true
                        },
                        minorTick: {
                            visibile: true
                        },
                        zooming: true,
                        zoomSnap: true
                    },
                    scaleY: {
                        values: ylabels,
                        maxItems: ylabels.length,
                        label: {
                            text:'Sample'
                        },
                        tooltip: {
                            text: "%v"
                        },
                        guide: {
                            visible: false
                        },
                        minorTick: {
                            visibile: true,
                            lineWidth: '1px',
                        },
                        itemsOverlap: true,
                        lineWidth: '0px',
                        mirrored: true,
                        tick: {
                            visible: true
                        },
                        // zooming: true
                    },
                    zoom: {
                        alpha: 0.75,
                        backgroundColor: '#e5e8ea',
                        borderColor: '#009',
                        borderWidth: '2px',
                    },
                    scrollX: {
                        bar: {
                            alpha: .5,
                            backgroundColor: '#01579B',
                            borderRadius: '3px'
                        },
                        handle: {
                            backgroundColor: '#01579B',
                            borderRadius: '5px',
                            borderTop: 'none',
                            borderRight: 'none',
                            borderBottom: 'none',
                            borderLeft: 'none'
                        }
                    },
                    scrollY: {
                        bar: {
                            alpha: .5,
                            backgroundColor: '#01579B',
                            borderRadius: '3px'
                        },
                        handle: {
                            backgroundColor: '#01579B',
                            borderRadius: '5px',
                            borderTop: 'none',
                            borderRight: 'none',
                            borderBottom: 'none',
                            borderLeft: 'none'
                        }
                    },
                    series: data_pts, // list of data series to be plotted
                }]
            }
        },
    },
    watch: {
        // When the combined_data prop changes, send a get request to get the formatted data to fill the heatmap
        combined_data: async function() {
            this.new_chart = false
            if(this.combined_data.length > 0) {
                await this.$http.get( this.base_path + 'heatmap?' + this.qstring ).then( res => {
                    this.data_series = res.body.data // list of JSON objects with keys= sample_id,{species names}
                    this.species_id2name = res.body.species // KSON object mapping species_id to species_name
                    this.chartHeight = this.data_series.length > 0 ? (300+this.data_series.length*50)  : 0 // adjust chart hegit based on number of rows returned
                    this.new_chart = true
                })
            }
            else {
                this.data_series = []
                this.species_id2name = {}
                this.chartHeight = 0
            }
        }
    }
}
</script>

<style>
.heatmap-chart {
    width: 100%;
    margin-bottom: 1rem;
    margin-top: 1rem;
}
#zingchart-vue-0-license-text {
  display: none;
}
</style>