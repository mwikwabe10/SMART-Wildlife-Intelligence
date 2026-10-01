/* =========================================================
   SMART WILDLIFE INTELLIGENCE
   Frontend Application
========================================================= */

const STORAGE_KEY = "smart_wildlife_intelligence_v2";

let state = {
    species: [],
    animals: [],
    observations: [],
    incidents: [],
    session: null,
    activeView: "dashboard"
};

let mainMap = null;
let dashboardMap = null;

let dashboardTrendChart = null;
let speciesChart = null;
let incidentChart = null;
let timelineChart = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    loadState();

    bindLogin();

    bindNavigation();

    bindGlobalSearch();

    initMaps();

    renderAll();

}


/* =========================================================
   STORAGE
========================================================= */

function loadState() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (saved) {

        try {

            const parsed =
                JSON.parse(saved);

            state.species =
                parsed.species || [];

            state.animals =
                parsed.animals || [];

            state.observations =
                parsed.observations || [];

            state.incidents =
                parsed.incidents || [];

        } catch (error) {

            console.error(
                "Storage error:",
                error
            );

            seedDemoData();
        }

    } else {

        seedDemoData();

    }

}


function seedDemoData() {

    state.species =
        structuredClone(
            DEMO_DATA.species
        );

    state.animals =
        structuredClone(
            DEMO_DATA.animals
        );

    state.observations =
        structuredClone(
            DEMO_DATA.observations
        );

    state.incidents =
        structuredClone(
            DEMO_DATA.incidents
        );

    saveState();

}


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            species: state.species,
            animals: state.animals,
            observations: state.observations,
            incidents: state.incidents
        })
    );

}


/* =========================================================
   AUTHENTICATION
========================================================= */

function bindLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    form.addEventListener(
        "submit",
        handleLogin
    );

}


function handleLogin(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    let role = null;

    if (
        email === "admin@wildlife.local" &&
        password === "Admin@123"
    ) {

        role = "admin";

    } else if (
        email === "viewer@wildlife.local" &&
        password === "Viewer@123"
    ) {

        role = "viewer";

    }


    if (!role) {

        showToast(
            "Invalid demo credentials.",
            "error"
        );

        return;
    }


    state.session = {
        email,
        role,
        name:
            role === "admin"
                ? "Administrator"
                : "Conservation Viewer"
    };


    sessionStorage.setItem(
        "smart_session",
        JSON.stringify(
            state.session
        )
    );


    enterApplication();

}


function enterApplication() {

    document
        .getElementById("loginScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    const session =
        state.session;


    document
        .getElementById("userName")
        .textContent =
        session.name;


    document
        .getElementById("userRole")
        .textContent =
        session.role === "admin"
            ? "Administrator"
            : "Viewer";


    document
        .getElementById("userAvatar")
        .textContent =
        session.name
            .charAt(0)
            .toUpperCase();


    applyRolePermissions();

    renderAll();

}


function logout() {

    state.session = null;

    sessionStorage.removeItem(
        "smart_session"
    );

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("loginScreen")
        .classList.remove("hidden");

}


function useAdminDemo() {

    document
        .getElementById("loginEmail")
        .value =
        "admin@wildlife.local";

    document
        .getElementById("loginPassword")
        .value =
        "Admin@123";

}


function useViewerDemo() {

    document
        .getElementById("loginEmail")
        .value =
        "viewer@wildlife.local";

    document
        .getElementById("loginPassword")
        .value =
        "Viewer@123";

}


function canEdit() {

    return (
        state.session &&
        state.session.role === "admin"
    );

}


function applyRolePermissions() {

    document
        .querySelectorAll(".edit-only")
        .forEach(element => {

            element.style.display =
                canEdit()
                    ? ""
                    : "none";

        });

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setView(
                        button.dataset.view
                    );

                }
            );

        });


    document
        .getElementById(
            "sidebarToggle"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("sidebar")
                    .classList.toggle("mobile-open");

            }
        );

}


function setView(view) {

    state.activeView = view;


    document
        .querySelectorAll(".view")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(
            `${view}View`
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === view
            );

        });


    document
        .getElementById("sidebar")
        .classList.remove(
            "mobile-open"
        );


    if (view === "map") {

        setTimeout(() => {

            if (mainMap) {

                mainMap.invalidateSize();

                renderMapMarkers();

            }

        }, 150);

    }


    if (view === "dashboard") {

        setTimeout(() => {

            if (dashboardMap) {

                dashboardMap.invalidateSize();

            }

        }, 150);

    }

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function generateId(prefix) {

    return (
        prefix +
        Date.now()
            .toString(36)
            .toUpperCase() +
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()
    );

}


function getSpecies(speciesId) {

    return state.species.find(
        species =>
            species.id === speciesId
    );

}


function getSpeciesName(speciesId) {

    const species =
        getSpecies(speciesId);

    return species
        ? `${species.icon || "◉"} ${species.name}`
        : "Unknown Species";

}


function getAnimal(animalId) {

    return state.animals.find(
        animal =>
            animal.id === animalId
    );

}


function generateSpeciesColor() {

    const colors = [

        "#e8b84a",
        "#6f8798",
        "#d47b38",
        "#7ca6a8",
        "#a88bc4",
        "#c56b6b",
        "#5d9c72",
        "#d09b62",
        "#7289b6",
        "#9caa62"

    ];

    return colors[
        state.species.length %
        colors.length
    ];

}


function getSpeciesOptions() {

    return state.species
        .filter(
            species =>
                species.status === "Active"
        )
        .map(
            species => `

                <option
                    value="${species.id}">

                    ${species.icon || "◉"}
                    ${escapeHTML(species.name)}

                </option>

            `
        )
        .join("");

}


function populateAllSpeciesDropdowns() {

    const dropdowns = [

        "animalSpecies",
        "observationSpecies",
        "mapSpeciesFilter",
        "observationSpeciesFilter",
        "animalSpeciesFilter"

    ];


    dropdowns.forEach(id => {

        const select =
            document.getElementById(id);

        if (!select) return;


        const current =
            select.value;


        let firstOption =
            "Select species";


        if (
            id.includes("Filter")
        ) {

            firstOption =
                id === "mapSpeciesFilter"
                    ? "All species"
                    : "All species";

        }


        select.innerHTML = `

            <option value="">
                ${firstOption}
            </option>

            ${getSpeciesOptions()}

        `;


        if (
            state.species.some(
                species =>
                    species.id === current &&
                    species.status === "Active"
            )
        ) {

            select.value = current;

        }

    });

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    populateAllSpeciesDropdowns();

    renderDashboard();

    renderSpeciesManagement();

    renderObservationsTable();

    renderAnimalsTable();

    renderIncidents();

    renderAnalytics();

    renderMapMarkers();

    applyRolePermissions();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const totalObservations =
        state.observations.length;

    const totalAnimals =
        state.animals.length;

    const activeIncidents =
        state.incidents.filter(
            incident =>
                incident.status !== "Closed"
        ).length;

    const activeSpecies =
        state.species.filter(
            species =>
                species.status === "Active"
        ).length;

    const critical =
        state.incidents.filter(
            incident =>
                incident.severity === "Critical"
        ).length;


    document
        .getElementById(
            "dashboardKpis"
        )
        .innerHTML = `

        <div class="kpi-card">

            <div class="kpi-icon cyan">
                ◉
            </div>

            <span>
                LIVE OBSERVATIONS
            </span>

            <strong>
                ${totalObservations}
            </strong>

            <small>
                Recorded field observations
            </small>

        </div>


        <div class="kpi-card">

            <div class="kpi-icon gold">
                ◇
            </div>

            <span>
                MONITORED ANIMALS
            </span>

            <strong>
                ${totalAnimals}
            </strong>

            <small>
                Individual registry
            </small>

        </div>


        <div class="kpi-card">

            <div class="kpi-icon orange">
                !
            </div>

            <span>
                ACTIVE INCIDENTS
            </span>

            <strong>
                ${activeIncidents}
            </strong>

            <small>
                Requiring monitoring
            </small>

        </div>


        <div class="kpi-card">

            <div class="kpi-icon purple">
                ✦
            </div>

            <span>
                ACTIVE SPECIES
            </span>

            <strong>
                ${activeSpecies}
            </strong>

            <small>
                Configured for monitoring
            </small>

        </div>


        <div class="kpi-card danger-kpi">

            <div class="kpi-icon red">
                ⚠
            </div>

            <span>
                CRITICAL ALERTS
            </span>

            <strong>
                ${critical}
            </strong>

            <small>
                High-priority incidents
            </small>

        </div>

    `;


    renderDashboardSpecies();

    renderDashboardIncidents();

    renderDecisionInsights();

    renderDashboardChart();

}


