import { useContext, useState, useEffect } from 'react';
import { RavworksTableStringParser } from '../../utils/utils';
import { AppContext } from '../../context';
import Job from '../../classes/job'
function JobsNew() {
    // Context imports
    const { activeJobsState, industryConfigurationState } = useContext(AppContext);
    const [ activeJobs, setActiveJobs ] = activeJobsState;
    const [ industryConfiguration, setIndustryConfiguration ] = industryConfigurationState;

    const [job, setJob] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [blueprintEfficiency, setBlueprintEfficiency] = useState(0);
    const [jobType, setJobType] = useState("subcapitalShip");
    const [intermediateReaction, setIntermediateReaction] = useState(false);
    const [compositeReaction, setCompositeReaction] = useState(false);
    const [biochemReaction, setBiochemReaction] = useState(false);
    const [hybridReaction, setHybridReaction] = useState(false);
    const [others, setOthers] = useState(false);
    const [advancedComponents, setAdvancedComponents] = useState(false);
    const [capitalComponents, setCapitalComponents] = useState(false);

    const [intermediateReactionInput, setIntermediateReactionInput] = useState();
    const [compositeReactionInput, setCompositeReactionInput] = useState();
    const [biochemReactionInput, setBiochemReactionInput] = useState();
    const [hybridReactionInput, setHybridReactionInput] = useState();
    const [othersInput, setOthersInput] = useState();
    const [advancedComponentsInput, setAdvancedComponentsInput] = useState();
    const [capitalComponentsInput, setCapitalComponentsInput] = useState();
    const [endProductJobsInput, setEndProductJobsInput] = useState();

    const clearInputFields = () => {
        setJob("");
        setQuantity(0);
        setBlueprintEfficiency(0);
        setJobType("subcapitalShip");
        setIntermediateReaction(false);
        setCompositeReaction(false);
        setBiochemReaction(false);
        setHybridReaction(false);
        setOthers(false);
        setAdvancedComponents(false);
        setCapitalComponents(false);
        setIntermediateReactionInput("");
        setCompositeReactionInput("");
        setBiochemReactionInput("");
        setHybridReactionInput("");
        setAdvancedComponentsInput("");
        setCapitalComponentsInput("");
        setEndProductJobsInput("");
    }

    useEffect(() => {
        fetch('http://localhost:8000/activeJobs')
          .then(res => {
            return res.json();
          })
          .then(data => {
            setActiveJobs(data);
          });
          fetch('http://localhost:8000/industryConfiguration')
          .then(res => {
            return res.json();
          })
          .then(data => {
            setIndustryConfiguration(data);
          });
    }, []);

    const submitJob = () => {
        if (validation()) {
            var jobCreationParams = {
                job: job,
                jobType: jobType,
                quantity: parseInt(quantity),
                blueprintEfficiency: parseInt(blueprintEfficiency) / 100,
                startDate: new Date(),
                intermediateReactions: RavworksTableStringParser(intermediateReactionInput),
                compositeReactions: RavworksTableStringParser(compositeReactionInput),
                biochemReactions: RavworksTableStringParser(biochemReactionInput),
                hybridReactions: RavworksTableStringParser(hybridReactionInput),
                advancedComponents: RavworksTableStringParser(advancedComponentsInput),
                capitalComponents: RavworksTableStringParser(capitalComponentsInput),
                others: RavworksTableStringParser(othersInput),
                endProductJobs: RavworksTableStringParser(endProductJobsInput)
            }

            jobCreationParams.endProductJobs.forEach((endProduct) => {
                endProduct.blueprintEfficiency = parseInt(blueprintEfficiency) / 100;
            });

            fetch('http://localhost:8000/activeJobs', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(new Job(jobCreationParams))
            }).then((res) => {
                return res.json();
            }).then((data) => {
                console.log(data);
                activeJobs.push(data)
                const newActiveJobs = activeJobs;
                setActiveJobs(newActiveJobs);
                clearInputFields();
            });
        }   
    }

    const validation = () => {
        if ((!job || job == null || job == '') 
            || (!quantity || quantity <= 0 || quantity == null)) return false;
        return true;
    }

    return (
        <div class='sub-module-container'>
            <div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Job: </label>
                    <input type='text' 
                        value={job}
                        onChange={e => setJob(e.target.value)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Quantity: </label>
                    <input type='text' 
                        value={quantity}
                        onKeyPress={e => { if (!/[0-9]/.test(e.key)){e.preventDefault()}}}
                        onChange={(e) => setQuantity(e.target.value)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Blueprint Efficiency: </label>
                    <input type='text' 
                        value={blueprintEfficiency}
                        onKeyPress={e => { if (!/[0-9]/.test(e.key)){e.preventDefault()}}}
                        onChange={(e) => setBlueprintEfficiency(e.target.value)}></input>
                </div>
                <div class='industry-label-div-1'> 
                <label class='industry-label-1'>Job Type: </label>
                    <select 
                        value={jobType}
                        onChange={e => setJobType(e.target.value)}>
                        <option value='subcapitalShip'>Subcapital Ship</option>
                        <option value='capitalShip'>Capital Ship</option>
                        <option value='structure'>Structure</option>
                        <option value='other'>Other</option>
                    </select>
                </div>
            </div>

            <div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='intermediateReactionCb'>Intermediate Reaction: </label>
                    <input type='checkbox' id='intermediateReactionCb'
                        value={intermediateReaction} 
                        onChange={e => setIntermediateReaction(!intermediateReaction)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='compositeReactionCb'>Composite Reaction: </label>
                    <input type='checkbox' id='compositeReactionCb'
                        value={compositeReaction}
                        onChange={e => setCompositeReaction(!compositeReaction)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='biochemReactionCb'>Biochem Reaction: </label>
                    <input type='checkbox' id='biochemReactionCb'
                        value={biochemReaction}
                        onChange={e => setBiochemReaction(!biochemReaction)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='hybridReactionCb'>Hybrid Reaction: </label>
                    <input type='checkbox' id='hybridReactionCb'
                        value={hybridReaction}
                        onChange={e => setHybridReaction(!hybridReaction)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='advancedComponentsCb'>Advanced Components: </label>
                    <input type='checkbox' id='advancedComponentsCb'
                        value={advancedComponents}
                        onChange={e => setAdvancedComponents(!advancedComponents)}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='capitalComponentsCb'>Capital Components: </label>
                    <input type='checkbox' id='capitalComponentsCb'
                        value={capitalComponents}
                        onChange={e => {setCapitalComponents(!capitalComponents)}}></input>
                </div>
                <div class='industry-label-div-1'>
                    <label class='industry-label-1' for='othersCb'>Others: </label>
                    <input type='checkbox' id='othersCb'
                        value={others}
                        onChange={e => setOthers(!others)}></input>
                </div>
            </div>
            <div style={{display:'flex'}}>
                {intermediateReaction &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Intermediate Reactions</label><br></br>
                    <textarea type='text' value={intermediateReactionInput} onChange={(e) => setIntermediateReactionInput(e.target.value)}></textarea>
                </div>}
                {compositeReaction &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Composite Reactions</label><br></br>
                    <textarea type='text' value={compositeReactionInput} onChange={(e) => setCompositeReactionInput(e.target.value)}></textarea>
                </div>}
                {biochemReaction &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Biochem Reactions</label><br></br>
                    <textarea type='text' value={biochemReactionInput} onChange={(e) => setBiochemReactionInput(e.target.value)}></textarea>
                </div>}
                {hybridReaction &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Hybrid Reactions</label><br></br>
                    <textarea type='text' value={hybridReactionInput} onChange={(e) => setHybridReactionInput(e.target.value)}></textarea>
                </div>}
                {advancedComponents &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Advanced Components</label><br></br>
                    <textarea type='text' value={advancedComponentsInput} onChange={(e) => setAdvancedComponentsInput(e.target.value)}></textarea>
                </div>}
                {capitalComponents &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Capital Components</label><br></br>
                    <textarea type='text' value={capitalComponentsInput} onChange={(e) => setCapitalComponentsInput(e.target.value)}></textarea>
                </div>}
                {others &&
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>Others</label><br></br>
                    <textarea type='text' value={othersInput} onChange={(e) => setOthersInput(e.target.value)}></textarea>
                </div>}
                <div class='industry-label-div-1'>
                    <label class='industry-label-1'>End Product Jobs</label><br></br>
                    <textarea type='text' value={endProductJobsInput} onChange={(e) => setEndProductJobsInput(e.target.value)}></textarea>
                </div>
            </div>
            <div>
                <button onClick={submitJob}>Submit</button>
            </div>
        </div>
    )
}

export default JobsNew;