import { db, Role, User, Race, Championship, Car, Circuit, CircuitLayout } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Role).values([
    { id: 1, name: 'SuperAdmin' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'TeamManager' },
    { id: 4, name: 'Driver' },
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
      team: 0,
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
      name: 'Manfield Circuit',
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

  await db.insert(Championship).values([
    {
      id: 1,
      name: 'Campeonato DTM 2020 ESP Racing 2023',
      key_search: '+ks_audi_dtm_2020 +ks_bmw_dtm_2020 +RACE',
    },

    {
      id: 2,
      name: 'Campeonato Civic JTC ESP Racing 2023',
      key_search: '+jtc_honda_civic_eg_gra +RACE',
    },

    {
      id: 3,
      name: 'Campeonato Tatuus FT-60 ESP Racing 2024',
      key_search: '+tatuus_ft_60 +RACE',
    },

    {
      id: 4,
      name: 'Super Campeonato de Mini Resistencia ESP Racing 2024',
      key_search: '+trr_ferrrari_499p +trr_porsche_963 +trr_acura_arx-06 +RACE',
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
      name: 'Lausitzring',
      filename: 'lausitzring',
      location: 'Klettwitz, Germany',
    },
  ]);

await db.insert(CircuitLayout).values([
  {
    id: 1,
    name: 'DTM',
    filename: '2023_9_10',
    circuit: 1,
    length: 4.570,
    capacity: 42,
  },
]);

}