function renderDashboardSpecies() {

    const container =
        document.getElementById(
            "dashboardSpecies"
        );


    container.innerHTML =
        state.species
            .filter(
                species =>
                    species.status === "Active"
            )
            .map(
                species => {

                    const animals =
                        state.animals.filter(
                            animal =>
                                animal.speciesId ===
                                species.id
                        ).length;

                    const observations =
                        state.observations.filter(
                            observation =>
                                observation.speciesId ===
                                species.id
                        ).length;


                    return `

                    <div
                        class="dashboard-species-card"
                        style="--species-color:${species.color}">

                        <div class="species-glow"></div>

                        <div class="species-icon">
                            ${species.icon || "◉"}
                        </div>

                        <div class="species-card-info">

                            <strong>
                                ${escapeHTML(
                                    species.name
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    species.scientific || ""
                                )}
                            </small>

                        </div>

                        <div class="species-number">

                            <strong>
                                ${animals}
                            </strong>

                            <span>
                                animals
                            </span>

                        </div>

                        <div class="species-number">

                            <strong>
                                ${observations}
                            </strong>

                            <span>
                                observations
                            </span>

                        </div>

                    </div>

                    `;

                }
            )
            .join("");

}


function renderDashboardIncidents() {

    const container =
        document.getElementById(
            "dashboardIncidents"
        );


    const incidents =
        state.incidents
            .filter(
                incident =>
                    incident.status !== "Closed"
            )
            .slice(0, 5);


    document
        .getElementById(
            "criticalCount"
        )
        .textContent =
        state.incidents.filter(
            incident =>
                incident.severity === "Critical"
        ).length;


    if (!incidents.length) {

        container.innerHTML = `
            <div class="empty-state">
                No active incidents.
            </div>
        `;

        return;

    }


    container.innerHTML =
        incidents
            .map(
                incident => `

                <div class="alert-item">

                    <div
                        class="severity-icon
                        severity-${incident.severity.toLowerCase()}">

                        !

                    </div>

                    <div class="alert-content">

                        <strong>
                            ${escapeHTML(
                                incident.type
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                incident.location
                            )}
                            ·
                            ${escapeHTML(
                                incident.status
                            )}
                        </small>

                    </div>

                    <span class="severity-text">
                        ${escapeHTML(
                            incident.severity
                        )}
                    </span>

                </div>

                `
            )
            .join("");

}


function renderDecisionInsights() {

    const container =
        document.getElementById(
            "decisionInsights"
        );


    const insights = [];


    const activeSpecies =
        state.species.filter(
            s =>
                s.status === "Active"
        ).length;


    const critical =
        state.incidents.filter(
            i =>
                i.severity === "Critical"
        ).length;


    if (activeSpecies > 0) {

        insights.push({

            icon: "✦",

            title:
                `${activeSpecies} species configured`,

            text:
                "Species registry is available for wildlife monitoring."

        });

    }


    if (critical > 0) {

        insights.push({

            icon: "!",

            title:
                `${critical} critical incident${
                    critical === 1 ? "" : "s"
                }`,

            text:
                "Review high-priority conservation risks."

        });

    }


    if (state.observations.length) {

        const latest =
            [...state.observations]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )[0];


        insights.push({

            icon: "◉",

            title:
                "Latest field observation",

            text:
                `${getSpeciesName(
                    latest.speciesId
                )} · ${latest.location}`

        });

    }


    container.innerHTML =
        insights
            .map(
                insight => `

                <div class="insight-item">

                    <div class="insight-icon">
                        ${insight.icon}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                                insight.title
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                insight.text
                            )}
                        </p>

                    </div>

                </div>

                `
            )
            .join("");

}


function renderDashboardChart() {

    const canvas =
        document.getElementById(
            "dashboardTrendChart"
        );

    if (!canvas) return;


    if (dashboardTrendChart) {

        dashboardTrendChart.destroy();

    }


    const months = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep"
    ];


    const values =
        months.map(
            month =>
                state.observations.filter(
                    observation =>
                        new Date(
                            observation.date
                        ).toLocaleString(
                            "en-US",
                            { month: "short" }
                        ) === month
                ).length
        );


    dashboardTrendChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: months,

                    datasets: [

                        {
                            label:
                                "Observations",

                            data:
                                values,

                            borderColor:
                                "#39c7a5",

                            backgroundColor:
                                "rgba(57,199,165,.08)",

                            fill: true,

                            tension: .4,

                            pointRadius: 4,

                            pointBackgroundColor:
                                "#39c7a5"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {
                            grid: {
                                color:
                                    "rgba(255,255,255,.04)"
                            },
                            ticks: {
                                color:
                                    "#718394"
                            }
                        },

                        y: {
                            beginAtZero: true,
                            grid: {
                                color:
                                    "rgba(255,255,255,.04)"
                            },
                            ticks: {
                                color:
                                    "#718394"
                            }
                        }

                    }

                }

            }
        );

}


/* =========================================================
   SPECIES MANAGEMENT
========================================================= */

