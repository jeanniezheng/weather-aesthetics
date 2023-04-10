import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  // Set the API key for OpenWeatherMap using an environment variable
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  // Set the initial state for the weather data, location, city, background image, and forecast
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [city, setCity] = useState("Today's Weather");
  const [backgroundImage, setBackgroundImage] = useState('../assets/choose.gif');
  const [forecast, setForecast] = useState({});

  // Get the current time and log it to the console
  const currTime = new Date().toLocaleTimeString();
  console.log("new date" + new Date());

  // This function fetches weather data from the OpenWeatherMap API and sets the state for the city, location, background image, and data
  const inputLocation = async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Construct the URL for the API call using the location and API key
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    try {
      // Call the API and get the response
      const response = await fetch(url);

      // If the response is not OK (i.e., an error occurred), throw an error
      if (!response.ok) {
        throw new Error("City not found");
      }

      // Parse the response as JSON and set the state for the weather data
      const results = await response.json();
      setData(results);

      // Set the state for the city and background image based on the weather data
      setCity(location.toUpperCase());
      setBackgroundImage(
        `../assets/${results.weather[0].icon === "50d"
          ? "50d"
          : results.weather[0].main
        }.gif`
      );

      // Reset the state for the location and blur the input field
      setLocation("");
      event.target.city.blur();

      // Fetch the 5-day weather forecast for the given location and API key
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${results.coord.lat}&lon=${results.coord.lon}&appid=${apiKey}`
      );

      // If the forecast response is not OK, throw an error
      if (!forecastResponse.ok) {
        throw new Error("Error fetching forecast data");
      }

      // Parse the forecast response as JSON and set the state for the forecast data
      const forecastResults = await forecastResponse.json();
      setForecast(forecastResults.list);
    } catch (error) {
      // Log any errors to the console and set the state accordingly
      console.error(error.message);
      let randomGif = Math.floor(Math.random() * 3) + 1;
      setData({});
      setLocation("");
      setForecast({})
      setCity("LOCATION NOT FOUND!");
      setBackgroundImage(`../assets/Error${randomGif}.gif`);
      event.target.city.blur();
    }
  };

  // Handle changes to the location input field
  const handleChange = (e) => {
    setLocation(e.target.value);
  };

  // Convert a temperature from Kelvin to Fahrenheit
  const convertToFahrenheit = (k) => {
    let fahrenheit = Math.floor((k - 273.15) * 1.8 + 32);
    return fahrenheit;
  };

  //convert Unix Time to weekday 
  let convertUnixTimestamp = (unixTimestamp) => {
    // const unixTimestamp = 1680048000;
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Note: months are 0-indexed, so add 1
    const day = date.getDate();
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });
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

  //Function is to get highs and lows forecast of the week 
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
        } else if (temp < temp_min) {
          temp_min = temp
        }
      }
      else {
        minMaxStorage[currentDateTime] = [convertToFahrenheit(temp_min), convertToFahrenheit(temp_max),];
        temp_min = forecast[i]?.main?.temp ?? 0;
        temp_max = forecast[i]?.main?.temp ?? 0;
        count = 1;
        currentDateTime = convertUnixTimestamp(unix);
      }
    }
    //final min max values are outside the for loop to avoid any missing data
    // minMaxStorage[currentDateTime] = [convertToFahrenheit(temp), convertToFahrenheit(temp),];
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
            {/* {data.main && <h1>(convertToFahrenheit(data.main.temp))</h1>} */}
            {data.main && <h1>{(convertToFahrenheit(data.main.temp))}&deg;</h1>}

            <h2>{data.main && data.weather[0].description}</h2>
          </div>
        </div>
        {/*  Object.entries is used to convert the object returned from generateForecastWeather into an array of key-value pairs. The map function is then used to loop over each item in the array and render a div with the date, minimum temperature, and maximum temperature for each item. The key prop is set to the date to help React efficiently update the component when necessary. */}

        {/* create a component for each day, each click on the card will change the background and card information */}
        <div className='forecast-container'>
          {Object.entries(generateForecastWeather(forecast)).map(([date, [min, max]]) => (
            <div className='forecast' key={date}>
              <p>{date}</p>
              <p>{min}&deg;F</p>
              <p>{max}&deg;F</p>
            </div>
          ))}
        </div>

      </div>

    </div >
  );
}

export default App;
