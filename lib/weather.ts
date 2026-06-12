export interface WeatherData {
  name: string;
  sys: {
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

export interface ForecastData {
  time: string;
  temp: number;
}

// Map Open-Meteo weather codes to standard names and icons
export function getWeatherStatus(code: number) {
  if (code === 0) return { main: 'Clear', description: 'Clear sky', icon: '01d' }
  if (code >= 1 && code <= 3) return { main: 'Cloudy', description: 'Mainly clear or overcast', icon: '03d' }
  if (code >= 45 && code <= 48) return { main: 'Foggy', description: 'Fog and depositing rime fog', icon: '50d' }
  if (code >= 51 && code <= 67) return { main: 'Rainy', description: 'Rain showers', icon: '10d' }
  if (code >= 71 && code <= 77) return { main: 'Snowy', description: 'Snow fall', icon: '13d' }
  if (code >= 80 && code <= 82) return { main: 'Showers', description: 'Violent rain showers', icon: '09d' }
  if (code >= 95 && code <= 99) return { main: 'Stormy', description: 'Thunderstorm', icon: '11d' }
  return { main: 'Atmosphere', description: 'Unspecified weather', icon: '50d' }
}

export async function fetchWeather(city: string): Promise<{ weather: WeatherData; forecast: ForecastData[] }> {
  try {
    // 1. Geocode city to latitude/longitude using osm nominatim API
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    const geoResponse = await fetch(geoUrl, {
      headers: {
        'User-Agent': 'ZenithDashboardApplet/1.0 (hanifabdurrohim972@gmail.com)'
      }
    })
    
    if (!geoResponse.ok) {
      throw new Error('Geocoding failed')
    }
    
    const geoData = await geoResponse.json()
    if (!geoData || geoData.length === 0) {
      throw new Error(`City "${city}" not found`)
    }
    
    const lat = parseFloat(geoData[0].lat)
    const lon = parseFloat(geoData[0].lon)
    const displayName = geoData[0].display_name.split(',')[0] // Short city name

    // 2. Fetch meteorological data from Open-Meteo (Sunrise, sunset, temp, humidity, wind)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=sunrise,sunset&timezone=auto&hourly=temperature_2m`
    const weatherResponse = await fetch(weatherUrl)
    
    if (!weatherResponse.ok) {
      throw new Error('Weather fetching failed')
    }
    
    const wData = await weatherResponse.json()
    
    const weatherCode = wData.current.weather_code
    const { main, description, icon } = getWeatherStatus(weatherCode)

    // Parse Sunrise & Sunset from ISO Strings to Unix Timestamps
    const sunriseStr = wData.daily?.sunrise?.[0]
    const sunsetStr = wData.daily?.sunset?.[0]
    const sunriseUnix = sunriseStr ? Math.floor(new Date(sunriseStr).getTime() / 1000) : Math.floor(Date.now() / 1000 - 12 * 3600)
    const sunsetUnix = sunsetStr ? Math.floor(new Date(sunsetStr).getTime() / 1000) : Math.floor(Date.now() / 1000 + 12 * 3600)

    const weather: WeatherData = {
      name: displayName,
      sys: {
        sunrise: sunriseUnix,
        sunset: sunsetUnix
      },
      main: {
        temp: wData.current.temperature_2m,
        feels_like: wData.current.apparent_temperature,
        humidity: wData.current.relative_humidity_2m
      },
      wind: {
        speed: wData.current.wind_speed_10m
      },
      weather: [{
        id: weatherCode,
        main,
        description,
        icon
      }]
    }

    // 3. Extract 24H forecast chunks (every 3 hours for the next 18 hours)
    const forecast: ForecastData[] = []
    const nowHour = new Date().getHours()
    for (let i = 0; i < 6; i++) {
      const idx = (nowHour + i * 3) % 24
      const timeLabel = `${String(idx).padStart(2, '0')}:00`
      const tempVal = wData.hourly?.temperature_2m?.[i * 3] || wData.current.temperature_2m
      forecast.push({
        time: timeLabel,
        temp: Math.round(tempVal)
      })
    }

    return { weather, forecast }
  } catch (error) {
    console.error('Error fetching weather:', error)
    // Fallback sample data in case of offline/throttling from OSM
    const dummyWeather: WeatherData = {
      name: city || 'London',
      sys: {
        sunrise: Math.floor(Date.now() / 1000 - 4 * 3600), // ~6 am
        sunset: Math.floor(Date.now() / 1000 + 5 * 3600)   // ~7 pm
      },
      main: {
        temp: 22.4,
        feels_like: 23.1,
        humidity: 64
      },
      wind: {
        speed: 3.2
      },
      weather: [{
        id: 0,
        main: 'Clear',
        description: 'Clear Sky',
        icon: '01d'
      }]
    }
    const dummyForecast: ForecastData[] = [
      { time: '09:00', temp: 18 },
      { time: '12:00', temp: 23 },
      { time: '15:00', temp: 25 },
      { time: '18:00', temp: 21 },
      { time: '21:00', temp: 17 },
      { time: '00:00', temp: 15 }
    ]
    return { weather: dummyWeather, forecast: dummyForecast }
  }
}
