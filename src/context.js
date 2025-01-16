import { createContext, useState } from "react";

export const AppContext = createContext();
export const AppProvider = (props) => {
  const [activeJobs, setActiveJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [industryConfiguration, setIndustryConfiguration] = useState({});
  return (
    <AppContext.Provider
      value={{activeJobsState: [activeJobs, setActiveJobs],
        pastJobsState: [pastJobs, setPastJobs],
        industryConfigurationState: [industryConfiguration, setIndustryConfiguration]
      }}>
      {props.children}
    </AppContext.Provider>
  )
}