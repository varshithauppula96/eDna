<template>
    <div class = "site-chart">
        <!-- Plot bar chart of top species by site -->
        <zingchart v-if="combined_data.length > 0"
            :data=chartConfig
            @complete="chartRendered">
        </zingchart>
    </div>
</template>

<script>
import zingchartVue from 'zingchart-vue'
// import { log } from 'util';

export default {
    name: "SpeciesBarchart",
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
            sample_id2metadata: {},
        }
    },
    methods: {
        // emit event to let the Results component know that the bar chart is done rendering
        chartRendered: function () {
            this.$emit("chartRendered",'barchart')
        }
    },
    computed: {
        // Creates the query string used to get the data to fill the bar chart
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
            var data_pts = []
            if( this.data_series.length > 0 ) {
                // get sample ids from the data series returned by the backend
                var samples = Object.keys(this.data_series[0]).slice(1,Object.values(this.data_series).length)
                
                // create list of x-axis labels (strings containing project name, site name, and sample date)
                for(var i=0; i<samples.length; i++) {
                    var el = samples[i]
                    var sample_obj = this.sample_id2metadata[el.slice(4,el.length)]
                    xlabels.push(sample_obj.project + ',<br>' + sample_obj.site + ',<br>' + sample_obj.date.toString().slice(0,10))
                }                
           
                // list of data points to plot. Each data point is a JSON object with values: list of counts, and text: species name
                data_pts = this.data_series.map( obj => 
                    new Object( { 
                        values: Object.values(obj).slice(1,Object.values(obj).length), // get the species counts from data_series, ignore first value (sample_id)
                        text: Object.values(obj)[0], // species name
                    })
                )
            }

            // zingchart configuration object to be returned
            return {
                graphset: [{
                    type: 'bar',
                    title: {
                        text: `Relative Abundance of Top Species in Most Recent Samples`, // up to 100 currently returned by backend
                        adjustLayout: true,
                        paddingBottom: '2rem',
                        fontSize: '24px'
                    },
                    plot: {
                        stacked: true,
                        stackType: "100%",
                        tooltip: {
                            text: '%t: %v %',
                        },
                    },
                    plotarea: {
                        margin: 'dynamic'
                    },
                    scaleX: {
                        values: xlabels,
                        label: {
                            text:'Sample'
                        },
                        guide: {
                            visible: false
                        },
                        item: {
                            fontAngle: -60,
                        },
                    },
                    scaleY: {
                        minValue:0,
                        maxValue:100,
                        label: {
                            text: 'Relative Abundance (%)'
                        },
                        zooming: true,
                    },
                    zoom: {
                        alpha: 0.75,
                        backgroundColor: '#e5e8ea',
                        borderColor: '#009',
                        borderWidth: '2px',
                        preserveZoom: true
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
                    series: data_pts // list of data series to be plotted
                }]
            }
        },
    },
    watch: {
        // When the combined_data prop changes, send a get request to get the formatted data to fill the barchart
        combined_data: async function() {
            await this.$http.get( this.base_path + 'barchart?' + this.qstring ).then( res => {
                this.data_series = res.body.data // list of JSON objects with keys= sample_id,{species names}
                this.sample_id2metadata = res.body.samples // dictonary mapping sample_id to metadata JSON object (contains project, site, date)
            })
        }
    },
}
</script>

<style>
.site-chart {
    width: 100%;
    margin-bottom: 1rem;
    margin-top: 1rem;
}
</style>