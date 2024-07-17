const map = L.map('map', {preferCanvas: true}).setView([23.43631, 0], 2);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 16,
  attribution: '&copy; Esri'
}).addTo(map);

document.querySelector('.leaflet-attribution-flag').remove();

const circles = L.layerGroup().addTo(map);

const id = 0, group = 1, country = 2, lat = 3, long = 4, date = 5, sex = 6, isogg = 7, yfull = 8,
      mito = 9, skin = 10, hair = 11, eyes = 12, index = 13, admix = 14;

const titles = ['ID', 'Group', 'Country', 'Latitude', 'Longitude', 'Date', 'Sex', 'ISOGG Y Hg',
                'YFull Y Hg', 'Mito Hg', 'Skin', 'Hair', 'Eyes', 'Index', 'Admixture'];

let data, k;

function render_admix(data, type, row) {
  if (type != 'display') {
    return null;
  }
  let div = '<div class="bar-chart-bar">';
  for (let i = 0; i < k; i++) {
    div += `<div class="bar" style="width:${row[admix + i]}%;background-color:${colors[i]};"></div>`;
  }
  div += '</div>';
  return div;
}

function render_skin(data, type) {
  if (type != 'display' || data == 'NA') {
    return data;
  }
  const class_ = 'skin_' + data.toLowerCase().replace(/[ -]/g, '_');
  if (data.length <= 5) {
    return `<div class="${class_}">${data}</div>`;
  } else {
    shortened = data.substr(0, 4);
    return `<div class="${class_}" title="${data}">${shortened}&hellip;</div>`;
  }
}

function render_skin_map(data) {
  if (data == 'NA') {
    return data;
  }
  const class_ = 'skin_' + data.toLowerCase().replace(/[ -]/g, '_');
  return `<span class="${class_}">${data}</span>`;
}

function render_hair(data, type) {
  if (type != 'display' || data == 'NA') {
    return data;
  }
  const class_ = 'hair_' + data.toLowerCase().replace(/[-/]/g, '_');
  if (data.length <= 5) {
    return `<div class="${class_}">${data}</div>`;
  } else {
    shortened = data.substr(0, 4);
    return `<div class="${class_}" title="${data}">${shortened}&hellip;</div>`;
  }
}

function render_hair_map(data) {
  if (data == 'NA') {
    return data;
  }
  const class_ = 'hair_' + data.toLowerCase().replace(/[-/]/g, '_');
  return `<span class="${class_}">${data}</span>`;
}

function render_eyes(data, type) {
  if (type != 'display' || data == 'NA') {
    return data;
  }
  const class_ = 'eyes_' + data.toLowerCase();
  if (data.length <= 5) {
    return `<div class="${class_}">${data}</div>`;
  } else {
    shortened = data.substr(0, 4);
    return `<div class="${class_}" title="${data}">${shortened}&hellip;</div>`;
  }
}

function render_eyes_map(data) {
  if (data == 'NA') {
    return data;
  }
  const class_ = 'eyes_' + data.toLowerCase();
  return `<span class="${class_}">${data}</span>`;
}

function render_date(data, type) {
  if (type != 'display') {
    return data;
  }
  return data.toString().replace('-', '&minus;').replace(/(\d{2})(\d{3})/, '$1,$2');
}

function render_date_map(data) {
  return data.toString().replace('-', '&minus;').replace(/(\d{2})(\d{3})/, '$1,$2');
}

const table = new DataTable('#table', {
  data: data,
  scrollX: true,
  fixedColumns: {
    start: 2
  },
  layout: {
    topStart: {
      buttons: ['pageLength', {extend: 'colvis', text: 'Columns'}]
    }
  },
  lengthMenu: [[10, 50, 100, 500, 1000, 5000, -1], [10, 50, 100, 500, 1000, 5000, 'All']],
  columns: [
    {
      sortable: false,
      render: render_admix
    },
    {
      data: id,
      render: DataTable.render.ellipsis(10)
    },
    {
      data: group,
      render: DataTable.render.ellipsis(20)
    },
    {
      data: country,
      render: DataTable.render.ellipsis(10),
      visible: false
    },
    {
      data: date,
      render: render_date
    },
    {
      data: sex,
      visible: false
    },
    {
      data: isogg,
      render: DataTable.render.ellipsis(15)
    },
    {
      data: yfull,
      render: DataTable.render.ellipsis(15),
      visible: false
    },
    {
      data: mito,
      render: DataTable.render.ellipsis(15)
    },
    {
      data: skin,
      render: render_skin
    },
    {
      data: hair,
      render: render_hair
    },
    {
      data: eyes,
      render: render_eyes
    },
    {
      data: index,
      visible: false
    }
  ]
});

