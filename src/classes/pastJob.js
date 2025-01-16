class PastJob {
    constructor(params) {
        this.job = params.job;
        this.quantity = params.quantity;
        this.totalSalePrice = params.totalSalePrice;
        this.totalMaterialCost = params.totalMaterialCost;
        this.totalManufacturingCost = params.totalManufacturingCost;
        this.salePrice = params.salePrice;
        this.profitMargin = params.profitMargin;
        this.dateStart = params.dateStart;
        this.dateEnd = params.dateEnd;
        this.totalProfit = params.totalProfit;
    }
}

export default PastJob;