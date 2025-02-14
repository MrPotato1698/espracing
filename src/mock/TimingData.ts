export const TimingData =
`<!DOCTYPE html>
<html>
  <head lang="en">
    <meta charset="UTF-8" />

    <meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />

    <!-- Include Twitter Bootstrap and jQuery: -->

    <link rel="stylesheet" href="/stracker/bootstrap/css/bootstrap.min.css" />
    <link rel="stylesheet"
      href="/stracker/bootstrap/css/bootstrap-theme.min.css" />
    <link rel="stylesheet"
      href="/stracker/bootstrap/css/bootstrap-multiselect.css"
      type="text/css" />
    <link rel="stylesheet"
      href="/stracker/bootstrap/css/bootstrap-datepicker.css" type="text/css" />
    <link rel="stylesheet" href="/stracker/bootstrap/css/sticky-footer.css"
      type="text/css" />
    <link rel="stylesheet" href="/stracker/bootstrap/css/fileinput.min.css"
      media="all" type="text/css" />

    <script src="/stracker/jquery/jquery.min.js"></script>
    <script src="/stracker/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript"
      src="/stracker/bootstrap/js/bootstrap-multiselect.js"></script>
    <script type="text/javascript"
      src="/stracker/bootstrap/js/bootstrap-datepicker.js"></script>
    <script src="/stracker/bootstrap/js/fileinput.min.js"
      type="text/javascript"></script>

    <title>Laps</title>
    <link rel="shortcut icon" type="image/x-icon"
      href="/stracker/img/brand_icon_small_wob.png" />

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
    <link rel="stylesheet" href="/stracker/bootstrap/css/custom.css" media="all"
      type="text/css" />
  </head>
  <body>
    <nav class="navbar navbar-inverse" role="navigation">
      <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed"
            data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="/stracker/"><img class="img-responsive"
              alt="stracker" src="/stracker/img/brand_icon_large_wob.png" /></a>
        </div>
        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul class="nav navbar-nav">
            <li class="active"><a href="/stracker/lapstat">Lap Times</a></li>
            <li><a href="/stracker/sessionstat">Sessions</a></li>
            <li><a href="/stracker/players">Drivers</a></li>
            <li><a href="/stracker/championship">Championships</a></li>
            <li><a href="/stracker/statistics">Statistics</a></li>
            <li><a href="/stracker/livemap">Live Map</a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li><a href="/stracker/admin/lapstat">Admin Area</a></li>
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
            <img src="/stracker/img/banner.png" title="Logo Track"
              class="ACimg" />
          </div>
          <div class="col-md-6">
            <form class="form-horizontal collapse-group" role="form">
              <!-- *********** standard filters ************* -->
              <div class="form-group">
                <label for="trackname"
                  class="col-md-2 control-label">Track</label>
                <div class="col-md-10">
                  <select id="trackname" name="trackname"
                    class="multiselect form-control">
                    <option
                      value="acf_portimao-layout_wec_2023">acf_portimao-layout_wec_2023</option>
                    <option
                      value="acu_barcelona-city-normal">acu_barcelona-city-normal</option>
                    <option value="ahvenisto_rc-pit">ahvenisto_rc-pit</option>
                    <option
                      value="circuito_ricardo_tormo">circuito_ricardo_tormo</option>
                    <option
                      value="ddm_gts_tsukuba-full">ddm_gts_tsukuba-full</option>
                    <option
                      value="fn_imola-imola_f1_2024">fn_imola-imola_f1_2024</option>
                    <option
                      value="fn_redbullring-austria_f1_2024">fn_redbullring-austria_f1_2024</option>
                    <option value="fn_valencia-gp">fn_valencia-gp</option>
                    <option value="jarama_2009-2022">jarama_2009-2022</option>
                    <option value="jerez-layout_gp">jerez-layout_gp</option>
                    <option
                      value="ks_nordschleife-nordschleife_24hours_2022">ks_nordschleife-nordschleife_24hours_2022</option>
                    <option
                      value="ks_nurburgring-layout_gp_a_osrw">ks_nurburgring-layout_gp_a_osrw</option>
                    <option
                      value="ks_silverstone-silverstone_f1_2022">ks_silverstone-silverstone_f1_2022</option>
                    <option
                      value="lilski_road_america">lilski_road_america</option>
                    <option
                      value="lilski_watkins_glen-short_classic">lilski_watkins_glen-short_classic</option>
                    <option value="manfeild-full">manfeild-full</option>
                    <option value="monza-monza_osrw">monza-monza_osrw</option>
                    <option value="pittrace-full">pittrace-full</option>
                    <option value="pittrace-north">pittrace-north</option>
                    <option
                      value="rmi_sydney_motorsport_park-gardner">rmi_sydney_motorsport_park-gardner</option>
                    <option value="rt_bathurst">rt_bathurst</option>
                    <option
                      value="rt_daytona-sportscar">rt_daytona-sportscar</option>
                    <option
                      value="rt_fuji_speedway-layout_wec_2023">rt_fuji_speedway-layout_wec_2023</option>
                    <option value="rt_macau">rt_macau</option>
                    <option
                      value="rt_sebring-wec2023">rt_sebring-wec2023</option>
                    <option value="rt_sonoma-nascar">rt_sonoma-nascar</option>
                    <option value="rt_sonoma-wtcc">rt_sonoma-wtcc</option>
                    <option value="rx_shibuya">rx_shibuya</option>
                    <option
                      value="spa-layout_wec_2023">spa-layout_wec_2023</option>
                    <option
                      value="sportsland-sugo-sugo">sportsland-sugo-sugo</option>
                    <option
                      value="sx_lemans-24h_2023">sx_lemans-24h_2023</option>
                    <option
                      value="sx_lemans-chicaneperf">sx_lemans-chicaneperf</option>
                    <option
                      value="t78_hockenheimring-gp_osrw">t78_hockenheimring-gp_osrw</option>
                    <option selected
                      value="tmm_autodrom_most">tmm_autodrom_most</option>
                    <option
                      value="zandvoort2023-2023">zandvoort2023-2023</option>
                    <option value="zw_nogaro">zw_nogaro</option>
                  </select>
                </div>
                <label for="cars" class="col-md-2 control-label">Cars</label>
                <div class="col-md-10">
                  <select id="cars" name="cars" class="form-control multiselect"
                    multiple="multiple">
                    <option
                      value="2023_Le_Mans_Nascar_Camry">2023_Le_Mans_Nascar_Camry</option>
                    <option
                      value="2023_Le_Mans_Nascar_Mustang">2023_Le_Mans_Nascar_Mustang</option>
                    <option
                      value="2023_le_mans_nascar_camry">2023_le_mans_nascar_camry</option>
                    <option
                      value="2023_le_mans_nascar_mustang">2023_le_mans_nascar_mustang</option>
                    <option
                      value="Le_Mans_Nascar_Camaro">Le_Mans_Nascar_Camaro</option>
                    <option selected
                      value="alpine_europa_cup">alpine_europa_cup</option>
                    <option
                      value="gue_techart_gt_street_r">gue_techart_gt_street_r</option>
                    <option
                      value="jtc_honda_civic_eg_gra">jtc_honda_civic_eg_gra</option>
                    <option value="ks_audi_dtm_2020">ks_audi_dtm_2020</option>
                    <option value="ks_bmw_dtm_2020">ks_bmw_dtm_2020</option>
                    <option
                      value="le_mans_nascar_camaro">le_mans_nascar_camaro</option>
                    <option value="lm_trophy_truck">lm_trophy_truck</option>
                    <option
                      value="renault_twingo_rs_twincup2">renault_twingo_rs_twincup2</option>
                    <option value="tatuus_ft_60">tatuus_ft_60</option>
                    <option value="trr_acura_arx-06">trr_acura_arx-06</option>
                    <option
                      value="trr_bmw_m_hybrid_V8">trr_bmw_m_hybrid_V8</option>
                    <option
                      value="trr_bmw_m_hybrid_v8">trr_bmw_m_hybrid_v8</option>
                    <option
                      value="trr_cadillac_v-series.r">trr_cadillac_v-series.r</option>
                    <option value="trr_ferrrari_499p">trr_ferrrari_499p</option>
                    <option value="trr_peugeot_9x8">trr_peugeot_9x8</option>
                    <option value="trr_porsche_963">trr_porsche_963</option>
                    <option value="trr_toyota_gr010">trr_toyota_gr010</option>
                  </select>
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
                    <label for="valid"
                      class="col-md-2 control-label">Valid</label>
                    <div class="col-md-10">
                      <select id="valid" name="valid"
                        class="form-control multiselect" multiple="multiple">
                        <option selected value="1">valid</option>
                        <option selected value="2">unknown</option>
                        <option value="0">invalid</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <label for="tyres"
                      class="col-md-2 control-label">Tyres</label>
                    <div class="col-md-10">
                      <select id="tyres" name="tyres"
                        class="form-control multiselect" multiple="multiple">
                        <option selected value="(SS)">Slicks Supersoft</option>
                        <option selected value="(S)">Slicks Soft</option>
                        <option selected value="(M)">Slicks Medium</option>
                        <option selected value="(H)">Slicks Hard</option>
                        <option selected value="(SH)">Slicks Superhard</option>
                        <option selected value="(ST)">Street</option>
                        <option selected value="(SV)">Street Vintage</option>
                        <option selected value="(SM)">Semislicks</option>
                        <option selected value="(HR)">Hypercar Road</option>
                        <option selected value="(I)">Intermediate</option>
                        <option selected value="(V)">Vintage</option>
                        <option selected value="(E)">Eco</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <label for="datespan"
                      class="col-md-2 control-label">Date</label>
                    <div id="datespan" class="col-md-10">
                      <div class="form-group row">
                        <label for="dateStart"
                          class="col-md-2 control-label">From</label>
                        <div class="col-md-3">
                          <input id="dateStart" class="datepicker form-control"
                            data-date-format="yyyy-mm-dd" value />
                        </div>
                        <label for="dateStop"
                          class="col-md-2 control-label">To</label>
                        <div class="col-md-3">
                          <input id="dateStop" class="datepicker form-control"
                            data-date-format="yyyy-mm-dd" value />
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
                    <label for="ranking"
                      class="col-md-2 control-label">Ranking</label>
                    <div class="col-md-10">
                      <select id="ranking" name="ranking"
                        class="form-control multiselect">
                        <option selected value="0">Multiple cars and multiple
                          drivers</option>
                        <option value="1">One entry per driver</option>
                        <option value="2">One entry per car</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <label for="groups"
                      class="col-md-2 control-label">Groups</label>
                    <div class="col-md-10">
                      <select id="groups" name="groups"
                        class="form-control multiselect" multiple="multiple">
                        <option value="0">(everyone)</option>
                      </select>
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
                  <a class="form-control btn btn-info" role="button"
                    onclick="toggleCollapse(getElementById(&#39;filterCollapse&#39;), this)"
                    href="#">+</a>
                </div>
                <div class="col-md-offset-0 col-md-5">
                  <a class="form-control btn btn-primary" role="button"
                    onclick="applySelections()" href="#">Show selected</a>
                </div>
                <div class="col-md-offset-0 col-md-5">
                  <a class="form-control btn btn-primary" href="lapstat"
                    role="button">Show last combo</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <table
            class="table table-striped table-condensed table-bordered table-hover">
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
              <tr class="clickableRow" href="lapdetails?lapid=63620#">
                <td class="bestLap">1.</td>
                <td class="bestLap">Alvaritoo72</td>
                <td class="bestLap">
                  alpine_europa_cup

                </td>
                <td class="bestLap">01:37.083</td>
                <td class="bestLap">+00.000</td>
                <td class="bestSector">00:25.204</td>
                <td>00:45.627</td>
                <td class="bestSector">00:26.252</td>
                <td>yes</td>
                <td>?</td>
                <td>219 km/h</td>
                <td>42</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-13 13:41</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63601#">
                <td>2.</td>
                <td>Jairo Lopez</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:37.274</td>
                <td>+00.191</td>
                <td>00:25.227</td>
                <td>00:45.515</td>
                <td>00:26.532</td>
                <td>yes</td>
                <td>?</td>
                <td>227 km/h</td>
                <td>36</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-13 03:45</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63562#">
                <td>3.</td>
                <td>Alvaro Rico</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:37.673</td>
                <td>+00.590</td>
                <td>00:25.595</td>
                <td class="bestSector">00:45.453</td>
                <td>00:26.625</td>
                <td>yes</td>
                <td>?</td>
                <td>218 km/h</td>
                <td>23</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-12 21:12</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63651#">
                <td>4.</td>
                <td>makina10</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:38.422</td>
                <td>+01.339</td>
                <td>00:25.354</td>
                <td>00:46.182</td>
                <td>00:26.886</td>
                <td>yes</td>
                <td>?</td>
                <td>217 km/h</td>
                <td>73</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-13 21:06</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63298#">
                <td>5.</td>
                <td>Manu Gonzalez</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:38.525</td>
                <td>+01.442</td>
                <td>00:25.463</td>
                <td>00:46.094</td>
                <td>00:26.968</td>
                <td>yes</td>
                <td>M</td>
                <td>216 km/h</td>
                <td>16</td>
                <td><div>
                    <a class="aids autoclutch off"
                      title="Automatic clutch off"></a>
                    <a class="aids abs factory" title="ABS factory"></a>
                    <a class="aids autobrake off"
                      title="Automatic brake off"></a>
                    <a class="aids autogearbox off"
                      title="Automatic gearbox off"></a>
                    <a class="aids blip off"
                      title="Automatic throttle blip off"></a>
                    <a class="aids idealline off"
                      title="Ideal racing line off"></a>
                    <a class="aids tc factory"
                      title="Traction control factory"></a>
                  </div></td>
                <td>2025-02-11 19:36</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63468#">
                <td>6.</td>
                <td>corbo</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:38.666</td>
                <td>+01.583</td>
                <td>00:25.804</td>
                <td>00:45.788</td>
                <td>00:27.074</td>
                <td>yes</td>
                <td>?</td>
                <td>215 km/h</td>
                <td>73</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-11 23:45</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63241#">
                <td>7.</td>
                <td>Montoro</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:39.267</td>
                <td>+02.184</td>
                <td>00:25.900</td>
                <td>00:46.263</td>
                <td>00:27.104</td>
                <td>yes</td>
                <td>?</td>
                <td>216 km/h</td>
                <td>11</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-11 14:54</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=62928#">
                <td>8.</td>
                <td>Liberto Rodriguez</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:39.668</td>
                <td>+02.585</td>
                <td>00:25.258</td>
                <td>00:46.581</td>
                <td>00:27.829</td>
                <td>yes</td>
                <td>?</td>
                <td>216 km/h</td>
                <td>7</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-09 19:44</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=62935#">
                <td>9.</td>
                <td>jjojuanjo</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:40.424</td>
                <td>+03.341</td>
                <td>00:25.578</td>
                <td>00:47.654</td>
                <td>00:27.192</td>
                <td>yes</td>
                <td>?</td>
                <td>219 km/h</td>
                <td>5</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-09 21:56</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63327#">
                <td>10.</td>
                <td>Slahade</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:40.484</td>
                <td>+03.401</td>
                <td>00:25.758</td>
                <td>00:47.292</td>
                <td>00:27.434</td>
                <td>yes</td>
                <td>?</td>
                <td>214 km/h</td>
                <td>40</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-11 20:34</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=63263#">
                <td>11.</td>
                <td>IZANCAR_17</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:42.835</td>
                <td>+05.752</td>
                <td>00:26.301</td>
                <td>00:48.211</td>
                <td>00:28.323</td>
                <td>yes</td>
                <td>?</td>
                <td>215 km/h</td>
                <td>9</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-11 16:37</td>
              </tr>
              <tr class="clickableRow" href="lapdetails?lapid=62905#">
                <td>12.</td>
                <td>Rafa03</td>
                <td>
                  alpine_europa_cup

                </td>
                <td>01:44.267</td>
                <td>+07.184</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>yes</td>
                <td>?</td>
                <td>211 km/h</td>
                <td>3</td>
                <td><div>
                    <a class="aids autoclutch unknown"
                      title="Automatic clutch unknown"></a>
                    <a class="aids abs unknown" title="ABS unknown"></a>
                    <a class="aids autobrake unknown"
                      title="Automatic brake unknown"></a>
                    <a class="aids autogearbox unknown"
                      title="Automatic gearbox unknown"></a>
                    <a class="aids blip unknown"
                      title="Automatic throttle blip unknown"></a>
                    <a class="aids idealline unknown"
                      title="Ideal racing line unknown"></a>
                    <a class="aids tc unknown"
                      title="Traction control unknown"></a>
                  </div></td>
                <td>2025-02-09 19:25</td>
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
            <li><a href="/stracker/lapstat?page=0"><span
                  class="glyphicon glyphicon-fast-backward"></span></a></li>
            <li class="disabled"><a href="/stracker/lapstat?page=-1"><span
                  class="glyphicon glyphicon-backward"></span></a></li>
            <li class="active"><a href="/stracker/lapstat?page=0">1</a></li>
            <li class="disabled"><a href="/stracker/lapstat?page=1"><span
                  class="glyphicon glyphicon-forward"></span></a></li>
            <li><a href="/stracker/lapstat?page=0"><span
                  class="glyphicon glyphicon-fast-forward"></span></a></li>
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

  </body><!-- Initialize the multiselect plugin: --></html>`