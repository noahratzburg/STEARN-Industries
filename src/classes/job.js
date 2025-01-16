class Job {
    constructor(params) {
        this.job = params.job;
        this.jobType = params.jobType;
        this.quantity = params.quantity;
        this.percentComplete = 0.0;
        this.totalSubJobs = params.intermediateReactions.length + params.compositeReactions.length 
                            + params.hybridReactions.length + params.biochemReactions.length 
                            + params.advancedComponents.length + params.capitalComponents.length 
                            + params.others.length + params.endProductJobs.length;
        this.totalSubJobsComplete = 0;
        this.totalProfit = 0;
        this.profitMargin = 0;
        this.totalManufacturingCost = 0;
        this.blueprintEfficiency = params.blueprintEfficiency;
        this.startDate = params.startDate;
        this.intermediateReactions = params.intermediateReactions;
        this.compositeReactions = params.compositeReactions;
        this.hybridReactions = params.hybridReactions;
        this.biochemReactions = params.biochemReactions;
        this.advancedComponents = params.advancedComponents;
        this.capitalComponents = params.capitalComponents;
        this.others = params.others;
        this.endProductJobs = params.endProductJobs;
    }
}

export default Job;