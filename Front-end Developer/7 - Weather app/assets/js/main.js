{
  const OPENWEATHER_API_KEY = '';
  const VISUALCROSSING_API_KEY = '';

  function useFetch(url) {
    const [data, setData] = React.useState(null);
    const [isLoading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      if (!url) return;

      setError(null);
      setLoading(true);
      fetch(url)
        .then((req) => req.json())
        .then(setData)
        .catch((err) => {
          console.error(err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [url]);

    return { error, data, isLoading };
  }

  function useDebounce(value, delay) {
    const [debounceValue, setDebounceValue] = React.useState(value);

    React.useEffect(() => {
      const handler = setTimeout(() => setDebounceValue(value), delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debounceValue;
  }

  function MyApp() {
    const [location, setLocation] = React.useState(null);
    const [isMetric, setMetric] = React.useState(true);
    const [isSearchPanelActive, setSearchPanelActive] = React.useState(false);

    const [url, setURL] = React.useState(null)
    const { error, data: weatherData, isLoading } = useFetch(url);

    const [searchQuery, setSearchQuery] = React.useState('');
    const debounceSearchQuery = useDebounce(searchQuery, 250);
    const [searchLocations, setSearchLocations] = React.useState([]);
 
    const weatherToday = weatherData?.days[0];
    const todaysDate = getDate();

    const reverseLocation = ({lat, lon}) => {
      return fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`)
        .then((req) => req.json())
        .then((data) => {
          const location = data[0];
          const name = (location.name && location.country) ?
            `${ location.name }, ${ location.country }` :
            `Latitude: ${ lat }, Longitude: ${ lon }`;

          return { lat, lon, name };
        })
        .catch((err) => {
          console.error('Failed to reverse location from lat-lon', err);
        });
    };

    const loadLocation = async () => {
      const checkLocal = () => new Promise((resolve, reject) => {
        const location = JSON.parse(localStorage.getItem('last-location'));

        if (location) resolve(location);
        else reject(new Error('Stored last location not available'));
      });

      const checkGeo = () => new Promise((resolve, reject) => {
        const _reject = () => reject('Geolocation is not available');

        if (!navigator.geolocation) return _reject();
  
        navigator.geolocation.getCurrentPosition(({coords}) => {
          const { latitude: lat, longitude: lon } = coords;

          reverseLocation({lat, lon})
            .then(resolve)
            .catch(_reject);
        }, _reject);
      });

      const checkIP = () => {
        return fetch('http://ip-api.com/json/')
          .then((req) => req.json())
          .then(({lat, lon}) => reverseLocation({lat, lon}))
          .catch(() => new Error('IP-based Geolocation not available'));
      };

      const fallback = () => {
        console.log('Using fallback location');
        return { name: 'Salto, UY', lat: -31.38333, lon: -57.96667 };
      }

      const procedures = [
        ['LOCAL', checkLocal],
        ['GEO', checkGeo],
        ['IP GEO', checkIP],
        ['FALLBACK', fallback],
      ];

      for (const [name, proc] of procedures) {
        try {
          const location = await proc();

          if (location?.name && location?.lat && location?.lon) {
            console.info(`Using "${name}" as default location method`)
            console.info(`${location.name} (Lat: ${location.lat}, Lon: ${location.lon})`);
            setLocation(location);
            break;
          } else {
            throw new Error(`The procedure "${name}" returned invalid data`);
          }
        } catch (err) {
          console.warn(err.message || err);
        }
      }
    }

    React.useEffect(() => {
      try {
        if ('metric' in localStorage) {
          const val = JSON.parse(localStorage.getItem('metric'));
          setMetric(!!val);
        }
      } catch(err) {
        console.error(err);
        localStorage.removeItem('metric');
      }

      loadLocation();
    }, []);

    React.useEffect(() => {
      if (!location) return;

      const formattedLocation = `${location.lat},${location.lon}`;
      setURL(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${formattedLocation}/next6days?unitGroup=metric&include=days&key=${VISUALCROSSING_API_KEY}&contentType=json`);
    }, [location]);

    React.useEffect(() => {
      if (!debounceSearchQuery) return;

      performSearch();
    }, [debounceSearchQuery]);

    function getIconURL(id) {
      const path = './assets/images';
      const icons = {
        'snow': 'Snow.png',
        'rain': 'LightRain.png',
        'fog': 'Fog.png',
        'wind': 'Wind.png',
        'cloudy': 'LightCloud.png',
        'partly-cloudy-day': 'LightCloud.png',
        'partly-cloudy-night': 'LightCloudNight.png',
        'clear-day': 'Clear.png',
        'clear-night': 'ClearNight.png',
      };

      return `${path}/${icons[id]}`;
    }

    function getDate(datetime) {
      const date = new Date(datetime === undefined ? null : datetime);

      const day = date.getDate();
      const [dayName, monthName] = date.toDateString().split(' ');
      
      return `${dayName}, ${day} ${monthName}`;
    }

    function getTemp(temp) {
      const _temp = isMetric ?
        temp :
        temp * 9/5 + 32;

      return (
        <>
          { Math.round(_temp) } <span className="unit">{ isMetric ? 'ºC' : 'ºF' }</span>
        </>
      );
    }

    function getDistance(distance) {
      const _distance = isMetric ?
        distance :
        distance / 1.609;

      return (
        <>
          { Math.round(_distance) } <span className="unit">{ isMetric ? 'km' : 'miles' }</span>
        </>
      );
    }

    function getSpeed(speed) {
      const _speed = isMetric ?
        speed :
        speed / 1.609;

      return (
        <>
          { Math.round(_speed) }<span className="unit">{ isMetric ? 'km/h' : 'mph' }</span>
        </>
      );      
    }

    function getPressure(pressure) {
      return (
        <>
          { Math.round(pressure) } <span className="unit">{ isMetric ? 'hPa' : 'mb' }</span>
        </>
      );
    }

    function getAngleAsText(angle, acronym) {
      function c(strings) {
        const str = strings[0];
        const acron = str.split('-').map((s) => s[0]).join('');
        return acronym ? acron : str;
      }

      const firstAngle = (angle >= 315 || angle <= 45) ? c`North` :
        (angle >= 45 && angle <= 135) ? c`East` :
        (angle >= 135 && angle <= 225) ? c`South` :
        (angle >= 225 && angle <= 315) ? c`West` : '';

      const secondAngle = angle <= 90 ? c`North-East` :
        (angle >= 90 && angle <= 180) ? c`South-East` :
        (angle >= 180 && angle <= 270) ? c`South-West` :
        angle >= 270 ? c`North-West` : '';

      return `${firstAngle}${acronym ? '' : ' '}${secondAngle}`;
    }

    function performSearch() {
      fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${debounceSearchQuery}&limit=10&appid=${OPENWEATHER_API_KEY}`)
        .then((req) => req.json())
        .then((data) => {
          setSearchLocations(data);
        })
        .catch((err) => {
          console.error('Failed to fetch search locations from API', err);
        });
    }

    function handleSearch() {
      performSearch();
    }

    function handleUseMyGEO() {
      const error = (err) => alert('Geolocation API is not avaialable on this device', err);

      if (!navigator.geolocation) return error();

      navigator.geolocation.getCurrentPosition(({coords}) => {
        const { latitude: lat, longitude: lon } = coords;

        reverseLocation({lat, lon})
          .then(saveLocation)
          .catch(error);
      }, error);
    }

    function saveLocation(location) {
      localStorage.setItem('last-location', JSON.stringify(location));
      setLocation(location);
    }

    function handleToggleMetric(val) {
      localStorage.setItem('metric', val);
      setMetric(val);
    }

    function handleLocationSelect(location) {
      saveLocation(location)
      setSearchPanelActive(false);
    }

    return (
      <>
        {
          !!error ?
            <div className="full-size centered"><h1>Error: { error.message }</h1></div> :
            isLoading || !weatherData ?
              <div className="full-size centered"><div className="spinner"></div></div> :
              <div className="container">
                <div className="drawer">
                  <div className="drawer__background"></div>
                  <div className="flex x-space-between x-self-stretch mb-76">
                    <button className="btn" onClick={ () => setSearchPanelActive(true) }>Search for places</button>
                    <span className="btn material-icons" onClick={ handleUseMyGEO }>my_location</span>
                  </div>
                  <img className="drawer__img" src={ getIconURL(weatherToday.icon) } />
                  <div className="drawer__temp">{ getTemp(weatherToday.temp) }</div>
                  <div className="drawer__forecast">{ weatherToday.conditions }</div>
                  <div className="flex-column x-center gap-31">
                    <div className="drawer__today">
                      <span>Today</span>
                      <span>·</span>
                      <span>{ todaysDate }</span>
                    </div>
                    <div className="drawer__location">
                      <span className="material-icons">location_on</span>
                      <span>{ location.name }</span>
                    </div>
                  </div>
                  <div className={ `search-panel${isSearchPanelActive ? ' active' : ''}` }>
                    <span className="close material-icons" onClick={ () => setSearchPanelActive(false) }>close</span>
                    <form className="search-form" onSubmit={ handleSearch }>
                      <div className="input-search">
                        <span className="material-icons">search</span>
                        <input type="text" placeholder="search location" value={ searchQuery } onChange={ (e) => setSearchQuery(e.target.value) } />
                      </div>
                      <button className="btn" onClick={ handleSearch }>Search</button>
                    </form>
                    <ul>
                      {
                        searchLocations.map(({ name, lat, lon, country, state }) => 
                          <li
                            key={`${lat}${lon}`}
                            onClick={() => handleLocationSelect({name, lat, lon})}
                          >
                            { `${name}, ${country}${state ? ` ( ${state} )` : ''}` }
                          </li>
                        )
                      }
                    </ul>
                  </div>
                </div>
                <div className="main">
                  <div className="flex x-end gap-12">
                    <span className={ `btn${isMetric ? ' active' : ''}` } onClick={ () => handleToggleMetric(true) }>ºC</span>
                    <span className={ `btn${!isMetric ? ' active' : ''}` } onClick={ () => handleToggleMetric(false) }>ºF</span>
                  </div>
                  <div className="forecasts">
                    {
                      weatherData.days.slice(2).map(({ tempmax, tempmin, icon, datetime, datetimeEpoch }, index) => {
                        return (
                          <div className="card" key={ datetimeEpoch }>
                            <div className="flex-column x-center">
                              <div className="card__date">{ index === 0 ? 'Tomorrow' : getDate(datetime) }</div>
                              <img className="card__img" src={ getIconURL(icon) } />
                            </div>
                            <div className="card__temps">
                              <div>{ getTemp(tempmax) }</div>
                              <div>{ getTemp(tempmin) }</div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                  <div className="highlights">
                    <h3>Today’s Hightlights</h3>
                    <div className="highlights__cards">
                      <div className="card">
                        <div>Wind status</div>
                        <div className="card__stat">{ getSpeed(weatherToday.windspeed) }</div>
                        <div className="flex y-center gap-6 mt-17">
                          <div className="arrow" style={{'--angle': `${ weatherToday.winddir }deg` }}></div>
                          <span title={ getAngleAsText(weatherToday.winddir) }>
                            { getAngleAsText(weatherToday.winddir, true) }
                          </span>
                        </div>
                      </div>
                      <div className="card">
                        <div>Humidity</div>
                        <div className="card__stat">{ Math.round(weatherToday.humidity) }<span className="unit">%</span></div>
                        <div className="humidity">
                          <div className="flex x-space-between">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                          <meter max="100" value={ weatherToday.humidity }></meter>
                          <span className="align-self-end">%</span>
                        </div>
                      </div>
                      <div className="card">
                        <div>Visibility</div>
                        <div className="card__stat">{ getDistance(weatherToday.visibility) }</div>
                      </div>
                      <div className="card">
                        <div>Air Pressure</div>
                        <div className="card__stat">{ getPressure(weatherToday.pressure) }</div>
                      </div>
                    </div>
                  </div>
                  <div className="attribution">created by <a href="https://github.com/goodbyte">goodbyte</a> - devChallenges.io</div>
                </div>
              </div>
        }
      </>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('react-root'));
  root.render(<MyApp />);
}