import axios from 'axios';
import dateFormat, { i18n } from 'dateformat';
import forecast from '../json/forecast.json';

i18n.dayNames = [
  'Нд',
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
  'Неділя',
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  "П'ятниця",
  'Субота',
];

export class Weather {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.weatherapi.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.rootEl = document.getElementById('root');

    this.createCurrentWeather();
    this.createForecastDay();

    this.initEventListeners();
    this.getForecast();
    this.startTimer();
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

    const currentContainerEl = document.createElement('div');
    currentContainerEl.classList.add('container');
    currentContainerEl.append(this.currentWrapperEl);

    this.rootEl.insertAdjacentElement('beforeend', currentContainerEl);
  }

  createForecastDay() {
    this.forecastDayListEl = document.createElement('ul');
    this.forecastDayListEl.classList.add('forecast-day__list');

    const forecastDayContainerEl = document.createElement('div');
    forecastDayContainerEl.classList.add('container');
    forecastDayContainerEl.append(this.forecastDayListEl);

    this.rootEl.insertAdjacentElement('beforeend', forecastDayContainerEl);
  }

  initEventListeners() {
    this.forecastDayListEl.addEventListener(
      'click',
      this.onForecastDayClick.bind(this)
    );
  }

  updateCurrentWeatherUI({ current, location }) {
    const {
      condition: { text, icon },
      temp_c,
      last_updated_epoch,
    } = current;
    const { name, region, country } = location;

    // Current Weather Data ===================================================
    this.currentTimeEl.textContent = this.datetimeConverter(last_updated_epoch);
    this.currentTempEl.textContent = `${temp_c.toFixed(1)}°C`;
    this.currentIconEl.src = `http:${icon}`;
    this.currentIconEl.alt = text;
    this.currentTextEl.textContent = text;

    // Location Data ==========================================================
    this.locationNameEl.textContent = name;
    this.locationRegionEl.textContent = region;
    this.locationCountryEl.textContent = country;
  }

  updateForecastDayUI({ forecast: { forecastday } }) {
    const forecastMurkup = forecastday
      .map(forecast => {
        const {
          date_epoch,
          day: {
            maxtemp_c,
            mintemp_c,
            condition: { text, icon },
          },
        } = forecast;

        return `<li class="forecast-day__item">
        <p class="forecast-day__date">${this.dateConverter(date_epoch)}</p>
        <div class="forecast-day__temp-wrapper">
          <p class="forecast-day__temp-max">Max: ${maxtemp_c.toFixed(1)}°C</p>
          <p class="forecast-day__temp-min">Min: ${mintemp_c.toFixed(1)}°C</p>
        </div>
        <img
          src="https://${icon}"
          alt="${text}"
          class="forecast-day__icon"
        />
      </li>`;
      })
      .join('');

    this.forecastDayListEl.innerHTML = forecastMurkup;
  }

  startTimer() {
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
    }, 1000);
  }

  async getForecast() {
    const forecast = await this.fetchCurrentWeather('Kryvyy Rih');

    this.updateCurrentWeatherUI(forecast.data);
    this.updateForecastDayUI(forecast.data);

    // this.updateCurrentWeatherUI(forecast);
    // this.updateForecastDayUI(forecast);
  }

  async fetchCurrentWeather(city) {
    const params = {
      key: '8ddc4d4caf994c91928163714230406',
      q: city,
      days: '3',
      aqi: 'no',
      lang: 'uk',
    };

    try {
      return await this.axiosInstance.get('/forecast.json', { params });
    } catch (err) {
      console.log(err);
    }
  }

  onForecastDayClick(e) {
    console.log(e.target);
  }

  datetimeConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return dateFormat(now, 'dd.mm.yyyy HH:MM');
  }

  dateConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return dateFormat(now, 'dd.mm.yyyy ddd');
  }
}
