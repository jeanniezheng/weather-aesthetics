import React, { useState, useEffect } from 'react';
import './index.css'
// import gif from './assets/cloudy2.gif';

function App() {
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  const [data, setData] = useState({})
  const [location, setLocation] = useState('')
  const [city, setCity] = useState("Today's Weather")
  const [backgroundImage, setBackgroundImage] = useState('../assets/choose.gif')
  // const currDate = new Date().toLocaleDateString();
  const currTime = new Date().toLocaleTimeString();



  const inputLocation = (event) => {
    event.preventDefault();
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("City not found");
        }
        console.log(response);
        return response.json();
      })
      .then((results) => {
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
        console.log('LAT' + results.coord.lat)
        console.log('LONG' + results.coord.lon)
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${results.coord.lat}&lon=${results.coord.lon}&appid=8c0b474f6453fd3a3342808b8c1166c5`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error fetching forecast data");
            }
            console.log(response.json());
            return response.json();
          })
          .catch((error) => {
            console.error(error.message);

          });
      })
      .catch((error) => {
        console.error(error.message);
        let randomGif = Math.floor(Math.random() * 3) + 1;
        setData({});
        setLocation("");
        setCity("LOCATION NOT FOUND!");
        setBackgroundImage(`../assets/Error${randomGif}.gif`);
        event.target.city.blur();
      });
    console.log(data);
  };


  let handleChange = (e) => {
    setLocation(e.target.value)
  }

  let convertToFahrenheit = (k) => {
    let fahrenheit = Math.floor((k - 273.15) * 1.8 + 32);
    return <h1> {fahrenheit} &deg;</h1>
  }

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
            <h2>{data.main && data.weather[0].description}</h2>
          </div>
        </div>
      </div>

    </div >
  );
}

export default App;
