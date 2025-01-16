import React, { useState } from 'react';
import { AppProvider } from './context';
import NavBar from './components/navbar'
import Jobs from './components/jobs/jobs'
import Analytics from './components/analytics/analytics'
import Admin from './components/admin/admin'

function App() {
  const navBarButtonNames = ['jobs', 'analytics', 'admin'];
  const [page, setPage] = useState('jobs');
  
  return (
    <div className="app-container">
      <NavBar
        buttonNames={navBarButtonNames}
        onNavigation={setPage}
      />
      {page === 'jobs' && <AppProvider><Jobs/></AppProvider>}
      {page === 'analytics' && <Analytics/>}
      {page === 'admin' && <AppProvider><Admin/></AppProvider>}
    </div>
  );
}

export default App;
