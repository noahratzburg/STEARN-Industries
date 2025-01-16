import { useEffect, useContext } from "react";
import { AppContext } from "../../context";

function AdminConfiguration() {
    const { industryConfigurationState } = useContext(AppContext);
    const [ industryConfiguration, setIndustryConfiguration ] = industryConfigurationState;

    useEffect(() => {
        fetch('http://localhost:8000/industryConfiguration')
        .then(res => {
          return res.json();
        })
        .then(data => {
          setIndustryConfiguration(data);
        });
    }, []);
    
    return (
        <div class='sub-module-container'>

        </div>
    )
}

export default AdminConfiguration;