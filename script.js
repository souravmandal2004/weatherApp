// Fetching all the elements

const userTab = document.querySelector ("[data-userWeather]");
const searchTab = document.querySelector ("[data-searchWeather]"); 
const userContainer = document.querySelector (".weather-container");
const grantAccessContainer = document.querySelector (".grant-location-container");
const searchForm = document.querySelector ("[data-searchForm]");
const loadingScreen = document.querySelector (".loading-container");
const userInfoContainer = document.querySelector (".user-info-container");

// Initially needed variables
const apiKey = 'f1125da2c0b3d492a87e3fc865e95408';
let currentTab = userTab;
currentTab.classList.add ("current-tab");

getFromSessionStorage ();

function switchTab (clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove ("current-tab"); 
        currentTab = clickedTab;
        currentTab.classList.add ("current-tab");


        if (!searchForm.classList.contains("active")) {

            // if searchForm wala container is invisible, if yes then make is visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add ("active");
        }
        else {
            // main phle searchTab me tha aab yourWeather tab visible krna h
            searchForm.classList.remove ("active");
            userInfoContainer.classList.remove("active");

            //for coordinates
            getFromSessionStorage ();
        }
    }
}

// check if coordinates are present in session storage or not!
function getFromSessionStorage () {
    const localCoordinates = sessionStorage.getItem ("user-coordinates");

    if (!localCoordinates) {
        // agr localCoordinates nhi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse (localCoordinates);
        fetchUserWeatherInfo (coordinates);
    }
}

async function fetchUserWeatherInfo (coordinates) {
    const {lat, lon} = coordinates;
    // make grantContainer invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add ("active");

    // Now call the API
    try {

        const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        const data = await response.json();

        // After getting the data remove the loader 
        loadingScreen.classList.remove ("active");

        // and now visible the userInfoContainer
        userInfoContainer.classList.add("active");


        // aab UI pe render krdo data ko
        renderWeatherInfo (data);
    }
    catch (err) {
        loadingScreen.classList.remove ("active");
        // HomeWork
    }
}

// Render function

function renderWeatherInfo (weatherInfo) {
    // firstly, we have to fetch the elements
    const cityName = document.querySelector ("[data-cityName]");
    const countryIcon = document.querySelector ("[data-countryIcon]");
    const desc = document.querySelector ("[data-weatherDesc]");
    const weatherIcon = document.querySelector ("[data-weatherIcon]");
    const temp = document.querySelector ("[data-temp]");
    const windSpeed = document.querySelector ("[data-windSpeed]");
    const humidity = document.querySelector ("[data-humidity]");
    const cloudiness = document.querySelector ("[data-cloudiness]");

    // fetch values from weatherInfo object and show it in the UI elements  
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition (showPosition);
    }   
    else {
        alert ('No geoLocation support available');
    }
}

function showPosition (position) {
    const userCoordinates = {
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    };

    sessionStorage.setItem ("user-coordinates", JSON.stringify (userCoordinates));
    fetchUserWeatherInfo (userCoordinates);
}

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        // const response = await fetch(
        //     `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
        // );
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
          );
        const data = await response.json();

        if (!data.sys) {
            throw data;
        }

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        // Handle errors here
        // console.error("Error fetching search weather info:", err);
        loadingScreen.classList.remove('active');
        // You might want to show an error message to the user or log the error for debugging.
        alert ("Wrong city name");
    }
}


// Adding eventListener to the tabs

userTab.addEventListener ('click', () => {
    // Pass clicked tab as input
    switchTab (userTab);
});

searchTab.addEventListener ('click', () => {
    // Pass clicked tab as input
    switchTab (searchTab);
});

// Adding listener on grantAccessButton
const grantAccessButton = document.querySelector ("[data-grantAccess]");
grantAccessButton.addEventListener ('click', getLocation);


const searchInput = document.querySelector ("[data-searchInput]");

searchForm.addEventListener ('submit', (e) => {
    e.preventDefault ();
    let cityName = searchInput.value;

    if (cityName == "") 
        return;
    else {
        fetchSearchWeatherInfo (cityName);
    }
});