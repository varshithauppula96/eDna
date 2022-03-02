<template>
    <div>
		<!--  Input boxes corresponding to slider values -->
        <input class="input-box" autofocus v-model="value.min" placeholder="min">
        to
        <input class="input-box" autofocus v-model="value.max" placeholder="max">
		<!-- Sliders & same place. Acts as one slider with 2 sliding handles -->
        <section class="latlon-slider">
            <input  v-model="value.min" @input="collision" type="range" :min="init_min" :max="init_max" step="0.0001">
            <input  v-model="value.max" @input="collision" type="range" :min="init_min" :max="init_max" step="0.0001">
        </section>
    </div>
</template>

<script>
// import { log } from 'util';

/*
	This component was used in Search.vue to allow the user to use the double-handle slider as well as the input boxes to select the latitude and longitude ranges.
	This component is not currently used, but could be useful later.
*/
export default {
	name: "Sliders",
	props: {
		init_min: Number,
		init_max: Number,
		value: Object,
	},
	methods: {
		// Manage a collision of the 2 slider input handles
		collision: function () {
			this.$emit("newVal",this.value)
			if( parseFloat(this.value.min) >= parseFloat(this.value.max) ) {
				this.value.min = this.value.max
				return
			}
			if( parseFloat(this.value.max) <= parseFloat(this.value.min) ) {
				this.value.max = this.value.min
				return
			}
		},
	},
}
</script>

<style>
.latlon-slider {
	display: grid;
	margin-bottom: 1rem;
}
.latlon-slider input {
	grid-row: 1;
	grid-column: 1;
	pointer-events: none;
	background: none transparent;
}
.latlon-slider input::-webkit-slider-thumb {
	pointer-events: all;
	position: relative;
	z-index: 1;
}
.latlon-slider input::-moz-range-thumb {
	pointer-events: all;
	position: relative;
	z-index: 1;
}
.input-box {
	width: 80px;
	margin-bottom: 1rem;
}
</style>