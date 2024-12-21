import { createServer, Response } from 'miragejs';
import { data as jobs } from './db.json';

createServer({
  routes() {
    this.namespace = 'api';

    this.get('/job/:id', (_schema, request) => {
      const { id } = request.params;
      const job = jobs.find((e) => e.id === Number(id));

      if (!job) return new Response(400, {}, 'No Job found');

      return { data: job };
    });

    this.get('/jobs', (_schema, request) => {
      let _jobs = [...jobs];
      let { current_page, per_page, query, location }: any = request.queryParams;

      current_page = Number(current_page);
      per_page = Number(per_page);

      current_page = current_page > 1 ? current_page : 1;
      per_page = per_page > 1 ? per_page : 5;

      if (query) {
        _jobs = _jobs.filter((job) => {
          const { id, image, fulltime, date, ...rest } = job;
          return Object.values(rest).some((value) => 
            value.toLowerCase().includes(query.toLowerCase())
          );
        });
      }

      if (location) {
        _jobs = _jobs.filter((job) => {
          const lowerCasedLocation = job.location.toLowerCase();
          return location.split(',').some((loc: string) => lowerCasedLocation.includes(loc.trim()));
        });
      }
     
      const total_records = _jobs.length;
      const total_pages = Math.ceil(total_records / per_page) || 1;
      const next_page = current_page < total_pages ? current_page + 1 : null;
      const prev_page = current_page > 1 ? current_page - 1 : null;

      const firstIndex = current_page * per_page - per_page;
      const lastIndex = firstIndex + per_page;

      return {
        data: _jobs.slice(firstIndex, lastIndex),
        pagination: {
          total_records,
          current_page,
          per_page,
          total_pages,
          next_page,
          prev_page
        },
      };
    });
  }
});