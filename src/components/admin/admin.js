import { useState } from 'react';
import NavBar from "../navbar";
import AdminConfiguration from './adminConfiguration';

function Admin() {
    const navBarButtonNames = ['general', 'configuration'];
    const [page, setPage] = useState('general');


    return (
        <div class='admin-container'>
            <NavBar
                buttonNames={navBarButtonNames}
                onNavigation={setPage}
            />
            {page === 'configuration' && <AdminConfiguration></AdminConfiguration>}
        </div>
    )
}

export default Admin;