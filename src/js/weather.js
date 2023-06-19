import dateFormat, { i18n } from 'dateformat';
import { dayNames, monthNames } from './lang.js';

import weatherAPI from './weather-api.js';

i18n.dayNames = dayNames;
i18n.monthNames = monthNames;

export class Weather {
  #api = new weatherAPI();

  constructor(selector) {
    this.city = 'Kryvyy Rih';

    this.rootEl = document.querySelector(selector);

    this.createForecastDay();
    this.createCurrentWeather();

    this.initEventListeners();
    this.getForecast();
    this.startTimer();
  }

  initEventListeners() {
    this.forecastDayListEl.addEventListener(
      'click',
      this.showSpoiler.bind(this)
    );
  }

  createCurrentWeather() {
    this.currentContainerEl = document.createElement('div');
    this.currentContainerEl.classList.add('container');
    this.currentContainerEl.classList.add('current');
    this.currentContainerEl.append(this.currentWrapperEl);

    this.rootEl.insertAdjacentElement('afterbegin', this.currentContainerEl);
  }

  createForecastDay() {
    this.forecastDayListEl = document.createElement('ul');
    this.forecastDayListEl.classList.add('forecast-day__list');

    const forecastDayContainerEl = document.createElement('div');
    forecastDayContainerEl.classList.add('container');
    forecastDayContainerEl.classList.add('forecast-day__wrapper');
    forecastDayContainerEl.append(this.forecastDayListEl);

    this.rootEl.insertAdjacentElement('afterbegin', forecastDayContainerEl);
  }

  updateCurrentWeatherUI({ current, location }) {
    const {
      condition: { text, icon },
      temp_c,
      last_updated_epoch,
    } = current;
    const { name, region, country } = location;

    const markup = `
      <div class="current-wrapper">
        <div class="location-wrapper">
          <p class="location-name">${name}</p>
          <p class="location-region">${region}</p>
          <p class="location-country">${country}</p>
        </div>
        <div class="current-descript-wrapper">
          <div class="current-temp-wrapper">
            <p class="current-temp">${temp_c}</p>
            <img class="current-icon" src="${icon}" alt="${text}">
          </div><p class="current-text">${text}</p>
          <p class="current-time">${this.datetimeConverter(
            last_updated_epoch
          )}</p>
        </div>
      </div>
    `;

    this.currentContainerEl.innerHTML = markup;
  }

  updateForecastDayUI({ forecast: { forecastday } }) {
    const forecastMarkup = forecastday
      .map(forecast => {
        const {
          date_epoch,
          day: {
            maxtemp_c,
            mintemp_c,
            condition: { text, icon },
          },
        } = forecast;

        return `<li class="forecast-day__item spoiler">
        <div class="forecast-day__head">
          <div>
            <div class="forecast-day__date-wrapper">
              <p class="forecast-day__date">${
                this.dateConverter(date_epoch).date
              }</p>
              <p class="forecast-day__weekday">${
                this.dateConverter(date_epoch).day
              }</p>
            </div>
            <p class="forecast-day__month">${
              this.dateConverter(date_epoch).month
            }</p>
          </div>
          <div class="forecast-day__temp-wrapper">
            <p class="forecast-day__temp">Max: ${maxtemp_c.toFixed(1)}°C</p>
            <p class="forecast-day__temp">Min: ${mintemp_c.toFixed(1)}°C</p>
          </div>
          <div class="forecast-day__icon-wrapper">
            <img
              src="https://${icon}"
              alt="${text}"
              class="forecast-day__icon"
            />
            <p class="forecast-day__icon-text">${text}</p>
          </div>
        </div>
        <div class="forecast-day__spoiler-content">
          <p class="forecast-day__spoiler-text">${text}</p>
        </div>
      </li>`;
      })
      .join('');

    this.forecastDayListEl.innerHTML = forecastMarkup;
  }

  showSpoiler(e) {
    console.log(e.target.closest('.spoiler'));
    const spoiler = e.target.closest('.spoiler');
    spoiler
      .querySelector('.forecast-day__spoiler-content')
      .classList.toggle('show');
  }

  startTimer() {
    setInterval(() => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // console.log(`${minutes}:${seconds}`, minutes % 15);

      if (minutes % 15 !== 5 || seconds > 0) {
        return;
      }

      console.log('update');
      this.getForecast();
    }, 1000);
  }

  async getForecast() {
    const forecast = await this.#api.fetchCurrentWeather(this.city);

    this.updateCurrentWeatherUI(forecast.data);
    this.updateForecastDayUI(forecast.data);
  }

  datetimeConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return dateFormat(now, 'dd.mm.yyyy HH:MM');
  }

  dateConverter(timestamp) {
    const now = new Date(timestamp * 1000);

    return {
      date: dateFormat(now, 'dd'),
      month: dateFormat(now, 'mmm'),
      day: dateFormat(now, 'ddd'),
    };
  }
}
