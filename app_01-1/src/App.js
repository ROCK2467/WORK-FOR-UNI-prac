import React, {useCallback, useEffect, useRef, useState} from 'react';
import { Helmet } from 'react-helmet';
import './App.css';

const App = () => {
let currentFocus = -1;
const [currentCity, setCurrentCity] = useState('');
const [currentUnit, setCurrentUnit] = useState('c');
const [hourlyorWeek, setHourlyorWeek] = useState('hourly');
const [uvIndex, setUvIndex] = useState(0)
const [sunSet, setSunSet] = useState(0)
const [temp, setTemp] = useState(0)
const [date, setDate] = useState("Monday, 00:00")
const [condition, setCondition] = useState("condition")
const [rain, setRain] = useState("Precip - 0%")
const [mainIcon, setMainIcon] = useState("https://i.ibb.co/tH9ydZF/free-icon-sun-8016952.png")
const [currentLocation, setCurrentLocation] = useState("location")
const [uvText, setUvText] = useState("No data")
const [windSpeed, setWindSpeed] = useState(0)
const [sunRise, setSunRise] = useState(0)
const [humidity, setHumidity] = useState(0)
const [visibilty, setVisibilty] = useState(0)
const [humidityStatus, setHumidityStatus] = useState("No data")
const [airQuality, setAirQuality] = useState(0)
const [airQualityStatus, setAirQualityStatus] = useState("No data")
const [visibilityStatus, setVisibilityStatus] = useState("No data")
const [celsiusBtnClass, setCelsiusBtnClass] = useState('active')
const [fahrenheitBtnClass, setFahrenheitBtnClass] = useState('')
const [tempUnit, setTempUnit] = useState('°C')
const [hourlyBtnClass, setHourlyBtnClass] = useState('active')
const [weekBtnClass, setWeekBtnClass] = useState('')
const [search, setSearch] = useState()
const weatherCardsRef = useRef()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDate(getDateTime());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    getPublicIp();
  }, []);

    function getDateTime() {
      let now = new Date(),
        hour = now.getHours(),
        minute = now.getMinutes();

      let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      hour = hour % 12;
      if (hour < 10) {
        hour = "0" + hour;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      let dayString = days[now.getDay()];
      return `${dayString}, ${hour}:${minute}`;
    }

    const getPublicIp = () => {
      fetch("https://geolocation-db.com/json/", {
        method: "GET",
        headers: {},
      })
          .then((response) => response.json())
          .then((data) => {
            setCurrentCity(data.city);
            getWeatherData(data.city, currentUnit, hourlyorWeek);
          })
          .catch((err) => {
            console.error(err);
          });
    }

  function getWeatherData(city, unit, hourlyorWeek) {
    fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=9VVDRE8AGGXLYQTNY6U7T2GG3&contentType=json`,
      {
        method: "GET",
        headers: {},
      }
    )
      .then((response) => response.json())
      .then((data) => {
        let today = data.currentConditions;
        if (unit === "c") {
          setTemp(today.temp);
        } else {
          setTemp(celciusToFahrenheit(today.temp));
        }
        setCurrentLocation(data.resolvedAddress);
        setCondition(today.conditions);
        setRain("Precip - " + today.precip + "%");
        setUvIndex(today.uvindex);
        setWindSpeed(today.windspeed);
        measureUvIndex(today.uvindex);
        setMainIcon(getIcon(today.icon));
        changeBackground(today.icon);
        setHumidity(today.humidity + "%");
        updateHumidityStatus(today.humidity);
        setVisibilty(today.visibility);
        updateVisibiltyStatus(today.visibility);
        setAirQuality(today.winddir);
        updateAirQualityStatus(today.winddir);
        if (hourlyorWeek === "hourly") {
          updateForecast(data.days[0].hours, unit, "day");
        } else {
          updateForecast(data.days, unit, "week");
        }
        setSunRise(covertTimeTo12HourFormat(today.sunrise));
        setSunSet(covertTimeTo12HourFormat(today.sunset));
      })
      .catch((err) => {
        alert("City not found");
      });
  }

function updateForecast(data, unit, type) {
  weatherCardsRef.current.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
  weatherCardsRef.current.appendChild(card);
    day++;
  }
}

function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/G7wj9YY/free-icon-clouds-and-sun-7587422.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/8dBgTCD/free-icon-good-weather-4238685.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/T8Hkk5G/free-icon-weather-4829032.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/tH9ydZF/free-icon-sun-8016952.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/cQ5ynfy/free-icon-moons-4129208.png";
  } else if (condition === "cloudy") {
    return "https://i.ibb.co/C25hGn0/free-icon-cloud-880579.png";
  } else if (condition === "snow") {
    return "https://i.ibb.co/98KsdVT/free-icon-snowflake-2529995.png";
  } else if (condition === "fog") {
    return "https://i.ibb.co/kS8DyDT/free-icon-mist-175872.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/SfBX9r7/file.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/SfBX9r7/file.webp";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/SfBX9r7/file.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/SfBX9r7/file.webp";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/SfBX9r7/file.webp";
  } else {
    bg = "https://i.ibb.co/SfBX9r7/file.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}


function getHour(time) {
  return time.split(":").slice(0, 2).join(":");
}


function covertTimeTo12HourFormat(time) {
  return time.split(":").slice(0, 2).join(":");
}

function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    setUvText("Low");
  } else if (uvIndex <= 5) {
    setUvText("Medium");
  } else if (uvIndex <= 7) {
    setUvText("High");
  } else if (uvIndex <= 10) {
    setUvText("Very High");
  } else {
    setUvText("Extreme");
  }
}

function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    setHumidityStatus("Low");
  } else if (humidity <= 60) {
    setHumidityStatus("Medium");
  } else {
    setHumidityStatus("High");
  }
}

function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    setVisibilityStatus("Dense Fog");
  } else if (visibility <= 0.16) {
    setVisibilityStatus("Moderate Fog");
  } else if (visibility <= 0.35) {
    setVisibilityStatus("Light Fog");
  } else if (visibility <= 1.13) {
    setVisibilityStatus("Very Light Fog");
  } else if (visibility <= 2.16) {
    setVisibilityStatus("Light Mist");
  } else if (visibility <= 5.4) {
    setVisibilityStatus("Very Light Mist");
  } else if (visibility <= 10.8) {
    setVisibilityStatus("Clear Air");
  } else {
    setVisibilityStatus("Very Clear Air");
  }
}
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    setAirQualityStatus("Good");
  } else if (airquality <= 100) {
    setAirQualityStatus("Moderate");
  } else if (airquality <= 150) {
    setAirQualityStatus("Unhealthy for Sensitive Groups");
  } else if (airquality <= 200) {
    setAirQualityStatus("Unhealthy");
  } else if (airquality <= 250) {
    setAirQualityStatus("Very Unhealthy");
  } else {
    setAirQualityStatus("Danger");
  }
}


function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}

function addActive(x) {
  if (!x) return false;
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

function changeUnit(unit) {
  if (currentUnit !== unit) {
    setCurrentUnit(unit);
    setTempUnit(`°${unit.toUpperCase()}`);
    if (unit === "c") {
      setCelsiusBtnClass('active');
      setFahrenheitBtnClass('');
    } else {
      setFahrenheitBtnClass('active');
      setCelsiusBtnClass('');
    }
    getWeatherData(currentCity, unit, hourlyorWeek);
  }
}


function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    setHourlyorWeek(unit);
    if (unit === "hourly") {
      setHourlyBtnClass('active');
      setWeekBtnClass('');
    } else {
      setHourlyBtnClass('');
      setWeekBtnClass('active');
    }
    getWeatherData(currentCity, currentUnit, unit);
  }
}

// test if => unit === "c"
  return (
      <div>
        <Helmet>
          <title>Weather App</title>
          <script
            src="https://kit.fontawesome.com/64d58efce2.js"
            crossOrigin="anonymous"
          />
        </Helmet>

        <div className="wrapper">
          <div className="sidebar">
            <div>
              <form className="search" id="search" onKeyDown={(e) => {
                var x = document.getElementById("suggestions");
                if (x) x = x.getElementsByTagName("li");
                if (e.keyCode === 40) {
                  currentFocus++;
                  addActive(x);
                } else if (e.keyCode === 38) {
                  currentFocus--;
                  addActive(x);
                }
                if (e.keyCode === 13) {
                  e.preventDefault();
                  if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                  }
                }
              }} onSubmit={(e) => {
                e.preventDefault();
                const location = search;
                if (location) {
                  setCurrentCity(location);
                  getWeatherData(location, currentUnit, hourlyorWeek);
                }
              }}>
                <input type="text" id="query" placeholder="Search" value={search} onChange={(e) => {setSearch(e.target.value)}} />
                <button>
                  <i className="fas fa-search"></i>
                </button>
              </form>
              <div className="weather-icon">
                <img
                  id="icon"
                  src={mainIcon}
                  alt=""
                />
              </div>
              <div className="temperature">
                <h1>{temp}</h1>
                <span className="temp-unit" >{tempUnit}</span>
              </div>
              <div className="date-time">
                <p>{date}</p>
              </div>
              <div className="divider"></div>
              <div className="condition-rain">
                <div className="condition">
                  <i className="fas fa-cloud"></i>
                  <p>{condition}</p>
                </div>
                <div className="rain">
                  <i className="fas fa-tint"></i>
                  <p>{rain}</p>
                </div>
              </div>
            </div>
            <div className="location">
              <div className="location-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="location-text">
                <p>{currentLocation}</p>
              </div>
            </div>
          </div>

          <div className="main">
            <nav>
              <ul className="options">
                <button className={"hourly " + hourlyBtnClass}  onClick={() => {
                  changeTimeSpan("hourly");
                }}>Hourly</button>
                <button className={"week " + weekBtnClass} onClick={() => {
                  changeTimeSpan("week");
                }}>Week</button>
              </ul>
              <ul className="options units">
                <button className={"celcius " + celsiusBtnClass} onClick={() => {
                  changeUnit("c");
                }}>°C</button>
                <button className={"fahrenheit " + fahrenheitBtnClass} onClick={() => {
                  changeUnit("f");
                }}>°F</button>
              </ul>
            </nav>

            <div className="cards" id="weather-cards" ref={weatherCardsRef}></div>

            <div className="highlights">
            <h2 className="heading">More info</h2>
            <div className="cards">
              <div className="card2">
                <h4 className="card-heading">UV Index</h4>
                <div className="content">
                  <p className="uv-index">{uvIndex}</p>
                  <p className="uv-text" >{uvText}</p>
                </div>
              </div>
              <div className="card2">
                <h4 className="card-heading">Wind Speed</h4>
                <div className="content">
                  <p className="wind-speed">{windSpeed}</p>
                  <p>km/h</p>
                </div>
              </div>
              <div className="card2">
                <h4 className="card-heading">Sun rise & set</h4>
                <div className="content">
                  <p className="sun-rise">{sunRise}</p>
                  <p className="sun-set">{sunSet}</p>
                </div>
              </div>
              <div className="card2">
                <h4 className="card-heading">Humidity</h4>
                <div className="content">
                  <p className="humidity">{humidity}</p>
                  <p className="humidity-status">{humidityStatus}</p>
                </div>
              </div>
              <div className="card2">
                <h4 className="card-heading">Visibility</h4>
                <div className="content">
                  <p className="visibilty">{visibilty}</p>
                  <p className="visibilty-status">{visibilityStatus}</p>
                </div>
              </div>
              <div className="card2">
                <h4 className="card-heading">Air Quality</h4>
                <div className="content">
                  <p className="air-quality">{airQuality}</p>
                  <p className="air-quality-status">{airQualityStatus}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="credits">
            Created by @Guardiansnow :Telegram aka ROCK_Iknow
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;