function renderSpeciesManagement() {

    const container =
        document.getElementById(
            "speciesGrid"
        );

    if (!container) return;


    const search =
        (
            document
                .getElementById(
                    "speciesSearch"
                )
                ?.value || ""
        )
            .toLowerCase()
            .trim();


    const filtered =
        state.species.filter(
            species => {

                if (!search) return true;

                return (

                    species.name
                        .toLowerCase()
                        .includes(search) ||

                    (
                        species.scientific || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    (
                        species.code || ""
                    )
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    const active =
        state.species.filter(
            species =>
                species.status === "Active"
        ).length;


    document
        .getElementById(
            "activeSpeciesCount"
        )
        .textContent =
        active;


    container.innerHTML =
        filtered
            .map(
                species => {

                    const animals =
                        state.animals.filter(
                            animal =>
                                animal.speciesId ===
                                species.id
                        ).length;


                    const observations =
                        state.observations.filter(
                            observation =>
                                observation.speciesId ===
                                species.id
                        ).length;


                    const taxonomy =
                        species.taxonomy || {};


                    return `

                    <article
                        class="species-management-card"
                        style="--species-color:${species.color || "#39c7a5"}">

                        <div class="species-card-glow"></div>

                        <div class="species-card-top">

                            <div
                                class="species-large-icon">

                                ${species.icon || "◉"}

                            </div>

                            <span
                                class="status-pill ${
                                    species.status === "Active"
                                        ? "status-active"
                                        : "status-inactive"
                                }">

                                ${species.status}

                            </span>

                        </div>


                        <h3>
                            ${escapeHTML(
                                species.name
                            )}
                        </h3>


                        <p class="scientific-name">

                            ${escapeHTML(
                                species.scientific ||
                                "Scientific name not specified"
                            )}

                        </p>


                        <div class="taxonomy-summary">

                            <span>
                                ${escapeHTML(
                                    taxonomy.className ||
                                    "—"
                                )}
                            </span>

                            <b>·</b>

                            <span>
                                ${escapeHTML(
                                    taxonomy.order ||
                                    "—"
                                )}
                            </span>

                            <b>·</b>

                            <span>
                                ${escapeHTML(
                                    taxonomy.family ||
                                    "—"
                                )}
                            </span>

                        </div>


                        <div class="species-conservation-grid">

                            <div>

                                <small>
                                    IUCN
                                </small>

                                <strong>
                                    ${escapeHTML(
                                        species.conservationStatus ||
                                        "Not Evaluated"
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    CITES
                                </small>

                                <strong>
                                    ${escapeHTML(
                                        species.citesAppendix ||
                                        "—"
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="species-meta">

                            <div>

                                <strong>
                                    ${animals}
                                </strong>

                                <span>
                                    Animals
                                </span>

                            </div>


                            <div>

                                <strong>
                                    ${observations}
                                </strong>

                                <span>
                                    Observations
                                </span>

                            </div>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        species.code || "—"
                                    )}
                                </strong>

                                <span>
                                    Code
                                </span>

                            </div>

                        </div>


                        <div class="species-card-actions">

                            <button
                                class="btn btn-secondary btn-sm"
                                onclick="openSpeciesModal('${species.id}')">

                                Edit

                            </button>

                            <button
                                class="btn btn-secondary btn-sm"
                                onclick="toggleSpeciesStatus('${species.id}')">

                                ${
                                    species.status === "Active"
                                        ? "Deactivate"
                                        : "Activate"
                                }

                            </button>

                        </div>

                    </article>

                    `;

                }
            )
            .join("");


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state wide">
                No species match your search.
            </div>
        `;

    }

}


/* =========================================================
   SPECIES MODAL
========================================================= */

function openSpeciesModal(
    speciesId = null
) {

    if (!canEdit()) {

        showToast(
            "Viewer accounts cannot modify species.",
            "warning"
        );

        return;

    }


    const species =
        speciesId
            ? getSpecies(speciesId)
            : null;


    const taxonomy =
        species?.taxonomy || {};


    const modalRoot =
        document.getElementById(
            "modalRoot"
        );


    modalRoot.innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal modal-xl"
                onclick="event.stopPropagation()">


                <div class="modal-header">

                    <div>

                        <span class="eyebrow">
                            SPECIES REGISTRY
                        </span>

                        <h2>
                            ${
                                species
                                    ? "Edit Species"
                                    : "Add New Species"
                            }
                        </h2>

                        <p>
                            Manage identity, taxonomy,
                            conservation classification
                            and monitoring information.
                        </p>

                    </div>


                    <button
                        class="modal-close"
                        onclick="closeModal()">

                        ×

                    </button>

                </div>


                <form
                    id="speciesForm">


                    <input
                        type="hidden"
                        id="speciesEditId"
                        value="${species?.id || ""}">


                    <div class="form-section">

                        <div class="form-section-title">

                            <span>
                                01
                            </span>

                            <div>

                                <strong>
                                    Species Identity
                                </strong>

                                <small>
                                    Basic identification information
                                </small>

                            </div>

                        </div>


                        <div class="form-grid">


                            <div class="form-field">

                                <label>
                                    Common Name *
                                </label>

                                <input
                                    id="speciesName"
                                    required
                                    value="${escapeHTML(
                                        species?.name || ""
                                    )}"
                                    placeholder="e.g. Black Rhino">

                            </div>


                            <div class="form-field">

                                <label>
                                    Scientific Name
                                </label>

                                <input
                                    id="speciesScientific"
                                    value="${escapeHTML(
                                        species?.scientific || ""
                                    )}"
                                    placeholder="e.g. Diceros bicornis">

                            </div>


                            <div class="form-field">

                                <label>
                                    Species Code
                                </label>

                                <input
                                    id="speciesCode"
                                    maxlength="10"
                                    value="${escapeHTML(
                                        species?.code || ""
                                    )}"
                                    placeholder="RHI">

                            </div>


                            <div class="form-field">

                                <label>
                                    Icon / Symbol
                                </label>

                                <input
                                    id="speciesIcon"
                                    maxlength="4"
                                    value="${species?.icon || "◉"}"
                                    placeholder="🦏">

                            </div>

                        </div>

                    </div>


                    <div class="form-section">

                        <div class="form-section-title">

                            <span>
                                02
                            </span>

                            <div>

                                <strong>
                                    Taxonomic Classification
                                </strong>

                                <small>
                                    Biological classification
                                </small>

                            </div>

                        </div>


                        <div class="taxonomy-grid">


                            <div class="form-field">

                                <label>
                                    Kingdom
                                </label>

                                <input
                                    id="speciesKingdom"
                                    value="${escapeHTML(
                                        taxonomy.kingdom || "Animalia"
                                    )}"
                                    placeholder="Animalia">

                            </div>


                            <div class="form-field">

                                <label>
                                    Phylum
                                </label>

                                <input
                                    id="speciesPhylum"
                                    value="${escapeHTML(
                                        taxonomy.phylum || "Chordata"
                                    )}"
                                    placeholder="Chordata">

                            </div>


                            <div class="form-field">

                                <label>
                                    Class
                                </label>

                                <input
                                    id="speciesClass"
                                    value="${escapeHTML(
                                        taxonomy.className || ""
                                    )}"
                                    placeholder="Mammalia">

                            </div>


                            <div class="form-field">

                                <label>
                                    Order
                                </label>

                                <input
                                    id="speciesOrder"
                                    value="${escapeHTML(
                                        taxonomy.order || ""
                                    )}"
                                    placeholder="Perissodactyla">

                            </div>


                            <div class="form-field">

                                <label>
                                    Family
                                </label>

                                <input
                                    id="speciesFamily"
                                    value="${escapeHTML(
                                        taxonomy.family || ""
                                    )}"
                                    placeholder="Rhinocerotidae">

                            </div>


                            <div class="form-field">

                                <label>
                                    Genus
                                </label>

                                <input
                                    id="speciesGenus"
                                    value="${escapeHTML(
                                        taxonomy.genus || ""
                                    )}"
                                    placeholder="Diceros">

                            </div>


                            <div class="form-field">

                                <label>
                                    Species / Taxon
                                </label>

                                <input
                                    id="speciesTaxon"
                                    value="${escapeHTML(
                                        taxonomy.species ||
                                        species?.scientific ||
                                        ""
                                    )}"
                                    placeholder="Diceros bicornis">

                            </div>


                        </div>

                    </div>


                    <div class="form-section">

                        <div class="form-section-title">

                            <span>
                                03
                            </span>

                            <div>

                                <strong>
                                    Conservation Classification
                                </strong>

                                <small>
                                    Conservation and monitoring classification
                                </small>

                            </div>

                        </div>


                        <div class="form-grid">


                            <div class="form-field">

                                <label>
                                    IUCN Conservation Status
                                </label>

                                <select
                                    id="speciesConservationStatus">

                                    ${[
                                        "Least Concern",
                                        "Near Threatened",
                                        "Vulnerable",
                                        "Endangered",
                                        "Critically Endangered",
                                        "Extinct in the Wild",
                                        "Data Deficient",
                                        "Not Evaluated"
                                    ]
                                        .map(
                                            status => `

                                            <option
                                                value="${status}"
                                                ${
                                                    species?.conservationStatus === status
                                                        ? "selected"
                                                        : ""
                                                }>

                                                ${status}

                                            </option>

                                            `
                                        )
                                        .join("")}

                                </select>

                            </div>


                            <div class="form-field">

                                <label>
                                    CITES Appendix
                                </label>

                                <select
                                    id="speciesCites">

                                    <option value="">
                                        Not specified
                                    </option>

                                    ${[
                                        "Appendix I",
                                        "Appendix II",
                                        "Appendix III"
                                    ]
                                        .map(
                                            value => `

                                            <option
                                                value="${value}"
                                                ${
                                                    species?.citesAppendix === value
                                                        ? "selected"
                                                        : ""
                                                }>

                                                ${value}

                                            </option>

                                            `
                                        )
                                        .join("")}

                                </select>

                            </div>


                            <div class="form-field">

                                <label>
                                    Monitoring Category
                                </label>

                                <input
                                    id="speciesMonitoringCategory"
                                    value="${escapeHTML(
                                        species?.monitoringCategory || ""
                                    )}"
                                    placeholder="Large Mammal">

                            </div>


                            <div class="form-field">

                                <label>
                                    Registry Status
                                </label>

                                <select
                                    id="speciesStatus">

                                    <option
                                        value="Active"
                                        ${
                                            !species ||
                                            species.status === "Active"
                                                ? "selected"
                                                : ""
                                        }>
                                        Active
                                    </option>

                                    <option
                                        value="Inactive"
                                        ${
                                            species?.status === "Inactive"
                                                ? "selected"
                                                : ""
                                        }>
                                        Inactive
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    <div class="form-section">

                        <div class="form-section-title">

                            <span>
                                04
                            </span>

                            <div>

                                <strong>
                                    Monitoring Profile
                                </strong>

                                <small>
                                    Description and field information
                                </small>

                            </div>

                        </div>


                        <div class="form-field">

                            <label>
                                Species Description
                            </label>

                            <textarea
                                id="speciesDescription"
                                rows="5"
                                placeholder="Describe the species, habitat, monitoring objectives and field considerations...">${escapeHTML(
                                    species?.description || ""
                                )}</textarea>

                        </div>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="closeModal()">

                            Cancel

                        </button>


                        <button
                            type="submit"
                            class="btn btn-primary">

                            ${
                                species
                                    ? "Save Classification"
                                    : "Add Species"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;


    document
        .getElementById(
            "speciesForm"
        )
        .addEventListener(
            "submit",
            saveSpecies
        );

}


function saveSpecies(event) {

    event.preventDefault();


    const id =
        document
            .getElementById(
                "speciesEditId"
            )
            .value;


    const name =
        document
            .getElementById(
                "speciesName"
            )
            .value
            .trim();


    if (!name) {

        showToast(
            "Common name is required.",
            "error"
        );

        return;

    }


    const speciesData = {

        name,

        scientific:
            document
                .getElementById(
                    "speciesScientific"
                )
                .value
                .trim(),

        code:
            document
                .getElementById(
                    "speciesCode"
                )
                .value
                .trim()
                .toUpperCase(),

        icon:
            document
                .getElementById(
                    "speciesIcon"
                )
                .value
                .trim() ||
            "◉",


        taxonomy: {

            kingdom:
                document
                    .getElementById(
                        "speciesKingdom"
                    )
                    .value
                    .trim(),

            phylum:
                document
                    .getElementById(
                        "speciesPhylum"
                    )
                    .value
                    .trim(),

            className:
                document
                    .getElementById(
                        "speciesClass"
                    )
                    .value
                    .trim(),

            order:
                document
                    .getElementById(
                        "speciesOrder"
                    )
                    .value
                    .trim(),

            family:
                document
                    .getElementById(
                        "speciesFamily"
                    )
                    .value
                    .trim(),

            genus:
                document
                    .getElementById(
                        "speciesGenus"
                    )
                    .value
                    .trim(),

            species:
                document
                    .getElementById(
                        "speciesTaxon"
                    )
                    .value
                    .trim()

        },


        conservationStatus:
            document
                .getElementById(
                    "speciesConservationStatus"
                )
                .value,


        citesAppendix:
            document
                .getElementById(
                    "speciesCites"
                )
                .value,


        monitoringCategory:
            document
                .getElementById(
                    "speciesMonitoringCategory"
                )
                .value
                .trim(),


        status:
            document
                .getElementById(
                    "speciesStatus"
                )
                .value,


        description:
            document
                .getElementById(
                    "speciesDescription"
                )
                .value
                .trim()

    };


    if (id) {

        const index =
            state.species.findIndex(
                species =>
                    species.id === id
            );


        if (index === -1) {

            showToast(
                "Species record could not be found.",
                "error"
            );

            return;

        }


        state.species[index] = {

            ...state.species[index],

            ...speciesData

        };


        showToast(
            `${name} classification updated.`,
            "success"
        );

    } else {

        state.species.push({

            id:
                generateId("SP"),

            color:
                generateSpeciesColor(),

            ...speciesData

        });


        showToast(
            `${name} added to species registry.`,
            "success"
        );

    }


    saveState();

    closeModal();

    renderAll();

}


function toggleSpeciesStatus(
    speciesId
) {

    if (!canEdit()) {

        showToast(
            "Viewer accounts cannot modify species.",
            "warning"
        );

        return;

    }


    const species =
        getSpecies(speciesId);


    if (!species) return;


    species.status =
        species.status === "Active"
            ? "Inactive"
            : "Active";


    saveState();

    renderAll();


    showToast(
        `${species.name} is now ${species.status.toLowerCase()}.`,
        "success"
    );

}


/* =========================================================
   ANIMAL REGISTRATION
========================================================= */

function openAnimalModal() {

    if (!canEdit()) {

        showToast(
            "Viewer accounts cannot register animals.",
            "warning"
        );

        return;

    }


    const modalRoot =
        document.getElementById(
            "modalRoot"
        );


    modalRoot.innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal modal-lg"
                onclick="event.stopPropagation()">


                <div class="modal-header">

                    <div>

                        <span class="eyebrow">
                            INDIVIDUAL REGISTRY
                        </span>

                        <h2>
                            Register Animal
                        </h2>

                        <p>
                            Create an individual wildlife record.
                        </p>

                    </div>


                    <button
                        class="modal-close"
                        onclick="closeModal()">

                        ×

                    </button>

                </div>


                <form id="animalForm">


                    <div class="form-grid">


                        <div class="form-field">

                            <label>
                                Species *
                            </label>

                            <div class="select-with-action">

                                <select
                                    id="animalSpecies"
                                    required>

                                    <option value="">
                                        Select species
                                    </option>

                                </select>

                                <button
                                    type="button"
                                    class="field-action"
                                    onclick="openSpeciesModal()"
                                    title="Add species">

                                    +

                                </button>

                            </div>

                        </div>


                        <div class="form-field">

                            <label>
                                Animal ID *
                            </label>

                            <input
                                id="animalTag"
                                required
                                placeholder="e.g. RHI-002">

                        </div>


                        <div class="form-field">

                            <label>
                                Sex
                            </label>

                            <select id="animalSex">

                                <option>
                                    Unknown
                                </option>

                                <option>
                                    Male
                                </option>

                                <option>
                                    Female
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                Age Class
                            </label>

                            <select id="animalAgeClass">

                                <option>
                                    Adult
                                </option>

                                <option>
                                    Sub-adult
                                </option>

                                <option>
                                    Juvenile
                                </option>

                                <option>
                                    Calf
                                </option>

                                <option>
                                    Unknown
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                First Recorded
                            </label>

                            <input
                                id="animalFirstRecorded"
                                type="date"
                                value="${new Date()
                                    .toISOString()
                                    .slice(0, 10)}">

                        </div>


                        <div class="form-field">

                            <label>
                                Location
                            </label>

                            <input
                                id="animalLocation"
                                placeholder="e.g. Tsavo West">

                        </div>


                        <div class="form-field">

                            <label>
                                GPS Collar / Tag
                            </label>

                            <input
                                id="animalCollar"
                                placeholder="Optional">

                        </div>


                        <div class="form-field">

                            <label>
                                Status
                            </label>

                            <select id="animalStatus">

                                <option>
                                    Active
                                </option>

                                <option>
                                    Missing
                                </option>

                                <option>
                                    Deceased
                                </option>

                                <option>
                                    Translocated
                                </option>

                            </select>

                        </div>


                        <div class="form-field full">

                            <label>
                                Notes
                            </label>

                            <textarea
                                id="animalNotes"
                                rows="4"
                                placeholder="Additional field notes..."></textarea>

                        </div>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="closeModal()">

                            Cancel

                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary">

                            Register Animal

                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;


    populateAllSpeciesDropdowns();


    document
        .getElementById(
            "animalForm"
        )
        .addEventListener(
            "submit",
            saveAnimal
        );

}


function saveAnimal(event) {

    event.preventDefault();


    const speciesId =
        document
            .getElementById(
                "animalSpecies"
            )
            .value;


    const tag =
        document
            .getElementById(
                "animalTag"
            )
            .value
            .trim();


    if (!speciesId || !tag) {

        showToast(
            "Species and Animal ID are required.",
            "error"
        );

        return;

    }


    state.animals.push({

        id:
            generateId("AN"),

        tag,

        speciesId,

        sex:
            document
                .getElementById(
                    "animalSex"
                )
                .value,

        ageClass:
            document
                .getElementById(
                    "animalAgeClass"
                )
                .value,

        status:
            document
                .getElementById(
                    "animalStatus"
                )
                .value,

        firstRecorded:
            document
                .getElementById(
                    "animalFirstRecorded"
                )
                .value,

        location:
            document
                .getElementById(
                    "animalLocation"
                )
                .value
                .trim(),

        collar:
            document
                .getElementById(
                    "animalCollar"
                )
                .value
                .trim(),

        notes:
            document
                .getElementById(
                    "animalNotes"
                )
                .value
                .trim()

    });


    saveState();

    closeModal();

    renderAll();


    showToast(
        `${tag} registered successfully.`,
        "success"
    );

}


/* =========================================================
   OBSERVATION
========================================================= */

function openObservationModal() {

    if (!canEdit()) {

        showToast(
            "Viewer accounts cannot create observations.",
            "warning"
        );

        return;

    }


    const modalRoot =
        document.getElementById(
            "modalRoot"
        );


    modalRoot.innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal modal-lg"
                onclick="event.stopPropagation">


                <div class="modal-header">

                    <div>

                        <span class="eyebrow">
                            FIELD INTELLIGENCE
                        </span>

                        <h2>
                            New Observation
                        </h2>

                        <p>
                            Capture a wildlife field observation.
                        </p>

                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">
                        ×
                    </button>

                </div>


                <form id="observationForm">

                    <div class="form-grid">


                        <div class="form-field">

                            <label>
                                Species *
                            </label>

                            <select
                                id="observationSpecies"
                                required>

                                <option value="">
                                    Select species
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                Individual
                            </label>

                            <select
                                id="observationAnimal">

                                <option value="">
                                    Population / unregistered
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                Date & Time
                            </label>

                            <input
                                id="observationDate"
                                type="datetime-local"
                                value="${new Date()
                                    .toISOString()
                                    .slice(0, 16)}">

                        </div>


                        <div class="form-field">

                            <label>
                                Count
                            </label>

                            <input
                                id="observationCount"
                                type="number"
                                min="1"
                                value="1">

                        </div>


                        <div class="form-field">

                            <label>
                                Behaviour
                            </label>

                            <select id="observationBehavior">

                                <option>
                                    Feeding
                                </option>

                                <option>
                                    Moving
                                </option>

                                <option>
                                    Resting
                                </option>

                                <option>
                                    Grazing
                                </option>

                                <option>
                                    Drinking
                                </option>

                                <option>
                                    Breeding
                                </option>

                                <option>
                                    Alert
                                </option>

                                <option>
                                    Unknown
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                Observer
                            </label>

                            <input
                                id="observationObserver"
                                placeholder="Ranger / researcher">

                        </div>


                        <div class="form-field">

                            <label>
                                Latitude
                            </label>

                            <input
                                id="observationLatitude"
                                type="number"
                                step="any"
                                placeholder="-1.406">

                        </div>


                        <div class="form-field">

                            <label>
                                Longitude
                            </label>

                            <input
                                id="observationLongitude"
                                type="number"
                                step="any"
                                placeholder="35.019">

                        </div>


                        <div class="form-field full">

                            <label>
                                Location
                            </label>

                            <input
                                id="observationLocation"
                                placeholder="e.g. Maasai Mara">

                        </div>


                        <div class="form-field full">

                            <label>
                                Notes
                            </label>

                            <textarea
                                id="observationNotes"
                                rows="4"></textarea>

                        </div>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="closeModal()">

                            Cancel

                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary">

                            Save Observation

                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;


    populateAllSpeciesDropdowns();

    populateAnimalDropdown();


    document
        .getElementById(
            "observationSpecies"
        )
        .addEventListener(
            "change",
            populateAnimalDropdown
        );


    document
        .getElementById(
            "observationForm"
        )
        .addEventListener(
            "submit",
            saveObservation
        );

}


function populateAnimalDropdown() {

    const speciesId =
        document
            .getElementById(
                "observationSpecies"
            )
            ?.value;


    const select =
        document.getElementById(
            "observationAnimal"
        );


    if (!select) return;


    select.innerHTML = `

        <option value="">
            Population / unregistered
        </option>

        ${
            state.animals
                .filter(
                    animal =>
                        !speciesId ||
                        animal.speciesId === speciesId
                )
                .map(
                    animal => `

                    <option
                        value="${animal.id}">

                        ${escapeHTML(
                            animal.tag
                        )}

                    </option>

                    `
                )
                .join("")
        }

    `;

}


function saveObservation(event) {

    event.preventDefault();


    const speciesId =
        document
            .getElementById(
                "observationSpecies"
            )
            .value;


    if (!speciesId) {

        showToast(
            "Select a species.",
            "error"
        );

        return;

    }


    state.observations.push({

        id:
            generateId("OBS"),

        date:
            document
                .getElementById(
                    "observationDate"
                )
                .value,

        speciesId,

        animalId:
            document
                .getElementById(
                    "observationAnimal"
                )
                .value,

        count:
            Number(
                document
                    .getElementById(
                        "observationCount"
                    )
                    .value
            ) || 1,

        behavior:
            document
                .getElementById(
                    "observationBehavior"
                )
                .value,

        latitude:
            Number(
                document
                    .getElementById(
                        "observationLatitude"
                    )
                    .value
            ),

        longitude:
            Number(
                document
                    .getElementById(
                        "observationLongitude"
                    )
                    .value
            ),

        observer:
            document
                .getElementById(
                    "observationObserver"
                )
                .value
                .trim(),

        location:
            document
                .getElementById(
                    "observationLocation"
                )
                .value
                .trim(),

        notes:
            document
                .getElementById(
                    "observationNotes"
                )
                .value
                .trim()

    });


    saveState();

    closeModal();

    renderAll();


    showToast(
        "Observation recorded.",
        "success"
    );

}


/* =========================================================
   OBSERVATION TABLE
========================================================= */

function renderObservationsTable() {

    const tbody =
        document.getElementById(
            "observationsTableBody"
        );

    if (!tbody) return;


    const search =
        (
            document
                .getElementById(
                    "observationSearch"
                )
                ?.value || ""
        )
            .toLowerCase();


    const speciesFilter =
        document
            .getElementById(
                "observationSpeciesFilter"
            )
            ?.value || "";


    const records =
        state.observations
            .filter(
                observation => {

                    const species =
                        getSpecies(
                            observation.speciesId
                        );


                    const text =
                        `${species?.name || ""}
                        ${observation.location || ""}
                        ${observation.observer || ""}
                        ${observation.behavior || ""}`
                            .toLowerCase();


                    return (

                        text.includes(search) &&

                        (
                            !speciesFilter ||
                            observation.speciesId ===
                                speciesFilter
                        )

                    );

                }
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


    tbody.innerHTML =
        records
            .map(
                observation => `

                <tr>

                    <td>
                        ${formatDateTime(
                            observation.date
                        )}
                    </td>

                    <td>
                        <span class="species-table-name">

                            ${
                                getSpeciesName(
                                    observation.speciesId
                                )
                            }

                        </span>
                    </td>

                    <td>
                        ${
                            observation.animalId
                                ? escapeHTML(
                                    getAnimal(
                                        observation.animalId
                                    )?.tag ||
                                    "—"
                                )
                                : "Population"
                        }
                    </td>

                    <td>
                        ${observation.count}
                    </td>

                    <td>
                        ${escapeHTML(
                            observation.behavior
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            observation.location || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            observation.observer || "—"
                        )}
                    </td>

                </tr>

                `
            )
            .join("");


    if (!records.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="table-empty">

                    No observations found.

                </td>
            </tr>
        `;

    }

}


/* =========================================================
   ANIMAL TABLE
========================================================= */

function renderAnimalsTable() {

    const tbody =
        document.getElementById(
            "animalsTableBody"
        );

    if (!tbody) return;


    const search =
        (
            document
                .getElementById(
                    "animalSearch"
                )
                ?.value || ""
        )
            .toLowerCase();


    const speciesFilter =
        document
            .getElementById(
                "animalSpeciesFilter"
            )
            ?.value || "";


    const records =
        state.animals.filter(
            animal => {

                const species =
                    getSpecies(
                        animal.speciesId
                    );


                const text =
                    `${animal.tag}
                    ${species?.name || ""}
                    ${animal.location || ""}
                    ${animal.sex || ""}
                    ${animal.ageClass || ""}`
                        .toLowerCase();


                return (

                    text.includes(search) &&

                    (
                        !speciesFilter ||
                        animal.speciesId ===
                            speciesFilter
                    )

                );

            }
        );


    tbody.innerHTML =
        records
            .map(
                animal => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                animal.tag
                            )}
                        </strong>
                    </td>

                    <td>
                        ${getSpeciesName(
                            animal.speciesId
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            animal.sex
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            animal.ageClass
                        )}
                    </td>

                    <td>

                        <span class="status-pill status-active">

                            ${escapeHTML(
                                animal.status
                            )}

                        </span>

                    </td>

                    <td>
                        ${escapeHTML(
                            animal.location || "—"
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            animal.firstRecorded
                        )}
                    </td>

                </tr>

                `
            )
            .join("");


    if (!records.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="table-empty">

                    No animals found.

                </td>
            </tr>
        `;

    }

}


/* =========================================================
   INCIDENTS
========================================================= */

function openIncidentModal() {

    if (!canEdit()) {

        showToast(
            "Viewer accounts cannot report incidents.",
            "warning"
        );

        return;

    }


    document
        .getElementById(
            "modalRoot"
        )
        .innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal modal-lg"
                onclick="event.stopPropagation()">


                <div class="modal-header">

                    <div>

                        <span class="eyebrow">
                            RISK & INCIDENTS
                        </span>

                        <h2>
                            Report Incident
                        </h2>

                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">
                        ×
                    </button>

                </div>


                <form id="incidentForm">

                    <div class="form-grid">


                        <div class="form-field">

                            <label>
                                Incident Type
                            </label>

                            <select id="incidentType">

                                <option>
                                    Human-Wildlife Conflict
                                </option>

                                <option>
                                    Snaring
                                </option>

                                <option>
                                    Poaching
                                </option>

                                <option>
                                    Habitat Destruction
                                </option>

                                <option>
                                    Illegal Grazing
                                </option>

                                <option>
                                    Wildlife Mortality
                                </option>

                                <option>
                                    Fire
                                </option>

                                <option>
                                    Other
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                Severity
                            </label>

                            <select id="incidentSeverity">

                                <option>
                                    Low
                                </option>

                                <option>
                                    Medium
                                </option>

                                <option>
                                    High
                                </option>

                                <option>
                                    Critical
                                </option>

                            </select>

                        </div>


                        <div class="form-field">

                            <label>
                                Date
                            </label>

                            <input
                                id="incidentDate"
                                type="date"
                                value="${new Date()
                                    .toISOString()
                                    .slice(0,10)}">

                        </div>


                        <div class="form-field">

                            <label>
                                Location
                            </label>

                            <input
                                id="incidentLocation"
                                placeholder="e.g. Tsavo East">

                        </div>


                        <div class="form-field">

                            <label>
                                Latitude
                            </label>

                            <input
                                id="incidentLatitude"
                                type="number"
                                step="any">

                        </div>


                        <div class="form-field">

                            <label>
                                Longitude
                            </label>

                            <input
                                id="incidentLongitude"
                                type="number"
                                step="any">

                        </div>


                        <div class="form-field">

                            <label>
                                Reported By
                            </label>

                            <input
                                id="incidentReporter">

                        </div>


                        <div class="form-field">

                            <label>
                                Status
                            </label>

                            <select id="incidentStatus">

                                <option>
                                    Open
                                </option>

                                <option>
                                    Investigating
                                </option>

                                <option>
                                    Resolved
                                </option>

                                <option>
                                    Closed
                                </option>

                            </select>

                        </div>


                        <div class="form-field full">

                            <label>
                                Description
                            </label>

                            <textarea
                                id="incidentDescription"
                                rows="5"></textarea>

                        </div>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="closeModal()">

                            Cancel

                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary">

                            Save Incident

                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;


    document
        .getElementById(
            "incidentForm"
        )
        .addEventListener(
            "submit",
            saveIncident
        );

}


