// displayWeather.js

let localIndex = [];
let setAlready = false;
const url = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-D9D50F93-3049-4A20-9AB9-E320874A2D7E';

let currentWeather, 
cityName, rainRate, 
highTemperature, 
lowTemperature, 
comfortLevel;

const weatherDisplay = document.querySelector('#weather-display');
const all = document.querySelector('#all');
const northern = document.querySelector('#northern');
const central = document.querySelector('#central');
const southern = document.querySelector('#southern');
const eastern = document.querySelector('#eastern');
const island = document.querySelector('#island');
const container = document.querySelector('.container');

// 獲取天氣數據
function getData() {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // 為 data.records.location 每個元素新增 index 屬性
      if (!setAlready) {
        data.records.location.forEach((location, index) => {
          location.index = index;
          setAlready = true;
        });
      }
      render(data);
      classfy(data);
    });
}

getData();

function render(data) {
  let content = '';
  const allCity = data.records.location;
  allCity.forEach((item) => {
    localIndex.push({ index: item.index, locationName: item.locationName });
  });
}

function classfy(data) {
  const city = [
    ['臺北市', '新北市', '基隆市', '新竹市', '桃園市', '新竹縣', '宜蘭縣'],
    ['臺中市', '苗栗縣', '彰化縣', '南投縣', '雲林縣'],
    ['高雄市', '臺南市', '嘉義市', '嘉義縣', '屏東縣', '澎湖縣'],
    ['花蓮縣', '臺東縣'],
    ['金門縣', '連江縣'],
  ];

  const updatedCity = city.map(region =>
    region.map(name => ({
      name: name,
      index: 0
    }))
  );
  const direction = {
    '北部': { data: updatedCity[0] },
    '中部': { data: updatedCity[1] },
    '南部': { data: updatedCity[2] },
    '東部': { data: updatedCity[3] },
    '離島': { data: updatedCity[4] }
  };

  let content = '';
  let center = direction.中部.data;
  let south = direction.南部.data;
  let north = direction.北部.data;
  let east = direction.東部.data;
  let islands = direction.離島.data;

  // 初始顯示所有區域的天氣卡片
  location(center);
  location(south);
  location(north);
  location(east);
  location(islands);

  // 事件監聽器
  central.addEventListener('click', () => {
    content = '';
    container.innerHTML = content;
    location(center);
  });
  northern.addEventListener('click', () => {
    content = '';
    container.innerHTML = content;
    location(north);
  });
  southern.addEventListener('click', () => {
    content = '';
    container.innerHTML = content;
    location(south);
  });
  eastern.addEventListener('click', () => {
    content = '';
    container.innerHTML = content;
    location(east);
  });
  island.addEventListener('click', () => {
    content = '';
    container.innerHTML = content;
    location(islands);
  });
  all.addEventListener('click', () => {
    content = '';
    container.innerHTML = content;
    location(center);
    location(south);
    location(north);
    location(east);
    location(islands);
  });

  function location(direction) {
    for (let i = 0; i < direction.length; i++) {
      let index;
      let match = localIndex.find((item) => {
        index = item.index;
        direction[i].index = item.index;
        return item.locationName === direction[i].name;
      });

      currentWeather = data.records.location[index].weatherElement[0].time[0].parameter.parameterName;
      cityName = data.records.location[index].locationName;
      lowTemperature = data.records.location[index].weatherElement[2].time[0].parameter.parameterName;
      highTemperature = data.records.location[index].weatherElement[4].time[0].parameter.parameterName;
      rainRate = data.records.location[index].weatherElement[1].time[0].parameter.parameterName;
      comfortLevel = data.records.location[index].weatherElement[3].time[0].parameter.parameterName;
      const imageUrl = weatherConditions[currentWeather];
      display(cityName, lowTemperature, highTemperature, rainRate, comfortLevel, imageUrl);
    }
  }
}

// 放大內容
function display(cityName, lowTemperature, highTemperature, rainRate, comfortLevel, imageUrl) {
  const content = `
    <div class="card animated" data-city="${cityName}" data-low-temperature="${lowTemperature}" data-high-temperature="${highTemperature}" data-rain-rate="${rainRate}" data-comfort-level="${comfortLevel}" data-weather="${currentWeather}">
      <div class="card-content">
        <p class="city-name">${cityName}</p>
        <p class="condition">${currentWeather}</p>
        <span class="icon"><img src="${imageUrl}" alt="icon"></span>
        <p class="temperature red">最高溫度 ${highTemperature}°C</p>
        <p class="temperature blue">最低溫度 ${lowTemperature}°C</p>
        <p class="rain-rate">${comfortLevel}</p>
        <p class="rain-rate">降雨率 ${rainRate}%</p>
      </div>
    </div>
  `;
  container.innerHTML += content;
}

// 等待 DOM 完全加載後執行
document.addEventListener("DOMContentLoaded", () => {
  // 創建遮罩元素
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // 創建詳細信息卡片元素
  const detailedCard = document.createElement('div');
  detailedCard.className = 'detailed-card';
  overlay.appendChild(detailedCard);

  // 事件監聽器，用於顯示詳細卡片
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    const cityName = card.dataset.city;
    const lowTemperature = card.dataset.lowTemperature;
    const highTemperature = card.dataset.highTemperature;
    const rainRate = card.dataset.rainRate;
    const comfortLevel = card.dataset.comfortLevel;
    const currentWeather = card.dataset.weather;

    detailedCard.innerHTML = `
      <p class="city-name">${cityName}</p>
      <p class="condition">${currentWeather}</p>
      <p class="temperature red">最高溫度 ${highTemperature}°C</p>
      <p class="temperature blue">最低溫度 ${lowTemperature}°C</p>
      <p class="rain-rate">${comfortLevel}</p>
      <p class="rain-rate">降雨率 ${rainRate}%</p>
    `;

    overlay.classList.add('active');
  });

  // 事件監聽器，用於點擊遮罩部分關閉詳細卡片
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
});
