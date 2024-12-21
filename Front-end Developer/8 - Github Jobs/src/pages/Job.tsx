import moment from 'moment';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useState, useEffect } from 'react';
import type { Job } from '../types/misc';

function JobPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [endpoint, setEndpoint] = useState('');
  const { error, data, isLoading } = useFetch<{ data: Job }>(endpoint);

  let { title, image, date, place, location, contact, desc } = state || data?.data || {};

  date = moment(Number(date)).fromNow();
  desc = desc ? atob(desc) : '';

  const hasData = state || data?.data;

  useEffect(() => {
    if (!state) setEndpoint(`/api/job/${ id }`);

    window.scrollTo(0, 0)
  }, []);

  function handleGoBack() {
    if (state) navigate(-1);
    else navigate('/');
  }
  
  return (
    <div className="main">
      <div className="sidebar">
        <a className="back" onClick={ handleGoBack }>Back to search</a>
        { 
          hasData &&
          <div>
            <h4 className="subtitle mb-16">How to apply</h4>
            <p>{ contact }</p>
          </div>
        }
      </div>
      <div className="content">
        <div className="details">
          { 
            error ?
              <hgroup>
                <h1>Error</h1>
                <h2>Could not find a job with the given ID.</h2> 
              </hgroup> :

              hasData &&
              <>
                <div>
                  <div className="flex align-center gap-16">
                    <h1 className="line-height-1">{ title }</h1>
                    <div className="fulltime"></div>
                  </div>
                  <div className="time">{ date }</div>
                </div>
                <div className="job--2">
                  <img className="job__image" src={ image } />
                  <div className="job__place">{ place }</div>
                  <div className="job__meta">
                    <div className="job__location">{ location }</div>
                  </div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: desc }}></div>
              </>
          }
        </div>
      </div>
    </div>
  )
}

export default JobPage;