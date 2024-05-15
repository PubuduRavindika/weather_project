let weather_cache = {};

// function to get city codes from json file
function getCityCode(callback) {

  let cities = null;

  fetch("http://localhost/weather_project/backend/index.php")//change this with yor server address
    .then((response) => response.json())
    .then((data) => {
      cities = data.List;
      let city_codes = cities.map((city, index) => {
        return city.CityCode;
      });
      callback(city_codes);
      // return city_codes;
    }); 
  // return null;
}

// function to get weather data from api
function getWeatherData(cityCodes) {

  const apiKey = "7d51b8e551c4711d9f56d8f910d4bca1"; //change with your api key
  const apiUrl = `http://api.openweathermap.org/data/2.5/group?id=${cityCodes.join(",")}&units=metric&appid=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Store data in cache with current timestamp
      weather_cache = { data: data.list, timestamp: new Date().getTime() };
      return data.list;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      return [];
    });
}


//check if cache is valid
function isCacheValid() {
  const cacheTimestamp = weather_cache.timestamp;
  const currentTime = new Date().getTime();

  return (currentTime - cacheTimestamp) / (1000 * 60) < 5;
}



// function to retrieve weather data from cache or api
function retrieveWeatherData(city_codes) {
  if (isCacheValid()) {
    return Promise.resolve(weather_cache.data);
  } else {
    return getWeatherData(city_codes);
  }
}


// Function to update HTML with weather data
function updateWeatherUI(weatherData) {

  const col = document.querySelector(".col");

  //update colors of weather cards
  const backgroundColors = ["#388ee7", "#6249cc", "#40b681", "#de944e", "#9c3a3a"];
  let colorIndex = 0;

  //update image with weather description
  const weatherImages = {
    "mist": "05.png",
    "clear sky": "02.png",
    "few clouds": "01.png",
    "light rain": "03.png",
    "broken clouds": "04.png",
    "overcast clouds": "01.png",
    "heavy intensity rain": "03.png",
    "scattered clouds": "04.png",
  };


  // Create a new div for each city
  weatherData.forEach((city) => {
    const weatherDiv = document.createElement("div");
    weatherDiv.classList.add("weather");

    // if clicked, show detail page with weather data for the clicked city
    weatherDiv.addEventListener("click", () => {
      // Check if weather data for the clicked city is in cache
      retrieveWeatherData([city.id])
        .then((weatherData) => {
          updateDetailPageUI(weatherData);
          window.location.href = `details.html?id=${city.id}`;
        })
        .catch((error) => {
          console.error("Error retrieving weather data:", error);
        });
    });
    
    // update body of container with weather data
    weatherDiv.innerHTML = `
      <div class="top" style="background-color: ${backgroundColors[colorIndex % backgroundColors.length]};">

        <div class="city-div">

          <h3>${city.name}, ${city.sys.country}</h3>

          <span style="font-size: 13px;">${new Date(
            city.dt * 1000
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}, ${new Date(city.dt * 1000).toDateString().slice(4)}</span>

          <div class="cloud-img">
            <img style="width: 30px;" src="./images/status/${weatherImages[city.weather[0].description]}" alt="">
            <p>${city.weather[0].description}</p>
          </div>

        </div>

        <div class="temp-div">
          <h1>${city.main.temp}°C</h1>
          <p>Temp Min: ${city.main.temp_min}°C</p>
          <p>Temp Max: ${city.main.temp_max}°C</p>
        </div>

      </div>

      <div class="bottom">

        <div class="details-div">
          <p>Pressure: ${city.main.pressure}hPa</p>
          <p>Humidity: ${city.main.humidity}%</p>
          <p>Visibility: ${city.visibility / 1000}km</p>
        </div>

        <div class="details-middle-div">
          <img style="width: 20px;" src="./images/navigation.png" alt="">
          <p>${city.wind.speed}m/s ${city.wind.deg}°</p>
        </div>

        <div class="details-div">

          <p>Sunrise: ${new Date(city.sys.sunrise * 1000).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}</p>
          
          <p>Sunset: ${new Date(city.sys.sunset * 1000).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}</p>

        </div>
      </div>
    `;
    colorIndex++;
    col && col.appendChild(weatherDiv);
  });
}

// Function to update detail page HTML with weather data
function updateDetailPageUI(weatherData) {

  const searchParams = new URLSearchParams(window.location.search);
  const cityId = searchParams.get("id");
  const colDev = document.querySelector(".col-det");

  const weatherImages = {
    "mist": "05.png",
    "clear sky": "02.png",
    "few clouds": "01.png",
    "light rain": "03.png",
    "broken clouds": "04.png",
    "overcast clouds": "01.png",
    "heavy intensity rain": "03.png",
    "scattered clouds": "04.png",
  };

  weatherData.forEach((city) => {
    if (city.id == cityId) {
      const detailDiv = document.createElement("div");
      detailDiv.classList.add("weather");

      detailDiv.innerHTML = `
      <div class="top">
        <img class="back" src="./images/back.png" alt="" onclick="goToIndex()">

        <div class="city-div">

          <h3>${city.name}, ${city.sys.country}</h3>

          <span style="font-size: 13px;">${new Date(
            city.dt * 1000
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}, ${new Date(city.dt * 1000).toDateString().slice(4)}</span>

  
        </div>

        <div class="temp-div">

          <div class="cloud-img">
            <img style="width: 30px;" src="./images/status/${weatherImages[city.weather[0].description]}" alt="">
            <p>${city.weather[0].description}</p>
          </div>

          <div class="cloud-temp">
            <h1>${city.main.temp}°C</h1>
            <p>Temp Min: ${city.main.temp_min}°C</p>
            <p>Temp Max: ${city.main.temp_max}°C</p>
          </div>

        </div>

      </div>

      <div class="bottom">
        <div class="details-div">
          <p>Pressure: ${city.main.pressure}hPa</p>
          <p>Humidity: ${city.main.humidity}%</p>
          <p>Visibility: ${city.visibility / 1000}km</p>
        </div>
        <div class="details-middle-div">
          <img style="width: 20px;" src="./images/navigation.png" alt="">
          <p>${city.wind.speed}m/s ${city.wind.deg}°</p>
        </div>
        <div class="details-div">
          <p>Sunrise: ${new Date(city.sys.sunrise * 1000).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}</p>
          <p>Sunset: ${new Date(city.sys.sunset * 1000).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}</p>
        </div>
      </div>
    `;

      colDev && colDev.appendChild(detailDiv);
    }
  });
}


// Function to go back to index page
function goToIndex() {
  window.location.href = 'index.html';
}

// callback function to get city codes and weather data
getCityCode((city_codes) =>
  getWeatherData(city_codes).then((weatherData) => {
    updateWeatherUI(weatherData);
  })
);

// Retrieve weather data from cache or API
getCityCode((city_codes) =>
  retrieveWeatherData(city_codes).then((weatherData) => {
    updateDetailPageUI(weatherData);
  })
);
