class TransactionController {
    constructor(model) {
        this.model = model;
    }

    getAll() {
        this.model.getAll((error) => {
            console.error('Error fetching transactions: ', error);
        });
    }

    selectTransaction(transactionId) {
        this.model.selectTransaction(transactionId);
    }

    changeDate(month, year) {
        this.model.changeDate(month, year);
    }

    addTransaction(name, amount, date, repeats, repeatsOn) {
        this.model.add(name, amount, date, repeats, repeatsOn,
            () => {
                window.location.href = 'index.html?r=s&a=add';
            },
            (errors) => {
                let errorString = errors.join(',');
                window.location.href = 'index.html?r=e&a=add&c=' + errorString;
            }
        );
    }

    deleteTransaction(transactionId) {
        this.model.remove(transactionId);
    }
}