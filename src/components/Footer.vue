<template>
    <div class="footer">
        <div class="container">
            <br><!-- <img src="/img/logo/bigelow_white.svg" height="60px" style="margin-bottom:15px; max-width:75%;" class="float-right">--><!-- <img src="/img/logo/Henry_Bigelow_White_nocircle_left.svg" height="200px">-->
            <div class="row" style="align-items: center;">
                <div class="col-sm-4 col-sm-push-4 center" >
                    <a href='https://www.bigelow.org' target="_blank"><img src="@/assets/BigelowLogo.svg" height="200px" style="margin-bottom:5px; max-width:95%;"></a>
                </div>
                <div class="col-sm-4 center footer-address col-sm-pull-4">
                    <div class="visible-xs"><br><br></div>60 Bigelow Drive <br>East Boothbay, Maine 04544 <br><span class="info-phone">Tel: (207) 315-2567</span> <span class="info-phone"> <br>Fax: (207) 315-2329</span><br class="hidden-xs"><a href="mailto:info@bigelow.org" class="footer-link">info@bigelow.org</a><br><br class="visible-xs">
                </div>
                <div style="font-size:0.8em;margin-top:5px;" class="visible-sm visible-md">{{copyright}}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            copyright: '© 2020 Bigelow Laboratory for Ocean Sciences, Arthur Makumbi and Riley Karp'
        }
    },
}
</script>

<style scoped>
.footer{
    bottom: 0;
    width: 100%;
    height: 8rem;
    background-color: #a7c8db;


    color: black;
    float: left;
    overflow: hidden;
}
.container{
    margin-left: 5%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
