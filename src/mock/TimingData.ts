export const TimingData =
`<!DOCTYPE html>
<!-- saved from url=(0284)https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&valid=1,2&date_from=&date_to= -->
<html><head lang="en"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    

    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">

    <!-- Include Twitter Bootstrap and jQuery: -->

    <link rel="stylesheet" href="./Laps_files/bootstrap.min.css">
    <link rel="stylesheet" href="./Laps_files/bootstrap-theme.min.css">
    <link rel="stylesheet" href="./Laps_files/bootstrap-multiselect.css" type="text/css">
    <link rel="stylesheet" href="./Laps_files/bootstrap-datepicker.css" type="text/css">
    <link rel="stylesheet" href="./Laps_files/sticky-footer.css" type="text/css">
    <link rel="stylesheet" href="./Laps_files/fileinput.min.css" media="all" type="text/css">

    <script src="./Laps_files/jquery.min.js.descarga"></script>
    <script src="./Laps_files/bootstrap.min.js.descarga"></script>
    <script type="text/javascript" src="./Laps_files/bootstrap-multiselect.js.descarga"></script>
    <script type="text/javascript" src="./Laps_files/bootstrap-datepicker.js.descarga"></script>
    <script src="./Laps_files/fileinput.min.js.descarga" type="text/javascript"></script>

    <title>Laps</title>
    <link rel="shortcut icon" type="image/x-icon" href="https://es2.assettohosting.com:10018/stracker/img/brand_icon_small_wob.png">

    <style>

        .aids {
            width:16px;
            height:16px;
            background:none left top no-repeat;
            display:inline-block;
            background-size:cover;
            margin-right:-3px;
            margin-left:-3px;
            margin-top:-3px;
            margin-bottom:-3px;
        }

        .aids.autoclutch.off { background-image:url(/img/icn_stability_off.png) }
        .aids.autoclutch.on  { background-image:url(/img/icn_stability_on.png) }
        .aids.autoclutch.unknown { background-image:url(/img/icn_stability_unknown.png) }

        .aids.abs.off { background-image:url(/img/icn_abs_off.png) }
        .aids.abs.factory { background-image:url(/img/icn_abs_factory.png) }
        .aids.abs.on { background-image:url(/img/icn_abs_on.png) }
        .aids.abs.unknown { background-image:url(/img/icn_abs_unknown.png) }

        .aids.autobrake.off { background-image:url(/img/icn_automaticbraking_off.png) }
        .aids.autobrake.on { background-image:url(/img/icn_automaticbraking_on.png) }
        .aids.autobrake.unknown { background-image:url(/img/icn_automaticbraking_unknown.png) }

        .aids.autogearbox.off { background-image:url(/img/icn_gearbox_off.png) }
        .aids.autogearbox.on { background-image:url(/img/icn_gearbox_on.png) }
        .aids.autogearbox.unknown { background-image:url(/img/icn_gearbox_unknown.png) }

        .aids.blip.off { background-image:url(/img/icn_heeltoe_off.png) }
        .aids.blip.on { background-image:url(/img/icn_heeltoe_on.png) }
        .aids.blip.unknown { background-image:url(/img/icn_heeltoe_unknown.png) }

        .aids.idealline.off { background-image:url(/img/icn_idealline_off.png) }
        .aids.idealline.on { background-image:url(/img/icn_idealline_on.png) }
        .aids.idealline.unknown { background-image:url(/img/icn_idealline_unknown.png) }

        .aids.tc.off { background-image:url(/img/icn_tractioncontrol_off.png) }
        .aids.tc.factory { background-image:url(/img/icn_tractioncontrol_factory.png) }
        .aids.tc.on { background-image:url(/img/icn_tractioncontrol_on.png) }
        .aids.tc.unknown { background-image:url(/img/icn_tractioncontrol_unknown.png) }

        .aids.damage.off { background-image:url(/img/icn_stability_off.png) }
        .aids.damage.on { background-image:url(/img/icn_stability_on.png) }
        .aids.damage.unknown { background-image:url(/img/icn_stability_unknown.png) }

        .bestLap { color:#ff00ff }
        .bestSector { color:#00c000 }

        .multiselect {
            text-align: left;
        }
        .multiselect b.caret {
            position: absolute;
            top: 14px;
            right: 8px;
        }
        .multiselect-container>li>a>label>input[type=checkbox]{margin-bottom:0px}

        .table-condensed>thead>tr>th,
        .table-condensed>tbody>tr>th,
        .table-condensed>tfoot>tr>th,
        .table-condensed>thead>tr>td,
        .table-condensed>tbody>tr>td,
        .table-condensed>tfoot>tr>td {
            padding: 2px;
        }
        .clickableRow td {
            cursor: pointer;
            cursor: hand;
        }
        .clickableRow td.noclick {
            cursor: auto;
        }
        .table tbody>tr>td.vert-align {
            vertical-align: middle;
        }
        .table thead>tr>th.vert-align {
            vertical-align: middle;
        }
        .navbar-fixed-bottom {
            z-index: 900;
        }
    </style>
    <link rel="stylesheet" href="./Laps_files/custom.css" media="all" type="text/css">
<style>[_nghost-ng-c2697620354]{font-family:Open Sans,sans-serif;color:#121212}</style></head>
<body>


<nav class="navbar navbar-inverse" role="navigation">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="https://es2.assettohosting.com:10018/stracker/"><img class="img-responsive" alt="stracker" src="./Laps_files/brand_icon_large_wob.png"></a>
    </div>
    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav">
        <li class="active"><a href="https://es2.assettohosting.com:10018/stracker/lapstat">Lap Times</a></li>
        <li><a href="https://es2.assettohosting.com:10018/stracker/sessionstat">Sessions</a></li>
        <li><a href="https://es2.assettohosting.com:10018/stracker/players">Drivers</a></li>
        <li><a href="https://es2.assettohosting.com:10018/stracker/championship">Championships</a></li>
        <li><a href="https://es2.assettohosting.com:10018/stracker/statistics">Statistics</a></li>
        <li><a href="https://es2.assettohosting.com:10018/stracker/livemap">Live Map</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <li><a href="https://es2.assettohosting.com:10018/stracker/admin/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=">Admin Area</a></li>
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>




  
<script>
function toggleCollapse(e, self) {
    var $e = $(e);
    var $collapse = $e.closest('.collapse-group').find('.collapse');
    var $self = $(self);
    if( $($self[0]).text() == "+" )
    {
        $($self[0]).text("-");
        $collapse.collapse('show');
    } else
    {
        $($self[0]).text("+");
        $collapse.collapse('hide');
    }
}

function ms_to_string(ms)
{
    res = '';
    for(var i=0; i < ms.length; i++) {
        if (ms.options[i].selected) {
            if (res != '') {
                res = res + ",";
            }
            res = res + ms.options[i].value
        }
    }
    return res;
}

function ms_count(ms)
{
    res = 0;
    for(var i=0; i < ms.length; i++) {
        if (ms.options[i].selected) {
            res = res + 1;
        }
    }
    return res;
}

function applySelections() {
    var track = document.getElementById("trackname").value;
    var ranking = document.getElementById("ranking").value;
    var ms_cars = document.getElementById("cars");
    var ms_valid = document.getElementById("valid");
    var ms_tyres = document.getElementById("tyres");
    var ms_servers = document.getElementById("servers");
    var ms_groups = document.getElementById("groups");
    var server = "";
    var valid = ms_to_string(ms_valid);
    var cars = ms_to_string(ms_cars);
    var date_from = document.getElementById("dateStart").value;
    var date_to = document.getElementById("dateStop").value;
    var tyres = ms_to_string(ms_tyres);
    var groups = ms_to_string(ms_groups);
    if (ms_count(ms_tyres) < 12 ) {
        tyres = '&tyres='+tyres;
    } else
    {
        tyres = '';
    }
    if (ms_count(ms_groups) > 0) {
        groups = '&groups='+groups;
    } else
    {
        groups = '';
    }
    if (ranking != '0')
    {
        ranking = '&ranking='+ranking;
    } else
    {
        ranking = '';
    }
    window.location='lapstat?track='+track+'&cars='+cars+'&valid='+valid+'&date_from='+date_from+'&date_to='+date_to+tyres+server+groups+ranking;
}
</script>

<div class="container">
  <div class="page-header">
    <div class="row">
        <div class="col-md-6">
            <img src="./Laps_files/banner.png" title="Logo Track" class="ACimg">
        </div>
        <div class="col-md-6">
            <form class="form-horizontal collapse-group" role="form">
                <!-- *********** standard filters ************* -->
                <div class="form-group">
                    <label for="trackname" class="col-md-2 control-label">Track</label>
                    <div class="col-md-10">
                        <select id="trackname" name="trackname" class="multiselect form-control" style="display: none;">
                            <option value="acf_portimao-layout_wec_2023">acf_portimao-layout_wec_2023</option>
                            <option value="acu_barcelona-city-normal">acu_barcelona-city-normal</option>
                            <option value="ahvenisto_rc-pit">ahvenisto_rc-pit</option>
                            <option value="bugatti">bugatti</option>
                            <option value="circuito_ricardo_tormo">circuito_ricardo_tormo</option>
                            <option value="ddm_gts_tsukuba-full">ddm_gts_tsukuba-full</option>
                            <option value="fn_imola-imola_f1_2024">fn_imola-imola_f1_2024</option>
                            <option value="fn_redbullring-austria_f1_2024">fn_redbullring-austria_f1_2024</option>
                            <option value="fn_valencia-gp">fn_valencia-gp</option>
                            <option value="jarama_2009-2022">jarama_2009-2022</option>
                            <option value="jerez-layout_gp">jerez-layout_gp</option>
                            <option value="js_castle_combe-standard">js_castle_combe-standard</option>
                            <option value="ks_nordschleife-nordschleife_24hours_2022">ks_nordschleife-nordschleife_24hours_2022</option>
                            <option value="ks_nurburgring-layout_gp_a_osrw">ks_nurburgring-layout_gp_a_osrw</option>
                            <option value="ks_silverstone-silverstone_f1_2022">ks_silverstone-silverstone_f1_2022</option>
                            <option value="ks_silverstone-silverstone_f1_2024">ks_silverstone-silverstone_f1_2024</option>
                            <option value="lilski_road_america">lilski_road_america</option>
                            <option value="lilski_watkins_glen-short_classic">lilski_watkins_glen-short_classic</option>
                            <option value="manfeild-full">manfeild-full</option>
                            <option value="monza-monza_osrw">monza-monza_osrw</option>
                            <option value="okayama-circuit_gp">okayama-circuit_gp</option>
                            <option value="pittrace-full">pittrace-full</option>
                            <option value="pittrace-north">pittrace-north</option>
                            <option value="rmi_sydney_motorsport_park-gardner">rmi_sydney_motorsport_park-gardner</option>
                            <option value="rt_bathurst">rt_bathurst</option>
                            <option selected="" value="rt_daytona-sportscar">rt_daytona-sportscar</option>
                            <option value="rt_fuji_speedway-layout_wec_2023">rt_fuji_speedway-layout_wec_2023</option>
                            <option value="rt_macau">rt_macau</option>
                            <option value="rt_misano">rt_misano</option>
                            <option value="rt_sebring-wec2023">rt_sebring-wec2023</option>
                            <option value="rt_sonoma-nascar">rt_sonoma-nascar</option>
                            <option value="rt_sonoma-wtcc">rt_sonoma-wtcc</option>
                            <option value="rx_shibuya">rx_shibuya</option>
                            <option value="spa-layout_wec_2023">spa-layout_wec_2023</option>
                            <option value="sportsland-sugo-sugo">sportsland-sugo-sugo</option>
                            <option value="sx_lemans-24h_2023">sx_lemans-24h_2023</option>
                            <option value="sx_lemans-chicaneperf">sx_lemans-chicaneperf</option>
                            <option value="t78_hockenheimring-gp_osrw">t78_hockenheimring-gp_osrw</option>
                            <option value="tmm_autodrom_most">tmm_autodrom_most</option>
                            <option value="vir-full course">vir-full course</option>
                            <option value="vn_motorland_aragon_complex-motogp">vn_motorland_aragon_complex-motogp</option>
                            <option value="zandvoort2023-2023">zandvoort2023-2023</option>
                            <option value="zw_nogaro">zw_nogaro</option>
                        </select><div class="btn-group" style="width: 100%;"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="rt_daytona-sportscar" style="width: 100%;">rt_daytona-sportscar <b class="caret"></b></button><ul class="multiselect-container dropdown-menu" style="max-height: 350px; overflow: hidden auto;"><li class="multiselect-item filter" value="0"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder="Search"></div></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="acf_portimao-layout_wec_2023"> acf_portimao-layout_wec_2023</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="acu_barcelona-city-normal"> acu_barcelona-city-normal</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="ahvenisto_rc-pit"> ahvenisto_rc-pit</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="bugatti"> bugatti</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="circuito_ricardo_tormo"> circuito_ricardo_tormo</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="ddm_gts_tsukuba-full"> ddm_gts_tsukuba-full</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="fn_imola-imola_f1_2024"> fn_imola-imola_f1_2024</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="fn_redbullring-austria_f1_2024"> fn_redbullring-austria_f1_2024</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="fn_valencia-gp"> fn_valencia-gp</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="jarama_2009-2022"> jarama_2009-2022</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="jerez-layout_gp"> jerez-layout_gp</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="js_castle_combe-standard"> js_castle_combe-standard</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="ks_nordschleife-nordschleife_24hours_2022"> ks_nordschleife-nordschleife_24hours_2022</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="ks_nurburgring-layout_gp_a_osrw"> ks_nurburgring-layout_gp_a_osrw</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="ks_silverstone-silverstone_f1_2022"> ks_silverstone-silverstone_f1_2022</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="ks_silverstone-silverstone_f1_2024"> ks_silverstone-silverstone_f1_2024</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="lilski_road_america"> lilski_road_america</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="lilski_watkins_glen-short_classic"> lilski_watkins_glen-short_classic</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="manfeild-full"> manfeild-full</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="monza-monza_osrw"> monza-monza_osrw</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="okayama-circuit_gp"> okayama-circuit_gp</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="pittrace-full"> pittrace-full</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="pittrace-north"> pittrace-north</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rmi_sydney_motorsport_park-gardner"> rmi_sydney_motorsport_park-gardner</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_bathurst"> rt_bathurst</label></a></li><li class="active"><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_daytona-sportscar"> rt_daytona-sportscar</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_fuji_speedway-layout_wec_2023"> rt_fuji_speedway-layout_wec_2023</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_macau"> rt_macau</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_misano"> rt_misano</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_sebring-wec2023"> rt_sebring-wec2023</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_sonoma-nascar"> rt_sonoma-nascar</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rt_sonoma-wtcc"> rt_sonoma-wtcc</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="rx_shibuya"> rx_shibuya</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="spa-layout_wec_2023"> spa-layout_wec_2023</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="sportsland-sugo-sugo"> sportsland-sugo-sugo</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="sx_lemans-24h_2023"> sx_lemans-24h_2023</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="sx_lemans-chicaneperf"> sx_lemans-chicaneperf</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="t78_hockenheimring-gp_osrw"> t78_hockenheimring-gp_osrw</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="tmm_autodrom_most"> tmm_autodrom_most</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="vir-full course"> vir-full course</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="vn_motorland_aragon_complex-motogp"> vn_motorland_aragon_complex-motogp</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="zandvoort2023-2023"> zandvoort2023-2023</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="zw_nogaro"> zw_nogaro</label></a></li></ul></div>
                    </div>
                    <label for="cars" class="col-md-2 control-label">Cars</label>
                    <div class="col-md-10">
                        <select id="cars" name="cars" class="form-control multiselect" multiple="multiple" style="display: none;">
                            <option value="2023_Le_Mans_Nascar_Camry">2023_Le_Mans_Nascar_Camry</option>
                            <option value="2023_Le_Mans_Nascar_Mustang">2023_Le_Mans_Nascar_Mustang</option>
                            <option value="2023_le_mans_nascar_camry">2023_le_mans_nascar_camry</option>
                            <option value="2023_le_mans_nascar_mustang">2023_le_mans_nascar_mustang</option>
                            <option value="Le_Mans_Nascar_Camaro">Le_Mans_Nascar_Camaro</option>
                            <option selected="" value="TRR_GT3_porsche_992_gt3_r">TRR_GT3_porsche_992_gt3_r</option>
                            <option value="TRR_LMH_aston_martin_valkyrie_amr-lmh">TRR_LMH_aston_martin_valkyrie_amr-lmh</option>
                            <option value="TRR_LMH_peugeot_9x8-24">TRR_LMH_peugeot_9x8-24</option>
                            <option selected="" value="alpine_europa_cup">alpine_europa_cup</option>
                            <option value="gue_bmw_m3_e46_gtr">gue_bmw_m3_e46_gtr</option>
                            <option value="gue_techart_gt_street_r">gue_techart_gt_street_r</option>
                            <option value="htrs_bmw_m3_e36_sp">htrs_bmw_m3_e36_sp</option>
                            <option value="htrs_renault_megane_rs_sp">htrs_renault_megane_rs_sp</option>
                            <option value="hyundai_i20n_hellspec">hyundai_i20n_hellspec</option>
                            <option value="jtc_honda_civic_eg_gra">jtc_honda_civic_eg_gra</option>
                            <option value="ks_audi_dtm_2020">ks_audi_dtm_2020</option>
                            <option value="ks_bmw_dtm_2020">ks_bmw_dtm_2020</option>
                            <option value="le_mans_nascar_camaro">le_mans_nascar_camaro</option>
                            <option value="lm_trophy_truck">lm_trophy_truck</option>
                            <option value="renault_twingo_rs_twincup2">renault_twingo_rs_twincup2</option>
                            <option value="tatuus_ft_60">tatuus_ft_60</option>
                            <option value="trr_acura_arx-06">trr_acura_arx-06</option>
                            <option selected="" value="trr_amg_evo_gt3">trr_amg_evo_gt3</option>
                            <option selected="" value="trr_amr_vantage_gt3_evo">trr_amr_vantage_gt3_evo</option>
                            <option value="trr_bmw_m_hybrid_V8">trr_bmw_m_hybrid_V8</option>
                            <option value="trr_bmw_m_hybrid_v8">trr_bmw_m_hybrid_v8</option>
                            <option value="trr_cadillac_v-series.r">trr_cadillac_v-series.r</option>
                            <option selected="" value="trr_ferrari_296_gt3">trr_ferrari_296_gt3</option>
                            <option value="trr_ferrrari_499p">trr_ferrrari_499p</option>
                            <option selected="" value="trr_ford_mustang_gt3">trr_ford_mustang_gt3</option>
                            <option value="trr_gt3_nissan_gtr_gt3">trr_gt3_nissan_gtr_gt3</option>
                            <option selected="" value="trr_gt3_porsche_992_gt3_r">trr_gt3_porsche_992_gt3_r</option>
                            <option value="trr_ir18r">trr_ir18r</option>
                            <option selected="" value="trr_lexus_rcf_gt3">trr_lexus_rcf_gt3</option>
                            <option value="trr_lmh_aston_martin_valkyrie_amr-lmh">trr_lmh_aston_martin_valkyrie_amr-lmh</option>
                            <option value="trr_lmh_peugeot_9x8-24">trr_lmh_peugeot_9x8-24</option>
                            <option value="trr_peugeot_9x8">trr_peugeot_9x8</option>
                            <option value="trr_porsche_963">trr_porsche_963</option>
                            <option value="trr_toyota_gr010">trr_toyota_gr010</option>
                            <option value="zizh_estonia_25">zizh_estonia_25</option>
                        </select><div class="btn-group" style="width: 100%;"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="TRR_GT3_porsche_992_gt3_r, alpine_europa_cup, trr_amg_evo_gt3, trr_amr_vantage_gt3_evo, trr_ferrari_296_gt3, trr_ford_mustang_gt3, trr_gt3_porsche_992_gt3_r, trr_lexus_rcf_gt3" style="width: 100%;">8 selected <b class="caret"></b></button><ul class="multiselect-container dropdown-menu" style="max-height: 350px; overflow: hidden auto;"><li class="multiselect-item filter" value="0"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder="Search"></div></li><li class="multiselect-item multiselect-all"><a href="javascript:void(0);" class="multiselect-all"><label class="checkbox"><input type="checkbox" value="multiselect-all">  Select all</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="2023_Le_Mans_Nascar_Camry"> 2023_Le_Mans_Nascar_Camry</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="2023_Le_Mans_Nascar_Mustang"> 2023_Le_Mans_Nascar_Mustang</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="2023_le_mans_nascar_camry"> 2023_le_mans_nascar_camry</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="2023_le_mans_nascar_mustang"> 2023_le_mans_nascar_mustang</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="Le_Mans_Nascar_Camaro"> Le_Mans_Nascar_Camaro</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="TRR_GT3_porsche_992_gt3_r"> TRR_GT3_porsche_992_gt3_r</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="TRR_LMH_aston_martin_valkyrie_amr-lmh"> TRR_LMH_aston_martin_valkyrie_amr-lmh</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="TRR_LMH_peugeot_9x8-24"> TRR_LMH_peugeot_9x8-24</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="alpine_europa_cup"> alpine_europa_cup</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="gue_bmw_m3_e46_gtr"> gue_bmw_m3_e46_gtr</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="gue_techart_gt_street_r"> gue_techart_gt_street_r</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="htrs_bmw_m3_e36_sp"> htrs_bmw_m3_e36_sp</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="htrs_renault_megane_rs_sp"> htrs_renault_megane_rs_sp</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="hyundai_i20n_hellspec"> hyundai_i20n_hellspec</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="jtc_honda_civic_eg_gra"> jtc_honda_civic_eg_gra</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="ks_audi_dtm_2020"> ks_audi_dtm_2020</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="ks_bmw_dtm_2020"> ks_bmw_dtm_2020</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="le_mans_nascar_camaro"> le_mans_nascar_camaro</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="lm_trophy_truck"> lm_trophy_truck</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="renault_twingo_rs_twincup2"> renault_twingo_rs_twincup2</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="tatuus_ft_60"> tatuus_ft_60</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_acura_arx-06"> trr_acura_arx-06</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_amg_evo_gt3"> trr_amg_evo_gt3</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_amr_vantage_gt3_evo"> trr_amr_vantage_gt3_evo</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_bmw_m_hybrid_V8"> trr_bmw_m_hybrid_V8</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_bmw_m_hybrid_v8"> trr_bmw_m_hybrid_v8</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_cadillac_v-series.r"> trr_cadillac_v-series.r</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_ferrari_296_gt3"> trr_ferrari_296_gt3</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_ferrrari_499p"> trr_ferrrari_499p</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_ford_mustang_gt3"> trr_ford_mustang_gt3</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_gt3_nissan_gtr_gt3"> trr_gt3_nissan_gtr_gt3</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_gt3_porsche_992_gt3_r"> trr_gt3_porsche_992_gt3_r</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_ir18r"> trr_ir18r</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_lexus_rcf_gt3"> trr_lexus_rcf_gt3</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_lmh_aston_martin_valkyrie_amr-lmh"> trr_lmh_aston_martin_valkyrie_amr-lmh</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_lmh_peugeot_9x8-24"> trr_lmh_peugeot_9x8-24</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_peugeot_9x8"> trr_peugeot_9x8</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_porsche_963"> trr_porsche_963</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="trr_toyota_gr010"> trr_toyota_gr010</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="zizh_estonia_25"> zizh_estonia_25</label></a></li></ul></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="row">
        <!-- *********** detailed filters ************* -->
        <div class="col-md-12 collapse-group" id="filterCollapse">
            <div class="col-md-6">
                <form class="form-horizontal" role="form">
                    <div class="form-group collapse ">
                        <div class="row">
                            <label for="valid" class="col-md-2 control-label">Valid</label>
                            <div class="col-md-10">
                                <select id="valid" name="valid" class="form-control multiselect" multiple="multiple" style="display: none;">
                                    <option selected="" value="1">valid</option>
                                    <option selected="" value="2">unknown</option>
                                    <option value="0">invalid</option>
                                </select><div class="btn-group" style="width: 100%;"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="valid, unknown" style="width: 100%;">valid, unknown <b class="caret"></b></button><ul class="multiselect-container dropdown-menu" style="max-height: 350px; overflow: hidden auto;"><li class="multiselect-item filter" value="0"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder="Search"></div></li><li class="multiselect-item multiselect-all"><a href="javascript:void(0);" class="multiselect-all"><label class="checkbox"><input type="checkbox" value="multiselect-all">  Select all</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="1"> valid</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="2"> unknown</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="0"> invalid</label></a></li></ul></div>
                            </div>
                        </div>
                        <div class="row">
                            <label for="tyres" class="col-md-2 control-label">Tyres</label>
                            <div class="col-md-10">
                                <select id="tyres" name="tyres" class="form-control multiselect" multiple="multiple" style="display: none;">
                                    <option selected="" value="(SS)">Slicks Supersoft</option>
                                    <option selected="" value="(S)">Slicks Soft</option>
                                    <option selected="" value="(M)">Slicks Medium</option>
                                    <option selected="" value="(H)">Slicks Hard</option>
                                    <option selected="" value="(SH)">Slicks Superhard</option>
                                    <option selected="" value="(ST)">Street</option>
                                    <option selected="" value="(SV)">Street Vintage</option>
                                    <option selected="" value="(SM)">Semislicks</option>
                                    <option selected="" value="(HR)">Hypercar Road</option>
                                    <option selected="" value="(I)">Intermediate</option>
                                    <option selected="" value="(V)">Vintage</option>
                                    <option selected="" value="(E)">Eco</option>
                                </select><div class="btn-group" style="width: 100%;"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="Slicks Supersoft, Slicks Soft, Slicks Medium, Slicks Hard, Slicks Superhard, Street, Street Vintage, Semislicks, Hypercar Road, Intermediate, Vintage, Eco" style="width: 100%;">12 selected <b class="caret"></b></button><ul class="multiselect-container dropdown-menu" style="max-height: 350px; overflow: hidden auto;"><li class="multiselect-item filter" value="0"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder="Search"></div></li><li class="multiselect-item multiselect-all active"><a href="javascript:void(0);" class="multiselect-all"><label class="checkbox"><input type="checkbox" value="multiselect-all">  Select all</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(SS)"> Slicks Supersoft</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(S)"> Slicks Soft</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(M)"> Slicks Medium</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(H)"> Slicks Hard</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(SH)"> Slicks Superhard</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(ST)"> Street</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(SV)"> Street Vintage</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(SM)"> Semislicks</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(HR)"> Hypercar Road</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(I)"> Intermediate</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(V)"> Vintage</label></a></li><li class="active"><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="(E)"> Eco</label></a></li></ul></div>
                            </div>
                        </div>
                        <div class="row">
                            <label for="datespan" class="col-md-2 control-label">Date</label>
                            <div id="datespan" class="col-md-10">
                                <div class="form-group row">
                                    <label for="dateStart" class="col-md-2 control-label">From</label>
                                    <div class="col-md-3">
                                        <input id="dateStart" class="datepicker form-control" data-date-format="yyyy-mm-dd" value="">
                                    </div>
                                    <label for="dateStop" class="col-md-2 control-label">To</label>
                                    <div class="col-md-3">
                                        <input id="dateStop" class="datepicker form-control" data-date-format="yyyy-mm-dd" value="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="col-md-6">
                <form class="form-horizontal" role="form">
                    <div class="form-group collapse ">
                        <div class="row">
                            <label for="ranking" class="col-md-2 control-label">Ranking</label>
                            <div class="col-md-10">
                                <select id="ranking" name="ranking" class="form-control multiselect" style="display: none;">
                                    <option selected="" value="0">Multiple cars and multiple drivers</option>
                                    <option value="1">One entry per driver</option>
                                    <option value="2">One entry per car</option>
                                </select><div class="btn-group" style="width: 100%;"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="Multiple cars and multiple drivers" style="width: 100%;">Multiple cars and multiple drivers <b class="caret"></b></button><ul class="multiselect-container dropdown-menu" style="max-height: 350px; overflow: hidden auto;"><li class="multiselect-item filter" value="0"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder="Search"></div></li><li class="active"><a href="javascript:void(0);"><label class="radio"><input type="radio" value="0"> Multiple cars and multiple drivers</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="1"> One entry per driver</label></a></li><li><a href="javascript:void(0);"><label class="radio"><input type="radio" value="2"> One entry per car</label></a></li></ul></div>
                            </div>
                        </div>
                        <div class="row">
                            <label for="groups" class="col-md-2 control-label">Groups</label>
                            <div class="col-md-10">
                                <select id="groups" name="groups" class="form-control multiselect" multiple="multiple" style="display: none;">
                                    <option value="0">(everyone)</option>
                                </select><div class="btn-group" style="width: 100%;"><button type="button" class="multiselect dropdown-toggle btn btn-default" data-toggle="dropdown" title="None selected" style="width: 100%;">None selected <b class="caret"></b></button><ul class="multiselect-container dropdown-menu" style="max-height: 350px; overflow: hidden auto;"><li class="multiselect-item filter" value="0"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder="Search"></div></li><li class="multiselect-item multiselect-all"><a href="javascript:void(0);" class="multiselect-all"><label class="checkbox"><input type="checkbox" value="multiselect-all">  Select all</label></a></li><li><a href="javascript:void(0);"><label class="checkbox"><input type="checkbox" value="0"> (everyone)</label></a></li></ul></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 col-md-offset-6">
            <form class="form-horizontal collapse-group" role="form">
                <!-- *********** buttons ************* -->
                <div class="form-group form-group">
                    <div class="col-md-offset-0 col-md-2">
                        <a class="form-control btn btn-info" role="button" onclick="toggleCollapse(getElementById(&#39;filterCollapse&#39;), this)" href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=#">+</a>
                    </div>
                    <div class="col-md-offset-0 col-md-5">
                        <a class="form-control btn btn-primary" role="button" onclick="applySelections()" href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=#">Show selected</a>
                    </div>
                    <div class="col-md-offset-0 col-md-5">
                        <a class="form-control btn btn-primary" href="https://es2.assettohosting.com:10018/stracker/lapstat" role="button">Show last combo</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
    </div>
    <div class="row"><div class="col-md-12">
        <table class="table table-striped table-condensed table-bordered table-hover">
            <thead>
            <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Car</th>
                <th>Best lap</th>
                <th>Gap to 1st</th>
                <th>S1</th>
                <th>S2</th>
                <th>S3</th>
                <th>Valid</th>
                <th>Tyres</th>
                <th>vMax</th>
                <th>Laps</th>
                <th>Aids</th>
                <th>Date</th>
            </tr>
            </thead>
            <tbody>
            <tr class="clickableRow" href="lapdetails?lapid=73447#">
                <td class="bestLap">1.</td>
                <td class="bestLap">Alex Torregrosa</td>
                <td class="bestLap">
                        trr_amg_evo_gt3

                </td>
                <td class="bestLap">01:42.942</td>
                <td class="bestLap">+00.000</td>
                <td>00:36.745</td>
                <td>00:37.216</td>
                <td>00:28.981</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>325</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:05</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67673#">
                <td class="bestLap">2.</td>
                <td class="bestLap">Alex Torregrosa</td>
                <td class="bestLap">
                        trr_ferrari_296_gt3

                </td>
                <td class="bestLap">01:43.021</td>
                <td class="bestLap">+00.079</td>
                <td>00:37.002</td>
                <td class="bestSector">00:37.138</td>
                <td>00:28.881</td>
                <td>yes</td>
                <td>?</td>
                <td>294 km/h</td>
                <td>17</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 22:22</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72151#">
                <td class="bestLap">3.</td>
                <td class="bestLap">Alvaro Bascones</td>
                <td class="bestLap">
                        trr_lexus_rcf_gt3

                </td>
                <td class="bestLap">01:43.186</td>
                <td class="bestLap">+00.244</td>
                <td class="bestSector">00:36.662</td>
                <td>00:37.225</td>
                <td>00:29.299</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>249</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-21 20:28</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67646#">
                <td>4.</td>
                <td>Samuel Navarro</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:43.217</td>
                <td>+00.275</td>
                <td>00:37.006</td>
                <td>00:37.187</td>
                <td>00:29.024</td>
                <td>yes</td>
                <td>?</td>
                <td>294 km/h</td>
                <td>20</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 22:03</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67940#">
                <td class="bestLap">5.</td>
                <td class="bestLap">Alex Torregrosa</td>
                <td class="bestLap">
                        trr_amr_vantage_gt3_evo

                </td>
                <td class="bestLap">01:43.231</td>
                <td class="bestLap">+00.289</td>
                <td>00:37.078</td>
                <td>00:37.408</td>
                <td class="bestSector">00:28.745</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>21</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 19:56</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68129#">
                <td>6.</td>
                <td>Alex Torregrosa</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:43.329</td>
                <td>+00.387</td>
                <td>00:36.831</td>
                <td>00:37.400</td>
                <td>00:29.098</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 21:04</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71896#">
                <td>7.</td>
                <td>Jairo Lopez</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:43.548</td>
                <td>+00.606</td>
                <td>00:36.829</td>
                <td>00:37.341</td>
                <td>00:29.378</td>
                <td>yes</td>
                <td>?</td>
                <td>292 km/h</td>
                <td>237</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-21 18:08</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67705#">
                <td>8.</td>
                <td>Alvaro Bascones</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:43.665</td>
                <td>+00.723</td>
                <td>00:37.176</td>
                <td>00:37.403</td>
                <td>00:29.086</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>12</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 23:08</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73454#">
                <td>9.</td>
                <td>Adrian Tirado</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:43.758</td>
                <td>+00.816</td>
                <td>00:37.071</td>
                <td>00:37.481</td>
                <td>00:29.206</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>79</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:06</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73129#">
                <td>10.</td>
                <td>corbo</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:43.775</td>
                <td>+00.833</td>
                <td>00:36.717</td>
                <td>00:37.720</td>
                <td>00:29.338</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>401</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 15:41</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71033#">
                <td>11.</td>
                <td>Manu Gonzalez</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:43.777</td>
                <td>+00.835</td>
                <td>00:37.141</td>
                <td>00:37.530</td>
                <td>00:29.106</td>
                <td>yes</td>
                <td>S</td>
                <td>290 km/h</td>
                <td>228</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-19 20:06</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72243#">
                <td>12.</td>
                <td>Esteban Tolosa</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:43.788</td>
                <td>+00.846</td>
                <td>00:36.998</td>
                <td>00:37.621</td>
                <td>00:29.169</td>
                <td>yes</td>
                <td>S</td>
                <td>289 km/h</td>
                <td>166</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-21 21:27</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71293#">
                <td>13.</td>
                <td>Sandro Vilas</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:43.834</td>
                <td>+00.892</td>
                <td>00:37.319</td>
                <td>00:37.541</td>
                <td>00:28.974</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>70</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-20 17:07</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68101#">
                <td>14.</td>
                <td>Alvaro Bascones</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:43.902</td>
                <td>+00.960</td>
                <td>00:37.111</td>
                <td>00:37.505</td>
                <td>00:29.286</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>12</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:51</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67612#">
                <td>15.</td>
                <td>Alvaro Bascones</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:43.984</td>
                <td>+01.042</td>
                <td>00:37.500</td>
                <td>00:37.271</td>
                <td>00:29.213</td>
                <td>yes</td>
                <td>?</td>
                <td>293 km/h</td>
                <td>9</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 21:31</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72449#">
                <td>16.</td>
                <td>Ibriam Ariztimuño</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.025</td>
                <td>+01.083</td>
                <td>00:37.230</td>
                <td>00:37.697</td>
                <td>00:29.098</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>244</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-22 15:39</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67963#">
                <td class="bestLap">17.</td>
                <td class="bestLap">Alvaro Bascones</td>
                <td class="bestLap">
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td class="bestLap">01:44.050</td>
                <td class="bestLap">+01.108</td>
                <td>00:36.687</td>
                <td>00:37.531</td>
                <td>00:29.832</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>10</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:05</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71106#">
                <td>18.</td>
                <td>Alvaro Rico</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:44.061</td>
                <td>+01.119</td>
                <td>00:37.673</td>
                <td>00:37.483</td>
                <td>00:28.905</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>57</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-19 20:39</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73444#">
                <td class="bestLap">19.</td>
                <td class="bestLap">Alejandro Tomeno</td>
                <td class="bestLap">
                        trr_ford_mustang_gt3

                </td>
                <td class="bestLap">01:44.155</td>
                <td class="bestLap">+01.213</td>
                <td>00:37.660</td>
                <td>00:37.544</td>
                <td>00:28.951</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>74</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:04</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70772#">
                <td>20.</td>
                <td>Ander Ibarrola</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.159</td>
                <td>+01.217</td>
                <td>00:37.295</td>
                <td>00:37.518</td>
                <td>00:29.346</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>76</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-19 16:05</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73439#">
                <td>21.</td>
                <td>Montoro</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:44.226</td>
                <td>+01.284</td>
                <td>00:37.290</td>
                <td>00:37.779</td>
                <td>00:29.157</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>149</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:04</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68038#">
                <td>22.</td>
                <td>Alejandro Tomeno</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.254</td>
                <td>+01.312</td>
                <td>00:37.607</td>
                <td>00:37.416</td>
                <td>00:29.231</td>
                <td>yes</td>
                <td>?</td>
                <td>292 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:32</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69187#">
                <td>23.</td>
                <td>Alejandro Tomeno</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:44.260</td>
                <td>+01.318</td>
                <td>00:37.382</td>
                <td>00:37.653</td>
                <td>00:29.225</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>13</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-14 21:22</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67438#">
                <td>24.</td>
                <td>Alvaro Bascones</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:44.332</td>
                <td>+01.390</td>
                <td>00:37.591</td>
                <td>00:37.482</td>
                <td>00:29.259</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>10</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 20:19</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68580#">
                <td>25.</td>
                <td>Jairo Lopez</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:44.408</td>
                <td>+01.466</td>
                <td>00:37.205</td>
                <td>00:37.747</td>
                <td>00:29.456</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>18</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 09:39</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70028#">
                <td>26.</td>
                <td>Sandro Vilas</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:44.424</td>
                <td>+01.482</td>
                <td>00:37.541</td>
                <td>00:37.751</td>
                <td>00:29.132</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>13</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 16:13</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67038#">
                <td>27.</td>
                <td>Samuel Navarro</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:44.557</td>
                <td>+01.615</td>
                <td>00:37.665</td>
                <td>00:37.613</td>
                <td>00:29.279</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:48</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70721#">
                <td>28.</td>
                <td>Montoro</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.575</td>
                <td>+01.633</td>
                <td>00:37.540</td>
                <td>00:37.785</td>
                <td>00:29.250</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>21</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-19 13:56</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67910#">
                <td>29.</td>
                <td>Alejandro Tomeno</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:44.586</td>
                <td>+01.644</td>
                <td>00:37.406</td>
                <td>00:37.688</td>
                <td>00:29.492</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>17</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 19:44</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70490#">
                <td>30.</td>
                <td>Adrian Tirado</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.599</td>
                <td>+01.657</td>
                <td>00:37.410</td>
                <td>00:37.918</td>
                <td>00:29.271</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 21:15</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72776#">
                <td>31.</td>
                <td>Jan Mora</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.604</td>
                <td>+01.662</td>
                <td>00:37.517</td>
                <td>00:37.575</td>
                <td>00:29.512</td>
                <td>yes</td>
                <td>S</td>
                <td>290 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-23 00:09</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68720#">
                <td>32.</td>
                <td>Sandro Vilas</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:44.605</td>
                <td>+01.663</td>
                <td>00:37.411</td>
                <td>00:38.097</td>
                <td>00:29.097</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 16:46</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69145#">
                <td>33.</td>
                <td>Montoro</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:44.625</td>
                <td>+01.683</td>
                <td>00:37.301</td>
                <td>00:37.563</td>
                <td>00:29.761</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>18</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-14 19:23</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68913#">
                <td>34.</td>
                <td>Alejandro Tomeno</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:44.637</td>
                <td>+01.695</td>
                <td>00:37.159</td>
                <td>00:37.653</td>
                <td>00:29.825</td>
                <td>yes</td>
                <td>?</td>
                <td>277 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 20:21</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68139#">
                <td>35.</td>
                <td>Alejandro Tomeno</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:44.678</td>
                <td>+01.736</td>
                <td>00:37.590</td>
                <td>00:37.848</td>
                <td>00:29.240</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>5</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 21:10</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67832#">
                <td>36.</td>
                <td>Alex Torregrosa</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:44.745</td>
                <td>+01.803</td>
                <td>00:37.440</td>
                <td>00:37.776</td>
                <td>00:29.529</td>
                <td>yes</td>
                <td>?</td>
                <td>279 km/h</td>
                <td>9</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 19:14</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68610#">
                <td>37.</td>
                <td>Jairo Lopez</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:44.759</td>
                <td>+01.817</td>
                <td>00:37.414</td>
                <td>00:37.935</td>
                <td>00:29.410</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>22</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 10:13</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67033#">
                <td>38.</td>
                <td>Manu Gonzalez</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:44.793</td>
                <td>+01.851</td>
                <td>00:37.688</td>
                <td>00:37.980</td>
                <td>00:29.125</td>
                <td>yes</td>
                <td>S</td>
                <td>287 km/h</td>
                <td>5</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-09 20:38</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67770#">
                <td>39.</td>
                <td>Manu Gonzalez</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.802</td>
                <td>+01.860</td>
                <td>00:37.720</td>
                <td>00:37.832</td>
                <td>00:29.250</td>
                <td>yes</td>
                <td>S</td>
                <td>291 km/h</td>
                <td>6</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-11 18:16</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67739#">
                <td>40.</td>
                <td>Manu Gonzalez</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:44.827</td>
                <td>+01.885</td>
                <td>00:37.538</td>
                <td>00:37.666</td>
                <td>00:29.623</td>
                <td>yes</td>
                <td>S</td>
                <td>279 km/h</td>
                <td>6</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-11 16:22</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68562#">
                <td>41.</td>
                <td>Jairo Lopez</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:44.857</td>
                <td>+01.915</td>
                <td>00:37.467</td>
                <td>00:37.773</td>
                <td>00:29.617</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>48</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 09:09</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68233#">
                <td>42.</td>
                <td>Jairo Lopez</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:44.863</td>
                <td>+01.921</td>
                <td>00:37.244</td>
                <td>00:38.208</td>
                <td>00:29.411</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>10</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 09:48</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72423#">
                <td>43.</td>
                <td>jjojuanjo</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:44.893</td>
                <td>+01.951</td>
                <td>00:37.376</td>
                <td>00:37.696</td>
                <td>00:29.821</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>104</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-22 15:14</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70428#">
                <td>44.</td>
                <td>Adrian Tirado</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:44.950</td>
                <td>+02.008</td>
                <td>00:38.012</td>
                <td>00:37.711</td>
                <td>00:29.227</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 20:41</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69324#">
                <td>45.</td>
                <td>Montoro</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:44.959</td>
                <td>+02.017</td>
                <td>00:37.570</td>
                <td>00:37.945</td>
                <td>00:29.444</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>27</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-15 21:34</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71998#">
                <td>46.</td>
                <td>Eric Checa</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.040</td>
                <td>+02.098</td>
                <td>00:37.731</td>
                <td>00:38.106</td>
                <td>00:29.203</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>28</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-21 19:06</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69108#">
                <td>47.</td>
                <td>Montoro</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:45.074</td>
                <td>+02.132</td>
                <td>00:37.784</td>
                <td>00:37.895</td>
                <td>00:29.395</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>16</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-14 18:26</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67032#">
                <td>48.</td>
                <td>Samuel Navarro</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:45.107</td>
                <td>+02.165</td>
                <td>00:37.745</td>
                <td>00:38.114</td>
                <td>00:29.248</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:36</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70481#">
                <td>49.</td>
                <td>Esteban Tolosa</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:45.127</td>
                <td>+02.185</td>
                <td>00:37.929</td>
                <td>00:37.791</td>
                <td>00:29.407</td>
                <td>yes</td>
                <td>S</td>
                <td>291 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-18 21:03</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69742#">
                <td>50.</td>
                <td>J.Lineros</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:45.140</td>
                <td>+02.198</td>
                <td>00:38.226</td>
                <td>00:37.683</td>
                <td>00:29.231</td>
                <td>yes</td>
                <td>S</td>
                <td>291 km/h</td>
                <td>179</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-17 20:25</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73693#">
                <td>51.</td>
                <td>pupolin</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.147</td>
                <td>+02.205</td>
                <td>00:37.876</td>
                <td>00:37.652</td>
                <td>00:29.619</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>129</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:49</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70485#">
                <td>52.</td>
                <td>Esteban Tolosa</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:45.181</td>
                <td>+02.239</td>
                <td>00:37.591</td>
                <td>00:37.971</td>
                <td>00:29.619</td>
                <td>yes</td>
                <td>S</td>
                <td>279 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-18 21:08</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69416#">
                <td>53.</td>
                <td>Dani Arroyo</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:45.202</td>
                <td>+02.260</td>
                <td>00:37.742</td>
                <td>00:37.877</td>
                <td>00:29.583</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-16 17:18</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70492#">
                <td>54.</td>
                <td>Esteban Tolosa</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.211</td>
                <td>+02.269</td>
                <td>00:37.936</td>
                <td>00:37.557</td>
                <td>00:29.718</td>
                <td>yes</td>
                <td>S</td>
                <td>291 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-18 21:17</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70356#">
                <td>55.</td>
                <td>Adrian Tirado</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:45.228</td>
                <td>+02.286</td>
                <td>00:38.137</td>
                <td>00:37.827</td>
                <td>00:29.264</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>6</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 20:10</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69396#">
                <td>56.</td>
                <td>Dani Arroyo</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.232</td>
                <td>+02.290</td>
                <td>00:37.964</td>
                <td>00:37.649</td>
                <td>00:29.619</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-16 16:53</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70382#">
                <td>57.</td>
                <td>Esteban Tolosa</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:45.248</td>
                <td>+02.306</td>
                <td>00:38.072</td>
                <td>00:37.738</td>
                <td>00:29.438</td>
                <td>yes</td>
                <td>S</td>
                <td>287 km/h</td>
                <td>9</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-18 20:21</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73593#">
                <td>58.</td>
                <td>Omaley87</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.291</td>
                <td>+02.349</td>
                <td>00:37.481</td>
                <td>00:37.854</td>
                <td>00:29.956</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>78</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:41</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70525#">
                <td>59.</td>
                <td>Juanma Carmona</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:45.294</td>
                <td>+02.352</td>
                <td>00:37.933</td>
                <td>00:38.038</td>
                <td>00:29.323</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 21:56</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73675#">
                <td>60.</td>
                <td>Álvaro López</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:45.326</td>
                <td>+02.384</td>
                <td>00:37.643</td>
                <td>00:38.084</td>
                <td>00:29.599</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>66</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:48</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68020#">
                <td>61.</td>
                <td>Alvaro Rico</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.372</td>
                <td>+02.430</td>
                <td>00:37.897</td>
                <td>00:38.165</td>
                <td>00:29.310</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:27</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72359#">
                <td>62.</td>
                <td>Ramirazo</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:45.397</td>
                <td>+02.455</td>
                <td>00:37.637</td>
                <td>00:38.096</td>
                <td>00:29.664</td>
                <td>yes</td>
                <td>?</td>
                <td>280 km/h</td>
                <td>43</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-22 14:18</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=66990#">
                <td>63.</td>
                <td>Alvaro Rico</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:45.403</td>
                <td>+02.461</td>
                <td>00:37.366</td>
                <td>00:38.078</td>
                <td>00:29.959</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>10</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:06</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68198#">
                <td>64.</td>
                <td>Alvaritoo72</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:45.474</td>
                <td>+02.532</td>
                <td>00:38.004</td>
                <td>00:37.805</td>
                <td>00:29.665</td>
                <td>yes</td>
                <td>?</td>
                <td>286 km/h</td>
                <td>5</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 02:05</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69421#">
                <td>65.</td>
                <td>C. Perez</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:45.480</td>
                <td>+02.538</td>
                <td>00:37.939</td>
                <td>00:38.115</td>
                <td>00:29.426</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>102</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-16 17:22</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68245#">
                <td>66.</td>
                <td>corbo</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:45.532</td>
                <td>+02.590</td>
                <td>00:37.577</td>
                <td>00:38.123</td>
                <td>00:29.832</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>88</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 10:11</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69407#">
                <td>67.</td>
                <td>Dani Arroyo</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:45.560</td>
                <td>+02.618</td>
                <td>00:37.856</td>
                <td>00:38.042</td>
                <td>00:29.662</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-16 17:08</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67973#">
                <td>68.</td>
                <td>Omaley87</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:45.594</td>
                <td>+02.652</td>
                <td>00:37.872</td>
                <td>00:38.396</td>
                <td>00:29.326</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:09</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67457#">
                <td>69.</td>
                <td>Samuel Navarro</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:45.621</td>
                <td>+02.679</td>
                <td>00:37.931</td>
                <td>00:38.075</td>
                <td>00:29.615</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 20:28</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71956#">
                <td>70.</td>
                <td>Victor</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:45.637</td>
                <td>+02.695</td>
                <td>00:37.823</td>
                <td>00:38.189</td>
                <td>00:29.625</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>91</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-21 18:47</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72366#">
                <td>71.</td>
                <td>Jose Zurita</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:45.660</td>
                <td>+02.718</td>
                <td>00:38.221</td>
                <td>00:37.801</td>
                <td>00:29.638</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>213</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-22 14:25</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68767#">
                <td>72.</td>
                <td>corbo</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:45.698</td>
                <td>+02.756</td>
                <td>00:38.219</td>
                <td>00:38.058</td>
                <td>00:29.421</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>27</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 17:47</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67141#">
                <td>73.</td>
                <td>Jairo Lopez</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:45.725</td>
                <td>+02.783</td>
                <td>00:37.869</td>
                <td>00:38.047</td>
                <td>00:29.809</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>25</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 01:47</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72764#">
                <td>74.</td>
                <td>A.Padilla</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:45.774</td>
                <td>+02.832</td>
                <td>00:37.945</td>
                <td>00:38.066</td>
                <td>00:29.763</td>
                <td>yes</td>
                <td>S</td>
                <td>287 km/h</td>
                <td>47</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-22 23:16</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70227#">
                <td>75.</td>
                <td>makina10</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:45.787</td>
                <td>+02.845</td>
                <td>00:37.729</td>
                <td>00:38.409</td>
                <td>00:29.649</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>10</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 19:29</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67117#">
                <td>76.</td>
                <td>corbo</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:45.802</td>
                <td>+02.860</td>
                <td>00:37.902</td>
                <td>00:38.075</td>
                <td>00:29.825</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>19</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-10 00:59</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69089#">
                <td>77.</td>
                <td>corbo</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:45.814</td>
                <td>+02.872</td>
                <td>00:37.827</td>
                <td>00:38.197</td>
                <td>00:29.790</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>36</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-14 17:24</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73597#">
                <td>78.</td>
                <td>bertillo</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:46.109</td>
                <td>+03.167</td>
                <td>00:37.962</td>
                <td>00:37.791</td>
                <td>00:30.356</td>
                <td>yes</td>
                <td>S</td>
                <td>279 km/h</td>
                <td>82</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip on" title="Automatic throttle blip on"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-23 17:41</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68517#">
                <td>79.</td>
                <td>Jose Zurita</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:46.228</td>
                <td>+03.286</td>
                <td>00:37.719</td>
                <td>00:38.585</td>
                <td>00:29.924</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>38</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 23:00</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69766#">
                <td>80.</td>
                <td>makina10</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:46.274</td>
                <td>+03.332</td>
                <td>00:38.827</td>
                <td>00:38.025</td>
                <td>00:29.422</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>13</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-17 20:36</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73631#">
                <td>81.</td>
                <td>Alcascal</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:46.292</td>
                <td>+03.350</td>
                <td>00:38.298</td>
                <td>00:38.101</td>
                <td>00:29.893</td>
                <td>yes</td>
                <td>S</td>
                <td>290 km/h</td>
                <td>53</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-23 17:44</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73460#">
                <td>82.</td>
                <td>fisewdc1</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:46.355</td>
                <td>+03.413</td>
                <td>00:37.853</td>
                <td>00:38.465</td>
                <td>00:30.037</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>60</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 17:07</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71372#">
                <td>83.</td>
                <td>Jose Zurita</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:46.403</td>
                <td>+03.461</td>
                <td>00:38.412</td>
                <td>00:37.881</td>
                <td>00:30.110</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>14</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-20 19:08</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72768#">
                <td>84.</td>
                <td>Jan Mora</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:46.474</td>
                <td>+03.532</td>
                <td>00:38.250</td>
                <td>00:38.011</td>
                <td>00:30.213</td>
                <td>yes</td>
                <td>S</td>
                <td>284 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-22 23:54</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68432#">
                <td>85.</td>
                <td>pupolin</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:46.522</td>
                <td>+03.580</td>
                <td>00:38.209</td>
                <td>00:37.924</td>
                <td>00:30.389</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 17:50</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72825#">
                <td>86.</td>
                <td>IZANCAR_17</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:46.568</td>
                <td>+03.626</td>
                <td>00:38.539</td>
                <td>00:38.521</td>
                <td>00:29.508</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>92</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 10:54</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68417#">
                <td>87.</td>
                <td>pupolin</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:46.737</td>
                <td>+03.795</td>
                <td>00:38.641</td>
                <td>00:38.136</td>
                <td>00:29.960</td>
                <td>yes</td>
                <td>?</td>
                <td>286 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 17:38</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69305#">
                <td>88.</td>
                <td>javicava</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:46.743</td>
                <td>+03.801</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>yes</td>
                <td>?</td>
                <td>285 km/h</td>
                <td>8</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-15 21:13</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69334#">
                <td>89.</td>
                <td>javicava</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:46.765</td>
                <td>+03.823</td>
                <td>00:38.009</td>
                <td>00:38.807</td>
                <td>00:29.949</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-15 21:45</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68311#">
                <td>90.</td>
                <td>fisewdc1</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:46.798</td>
                <td>+03.856</td>
                <td>00:38.388</td>
                <td>00:38.528</td>
                <td>00:29.882</td>
                <td>yes</td>
                <td>?</td>
                <td>293 km/h</td>
                <td>8</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 16:00</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68281#">
                <td>91.</td>
                <td>Montoro</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:46.818</td>
                <td>+03.876</td>
                <td>00:38.371</td>
                <td>00:38.698</td>
                <td>00:29.749</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 15:40</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69024#">
                <td>92.</td>
                <td>Slahade</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:46.895</td>
                <td>+03.953</td>
                <td>00:38.231</td>
                <td>00:38.609</td>
                <td>00:30.055</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>10</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 22:47</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68111#">
                <td>93.</td>
                <td>A. Santos</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:46.899</td>
                <td>+03.957</td>
                <td>00:38.652</td>
                <td>00:38.162</td>
                <td>00:30.085</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>8</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:54</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67011#">
                <td>94.</td>
                <td>jjojuanjo</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:47.011</td>
                <td>+04.069</td>
                <td>00:38.534</td>
                <td>00:38.244</td>
                <td>00:30.233</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>6</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:21</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69056#">
                <td>95.</td>
                <td>Jose Zurita</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:47.063</td>
                <td>+04.121</td>
                <td>00:38.794</td>
                <td>00:38.583</td>
                <td>00:29.686</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-14 00:56</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68445#">
                <td>96.</td>
                <td>pupolin</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:47.076</td>
                <td>+04.134</td>
                <td>00:38.777</td>
                <td>00:37.662</td>
                <td>00:30.637</td>
                <td>yes</td>
                <td>?</td>
                <td>286 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 18:01</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67000#">
                <td>97.</td>
                <td>jjojuanjo</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:47.091</td>
                <td>+04.149</td>
                <td>00:37.977</td>
                <td>00:38.233</td>
                <td>00:30.881</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:16</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68451#">
                <td>98.</td>
                <td>Ibriam Ariztimuño</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:47.116</td>
                <td>+04.174</td>
                <td>00:38.497</td>
                <td>00:38.681</td>
                <td>00:29.938</td>
                <td>yes</td>
                <td>?</td>
                <td>286 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 18:07</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67821#">
                <td>99.</td>
                <td>A. Santos</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:47.122</td>
                <td>+04.180</td>
                <td>00:38.526</td>
                <td>00:38.353</td>
                <td>00:30.243</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>14</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 19:08</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68384#">
                <td>100.</td>
                <td>pupolin</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:47.158</td>
                <td>+04.216</td>
                <td>00:38.799</td>
                <td>00:38.280</td>
                <td>00:30.079</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 17:03</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68471#">
                <td>101.</td>
                <td>Ibriam Ariztimuño</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:47.256</td>
                <td>+04.314</td>
                <td>00:38.679</td>
                <td>00:38.380</td>
                <td>00:30.197</td>
                <td>yes</td>
                <td>?</td>
                <td>290 km/h</td>
                <td>13</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 19:36</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68978#">
                <td>102.</td>
                <td>jony</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:47.288</td>
                <td>+04.346</td>
                <td>00:38.452</td>
                <td>00:38.572</td>
                <td>00:30.264</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 22:18</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=72733#">
                <td>103.</td>
                <td>A.Padilla</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:47.295</td>
                <td>+04.353</td>
                <td>00:38.399</td>
                <td>00:38.795</td>
                <td>00:30.101</td>
                <td>yes</td>
                <td>S</td>
                <td>286 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-22 22:21</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68407#">
                <td>104.</td>
                <td>pupolin</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:47.335</td>
                <td>+04.393</td>
                <td>00:38.974</td>
                <td>00:38.211</td>
                <td>00:30.150</td>
                <td>yes</td>
                <td>?</td>
                <td>277 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 17:28</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=73306#">
                <td>105.</td>
                <td>javicava</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:47.459</td>
                <td>+04.517</td>
                <td>00:39.031</td>
                <td>00:38.404</td>
                <td>00:30.024</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>34</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-23 16:43</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69061#">
                <td>106.</td>
                <td>Jose Zurita</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:47.729</td>
                <td>+04.787</td>
                <td>00:38.505</td>
                <td>00:38.775</td>
                <td>00:30.449</td>
                <td>yes</td>
                <td>?</td>
                <td>278 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-14 01:07</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67835#">
                <td>107.</td>
                <td>A. Santos</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:47.743</td>
                <td>+04.801</td>
                <td>00:39.150</td>
                <td>00:38.399</td>
                <td>00:30.194</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 19:17</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68027#">
                <td>108.</td>
                <td>A. Santos</td>
                <td>
                        trr_ford_mustang_gt3

                </td>
                <td>01:47.929</td>
                <td>+04.987</td>
                <td>00:38.731</td>
                <td>00:38.697</td>
                <td>00:30.501</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 20:30</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=66958#">
                <td>109.</td>
                <td>IZANCAR_17</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:48.240</td>
                <td>+05.298</td>
                <td>00:39.276</td>
                <td>00:38.926</td>
                <td>00:30.038</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 19:48</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=70592#">
                <td>110.</td>
                <td>Cesar Sacedo</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:48.369</td>
                <td>+05.427</td>
                <td>00:39.866</td>
                <td>00:38.278</td>
                <td>00:30.225</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>13</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-18 23:54</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68308#">
                <td>111.</td>
                <td>Soletexx</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:48.464</td>
                <td>+05.522</td>
                <td>00:38.576</td>
                <td>00:38.791</td>
                <td>00:31.097</td>
                <td>yes</td>
                <td>?</td>
                <td>280 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 15:58</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68335#">
                <td>112.</td>
                <td>fisewdc1</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:48.655</td>
                <td>+05.713</td>
                <td>00:37.170</td>
                <td>00:38.964</td>
                <td>00:32.521</td>
                <td>yes</td>
                <td>?</td>
                <td>274 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 16:23</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67776#">
                <td>113.</td>
                <td>A. Santos</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:48.664</td>
                <td>+05.722</td>
                <td>00:39.384</td>
                <td>00:38.804</td>
                <td>00:30.476</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 18:20</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69405#">
                <td>114.</td>
                <td>C. Perez</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:48.884</td>
                <td>+05.942</td>
                <td>00:38.633</td>
                <td>00:39.197</td>
                <td>00:31.054</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-16 17:06</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=67936#">
                <td>115.</td>
                <td>Ibriam Ariztimuño</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:48.948</td>
                <td>+06.006</td>
                <td>00:38.695</td>
                <td>00:39.487</td>
                <td>00:30.766</td>
                <td>yes</td>
                <td>?</td>
                <td>279 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-11 19:55</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68535#">
                <td>116.</td>
                <td>martin</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:49.055</td>
                <td>+06.113</td>
                <td>00:39.821</td>
                <td>00:39.177</td>
                <td>00:30.057</td>
                <td>yes</td>
                <td>?</td>
                <td>289 km/h</td>
                <td>8</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 01:09</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71814#">
                <td>117.</td>
                <td>Pelicos</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:49.123</td>
                <td>+06.181</td>
                <td>00:39.234</td>
                <td>00:39.253</td>
                <td>00:30.636</td>
                <td>yes</td>
                <td>S</td>
                <td>279 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch off" title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off" title="Automatic brake off"></a>
                    <a class="aids autogearbox off" title="Automatic gearbox off"></a>
                    <a class="aids blip off" title="Automatic throttle blip off"></a>
                    <a class="aids idealline off" title="Ideal racing line off"></a>
                    <a class="aids tc factory" title="Traction control factory"></a>
                </div></td>
                <td>2025-03-21 13:07</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=66950#">
                <td>118.</td>
                <td>fisewdc1</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:49.226</td>
                <td>+06.284</td>
                <td>00:39.590</td>
                <td>00:39.036</td>
                <td>00:30.600</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 19:42</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=66987#">
                <td>119.</td>
                <td>jjojuanjo</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:49.335</td>
                <td>+06.393</td>
                <td>00:39.238</td>
                <td>00:38.470</td>
                <td>00:31.627</td>
                <td>yes</td>
                <td>?</td>
                <td>280 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:04</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68973#">
                <td>120.</td>
                <td>Slahade</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:49.351</td>
                <td>+06.409</td>
                <td>00:38.606</td>
                <td>00:38.812</td>
                <td>00:31.933</td>
                <td>yes</td>
                <td>?</td>
                <td>288 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 22:14</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=66983#">
                <td>121.</td>
                <td>IZANCAR_17</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:49.942</td>
                <td>+07.000</td>
                <td>00:40.290</td>
                <td>00:39.159</td>
                <td>00:30.493</td>
                <td>yes</td>
                <td>?</td>
                <td>291 km/h</td>
                <td>2</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-09 20:01</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68464#">
                <td>122.</td>
                <td>martin</td>
                <td>
                        trr_amr_vantage_gt3_evo

                </td>
                <td>01:50.396</td>
                <td>+07.454</td>
                <td>00:40.119</td>
                <td>00:39.542</td>
                <td>00:30.735</td>
                <td>yes</td>
                <td>?</td>
                <td>286 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-12 19:16</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71165#">
                <td>123.</td>
                <td>Victor</td>
                <td>
                        trr_amg_evo_gt3

                </td>
                <td>01:51.104</td>
                <td>+08.162</td>
                <td>00:40.729</td>
                <td>00:39.792</td>
                <td>00:30.583</td>
                <td>yes</td>
                <td>?</td>
                <td>286 km/h</td>
                <td>6</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-19 22:44</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=68530#">
                <td>124.</td>
                <td>Slahade</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:51.800</td>
                <td>+08.858</td>
                <td>00:41.413</td>
                <td>00:39.130</td>
                <td>00:31.257</td>
                <td>yes</td>
                <td>?</td>
                <td>275 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-13 00:58</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71679#">
                <td>125.</td>
                <td>RcSergi</td>
                <td>
                        trr_ferrari_296_gt3

                </td>
                <td>01:52.524</td>
                <td>+09.582</td>
                <td>00:41.522</td>
                <td>00:39.140</td>
                <td>00:31.862</td>
                <td>yes</td>
                <td>?</td>
                <td>287 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-20 23:37</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71467#">
                <td>126.</td>
                <td>JOSE CRESPO</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:53.113</td>
                <td>+10.171</td>
                <td>00:42.745</td>
                <td>00:39.463</td>
                <td>00:30.905</td>
                <td>yes</td>
                <td>?</td>
                <td>283 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-20 20:21</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=69867#">
                <td>127.</td>
                <td>RcSergi</td>
                <td>
                        trr_lexus_rcf_gt3

                </td>
                <td>01:53.890</td>
                <td>+10.948</td>
                <td>00:42.112</td>
                <td>00:40.092</td>
                <td>00:31.686</td>
                <td>yes</td>
                <td>?</td>
                <td>282 km/h</td>
                <td>4</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-17 23:28</td>
            </tr>
            <tr class="clickableRow" href="lapdetails?lapid=71636#">
                <td>128.</td>
                <td>RcSergi</td>
                <td>
                        TRR_GT3_porsche_992_gt3_r

                </td>
                <td>01:58.594</td>
                <td>+15.652</td>
                <td>00:44.883</td>
                <td>00:41.381</td>
                <td>00:32.330</td>
                <td>yes</td>
                <td>?</td>
                <td>276 km/h</td>
                <td>1</td>
                <td><div>
                    <a class="aids autoclutch unknown" title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown" title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown" title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown" title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown" title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown" title="Traction control unknown"></a>
                </div></td>
                <td>2025-03-20 22:26</td>
            </tr>
            </tbody>
        </table>
    </div></div>
</div>





<nav class="navbar navbar-inverse navbar-fixed-bottom">
    <div class="container-fluid">
       <div class="col-sm-3">
       </div>

        <div style="text-align:center" class="col-sm-6">
                <ul class="pagination pagination-sm">
                    <li><a href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=&amp;page=0"><span class="glyphicon glyphicon-fast-backward"></span></a></li>
                    <li class="disabled"><a href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=&amp;page=-1"><span class="glyphicon glyphicon-backward"></span></a></li>
                    <li class="active"><a href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=&amp;page=0">1</a></li>
                    <li class="disabled"><a href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=&amp;page=1"><span class="glyphicon glyphicon-forward"></span></a></li>
                    <li><a href="https://es2.assettohosting.com:10018/stracker/lapstat?track=rt_daytona-sportscar&amp;cars=TRR_GT3_porsche_992_gt3_r,alpine_europa_cup,trr_amg_evo_gt3,trr_amr_vantage_gt3_evo,trr_ferrari_296_gt3,trr_ford_mustang_gt3,trr_gt3_porsche_992_gt3_r,trr_lexus_rcf_gt3&amp;valid=1,2&amp;date_from=&amp;date_to=&amp;page=0"><span class="glyphicon glyphicon-fast-forward"></span></a></li>
                </ul>
        </div>
        <div class="col-sm-3">
                <p class="navbar-text navbar-right">
                   v3.5.1 provided by <b>Neys</b>
                </p>
        
    </div>
</div></nav>
<!--</div>-->



<script type="text/javascript">
$(document).ready(function() {
    $('.multiselect').multiselect({
        buttonWidth: '100%',
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 350
    });
});
</script>

<!-- Support clickable table rows -->
<script type="text/javascript">
jQuery(document).ready(function($) {
      $(".clickableRow td:not(.noclick)").click(function() {
            var tr = $(this).context.parentElement;
            window.document.location = $(tr).attr("href");
      });
});
</script>

<!-- Initialize the datepicker plugin -->
<script type="text/javascript">
$('.datepicker').datepicker()
</script>

</body><app-ls-content ng-version="17.3.7"><template shadowrootmode="open"><!----><app-similar-tools _nghost-ng-c2697620354=""><!----><!----><!----></app-similar-tools><!----><!----><style>[_nghost-ng-c2697620354]{font-family:Open Sans,sans-serif;color:#121212}</style></template></app-ls-content><!-- Initialize the multiselect plugin: --></html>`