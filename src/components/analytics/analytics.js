import { useState } from 'react';
import NavBar from "../navbar";

function Analytics() {
    const navBarButtonNames = ['general', 'production totals'];
    const [page, setPage] = useState('general');


    return (
        <div class='analytics-container'>
            <NavBar
                buttonNames={navBarButtonNames}
                onNavigation={setPage}
            />
        </div>
    )
}

export default Analytics;