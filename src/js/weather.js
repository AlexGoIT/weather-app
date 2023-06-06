import axios from 'axios';
import dateFormat, { masks } from 'dateformat';
import forecast from '../json/forecast.json';

export class Weather {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.weatherapi.com/v1',
      headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
      },
    });

    this.rootEl = document.getElementById('root');
    // this.containerEl = document.createElement('div');
    // this.containerEl.classList.add('container');

    // this.rootEl.append(this.containerEl);

    this.createCurrentWeather();
    this.createForecastDay();
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
    // this.forecasteDayDateEl = document.createElement('p');
    // this.forecasteDayDateEl.classList.add('forecast-day-date');

    // this.forecasteDayTempMinEl = document.createElement('p');
    // this.forecasteDayTempMinEl.classList.add('forecast-day-temp-min');

    // this.forecasteDayTempMaxEl = document.createElement('p');
    // this.forecasteDayTempMaxEl.classList.add('forecast-day-temp-max');

    // this.forecastDayIconEl = document.createElement('img');
    // this.forecastDayIconEl.classList.add('forecast-day-icon');

    // const forecastDayTempWrapperEl = document.createElement('div');
    // forecastDayTempWrapperEl.classList.add('forecast-day-temp-wrapper');
    // forecastDayTempWrapperEl.append(
    //   this.forecasteDayTempMaxEl,
    //   this.forecasteDayTempMinEl
    // );

    // const forecastDayWrapperEl = document.createElement('div');
    // forecastDayWrapperEl.classList.add('forecast-wrapper');
    // forecastDayWrapperEl.append(
    //   this.forecasteDayDateEl,
    //   forecastDayTempWrapperEl,
    //   this.forecastDayIconEl
    // );

    this.forecastDayListEl = document.createElement('ul');
    this.forecastDayListEl.classList.add('forecast-day__list');

    const forecastDayContainerEl = document.createElement('div');
    forecastDayContainerEl.classList.add('container');
    forecastDayContainerEl.append(this.forecastDayListEl);

    this.rootEl.insertAdjacentElement('beforeend', forecastDayContainerEl);
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
    this.currentTempEl.textContent = `${temp_c}°C`;
    this.currentIconEl.src = `http:${icon}`;
    this.currentIconEl.alt = text;
    this.currentTextEl.textContent = text;

    // Location Data ==========================================================
    this.locationNameEl.textContent = name;
    this.locationRegionEl.textContent = region;
    this.locationCountryEl.textContent = country;
  }

  updateForecastDayUI({ forecast: { forecastday } }) {
    // this.forecasteDayDateEl.textContent = this.dateConverter(
    //   forecastday[0].date_epoch
    // );
    // this.forecasteDayTempMinEl.textContent = `${forecastday[0].day.mintemp_c}°C`;
    // this.forecasteDayTempMaxEl.textContent = `${forecastday[0].day.maxtemp_c}°C`;
    // this.forecastDayIconEl.src = `https://${forecastday[0].day.condition.icon}`;
    // this.forecastDayIconEl.alt = forecastday[0].day.condition.text;

    console.dir(forecastday);

    const forecastMurkup = forecastday
      .map(forecast => {
        return `<li class="forecast-day__item">
        <p class="forecast-day__date">${this.dateConverter(
          forecast.date_epoch
        )}</p>
        <div class="forecast-day__temp-wrapper">
          <p class="forecast-day__temp-max">Max: ${forecast.day.maxtemp_c}°C</p>
          <p class="forecast-day__temp-min">Min: ${forecast.day.mintemp_c}°C</p>
        </div>
        <img
          src="https://${forecast.day.condition.icon}"
          alt="${forecast.day.condition.text}"
          class="forecast-day__icon"
        />
      </li>`;
      })
      .join('');

    console.log(forecastMurkup);

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

  datetimeConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return dateFormat(now, 'dd.mm.yyyy HH:MM');
  }

  dateConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return dateFormat(now, 'dd.mm.yyyy');
  }
}
