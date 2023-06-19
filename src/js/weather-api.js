import axios from 'axios';

export default class weatherAPI {
  #API_KEY = '8ddc4d4caf994c91928163714230406';
  #axiosInstance = axios.create({
    baseURL: 'https://api.weatherapi.com/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async fetchCurrentWeather(city) {
    const params = {
      key: this.#API_KEY,
      q: city,
      days: 5,
      aqi: 'no',
      lang: 'uk',
    };

    try {
      return await this.#axiosInstance.get('/forecast.json', { params });
    } catch (err) {
      console.log(err);
    }
  }
}
