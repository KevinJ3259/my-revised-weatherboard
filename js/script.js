let existingHistory;
if (!JSON.parse(localStorage.getItem("past-search"))) {
  existingHistory = [];
} else {
  existingHistory = JSON.parse(localStarage.getItem("past-search"));
}
let historyItems = [];

const getForecast = (searchValue) => {
  if (!searchValue) {
    return;
  }
  var endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&appid=d91f911bcf2c0f925fb6535547a5ddc9&units=imperial`;

  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      let forecastEl = document.querySelector("#forecast");
      forecastEl.innerHTML = `<h4 class="mt-3 ml-3">5 Day Forecast</h4><div class="card--items w-100 d-flex"></div>`;

      forecastRowEl = document.createElement("div");
      forecastRowEl.className = "row";

      for (let i = 0; i < data.list.length; i++) {
        if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
          let colEl = document.createElement("div");
          colEl.classList.add("col-md-2");
          let cardEl = document.createElement("div");
          cardEl.classList.add("card", "bg-primary", "text-white");
          let windEl = document.createElement("p");
          windEl.classList.add("card-text");
          windEl.textContent = `Wind Speed:${data.list[i].wind.speed}`;
          let humidityEl = document.createElement("p");
          humidityEl.classList.add("card-text");
          humidityEl.textContent = `Humidity : ${data.list[i].main.humidity}`;
          let bodyEl = document.createElement("div");
          bodyEl.classList.add("p-2", "card-body");
          let titleEl = document.createElement("h5");
          titleEl.classList.add("card-title");
          titleEl.textContent = new Date(data.list[i].dt_txt).toLocaleDateString();
          let imageEl = document.createElement("img");
          imageEl.setAttribute("src", `http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`);

          let para1 = document.createElement("p");
          para1.classList.add("card-test");
          para1.textContent = `temperature:${data.list[i].main.temp_max}`;
          let para2 = document.createElement("p");
          para2.classList.add("card-test");
          para2.textContent = `humidity:${data.list[i].main.humidity}`;
          colEl.appendChild(cardEl);
          bodyEl.appendChild(titleEl);
          bodyEl.appendChild(imageEl);
          bodyEl.appendChild(windEl);
          bodyEl.appendChild(humidityEl);
          bodyEl.appendChild(para1);
          bodyEl.appendChild(para2);
          cardEl.appendChild(bodyEl);
          forecastEl.querySelector(".card--items").appendChild(colEl);
        }
      }
    });
};

const getUv = (lat, lon) => {
  fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=d91f911bcf2c0f925fb6535547a5ddc9&lat=${lat}&lon=${lon}`)
    .then((results) => results.json())
    .then((data) => {
      let bodyEl = document.querySelector(".card-body");
      let uvEl = document.createElement("p");
      uvEl.id = "uv";
      uvEl.textContent = "UV Index";
      let btnEl = document.createElement("span");
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
    });
};
const handleHistory = (term) => {
  if (existingHistory && existingHistory.length > 0) {
    let existingEntries = JSON.parse(localStorage.getItem("history"));
    let newHistory = [...existingEntries, term];
    localStorage.setItem("history", JSON.stringify(newHistory));
  } else {
    historyItems.push(term);
    localStorage.setItem("history", JSON.stringify(historyItems));
  }
};

const searchWeather = (searchValue) => {
  let endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=d91f911bcf2c0f925fb6535547a5ddc9&units=imperial`;
  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      if (!existingHistory.includes(searchValue)) {
        handleHistory(searchValue);
      }

      updateSearch(searchValue);

      todayEl = document.querySelector("#today");
      todayEl.textContent = "";
      let titleEl = document.createElement("h5");
      titleEl.classList.add("card-title");
      titleEl.textContent = `${data.name}(${new Date().toLocaleDateString()})`;

      let cardEl = document.createElement("div");
      cardEl.classList.add("card");
      let windEl = document.createElement("p");
      windEl.classList.add("card-text");
      let humidityEl = document.createElement("p");
      humidityEl.classList.add("card-text");
      let tempEl = document.createElement("p");
      tempEl.classList.add("card-text");
      humidityEl.innerHTML = `humidity <span class="text-primary bold">${data.main.humidity}</span>`;
      tempEl.innerHTML = `temperature  <span class="text-primary bold">${data.main.temp}</span>`;
      let cardBodyEl = document.createElement("div");
      cardBodyEl.classList.add("card-body");
      var imageEl = document.createElement("img");
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
    });
};

function makeRow(searchValue) {
  // Create a new `li` element and add classes/text to it
  var liEl = document.createElement("li");
  liEl.classList.add("list-group-item", "list-group-item-action");
  liEl.id = searchValue;

  var text = searchValue;
  liEl.textContent = text;

  // Select the history element and add an event to it
  liEl.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      searchWeather(e.target.textContent);
    }
  });
  document.getElementById("history").appendChild(liEl);
}

if (existingHistory && existingHistory.length > 0) {
  existingHistory.forEach((item) => makeRow(item));
}
const getSearchValue = (event) => {
  event.preventDefault();

  // let searchValue = document.querySelector("#search-value").value;
  let searchValue = event.target.elements.search_value.value;

  if (searchValue) {
    document.querySelector("#search-value").value = "";
    searchWeather(searchValue);
    makeRow(searchValue);
  }
};

window.addEventListener("load", function () {
  // document.querySelector("#search-button").addEventListener("click", getSearchValue);
  let form = document.querySelector("#frm_location_query");
  if (!form) alert("form not found");

  form.setAttribute("onsubmit", "getSearchValue(event)");
});

function updateSearch(/**@type String*/ location_query) {
  let /**@type Set<String> */ location_histories = new Set(JSON.parse(localStorage.getItem("location_histories") ?? "[]"));

  if (location_query && !location_histories.has(location_query)) {
    //add to the localstorage
    location_histories.add(location_query.trim());

    //update localStorage
    localStorage.setItem("location_histories", JSON.stringify([...location_histories].map((item) => item)));
  }

  //clear previous histories on the screen
  document.querySelectorAll(".query--history--item").forEach((item) => item.remove());

  //print history on the screen
  [...location_histories].forEach((location) => {
    let location_html = `
            <li class="query--history--item text-primary fa-2x d-flex">
              <span class="text-capitalize" onclick="searchWeather('${location.trim()}')">${location.trim()}</span>
              <span class="ml-auto mr-auto"></span>
              <button class="btn btn-danger btn-sm"  onclick="deleteSearchHistory('${location.trim()}')">delete</button> 
             </li>
        `;

    document.querySelector(".query--history--items").innerHTML += location_html;
  });
}

function deleteSearchHistory(location) {
  let /**@type Set<String> */ location_histories = new Set(JSON.parse(localStorage.getItem("location_histories") ?? "[]"));

  if (location?.length && location_histories.size && location_histories.has(location)) {
    location_histories.delete(location);

    //update localStorage
    localStorage.setItem("location_histories", JSON.stringify([...location_histories].map((item) => item)));
  }

  updateSearch();
}

//show past histories when page is started
updateSearch();
