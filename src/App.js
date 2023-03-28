import React, { useState, useEffect } from 'react';
import './index.css'
// import gif from './assets/cloudy2.gif';

function App() {
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  const [data, setData] = useState({})
  const [location, setLocation] = useState('')
  const [city, setCity] = useState("Today's Weather")
  const [backgroundImage, setBackgroundImage] = useState('../assets/choose.gif')
  const [forecast, setForecast] = useState({})
  // const currDate = new Date().toLocaleDateString();
  const currTime = new Date().toLocaleTimeString();
  console.log("new date" + new Date())
  //Tue Mar 28 2023 17:20:32 

  //create state for an array of an array 


  useEffect(() => {
    console.log(forecast);
  }, [forecast]);

  const inputLocation = async (event) => {
    event.preventDefault();
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("City not found");
      }
      // console.log(response);
      const results = await response.json();
      setData(results);
      setCity(location.toUpperCase());
      setBackgroundImage(
        `../assets/${results.weather[0].icon === "50d"
          ? "50d"
          : results.weather[0].main
        }.gif`
      );
      setLocation("");
      event.target.city.blur();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${results.coord.lat}&lon=${results.coord.lon}&appid=8c0b474f6453fd3a3342808b8c1166c5`
      );
      if (!forecastResponse.ok) {
        throw new Error("Error fetching forecast data");
      }
      const forecastResults = await forecastResponse.json();
      // console.log(forecastResults);
      setForecast(forecastResults.list);
    } catch (error) {
      console.error(error.message);
      let randomGif = Math.floor(Math.random() * 3) + 1;
      setData({});
      setLocation("");
      setCity("LOCATION NOT FOUND!");
      setBackgroundImage(`../assets/Error${randomGif}.gif`);
      event.target.city.blur();
    }
    // console.log(data);
  };

  let handleChange = (e) => {
    setLocation(e.target.value)
  }

  let convertToFahrenheit = (k) => {
    let fahrenheit = Math.floor((k - 273.15) * 1.8 + 32);
    return <h1> {fahrenheit}&deg;</h1>
  }

  let convertToFahrenheitt = (k) => {
    let fahrenheit = Math.floor((k - 273.15) * 1.8 + 32);
    return fahrenheit
  }

  let convertUnixTimestamp = (unixTimestamp) => {
    // const unixTimestamp = 1680048000;
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Note: months are 0-indexed, so add 1
    const day = date.getDate();
    const weekday = date.toLocaleString('en-US', { weekday: 'long' });
    // console.log(`${year}-${month}-${day}`);
    // return `${year}-${month}-${day}`
    return weekday
  }
  // console.log(convertUnixTimestamp(forecast[0]))
  let unix = forecast && forecast.length > 0 ? forecast[0].dt : console.log('Date time not available')

  let consoleTimeStamp = (forecast) => {
    for (let i = 0; i < forecast.length; i++) {
      console.log(convertUnixTimestamp(forecast[i].dt))
      console.log(forecast[i].dt)
    }
  }
  // console.log(consoleTimeStamp(forecast))

  const generateForecastWeather = (forecast) => {
    let minMaxStorage = {};
    let currentDateTime = convertUnixTimestamp(forecast[0]?.dt);
    let temp_min = forecast[0]?.main?.temp ?? 0;
    let temp_max = forecast[0]?.main?.temp ?? 0;
    let count = 1;

    for (let i = 1; i < forecast.length; i++) {
      let unix = forecast[i]?.dt ?? console.log('Date time not available');
      if (convertUnixTimestamp(unix) === currentDateTime) {
        let temp = forecast[i]?.main?.temp
        if (temp > temp_max) {
          temp_max = temp
        } else {
          temp_min = temp
        }
      }
      else {
        minMaxStorage[currentDateTime] = [convertToFahrenheitt(temp_min), convertToFahrenheitt(temp_max),];
        temp_min = forecast[i]?.main?.temp ?? 0;
        temp_max = forecast[i]?.main?.temp ?? 0;
        count = 1;
        currentDateTime = convertUnixTimestamp(unix);
      }
    }
    //final min max values are outside the for loop to avoid any missing data
    // minMaxStorage[currentDateTime] = [convertToFahrenheitt(temp), convertToFahrenheitt(temp),];
    return minMaxStorage;
  };

  console.log(generateForecastWeather(forecast))


  return (
    <div className="container"
      style={{
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <div className='weather-information'>
        <div className='search'>
          <form
            onSubmit={inputLocation}
            autoComplete='off'>
            <input
              type='text'
              onChange={handleChange}
              value={location}
              placeholder='enter location'
              name='city' />
            <input
              className='submit-button'
              type='submit'
            />
          </form>
        </div>

        <div className='main-info'>
          <h1>{city} | {currTime}</h1>
          <div className='temp'>
            {data.main && (convertToFahrenheit(data.main.temp))}
            { }
            <h2>{data.main && data.weather[0].description}</h2>
          </div>
        </div>
        {/*  Object.entries is used to convert the object returned from generateForecastWeather into an array of key-value pairs. The map function is then used to loop over each item in the array and render a div with the date, minimum temperature, and maximum temperature for each item. The key prop is set to the date to help React efficiently update the component when necessary. */}

        <div>
          {Object.entries(generateForecastWeather(forecast)).map(([date, [min, max]]) => (
            <div key={date}>
              <p>{date}</p>
              {/* <p>Min: {min}&deg;F</p>
              <p>Max: {max}&deg;F</p> */}
            </div>
          ))}
        </div>

      </div>

    </div >
  );
}

export default App;
