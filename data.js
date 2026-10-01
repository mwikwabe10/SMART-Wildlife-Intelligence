const DEMO_DATA = {

    species: [

        {
            id: "SP001",
            name: "Giraffe",
            scientific: "Giraffa camelopardalis",
            code: "GIR",
            icon: "🦒",
            color: "#e8b84a",
            status: "Active",
            conservationStatus: "Vulnerable",
            citesAppendix: "Appendix II",
            monitoringCategory: "Large Mammal",

            taxonomy: {
                kingdom: "Animalia",
                phylum: "Chordata",
                className: "Mammalia",
                order: "Artiodactyla",
                family: "Giraffidae",
                genus: "Giraffa",
                species: "Giraffa camelopardalis"
            },

            description:
                "Large terrestrial mammal monitored across open woodland and savannah habitats."
        },

        {
            id: "SP002",
            name: "African Elephant",
            scientific: "Loxodonta africana",
            code: "ELE",
            icon: "🐘",
            color: "#8c9aa6",
            status: "Active",
            conservationStatus: "Endangered",
            citesAppendix: "Appendix I",
            monitoringCategory: "Large Mammal",

            taxonomy: {
                kingdom: "Animalia",
                phylum: "Chordata",
                className: "Mammalia",
                order: "Proboscidea",
                family: "Elephantidae",
                genus: "Loxodonta",
                species: "Loxodonta africana"
            },

            description:
                "Large herbivore monitored for population trends, movement and human-wildlife conflict."
        },

        {
            id: "SP003",
            name: "Lion",
            scientific: "Panthera leo",
            code: "LIO",
            icon: "🦁",
            color: "#d38b42",
            status: "Active",
            conservationStatus: "Vulnerable",
            citesAppendix: "Appendix II",
            monitoringCategory: "Large Carnivore",

            taxonomy: {
                kingdom: "Animalia",
                phylum: "Chordata",
                className: "Mammalia",
                order: "Carnivora",
                family: "Felidae",
                genus: "Panthera",
                species: "Panthera leo"
            },

            description:
                "Large carnivore monitored through sightings, individuals, prides and movement patterns."
        },

        {
            id: "SP004",
            name: "Common Zebra",
            scientific: "Equus quagga",
            code: "ZEB",
            icon: "🦓",
            color: "#c9d0d6",
            status: "Active",
            conservationStatus: "Near Threatened",
            citesAppendix: "Appendix II",
            monitoringCategory: "Large Mammal",

            taxonomy: {
                kingdom: "Animalia",
                phylum: "Chordata",
                className: "Mammalia",
                order: "Perissodactyla",
                family: "Equidae",
                genus: "Equus",
                species: "Equus quagga"
            },

            description:
                "Grazing species monitored through population observations and distribution."
        },

        {
            id: "SP005",
            name: "Black Rhino",
            scientific: "Diceros bicornis",
            code: "RHI",
            icon: "🦏",
            color: "#7d8790",
            status: "Active",
            conservationStatus: "Critically Endangered",
            citesAppendix: "Appendix I",
            monitoringCategory: "Large Mammal",

            taxonomy: {
                kingdom: "Animalia",
                phylum: "Chordata",
                className: "Mammalia",
                order: "Perissodactyla",
                family: "Rhinocerotidae",
                genus: "Diceros",
                species: "Diceros bicornis"
            },

            description:
                "Critically endangered large mammal monitored through individual identification, sightings, movement and population surveys."
        }

    ],


    animals: [

        {
            id: "AN001",
            tag: "GIR-001",
            speciesId: "SP001",
            sex: "Female",
            ageClass: "Adult",
            status: "Active",
            firstRecorded: "2026-01-14",
            location: "Maasai Mara",
            collar: "COL-2041",
            notes: "Adult female monitored within the northern sector."
        },

        {
            id: "AN002",
            tag: "ELE-014",
            speciesId: "SP002",
            sex: "Male",
            ageClass: "Adult",
            status: "Active",
            firstRecorded: "2026-02-03",
            location: "Tsavo East",
            collar: "COL-1182",
            notes: "Adult bull elephant."
        },

        {
            id: "AN003",
            tag: "LIO-007",
            speciesId: "SP003",
            sex: "Male",
            ageClass: "Adult",
            status: "Active",
            firstRecorded: "2026-03-21",
            location: "Maasai Mara",
            collar: "COL-7731",
            notes: "Adult male associated with local pride."
        },

        {
            id: "AN004",
            tag: "ZEB-023",
            speciesId: "SP004",
            sex: "Female",
            ageClass: "Adult",
            status: "Active",
            firstRecorded: "2026-04-08",
            location: "Amboseli",
            collar: "",
            notes: ""
        },

        {
            id: "AN005",
            tag: "RHI-001",
            speciesId: "SP005",
            sex: "Female",
            ageClass: "Adult",
            status: "Active",
            firstRecorded: "2026-05-11",
            location: "Tsavo West",
            collar: "RHI-COL-01",
            notes: "Individual black rhino under monitoring."
        }

    ],


    observations: [

        {
            id: "OBS001",
            date: "2026-09-21T07:42",
            speciesId: "SP001",
            animalId: "AN001",
            count: 1,
            behavior: "Feeding",
            latitude: -1.406,
            longitude: 35.019,
            observer: "Ranger Team A",
            location: "Maasai Mara",
            notes: "Observed near open grassland."
        },

        {
            id: "OBS002",
            date: "2026-09-21T10:14",
            speciesId: "SP002",
            animalId: "AN002",
            count: 4,
            behavior: "Moving",
            latitude: -2.782,
            longitude: 38.913,
            observer: "Field Team B",
            location: "Tsavo East",
            notes: "Small elephant group moving toward water."
        },

        {
            id: "OBS003",
            date: "2026-09-22T16:31",
            speciesId: "SP003",
            animalId: "AN003",
            count: 3,
            behavior: "Resting",
            latitude: -1.493,
            longitude: 35.143,
            observer: "Research Team",
            location: "Maasai Mara",
            notes: "Three lions observed near woodland."
        },

        {
            id: "OBS004",
            date: "2026-09-23T09:18",
            speciesId: "SP004",
            animalId: "AN004",
            count: 12,
            behavior: "Grazing",
            latitude: -2.674,
            longitude: 37.255,
            observer: "Ranger Team C",
            location: "Amboseli",
            notes: "Herd observed in open grassland."
        },

        {
            id: "OBS005",
            date: "2026-09-24T06:55",
            speciesId: "SP005",
            animalId: "AN005",
            count: 1,
            behavior: "Walking",
            latitude: -3.05,
            longitude: 38.18,
            observer: "Rhino Monitoring Unit",
            location: "Tsavo West",
            notes: "Individual observed during early morning patrol."
        }

    ],


    incidents: [

        {
            id: "INC001",
            date: "2026-09-20",
            type: "Human-Wildlife Conflict",
            severity: "High",
            location: "Tsavo",
            latitude: -2.72,
            longitude: 38.78,
            status: "Open",
            description:
                "Elephant crop-raiding incident reported near community farmland.",
            reportedBy: "Community Scout"
        },

        {
            id: "INC002",
            date: "2026-09-22",
            type: "Snaring",
            severity: "Critical",
            location: "Maasai Mara",
            latitude: -1.52,
            longitude: 35.12,
            status: "Investigating",
            description:
                "Wire snare discovered during patrol.",
            reportedBy: "Ranger Team A"
        }

    ]

};