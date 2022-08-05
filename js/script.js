const APP_ID = "d91f911bcf2c0f925fb6535547a5ddc9";
const existingHistory = JSON.parse(localStorage.getItem("past-search")) || [];
const historyItems = [];

const getForecast = async (searchValue) => {
  if (!searchValue) {
    return;
  }
  const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&appid=${APP_ID}&units=imperial`;

  const res = await fetch(endpoint);
  const data = await res.json();

  const forecastEl = document.querySelector("#forecast");
  forecastEl.innerHTML = `<h4 class="mt-3 ml-3">5 Day Forecast</h4><div class="card--items w-100 d-flex"></div>`;

  const forecastRowEl = document.createElement("div");
  forecastRowEl.className = "row";

  for (let i = 0; i < data.list.length; i++) {
    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
      const colEl = document.createElement("div");
      colEl.classList.add("col-md-2");
      const cardEl = document.createElement("div");
      cardEl.classList.add("card", "bg-primary", "text-white");
      const windEl = document.createElement("p");
      windEl.classList.add("card-text");
      windEl.textContent = `Wind Speed: ${data.list[i].wind.speed} MPH`;
      const humidityEl = document.createElement("p");
      humidityEl.classList.add("card-text");
      humidityEl.textContent = `Humidity : ${data.list[i].main.humidity} %`;
      const bodyEl = document.createElement("div");
      bodyEl.classList.add("p-2", "card-body");
      const titleEl = document.createElement("h5");
      titleEl.classList.add("card-title");
      titleEl.textContent = new Date(data.list[i].dt_txt).toLocaleDateString();
      const imageEl = document.createElement("img");
      imageEl.setAttribute("src", `http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`);

      const para1 = document.createElement("p");
      para1.classList.add("card-test");
      para1.textContent = `Temperature: ${data.list[i].main.temp_max} °F`;
      colEl.appendChild(cardEl);
      bodyEl.appendChild(titleEl);
      bodyEl.appendChild(imageEl);
      bodyEl.appendChild(windEl);
      bodyEl.appendChild(humidityEl);
      bodyEl.appendChild(para1);
      cardEl.appendChild(bodyEl);
      forecastEl.querySelector(".card--items").appendChild(colEl);
    }
  }
};

const getUv = async (lat, lon) => {
  const results = await fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=${APP_ID}&lat=${lat}&lon=${lon}`);
  const data = await results.json();
  const bodyEl = document.querySelector(".card-body");
  const uvEl = document.createElement("p");
  uvEl.id = "uv";
  uvEl.textContent = "UV Index";
  const btnEl = document.createElement("span");
  btnEl.classList.add("btn", "btn-md", "ml-2");
  btnEl.innerHTML = data.value;

  switch (data.value) {
    case data.value < 3:
      btnEl.classList.add("btn-success");
      break;
    case data.value < 7:
      btnEl.classList.add("btn-warning");
      break;
    default:
      btnEl.classList.add("btn-danger");
  }
  bodyEl.appendChild(uvEl);
  uvEl.appendChild(btnEl);
};

const handleHistory = (term) => {
  if (existingHistory && existingHistory.length > 0) {
    const existingEntries = JSON.parse(localStorage.getItem("history"));
    const newHistory = [...existingEntries, term];
    localStorage.setItem("history", JSON.stringify(newHistory));
  } else {
    historyItems.push(term);
    localStorage.setItem("history", JSON.stringify(historyItems));
  }
};

const searchWeather = async (searchValue) => {
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=${APP_ID}&units=imperial`;
  const res = await fetch(endpoint);
  const data = await res.json();

  if (!existingHistory.includes(searchValue)) {
    handleHistory(searchValue);
  }

  updateSearch(searchValue);

  todayEl = document.querySelector("#today");
  todayEl.textContent = "";
  const titleEl = document.createElement("h5");
  titleEl.classList.add("card-title");
  titleEl.textContent = `${data.name}(${new Date().toLocaleDateString()})`;

  const cardEl = document.createElement("div");
  cardEl.classList.add("card");
  const windEl = document.createElement("p");
  windEl.classList.add("card-text");
  const humidityEl = document.createElement("p");
  humidityEl.classList.add("card-text");
  const tempEl = document.createElement("p");
  tempEl.classList.add("card-text");
  humidityEl.innerHTML = `Humidity <span class="text-primary bold">${data.main.humidity} %</span>`;
  tempEl.innerHTML = `Temperature  <span class="text-primary bold">${data.main.temp} °F</span>`;
  windEl.textContent = `Wind Speed: ${data.wind.speed} MPH`;

  const cardBodyEl = document.createElement("div");
  cardBodyEl.classList.add("card-body");
  const imageEl = document.createElement("img");
  imageEl.setAttribute("src", `http://openweathermap.org/img/w/${data.weather[0].icon}.png`);
  titleEl.appendChild(imageEl);
  cardBodyEl.appendChild(titleEl);
  cardBodyEl.appendChild(windEl);
  cardBodyEl.appendChild(humidityEl);
  cardBodyEl.appendChild(tempEl);
  cardEl.appendChild(cardBodyEl);
  todayEl.appendChild(cardEl);
  getForecast(searchValue);
  getUv(data.coord.lat, data.coord.lon);
};

const getSearchValue = (event) => {
  event.preventDefault();

  const searchValue = event.target.elements.search_value.value;

  if (searchValue) {
    document.querySelector("#search-value").value = "";
    searchWeather(searchValue);
  }
};

window.addEventListener("load", () => {
  const form = document.querySelector("#frm_location_query");
  if (!form) alert("form not found");

  form.onsubmit = getSearchValue;
});

const updateSearch = (/**@type String*/ location_query) => {
  const /**@type Set<String> */ location_histories = new Set(JSON.parse(localStorage.getItem("location_histories") ?? "[]"));

  if (location_query && !location_histories.has(location_query)) {
    //add to the localstorage
    location_histories.add(location_query.trim());

    //update localStorage
    localStorage.setItem("location_histories", JSON.stringify([...location_histories]));
  }

  //clear previous histories on the screen
  document.querySelectorAll(".query--history--item").forEach((item) => item.remove());

  //print history on the screen
  [...location_histories].forEach((location) => {
    const location_html = `
      <li class="query--history--item text-primary fa-2x d-flex">
        <span class="text-capitalize" onclick="searchWeather('${location.trim()}')">${location.trim()}</span>
        <span class="ml-auto mr-auto"></span>
        <button class="btn btn-danger btn-sm"  onclick="deleteSearchHistory('${location.trim()}')">delete</button> 
      </li>
    `;

    document.querySelector(".query--history--items").innerHTML += location_html;
  });
};

const deleteSearchHistory = (location) => {
  const /**@type Set<String> */ location_histories = new Set(JSON.parse(localStorage.getItem("location_histories") ?? "[]"));

  if (location && location_histories.size && location_histories.has(location)) {
    location_histories.delete(location);

    //update localStorage
    localStorage.setItem("location_histories", JSON.stringify([...location_histories]));
  }

  updateSearch();
};

//show past histories when page is started
updateSearch();