function saveIncident(event) {

    event.preventDefault();


    state.incidents.push({

        id:
            generateId("INC"),

        date:
            document
                .getElementById(
                    "incidentDate"
                )
                .value,

        type:
            document
                .getElementById(
                    "incidentType"
                )
                .value,

        severity:
            document
                .getElementById(
                    "incidentSeverity"
                )
                .value,

        location:
            document
                .getElementById(
                    "incidentLocation"
                )
                .value
                .trim(),

        latitude:
            Number(
                document
                    .getElementById(
                        "incidentLatitude"
                    )
                    .value
            ),

        longitude:
            Number(
                document
                    .getElementById(
                        "incidentLongitude"
                    )
                    .value
            ),

        status:
            document
                .getElementById(
                    "incidentStatus"
                )
                .value,

        description:
            document
                .getElementById(
                    "incidentDescription"
                )
                .value
                .trim(),

        reportedBy:
            document
                .getElementById(
                    "incidentReporter"
                )
                .value
                .trim()

    });


    saveState();

    closeModal();

    renderAll();


    showToast(
        "Incident recorded.",
        "success"
    );

}


function renderIncidents() {

    const container =
        document.getElementById(
            "incidentCards"
        );

    if (!container) return;


    const open =
        state.incidents.filter(
            i =>
                i.status === "Open"
        ).length;


    const critical =
        state.incidents.filter(
            i =>
                i.severity === "Critical"
        ).length;


    const investigating =
        state.incidents.filter(
            i =>
                i.status === "Investigating"
        ).length;


    document
        .getElementById(
            "openIncidents"
        )
        .textContent =
        open;


    document
        .getElementById(
            "criticalIncidents"
        )
        .textContent =
        critical;


    document
        .getElementById(
            "investigatingIncidents"
        )
        .textContent =
        investigating;


    container.innerHTML =
        state.incidents
            .map(
                incident => `

                <article
                    class="incident-card">

                    <div
                        class="incident-severity severity-${incident.severity.toLowerCase()}">

                        ${incident.severity}

                    </div>

                    <div class="incident-card-body">

                        <div class="incident-card-heading">

                            <div>

                                <span class="eyebrow">
                                    ${formatDate(
                                        incident.date
                                    )}
                                </span>

                                <h3>
                                    ${escapeHTML(
                                        incident.type
                                    )}
                                </h3>

                            </div>

                            <span class="status-pill">
                                ${escapeHTML(
                                    incident.status
                                )}
                            </span>

                        </div>

                        <p>
                            ${escapeHTML(
                                incident.description
                            )}
                        </p>

                        <div class="incident-meta">

                            <span>
                                ◎
                                ${escapeHTML(
                                    incident.location || "Unknown"
                                )}
                            </span>

                            <span>
                                ◉
                                ${escapeHTML(
                                    incident.reportedBy || "Unknown"
                                )}
                            </span>

                        </div>

                    </div>

                </article>

                `
            )
            .join("");

}


