class Transaction {
    constructor(id, name, amount, repeats, repeatsOn, date) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.name = name;
        this.repeats = repeats;
        this.repeatsOn = repeatsOn;
        this.startsOn = date;

        if (amount < 0)
            this.type = "expense";
        else
            this.type = "income";
    }

    displayDate() {
        return moment(this.date).format("M-D-YYYY");
    }

    isDateValid() {
        var currentDate = moment();
        var transactionDate = moment(this.date);
        return transactionDate.month() === currentDate.month() && transactionDate >= currentDate;
    }

    json() {
        return {
            Name: this.name,
            Amount: this.amount,
            Repeats: this.repeats,
            RepeatsOn: this.repeatsOn,
            Date: this.startsOn
        };
    }
}

class TransactionModel {
    constructor() {
        this.route = API.URL + 'transactions';
        this.transactions = [];
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => observer.update(this.transactions));
    }

    getAll(errorCallback) {
        $.ajax({
            url: this.route,
            method: 'GET',
            context: this,
            success: function(data) {
                // id, name, amount, repeats, repeatsOn, date
                this.transactions = data.map(function(transactionData) {
                    return new Transaction(
                        transactionData._id,
                        transactionData.Name,
                        transactionData.Amount,
                        transactionData.Repeats,
                        transactionData.RepeatsOn,
                        transactionData.Date
                    );
                });

                this.notifyObservers();                
            },
            error: function(error) {
                console.error('Error fetching transactions: ', error);
                errorCallback(error);
            }
        });
    }
}