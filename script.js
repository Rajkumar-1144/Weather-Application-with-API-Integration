// Replace with your OpenWeatherMap API key
const API_KEY = 'YOUR_OPENWEATHERMAP_KEY';

const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const locBtn = document.getElementById('locBtn');
const unitsSel = document.getElementById('units');

const resultEl = document.getElementById('result');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

const locationEl = document.getElementById('location');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const iconEl = document.getElementById('icon');
const feelsEl = document.getElementById('feels');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

function showLoading(show = true){
  loadingEl.classList.toggle('hidden', !show);
}

function showError(message){
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  resultEl.classList.add('hidden');
  loadingEl.classList.add('hidden');
}

function clearError(){
  errorEl.classList.add('hidden');
  errorEl.textContent = '';
}

async function fetchWeatherByCity(city, units='metric'){
  clearError();
  showLoading(true);
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${API_KEY}`;
    const res = await fetch(url);
    if(!res.ok){
      if(res.status === 404) throw new Error('City not found.');
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    renderWeather(data, units);
  }catch(err){
    showError(err.message);
  }finally{
    showLoading(false);
  }
}

async function fetchWeatherByCoords(lat, lon, units='metric'){
  clearError();
  showLoading(true);
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Unable to fetch weather.');
    const data = await res.json();
    renderWeather(data, units);
  }catch(err){
    showError(err.message);
  }finally{
    showLoading(false);
  }
}

function renderWeather(data, units='metric'){
  const city = data.name || '';
  const country = data.sys?.country || '';
  const temp = Math.round(data.main?.temp ?? NaN);
  const description = data.weather?.[0]?.description || '';
  const iconCode = data.weather?.[0]?.icon || '';
  const feels = Math.round(data.main?.feels_like ?? NaN);
  const humidity = data.main?.humidity ?? '';
  const wind = data.wind?.speed ?? '';

  locationEl.textContent = `${city}${country ? ', ' + country : ''}`;
  tempEl.textContent = `${temp}${units === 'metric' ? '°C' : '°F'}`;
  descEl.textContent = description;
  feelsEl.textContent = `${feels}${units === 'metric' ? '°C' : '°F'}`;
  humidityEl.textContent = humidity;
  windEl.textContent = wind;

  if(iconCode){
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  resultEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if(!city){
    showError('Please enter a city name.');
    return;
  }
  fetchWeatherByCity(city, unitsSel.value);
});

locBtn.addEventListener('click', () => {
  clearError();
  if(!navigator.geolocation){
    showError('Geolocation not supported.');
    return;
  }
  showLoading(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, unitsSel.value),
    () => showError('Unable to get location.')
  );
});
