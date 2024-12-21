import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      <Link to="/" className="brand">Github <span>Jobs</span></Link>
      <Outlet />
    </>
  );
}

export default Layout;
