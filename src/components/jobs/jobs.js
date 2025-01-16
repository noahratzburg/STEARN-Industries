import { useState } from "react";
import NavBar from "../navbar";
import JobsActive from "./jobsActive";
import JobsNew from "./jobsNew";
import JobsPast from "./jobsPast";
import BlueprintLibrary from "./blueprintLibrary";

function Jobs() {
    const navBarButtonNames = ['new job', 'active jobs', 'past jobs', 'blueprint library'];
    const [page, setPage] = useState('new job');
    
    return (
        <div class='jobs-container'>
            <NavBar
                buttonNames={navBarButtonNames}
                onNavigation={setPage}
            />
            {page === 'new job' && <JobsNew/>}
            {page === 'active jobs' && <JobsActive/>}
            {page === 'past jobs' && <JobsPast/>}
            {page === 'blueprint library' && <BlueprintLibrary/>}
        </div>
    )
}

export default Jobs;