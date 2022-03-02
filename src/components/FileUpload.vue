<template>
    <div class = "file">
        <form @submit.prevent="onSubmit" enctype="multipart/form-data">
    </div>
</template>

<script>
// register components locally
// import { log } from 'util'

/*
    This component was started to add the ability to upload a csv file from the web app and add the data to the db.
    The idea wasn't explored much due to the wide range of formats of files that scientists use to organize their data.
*/
export default {
    name: 'FileUpload',
	// components: {
    // },
    props: {
        base_path: String
    },
	data () {
		return {
            file: "",
            message: "",
		}
	},
	methods: {
		onSelect: function() {
            const file = this.$refs.file.files[0]
            this.file = file
        },
        onSubmit: async function() {
            const formData = new FormData()
            formData.append('file',this.file)
            try {
                /// post(formData)
            }
            catch(err) {
                log(err)
                this.message = "Something went wrong"
            }
        }
	},
}
</script>

<style scoped>
</style>
