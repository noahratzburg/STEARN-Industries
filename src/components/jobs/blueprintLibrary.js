import { useState, useEffect, useMemo } from "react";
import { ISKValueFormatter } from "../../utils/utils";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Blueprint from "../../classes/blueprint";

function BlueprintLibrary() {
    const [ blueprints, setBlueprints ] = useState([]);
    const [ selectedBlueprint, setSelectedBlueprint ] = useState([]);
    const [ blueprint, setBlueprint ] = useState("");
    const [ runs, setRuns ] = useState(0);
    const [ cost, setCost ] = useState(0);
    const [ updatedQuantity, setUpdatedQuantity ] = useState(0);

    useEffect(() => {
        loadBlueprints();
    }, []);

    const  loadBlueprints = () => {
        fetch('http://localhost:8000/blueprints')
        .then(res => {
          return res.json();
        })
        .then(data => {
            setBlueprints(data);
        });
    } 

    const blueprintsRowSelection = useMemo(() => {
        return {
            mode: 'singleRow'
        };
    }, []);

    const onBlueprintRowChange = (params) => {
        setSelectedBlueprint(params.api.getSelectedRows());
    };

    const [blueprintsColDefs, setBlueprintsColDefs] = useState([
        { field: "blueprint", cellDataType: 'text' },
        { field: "runs", cellDataType: 'number' },
        { field: "cost", cellDataType: 'number', valueFormatter: ISKValueFormatter },
        { field: "costPerRun", cellDataType: 'number', valueFormatter: ISKValueFormatter}
    ]);

    const clear = () => {
        setBlueprint("");
        setRuns(0);
        setCost(0);
    }
    
    const saveSelectedBlueprint = () => {
        if (selectedBlueprint[0]) {
            fetch(`http://localhost:8000/blueprints/${selectedBlueprint[0].id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(selectedBlueprint[0])
            }).then((res) => res.json())
              .then((d) => { loadBlueprints() });
        }
    }

    const deleteSelectedBlueprint = () => {
        if (selectedBlueprint[0]) {
            fetch(`http://localhost:8000/blueprints/${selectedBlueprint[0].id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'}
            }).then((res) => res.json())
              .then((d) => { loadBlueprints() });
        }
    }

    const updateQuantity = () => {
        var qtu = parseInt(updatedQuantity)
        if((qtu <= selectedBlueprint[0].runs) && (selectedBlueprint[0].runs - qtu >= 0)) {
            if(qtu - selectedBlueprint[0].runs == 0) {
                deleteSelectedBlueprint();
            } else {
                selectedBlueprint[0].runs -= parseInt(updatedQuantity);
                saveSelectedBlueprint();
            }
        }
        setUpdatedQuantity(0);
    }

    const submitBlueprint = () => {
        if(validation()) {
            var params = {
                'blueprint': blueprint,
                'runs': parseInt(runs),
                'cost': parseInt(cost),
                'costPerRun': (parseInt(cost) / parseInt(runs))
            }
            const data = new Blueprint(params);
            clear();
            fetch('http://localhost:8000/blueprints', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => { loadBlueprints() });
        }
    }

    const validation = () => {
        if ((blueprint && blueprint != "")
            && (parseInt(cost) && parseInt(cost) > 0)
            && (parseInt(runs) && parseInt(runs) > 0)) return true;
        else
            return false;
    }

    return (
        <div class='sub-module-container' >
            <div style={{ display: 'flex' }}>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Blueprint Name: </label>
                    <input type='text' 
                        value={blueprint}
                        onChange={e => setBlueprint(e.target.value)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Runs: </label>
                    <input type='text' 
                        value={runs}
                        onKeyPress={e => { if (!/[0-9]/.test(e.key)){e.preventDefault()}}}
                        onChange={(e) => setRuns(e.target.value)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Cost: </label>
                    <input type='text' 
                        value={cost}
                        onKeyPress={e => { if (!/[0-9]/.test(e.key)){e.preventDefault()}}}
                        onChange={(e) => setCost(e.target.value)}></input>
                </div>
                <button onClick={submitBlueprint}>Submit</button>
            </div>
            <div className='ag-theme-quartz-auto-dark' style={{  height: 600 }}>
                <AgGridReact
                    rowSelection={blueprintsRowSelection}
                    onSelectionChanged={onBlueprintRowChange}
                    rowData={blueprints}
                    columnDefs={blueprintsColDefs}
                    autoSizeStrategy={{type:'fitCellContents'}}
                    enableCellTextSelection={true}
                />
            </div>
            <div style={{ display: 'flex' }}>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Update Quantity: </label>
                    <input type='text' 
                        value={updatedQuantity}
                        onKeyPress={e => { if (!/[0-9]/.test(e.key)){e.preventDefault()}}}
                        onChange={(e) => setUpdatedQuantity(e.target.value)}></input>
                </div>
                <button onClick={updateQuantity} disabled={ selectedBlueprint.length == 0 }>Submit</button>
            </div>
        </div>
    )
}

export default BlueprintLibrary;