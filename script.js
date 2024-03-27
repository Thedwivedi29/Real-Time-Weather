
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'aad352bc11msh03959b61121e6c1p1172d8jsnf92361e26df9',
        'X-RapidAPI-Host': 'weather-by-api-ninjas.p.rapidapi.com'
    }
};

function getWeather(city) {
    fetch('https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=' + city, options)
        .then(response => response.json())
        .then((response) => {
            console.log(response);
            temp.innerHTML = response.temp
            humidity.innerHTML = response.humidity
            min_temp.innerHTML = response.min_temp
            max_temp.innerHTML = response.max_temp
            wind_speed.innerHTML = response.wind_speed
            wind_degrees.innerHTML = response.wind_degrees
            cityName.innerHTML = city
        })
        .catch(err => console.error('Error: ', err));
}

//    menu
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', event => {
        const city = event.target.textContent;
        getWeather(city);
    });
});

// search
document.getElementById('submit').addEventListener("click", (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    getWeather(city);
});
getWeather('Kanpur')