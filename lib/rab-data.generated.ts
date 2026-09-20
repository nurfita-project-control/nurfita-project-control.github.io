// Generated from Rekap_Kebutuhan_Tanah_dan_Tanaman_REV-7M3.xlsx.
// Source basis: BAKN Pekerjaan Landscape - Negosiasi Tahap 2, 24 Juli 2026.
export type RabPlantRequirement = { name: string; unit: string; quantity: number };

export type RabAreaRequirement = {
  id: string;
  code: string;
  wing: "Selatan" | "Utara";
  name: string;
  page: number;
  soilM3: number;
  formationM2: number;
  plants: RabPlantRequirement[];
};

export const rabAreaRequirements: RabAreaRequirement[] = [
  {
    "id": "selatan-b1",
    "code": "B1",
    "wing": "Selatan",
    "name": "TAMAN TYPE - B1",
    "page": 1,
    "soilM3": 18.9,
    "formationM2": 63,
    "plants": [
      {
        "name": "Lidah Mertua Daun Kuning Hijau",
        "unit": "polybag",
        "quantity": 318
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 882
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 936
      }
    ]
  },
  {
    "id": "selatan-b2",
    "code": "B2",
    "wing": "Selatan",
    "name": "TAMAN TYPE - B2",
    "page": 1,
    "soilM3": 63.75,
    "formationM2": 212.5,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 360
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 15
      },
      {
        "name": "Lidah Mertua Daun Kuning Hijau",
        "unit": "polybag",
        "quantity": 865
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 15
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 325
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 4615
      }
    ]
  },
  {
    "id": "selatan-b3",
    "code": "B3",
    "wing": "Selatan",
    "name": "TAMAN TYPE - B3",
    "page": 1,
    "soilM3": 12.75,
    "formationM2": 42.5,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 164
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 35
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 64
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 1349
      }
    ]
  },
  {
    "id": "selatan-b4",
    "code": "B4",
    "wing": "Selatan",
    "name": "TAMAN TYPE - B4",
    "page": 1,
    "soilM3": 67.824,
    "formationM2": 226.08,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 176
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 12
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 3132
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 3358
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 12
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 110
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 380
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 1660
      }
    ]
  },
  {
    "id": "selatan-bak-b1",
    "code": "BAK-B1",
    "wing": "Selatan",
    "name": "BAK TANAMAN TYPE-B1 ( 1 UNIT )",
    "page": 1,
    "soilM3": 38.8,
    "formationM2": 77.6,
    "plants": [
      {
        "name": "Crysopogon",
        "unit": "polybag",
        "quantity": 1380
      },
      {
        "name": "Lee Kuan Yew",
        "unit": "polybag",
        "quantity": 960
      }
    ]
  },
  {
    "id": "selatan-bak-b2",
    "code": "BAK-B2",
    "wing": "Selatan",
    "name": "BAK TANAMAN TYPE-B2 ( 1 UNIT )",
    "page": 1,
    "soilM3": 68.4,
    "formationM2": 136.8,
    "plants": [
      {
        "name": "Alamanda",
        "unit": "polybag",
        "quantity": 63
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 3348
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 2403
      }
    ]
  },
  {
    "id": "selatan-bak-b3",
    "code": "BAK-B3",
    "wing": "Selatan",
    "name": "BAK TANAMAN TYPE-B3 ( 1 UNIT )",
    "page": 1,
    "soilM3": 209.38,
    "formationM2": 418.76,
    "plants": [
      {
        "name": "Crysopogon",
        "unit": "polybag",
        "quantity": 7600
      },
      {
        "name": "Kamboja Bali",
        "unit": "polybag",
        "quantity": 76
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 8968
      }
    ]
  },
  {
    "id": "selatan-void-v1",
    "code": "VOID-V1",
    "wing": "Selatan",
    "name": "BAK TANAMAN VOID TYPE-V1",
    "page": 1,
    "soilM3": 15.33,
    "formationM2": 30.66,
    "plants": [
      {
        "name": "Sirih",
        "unit": "polybag",
        "quantity": 1104
      }
    ]
  },
  {
    "id": "selatan-void-v2",
    "code": "VOID-V2",
    "wing": "Selatan",
    "name": "BAK TANAMAN VOID TYPE-V2",
    "page": 1,
    "soilM3": 92.88,
    "formationM2": 185.76,
    "plants": [
      {
        "name": "Sirih",
        "unit": "polybag",
        "quantity": 6688
      }
    ]
  },
  {
    "id": "selatan-void-v3",
    "code": "VOID-V3",
    "wing": "Selatan",
    "name": "BAK TANAMAN VOID TYPE-V3",
    "page": 1,
    "soilM3": 16.53,
    "formationM2": 33.06,
    "plants": [
      {
        "name": "Sirih",
        "unit": "polybag",
        "quantity": 1188
      }
    ]
  },
  {
    "id": "selatan-pergola",
    "code": "PERGOLA",
    "wing": "Selatan",
    "name": "BAK TANAMAN PADA PERGOLA",
    "page": 1,
    "soilM3": 56.58,
    "formationM2": 113.16,
    "plants": [
      {
        "name": "Bintang Terang / Ivy",
        "unit": "polybag",
        "quantity": 984
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 3936
      }
    ]
  },
  {
    "id": "selatan-panel-b",
    "code": "PANEL-B",
    "wing": "Selatan",
    "name": "BAK TANAMAN PANEL TYPE-B",
    "page": 2,
    "soilM3": 0,
    "formationM2": 0,
    "plants": [
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 9450
      },
      {
        "name": "Paku-pakuan",
        "unit": "polybag",
        "quantity": 9450
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 20790
      }
    ]
  },
  {
    "id": "selatan-luar",
    "code": "LUAR",
    "wing": "Selatan",
    "name": "Area Luar Bangunan",
    "page": 2,
    "soilM3": 2078.595,
    "formationM2": 6928.65,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 5025
      },
      {
        "name": "Cengal Pasir",
        "unit": "batang",
        "quantity": 13
      },
      {
        "name": "Damar",
        "unit": "batang",
        "quantity": 14
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "polybag",
        "quantity": 11
      },
      {
        "name": "Lily Bunga Kuning",
        "unit": "polybag",
        "quantity": 9150
      },
      {
        "name": "Ophiopogon Daun Panjang",
        "unit": "polybag",
        "quantity": 27600
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 3960
      },
      {
        "name": "Pule",
        "unit": "batang",
        "quantity": 19
      },
      {
        "name": "Sirih",
        "unit": "polybag",
        "quantity": 64
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 1450
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 126000
      }
    ]
  },
  {
    "id": "utara-a1.1",
    "code": "A1.1",
    "wing": "Utara",
    "name": "TAMAN TYPE - A1.1",
    "page": 2,
    "soilM3": 15.6,
    "formationM2": 52,
    "plants": [
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 949
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 313
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 5
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 28
      },
      {
        "name": "Rumput Gajah Mini",
        "unit": "m2",
        "quantity": 11.12
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 609
      }
    ]
  },
  {
    "id": "utara-a1.2",
    "code": "A1.2",
    "wing": "Utara",
    "name": "TAMAN TYPE - A1.2",
    "page": 2,
    "soilM3": 15.6,
    "formationM2": 52,
    "plants": [
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 601
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 268
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 5
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 24
      },
      {
        "name": "Rumput Gajah Mini",
        "unit": "m2",
        "quantity": 8.04
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 372
      }
    ]
  },
  {
    "id": "utara-a2",
    "code": "A2",
    "wing": "Utara",
    "name": "TAMAN TYPE - A2",
    "page": 2,
    "soilM3": 13.5,
    "formationM2": 45,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 116
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 343
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 686
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 75
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 216
      }
    ]
  },
  {
    "id": "utara-a3",
    "code": "A3",
    "wing": "Utara",
    "name": "TAMAN TYPE - A3",
    "page": 2,
    "soilM3": 16.2,
    "formationM2": 54,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 45
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 392
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 784
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 74
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 432
      }
    ]
  },
  {
    "id": "utara-a4",
    "code": "A4",
    "wing": "Utara",
    "name": "TAMAN TYPE - A4",
    "page": 3,
    "soilM3": 53.58,
    "formationM2": 178.6,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 86
      },
      {
        "name": "Dracaena Kuning Hijau",
        "unit": "polybag",
        "quantity": 3
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 5
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 1600
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "m2",
        "quantity": 986
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 4
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 1
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 284
      },
      {
        "name": "Pucuk Merah",
        "unit": "batang",
        "quantity": 4
      },
      {
        "name": "Rumput Gajah Mini",
        "unit": "m2",
        "quantity": 31.01
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 189
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 1212
      }
    ]
  },
  {
    "id": "utara-a5.1",
    "code": "A5.1",
    "wing": "Utara",
    "name": "TAMAN TYPE - A5.1",
    "page": 3,
    "soilM3": 27.07,
    "formationM2": 90.23,
    "plants": [
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 12
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 1095
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "m2",
        "quantity": 954
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 9
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 136
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 928
      }
    ]
  },
  {
    "id": "utara-a5.2",
    "code": "A5.2",
    "wing": "Utara",
    "name": "TAMAN TYPE - A5.2",
    "page": 3,
    "soilM3": 25.83,
    "formationM2": 86.1,
    "plants": [
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 12
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 1095
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "m2",
        "quantity": 954
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 9
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 136
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 928
      }
    ]
  },
  {
    "id": "utara-a6",
    "code": "A6",
    "wing": "Utara",
    "name": "TAMAN TYPE - A6",
    "page": 3,
    "soilM3": 76.302,
    "formationM2": 254.34,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 152
      },
      {
        "name": "Dracaena Kuning Hijau",
        "unit": "polybag",
        "quantity": 5
      },
      {
        "name": "Gerbera",
        "unit": "polybag",
        "quantity": 130
      },
      {
        "name": "Kalatea",
        "unit": "polybag",
        "quantity": 149
      },
      {
        "name": "Krisan",
        "unit": "polybag",
        "quantity": 164
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 2787
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "m2",
        "quantity": 679
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 4
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 284
      },
      {
        "name": "Pucuk Merah",
        "unit": "batang",
        "quantity": 4
      },
      {
        "name": "Rumput Gajah Mini",
        "unit": "m2",
        "quantity": 57.95
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 189
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 2334
      }
    ]
  },
  {
    "id": "utara-a7.1",
    "code": "A7.1",
    "wing": "Utara",
    "name": "TAMAN TYPE - A7.1",
    "page": 3,
    "soilM3": 54,
    "formationM2": 180,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 188
      },
      {
        "name": "Cengal Pasir",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Dracaena Kuning Hijau",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 3187
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 862
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 5
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 142
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 108
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 1907
      }
    ]
  },
  {
    "id": "utara-a7.2",
    "code": "A7.2",
    "wing": "Utara",
    "name": "TAMAN TYPE - A7.2",
    "page": 3,
    "soilM3": 42.075,
    "formationM2": 140.25,
    "plants": [
      {
        "name": "Aglaonema",
        "unit": "polybag",
        "quantity": 188
      },
      {
        "name": "Cengal Pasir",
        "unit": "batang",
        "quantity": 4
      },
      {
        "name": "Dracaena Kuning Hijau",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Landep",
        "unit": "polybag",
        "quantity": 2906
      },
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 207
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 6
      },
      {
        "name": "Parahyba",
        "unit": "batang",
        "quantity": 5
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 142
      },
      {
        "name": "Spathiphyllum",
        "unit": "polybag",
        "quantity": 54
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 1790
      }
    ]
  },
  {
    "id": "utara-a.a",
    "code": "A.a",
    "wing": "Utara",
    "name": "TAMAN TYPE - A.a",
    "page": 4,
    "soilM3": 55.189,
    "formationM2": 183.962,
    "plants": [
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 4143
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Spider Lily",
        "unit": "polybag",
        "quantity": 884
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 2192
      }
    ]
  },
  {
    "id": "utara-a.b",
    "code": "A.b",
    "wing": "Utara",
    "name": "TAMAN TYPE - A.b",
    "page": 4,
    "soilM3": 68.127,
    "formationM2": 227.091,
    "plants": [
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 5316
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Spider Lily",
        "unit": "polybag",
        "quantity": 442
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 2256
      }
    ]
  },
  {
    "id": "utara-a.c",
    "code": "A.c",
    "wing": "Utara",
    "name": "TAMAN TYPE - A.c",
    "page": 4,
    "soilM3": 70.499,
    "formationM2": 234.997,
    "plants": [
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 5930
      },
      {
        "name": "Palem Chamaedorea",
        "unit": "batang",
        "quantity": 3
      },
      {
        "name": "Spider Lily",
        "unit": "polybag",
        "quantity": 442
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 1277
      }
    ]
  },
  {
    "id": "utara-a.d",
    "code": "A.d",
    "wing": "Utara",
    "name": "TAMAN TYPE - A.d",
    "page": 4,
    "soilM3": 7.914,
    "formationM2": 26.38,
    "plants": [
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 942
      },
      {
        "name": "Spider Lily",
        "unit": "polybag",
        "quantity": 268
      }
    ]
  },
  {
    "id": "utara-bak-a1",
    "code": "BAK-A1",
    "wing": "Utara",
    "name": "BAK TANAMAN TYPE-A1 ( 1 UNIT )",
    "page": 4,
    "soilM3": 18.92,
    "formationM2": 37.83,
    "plants": [
      {
        "name": "Crysopogon",
        "unit": "polybag",
        "quantity": 686
      },
      {
        "name": "Kamboja Bali",
        "unit": "polybag",
        "quantity": 4
      },
      {
        "name": "Lee Kuan Yew",
        "unit": "polybag",
        "quantity": 48
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 35
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 378
      }
    ]
  },
  {
    "id": "utara-bak-a2",
    "code": "BAK-A2",
    "wing": "Utara",
    "name": "BAK TANAMAN TYPE-A2 ( 1 UNIT )",
    "page": 4,
    "soilM3": 18.92,
    "formationM2": 37.83,
    "plants": [
      {
        "name": "Crysopogon",
        "unit": "polybag",
        "quantity": 686
      },
      {
        "name": "Kamboja Bali",
        "unit": "polybag",
        "quantity": 4
      },
      {
        "name": "Lee Kuan Yew",
        "unit": "polybag",
        "quantity": 48
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 35
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 378
      }
    ]
  },
  {
    "id": "utara-bak-a3",
    "code": "BAK-A3",
    "wing": "Utara",
    "name": "BAK TANAMAN TYPE-A3 ( 1 UNIT )",
    "page": 4,
    "soilM3": 20.127,
    "formationM2": 40.225,
    "plants": [
      {
        "name": "Crysopogon",
        "unit": "polybag",
        "quantity": 350
      },
      {
        "name": "Kamboja Bali",
        "unit": "polybag",
        "quantity": 3
      },
      {
        "name": "Lee Kuan Yew",
        "unit": "polybag",
        "quantity": 48
      },
      {
        "name": "Palem Alexander",
        "unit": "polybag",
        "quantity": 6
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 9
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 690
      }
    ]
  },
  {
    "id": "utara-void-v1",
    "code": "VOID-V1",
    "wing": "Utara",
    "name": "BAK TANAMAN VOID TYPE-V1 (LT.1)",
    "page": 4,
    "soilM3": 12.25,
    "formationM2": 24.4,
    "plants": [
      {
        "name": "Lee Kuan Yew",
        "unit": "polybag",
        "quantity": 884
      }
    ]
  },
  {
    "id": "utara-void-v2",
    "code": "VOID-V2",
    "wing": "Utara",
    "name": "BAK TANAMAN VOID TYPE-V2 (LT.1&2)",
    "page": 4,
    "soilM3": 25.075,
    "formationM2": 50.15,
    "plants": [
      {
        "name": "Alamanda",
        "unit": "polybag",
        "quantity": 40
      },
      {
        "name": "Lee Kuan Yew",
        "unit": "polybag",
        "quantity": 1806
      }
    ]
  },
  {
    "id": "utara-pergola",
    "code": "PERGOLA",
    "wing": "Utara",
    "name": "BAK TANAMAN PADA PERGOLA",
    "page": 4,
    "soilM3": 0.173,
    "formationM2": 0.345,
    "plants": [
      {
        "name": "Bintang Terang / Ivy",
        "unit": "polybag",
        "quantity": 3
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 12
      }
    ]
  },
  {
    "id": "utara-panel-c",
    "code": "PANEL-C",
    "wing": "Utara",
    "name": "BAK TANAMAN PANEL TYPE-C",
    "page": 4,
    "soilM3": 0,
    "formationM2": 0,
    "plants": [
      {
        "name": "Ophiopogon Kucai Mini",
        "unit": "polybag",
        "quantity": 2835
      },
      {
        "name": "Paku-pakuan",
        "unit": "polybag",
        "quantity": 2835
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 2835
      }
    ]
  },
  {
    "id": "utara-luar",
    "code": "LUAR",
    "wing": "Utara",
    "name": "Area Luar Bangunan",
    "page": 4,
    "soilM3": 1725,
    "formationM2": 5750,
    "plants": [
      {
        "name": "Cengal Pasir",
        "unit": "batang",
        "quantity": 33
      },
      {
        "name": "Damar",
        "unit": "batang",
        "quantity": 16
      },
      {
        "name": "Dracaena Merah Hijau",
        "unit": "polybag",
        "quantity": 12
      },
      {
        "name": "Ophiopogon Daun Panjang",
        "unit": "polybag",
        "quantity": 16875
      },
      {
        "name": "Philodendron",
        "unit": "polybag",
        "quantity": 12000
      },
      {
        "name": "Pule",
        "unit": "batang",
        "quantity": 14
      },
      {
        "name": "Rumput Gajah Mini",
        "unit": "m2",
        "quantity": 1580
      },
      {
        "name": "Sirih",
        "unit": "polybag",
        "quantity": 64
      },
      {
        "name": "Ubi Hias",
        "unit": "polybag",
        "quantity": 114000
      }
    ]
  }
];
