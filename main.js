const map = L.map('map', {preferCanvas: true}).setView([23.43631, 0], 2);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 16,
  attribution: '&copy; Esri'
}).addTo(map);

document.querySelector('.leaflet-attribution-flag').remove();

const circles = L.layerGroup().addTo(map);

let annotation, percentages, colors;

function renderAdmix(params) {
  let div = '<div class="bar-chart-bar">';
  const admix = params.data.admix;
  for (let i = 0; i < admix.length; i++) {
    div += `<div class="bar" style="width:${admix[i]}%; background-color:${colors[i]};"></div>`;
  }
  div += '</div>';
  return div;
}

function yHgClass(params) {
  if (params.value == null) {
    return null;
  }
  if (/^(A0-T|[A-Z]{2,})/.test(params.value)) {
    return 'y-hg-other';
  }
  const hg = params.value.match(/^(E1b1b|[A-Z])/)[0];
  return 'y-hg-' + hg.toLowerCase();
}

function renderYHg(data) {
  let class_;
  if (/^(A0-T|[A-Z]{2,})/.test(data)) {
    class_ = 'y-hg-other';
  } else {
    const hg = data.match(/^(E1b1b|[A-Z])/)[0];
    class_ = 'y-hg-' + hg.toLowerCase();
  }
  return `<span class="${class_}">${data}</span>`;
}