/* =========================================================
   MAPS
========================================================= */

function initMaps() {

    if (
        typeof L === "undefined"
    ) {

        return;

    }


    const osm =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        );


    const satellite =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution:
                    "Tiles &copy; Esri"
            }
        );


    dashboardMap =
        L.map(
            "dashboardMap",
            {
                center: [
                    -0.2,
                    37.9
                ],
                zoom: 5,
                zoomControl: false,
                layers: [osm]
            }
        );


    L.control
        .zoom({
            position: "bottomright"
        })
        .addTo(
            dashboardMap
        );


    mainMap =
        L.map(
            "mainMap",
            {
                center: [
                    -0.2,
                    37.9
                ],
                zoom: 6,
                layers: [osm]
            }
        );


    L.control
        .layers(
            {
                "Street Map": osm,
                "Satellite": satellite
            }
        )
        .addTo(
            mainMap
        );


    setTimeout(
        renderMapMarkers,
        200
    );

}


function createSpeciesMarker(
    species,
    label
) {

    const color =
        species?.color ||
        "#39c7a5";


    return L.divIcon({

        className:
            "custom-map-marker",

        html: `

            <div
                class="map-marker"
                style="
                    --marker-color:${color};
                ">

                <span>
                    ${species?.icon || "◉"}
                </span>

            </div>

            <div class="map-label">
                ${escapeHTML(
                    label
                )}
            </div>

        `,

        iconSize: [
            42,
            52
        ],

        iconAnchor: [
            21,
            42
        ]

    });

}


