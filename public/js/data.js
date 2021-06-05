/////////////////
// Leaflet map //
/////////////////

const fetchInitialStreetlightsData = async () => {
    // Fetch streetlights from Streetlights object upon initial page load

    // Initialize map
    const mymap = L.map('mapid').setView([38.033554, 	-78.48], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZXB1cnB1ciIsImEiOiJja24wYXlkZnEwbTNqMm9tbGdoM3R1OXE0In0.TCaPhnKXLVLFpJeUS1AKJQ'
    }).addTo(mymap);

    const response = await fetch('/api/streetlights', {
        method: 'GET'
    });

    if (response.ok) {
        const streetlightsData = await response.json()

        // put points on map using Leaflet points cluster
        makePointsCluster(streetlightsData, mymap);

        //put data into data table
        table.setData(streetlightsData);

    }
}


const makePointsCluster = (pointsData, mymap) => {
    // makes clusters of points on map because rendering is very slow individually
    const markerClusters = L.markerClusterGroup();

    // iterate through each marker
    for (let i = 0; i < pointsData.length; i++ ) {
        
        // adding information to popup window for each marker
        const popup = `
                       id: ${pointsData[i].id}  <br>
                       base_colo: ${pointsData[i].base_colo}  <br>
                       contract_n: ${pointsData[i].contract_n} <br>
                       decal_colo: ${pointsData[i].decal_colo}  <br>
                       decal_numb: ${pointsData[i].decal_numb} <br>
                       install_da: ${pointsData[i].install_da} <br>
                       lumens: ${pointsData[i].lumens} <br>
                       mount_heig: ${pointsData[i].mount_heig} <br>
                       nom_volt: ${pointsData[i].nom_volt} <br>
                       owner: ${pointsData[i].owner} <br>
                       style: ${pointsData[i].style} <br>
                       watts: ${pointsData[i].watts} <br>
                       work_effec: ${pointsData[i].work_effec} <br>
                       <br>
                       <button type="button" class="btn btn-primary popupBtn" id="editRecordBtn" onclick="editRecordClick()">Edit</button>
                       <button type="button" class="btn btn-primary popupBtn" id="deleteRecordBtn"  onclick="deleteRecordClick()">Delete</button>
                       `;

        const lat = pointsData[i].latitude;
        const lon = pointsData[i].longitude;

        // Puts marker on the map and binds popup to it
        const m = L.marker([lat, lon]).bindPopup(popup);

        markerClusters.addLayer(m);
    }
    const layerGroup = L.layerGroup([markerClusters]);
        
    mymap.addLayer(layerGroup);

};


const createFilteredMap = (filteredData) => {
    console.log("Data returned from request:", filteredData);

    // Initialize map
    var mymap = L.map('mapid').setView([38.033554, 	-78.48], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZXB1cnB1ciIsImEiOiJja24wYXlkZnEwbTNqMm9tbGdoM3R1OXE0In0.TCaPhnKXLVLFpJeUS1AKJQ'
    }).addTo(mymap);

    // put points on map
    makePointsCluster(filteredData, mymap);

};


// functions to execute on button click
const dataFilter = (event) => {
    event.preventDefault();

    // delete map html element
    const elem = document.getElementById("mapid").remove();

    // create new map html element and prepend to parent element
    const parentElem = document.getElementById("dataSection")
    const newMap = document.createElement('div')
    newMap.setAttribute('id', 'mapid');
    parentElem.prepend(newMap);


    // fetches filtered dataset to display on map
    dataFetch()

};

/////////////////////
// Tabulator Table //
/////////////////////

