import { useMemo, useState, useContext, useEffect } from 'react';
import { AgGridReact } from "ag-grid-react";
import { ISKValueFormatter, PercentageValueFormatter, PopulateSubjobDataValuesOnCompletion, FixSelectedSubJob, DateValueFormatter } from '../../utils/utils';
import { AppContext } from '../../context';
import PastJob from '../../classes/pastJob';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

function JobsActive() {
    // Context imports
    const { activeJobsState, pastJobsState, industryConfigurationState } = useContext(AppContext);
    const [ activeJobs, setActiveJobs ] = activeJobsState;
    const [ pastJobs, setPastJobs ] = pastJobsState;
    const [ industryConfiguration, setIndustryConfiguration ] = industryConfigurationState;

    const [subJobsRowData, setSubJobsRowData] = useState([]);
    const [selectedJob, setSelectedJob] = useState({});
    const [selectedSubJobs, setSelectedSubJobs] = useState([{}]);
    const [additionalCost, setAdditionalCost] = useState(0);

    useEffect(() => {
        if(selectedJob[0]) {
            selectPrimarySubJobs();
        }
    }, [selectedJob]);

    useEffect(() => {
        fetch('http://localhost:8000/activeJobs')
          .then(res => {
            return res.json();
          })
          .then(data => {
            setActiveJobs(data);
          });
        fetch('http://localhost:8000/pastJobs')
        .then(res => {
          return res.json();
        })
        .then(data => {
          setPastJobs(data);
        });
    }, []);

    const activeJobsRowSelection = useMemo(() => {
        return {
            mode: 'singleRow'
        };
    }, []);

    const subJobsRowSelection = useMemo(() => {
        return {
            mode: 'multiRow'
        };
    }, []);

    const onActiveJobSelectionChanged = (params) => {
        setSelectedJob(params.api.getSelectedRows());
    };

    const onSubJobsSelectionChanged = (params) => {
        setSelectedSubJobs(params.api.getSelectedRows());
    };

    const [activeJobsColDefs, setActiveJobsColDefs] = useState([
        { field: "job", cellDataType: 'text' },
        { field: "quantity", cellDataType: 'number' },
        { field: "salePrice", editable: true, cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "totalMaterialCost", editable: true, cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "totalManufacturingCost", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "totalProfit", editable: true, cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "profitMargin", editable: true, cellDataType: 'number', valueFormatter: PercentageValueFormatter  },
        { field: "percentComplete", cellDataType: 'number', valueFormatter: PercentageValueFormatter }
    ]);

    const [subJobsColDefs, setSubJobsColDefs] = useState([
        { field: "job", cellDataType: 'text'},
        { field: "quantity", cellDataType: 'number', sort:'desc' },
        { field: "JBVInput", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "blueprintCost", editable: true, cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "manufacturingCost", editable: true, cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "JBVOutput", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "totalProfit", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "profitMargin", cellDataType: 'number', valueFormatter: PercentageValueFormatter },
        { field: "dateStart", cellDataType: 'date', valueFormatter: DateValueFormatter},
        { field: "daysLeft", cellDataType: 'number' },
        { field: "completed", cellDataType: 'boolean' }
    ]);

    const addAdditionalCost = () => {
        if (selectedJob[0]) {
            selectedJob[0].totalManufacturingCost += parseInt(additionalCost);
            saveJob();
        }
        setAdditionalCost(0);
    }

    const completeJob = () => {
        if(validateJob()) {
            selectedJob[0].totalProfit = (selectedJob[0].salePrice * selectedJob[0].quantity) - (selectedJob[0].totalManufacturingCost + selectedJob[0].totalMaterialCost);
            selectedJob[0].profitMargin = selectedJob[0].totalProfit / (selectedJob[0].totalManufacturingCost + selectedJob[0].totalMaterialCost);
            
            var pastJobCreationParams = {
                job: selectedJob[0].job,
                quantity: selectedJob[0].quantity,
                totalSalePrice: selectedJob[0].quantity * selectedJob[0].salePrice,
                totalMaterialCost: selectedJob[0].totalMaterialCost,
                totalManufacturingCost: selectedJob[0].totalManufacturingCost,
                salePrice: selectedJob[0].salePrice,
                profitMargin: selectedJob[0].profitMargin,
                dateStart: selectedJob[0].startDate,
                dateEnd: new Date(),
                totalProfit: selectedJob[0].totalProfit
            }
            
            const pastJobObj = new PastJob(pastJobCreationParams);

            fetch(`http://localhost:8000/activeJobs/${selectedJob[0].id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            }).then((response) => {
                if (!response.ok) {
                    throw new Error('Could not delete active job entry for completeJob() :');
                }
            }).catch((err) => {
                console.error('Error deleting active job entry: ', err);
            });
            
            fetch('http://localhost:8000/pastJobs', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(pastJobObj)
            }).then((res) => res.json())
              .then((d) => {
                fetch(`http://localhost:8000/activeJobs`)
                    .then((res) => { return res.json(); })
                    .then((data) => { 
                        setActiveJobs(data);
                        setSubJobsRowData([]);
                    });
            });
        }
    }

    const selectPrimarySubJobs = () => {
        if (selectedJob[0].intermediateReactions.length > 0 && selectedJob[0].intermediateReactions.filter((o) => o.completed == true).length != selectedJob[0].intermediateReactions.length) 
            setSubJobsRowData(selectedJob[0].intermediateReactions);
        else if (selectedJob[0].compositeReactions.length > 0 && selectedJob[0].compositeReactions.filter((o) => o.completed == true).length != selectedJob[0].compositeReactions.length) 
            setSubJobsRowData(selectedJob[0].compositeReactions);
        else if (selectedJob[0].biochemReactions.length > 0 && selectedJob[0].biochemReactions.filter((o) => o.completed == true).length != selectedJob[0].biochemReactions.length) 
            setSubJobsRowData(selectedJob[0].biochemReactions);
        else if (selectedJob[0].advancedComponents.length > 0 && selectedJob[0].advancedComponents.filter((o) => o.completed == true).length != selectedJob[0].advancedComponents.length) 
            setSubJobsRowData(selectedJob[0].advancedComponents);
        else if (selectedJob[0].capitalComponents.length > 0 && selectedJob[0].capitalComponents.filter((o) => o.completed == true).length != selectedJob[0].capitalComponents.length) 
            setSubJobsRowData(selectedJob[0].capitalComponents);
        else if (selectedJob[0].others.length > 0 && selectedJob[0].others.filter((o) => o.completed == true).length != selectedJob[0].others.length) 
            setSubJobsRowData(selectedJob[0].others);
        else if (selectedJob[0].endProductJobs.length > 0 && selectedJob[0].endProductJobs.filter((o) => o.completed == true).length != selectedJob[0].endProductJobs.length) 
            setSubJobsRowData(selectedJob[0].endProductJobs);
        else if (selectedJob[0].intermediateReactions.length > 0) 
            setSubJobsRowData(selectedJob[0].intermediateReactions);
        else if (selectedJob[0].compositeReactions.length > 0) 
            setSubJobsRowData(selectedJob[0].compositeReactions);
        else if (selectedJob[0].biochemReactions.length > 0) 
            setSubJobsRowData(selectedJob[0].biochemReactions);
        else if (selectedJob[0].advancedComponents.length > 0) 
            setSubJobsRowData(selectedJob[0].advancedComponents);
        else if (selectedJob[0].capitalComponents.length > 0) 
            setSubJobsRowData(selectedJob[0].capitalComponents);
        else if (selectedJob[0].others.length > 0) 
            setSubJobsRowData(selectedJob[0].others);
        else if (selectedJob[0].endProductJobs.length > 0) 
            setSubJobsRowData(selectedJob[0].endProductJobs);
    }

    async function completeSubJobs() {
        if(validateSubJobs()) {
            await PopulateSubjobDataValuesOnCompletion(selectedSubJobs).then(() => {
                var totalProfitHolder = 0, marginHolder = 0, manufacturingCostHolder = 0;
                selectedSubJobs.forEach((subJob) => {   
                    totalProfitHolder += subJob.totalProfit;
                    marginHolder += subJob.profitMargin;
                    manufacturingCostHolder += subJob.manufacturingCost + (subJob.blueprintCost * subJob.quantity);
                })
                const newSubJobsRowData = subJobsRowData.map((subJob) => {
                    const updatedSubJob = selectedSubJobs.find((i) => i.id === subJob.id);
                    return updatedSubJob ? {...subJob, ...updatedSubJob} : subJob;
                });
                selectedJob[0].totalSubJobsComplete += selectedSubJobs.length;
                selectedJob[0].percentComplete = selectedJob[0].totalSubJobsComplete / selectedJob[0].totalSubJobs;
                selectedJob[0].totalManufacturingCost += manufacturingCostHolder;
                updateJobsSubJobs(newSubJobsRowData);
            });
        }
    }

    const incompleteSubJob = () => {
        if (selectedSubJobs.length > 0) {
            selectedSubJobs.forEach((subJob) => {
                subJob.completed = false;
                subJob.daysLeft = null;
                subJob.dateStart = null;
                subJob.blueprintCost = null;
                subJob.totalProfit = null;
                subJob.profitMargin = null;
                subJob.JBVInput = null;
                subJob.JBVOutput = null;
                subJob.blueprintCost = null;
                subJob.manufacturingCost = null;
            });
            const newSubJobsRowData = subJobsRowData.map((subJob) => {
                const updatedSubJob = selectedSubJobs.find((i) => i.id === subJob.id);
                return updatedSubJob ? {...subJob, ...updatedSubJob} : subJob;
            });
            updateJobsSubJobs(newSubJobsRowData);
        }
    }

    const updateJobsSubJobs = (newSubJobsRowData) => {
        saveJob();
        setSubJobsRowData(newSubJobsRowData);
    }

    const validateJob = () => {
        var success = true;
        if (selectedJob[0].salePrice == null || selectedJob[0].salePrice === "" || selectedJob[0].salePrice == 0) {
            success = false;
            return success;
        }
        selectedJob[0].intermediateReactions.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        selectedJob[0].compositeReactions.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        selectedJob[0].hybridReactions.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        selectedJob[0].advancedComponents.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        selectedJob[0].capitalComponents.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        selectedJob[0].others.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        selectedJob[0].endProductJobs.some((subJob) => {
            if(!subJob.completed) {
                success = false;
                return true;
            }
        });
        return success;
    }

    const validateSubJobs = () => {
        var success = true;
        selectedSubJobs.some((subJob) => {
            if((!subJob.manufacturingCost || subJob.manufacturingCost === null || subJob.manufacturingCost === "") ||
                (subJob.completed)) {
                    success = false;
                    return true;
                }
        });
        return success;
    }

    const changeSelectedSubJobs = (str) => {
        if (selectedJob[0]) {
            switch(str) {
                case 'ir':
                    setSubJobsRowData(selectedJob[0].intermediateReactions);
                    break;
                case 'cr':
                    setSubJobsRowData(selectedJob[0].compositeReactions);
                    break;
                case 'hr':
                    setSubJobsRowData(selectedJob[0].hybridReactions);
                    break;
                case 'br':
                    setSubJobsRowData(selectedJob[0].biochemReactions);
                    break;
                case 'ac':
                    setSubJobsRowData(selectedJob[0].advancedComponents);
                    break;
                case 'cc':
                    setSubJobsRowData(selectedJob[0].capitalComponents);
                    break;
                case 'o':
                    setSubJobsRowData(selectedJob[0].others);
                    break;
                case 'epj':
                    setSubJobsRowData(selectedJob[0].endProductJobs);
                    break;
                default:
                    break;
            }
        }
    }

    const saveJob = () => {
        if (selectedJob[0]) {
            fetch(`http://localhost:8000/activeJobs/${selectedJob[0].id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(selectedJob[0])
            }).then((res) => res.json())
              .then((d) => {
                fetch(`http://localhost:8000/activeJobs`)
                    .then((res) => { return res.json(); })
                    .then((data) => { 
                        setActiveJobs(data);
                    });
            });
        }
    }

    return (
        <div class='sub-module-container'>
            <div className='ag-theme-quartz-auto-dark' style={{ display: 'flex', height: 600 }}>
                <div style={{width: '50%'}}>
                    <AgGridReact
                        rowSelection={activeJobsRowSelection}
                        onSelectionChanged={onActiveJobSelectionChanged}
                        rowData={activeJobs}
                        columnDefs={activeJobsColDefs}
                        autoSizeStrategy={{type:'fitCellContents'}}
                        enableCellTextSelection={true}
                    />
                </div>
                <div style={{width: '50%'}}>
                    <AgGridReact
                        rowSelection={subJobsRowSelection}
                        onSelectionChanged={onSubJobsSelectionChanged}
                        rowData={subJobsRowData}
                        columnDefs={subJobsColDefs}
                        autoSizeStrategy={{type:'fitCellContents'}}
                        enableCellTextSelection={true}
                    />
                </div>
                
            </div>
            <div style={{ display:'flex' }}>
                <div style={{width: '50%'}}>
                    <button onClick={completeJob} disabled={Object.keys(selectedJob).length === 0}>Complete Job</button>
                    <button onClick={saveJob} disabled={Object.keys(selectedJob).length === 0}>Save Job</button>
                    <button onClick={() => {FixSelectedSubJob(selectedJob[0])}} disabled={Object.keys(selectedJob).length === 0}>FixSelectedJobData</button>
                </div>
                <div style={{width: '50%'}}>
                    <button onClick={completeSubJobs} disabled={Object.keys(selectedSubJobs).length === 0}>Complete Job(s)</button>
                    <button onClick={incompleteSubJob} disabled={Object.keys(selectedSubJobs).length === 0}>Incomplete Job(s)</button>
                    
                    {(selectedJob && selectedJob[0] && selectedJob[0].intermediateReactions.length > 0) && <button  onClick={() => changeSelectedSubJobs('ir')}>Intermediate Reactions</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].compositeReactions.length > 0) && <button  onClick={() => changeSelectedSubJobs('cr')}>Composite Reactions</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].hybridReactions.length > 0) && <button  onClick={() => changeSelectedSubJobs('hr')}>Hybrid Reactions</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].biochemReactions.length > 0) && <button  onClick={() => changeSelectedSubJobs('br')}>Biochem Reactions</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].advancedComponents.length > 0) && <button  onClick={() => changeSelectedSubJobs('ac')}>Advanced Components</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].capitalComponents.length > 0) && <button  onClick={() => changeSelectedSubJobs('cc')}>Capital Components</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].others.length > 0) && <button  onClick={() => changeSelectedSubJobs('o')}>Others</button>}
                    {(selectedJob && selectedJob[0] && selectedJob[0].endProductJobs.length > 0) && <button  onClick={() => changeSelectedSubJobs('epj')}>End Product Jobs</button>}
                </div>
            </div>
            <div style={{ display:'flex' }}>
                <div style={{width: '50%'}}>
                    <label class='industry-label-1'>Additional Cost</label>
                    <input type='text' value={additionalCost} onKeyPress={e => { if (!/[0-9]/.test(e.key)){e.preventDefault()}}} onChange={(e) => setAdditionalCost(e.target.value)}></input>
                    <button onClick={addAdditionalCost}>Submit</button>
                </div>
                <div style={{width: '50%'}}>
                    <label class='industry-label-1'>Completed Jobs</label>
                    <input type='text' value={subJobsRowData.filter(e => e.completed === true).length} editable={false}></input>
                    <label class='industry-label-1'>Total Jobs</label>
                    <input type='text' value={subJobsRowData.length} editable={false}></input>
                </div>
            </div>
        </div>
    )
}

export default JobsActive;