function createIncidentMarker() {

    return L.divIcon({

        className:
            "custom-map-marker",

        html: `

            <div class="incident-map-marker">
                !
            </div>

        `,

        iconSize: [
            36,
            36
        ],

        iconAnchor: [
            18,
            18
        ]

    });

}


function renderMapMarkers() {

    if (!mainMap) return;


    mainMap.eachLayer(
        layer => {

            if (
                layer instanceof
                L.Marker
            ) {

                mainMap.removeLayer(
                    layer
                );

            }

        }
    );


    if (dashboardMap) {

        dashboardMap.eachLayer(
            layer => {

                if (
                    layer instanceof
                    L.Marker
                ) {

                    dashboardMap.removeLayer(
                        layer
                    );

                }

            }
        );

    }


    const speciesFilter =
        document
            .getElementById(
                "mapSpeciesFilter"
            )
            ?.value || "";


    const layerFilter =
        document
            .getElementById(
                "mapLayerFilter"
            )
            ?.value || "all";


    let mapped =
        0;


    if (
        layerFilter === "all" ||
        layerFilter === "observations"
    ) {

        state.observations.forEach(
            observation => {

                if (
                    !Number.isFinite(
                        observation.latitude
                    ) ||
                    !Number.isFinite(
                        observation.longitude
                    )
                ) {

                    return;

                }


                if (
                    speciesFilter &&
                    observation.speciesId !==
                        speciesFilter
                ) {

                    return;

                }


                const species =
                    getSpecies(
                        observation.speciesId
                    );


                const marker =
                    L.marker(
                        [
                            observation.latitude,
                            observation.longitude
                        ],
                        {
                            icon:
                                createSpeciesMarker(
                                    species,
                                    species?.name ||
                                    "Observation"
                                )
                        }
                    );


                marker.bindPopup(`

                    <div class="map-popup">

                        <strong>
                            ${getSpeciesName(
                                observation.speciesId
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                observation.behavior
                            )}
                        </span>

                        <span>
                            Count:
                            ${observation.count}
                        </span>

                        <span>
                            ${escapeHTML(
                                observation.location
                            )}
                        </span>

                    </div>

                `);


                marker.addTo(
                    mainMap
                );


                if (dashboardMap) {

                    L.marker(
                        [
                            observation.latitude,
                            observation.longitude
                        ],
                        {
                            icon:
                                createSpeciesMarker(
                                    species,
                                    ""
                                )
                        }
                    )
                        .addTo(
                            dashboardMap
                        );

                }


                mapped++;

            }
        );

    }


    if (
        layerFilter === "all" ||
        layerFilter === "incidents"
    ) {

        state.incidents.forEach(
            incident => {

                if (
                    !Number.isFinite(
                        incident.latitude
                    ) ||
                    !Number.isFinite(
                        incident.longitude
                    )
                ) {

                    return;

                }


                const marker =
                    L.marker(
                        [
                            incident.latitude,
                            incident.longitude
                        ],
                        {
                            icon:
                                createIncidentMarker()
                        }
                    );


                marker.bindPopup(`

                    <div class="map-popup">

                        <strong>
                            ${escapeHTML(
                                incident.type
                            )}
                        </strong>

                        <span>
                            Severity:
                            ${escapeHTML(
                                incident.severity
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                incident.location
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                incident.status
                            )}
                        </span>

                    </div>

                `);


                marker.addTo(
                    mainMap
                );


                if (dashboardMap) {

                    L.marker(
                        [
                            incident.latitude,
                            incident.longitude
                        ],
                        {
                            icon:
                                createIncidentMarker()
                        }
                    )
                        .addTo(
                            dashboardMap
                        );

                }


                mapped++;

            }
        );

    }


    const mappedElement =
        document.getElementById(
            "mappedRecords"
        );


    if (mappedElement) {

        mappedElement.textContent =
            mapped;

    }

}


