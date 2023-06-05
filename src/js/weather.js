import axios from 'axios';
import dateFormat, { masks } from 'dateformat';
// import forecast from '../json/forecast.json';

export class Weather {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.weatherapi.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    this.rootEl = document.getElementById('root');
    this.containerEl = document.createElement('div');
    this.containerEl.classList.add('container');

    this.rootEl.append(this.containerEl);

    this.createCurrentWeather();
    this.getForecast();
    this.timer();
  }

  createCurrentWeather() {
    this.locationNameEl = document.createElement('p');
    this.locationNameEl.classList.add('location-name');

    this.locationRegionEl = document.createElement('p');
    this.locationRegionEl.classList.add('location-region');

    this.locationCountryEl = document.createElement('p');
    this.locationCountryEl.classList.add('location-country');

    this.locationWrapperEl = document.createElement('div');
    this.locationWrapperEl.classList.add('location-wrapper');
    this.locationWrapperEl.append(
      this.locationNameEl,
      this.locationRegionEl,
      this.locationCountryEl
    );

    this.currentTextEl = document.createElement('p');
    this.currentTextEl.classList.add('current-text');

    this.currentTimeEl = document.createElement('p');
    this.currentTimeEl.classList.add('current-time');

    this.currentTempEl = document.createElement('p');
    this.currentTempEl.classList.add('current-temp');

    this.currentIconEl = document.createElement('img');
    this.currentIconEl.classList.add('current-icon');

    this.currentTempWrapperEl = document.createElement('div');
    this.currentTempWrapperEl.classList.add('current-temp-wrapper');
    this.currentTempWrapperEl.append(this.currentTempEl, this.currentIconEl);

    this.currentDescriptWrapperEl = document.createElement('div');
    this.currentDescriptWrapperEl.classList.add('current-descript-wrapper');
    this.currentDescriptWrapperEl.append(
      this.currentTempWrapperEl,
      this.currentTextEl,
      this.currentTimeEl
    );

    this.currentWrapperEl = document.createElement('div');
    this.currentWrapperEl.classList.add('current-wrapper');
    this.currentWrapperEl.append(
      this.locationWrapperEl,
      this.currentDescriptWrapperEl
    );

    this.containerEl.append(this.currentWrapperEl);
  }

  updateCurrentWeatherUI({ current, location }) {
    const {
      condition: { text, icon },
      temp_c,
      last_updated_epoch,
    } = current;
    const { name, region, country } = location;

    // Current Weather Data ===================================================
    this.currentTimeEl.textContent = this.dateConverter(last_updated_epoch);
    this.currentTempEl.textContent = `${temp_c}°C`;
    this.currentIconEl.src = `http:${icon}`;
    this.currentIconEl.alt = text;
    this.currentTextEl.textContent = text;

    // Location Data ==========================================================
    this.locationNameEl.textContent = name;
    this.locationRegionEl.textContent = region;
    this.locationCountryEl.textContent = country;
  }

  timer() {
    setInterval(() => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      console.log(`${minutes}:${seconds}`, minutes % 15);

      if (minutes % 15 !== 5 || seconds > 0) {
        return;
      }

      console.log('update');
      this.getForecast();

      console.log(forecast);
    }, 1000);
  }

  async getForecast() {
    const forecast = await this.fetchCurrentWeather('Kryvyy Rih');
    this.updateCurrentWeatherUI(forecast.data);
  }

  async fetchCurrentWeather(city) {
    const params = {
      key: '8ddc4d4caf994c91928163714230406',
      q: city,
      aqi: 'no',
      lang: 'uk',
    };

    try {
      return await this.axiosInstance.get('/forecast.json', { params });
    } catch (err) {
      console.log(err);
    }
  }

  dateConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return dateFormat(now, 'dd.mm.yyyy HH:MM');
  }
}
