class TransactionController {
    constructor(model) {
        this.model = model;
    }

    getAll() {
        this.model.getAll((error) => {
            console.error('Error fetching transactions: ', error);
        });
    }

    changeDate(month, year) {
        this.model.changeDate(month, year);
    }
}