function fitKenya() {

    if (!mainMap) return;


    mainMap.fitBounds([
        [-4.7, 33.8],
        [5.1, 42.0]
    ]);

}


function clearMapFilters() {

    const species =
        document.getElementById(
            "mapSpeciesFilter"
        );


    const layer =
        document.getElementById(
            "mapLayerFilter"
        );


    if (species)
        species.value = "";


    if (layer)
        layer.value = "all";


    renderMapMarkers();

}


/* =========================================================
   ANALYTICS
========================================================= */

function renderAnalytics() {

    renderSpeciesChart();

    renderIncidentChart();

    renderTimelineChart();

}


function renderSpeciesChart() {

    const canvas =
        document.getElementById(
            "speciesChart"
        );

    if (!canvas) return;


    if (speciesChart)
        speciesChart.destroy();


    const activeSpecies =
        state.species.filter(
            s =>
                s.status === "Active"
        );


    speciesChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        activeSpecies.map(
                            s => s.name
                        ),

                    datasets: [

                        {
                            data:
                                activeSpecies.map(
                                    s =>
                                        state.observations.filter(
                                            o =>
                                                o.speciesId ===
                                                s.id
                                        ).length
                                ),

                            backgroundColor:
                                activeSpecies.map(
                                    s =>
                                        s.color
                                ),

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color:
                                    "#9aa9b7",

                                padding: 18

                            }

                        }

                    }

                }

            }
        );

}


