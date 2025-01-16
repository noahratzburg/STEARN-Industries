// Can add any function to the following function as CapitalizeFirstLetter was built
// Must import StringUtils to use.
import SubJob from "../classes/subJob";
import BPRM from '../data/blueprintReferenceMap.json';

var nextId = 0;

export function CapitalizeFirstLetters(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// TODO - fix the bullshit bug where '0' does not format correctly 
export const ISKValueFormatter = (params) => {
    if (params.value || params.value === 0) return params.value.toLocaleString() + ' ISK';
    return params.value;
}

export const PercentageValueFormatter = (params) => {
    if (params.value && params.value == 1) return '100%'; 
    if (params.value || params.value == 0) return (params.value * 100).toPrecision(2) + '%';
    return params.value;
}

export const DateValueFormatter = (params) => {
    return new Date(Date.parse(params.value));
}

function applyMaterialReductionModifier(subJobs, materialsMap, industryConfiguration) {
    console.log('here');
    // Determine if is Reaction or Manufacturing
    var RIG_BONUS = 0.024;
    var SS_BONUS = 2.1;
    var FACILITY_BONUS = 0.01;
    var BLUEPRINT_BONUS = 0.1;
    // Reactions get Rig Modifier multiplied by K-Space sov level
    // HS - 1.0
    // LS - 1.9
    // JN - 2.1
    subJobs.forEach((subJob) => {
        if (['hyb_react', 'bio_react', 'comp_react'].includes(subJob.subJobType)) {
            materialsMap.get(subJob.id).forEach((m) => {
                m.quantity = Math.ceil(m.quantity * (1 - (RIG_BONUS * 1.1))); 
            });
        } else {
            materialsMap.get(subJob.id).forEach((m) => {
                    if (!subJob.blueprintEfficiency && subJob.blueprintEfficiency != 0) m.quantity = m.quantity * (1 - BLUEPRINT_BONUS);
                    else  m.quantity = m.quantity * (1 - subJob.blueprintEfficiency);
                    m.quantity = m.quantity * (1 - (RIG_BONUS * SS_BONUS));
                    m.quantity = Math.ceil(m.quantity * (1 - (FACILITY_BONUS)));
            });
        }
    });
}

function assignSubJobType(subJobBlueprintName) {
    // Strip Off Reaction Formula / Blueprint
    // var regex = new RegExp('\\b(Reaction|Blueprint|Formula)\\b');
    // var subJobProduct = subJobBlueprintName.replace(regex, '').replace(regex, '').trim();
    if (subJobBlueprintName == null || subJobBlueprintName === "") return;
    // Grab groupID and categoryID
    var groupID = BPRM[subJobBlueprintName].products[0].groupID;
    var categoryID = BPRM[subJobBlueprintName].products[0].categoryID;

    // Assign Sub Job Type credit : Ravworks for following code.
    if([334,964,332].includes(groupID)) return "adv_comp";
    if([913].includes(groupID)) return "cap_adv_comp";
    if([873].includes(groupID)) return "cap_comp";
    if([900,898,902].includes(groupID)) return "adv_large_ship";
    if([540,1972,358,894,832,833,906,963,380,1202,543].includes(groupID) || ([32].includes(categoryID))) return "adv_med_ship";
    if([1534,541,1305,324,830,834,893,1283,831,1527].includes(groupID)) return "adv_small_ship";
    if([27,513,941].includes(groupID)) return "basic_large_ship";
    if([419,1201,26,28,463].includes(groupID)) return "basic_med_ship";
    if([420,25,31].includes(groupID)) return "basic_small_ship";
    if([883,659,547,485,1538,30,4594].includes(groupID)) return "cap_ship";
    if([428,429].includes(groupID)) return "comp_react";
    if([712,4096].includes(groupID)) return "bio_react";
    if([974].includes(groupID)) return "hyb_react";
    if([8].includes(groupID)) return "ammo";
    if([22,18,87].includes(groupID)) return "drones";
    if([649,340,448].includes(groupID) || ([20,22,7].includes(categoryID))) return "equiptment";
    if([1136,536].includes(groupID) || ([66,65,23,40,39].includes(categoryID))) return "structure";
}

// Function takes table output from Ravworks website and converts it into subjobs for future processing
export const RavworksTableStringParser = (str) => {
    if (str == null || str === '') return [];
    var inputArray = str.split('\n');
    inputArray.shift();
    var outputArr = [];
    var id = 1;
    inputArray.forEach((s) => {
        var tmp = s.split('\t');
        var subJobType = assignSubJobType(tmp[0]);
        var subJobCreationParams = {
            id: id,
            job: tmp[0],
            quantity: parseInt(tmp[1]),
            subJobType: subJobType
        }
        var obj = new SubJob(subJobCreationParams);
        id++;
        outputArr.push(obj);
    });
    // Strips last element off if empty, happens in case of extra escape character
    if (outputArr[outputArr.length-1].job === "") outputArr.pop();
    return outputArr;
}

// Prevalidation
export const PopulateSubjobDataValuesOnCompletion = (subJobs, industryConfiguration) => {
    return new Promise((resolve) => {
        console.log('here 2');
        var materialsMap = new Map();
        var productsMap = new Map();
        var typeIds = [];
        subJobs.forEach((subJob) => {
            var materials = structuredClone(BPRM[subJob.job].materials);
            var products = structuredClone(BPRM[subJob.job].products);
            materials.forEach((material) => {
                material.quantity = material.quantity * subJob.quantity;
                if (!typeIds.includes(material.typeID)) typeIds.push(material.typeID); 
            });
            products.forEach((product) => {
                product.quantity = product.quantity * subJob.quantity;
                if (!typeIds.includes(product.typeID)) typeIds.push(product.typeID);
            });
    
            materialsMap.set(subJob.id, materials);
            productsMap.set(subJob.id, products);
        });
        var typeIdsForApiRequest = typeIds.join(',');
        fetch(`https://market.fuzzwork.co.uk/aggregates/?station=60003760&types=${typeIdsForApiRequest}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(subJobs, materialsMap)
                applyMaterialReductionModifier(subJobs, materialsMap, industryConfiguration);
                console.log('here 1');
                
                subJobs.forEach((subJob) => {
                    var iskMaterials = 0;
                    var iskProducts = 0;
                    materialsMap.get(subJob.id).forEach((m) => {
                        iskMaterials = iskMaterials + (m.quantity * data[m.typeID].buy.max);
                    });
                    productsMap.get(subJob.id).forEach((p) => {
                        iskProducts = iskProducts + (p.quantity * data[p.typeID].buy.max);
                    });

                    subJob.completed = true;
                    subJob.daysLeft = 0;
                    subJob.dateStart = new Date();
                    subJob.JBVOutput = iskProducts;
                    subJob.JBVInput = iskMaterials;
                    if (!subJob.blueprintCost || subJob.blueprintCost === null || subJob.blueprintCost === "") subJob.blueprintCost = 0;
                    if (!subJob.manufacturingCost || subJob.manufacturingCost === null || subJob.manufacturingCost === "") subJob.manufacturingCost = 0;
                    subJob.totalProfit = subJob.JBVOutput - (subJob.manufacturingCost + subJob.JBVInput + (subJob.blueprintCost * subJob.quantity))
                    subJob.profitMargin = subJob.totalProfit / (subJob.manufacturingCost + subJob.JBVInput + (subJob.blueprintCost * subJob.quantity))

                    iskMaterials = 0;
                    iskProducts = 0; 
                });
                    
                resolve('Success');
            });
    });
}

export const FixSelectedSubJob = (selectedJob) => {
    var totalManufacturingCost = 0;
    var subJobsCompleted = 0;

    selectedJob.intermediateReactions.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.compositeReactions.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.hybridReactions.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.biochemReactions.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.advancedComponents.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.capitalComponents.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.others.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });
    selectedJob.endProductJobs.forEach((subJob) =>  {
        if(subJob.completed) {
            if(subJob.manufacturingCost) totalManufacturingCost += subJob.manufacturingCost;
            if(subJob.blueprintCost) totalManufacturingCost += subJob.blueprintCost * subJob.quantity;
            subJobsCompleted += 1;
        }
    });

    selectedJob.totalSubJobsComplete = subJobsCompleted;
    selectedJob.totalManufacturingCost  = totalManufacturingCost;
    selectedJob.percentComplete = subJobsCompleted / selectedJob.totalSubJobs;

    fetch(`http://localhost:8000/activeJobs/${selectedJob.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(selectedJob)
    }).then((res) => res.json())
      .then((data) => {
        console.log(data);
    });

}