import { useContext, useMemo, useState, useEffect } from "react";
import { AppContext } from "../../context";
import { AgGridReact } from "ag-grid-react";
import { DateValueFormatter, ISKValueFormatter, PercentageValueFormatter } from "../../utils/utils";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

function JobsPast() {
    const { pastJobsState } = useContext(AppContext);
    const [ pastJobs, setPastJobs ] = pastJobsState;

    useEffect(() => {
        fetch('http://localhost:8000/pastJobs')
        .then(res => {
          return res.json();
        })
        .then(data => {
          setPastJobs(data);
        });
    }, []);

    const pastJobsRowSelection = useMemo(() => {
        return {
            mode: 'singleRow'
        };
    }, []);

    const onPastJobsRowChange = (params) => {
        setSelectedJob(params.api.getSelectedRows());
    };

    const [pastJobsColDefs, setPastJobsColDefs] = useState([
        { field: "job", cellDataType: 'text' },
        { field: "quantity", cellDataType: 'number' },
        { field: "salePrice", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "totalSalePrice", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "totalProfit", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "profitMargin", cellDataType: 'number', valueFormatter: PercentageValueFormatter  },
        { field: "dateStart", cellDataType: 'date', valueFormatter: DateValueFormatter  },
        { field: "dateEnd", cellDataType: 'date', valueFormatter: DateValueFormatter  }
    ]);

    const [selectedJob, setSelectedJob] = useState([]);

    return (
        <div class='sub-module-container' >
            <div className='ag-theme-quartz-auto-dark' style={{  height: 600 }}>
                    <AgGridReact
                        rowSelection={pastJobsRowSelection}
                        onSelectionChanged={onPastJobsRowChange}
                        rowData={pastJobs}
                        columnDefs={pastJobsColDefs}
                        autoSizeStrategy={{type:'fitCellContents'}}
                        enableCellTextSelection={true}
                    />
            </div>
        </div>
    )
}

export default JobsPast;