function update_table() {
  data = [];
  let j = 0;
  for (let i = 0; i < annotation.length; i++) {
    while (percentages[j][0] < annotation[i][id] && j < percentages.length - 1) j++;
    if (percentages[j][0] == annotation[i][id]) {
      data.push(annotation[i].concat(percentages[j].slice(1)));
    }
  }
  table.clear();
  table.rows.add(data);
  table.order([12, 'asc']);
  table.draw();
  table.columns.adjust();
  percentages = null;
  data = null;
}

function index_of_max(arr) {
    let max = arr[0];
    let max_index = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max_index = i;
        max = arr[i];
      }
    }
    return max_index;
}

const skin_colors = new Map([
  ['Very Pale', '#fff4f2'],
  ['Pale', '#fedcb9'],
  ['Intermediate', '#d7a57a'],
  ['Dark', '#a46136'],
  ['Dark-to-Black', '#5e4437']
]);

const hair_colors = new Map([
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

const eye_colors = new Map([
  ['Blue', '#318ce7'],
  ['Intermediate', '#646c74'],
  ['Brown', '#964b00']
]);

function update_map() {
  const data = table.rows({page: 'current', search: 'applied'}).data();
  circles.clearLayers();
  let color, circle;
  const color_by = document.getElementById('point-color-select').value;
  for (let i = 0; i < data.length; i++) {
    if (data[i][lat] == null) continue;
    switch (color_by) {
      case 'admixture':
        color = colors[index_of_max(data[i].slice(admix))];
        break;
      case 'skin':
        if (data[i][skin] == 'NA') continue;
        color = skin_colors.get(data[i][skin]);
        break;
      case 'hair':
        if (data[i][hair] == 'NA') continue;
        color = hair_colors.get(data[i][hair]);
        break;
      case 'eyes':
        if (data[i][eyes] == 'NA') continue;
        color = eye_colors.get(data[i][eyes]);
    }
    circle = L.circle([data[i][lat], data[i][long]], {
      color: color,
      fillOpacity: 0.5,
      radius: 5000
    }).addTo(circles);
    columns = [id, group, date, sex, isogg, yfull, mito, skin, hair, eyes];
    f = x => x;
    renderers = [f, f, render_date_map, f, f, f, f, render_skin_map, render_hair_map, render_eyes_map];
    text = '';
    for (let j = 0; j < columns.length; j++) {
      text += `${titles[columns[j]]}: ${renderers[j](data[i][columns[j]])}<br>`;
    }
    circle.bindPopup(text);
  }
}

table.on('draw', update_map);

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

const run_table = new DataTable('#run-table', {
  select: {
    style: 'single'
  }
});

function load_run() {
  let row = run_table.row({selected: true}).data();
  let date = row[0];
  k = row[1];
  fetch(`percentages/${date}-k-${k}.json`)
  .then(response => response.json())
  .then(json => {
    percentages = json;
    fetch(`colors/${date}-k-${k}.json`)
    .then(response => response.json())
    .then(json => {
      colors = json;
      update_table();
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
    run_data = json;
    run_table.rows.add(run_data);
    run_table.order([0, 'desc'], [1, 'desc']);
    run_table.row(0).select();
    run_table.draw();
    load_run();
  });
});

const date_range = document.getElementById('date-range');

noUiSlider.create(date_range, {
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

date_range.noUiSlider.on('update', (values, handle, unencoded) =>
  table.column(4).search.fixed('date-range', date =>
    Math.round(unencoded[0]) <= date && date <= Math.round(unencoded[1])
  ).draw()
);
