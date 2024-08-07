import { nullable } from 'astro/zod';
import { db, Role, Team, User, Race, Championship, Car, Circuit, CircuitLayout, isNull } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Role).values([
    { id: 1, name: 'SuperAdmin' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'TeamManager' },
    { id: 4, name: 'Driver' },
  ]);

  await db.insert(Team).values([
    {
      id: 1,
      name: 'ESP Racing',
      image:'/img/team/esp-racing.webp',
      description:'ESP RACING es el equipo matriz de la comunidad.'
    },

    {
      id: 2,
      name: 'Scuderia FunAC Community',
      image:'/img/team/funac.webp',
      description:'La Scuderia FunAC Community es un equipo de carreras virtuales que compite en diferentes campeonatos.'
    },

    {
      id: 3,
      name: 'Psytake',
      image:'/img/team/psytake.webp',
      description:'Psytake es un equipo de carreras virtuales que compite en diferentes campeonatos, muy laureado alla por donde pase.'
    },
  ]);

  await db.insert(User).values([
    {
      id: 1,
      email: 'manueljgonzalezg1698@gmail.com',
      password: '123456',
      name: 'Manu Gonzalez',
      steam_id: 76561198087515384,
      image: '/img/user/manueljgonzalezg1698@gmail.com.webp',
      races: 0,
      poles: 0,
      wins: 0,
      flaps: 0,
      podiums: 0,
      top5: 0,
      top10: 0,
      dnf: 0,
      role: 1,
      team: 3,
    },

    {
      id: 2,
      email: 'royalhunt@gmail.com',
      password: '123456',
      name: 'Royal Hunt',
      steam_id: 76561198125013447,
      image: '/img/user/royalhunt@gmail.com.webp',
      races: 0,
      poles: 0,
      wins: 0,
      flaps: 0,
      podiums: 0,
      top5: 0,
      top10: 0,
      dnf: 0,
      role: 2,
      team: 2,
    },

    {
      id: 3,
      email: 'negan@gmail.com',
      password: '123456',
      name: 'Negan',
      steam_id: 76561198321842274,
      image: '/img/user/negan@gmail.com.webp',
      races: 0,
      poles: 0,
      wins: 0,
      flaps: 0,
      podiums: 0,
      top5: 0,
      top10: 0,
      dnf: 0,
      role: 2,
      team: null,
    },
  ]);

  await db.insert(Championship).values([
    {
      id: 1,
      name: 'Campeonato DTM 2020 ESP Racing 2023',
      keysearch: '+ks_audi_dtm_2020 +ks_bmw_dtm_2020 +RACE',
    },

    {
      id: 2,
      name: 'Campeonato Civic JTC ESP Racing 2023',
      keysearch: '+jtc_honda_civic_eg_gra +RACE',
    },

    {
      id: 3,
      name: 'Campeonato Tatuus FT-60 ESP Racing 2024',
      keysearch: '+tatuus_ft_60 +RACE',
    },

    {
      id: 4,
      name: 'Super Campeonato de Mini Resistencia ESP Racing 2024',
      keysearch: '+trr_ferrrari_499p +trr_porsche_963 +trr_acura_arx-06 +RACE',
    },
  ]);

  await db.insert(Race).values([
    {
      id: 1,
      name: 'Lausistzring DTM \'21',
      filename: '2023_9_10_18_43_RACE',
      champ: 1,
    },

    {
      id: 2,
      name: 'Norisring',
      filename: '2023_9_24_18_49_RACE',
      champ: 1,
    },

    {
      id: 3,
      name: 'Hockenheimring GP',
      filename: '2023_10_8_18_41_RACE',
      champ: 1,
    },

    {
      id: 4,
      name: 'Nurburgring GP',
      filename: '2023_10_22_18_45_RACE',
      champ: 1,
    },

    {
      id: 5,
      name: 'Ahvenisto',
      filename: '2023_11_4_11_47_RACE',
      champ: 2,
    },

    {
      id: 6,
      name: 'Tsubuka Circuit Full',
      filename: '2023_11_19_18_41_RACE',
      champ: 2,
    },

    {
      id: 7,
      name: 'Sportsland SUGO',
      filename: '2023_12_3_18_48_RACE',
      champ: 2,
    },

    {
      id: 8,
      name: 'Barcelona City Circuit',
      filename: '2023_12_17_18_47_RACE',
      champ: 2,
    },

    {
      id: 9,
      name: 'Sydney Motorsport Park',
      filename: '2024_1_21_18_42_RACE',
      champ: 3,
    },

    {
      id: 10,
      name: 'Manfeild Circuit',
      filename: '2024_2_4_18_46_RACE',
      champ: 3,
    },

    {
      id: 11,
      name: 'Autodromo Nazionale di Monza',
      filename: '2024_2_18_18_46_RACE',
      champ: 3,
    },

    {
      id: 12,
      name: 'Macau Circuit da Guia',
      filename: '2024_3_3_18_50_RACE',
      champ: 3,
    },

    {
      id: 13,
      name: 'Daytona Road Course',
      filename: '2024_3_17_19_38_RACE',
      champ: 4,
    },

    {
      id: 14,
      name: 'Nurburgring Nordschleife 24h',
      filename: '2024_4_7_19_56_RACE',
      champ: 4,
    },

    {
      id: 15,
      name: 'Sebring International Raceway',
      filename: '2024_4_21_19_1_RACE',
      champ: 4,
    },

    {
      id: 16,
      name: 'Road America',
      filename: '2024_5_5_19_36_RACE',
      champ: 4,
    },

    {
      id: 17,
      name: 'Fuji International Speedway',
      filename: '2024_5_19_19_4_RACE',
      champ: 4,
    },

    {
      id: 18,
      name: 'Spa-Francorchamps',
      filename: '2024_6_2_19_31_RACE',
      champ: 4,
    },

    {
      id: 19,
      name: 'Circuit de la Sarthe',
      filename: '2024_6_16_20_19_RACE',
      champ: 4,
    },

  ]);

  await db.insert(Car).values([
    {
      id: 1,
      filename: 'ks_audi_dtm_2020',
      brand: 'Audi',
      imgbrand: '/img/brand/audi.webp',
      model: 'RS 5 DTM 2020',
      year: 2020,
      class: 'DTM / GT500',
      power: 610,
      torque: 609,
      weight: 1056,
      description: 'Audi Sport has been using the RS 5 Coupé in the DTM since 2013. The championship car of the 2020 season is back at the start with the four-cylinder turbo of the Audi RS 5 DTM. It is the most efficient and powerful engine in Audi\'s DTM history. The engineers got over 610 hp from the 2-liter engine. Audi has impressively demonstrated the superiority of its technology by winning the title in all categories.',
    },

    {
      id: 2,
      filename: 'ks_audi_dtm_2020',
      brand: 'BMW',
      imgbrand: '/img/brand/bmw.webp',
      model: 'M4 DTM 2020',
      year: 2020,
      class: 'DTM / GT500',
      power: 610,
      torque: 609,
      weight: 1056,
      description: 'The new BMW M4 DTM is the most powerful DTM car that BMW M Motorsport has ever built. Fitted with concentrated turbo power, it is ready to continue BMW’s success story in the DTM. More than 600 hp, significantly reduced vehicle weight, top speeds of up to 300 km/h and the push-to-pass function, introduced for the 2019 season, make the most hotly contested touring car series even faster and more spectacular.',
    },

    {
      id: 3,
      filename: 'jtc_honda_civic_eg_gra',
      brand: 'Honda',
      imgbrand: '/img/brand/audi.webp',
      model: 'Civic SiR-II (JTC Div.III)',
      year: 1991,
      class: 'JTC Div.III',
      power: 210,
      torque: 230,
      weight: 725,
      description: 'The fifth generation of the Honda Civic debuted in Japan on September 10, 1991. At its introduction in 1991, it won the Car of the Year Japan Award for the second time. In Japan, as well as a few other export locations, the VTi was offered with two different motors: the B16A2/3 (160 PS DOHC VTEC) and the D15B (130 PS SOHC VTEC). The D15B shares the same head as the US Civic Si (D16Z6) but features a unique block, crank, and rods. the car shared the 1.5 L displacement of the other D15 blocks, but the rods were the same length as the D16\'s (137mm) and a better rod to stroke ratio (1.63) rather than the normal D15\'s ratio of 1.59. Despite this, the crank and bearing sizes were not the same.',
    },

    {
      id: 4,
      filename: 'tatuus_ft_60',
      brand: 'Tatuus',
      imgbrand: '/img/brand/tatuus.webp',
      model: 'Toyota FT-60',
      year: 2020,
      class: 'Formula 4',
      power: 268,
      torque: 428,
      weight: 665,
      description: 'The Toyota Racing Series is an incubator and showcase for the next generation of New Zealand racing talent. The Series offers emerging drivers the chance to gain valuable experience with carbon-fibre composite chassis, aerodynamics and slick tyres. Tatuus FT-60 Technical specifications Engine Toyota 8AR-FTS 2.0 L (122 cu. in) inline-4 spark-ignition DOHC engine; turbocharged, longitudinally mounted; mid-engine, rear-wheel drive layout Transmission SADEV SL-R 82 6-speed semi-automatic sequential gearbox.',
    },

    {
      id: 5,
      filename: 'trr_acura_arx-06',
      brand: 'Acura',
      imgbrand: '/img/brand/acura.webp',
      model: 'ARX-06',
      year: 2023,
      class: 'LMDh',
      power: 584,
      torque: 505,
      weight: 1030,
      description: 'The Acura ARX-06 is a sports prototype racing car designed by Honda Performance Development and built by Oreca. It features Acura-specific bodywork and aerodynamics based around an all-new ORECA LMDh chassis which utilizes an electrified hybrid power unit featuring an equally new, bespoke twin-turbocharged 2.4 liter V6 internal combustion engine designed, developed and manufactured by Honda Performance Development (HPD). It is designed to the Le Mans Daytona h regulations, and will compete in the GTP class in the IMSA SportsCar Championship1. The ARX-06 debuted alongside the BMW M Hybrid V8, Cadillac V-LMDh and Porsche 963 at the 2023 season opener of the IMSA SportsCar Championship at the Daytona International Speedway.',
    },

    {
      id: 6,
      filename: 'trr_bmw_m_hybrid_V8',
      brand: 'BMW',
      imgbrand: '/img/brand/bmw.webp',
      model: 'M Hybrid v8',
      year: 2023,
      class: 'LMDh',
      power: 477,
      torque: 554,
      weight: 1080,
      description: 'The BMW M Hybrid V8 is a race car that can be thought of as a culmination of every M technology to date. It uses a Dallara chassis and is powered by the P66/3 eight-cylinder turbo engine with supplementary electric drive. The combustion engine is based on the DTM unit used in the BMW M4 DTM in 2017 and 20181. The roughly 2,200-pound BMW M Hybrid V8 gets all its electric power from brake regeneration. As of the 2023 season, the new car will be battling it out for overall victory in the new GTP class of the IMSA series, at such prestigious classics as the 24 Hours of Daytona, the 12 Hours of Sebring, and the iconic Petit Le Mans at Road Atlanta. From 2024, BMW M Motorsport will also compete in the FIA World Endurance Championship again with the car.',
    },

    {
      id: 7,
      filename: 'trr_cadillac_v-series.r',
      brand: 'Cadillac',
      imgbrand: '/img/brand/cadillac.webp',
      model: 'V-Series.R',
      year: 2023,
      class: 'LMDh',
      power: 584,
      torque: 534,
      weight: 1030,
      description: 'The Cadillac V-Series.R, originally named the Cadillac V-LMDh, is a sports prototype racing car designed by Cadillac and built by Dallara. It is designed to the Le Mans Daytona h regulations, and debuted in the IMSA SportsCar Championship at the season opening 24 Hours of Daytona. The car is also contesting the FIA World Endurance Championship from 2023 onwards. The engine’s 5.5L displacement is the largest displacement of any of the GTP cars debuted in the revival of the GTP class at the 2023 24 Hours of Daytona.',
    },

    {
      id: 8,
      filename: 'trr_ferrrari_499p',
      brand: 'Ferrari',
      imgbrand: '/img/brand/ferrari.webp',
      model: '499P',
      year: 2023,
      class: 'LMH',
      power: 584,
      torque: 578,
      weight: 1030,
      description: 'The Ferrari 499P is a sports prototype built by Scuderia Ferrari to compete in the FIA World Endurance Championship in the Le Mans Hypercar category. The car was unveiled at the Ferrari Finali Mondiali, Ferrari’s annual finale for their one-make series, Ferrari Challenge. The introduction of the 499P marks 50 years since Ferrari last fielded a factory-backed sports prototype that contested for the overall win at the 24 Hours of Le Mans. The car made its competitive debut at the season-opening round of the 2023 FIA World Endurance Championship, the 2023 1000 Miles of Sebring.',
    },

    {
      id: 9,
      filename: 'trr_peugeot_9x8',
      brand: 'Peugeot',
      imgbrand: '/img/brand/peugeot.webp',
      model: '9X8',
      year: 2022,
      class: 'LMH',
      power: 671,
      torque: 664,
      weight: 1030,
      description: 'The Peugeot 9X8 is a four-wheel-drive racing prototype with a powertrain developed under the control of Peugeot Sport’s specialists. The car has a 700-hp twin-turbo V-6 driving the rear wheels, and a 268-hp electric motor on the front axle. The rear wheels are driven by a 2.6-litre, bi-turbo, 520kW, V6 internal-combustion engine (ICE), while a bespoke, high-performance 200kW electric motor drives the front wheels. The car weighs 2271 pounds and has a total length of 196.85 inches and a width of 78.7 inches.',
    },

    {
      id: 10,
      filename: 'trr_porsche_963',
      brand: 'Porsche',
      imgbrand: '/img/brand/porsche.webp',
      model: '963',
      year: 2023,
      class: 'LMDh',
      power: 670,
      torque: 777,
      weight: 1040,
      description: 'The Porsche 963 is an LMDh sports prototype racing car designed by Porsche and built by Multimatic, to compete in the Hypercar and GTP (Grand Touring Protoype) classes in the FIA World Endurance Championship and IMSA SportsCar Championship, respectively. It has a 4.6-liter V8 engine with twin turbochargers, including support from an electric motor. Weighing around 1,000 kilograms, the race car is powered by a total output of 500 kW (680 PS). The 963 name draws inspiration from the Porsche 956 and Porsche 962 that raced in the 1980s, which also competed in American and European racing series. The car was revealed at the 2022 Goodwood Festival of Speed, with a traditional red, white, and black livery.',
    },

    {
      id: 11,
      filename: 'trr_toyota_gr010',
      brand: 'Toyota',
      imgbrand: '/img/brand/toyota.webp',
      model: 'GR010 Hybrid',
      year: 2021,
      class: 'LMH',
      power: 670,
      torque: 777,
      weight: 1030,
      description: 'The Toyota GR010 Hybrid is a sports prototype racing car developed for the 2021 Le Mans Hypercar rules in the FIA World Endurance Championship. It is the successor of the Toyota TS050 Hybrid, which competed in the WEC from 2016 to 2020, achieving 2 double WEC world titles and 3 straight victories at the 24 Hours of Le Mans from 2018 to 2020. The GR010 HYBRID was developed by TOYOTA GAZOO Racing (TGR) for the 2021 series of the FIA World Endurance Championship (WEC) in accordance with the Le Mans Hypercar (LMH) regulations, in order to compete in the pinnacle Hypercar class.',
    },

  ]);

  await db.insert(Circuit).values([
    {
      id: 1,
      name: 'Eurospeedway Lausitzring',
      filename: 'lausitzring',
      location: 'Klettwitz, Alemania',
    },

    {
      id: 2,
      name: 'Norisring',
      filename: 'norisring',
      location: 'Nuremberg, Alemania',
    },

    {
      id: 3,
      name: 'Hockenheimring Baden-Württemberg',
      filename: 't78_hockenheimring',
      location: 'Hockenheim, Alemania',
    },

    {
      id: 4,
      name: 'Circuito de Nurgurgring',
      filename: 'ks_nurburgring',
      location: 'Nurburg, Alemania',
    },

    {
      id: 5,
      name: 'Ahvenisto',
      filename: 'ahvenisto_rc',
      location: 'Hämeenlinna, Finlandia',
    },

    {
      id: 6,
      name: 'Tsukuba Circuit',
      filename: 'ddm_gts_tsukuba',
      location: 'Shimotsuma, Japón',
    },

    {
      id: 7,
      name: 'Sportsland SUGO',
      filename: 'sportsland-sugo',
      location: 'Murata, Japón',
    },

    {
      id: 8,
      name: 'Barcelona City Circuit',
      filename: 'acu_barcelona-city',
      location: 'Barcelona, España',
    },

    {
      id: 9,
      name: 'Sydney Motorsport Park',
      filename: 'rmi_sydney_motorsport_park',
      location: 'Eastern Creek NSW, Australia',
    },

    {
      id: 10,
      name: 'Manfeild Circuit',
      filename: 'manfeild',
      location: 'Feilding, Nueva Zelanda',
    },

    {
      id: 11,
      name: 'Autodromo Nazionale di Monza',
      filename: 'monza',
      location: 'Monza, Italia',
    },

    {
      id: 12,
      name: 'Macau Circuit da Guia',
      filename: 'rt_macau',
      location: 'Macau, China',
    },

    {
      id: 13,
      name: 'Daytona International Speedway',
      filename: 'rt_daytona',
      location: 'Daytona Beach, FL, Estados Unidos',
    },

    {
      id: 14,
      name: 'Nurburgring Nordschleife',
      filename: 'ks_nordschleife',
      location: 'Nurburg, Alemania',
    },

    {
      id: 15,
      name: 'Sebring International Raceway',
      filename: 'rt_sebring',
      location: 'Sebring, FL, Estados Unidos',
    },

    {
      id: 16,
      name: 'Road America',
      filename: 'lilski_road_america',
      location: 'Elkhart Lake, WI, Estados Unidos',
    },

    {
      id: 17,
      name: 'Fuji International Speedway',
      filename: 'rt_fuji_speedway',
      location: 'Oyama-Cho, Japón',
    },

    {
      id: 18,
      name: 'Spa-Francorchamps',
      filename: 'spa',
      location: 'Stavelot, Bélgica',
    },

    {
      id: 19,
      name: 'Circuit de la Sarthe (Le Mans)',
      filename: 'sx_lemans',
      location: 'Le Mans, Francia',
    },

  ]);

  await db.insert(CircuitLayout).values([
    {
      id: 1,
      name: 'DTM 2021',
      filename: 'layout_dtm21',
      circuit: 1,
      length: 4570,
      capacity: 42,
    },

    {
      id: 2,
      name: 'GP',
      filename: 'layout_gp',
      circuit: 1,
      length: 4445,
      capacity: 42,
    },

    {
      id: 3,
      name: 'DTM',
      filename: 'layout_dtm',
      circuit: 1,
      length: 3288,
      capacity: 42,
    },

    {
      id: 4,
      name: 'GP Multiplayer',
      filename: 'layout_gp_mp',
      circuit: 1,
      length: 4445,
      capacity: 42,
    },

    {
      id: 5,
      name: 'Oval',
      filename: 'layout_oval',
      circuit: 1,
      length: 3231,
      capacity: 42,
    },

    {
      id: 6,
      name: '',
      filename: '',
      circuit: 2,
      length: 2170,
      capacity: 36,
    },

    {
      id: 7,
      name: 'GP',
      filename: 'gp',
      circuit: 3,
      length: 4574,
      capacity: 27,
    },

    {
      id: 8,
      name: '',
      filename: 'dcgp',
      circuit: 3,
      length: 4574,
      capacity: 32,
    },

    {
      id: 9,
      name: 'GP OSRW',
      filename: 'gp_osrw',
      circuit: 3,
      length: 4574,
      capacity: 32,
    },

    {
      id: 10,
      name: 'National',
      filename: 'national',
      circuit: 3,
      length: 3693,
      capacity: 27,
    },

    {
      id: 11,
      name: 'Short 1',
      filename: 'short1',
      circuit: 3,
      length: 2608,
      capacity: 27,
    },

    {
      id: 12,
      name: 'Short 2',
      filename: 'short2',
      circuit: 3,
      length: 2624,
      capacity: 27,
    },

    {
      id: 13,
      name: 'GP',
      filename: 'layout_gp_a',
      circuit: 4,
      length: 5148,
      capacity: 24,
    },

    {
      id: 14,
      name: 'GP (Formula) OSWR',
      filename: 'layout_gp_a_osrw',
      circuit: 4,
      length: 5148,
      capacity: 36,
    },

    {
      id: 15,
      name: 'GP (GT)',
      filename: 'layout_gp_b',
      circuit: 4,
      length: 5137,
      capacity: 24,
    },

    {
      id: 16,
      name: 'GP (GT) OSRW',
      filename: 'layout_gp_b_osrw',
      circuit: 4,
      length: 5137,
      capacity: 36,
    },

    {
      id: 17,
      name: 'Reverse GT',
      filename: 'layout_reversegp_gt',
      circuit: 4,
      length: 5137,
      capacity: 28,
    },

    {
      id: 18,
      name: 'Reverse Sprint (GT)',
      filename: 'layout_reversesprint_gt',
      circuit: 4,
      length: 3618,
      capacity: 28,
    },

    {
      id: 19,
      name: 'Sprint',
      filename: 'layout_sprint_a',
      circuit: 4,
      length: 3629,
      capacity: 24,
    },

    {
      id: 20,
      name: 'Sprint (Formula) ETRC',
      filename: 'layout_sprint_a_etrc',
      circuit: 4,
      length: 3618,
      capacity: 36,
    },

    {
      id: 21,
      name: 'Sprint (Formula) OSRW',
      filename: 'layout_sprint_a_osrw',
      circuit: 4,
      length: 3629,
      capacity: 36,
    },

    {
      id: 22,
      name: 'Sprint (GT)',
      filename: 'layout_sprint_b',
      circuit: 4,
      length: 3618,
      capacity: 24,
    },

    {
      id: 23,
      name: 'Sprint (GT) OSRW',
      filename: 'layout_sprint_b_osrw',
      circuit: 4,
      length: 3618,
      capacity: 36,
    },

    {
      id: 24,
      name: '',
      filename: 'normal',
      circuit: 5,
      length: 2800,
      capacity: 30,
    },

    {
      id: 25,
      name: 'Pit Online',
      filename: 'pit',
      circuit: 5,
      length: 2800,
      capacity: 31,
    },

    {
      id: 26,
      name: 'Full',
      filename: 'full',
      circuit: 6,
      length: 2045,
      capacity: 31,
    },

    {
      id: 27,
      name: 'Short',
      filename: 'short',
      circuit: 6,
      length: 1560,
      capacity: 30,
    },

    {
      id: 28,
      name: 'Full',
      filename: 'sugo',
      circuit: 7,
      length: 3704,
      capacity: 31,
    },

    {
      id: 29,
      name: 'West',
      filename: 'sugo_west',
      circuit: 7,
      length: 984,
      capacity: 15,
    },

    {
      id: 30,
      name: '',
      filename: 'normal',
      circuit: 8,
      length: 5194,
      capacity: 31,
    },

    {
      id: 31,
      name: 'Reverse',
      filename: 'reverse',
      circuit: 8,
      length: 5194,
      capacity: 30,
    },

    {
      id: 32,
      name: 'Gardner GP Circuit',
      filename: 'gardner',
      circuit: 9,
      length: 3930,
      capacity: 34,
    },

    {
      id: 33,
      name: 'Amaroo South Circuit',
      filename: 'amaroo',
      circuit: 9,
      length: 1800,
      capacity: 24,
    },

    {
      id: 34,
      name: 'Brabham Circuit',
      filename: 'brabham',
      circuit: 9,
      length: 4500,
      capacity: 34,
    },

    {
      id: 35,
      name: 'Druitt North Circuit',
      filename: 'druitt',
      circuit: 9,
      length: 2800,
      capacity: 34,
    },

    {
      id: 36,
      name: 'Grand Prix',
      filename: 'gp',
      circuit: 10,
      length: 3030,
      capacity: 32,
    },

    {
      id: 37,
      name: 'Full',
      filename: 'full',
      circuit: 10,
      length: 4511,
      capacity: 32,
    },

    {
      id: 38,
      name: 'Club',
      filename: 'club',
      circuit: 10,
      length: 1500,
      capacity: 20,
    },

    {
      id: 39,
      name: 'Grand Prix Reverse',
      filename: 'grp_reverse',
      circuit: 10,
      length: 3030,
      capacity: 32,
    },

    {
      id: 40,
      name: '',
      filename: '',
      circuit: 11,
      length: 5793,
      capacity: 26,
    },

    {
      id: 41,
      name: '2021',
      filename: '2021',
      circuit: 11,
      length: 5793,
      capacity: 26,
    },

    {
      id: 42,
      name: 'OSRW',
      filename: 'monza_osrw',
      circuit: 11,
      length: 5793,
      capacity: 36,
    },

    {
      id: 43,
      name: 'Reverse Layout',
      filename: 'monza_reverse',
      circuit: 11,
      length: 5793,
      capacity: 26,
    },

    {
      id: 44,
      name: 'Wet',
      filename: 'monza_wet',
      circuit: 11,
      length: 5793,
      capacity: 36,
    },

    {
      id: 45,
      name: '',
      filename: '',
      circuit: 12,
      length: 6102,
      capacity: 31,
    },

    {
      id: 46,
      name: 'Moto',
      filename: 'moto',
      circuit: 13,
      length: 5626,
      capacity: 40,
    },

    {
      id: 47,
      name: 'Moto 2008',
      filename: 'motohist',
      circuit: 13,
      length: 5729,
      capacity: 40,
    },

    {
      id: 48,
      name: 'Moto 2008 (with Nascar Chicanes)',
      filename: 'motohistnascar',
      circuit: 13,
      length: 5727,
      capacity: 50,
    },

    {
      id: 49,
      name: 'Nascar',
      filename: 'nascar',
      circuit: 13,
      length: 5710,
      capacity: 40,
    },

    {
      id: 50,
      name: 'Road Course',
      filename: 'sportscar',
      circuit: 13,
      length: 5729,
      capacity: 50,
    },

    {
      id: 51,
      name: 'Tri-Oval',
      filename: 'tri-oval',
      circuit: 13,
      length: 4023,
      capacity: 50,
    },

    {
      id: 52,
      name: 'Endurance',
      filename: 'endurance',
      circuit: 14,
      length: 25375,
      capacity: 24,
    },

    {
      id: 53,
      name: 'Endurance 108',
      filename: 'endurance_108',
      circuit: 14,
      length: 25375,
      capacity: 108,
    },

    {
      id: 54,
      name: 'Endurance Cup',
      filename: 'endurance_cup',
      circuit: 14,
      length: 24433,
      capacity: 24,
    },

    {
      id: 55,
      name: 'Endurance Cup 108',
      filename: 'endurance_cup_108',
      circuit: 14,
      length: 24433,
      capacity: 108,
    },

    {
      id: 56,
      name: '',
      filename: 'nordschleife',
      circuit: 14,
      length: 20832,
      capacity: 24,
    },

    {
      id: 57,
      name: '24h 2022',
      filename: 'nordschleife_24hours_2022',
      circuit: 14,
      length: 25375,
      capacity: 72,
    },

    {
      id: 58,
      name: 'Wet',
      filename: 'nordschleife_wet',
      circuit: 14,
      length: 20832,
      capacity: 24,
    },

    {
      id: 59,
      name: 'Reverse Tourist',
      filename: 'reverse_touristenfahrten',
      circuit: 14,
      length: 19100,
      capacity: 32,
    },

    {
      id: 60,
      name: 'Tourist',
      filename: 'touristenfahrten',
      circuit: 14,
      length: 19100,
      capacity: 32,
    },

    {
      id: 61,
      name: 'Tourist Wet',
      filename: 'touristenfahrten_wet',
      circuit: 14,
      length: 19100,
      capacity: 32,
    },

    {
      id: 62,
      name: 'Raceday',
      filename: 'raceday',
      circuit: 15,
      length: 6004,
      capacity: 32,
    },

    {
      id: 63,
      name: 'IMSA 12 Hours 2023',
      filename: 'imsa2023',
      circuit: 15,
      length: 6004,
      capacity: 60,
    },

    {
      id: 64,
      name: 'Raceday 50 pits',
      filename: 'raceday_rs_50',
      circuit: 15,
      length: 6004,
      capacity: 50,
    },

    {
      id: 65,
      name: 'Trackday',
      filename: 'trackday',
      circuit: 15,
      length: 6004,
      capacity: 32,
    },

    {
      id: 66,
      name: 'WEC 1000 miles 2023',
      filename: 'wec2023',
      circuit: 15,
      length: 6004,
      capacity: 60,
    },

    {
      id: 67,
      name: '',
      filename: '',
      circuit: 16,
      length: 6515,
      capacity: 43,
    },

    {
      id: 68,
      name: 'Moto',
      filename: 'moto',
      circuit: 16,
      length: 6515,
      capacity: 43,
    },

    {
      id: 69,
      name: 'GP',
      filename: 'layout_gp',
      circuit: 17,
      length: 4549,
      capacity: 36,
    },

    {
      id: 70,
      name: 'GP Short',
      filename: 'layout_gpshort',
      circuit: 18,
      length: 4526,
      capacity: 36,
    },

    {
      id: 71,
      name: '',
      filename: '',
      circuit: 18,
      length: 7004,
      capacity: 24,
    },

    {
      id: 72,
      name: '2022',
      filename: '2022',
      circuit: 18,
      length: 7004,
      capacity: 47,
    },

    {
      id: 73,
      name: 'WEC 2022',
      filename: 'layout_wec_2022',
      circuit: 18,
      length: 7004,
      capacity: 48,
    },

    {
      id: 74,
      name: 'WEC 2023',
      filename: 'layout_wec_2023',
      circuit: 18,
      length: 7004,
      capacity: 48,
    },

    {
      id: 75,
      name: 'OSRW',
      filename: 'spa_osrw',
      circuit: 18,
      length: 7004,
      capacity: 40,
    },

    {
      id: 76,
      name: 'Reverse Layout',
      filename: 'spa_reverse',
      circuit: 18,
      length: 7004,
      capacity: 24,
    },

    {
      id: 77,
      name: 'Wet',
      filename: 'spa_wet',
      circuit: 18,
      length: 7004,
      capacity: 40,
    },

    {
      id: 78,
      name: '24h Layout',
      filename: 'chicane',
      circuit: 19,
      length: 13626,
      capacity: 70,
    },

    {
      id: 79,
      name: '24h Special Start',
      filename: 'chicane_24h_race',
      circuit: 19,
      length: 13626,
      capacity: 70,
    },

    {
      id: 80,
      name: '24h Layout Performance',
      filename: 'chicaneperf',
      circuit: 19,
      length: 13626,
      capacity: 70,
    },

    {
      id: 81,
      name: 'No Chicane',
      filename: 'nochicane',
      circuit: 19,
      length: 3100,
      capacity: 70,
    },

    {
      id: 82,
      name: 'Wet',
      filename: 'nochicaneperf',
      circuit: 19,
      length: 3100,
      capacity: 70,
    },


  ]);

}