//create Tabulator on DOM element with id "example-table"
const table = new Tabulator("#dataTable", {
    height: 300, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    layout:"fitColumns", //fit columns to width of table (optional)
    columns: [ //Define Table Columns
        {title:"id", field:"id", width:175},
        {title:"base_colo", field:"base_colo", width:175},
        {title:"contract_n", field:"contract_n", width:175},
        {title:"decal_colo", field:"decal_colo", width:175},
        {title:"decal_numb", field:"decal_numb", width:175},
        {title:"install_da", field:"install_da", width:175},
        {title:"lumens", field:"lumens", width:175},
        {title:"mount_heig", field:"mount_heig", width:175},
        {title:"nom_volt", field:"nom_volt", width:175},
        {title:"owner", field:"owner", width:175},
        {title:"style", field:"style", width:175},
        {title:"watts", field:"watts", width:175},
        {title:"work_effec", field:"work_effec", width:175},
    ],
});



//////////////////////////////////////
// add event handlers to each button//
//////////////////////////////////////

const exportClick = (event) => {
    event.preventDefault();

    console.log('export button click');
};

const editRecordClick = (event) => {
    // event.preventDefault();

    console.log('edit record click');
};


const deleteRecordClick = (event) => {
    // event.preventDefault();

    console.log('delete record click');
};

// select other button elements in DOM
const exportBtn = document.querySelector('#exportBtn').addEventListener('click', exportClick);


///////////////////
// Modal Buttons //
///////////////////

// 'Filter' button in data filter modal
const makeDataFilterBtn = document.querySelector('#makeDataFilterBtn').addEventListener('click', dataFilter)

const dataFetch = async () => {
    // makes fetch request to database with user-provided parameters

    // get select input values provided by user.
    // coerce data to be string, null, etc
    let decal_colo = document.querySelector('#decal_colo').value.trim();
    if (decal_colo === "Choose...") {decal_colo = null};
    
    let owner = document.querySelector('#owner').value.trim();
    if (owner === "Choose..." || owner === "None") {owner = null};
    
    let lumens = document.querySelector('#lumens').value.trim();
    if (lumens === "Choose...") {lumens = null};

    // log user choices
    console.log(decal_colo, owner, lumens)

    //choose fetch response to make based on user filters
    if (decal_colo === null && lumens != null) {
        // if no decal_colo but yes lumens
        const response = await fetch('/api/FilterNoDCYesL', {
            method: 'POST',
            body: JSON.stringify({ owner, lumens }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            const filteredData = await response.json();
            // create map with filtered data
            createFilteredMap(filteredData);
            // put filtered data into data table
            table.setData(filteredData);
        }
    } else if (decal_colo === null && lumens === null) {
        // if no decal and no lumens
        const response = await fetch('/api/FilterNoDCNoL', {
            method: 'POST',
            body: JSON.stringify({ owner }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            const filteredData = await response.json();
            // create map with filtered data
            createFilteredMap(filteredData);
            // put filtered data into data table
            table.setData(filteredData);
        }
    } else if (decal_colo != null && lumens === null) {
        // if yes decal_colo and no lumens
        const response = await fetch('/api/FilterYesDCNoL', {
            method: 'POST',
            body: JSON.stringify({ decal_colo, owner }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            const filteredData = await response.json();
            // create map with filtered data
            createFilteredMap(filteredData);
            // put filtered data into data table
            table.setData(filteredData);
        }
    } else if (decal_colo != null && lumens != null) {
        // if yes decal_colo and yes lumens
        const response = await fetch('/api/FilterYesDCYesL', {
            method: 'POST',
            body: JSON.stringify({ decal_colo, owner, lumens }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            const filteredData = await response.json();
            // create map with filtered data
            createFilteredMap(filteredData);
            // put filtered data into data table
            table.setData(filteredData);
        }
    }
}



const addRecord = () => {
    // adds streetlight record to database

    // start by selecting values of all input fields
    let base_colo = document.querySelector('#base_colo').value.trim();
    if (!base_colo) {base_colo = null};
    let contract_n = document.querySelector('#contract_n').value.trim();
    if (!contract_n) {contract_n = null};

    // log input values
    console.log(base_colo);
}

// 'Add' button in Add Record modal
const addBtn = document.querySelector('#addBtn').addEventListener('click', addRecord);


// execute on page load
fetchInitialStreetlightsData();