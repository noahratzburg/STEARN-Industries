class SubJob {
    constructor(params) {
        this.id = params.id;
        this.job = params.job;
        this.quantity = params.quantity;
        this.subJobType = params.subJobType;
        this.completed = false;
    }
}

export default SubJob;