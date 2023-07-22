//fetch the custom attributes
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const userNotFound = document.querySelector("user-error-container");

//initially vairables need????

//always your weather will be the by deafult tab open.
let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
//current-tab er whatever properties thakbe->css that will get added.
oldTab.classList.add("current-tab");
getfromSessionStorage();

//switching happens whenever a newer tab is clicked.
function switchTab(newTab) {
    //jodi new tab clicked is different then only switching happens.
    if(newTab != oldTab) {
        //firstly old tab er theke current tab er CSS properties hatao
        oldTab.classList.remove("current-tab");
        //new tab is now your current tab to which abar current tab er CSS properties will have to be added.
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        //this is for search weather part.
        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible(switch korchi)-> isiliye user-weather and grant-acess UIs are removed from active.
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            //userNotFound.classList.remove("active");
            //only search weather UI is added to active.
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna padega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}

//if user-tab is clicked.
userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

//if serach-weather tab is clicked.
searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//grant access UI ageya initially as local storage will not have the coordinates.
//check if cordinates are already present in session storage
function getfromSessionStorage() {
    //checking coordinates are there are not in user-coordinates where it shouls be supposedly present.
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile->grant acess UI will be visible.
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        //local storage is coordinates mil jayenge directly fetch weather se jake apne elake ka weather janlo!
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible->jabtak api call hoke ayega screen par tab tak loader dikhega!
    loadingScreen.classList.add("active");

    //API CALL
    try {
        //await function is used to make sure the api is properly fetched and then next steps are exceuted.
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        //convert the final response to data that is in json format.
        const  data = await response.json();
        
        //as data has been fetched so loader hatao or weather show wala UI visible karao
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        //to add the values in the user-info part dynamically!
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        //HW

    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fetch the elements->whose values have to be dynamically filled. 
    // if(weatherInfo.cod == "404"){
    //     //infoTxt.classList.replace("pending", "error");
    //     cityName.innerText = `${inputField.value} isn't a valid city name`;
    //     userNotFound.classList.add("active");
    // }
    // else
    // {
        const cityName = document.querySelector("[data-cityName]");
        const countryIcon = document.querySelector("[data-countryIcon]");
        const desc = document.querySelector("[data-weatherDesc]");
        const weatherIcon = document.querySelector("[data-weatherIcon]");
        const temp = document.querySelector("[data-temp]");
        const windspeed = document.querySelector("[data-windspeed]");
        const humidity = document.querySelector("[data-humidity]");
        const cloudiness = document.querySelector("[data-cloudiness]");

        console.log(weatherInfo);

        //fetch values from weatherINfo object and put it UI elements->all accesed via operational chaining operator->?.
        //api call tay necessary values gulo dia json formatter e convert kore we get the idea how to use the operator,in what order!
        cityName.innerText = weatherInfo?.name;
        countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
        //weather property first elemet is desc-> array first index tai zero index.
        desc.innerText = weatherInfo?.weather?.[0]?.description;
        weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
        temp.innerText = `${weatherInfo?.main?.temp} °C`;
        windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
        humidity.innerText = `${weatherInfo?.main?.humidity}%`;
        cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
    }
//getting your current location.
function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
        
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));//string e convert kore newa hoche user-coordinates k!
    fetchUserWeatherInfo(userCoordinates);

}

//grant access button has two uses when clicked! generate the user's current coordinates using geolocation and then save it in the session storage.
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

//get/fetch the input given in the searchbar by the user!
const searchInput = document.querySelector("[data-searchInput]");

//search er upor event-listener which is typw of submit!
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();//default anything is prevented.
    let cityName = searchInput.value;
    
    if(cityName === "")//no input given by user then nothing to return. 
        return;
    else 
        //checkCity(cityName);
        fetchSearchWeatherInfo(cityName);//given city ka weather nikalke do!
})

// function checkCity(city) {
//   const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

//   // Send a GET request to the OpenWeatherMap API
//   fetch(url)
//     .then(response => {
//       if (response.ok) {
//         // City exists
//         return response.json();
//       } else {
//         // City doesn't exist
//         throw new Error('City not found');
//       }
//     })
//     .then(data => {
//       // Process the weather data here
//       console.log(data);
//     })
//     .catch(error => {
//       // Display the error message
//       console.error(error.message); // or show it on the webpage
//       //userNotFound.classList.add("active");
//     });
// }

// // Example usage
// const cityInput = document.getElementById('city-input');
// const submitButton = document.getElementById('submit-button');

// submitButton.addEventListener('click', () => {
//   const city = cityInput.value;
//   checkCity(city);
// });

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        //values ke liye render-weather.
        renderWeatherInfo(data);
    }
    catch(err) {
        //console.log("Errror Found" , err);
        //checkCity(cityName);
    }
}