function mitoHgClass(params) {
  if (params.value == null) {
    return null;
  }
  if (/^L([^0-3]|[0-3]')/.test(params.value)) {
    return 'mito-hg-other';
  }
  const hg = params.value.match(/^(HV|L[0-3]|R0|[A-Z])/)[0];
  return 'mito-hg-' + hg.toLowerCase();
}

function renderMitoHg(data) {
  let class_;
  if (/^L([^0-3]|[0-3]')/.test(data)) {
    class_ = 'mito-hg-other';
  } else {
    const hg = data.match(/^(HV|L[0-3]|R0|[A-Z])/)[0];
    class_ = 'mito-hg-' + hg.toLowerCase();
  }
  return `<span class="${class_}">${data}</span>`;
}

function skinClass(params) {
  if (params.value == null) {
    return null;
  }
  return 'skin-' + params.value.toLowerCase().replace(' ', '-');
}

function renderSkin(data) {
  const class_ = 'skin-' + data.toLowerCase().replace(' ', '-');
  return `<span class="${class_}">${data}</span>`;
}

function hairClass(params) {
  if (params.value == null) {
    return null;
  }
  return 'hair-' + params.value.toLowerCase().replace('/', '-');
}

function renderHair(data) {
  const class_ = 'hair-' + data.toLowerCase().replace('/', '-');
  return `<span class="${class_}">${data}</span>`;
}

function eyesClass(params) {
  if (params.value == null) {
    return null;
  }
  return 'eyes-' + params.value.toLowerCase();
}

function renderEyes(data) {
  const class_ = 'eyes-' + data.toLowerCase();
  return `<span class="${class_}">${data}</span>`;
}

function formatDate(params) {
  return params.value.toString().replace('-', '\u2212').replace(/(\d{2})(\d{3})/, '$1,$2');
}

function renderDate(data) {
  return data.toString().replace('-', '&minus;').replace(/(\d{2})(\d{3})/, '$1,$2');
}

let gridOptions = {
  rowHeight: 24,
  defaultColDef: {
    filter: true,
    floatingFilter: true,
  },
  columnDefs: [
    {
      headerName: 'Admixture', colId: 'admix', width: 332, cellRenderer: renderAdmix,
      cellStyle: {display: 'flex', alignItems: 'center'}, pinned: 'left',
      sortable: false, filter: false
    },
    { headerName: 'ID', field: 'id', width: 115, pinned: 'left' },
    { headerName: 'Group', field: 'group', width: 180 },
    { headerName: 'Date', field: 'date', width: 86, valueFormatter: formatDate, filter: false },
    { headerName: 'ISOGG Y Hg', field: 'isogg', width: 160, cellClass: yHgClass },
    { headerName: 'Mito Hg', field: 'mito', width: 114, cellClass: mitoHgClass },
    { headerName: 'Skin', field: 'skin', width: 76, cellClass: skinClass },
    { headerName: 'Hair', field: 'hair', width: 76, cellClass: hairClass },
    { headerName: 'Eyes', field: 'eyes', width: 76, cellClass: eyesClass },
    { headerName: 'Country', field: 'country', width: 135 },
    { headerName: 'Sex', field: 'sex', width: 76 },
    { headerName: 'YFull Y Hg', field: 'yfull', width: 135, cellClass: yHgClass },
    { headerName: 'Index', field: 'index', width: 90 }
  ],
  enableCellTextSelection: true,
  onFilterChanged: updateMap,
  isExternalFilterPresent: isExternalFilterPresent,
  doesExternalFilterPass: doesExternalFilterPass
};

const dateRange = document.getElementById('date-range');

noUiSlider.create(dateRange, {
  start: [-43500, 1950],
  behaviour: 'tap-drag',
  connect: true,
  range: {
    'min': [-43500, 500],
    '20%': [-8000, 10],
    'max': [1950]
  },
  format: {
    to: value => value.toFixed(0).replace('-0', '0').replace('-', '&minus;').replace(/(\d{2})(\d{3})/, '$1,$2'),
    from: parseInt
  },
  tooltips: true
});

function isExternalFilterPresent() {
  const [min, max] = dateRange.noUiSlider.get(true);
  return min != -43500 || max != 1950;
}

function doesExternalFilterPass(node) {
  let [min, max] = dateRange.noUiSlider.get(true);
  min = Math.round(min);
  max = Math.round(max);
  const date = node.data.date;
  return min <= date && date <= max;
}

let gridDiv = document.querySelector('#table');
const gridApi = agGrid.createGrid(gridDiv, gridOptions);

dateRange.noUiSlider.on('update', () => gridApi.onFilterChanged());

function updateTable() {
  let data = [];
  let j = 0;
  for (let i = 0; i < annotation.length; i++) {
    while (percentages[j][0] < annotation[i].id && j < percentages.length - 1) j++;
    if (percentages[j][0] == annotation[i].id) {
      const row = {...annotation[i]};
      row.index = percentages[j][1];
      row.admix = percentages[j].slice(2);
      data.push(row);
    }
  }
  data.sort((a, b) => a.index - b.index);
  gridApi.setGridOption('rowData', data);
  percentages = null;
  data = null;
  updateMap();
}

function indexOfMax(arr) {
    let max = arr[0];
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }
    return maxIndex;
}

const yHgColors = new Map([
  ['A', '#000000'],
  ['B', '#59260b'],
  ['C', '#fed8b1'],
  ['D', '#ff8c00'],
  ['E', '#964b00'],
  ['E1b1b', '#40e0d0'],
  ['F', '#dcdcdc'],
  ['G', '#6cb4ee'],
  ['H', '#138808'],
  ['I', '#000080'],
  ['J', '#008080'],
  ['K', '#dcdcdc'],
  ['L', '#93c572'],
  ['M', '#8806ce'],
  ['N', '#ffff99'],
  ['O', '#ffef00'],
  ['P', '#dcdcdc'],
  ['Q', '#c80815'],
  ['R', '#246bce'],
  ['S', '#e0b0ff'],
  ['T', '#d0f0c0']
]);

const mitoHgColors = new Map([
  ['A', '#ff8c00'],
  ['B', '#c80815'],
  ['C', '#ffc0cb'],
  ['D', '#fed8b1'],
  ['E', '#daa520'],
  ['F', '#ffef00'],
  ['G', '#ffff99'],
  ['H', '#246bce'],
  ['HV', '#246bce'],
  ['I', '#138808'],
  ['J', '#008080'],
  ['K', '#6cb4ee'],
  ['L0', '#000000'],
  ['L1', '#59260b'],
  ['L2', '#964b00'],
  ['L3', '#cd853f'],
  ['M', '#dcdcdc'],
  ['N', '#dcdcdc'],
  ['P', '#8806ce'],
  ['Q', '#e0b0ff'],
  ['R', '#dcdcdc'],
  ['R0', '#246bce'],
  ['S', '#fae6fa'],
  ['T', '#008080'],
  ['U', '#000080'],
  ['V', '#246bce'],
  ['W', '#93c572'],
  ['X', '#d0f0c0'],
  ['Y', '#ffd700'],
  ['Z', '#ffc0cb']
]);

const skinColors = new Map([
  ['Very Pale', '#fff4f2'],
  ['Pale', '#fedcb9'],
  ['Intermediate', '#d7a57a'],
  ['Dark', '#a46136'],
  ['Dark-to-Black', '#5e4437']
]);

const hairColors = new Map([
  ['Black', '#000000'],
  ['D-brown/Black', '#59260b'],
  ['Blond', '#fbec5d'],
  ['Blond/D-blond', '#fbec5d'],
  ['D-blond/Brown', '#daa520'],
  ['Brown', '#964b00'],
  ['Brown/D-brown', '#964b00'],
  ['Red', '#c80815'],
  ['Light', '#daa520'],
  ['Dark', '#000000']
]);

const eyeColors = new Map([
  ['Blue', '#318ce7'],
  ['Intermediate', '#646c74'],
  ['Brown', '#964b00']
]);

function updateMap() {
  circles.clearLayers();
  const colorBy = document.getElementById('point-color-select').value;
  const columns = ['id', 'group', 'date', 'sex', 'isogg', 'yfull', 'mito', 'skin', 'hair', 'eyes'];
  const titles = ['ID', 'Group', 'Date', 'Sex', 'ISOGG Y Hg', 'YFull Y Hg', 'Mito Hg', 'Skin', 'Hair', 'Eyes'];
  const f = x => x;
  const renderers = [f, f, renderDate, f, renderYHg, renderYHg, renderMitoHg, renderSkin, renderHair, renderEyes];
  gridApi.forEachNodeAfterFilter(node => {
    const data = node.data;
    if (data.lat == null) return;
    let color;
    switch (colorBy) {
      case 'admixture':
        color = colors[indexOfMax(data.admix)];
        break;
      case 'isogg':
        if (data.isogg == null) return;
        if (/^(A0-T|[A-Z]{2,})/.test(data.isogg)) {
          color = '#dcdcdc';
        } else {
          const hg = data.isogg.match(/^(E1b1b|[A-Z])/)[0];
          color = yHgColors.get(hg);
        }
        break;
      case 'yfull':
        if (data.yfull == null) return;
        if (/^(A0-T|[A-Z]{2,})/.test(data.yfull)) {
          color = '#dcdcdc';
        } else {
          color = yHgColors.get(data.yfull[0]);
        }
        break;
      case 'mito':
        if (data.mito == null) return;
        if (/^L([^0-3]|[0-3]')/.test(data.mito)) {
          color = '#dcdcdc';
        } else {
          const hg = data.mito.match(/^(HV|L[0-3]|R0|[A-Z])/)[0];
          color = mitoHgColors.get(hg);
        }
        break;
      case 'skin':
        if (data.skin == null) return;
        color = skinColors.get(data.skin);
        break;
      case 'hair':
        if (data.hair == null) return;
        color = hairColors.get(data.hair);
        break;
      case 'eyes':
        if (data.eyes == null) return;
        color = eyeColors.get(data.eyes);
    }
    const circle = L.circle([data.lat, data.long], {
      color: color,
      fillOpacity: 0.5,
      radius: 5000
    }).addTo(circles);
    text = '';
    for (let j = 0; j < columns.length; j++) {
      if (data[columns[j]] != null) {
        text += `${titles[j]}: ${renderers[j](data[columns[j]])}<br>`;
      }
    }
    circle.bindPopup(text);
  });
}

function split() {
  Split(['#mapdiv', '#controldiv', '#tablediv'], {
    gutterSize: 15,
    sizes: [40, 20, 40],
    minSize: 0,
    direction: 'vertical',
    onDrag: () => map.invalidateSize(),
    gutter: (index, direction) => {
      const gutter = document.createElement('div');
      gutter.className = `gutter gutter-${direction} bi bi-grip-horizontal`;
      return gutter;
    }
  });
  map.invalidateSize();
}

document.onload = split();

gridOptions = {
  rowHeight: 26,
  columnDefs: [
    { headerName: 'Date', field: 'date', width: 135 },
    { headerName: 'K', field: 'k', width: 71 },
    { headerName: 'Samples', field: 'samples', width: 111 },
    { headerName: 'SNPs', field: 'snps', width: 101 },
    { headerName: 'Description', field: 'desc', width: 346 }
  ],
  rowSelection: 'single'
};

gridDiv = document.querySelector('#run-table');
const runGridApi = agGrid.createGrid(gridDiv, gridOptions);

function loadRun() {
  const row = runGridApi.getSelectedRows()[0];
  fetch(`percentages/${row.date}-k-${row.k}.json`)
  .then(response => response.json())
  .then(json => {
    percentages = json;
    fetch(`colors/${row.date}-k-${row.k}.json`)
    .then(response => response.json())
    .then(json => {
      colors = json;
      updateTable();
    })
  });
}

fetch('annotation.json')
.then(response => response.json())
.then(json => {
  annotation = json;
  fetch('runs.json')
  .then(response => response.json())
  .then(json => {
    const runData = json;
    runData.sort((a, b) => b.k - a.k);
    runData.sort((a, b) => b.date - a.date);
    runGridApi.setGridOption('rowData', runData);
    runGridApi.getRowNode('0').setSelected(true);
    loadRun();
  });
});