function renderIncidentChart() {

    const canvas =
        document.getElementById(
            "incidentChart"
        );

    if (!canvas) return;


    if (incidentChart)
        incidentChart.destroy();


    const types =
        [
            ...new Set(
                state.incidents.map(
                    i => i.type
                )
            )
        ];


    incidentChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: types,

                    datasets: [

                        {
                            data:
                                types.map(
                                    type =>
                                        state.incidents.filter(
                                            i =>
                                                i.type ===
                                                type
                                        ).length
                                ),

                            backgroundColor:
                                "#d47b38",

                            borderRadius:
                                8

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            ticks: {
                                color:
                                    "#718394"
                            },

                            grid: {
                                display: false
                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color:
                                    "#718394"
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.04)"
                            }

                        }

                    }

                }

            }
        );

}


function renderTimelineChart() {

    const canvas =
        document.getElementById(
            "timelineChart"
        );

    if (!canvas) return;


    if (timelineChart)
        timelineChart.destroy();


    const labels = [];
    const values = [];


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setMonth(
            date.getMonth() - i
        );


        const label =
            date.toLocaleString(
                "en-US",
                {
                    month: "short"
                }
            );


        labels.push(label);


        values.push(
            state.observations.filter(
                observation => {

                    const d =
                        new Date(
                            observation.date
                        );


                    return (

                        d.getMonth() ===
                            date.getMonth() &&

                        d.getFullYear() ===
                            date.getFullYear()

                    );

                }
            ).length
        );

    }


    timelineChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Observations",

                            data:
                                values,

                            borderColor:
                                "#e8b84a",

                            backgroundColor:
                                "rgba(232,184,74,.08)",

                            fill: true,

                            tension: .35,

                            pointRadius: 4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            ticks: {
                                color:
                                    "#718394"
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.04)"
                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color:
                                    "#718394"
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.04)"
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   REPORTING
========================================================= */

function exportCSV(type) {

    let rows = [];
    let filename = type;


    if (type === "species") {

        rows = state.species.map(
            species => ({

                Common_Name:
                    species.name,

                Scientific_Name:
                    species.scientific,

                Code:
                    species.code,

                Kingdom:
                    species.taxonomy?.kingdom || "",

                Phylum:
                    species.taxonomy?.phylum || "",

                Class:
                    species.taxonomy?.className || "",

                Order:
                    species.taxonomy?.order || "",

                Family:
                    species.taxonomy?.family || "",

                Genus:
                    species.taxonomy?.genus || "",

                Taxon:
                    species.taxonomy?.species || "",

                IUCN:
                    species.conservationStatus,

                CITES:
                    species.citesAppendix,

                Monitoring_Category:
                    species.monitoringCategory,

                Status:
                    species.status

            })
        );

    }


    if (type === "animals") {

        rows =
            state.animals.map(
                animal => ({

                    Animal_ID:
                        animal.tag,

                    Species:
                        getSpecies(
                            animal.speciesId
                        )?.name || "",

                    Scientific_Name:
                        getSpecies(
                            animal.speciesId
                        )?.scientific || "",

                    Sex:
                        animal.sex,

                    Age_Class:
                        animal.ageClass,

                    Status:
                        animal.status,

                    Location:
                        animal.location,

                    Collar:
                        animal.collar,

                    First_Recorded:
                        animal.firstRecorded

                })
            );

    }


    if (type === "observations") {

        rows =
            state.observations.map(
                observation => ({

                    Date:
                        observation.date,

                    Species:
                        getSpecies(
                            observation.speciesId
                        )?.name || "",

                    Scientific_Name:
                        getSpecies(
                            observation.speciesId
                        )?.scientific || "",

                    Individual:
                        getAnimal(
                            observation.animalId
                        )?.tag || "",

                    Count:
                        observation.count,

                    Behaviour:
                        observation.behavior,

                    Location:
                        observation.location,

                    Latitude:
                        observation.latitude,

                    Longitude:
                        observation.longitude,

                    Observer:
                        observation.observer

                })
            );

    }


    if (type === "incidents") {

        rows =
            state.incidents.map(
                incident => ({

                    Date:
                        incident.date,

                    Type:
                        incident.type,

                    Severity:
                        incident.severity,

                    Location:
                        incident.location,

                    Status:
                        incident.status,

                    Reported_By:
                        incident.reportedBy,

                    Description:
                        incident.description

                })
            );

    }


    if (!rows.length) {

        showToast(
            "There is no data to export.",
            "warning"
        );

        return;

    }


    const headers =
        Object.keys(
            rows[0]
        );


    const csv = [

        headers.join(","),

        ...rows.map(
            row =>
                headers
                    .map(
                        header =>
                            `"${String(
                                row[header] ??
                                ""
                            )
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                    )
                    .join(",")
        )

    ].join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        `smart-wildlife-${filename}.csv`;

    link.click();


    URL.revokeObjectURL(
        url
    );


    showToast(
        `${type} exported successfully.`,
        "success"
    );

}


function downloadBackup() {

    const backup = {

        exportedAt:
            new Date()
                .toISOString(),

        application:
            "SMART Wildlife Intelligence",

        version:
            "1.0.0",

        species:
            state.species,

        animals:
            state.animals,

        observations:
            state.observations,

        incidents:
            state.incidents

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        `smart-wildlife-backup-${Date.now()}.json`;

    link.click();


    URL.revokeObjectURL(
        url
    );

}


function printReport() {

    window.print();

}


/* =========================================================
   RESET
========================================================= */

function resetDemo() {

    if (!canEdit()) {

        showToast(
            "Only administrators can reset demo data.",
            "warning"
        );

        return;

    }


    const confirmed =
        confirm(
            "Reset the SMART Wildlife demo data? All locally added records will be removed."
        );


    if (!confirmed) return;


    localStorage.removeItem(
        STORAGE_KEY
    );


    seedDemoData();

    renderAll();


    showToast(
        "Demo workspace restored.",
        "success"
    );

}


/* =========================================================
   MODAL
========================================================= */

function closeModal(event) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "modal-backdrop"
        )
    ) {

        return;

    }


    document
        .getElementById(
            "modalRoot"
        )
        .innerHTML = "";

}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function bindGlobalSearch() {

    const search =
        document.getElementById(
            "globalSearch"
        );


    search.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            const value =
                search.value
                    .trim()
                    .toLowerCase();


            if (!value) return;


            const species =
                state.species.find(
                    species =>
                        species.name
                            .toLowerCase()
                            .includes(value)
                );


            const animal =
                state.animals.find(
                    animal =>
                        animal.tag
                            .toLowerCase()
                            .includes(value)
                );


            if (species) {

                setView("species");

                document
                    .getElementById(
                        "speciesSearch"
                    )
                    .value =
                    species.name;

                renderSpeciesManagement();

                return;

            }


            if (animal) {

                setView("animals");

                document
                    .getElementById(
                        "animalSearch"
                    )
                    .value =
                    animal.tag;

                renderAnimalsTable();

                return;

            }


            showToast(
                "No matching wildlife record found.",
                "info"
            );

        }
    );

}


/* =========================================================
   UTILITIES
========================================================= */

function formatDate(value) {

    if (!value)
        return "—";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatDateTime(value) {

    if (!value)
        return "—";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    const root =
        document.getElementById(
            "toastRoot"
        );


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    toast.innerHTML = `

        <div class="toast-symbol">

            ${
                type === "success"
                    ? "✓"
                    : type === "error"
                    ? "!"
                    : "●"
            }

        </div>

        <span>
            ${escapeHTML(
                message
            )}
        </span>

    `;


    root.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "toast-hide"
            );

            setTimeout(
                () =>
                    toast.remove(),
                300
            );

        },
        3200
    );

}


/* =========================================================
   SESSION RESTORE
========================================================= */

(function restoreSession() {

    const saved =
        sessionStorage.getItem(
            "smart_session"
        );


    if (!saved) return;


    try {

        state.session =
            JSON.parse(
                saved
            );

        enterApplication();

    } catch {

        sessionStorage.removeItem(
            "smart_session"
        );

    }

})();