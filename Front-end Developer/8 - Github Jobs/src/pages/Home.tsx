import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import Collapse from '../components/Collapse';
import PaginatedList from '../components/PaginatedList';
import type { Job } from '../types/misc';
import type { Pagination } from '../components/PaginatedList';

interface Data {
  data: Job[];
  pagination: Pagination;
}

interface Filter {
  query?: string | null;
  page?: string | null;
  location?: string | null;
}

const locations = [
  {
    name: 'London',
    value: 'london'
  },
  {
    name: 'Amsterdam',
    value: 'amsterdam'
  },
  {
    name: 'New York',
    value: 'new york,ny'
  },
  {
    name: 'Berlin',
    value: 'berlin'
  },
];

function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');

  const debounceSearchQuery = useDebounce(searchQuery);
  const debounceLocationQuery = useDebounce(locationQuery);

  const [endpointQueryString, setEndpoingQueryString] = useState('');
  const { error, data, isLoading } = useFetch<Data>(endpointQueryString);

  const jobsPerPage = 4;
  
  useEffect(() => {
    const queryParams = Array.from(searchParams);
    queryParams.push(['per_page', String(jobsPerPage)]);

    let queryParamsString = queryParams.map(([key, val]) => {
      if (key === 'page') {
        let page = Number(val);
        page = page > 0 ? page : 1;
        key = 'current_page';
        val = String(page);
      }
      return `${ key }=${ encodeURIComponent(val || '') }`;
    })
    .join('&');

    queryParamsString = queryParamsString ? `?${queryParamsString}` : '';
    setEndpoingQueryString(`/api/jobs${ queryParamsString }`);
  }, [searchParams]);

  useEffect(() => handleSearch(), [debounceSearchQuery]);

  useEffect(() => {
    updateFilter({ location: debounceLocationQuery });

    document.querySelectorAll<HTMLInputElement>('input[name="location"]').forEach(
      (el) => el.checked = false
    )
  }, [debounceLocationQuery]);


  const updateFilter = (newFilter: Filter) => {
    setSearchParams((params) => {
      for (const [key, value] of Object.entries(newFilter)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }

      if ('query' in newFilter || 'location' in newFilter) params.delete('page');

      return params;
    });
  };

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    updateFilter({ query: searchQuery });
  };

  const jobListTemplate = (job: Job) => {
    const { id, image, place, title, fulltime, location } = job;
    const date = moment(Number(job.date)).fromNow();

    return (
      <div className="job" key={ id } onClick={ () => navigate(`/job/${ id }`, { state: job }) }>
        <img className="job__image" src={ image } alt={ title } />
        <div className="job__place">{ place }</div>
        <div className="job__title">{ title }</div>
        <div className="job__meta">
          { fulltime && <div className="job__fulltime"></div> }
          <div className="job__location">{ location }</div>
          <div className="job__date">{ date }</div>
        </div>
      </div>
    );
  };

  const placeholder = useMemo(() => Array.from({ length: jobsPerPage }, (_, index) => (
    <div key={ index } className="job">
      <div className="job__image shimmer"></div>
      <div className="job__place shimmer"></div>
      <div className="job__title shimmer"></div>
    </div>
  )), []);

  const pageChanged = (page: number) => {
    updateFilter({ page: String(page) });
  };

  const listOfLocationsToFilterBy = useMemo(() => locations.map(({name, value}) => {
    const id = 'location-' + name.toLowerCase().replace(' ', '');

    return (
      <label key={ id } htmlFor={ id }>
        <input
          type="radio"
          id={ id }
          name="location"
          onChange={ () => updateFilter({ location: value }) }
      />
        { name }
      </label>
    );
  }), []);

  return (
    <>
      <form className="search-wrapper" onSubmit={ handleSearch }>
        <div className="input-wrapper max-width-790">
          <span className="material-icons">work</span>
          <input
            type="text"
            placeholder="Title, companies, expertise or benefits"
            value={ searchQuery }
            onChange={ (e) => setSearchQuery(e.target.value) }
          />
          {
            !!searchQuery && <span className="material-icons cursor-pointer" onClick={ () => setSearchQuery('') }>clear</span>
          }
          <button className="btn">Search</button>
        </div>
      </form>
      <div className="main">
        <div className="sidebar">
          <Collapse label="Filters">
            <div className="filters">
              <label htmlFor="fulltime" className="ml-14 mb-33">
                <input type="checkbox" id="fulltime" name="fulltime" checked disabled /> Full time
              </label>
              <label className="mb-24" data-label="LOCATION">
                <div className="input-wrapper">
                  <span className="material-icons">public</span>
                  <input
                    type="text"
                    placeholder="City, state, zip code or country"
                    value={ locationQuery }
                    onChange={ (e) => setLocationQuery(e.target.value) }
                  />
                </div>
              </label>
              <div className="flex-column gap-16 mb-24 ml-14">
                { listOfLocationsToFilterBy }
              </div>
            </div>
          </Collapse>
        </div>
        <div className="content">
          <div className="jobs">
            {
              error ?
                <h4>Failed to load jobs list</h4> :
                data && (
                  <PaginatedList
                    list={ data }
                    isLoading={ isLoading }
                    emptyMessage='No elements to show. Try changing the filters.'
                    templateCallback={ jobListTemplate }
                    placeholder={ placeholder }
                    maxButtons={ 4 }
                    onPageChanged={ pageChanged }
                  />
                )
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Index;